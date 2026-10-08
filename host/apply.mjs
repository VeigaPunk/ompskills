#!/usr/bin/env node
// Install the refined global OMP agent config and the ufo dispatch delta.
//
// DRY RUN BY DEFAULT. With no flags this script changes nothing: it validates
// host/omp-agent.config.yml through the real ufo-fsd-alpha resolver and mirror
// renderer, prints the verdict and the full apply plan, and exits. Pass
// --apply to actually install.
//
// Why the candidate is validated through the real resolver rather than a local
// YAML parse: ~/.omp/agent/config.yml is the routing authority for ufo seat
// delegation, and three independent gates read it with rules stricter than YAML
// (scripts/omp-global-config.mjs, scripts/sync-global-routing.mjs, and
// crates/ufo-core-runtime/build.rs). A file that is valid YAML can still be
// refused by all three. This script runs the first two for real and replicates
// the third's chain rule, so a green dry run means the install will not break
// the compile gate.
//
// No dependencies beyond node builtins and the ufo-fsd-alpha scripts it
// imports. Credential values are never read and never printed: every line of
// captured subprocess output is screened through the repo's own
// containsSensitiveShape before it reaches stdout.
//
// Usage:
//   node host/apply.mjs                     # dry run, changes nothing
//   node host/apply.mjs --apply             # install + merge + regenerate
//   node host/apply.mjs --help
//
// Exit codes: 0 ok, 1 validation or apply failure, 64 usage error.

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST_DIR = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATE = path.join(HOST_DIR, "omp-agent.config.yml");
const DELTA_PATH = path.join(HOST_DIR, "ufo-sighting-dispatch.json");
const DEFAULT_UFO_ROOT = "/home/vgpnk/Projects/ufo-fsd-alpha";
const MIRROR_REL = "crates/ufo-core-runtime/bundled/omp-seat-routing.json";

// Hard bounds the ufo runtime enforces elsewhere; restated here so the delta is
// refused before it can reach a gate that would only fail at dispatch time.
const MAX_SWARM_LANES = 100;
const EFFORT_SUFFIXES = ["low", "medium", "high", "xhigh", "max"];
// The fourteen seats crates/ufo-core-runtime/build.rs asserts on. A seat
// missing from task.agentModelOverrides fails the resolver; a seat present here
// but absent from the mirror fails the compile gate.
const MIRROR_SEATS = [
  "main", "planner", "distiller", "labrat",
  "scout", "reviewer", "critic", "connector", "sentinel", "executor",
  "mutation-tester", "revenger", "simplifier", "scribe",
];

let redact = (text) => text;

/** @returns {never} */
function fail(message) {
  process.stderr.write(`error: ${redact(message)}\n`);
  process.exit(1);
}

/** @returns {never} */
function usage(message) {
  if (message) process.stderr.write(`error: ${message}\n`);
  process.stderr.write(
    "usage: node host/apply.mjs [--apply] [--ufo-root PATH] [--ufo-json PATH] [--install-target PATH] [--skip-post-steps]\n"
      + "  (no flags)          dry run: validate the candidate and print the apply plan\n"
      + "  --apply             install the config and merge the dispatch delta\n"
      + "  --ufo-root PATH     ufo-fsd-alpha checkout (default /home/vgpnk/Projects/ufo-fsd-alpha)\n"
      + "  --ufo-json PATH     config/ufo.json to merge into (default <ufo-root>/config/ufo.json)\n"
      + "  --install-target P  config install path (default ~/.omp/agent/config.yml)\n"
      + "  --skip-post-steps   skip contracts:sync, render-seat-tables and the final --check\n",
  );
  process.exit(message ? 64 : 0);
}

function say(line = "") {
  process.stdout.write(`${line}\n`);
}

function rule(title) {
  say("");
  say(`── ${title} ${"─".repeat(Math.max(0, 66 - title.length))}`);
}

function ok(detail) {
  say(`  ok   ${detail}`);
}

