#!/usr/bin/env node
// Install the refined global OMP agent config and the ufo dispatch delta.
//
// DRY RUN BY DEFAULT. With no flags this script changes nothing: it validates
// host/omp-agent.config.yml through the real ufo-fsd-alpha resolver and mirror
// renderer, validates the 16-32 wave band against the real wave planner, prints
// verdict and the full apply plan, and exits. Pass --apply to install.
//
// --apply writes EXACTLY TWO files and nothing else:
//   1. ~/.omp/agent/config.yml                    (timestamped backup, install)
//   2. <ufo-root>/config/ufo.json                 (timestamped backup, merge)
// It deliberately does NOT regenerate any derived artifact. `npm run
// contracts:sync`, `scripts/render-seat-tables.mjs` and AGENTS.md are never
// invoked and never written, by operator decision: the current committed state
// of ufo-fsd-alpha is the good one and must not accumulate churn. The bundled
// mirrors therefore stay stale after apply, and this script reports that as an
// intentional operator-owned WARNING rather than trying to fix it.
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
//   node host/apply.mjs --apply             # install the config + merge the delta
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
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST_DIR = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATE = path.join(HOST_DIR, "omp-agent.config.yml");
const DELTA_PATH = path.join(HOST_DIR, "ufo-sighting-dispatch.json");
const DEFAULT_UFO_ROOT = "/home/vgpnk/Projects/ufo-fsd-alpha";