function note(detail) {
  say(`  note ${detail}`);
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

/** Strip `provider/model:effort` down to `provider/model`, as build.rs does. */
function bareRoute(route) {
  const slash = route.indexOf("/");
  if (slash === -1) return route;
  const provider = route.slice(0, slash);
  const rest = route.slice(slash + 1);
  const colon = rest.lastIndexOf(":");
  return `${provider}/${colon === -1 ? rest : rest.slice(0, colon)}`;
}

function parseArgs(argv) {
  const opts = {
    apply: false,
    ufoRoot: process.env.UFO_ROOT || DEFAULT_UFO_ROOT,
    // Overridable so the merge path can be exercised against a throwaway copy
    // of config/ufo.json without pointing --ufo-root away from the scripts this
    // script imports.
    ufoJson: null,
    installTarget: path.join(homedir(), ".omp", "agent", "config.yml"),
    skipPostSteps: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") opts.apply = true;
    else if (arg === "--skip-post-steps") opts.skipPostSteps = true;
    else if (arg === "--help" || arg === "-h") usage();
    else if (arg === "--ufo-root" || arg === "--install-target" || arg === "--ufo-json") {
      const value = argv[i + 1];
      if (typeof value !== "string" || value.length === 0) usage(`${arg} requires a value`);
      if (arg === "--ufo-root") opts.ufoRoot = path.resolve(value);
      else if (arg === "--ufo-json") opts.ufoJson = path.resolve(value);
      else opts.installTarget = path.resolve(value);
      i += 1;
    } else usage(`unexpected argument: ${arg}`);
  }
  return opts;
}

// ── step 1: candidate preflight ────────────────────────────────────────────
// These are the file-level rules omp-global-config.mjs enforces before it will
// parse a single line. Checking them here first means a failure names the real
// cause instead of surfacing as an opaque resolver error.
function preflightCandidate(screen) {
  rule("1/7  candidate preflight");
  const stat = lstatSync(CANDIDATE, { throwIfNoEntry: false });
  if (stat === undefined) fail(`candidate not found: ${CANDIDATE}`);
  if (stat.isSymbolicLink()) {
    fail(`candidate is a symlink, which the resolver refuses outright: ${CANDIDATE}`);
  }
  if (!stat.isFile()) fail(`candidate is not a regular file: ${CANDIDATE}`);
  ok(`regular file, ${stat.size} bytes (limit 1048576)`);
  if (stat.size > 1048576) fail("candidate exceeds the resolver's 1 MiB bound");

  const text = readFileSync(CANDIDATE, "utf8");
  if (text.charCodeAt(0) === 0xfeff) fail("candidate carries a UTF-8 BOM");
  if (/\t/.test(text)) fail("candidate contains a tab; the resolver fails closed on tab indentation");

  // A column-0 line reading exactly `modelRoles:` / `task:` / `retry:` counts
  // as a section header even inside what a human reads as a comment block, so
  // the duplicate scan runs over raw bytes.
  for (const section of ["modelRoles", "task", "retry"]) {
    const pattern = new RegExp(`^(?:${section}|"${section}"|'${section}')\\s*:\\s*$`, "gm");
    const matches = text.match(pattern) ?? [];
    if (matches.length === 0) fail(`candidate declares no top-level ${section}: section`);
    if (matches.length > 1) {
      fail(`candidate declares the top-level ${section}: section ${matches.length} times (ambiguous)`);
    }
  }
  ok("exactly one column-0 modelRoles:, task: and retry: header each");

  // Never write a credential shape into the authority file, comments included.
  const flagged = text.split("\n")
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => screen(line));
  if (flagged.length > 0) {
    fail(`candidate carries a credential shape on ${flagged.length} line(s): `
      + flagged.map(({ number }) => number).join(", "));
  }
  ok("no credential shape anywhere in the file, comments included");
  return text;
}

// ── step 2: the resolver gate ──────────────────────────────────────────────
async function resolverGate() {
  rule("2/7  resolver gate — omp-global-config.mjs readGlobalSeatRouting");
  // The dispatcher, the token-plan probes and the mirror all honor this
  // override; setting it means every code path reached below audits the
  // candidate rather than the installed file.
  process.env.UFO_OMP_GLOBAL_CONFIG_PATH = CANDIDATE;
  const mod = await import(path.join(opts.ufoRoot, "scripts", "omp-global-config.mjs"));
  let resolved;
  try {
    resolved = mod.readGlobalSeatRouting({ path: CANDIDATE });
  } catch (error) {
    fail(`resolver refused the candidate: ${error?.message ?? error}`);
  }
  ok(`parsed clean — ${resolved.modelRoles.size} modelRoles, `
    + `${resolved.fallbackChains.size} fallbackChains, ${resolved.seats.size} seats`);
  ok(`sha256 ${resolved.sha256}`);

  const missing = MIRROR_SEATS.filter((seat) => !resolved.seats.has(seat));
  if (missing.length > 0) fail(`task.agentModelOverrides is missing seat(s): ${missing.join(", ")}`);
  ok(`all ${MIRROR_SEATS.length} ufo seats declared in task.agentModelOverrides`);

  const byBucket = new Map();
  for (const seat of MIRROR_SEATS) {
    const entry = resolved.seats.get(seat);
    const key = entry.via.alias ?? entry.route;
    if (!byBucket.has(key)) byBucket.set(key, []);
    byBucket.get(key).push(seat);
  }
  say("");
  for (const [alias, seats] of [...byBucket].sort()) {
    const entry = resolved.seats.get(seats[0]);
    say(`  ${alias.padEnd(10)} ${entry.route}`);
    say(`  ${"".padEnd(10)} ${seats.length} seat(s): ${seats.join(", ")} — chain ${entry.fallbackChain.length} hop(s)`);
  }
  return { mod, resolved };
}

// ── step 4: the mirror / splitRoute gate ───────────────────────────────────
// renderSeatRoutingMirror is the validation half of `sync-global-routing.mjs
// --check`: it splitRoute-validates every seat primary and every seat chain
// step (grammar, effort whitelist, gemini ban) without writing the mirror.
// The l1Alias is taken from the DELTA, not from the live config/ufo.json, so
// this validates the post-apply state — pre-apply, ufo.json still names an
// alias the candidate deliberately drops.
async function mirrorGate(l1Alias) {
  rule("4/7  route gate — sync-global-routing.mjs splitRoute over every seat chain");
  const mod = await import(path.join(opts.ufoRoot, "scripts", "sync-global-routing.mjs"));
  let rendered;
  try {
    rendered = mod.renderSeatRoutingMirror({ path: CANDIDATE, l1Alias });
  } catch (error) {
    fail(`route validation refused the candidate: ${error?.message ?? error}`);
  }
  const mirror = JSON.parse(rendered);
  ok(`every seat primary and every chain step splitRoute-clean (effort whitelist `
    + `${EFFORT_SUFFIXES.join("|")}, gemini ban) at l1Alias ${l1Alias}`);

  const badEffort = [];
  for (const [seat, row] of Object.entries(mirror.seats)) {
    for (const step of [{ requested: row.requested }, ...row.fallbackChain]) {
      const colon = step.requested.lastIndexOf(":");
      if (colon !== -1 && !EFFORT_SUFFIXES.includes(step.requested.slice(colon + 1))) {
        badEffort.push(`${seat}: ${step.requested}`);
      }
    }
  }
  if (badEffort.length > 0) fail(`non-whitelisted effort suffix: ${badEffort.join(", ")}`);
  ok("no seat chain step carries an illegal effort suffix (:minimal is seat-illegal)");
  return { mod, rendered, mirror };
}

// ── step 5: the compile gate's chain rule, replicated ──────────────────────
// build.rs extract_omp_chains pushes the seat primary first, then every
// fallback step, and validate_chain requires the resulting list to be
// non-empty with pairwise-distinct BARE models. Replicated here because the
// real gate is a cargo build this script must not trigger.
function compileGateRule(mirror, l1Alias) {
  rule("5/7  compile gate — build.rs validate_chain + validate_generated_graph (replicated)");
  const failures = [];
  let totalSteps = 0;
  for (const seat of MIRROR_SEATS) {
    const row = mirror.seats[seat];
    if (row === undefined) {
      failures.push(`${seat}: absent from the mirror`);
      continue;
    }
    const requested = [row.requested, ...row.fallbackChain.map((step) => step.requested)];
    totalSteps += requested.length;
    if (requested.length < 2) {
      failures.push(`${seat}: chain is empty (primary with no fallback step)`);
      continue;
    }
    const bares = requested.map(bareRoute);
    const seen = new Set();
    for (const bare of bares) {
      if (seen.has(bare)) {
        failures.push(`${seat}: duplicates or wraps bare model ${bare}`);
        break;
      }
      seen.add(bare);
    }
  }
  if (failures.length > 0) fail(failures.join("; "));
  ok(`all ${MIRROR_SEATS.length} seat chains non-empty, ${totalSteps} primary+hop routes, `
    + "pairwise-distinct bare models — no chain wraps its own primary");

  if (mirror.seats.main.alias !== l1Alias) {
    fail(`seats.main.alias ${JSON.stringify(mirror.seats.main.alias)} must equal `
      + `sighting.dispatch.missionFormat.l1Alias ${JSON.stringify(l1Alias)}`);
  }
  ok(`seats.main.alias === l1Alias === ${JSON.stringify(l1Alias)}`);
  return mirror;
}