// Hard bounds the ufo runtime enforces elsewhere; restated here so the delta is
// refused before it can reach a gate that would only fail at dispatch time.
const MAX_SWARM_LANES = 100;
const EFFORT_SUFFIXES = ["low", "medium", "high", "xhigh", "max"];
// The wave width the operator's directive names: "dispatched in swarms of
// 16-32, up to 100 per round". 16 is the new floor, so a 16-lane spawn wave is
// the narrowest legal one — that is the width the injected post-apply band
// must prove admissible, and the width one below it must show refused.
const WAVE_PROBE_LANES = 16;
// The width the real-CLI leg probes: 32 sits inside BOTH the live band (32-100
// pre-apply) and the post-apply band (16-32) — it is the old floor and the new
// wave ceiling — so the dry run passes before and after the merge lands.
const WAVE_CLI_PROBE_LANES = 32;
// The fourteen seats crates/ufo-core-runtime/build.rs asserts on. A seat
// missing from task.agentModelOverrides fails the resolver; a seat present here
// but absent from the mirror fails the compile gate.
const MIRROR_SEATS = [
  "main", "planner", "distiller", "labrat",
  "scout", "reviewer", "critic", "connector", "sentinel", "executor",
  "mutation-tester", "revenger", "simplifier", "scribe",
];
// Roles the wave planner accepts for a spawn lane (SWARM_ROLES).
const WAVE_ROLES = [
  "scout", "reviewer", "critic", "connector", "sentinel",
  "executor", "mutation-tester", "revenger", "simplifier", "scribe",
];
// Derived artifacts this script intentionally leaves stale. Named in the
// closing notice so the operator inherits an explicit list, not a surprise.
const DEFERRED_ARTIFACTS = [
  "crates/ufo-core-runtime/bundled/omp-seat-routing.json — mirror of the seat table",
  "crates/ufo-core-runtime/bundled/config.json — mirrors sighting.dispatch.maxConcurrentL1",
  "AGENTS.md Routing-authority band mentions (~lines 154-170) still say a 16-100 wave band where the config now enforces 16-32 per wave / 100 per round",
  "AGENTS.md generated seat table between the BEGIN/END GENERATED markers",
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
    "usage: node host/apply.mjs [--apply] [--ufo-root PATH] [--ufo-json PATH] [--install-target PATH]\n"
      + "  (no flags)          dry run: validate the candidate and print the apply plan\n"
      + "  --apply             install the config and merge the dispatch delta (two files only)\n"
      + "  --ufo-root PATH     ufo-fsd-alpha checkout (default /home/vgpnk/Projects/ufo-fsd-alpha)\n"
      + "  --ufo-json PATH     config/ufo.json to merge into (default <ufo-root>/config/ufo.json)\n"
      + "  --install-target P  config install path (default ~/.omp/agent/config.yml)\n",
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

function warn(detail) {
  say(`  WARN ${detail}`);
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
  const parsed = {
    apply: false,
    ufoRoot: process.env.UFO_ROOT || DEFAULT_UFO_ROOT,
    // Overridable so the merge path can be exercised against a throwaway copy
    // of config/ufo.json without pointing --ufo-root away from the scripts this
    // script imports.
    ufoJson: null,
    installTarget: path.join(homedir(), ".omp", "agent", "config.yml"),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") parsed.apply = true;
    else if (arg === "--help" || arg === "-h") usage();
    else if (arg === "--ufo-root" || arg === "--install-target" || arg === "--ufo-json") {
      const value = argv[i + 1];
      if (typeof value !== "string" || value.length === 0) usage(`${arg} requires a value`);
      if (arg === "--ufo-root") parsed.ufoRoot = path.resolve(value);
      else if (arg === "--ufo-json") parsed.ufoJson = path.resolve(value);
      else parsed.installTarget = path.resolve(value);
      i += 1;
    } else usage(`unexpected argument: ${arg}`);
  }
  return parsed;
}

// ── step 1: candidate preflight ────────────────────────────────────────────
// These are the file-level rules omp-global-config.mjs enforces before it will
// parse a single line. Checking them here first means a failure names the real
// cause instead of surfacing as an opaque resolver error.
function preflightCandidate(screen) {
  rule("1/8  candidate preflight");
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
  rule("2/8  resolver gate — omp-global-config.mjs readGlobalSeatRouting");
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
  // The effort variants are pool members no seat pins to; naming them here is
  // what makes the granularity mechanism visible in the dry-run output.
  const variants = [...resolved.modelRoles.keys()].filter((key) => /^(m_strong|m_mid|m_fast)_/.test(key));
  if (variants.length > 0) {
    say("");
    say(`  ${variants.length} effort variant(s) the L1 may select per mission/round/wave:`);
    for (const variant of variants.sort()) {
      const hops = resolved.fallbackChains.get(variant)?.length ?? 0;
      say(`    @${variant.padEnd(14)} ${resolved.modelRoles.get(variant).padEnd(46)} chain ${hops} hop(s)`);
    }
  }
  return { mod, resolved };
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
// derived from the OLD floor so this is not a hard-coded band string.
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
  rule("3/8  dispatch delta — config/ufo.json sighting.dispatch");
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

// ── step 4: the mirror / splitRoute gate ───────────────────────────────────
// renderSeatRoutingMirror is the validation half of `sync-global-routing.mjs
// --check`: it splitRoute-validates every seat primary and every seat chain
// step (grammar, effort whitelist, gemini ban) without writing the mirror.
// The l1Alias is taken from the DELTA, not from the live config/ufo.json, so
// this validates the post-apply state — pre-apply, ufo.json still names an
// alias the candidate deliberately drops.
//
// The mirror only covers the fourteen seats, which leaves the omp roles, the
// effort variants and the pool-member aliases checked by nothing at all — a
// typo in one of those would pass every ufo gate and only surface when an L1
// selected it at dispatch. wholeTableAudit closes that hole by applying the
// same rules to every route in the file.
const GEMINI_MARKERS = ["gemini", "google-ai", "google_ai", "google-gemini", "bard"];

/**
 * Grammar + effort + gemini parity with sync-global-routing.mjs splitRoute.
 * @returns {string | null} the violation, or null when the route is clean
 */
function auditRoute(route, label) {
  if (typeof route !== "string" || !route.includes("/")) {
    return `${label} is not a provider/model route: ${route}`;
  }
  const identity = route.toLowerCase();
  if (!identity.startsWith("google-antigravity/")
    && GEMINI_MARKERS.some((banned) => identity.includes(banned))) {
    return `${label} names a banned gemini-family route: ${route}`;
  }
  const slash = route.indexOf("/");
  const provider = route.slice(0, slash);
  const rest = route.slice(slash + 1);
  if (provider !== provider.trim() || rest !== rest.trim()) {
    return `${label} has a padded route selector: ${route}`;
  }
  const colon = rest.lastIndexOf(":");
  const suffix = colon === -1 ? null : rest.slice(colon + 1);
  if (suffix !== null && !EFFORT_SUFFIXES.includes(suffix)) {
    return `${label} has a non-whitelisted effort suffix (:${EFFORT_SUFFIXES.join("|")}): ${route}`;
  }
  const model = suffix === null ? rest : rest.slice(0, colon);
  if (provider.length === 0 || model.length === 0) {
    return `${label} has an empty provider or model segment: ${route}`;
  }
  if (!/^[A-Za-z0-9_.-]+$/.test(provider)) return `${label} has an invalid provider segment: ${route}`;
  if (!/^[A-Za-z0-9_.-]+$/.test(model)) return `${label} has an invalid model segment: ${route}`;
  return null;
}

function wholeTableAudit(resolved) {
  const problems = [];
  let routes = 0;
  for (const [alias, route] of resolved.modelRoles) {
    routes += 1;
    const problem = auditRoute(route, `modelRoles.${alias}`);
    if (problem !== null) problems.push(problem);
  }
  for (const [key, steps] of resolved.fallbackChains) {
    steps.forEach((step, index) => {
      routes += 1;
      const problem = auditRoute(step, `retry.fallbackChains.${key}[${index}]`);
      if (problem !== null) problems.push(problem);
    });
    // Bare-distinctness over the chain's own primary plus its steps, which is
    // what build.rs validate_chain enforces for seats. The primary is the alias
    // route when the key names an alias, else the concrete-selector key itself.
    const primary = resolved.modelRoles.get(key) ?? (key.includes("/") ? key : null);
    if (primary === null || steps.length === 0) continue;
    const seen = new Map([[bareRoute(primary), "the primary"]]);
    for (const step of steps) {
      const bare = bareRoute(step);
      if (seen.has(bare)) {
        problems.push(`retry.fallbackChains.${key}: ${step} repeats bare model ${bare}, `
          + `already carried by ${seen.get(bare)} — a chain may not wrap its own primary `
          + "or repeat a model at another effort");
        break;
      }
      seen.set(bare, step);
    }
  }
  if (problems.length > 0) {
    say("");
    for (const problem of problems.slice(0, 12)) say(`       ${redact(problem)}`);
    if (problems.length > 12) say(`       …and ${problems.length - 12} more`);
    fail(`whole-table route audit found ${problems.length} violation(s), listed above`);
  }
  ok(`whole-table audit: all ${routes} routes across ${resolved.modelRoles.size} aliases and `
    + `${resolved.fallbackChains.size} chains are splitRoute-legal, and every chain is `
    + "bare-distinct against its own primary — including the aliases no seat pins to");
}

async function mirrorGate(l1Alias, resolved) {
  rule("4/8  route gate — splitRoute over every seat chain, then over the whole table");
  const mod = await import(path.join(opts.ufoRoot, "scripts", "sync-global-routing.mjs"));
  let rendered;
  try {
    rendered = mod.renderSeatRoutingMirror({ path: CANDIDATE, l1Alias });
  } catch (error) {
    fail(`route validation refused the candidate: ${error?.message ?? error}`);
  }
  const mirror = JSON.parse(rendered);
  ok(`every seat primary and every seat chain step splitRoute-clean (effort whitelist `
    + `${EFFORT_SUFFIXES.join("|")}, gemini ban) at l1Alias ${l1Alias}`);
  wholeTableAudit(resolved);
  return { mod, rendered, mirror };
}

// ── step 5: the compile gate's chain rule, replicated ──────────────────────
// build.rs extract_omp_chains pushes the seat primary first, then every
// fallback step, and validate_chain requires the resulting list to be
// non-empty with pairwise-distinct BARE models. Replicated here because the
// real gate is a cargo build this script must not trigger.
function compileGateRule(mirror, l1Alias) {
  rule("5/8  compile gate — build.rs validate_chain + validate_generated_graph (replicated)");
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

// ── step 6: the 16-32 wave-band gate ─────────────────────────────────────────
// The operator's directive is "dispatched in swarms of 16-32, up to 100 per
// round": waveMinLanes 16 makes a 16-lane spawn wave the narrowest legal one,
// waveMaxLanes 32 caps ONE wave, and maxLanes 100 stays the per-L1 member
// ceiling. This proves the band BOTH ways against the REAL planner: once
// through the CLI at 32 lanes — a width inside the live band as it stands and
// inside the post-apply band, so the dry run passes before and after the
// merge — and once through the exported planSwarmWave with the POST-APPLY
// band injected: 16 admitted (floor), 15 refused too_few_lanes, 32 admitted
// (wave ceiling), 33 refused wave_too_wide, 101 refused too_many_lanes — so
// the dry run validates the edges that do not exist on disk yet.
function buildWaveSpec(lanes) {
  const items = [];
  for (let i = 0; i < lanes; i += 1) {
    items.push({
      // TASK_NAME_PATTERN: /^[A-Z][A-Za-z0-9]{1,31}$/
      name: `BandProbeLane${String(i + 1).padStart(3, "0")}`,
      role: WAVE_ROLES[i % WAVE_ROLES.length],
      prompt: `Wave-band probe lane ${i + 1} of ${lanes}. Distinct prompt body `
        + `${i + 1}/${lanes} — this spec is generated by host/apply.mjs to probe the `
        + `16-32 wave band at ${lanes} lanes, and is never dispatched.`,
    });
  }
  return {
    wave: `hostcfg-band-probe-${lanes}`,
    maxLanes: MAX_SWARM_LANES,
    context: `host/apply.mjs verification probe: the wave band must answer `
      + `exactly this many spawn lanes (${lanes}). Generated, never dispatched.`,
    items,
  };
}

function waveGate(delta) {
  rule("6/8  wave gate — ufo-swarm-wave.mjs plan against the 16-32 wave band");
  const script = path.join(opts.ufoRoot, "scripts", "ufo-swarm-wave.mjs");
  if (!existsSync(script)) {
    note("scripts/ufo-swarm-wave.mjs not present under --ufo-root; skipped");
    return null;
  }
  const dir = mkdtempSync(path.join(tmpdir(), "hostcfg-wave-"));
  let livePolicy = null;
  try {
    // The spec lives in the system temp dir, never under --ufo-root: `plan`
    // writes nothing, and this script's footprint there must stay at exactly
    // the one config/ufo.json merge. The width probed is the one that sits
    // inside the live band AND the post-apply band, so this leg passes both
    // before and after the merge.
    const specPath = path.join(dir, `band-${WAVE_CLI_PROBE_LANES}.json`);
    writeFileSync(specPath, `${JSON.stringify(buildWaveSpec(WAVE_CLI_PROBE_LANES), null, 1)}\n`, "utf8");
    const result = spawnSync(
      process.execPath,
      [path.join("scripts", "ufo-swarm-wave.mjs"), "plan", "--spec", specPath],
      { cwd: opts.ufoRoot, encoding: "utf8", env: { ...process.env, UFO_OMP_GLOBAL_CONFIG_PATH: CANDIDATE } },
    );
    if (result.status !== 0) {
      for (const line of (result.stderr ?? "").split("\n").filter(Boolean)) say(`       ${redact(line)}`);
      fail(`ufo-swarm-wave.mjs plan refused the ${WAVE_CLI_PROBE_LANES}-lane spec (exit ${result.status})`);
    }
    let plan;
    try {
      plan = JSON.parse(result.stdout);
    } catch (error) {
      fail(`ufo-swarm-wave.mjs plan emitted unparseable JSON: ${error?.message ?? error}`);
    }
    livePolicy = plan.policy ?? null;
    if (plan.counts?.total !== WAVE_CLI_PROBE_LANES || plan.counts?.spawn !== WAVE_CLI_PROBE_LANES) {
      fail(`plan counted ${JSON.stringify(plan.counts)} for a ${WAVE_CLI_PROBE_LANES}-lane spec`);
    }
    ok(`real CLI: a ${WAVE_CLI_PROBE_LANES}-lane spawn wave plans clean `
      + `(band from config/ufo.json as it stands: ${livePolicy?.waveMinLanes}-${livePolicy?.waveMaxLanes})`);

    // Now the band that only exists after the merge. planSwarmWave takes an
    // injected policy and validates it exactly as the config loader would, so
    // this is the real planner judging the post-apply numbers — both edges
    // plus the member cap.
    const postPolicy = {
      ...(livePolicy ?? {}),
      source: "config",
      maxLanes: delta.swarm.maxLanes,
      waveMinLanes: delta.swarm.waveMinLanes,
      waveMaxLanes: delta.swarm.waveMaxLanes,
    };
    const mod = waveModule;
    if (mod === null) fail("scripts/ufo-swarm-wave.mjs was not preloaded");
    const { waveMinLanes, waveMaxLanes } = delta.swarm;
    const admittedAt = (lanes, label) => {
      let counts = null;
      try {
        counts = mod.planSwarmWave(buildWaveSpec(lanes), { policy: postPolicy }).counts;
      } catch (error) {
        fail(`post-apply band ${waveMinLanes}-${waveMaxLanes} refused a ${lanes}-lane wave `
          + `(${label}) as ${JSON.stringify(error?.code ?? error?.message ?? "unknown")}`);
      }
      if (counts?.total !== lanes) {
        fail(`post-apply band admitted ${JSON.stringify(counts)} for ${lanes} lanes (${label})`);
      }
    };
    const refusedAs = (lanes, expectedCode, label) => {
      let refusal = null;
      try {
        mod.planSwarmWave(buildWaveSpec(lanes), { policy: postPolicy });
      } catch (error) {
        refusal = error?.code ?? error?.message ?? "unknown";
      }
      if (refusal === null) {
        fail(`post-apply band ${waveMinLanes}-${waveMaxLanes} still admits a ${lanes}-lane `
          + `wave (${label}) — that edge does not bite`);
      }
      if (refusal !== expectedCode) {
        fail(`a ${lanes}-lane wave was refused as ${JSON.stringify(refusal)}, `
          + `expected ${expectedCode} (${label})`);
      }
    };
    admittedAt(WAVE_PROBE_LANES, "exactly at the floor");
    ok(`injected post-apply band ${waveMinLanes}-${waveMaxLanes}: `
      + `${WAVE_PROBE_LANES} lanes admitted (exactly at the new floor)`);
    refusedAs(WAVE_PROBE_LANES - 1, "too_few_lanes", "one below the floor");
    ok(`a ${WAVE_PROBE_LANES - 1}-lane wave is refused as too_few_lanes — `
      + "the 16-lane floor bites, not cosmetic");
    admittedAt(waveMaxLanes, "exactly at the wave ceiling");
    ok(`a ${waveMaxLanes}-lane wave is admitted (exactly at the wave ceiling)`);
    refusedAs(waveMaxLanes + 1, "wave_too_wide", "one above the wave ceiling");
    ok(`a ${waveMaxLanes + 1}-lane wave is refused as wave_too_wide — `
      + `one wave carries at most ${waveMaxLanes}`);
    refusedAs(MAX_SWARM_LANES + 1, "too_many_lanes", "one above the member cap");
    ok(`${MAX_SWARM_LANES + 1} lanes are refused as too_many_lanes — `
      + `the ${MAX_SWARM_LANES}-member per-L1 round ceiling holds`);
    return livePolicy;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// planSwarmWave is ESM-only and the wave gate is synchronous, so main() awaits
// the import into this module-level binding before waveGate runs.
let waveModule = null;

// ── step 7: mirror drift, reported never enforced ──────────────────────────
// The bundled mirrors are NOT regenerated by this script, by operator decision.
// So `sync-global-routing.mjs --check` is expected to report drift after apply,
// and that is surfaced as a WARNING the operator owns — never as a failure, and
// never as something this script tries to auto-fix.
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
  return {
    status: result.status,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
  };
}

function mirrorStatusReport(applied) {
  rule(`7/8  bundled-mirror status — sync-global-routing.mjs --check (reported, never enforced)`);
  if (!existsSync(path.join(opts.ufoRoot, "scripts", "sync-global-routing.mjs"))) {
    note("sync-global-routing.mjs not present under --ufo-root; skipped");
    return;
  }
  const { status, stdout, stderr } = runRealCheck();
  for (const line of stdout.split("\n").filter(Boolean)) say(`       ${redact(line)}`);
  for (const line of stderr.split("\n").filter(Boolean)) say(`       ${redact(line)}`);

  const drift = /drifts from the live global OMP config/.test(stderr);
  const staleAlias = /modelRoles has no alias/.test(stderr);
  if (status === 0) {
    ok("the bundled mirror already matches this candidate's resolved table");
    return;
  }
  if (applied) {
    warn("EXPECTED after apply, and intentionally left alone: the bundled mirror is");
    warn("stale because this script does not run contracts:sync. Operator-owned.");
    return;
  }
  if (drift) {
    note("the bundled mirror drifts from the candidate — EXPECTED before apply, and it");
    note("stays drifted after apply by operator decision. Steps 4-5 already validated");
    note("the table the mirror would carry, so the drift is cosmetic, not semantic.");
  } else if (staleAlias) {
    note("config/ufo.json still declares an l1Alias the candidate drops — EXPECTED");
    note("before apply; the dispatch merge repoints it, and steps 4-5 already");
    note("validated the candidate at the post-apply alias.");
  } else {
    // A refusal that is neither drift nor the known pre-apply alias mismatch is
    // still only a report: steps 2-5 are the gates that decide whether the
    // candidate is installable, and this subprocess is a mirror-status probe.
    warn(`--check reported something other than drift: ${redact(stderr || stdout)}`);
    warn("steps 2-5 are the authoritative gates; investigate before applying.");
  }
}

// ── step 8: the plan ───────────────────────────────────────────────────────
function printPlan({ edits, noteRewrites, ufoJsonPath, installTarget, apply }) {
  rule("8/8  apply plan");
  say(`  mode            ${apply ? "APPLY — two files will be written" : "DRY RUN — nothing will be written"}`);
  say("");
  say("  writes EXACTLY two files, and reads everything else:");
  say("");
  say(`  1. ${installTarget}`);
  say(`     from ${CANDIDATE}`);
  if (existsSync(installTarget)) {
    const stat = lstatSync(installTarget);
    say(`     exists, ${stat.size} bytes, mode ${stat.mode.toString(8).slice(-4)}`
      + `${stat.isSymbolicLink() ? " — SYMLINK, apply will refuse" : ""}`);
    say(`     backup: ${installTarget}.${apply ? "<timestamp>" : stamp()}.bak`);
  } else {
    say("     does not exist yet — no backup needed");
  }
  say("");
  say(`  2. ${ufoJsonPath}`);
  say(`     ${readFileSync(ufoJsonPath, "utf8").length} bytes, 1-space indent, surgical per-line`);
  say("     value rewrite — no re-serialization, so unrelated lines never churn");
  say(`     backup: ${ufoJsonPath}.${apply ? "<timestamp>" : stamp()}.bak`);
  say("");
  say("     sighting.dispatch key changes:");
  for (const edit of edits) {
    const at = `sighting.dispatch.${edit.at}`;
    if (edit.change === "unchanged") {
      say(`       = ${at} ${JSON.stringify(edit.after)} (already correct, line untouched)`);
    } else {
      say(`       ${edit.change === "add" ? "+" : ">"} ${at} ${JSON.stringify(edit.before)} -> ${JSON.stringify(edit.after)}`);
    }
  }
  say("");
  say("     swarm.note band wording:");
  if (noteRewrites.length === 0) {
    say("       = no band wording found — nothing to rewrite, note left byte-identical.");
    say("         The live note covers wave batching, resume lanes, taxonomy roles, the");
    say("         m_* alias table and the generated mirror, but never restates the");
    say("         numeric band, so it cannot contradict the new floor. The band");
    say("         mentions that do exist are in AGENTS.md and are deferred below.");
  } else {
    for (const rewrite of noteRewrites) {
      say(`       > ${JSON.stringify(rewrite.from)} -> ${JSON.stringify(rewrite.to)} at byte ${rewrite.index}`);
    }
  }
  say("");
  say("  deliberately NOT touched (minimal-footprint directive):");
  say("    - no npm run contracts:sync, no scripts/render-seat-tables.mjs, no AGENTS.md");
  say("    - nothing else anywhere under " + opts.ufoRoot);
  say("    - the generated probe specs live in the system temp dir and are removed");
}

function printClosingNotice(applied) {
  rule(applied ? "intentionally-left drift — operator-owned" : "what apply will intentionally leave behind");
  say("  This script installs the routing authority and the dispatch delta and stops.");
  say("  The derived artifacts below are left stale ON PURPOSE, per the operator's");
  say("  minimal-footprint directive. Nothing here is a failure; all of it is a");
  say("  decision the operator inherits explicitly:");
  say("");
  for (const artifact of DEFERRED_ARTIFACTS) say(`    - ${artifact}`);
  say("");
  say("  Consequences to expect, so none of them are a surprise:");
  say("    - `npm run contracts:check` and `node scripts/sync-global-routing.mjs --check`");
  say("      will report mirror drift. That is the deferred state, not a regression.");
  say("    - `cargo build -p ufo-core-runtime` compiles against the STALE bundled mirror,");
  say("      so the compiled seat table lags the installed one until the operator");
  say("      regenerates it. The launcher reads the global config directly at dispatch");
  say("      time, so live routing follows the new table immediately.");
  say("    - AGENTS.md documents a 16-100 wave band while the config now enforces");
  say("      16-32 per wave / 100 per round, so a reader of the docs and a reader");
  say("      of the config disagree.");
  say("");
  say("  To close the gap when the operator chooses (this script will not run them):");
  say("    cd " + opts.ufoRoot);
  say("    npm run contracts:sync && npm run contracts:check");
  say("    node scripts/render-seat-tables.mjs --check");
  say("    # then hand-edit the AGENTS.md band mentions listed above");
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
// feeds the dispatcher and a cargo build, so a torn write must never land.
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
    fail(`installed bytes at ${installTarget} differ from the candidate; `
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

const { mirror } = await mirrorGate(l1Alias, resolved);
compileGateRule(mirror, l1Alias);

// Preload the ESM wave module so the synchronous wave gate can use it.
try {
  waveModule = await import(path.join(opts.ufoRoot, "scripts", "ufo-swarm-wave.mjs"));
} catch (error) {
  fail(`scripts/ufo-swarm-wave.mjs could not be loaded from --ufo-root: ${error?.message ?? error}`);
}
waveGate(delta);
mirrorStatusReport(false);

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
  ok("DRY RUN PASSED — the candidate clears the resolver, the route gate, the");
  ok("replicated compile gate and the 16-32 wave-band gate, and the dispatch delta is");
  ok("within every runtime bound. Nothing was written.");
  printClosingNotice(false);
  say("");
  say("  Re-run with --apply to install the two files.");
  process.exit(0);
}

const text = readFileSync(CANDIDATE, "utf8");
installConfig(opts.installTarget, text);
mergeDispatch(ufoJsonPath, rawText, delta, edits, noteRewrites);

// Re-run the two verification gates against the post-apply state: the wave
// planner now reads the merged band from disk, and the mirror probe now reports
// the drift this script intentionally leaves behind.
rule("apply C  re-verify against the post-apply state");
const appliedPolicy = waveGate(delta);
// The CLI reads <ufo-root>/config/ufo.json, which is only the merged file when
// --ufo-json was not redirected. Report what was actually observed rather than
// assuming the two paths coincide.
const observedFloor = appliedPolicy?.waveMinLanes;
if (observedFloor === delta.swarm.waveMinLanes) {
  ok(`the real planner now reads waveMinLanes ${observedFloor} from config/ufo.json and `
    + `still admits the ${WAVE_CLI_PROBE_LANES}-lane CLI probe wave`);
} else {
  note(`the wave CLI read waveMinLanes ${observedFloor}, not the merged ${delta.swarm.waveMinLanes} —`);
  note("--ufo-json points somewhere other than <ufo-root>/config/ufo.json, so the CLI");
  note("validated the unmerged band. The injected-policy checks above are the ones");
  note("that prove the merged band; a real --apply merges the file the CLI reads.");
}
mirrorStatusReport(true);

rule("verdict");
ok("APPLIED. Two files written, both backed up, nothing else touched.");
printClosingNotice(true);
process.exit(0);