// ── step 6: the real --check subprocess ────────────────────────────────────
function runRealCheck() {
  const result = spawnSync(
    process.execPath,
    [path.join("scripts", "sync-global-routing.mjs"), "--check"],
    {
      cwd: opts.ufoRoot,
      encoding: "utf8",
      env: { ...process.env, UFO_OMP_GLOBAL_CONFIG_PATH: CANDIDATE },
    },
  );
  const stdout = (result.stdout ?? "").trim();
  const stderr = (result.stderr ?? "").trim();
  return { status: result.status, stdout, stderr };
}

function checkGate(expectInSync) {
  rule("6/7  sync-global-routing.mjs --check (real subprocess, candidate via env override)");
  if (!existsSync(path.join(opts.ufoRoot, "scripts", "sync-global-routing.mjs"))) {
    note("sync-global-routing.mjs not present under --ufo-root; skipped");
    return;
  }
  const { status, stdout, stderr } = runRealCheck();
  for (const line of stdout.split("\n").filter(Boolean)) say(`       ${redact(line)}`);
  for (const line of stderr.split("\n").filter(Boolean)) say(`       ${redact(line)}`);

  if (status === 0) {
    ok("the bundled mirror is byte-identical to the candidate's resolved table");
    return;
  }
  if (status === 64) fail(`sync-global-routing.mjs usage error: ${stderr || stdout}`);
  if (status !== 1) fail(`sync-global-routing.mjs exited ${status}`);

  const drift = /drifts from the live global OMP config/.test(stderr);
  const staleAlias = /modelRoles has no alias/.test(stderr);
  if (expectInSync) {
    fail(`sync-global-routing.mjs --check still fails after apply: ${stderr || stdout}`);
  }
  if (drift) {
    note(`${MIRROR_REL} drifts from the candidate — EXPECTED before apply; `
      + "`npm run contracts:sync` regenerates it");
  } else if (staleAlias) {
    note("config/ufo.json still declares an l1Alias the candidate drops — EXPECTED "
      + "before apply; the dispatch merge below repoints it, and steps 3-4 already "
      + "validated the candidate at the post-apply alias");
  } else {
    fail(`sync-global-routing.mjs --check refused the candidate: ${stderr || stdout}`);
  }
}

// ── step 3: the dispatch delta ─────────────────────────────────────────────
function positiveInt(value, label) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    fail(`${label} must be a positive safe integer, got ${JSON.stringify(value)}`);
  }
}

// ufo.json is 1-space-indented and carries \u2014 escapes that JSON.stringify
// would emit as literal UTF-8, so re-serializing the file would churn six
// unrelated lines. The merge is therefore a surgical per-line value rewrite,
// asserting each key is unique file-wide and that the result re-parses to
// exactly the expected object. Anything unexpected fails closed instead of
// reformatting someone else's config.
function planDispatchEdits(rawText, current, delta) {
  const edits = [];
  const walk = (fragment, prefix, target) => {
    for (const [key, value] of Object.entries(fragment)) {
      const at = prefix.length === 0 ? key : `${prefix}.${key}`;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        walk(value, at, target);
        continue;
      }
      const before = at.split(".").reduce((acc, part) => acc?.[part], target);
      if (before === value) {
        edits.push({ at, before, after: value, change: "unchanged" });
        continue;
      }
      const pattern = new RegExp(`^([ \\t]*)"${key}"[ \\t]*:[ \\t]*([^,\\n]*?)(,?)[ \\t]*$`, "gm");
      const matches = [...rawText.matchAll(pattern)];
      if (matches.length !== 1) {
        fail(`sighting.dispatch.${at}: expected exactly 1 line matching "${key}" in `
          + `config/ufo.json, found ${matches.length} — refusing to guess`);
      }
      const literal = typeof value === "string" ? JSON.stringify(value) : String(value);
      edits.push({
        at,
        before,
        after: value,
        change: before === undefined ? "add" : "set",
        match: matches[0],
        literal,
      });
    }
  };
  walk(delta, "", current);
  return edits;
}

function applyDispatchEdits(rawText, edits) {
  let out = rawText;
  for (const edit of edits) {
    if (edit.change === "unchanged") continue;
    const [, indent, , comma] = edit.match;
    const line = `${indent}"${edit.at.split(".").pop()}": ${edit.literal}${comma}`;
    out = out.replace(edit.match[0], line);
  }
  return out;
}

// The wave band is restated in prose in sighting.dispatch.swarm.note. Rewriting
// it keeps the note from contradicting the numbers beside it; the spelling is
// derived from the OLD floor so this is not a hard-coded "16-100" string.
function planNoteRewrite(rawText, oldMin, newMin, ceiling) {
  const separators = ["-", "–", "—", " to ", "..", "…"];
  const found = [];
  for (const sep of separators) {
    const from = `${oldMin}${sep}${ceiling}`;
    const to = `${newMin}${sep}${ceiling}`;
    let index = rawText.indexOf(from);
    while (index !== -1) {
      found.push({ from, to, index });
      index = rawText.indexOf(from, index + from.length);
    }
  }
  return found;
}

function dispatchGate() {
  rule("3/7  dispatch delta — config/ufo.json sighting.dispatch");
  if (!existsSync(DELTA_PATH)) fail(`dispatch delta not found: ${DELTA_PATH}`);
  let delta;
  try {
    delta = JSON.parse(readFileSync(DELTA_PATH, "utf8"));
  } catch (error) {
    fail(`dispatch delta is not valid JSON: ${error?.message ?? error}`);
  }

  const ufoJsonPath = opts.ufoJson ?? path.join(opts.ufoRoot, "config", "ufo.json");
  if (!existsSync(ufoJsonPath)) fail(`config/ufo.json not found: ${ufoJsonPath}`);
  const rawText = readFileSync(ufoJsonPath, "utf8");
  let current;
  try {
    current = JSON.parse(rawText);
  } catch (error) {
    fail(`config/ufo.json is not valid JSON: ${error?.message ?? error}`);
  }
  const dispatch = current?.sighting?.dispatch;
  if (dispatch === undefined || typeof dispatch !== "object") {
    fail("config/ufo.json has no sighting.dispatch object");
  }

  // Semantic bounds the runtime enforces at dispatch time; refusing here is
  // cheaper than a policyFail mid-wave.
  positiveInt(delta.maxConcurrentL1, "sighting.dispatch.maxConcurrentL1");
  const swarm = delta.swarm ?? {};
  positiveInt(swarm.waveMinLanes, "sighting.dispatch.swarm.waveMinLanes");
  positiveInt(swarm.waveMaxLanes, "sighting.dispatch.swarm.waveMaxLanes");
  positiveInt(swarm.maxLanes, "sighting.dispatch.swarm.maxLanes");
  if (swarm.waveMaxLanes < swarm.waveMinLanes) {
    fail(`swarm.waveMaxLanes ${swarm.waveMaxLanes} < waveMinLanes ${swarm.waveMinLanes} — `
      + "the runtime refuses an inverted band with policyFail");
  }
  if (swarm.waveMaxLanes > MAX_SWARM_LANES || swarm.maxLanes > MAX_SWARM_LANES) {
    fail(`swarm lane bounds exceed MAX_SWARM_LANES ${MAX_SWARM_LANES}`);
  }
  ok(`band inverts cleanly: waveMinLanes ${swarm.waveMinLanes} <= waveMaxLanes ${swarm.waveMaxLanes} `
    + `<= MAX_SWARM_LANES ${MAX_SWARM_LANES}; maxLanes ${swarm.maxLanes}`);

  const l1Alias = delta?.missionFormat?.l1Alias;
  if (typeof l1Alias !== "string" || l1Alias.length === 0 || l1Alias.startsWith("@")) {
    fail("sighting.dispatch.missionFormat.l1Alias must be a bare nonempty alias");
  }
  ok(`l1Alias ${JSON.stringify(l1Alias)} is bare and nonempty`);
  return { delta, ufoJsonPath, rawText, dispatch, l1Alias };
}

// ── step 7: the plan ───────────────────────────────────────────────────────
function printPlan({ edits, noteRewrites, ufoJsonPath, installTarget, apply }) {
  rule("7/7  apply plan");
  say(`  mode            ${apply ? "APPLY — files will be written" : "DRY RUN — nothing will be written"}`);
  say("");
  say("  candidate       " + CANDIDATE);
  say("  install target  " + installTarget);
  if (existsSync(installTarget)) {
    const stat = lstatSync(installTarget);
    say(`                  exists, ${stat.size} bytes, mode ${stat.mode.toString(8).slice(-4)}`
      + `${stat.isSymbolicLink() ? " — SYMLINK, apply will refuse" : ""}`);
    say(`  backup          ${installTarget}.${apply ? "<timestamp>" : stamp()}.bak`);
  } else {
    say("                  does not exist yet — no backup needed");
  }
  say("");
  say("  merge target    " + ufoJsonPath);
  say(`                  ${readFileSync(ufoJsonPath, "utf8").length} bytes, 1-space indent, `
    + "surgical per-line value rewrite (no re-serialization)");
  say(`  backup          ${ufoJsonPath}.${apply ? "<timestamp>" : stamp()}.bak`);
  say("");
  say("  sighting.dispatch key changes:");
  for (const edit of edits) {
    const at = `sighting.dispatch.${edit.at}`;
    if (edit.change === "unchanged") {
      say(`    = ${at} ${JSON.stringify(edit.after)} (already correct, line untouched)`);
    } else {
      say(`    ${edit.change === "add" ? "+" : ">"} ${at} ${JSON.stringify(edit.before)} -> ${JSON.stringify(edit.after)}`);
    }
  }
  say("");
  if (noteRewrites.length === 0) {
    say("  swarm.note band wording:");
    say("    = no band wording found in sighting.dispatch.swarm.note — nothing to rewrite.");
    say("      The live note describes routing and lane taxonomy but never restates the");
    say("      numeric wave band, so it does not contradict the new floor and is left");
    say("      byte-identical. (M1 survey 4/4 reported a 16-100 mention here; the");
    say("      current note carries none. The four hard-coded band mentions that do");
    say("      exist are in AGENTS.md and are listed as manual steps below.)");
  } else {
    say("  swarm.note band wording:");
    for (const rewrite of noteRewrites) {
      say(`    > ${JSON.stringify(rewrite.from)} -> ${JSON.stringify(rewrite.to)} at byte ${rewrite.index}`);
    }
  }
  say("");
  say("  post-apply steps" + (apply ? "" : " (not run in dry run)") + ":");
  say("    1. npm run contracts:sync            # in " + opts.ufoRoot);
  say("       regenerates " + MIRROR_REL + " from the installed config");
  say("       and re-renders the generated seat table in AGENTS.md");
  say("    2. node scripts/render-seat-tables.mjs   # explicit re-run, idempotent");
  say("    3. node scripts/sync-global-routing.mjs --check   # must exit 0");
  say("");
  say("  remaining MANUAL steps (this script never touches AGENTS.md):");
  say("    - AGENTS.md ~line 154: the WAVE band is documented as (repo: 16-100) -> 32-100");
  say("    - AGENTS.md ~line 162: \"one wave of N when 16 <= N <= 100\" -> 32 <= N <= 100");
  say("    - AGENTS.md ~line 166: \"the 16-100 wave band\" -> the 32-100 wave band");
  say("    - AGENTS.md ~line 146: the example fleet-spec L1 aliases m_swe (devin/swe-2:max)");
  say("      and m_kimi_devin_high name routes that do not exist; m_kimi_devin_high is");
  say("      dropped by this config entirely and m_swe is now devin/swe-1-6 with no effort");
  say("    - AGENTS.md ~line 205 restates sighting.dispatch.maxConcurrentL1 (32 -> 16)");
  say("    - the generated seat table between the BEGIN/END GENERATED markers in AGENTS.md");
  say("      is regenerated by contracts:sync, not hand-edited");
  say("");
  say("  semantics the operator should expect after apply:");
  say("    - maxConcurrentL1 16: at most 16 concurrent L1 orchestrators");
  say("    - waveMinLanes 32: a spawn-bearing wave narrower than 32 lanes is now");
  say("      refused with too_few_lanes. Resume-only waves stay exempt from the floor.");
  say("    - task.maxConcurrency 32 and nativeProfiles.omp-native-v1.concurrencyCeiling 32");
  say("      are unrelated to maxConcurrentL1 and deliberately unchanged — three");
  say("      coincidental 32s, documented in the config header.");
}

// ── apply ──────────────────────────────────────────────────────────────────
function backupFile(target, tag) {
  const destination = `${target}.${tag}.bak`;
  if (existsSync(destination)) fail(`backup path already exists, refusing to clobber: ${destination}`);
  copyFileSync(target, destination);
  const mode = statSync(target).mode & 0o777;
  chmodSync(destination, mode);
  return destination;
}

// Atomic write twin of the repo's own writeAtomicFile: the installed config
// feeds a cargo build and the dispatcher, so a torn write must never land.
function writeAtomic(target, contents, mode) {
  mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  try {
    writeFileSync(temporary, contents, { encoding: "utf8", flag: "wx" });
    chmodSync(temporary, mode);
    renameSync(temporary, target);
  } finally {
    if (existsSync(temporary)) rmSync(temporary, { force: true });
  }
}

function installConfig(installTarget, text) {
  rule("apply A  install the global OMP config");
  const existing = lstatSync(installTarget, { throwIfNoEntry: false });
  if (existing !== undefined && existing.isSymbolicLink()) {
    fail(`${installTarget} is a symlink; the resolver refuses a symlinked authority `
      + "path, so resolve it by hand before applying");
  }
  const mode = existing !== undefined ? existing.mode & 0o777 : 0o600;
  let backup = null;
  if (existing !== undefined) {
    backup = backupFile(installTarget, stamp());
    ok(`backed up ${existing.size} bytes -> ${backup}`);
  } else {
    note("no existing config; nothing to back up");
  }
  writeAtomic(installTarget, text, mode);
  const installed = statSync(installTarget);
  ok(`installed ${installed.size} bytes to ${installTarget} (mode ${mode.toString(8)})`);
  // Verify as installed, not as staged: read the bytes back from the authority
  // path and require them to equal the candidate exactly.
  const readBack = readFileSync(installTarget, "utf8");
  if (readBack !== text) {
    fail(`installed bytes at ${installTarget} differ from the candidate; restoring nothing, `
      + `backup is at ${backup ?? "(none)"}`);
  }
  ok("read-back verification: installed bytes are identical to the candidate");
  return backup;
}

function mergeDispatch(ufoJsonPath, rawText, delta, edits, noteRewrites) {
  rule("apply B  merge the dispatch delta into config/ufo.json");
  const before = JSON.parse(rawText);
  let text = applyDispatchEdits(rawText, edits);
  let rewritten = 0;
  for (const rewrite of noteRewrites) {
    text = text.split(rewrite.from).join(rewrite.to);
    rewritten += 1;
  }
  let after;
  try {
    after = JSON.parse(text);
  } catch (error) {
    fail(`the surgical merge produced invalid JSON, refusing to write: ${error?.message ?? error}`);
  }

  // The rewritten file must equal the original with exactly the delta applied,
  // and nothing else: any other difference means a line matched that should not
  // have, and the merge is aborted rather than written.
  const expected = structuredClone(before);
  const merge = (target, fragment) => {
    for (const [key, value] of Object.entries(fragment)) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        target[key] = target[key] ?? {};
        merge(target[key], value);
      } else target[key] = value;
    }
  };
  merge(expected.sighting.dispatch, delta);
  if (noteRewrites.length > 0) {
    for (const rewrite of noteRewrites) {
      expected.sighting.dispatch.swarm.note = expected.sighting.dispatch.swarm.note
        .split(rewrite.from).join(rewrite.to);
    }
  }
  if (JSON.stringify(after) !== JSON.stringify(expected)) {
    fail("the surgical merge changed something outside sighting.dispatch; refusing to write");
  }
  const changedLines = rawText.split("\n").filter((line, i) => line !== text.split("\n")[i]).length;
  ok(`merge is byte-surgical: ${changedLines} line(s) differ, ${rewritten} note rewrite(s), `
    + "everything else identical");

  const backup = backupFile(ufoJsonPath, stamp());
  ok(`backed up -> ${backup}`);
  writeAtomic(ufoJsonPath, text, statSync(backup).mode & 0o777);
  ok(`wrote ${text.length} bytes to ${ufoJsonPath}`);
  return backup;
}

function runPostSteps() {
  rule("apply C  regenerate the derived contracts");
  const steps = [
    ["npm", ["run", "contracts:sync"]],
    [process.execPath, [path.join("scripts", "render-seat-tables.mjs")]],
  ];
  for (const [command, args] of steps) {
    say(`  $ ${command} ${args.join(" ")}`);
    const result = spawnSync(command, args, { cwd: opts.ufoRoot, encoding: "utf8" });
    for (const line of (result.stdout ?? "").split("\n").filter(Boolean)) {
      say(`    ${redact(line)}`);
    }
    for (const line of (result.stderr ?? "").split("\n").filter(Boolean)) {
      say(`    ${redact(line)}`);
    }
    if (result.status !== 0) {
      fail(`${command} ${args.join(" ")} exited ${result.status}`);
    }
    ok("exit 0");
  }
}

// ── main ───────────────────────────────────────────────────────────────────
const opts = parseArgs(process.argv.slice(2));

say(`omp host config apply — ${opts.apply ? "APPLY" : "DRY RUN"}`);
say(`candidate   ${CANDIDATE}`);
say(`ufo root    ${opts.ufoRoot}`);
say(`install to  ${opts.installTarget}`);

if (!existsSync(opts.ufoRoot)) fail(`--ufo-root does not exist: ${opts.ufoRoot}`);
if (!existsSync(path.join(opts.ufoRoot, "scripts", "omp-global-config.mjs"))) {
  fail(`scripts/omp-global-config.mjs not found under --ufo-root: ${opts.ufoRoot}`);
}

// Import the repo's own screen so this script redacts exactly what the repo
// redacts. Loaded first: every later message passes through it.
let sensitiveShape;
try {
  const screen = await import(path.join(opts.ufoRoot, "scripts", "ufo-credential-screen.mjs"));
  sensitiveShape = screen.containsSensitiveShape;
  redact = (text) => (sensitiveShape(text) ? "<redacted>" : String(text));
} catch (error) {
  fail(`scripts/ufo-credential-screen.mjs could not be loaded from --ufo-root: ${error?.message ?? error}`);
}

preflightCandidate(sensitiveShape);
const { resolved } = await resolverGate();
const { l1Alias, delta, dispatch, ufoJsonPath, rawText } = dispatchGate();

// The l1Alias must exist in the candidate, and main must resolve through it —
// checked here because build.rs checks it at compile time and the failure
// message there is easy to misread as a mirror problem.
if (!resolved.modelRoles.has(l1Alias)) {
  fail(`missionFormat.l1Alias ${JSON.stringify(l1Alias)} is not a modelRoles alias in the candidate`);
}
if (resolved.seats.get("main").via.alias !== l1Alias) {
  fail(`task.agentModelOverrides.main resolves @${resolved.seats.get("main").via.alias} but `
    + `missionFormat.l1Alias is ${JSON.stringify(l1Alias)}; build.rs requires them equal`);
}

const { mirror } = await mirrorGate(l1Alias);
compileGateRule(mirror, l1Alias);
checkGate(false);

const edits = planDispatchEdits(rawText, dispatch, delta);
const noteRewrites = planNoteRewrite(
  rawText,
  dispatch.swarm?.waveMinLanes,
  delta.swarm.waveMinLanes,
  delta.swarm.waveMaxLanes,
);
printPlan({ edits, noteRewrites, ufoJsonPath, installTarget: opts.installTarget, apply: opts.apply });

if (!opts.apply) {
  rule("verdict");
  ok("DRY RUN PASSED — the candidate clears the resolver, the route gate and the");
  ok("replicated compile gate, and the dispatch delta is within every runtime bound.");
  say("  Re-run with --apply to install. Nothing was written.");
  process.exit(0);
}

const text = readFileSync(CANDIDATE, "utf8");
installConfig(opts.installTarget, text);
mergeDispatch(ufoJsonPath, rawText, delta, edits, noteRewrites);

if (opts.skipPostSteps) {
  note("--skip-post-steps: contracts:sync, render-seat-tables and the final --check skipped");
} else {
  runPostSteps();
  checkGate(true);
}

rule("verdict");
ok("APPLIED. Remaining work is the manual AGENTS.md band/alias edit listed in step 7/7");
ok("— this script deliberately does not touch AGENTS.md.");
process.exit(0);
