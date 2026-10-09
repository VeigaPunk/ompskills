#!/usr/bin/env node
/**
 * tower-fleet.test — hermetic checks for sighting/tower-fleet.mjs.
 *
 * Every invocation runs against a temp fixture: the real substrate's
 * config/ufo.json is COPIED into a temp ufoRoot so band numbers come from a
 * fixture authority, and the spec's repo/stateDir/worktreeRoot live under
 * os.tmpdir(). No check opens the real wall, touches tmux, or writes into
 * either checkout.
 *
 * Covered:
 *   1. plan --json on a valid 2-mission spec: exit 0; branch/worktree/prompt
 *      paths; rendered prompts carry the band numbers read from the fixture;
 *      the launch argv is the wall verb + an interactive omp argv with
 *      --fleet, --cwd, and --model @<l1Alias>.
 *   2. plan writes nothing: a recursive name/size/mtime snapshot of every
 *      fixture root is byte-identical after plan (--json, human, bare, refused)
 *      and after status (which, alone, shells out to a stub wall CLI).
 *   3. default verb is plan.
 *   4. L1 ceiling: exactly maxConcurrentL1 missions accepted, one more refused
 *      with L1_CEILING_EXCEEDED and a message that tracks the live config.
 *   5. scope overlap taxonomy: identical, nested (both argument orders), and
 *      late-entry overlaps refused with SCOPE_OVERLAP; component-disjoint
 *      siblings (src/core vs src/correction, src/a vs src/ab, src/a/b vs
 *      src/a-b) accepted; normalization (./src, src/, "  src  ") and the
 *      per-entry refusal forms pinned.
 *   6. identity: fleet-name and mission-id patterns at their boundaries,
 *      trim-based duplicate detection, and the required title/axis/goal fields.
 *   7. launch/close without --apply refused (MUTATION_REQUIRES_APPLY) before any
 *      spec read or wall call; usage verdicts still outrank the guard.
 *   8. usage errors (exit 64, typed USAGE + plain usage line) and --help (exit 0
 *      on stdout, silent stderr).
 *   9. skills, maxTime, and roundCeiling: acceptance alphabet, defaults, and
 *      exact refusal messages.
 *  10. spec shape: unreadable/malformed/directory specs, non-object JSON, and
 *      missing repo/ufoRoot.
 *  11. band authority fail-closed: missing/broken config, missing or invalid
 *      band keys, patched-config live reads, and the pane ceiling
 *      (PANE_CEILING_EXCEEDED) plus the L1-before-pane gate order.
 *  12. render fidelity: every placeholder bound on its own template line, the
 *      template ledger, band numbers from a patched authority, and unescaped
 *      goal text.
 *  13. launch argv: wall half token-by-token (one token per value) and the omp
 *      half's exact list, derivation, and interactive-only guarantee.
 *  14. wall isolation: shell-outs resolve through the spec's ufoRoot, never the
 *      real substrate.
 *
 * Exit codes: 0 every check passed · 1 a check failed · 64 usage.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TEST_DIR, "..");
const LAUNCHER = path.join(REPO_ROOT, "sighting", "tower-fleet.mjs");
const SUBSTRATE = process.env.UFO_FSD_ROOT || "/home/vgpnk/Projects/ufo-fsd-alpha";
const REAL_CONFIG = path.join(SUBSTRATE, "config", "ufo.json");

// ── console + result plumbing (same plain-script style as run-wave-test) ────
let failures = 0;
function say(message) {
  process.stdout.write(message + "\n");
}
function ok(id, detail) {
  say(`  ok   ${id}${detail ? ` — ${detail}` : ""}`);
}
function bad(id, detail) {
  failures += 1;
  say(`  FAIL ${id}: ${detail}`);
}
function check(id, condition, detail) {
  if (condition) ok(id, detail);
  else bad(id, detail);
  return Boolean(condition);
}
function gate(id, message) {
  say(`  GATE ${id}: ${message}`);
  failures += 1;
  say(`FAILURES ${failures}`);
  process.exit(1);
}
function finish(code) {
  try {
    rmSync(ROOT, { recursive: true, force: true });
  } catch { /* temp cleanup is best-effort */ }
  process.exit(code);
}

if (!existsSync(REAL_CONFIG)) gate("fixture", `substrate config not found at ${REAL_CONFIG} (set UFO_FSD_ROOT)`);

// ── fixture: temp ufoRoot with the real config/ufo.json copied in ──────────
const ROOT = mkdtempSync(path.join(tmpdir(), "tower-fleet-test-"));
const UFO_ROOT = path.join(ROOT, "ufoRoot");
mkdirSync(path.join(UFO_ROOT, "config"), { recursive: true });
copyFileSync(REAL_CONFIG, path.join(UFO_ROOT, "config", "ufo.json"));
mkdirSync(path.join(UFO_ROOT, "scripts"), { recursive: true }); // path source only; never executed here
const REPO = path.join(ROOT, "repo");
mkdirSync(REPO, { recursive: true });
const STATE_DIR = path.join(ROOT, "state");
const TREES_DIR = path.join(ROOT, "trees");

const cfg = JSON.parse(readFileSync(path.join(UFO_ROOT, "config", "ufo.json"), "utf8"));
const BAND = {
  maxConcurrentL1: cfg.sighting.dispatch.maxConcurrentL1,
  windowPaneCeiling: cfg.sighting.windowPaneCeiling,
  waveMin: cfg.sighting.dispatch.swarm.waveMinLanes,
  waveMax: cfg.sighting.dispatch.swarm.waveMaxLanes,
  maxLanes: cfg.sighting.dispatch.swarm.maxLanes,
  l1Alias: cfg.sighting.dispatch.missionFormat.l1Alias,
};

function baseSpec(overrides = {}) {
  return {
    fleet: "tftest",
    repo: REPO,
    base: "feat/test-base", // explicit: no git needed for the base default path
    ufoRoot: UFO_ROOT,
    stateDir: STATE_DIR,
    worktreeRoot: TREES_DIR,
    roundCeiling: 2,
    maxTime: "90m",
    missions: [
      {
        id: "tf-alpha",
        title: "Alpha axis",
        axis: "launcher-robustness",
        goal: "Prove the launcher gates.",
        scope: ["sighting/tower-fleet.mjs"],
        skills: ["tower"],
      },
      {
        id: "tf-beta",
        title: "Beta axis",
        axis: "docs-clarity",
        goal: "Prove the docs land.",
        scope: [".omp/skills/tower"],
        skills: [],
      },
    ],
    ...overrides,
  };
}

let specCounter = 0;
function writeSpec(spec) {
  specCounter += 1;
  const specPath = path.join(ROOT, `spec-${specCounter}.json`);
  writeFileSync(specPath, JSON.stringify(spec, null, 2));
  return specPath;
}

function launcher(args) {
  return spawnSync(process.execPath, [LAUNCHER, ...args], { encoding: "utf8" });
}

function typedError(result) {
  try {
    return JSON.parse(result.stderr.trim().split("\n").pop());
  } catch {
    return null;
  }
}

function expectTyped(id, result, code) {
  if (!check(`${id} exit 2`, result.status === 2, `got ${result.status}; stderr ${JSON.stringify(result.stderr.slice(0, 200))}`)) return;
  const payload = typedError(result);
  if (!check(`${id} typed payload`, payload && payload.ok === false && typeof payload.message === "string", `stderr was ${JSON.stringify(result.stderr.slice(0, 200))}`)) return;
  check(`${id} code ${code}`, payload.code === code, `got ${payload.code}: ${payload.message}`);
}

// ── fixture helpers (all temp-rooted; the real substrate stays read-only) ───

/** Fresh temp ufoRoot carrying a copy of the real config, optionally patched. */
function configRoot(mutate) {
  const root = mkdtempSync(path.join(tmpdir(), "tower-fleet-cfg-"));
  const ufoRoot = path.join(root, "ufoRoot");
  mkdirSync(path.join(ufoRoot, "config"), { recursive: true });
  mkdirSync(path.join(ufoRoot, "scripts"), { recursive: true });
  const parsed = JSON.parse(readFileSync(REAL_CONFIG, "utf8"));
  if (mutate) mutate(parsed);
  writeFileSync(path.join(ufoRoot, "config", "ufo.json"), JSON.stringify(parsed, null, 2));
  return ufoRoot;
}

/** Plant a stub `scripts/ufo-sighting` that logs its argv and prints JSON. */
function stubWall(ufoRoot, logPath) {
  writeFileSync(
    path.join(ufoRoot, "scripts", "ufo-sighting"),
    "#!/usr/bin/env bash\n"
      + `printf '%s\\n' "$*" >> ${JSON.stringify(logPath)}\n`
      + `printf '%s\\n' '{"status":"present","missions":[]}'\n`,
  );
  return logPath;
}

/** baseSpec bound to another ufoRoot (patched-config or stub-wall fixtures). */
function specAt(ufoRoot, overrides = {}) {
  return baseSpec({ ufoRoot, ...overrides });
}

/** `count` missions with pairwise-disjoint scopes, ids `<prefix><n>`. */
function missionsOf(count, prefix = "m") {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    title: `Mission ${i + 1}`,
    axis: `axis-${i + 1}`,
    goal: `goal ${i + 1}`,
    scope: [`src/${prefix}-${i + 1}`],
    skills: [],
  }));
}

/** Recursive fingerprint (relative path · size · mtimeMs) of a tree. */
function snapshotTree(dir) {
  const rows = [];
  const walk = (current, rel) => {
    for (const name of readdirSync(current, { withFileTypes: true })) {
      const child = path.join(current, name.name);
      const childRel = rel === "" ? name.name : `${rel}/${name.name}`;
      const stats = statSync(child);
      rows.push(`${childRel}\t${name.isDirectory() ? "d" : "f"}\t${name.isDirectory() ? 0 : stats.size}\t${stats.mtimeMs}`);
      if (name.isDirectory()) walk(child, childRel);
    }
  };
  if (existsSync(dir)) walk(dir, "");
  return rows.sort().join("\n");
}

/** Write a spec file with RAW text (writeSpec JSON.stringify()s its argument). */
function writeRawSpec(text) {
  specCounter += 1;
  const specPath = path.join(ROOT, `spec-${specCounter}.json`);
  writeFileSync(specPath, text);
  return specPath;
}

// The usage line as usageExit emits it (split("\n") drops the trailing newline).
const USAGE_TEXT = "usage: node sighting/tower-fleet.mjs [plan|launch|status|close] --spec <fleet.json> [--apply] [--mission <id>] [--force] [--json]";

/** Usage refusal contract: exit 64, empty stdout, typed USAGE line + usage line. */
function expectUsage(id, result, message) {
  const lines = result.stderr.split("\n");
  if (!check(`${id} exit 64`, result.status === 64, `got ${result.status}; stderr ${JSON.stringify(result.stderr.slice(0, 200))}`)) return false;
  check(`${id} stdout empty`, result.stdout === "", JSON.stringify(result.stdout.slice(0, 120)));
  let payload = null;
  try { payload = JSON.parse(lines[0]); } catch { /* not JSON */ }
  check(`${id} typed USAGE ${message}`, payload && payload.ok === false && payload.code === "USAGE" && payload.message === message,
    `line0 ${JSON.stringify(lines[0])}`);
  check(`${id} plain usage line`, lines[1] === USAGE_TEXT, `line1 ${JSON.stringify(lines[1])}`);
  check(`${id} stderr is exactly two lines`, lines.length === 3 && lines[2] === "", JSON.stringify(result.stderr));
  return true;
}

// ── 1. plan: valid 2-mission spec ───────────────────────────────────────────
say("plan — valid 2-mission fleet spec");
{
  const specPath = writeSpec(baseSpec());
  const result = launcher(["plan", "--spec", specPath, "--json"]);
  if (check("plan exit 0", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(result.stdout);
    check("plan reports verb", plan.verb === "plan", plan.verb);
    check("plan reports fleet", plan.fleet === "tftest");
    check("plan declares no writes", plan.writes === false);
    check("plan reads band live", plan.band.waveMin === BAND.waveMin && plan.band.waveMax === BAND.waveMax
      && plan.band.roundLaneCeiling === BAND.maxLanes && plan.band.maxConcurrentL1 === BAND.maxConcurrentL1
      && plan.band.windowPaneCeiling === BAND.windowPaneCeiling && plan.band.l1Alias === BAND.l1Alias,
    `band ${JSON.stringify(plan.band)}`);
    check("plan has 2 missions", plan.missions.length === 2, String(plan.missions.length));
    for (const row of plan.missions) {
      const wt = path.join(TREES_DIR, row.id);
      check(`plan ${row.id} worktree`, row.worktree === wt, row.worktree);
      check(`plan ${row.id} branch`, row.branch === `tower/tftest/${row.id}`, row.branch);
      check(`plan ${row.id} prompt path`, row.promptPath === path.join(STATE_DIR, `${row.id}.prompt.md`), row.promptPath);
      // Rendered prompt carries the band numbers read from the fixture config.
      check(`plan ${row.id} prompt wave band`, row.prompt.includes(`| wave band | ${BAND.waveMin}–${BAND.waveMax} lanes per wave |`), "band line");
      check(`plan ${row.id} prompt round ceiling`, row.prompt.includes(`| round ceiling | ${BAND.maxLanes} lanes per round; 2 rounds |`), "ceiling line");
      check(`plan ${row.id} prompt has no placeholders`, !/\{\{[A-Za-z]+\}\}/.test(row.prompt));
      check(`plan ${row.id} prompt binds mission identity`, row.prompt.includes(`\`${row.id}\``) && row.prompt.includes(`\`${row.axis}\``));
      // Exact launch argv: wall verb + interactive omp dispatch.
      const argv = row.launchArgv;
      check(`plan ${row.id} launch uses wall CLI`, argv[0] === "bash" && argv[1] === path.join(UFO_ROOT, "scripts", "ufo-sighting") && argv[2] === "launch");
      check(`plan ${row.id} launch has --fleet`, argv.includes("--fleet") && argv[argv.indexOf("--fleet") + 1] === "tftest");
      check(`plan ${row.id} launch has --cwd`, argv.includes("--cwd") && argv[argv.indexOf("--cwd") + 1] === wt);
      check(`plan ${row.id} launch wall flags`, ["--run-id", "--session-id", "--title", "--no-open", "--relay", "--runner-reservation"].every((flag) => argv.includes(flag)));
      const dashdash = argv.indexOf("--");
      const ompArgv = argv.slice(dashdash + 1);
      check(`plan ${row.id} omp argv is interactive omp`, ompArgv[0] === "omp" && ompArgv.includes("--print-thoughts") && ompArgv.includes("--auto-approve"));
      check(`plan ${row.id} omp --cwd equals mission cwd`, ompArgv[ompArgv.indexOf("--cwd") + 1] === wt);
      check(`plan ${row.id} omp model alias`, ompArgv.includes("--model") && ompArgv[ompArgv.indexOf("--model") + 1] === `@${BAND.l1Alias}`, ompArgv[ompArgv.indexOf("--model") + 1]);
      const forbidden = ompArgv.filter((token) => token === "-p" || token === "--print" || token === "--mode" || token.startsWith("--mode="));
      check(`plan ${row.id} omp argv not non-interactive`, forbidden.length === 0, forbidden.join(" "));
      check(`plan ${row.id} prompt file reference`, ompArgv.at(-1) === `@${path.join(STATE_DIR, `${row.id}.prompt.md`)}`);
    }
  } else {
    bad("plan body", `stdout ${result.stdout.slice(0, 300)}`);
  }
}

// ── 2. plan writes nothing ──────────────────────────────────────────────────
say("plan — writes nothing");
{
  check("stateDir stays absent", !existsSync(STATE_DIR) && readdirSafe(STATE_DIR).length === 0);
  check("worktreeRoot stays absent", !existsSync(TREES_DIR) && readdirSafe(TREES_DIR).length === 0);
}
function readdirSafe(dir) {
  return existsSync(dir) ? readdirSync(dir) : [];
}

// ── 3. default verb is plan ─────────────────────────────────────────────────
say("default verb — plan");
{
  const result = launcher(["--spec", writeSpec(baseSpec()), "--json"]);
  const parsed = result.status === 0 ? JSON.parse(result.stdout) : null;
  check("bare invocation plans", result.status === 0 && parsed?.verb === "plan", `exit ${result.status}`);
}

// ── 4. L1 ceiling: accepted at the ceiling, refused above it ────────────────
say("L1 ceiling — accepted at maxConcurrentL1, refused above it");
{
  check("fixture pane ceiling admits the L1 ceiling", BAND.windowPaneCeiling >= BAND.maxConcurrentL1,
    `pane ${BAND.windowPaneCeiling}, L1 ${BAND.maxConcurrentL1}`);
  // The gate is `>` not `>=`: a fleet of exactly maxConcurrentL1 missions plans.
  const atCeiling = launcher(["plan", "--spec", writeSpec(baseSpec({ missions: missionsOf(BAND.maxConcurrentL1) })), "--json"]);
  if (check("at-ceiling plan exit 0", atCeiling.status === 0, `got ${atCeiling.status}; stderr ${atCeiling.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(atCeiling.stdout);
    check("at-ceiling plan count equals maxConcurrentL1", plan.missions.length === BAND.maxConcurrentL1,
      `expected ${BAND.maxConcurrentL1}, got ${plan.missions.length}`);
    check("at-ceiling plan band reports maxConcurrentL1", plan.band.maxConcurrentL1 === BAND.maxConcurrentL1
      && plan.band.windowPaneCeiling === BAND.windowPaneCeiling, JSON.stringify(plan.band));
    check("at-ceiling plan writes nothing", !existsSync(STATE_DIR) && !existsSync(TREES_DIR), "plan must not create state/trees");
  }
  const refused = launcher(["plan", "--spec", writeSpec(baseSpec({ missions: missionsOf(BAND.maxConcurrentL1 + 1) })), "--json"]);
  expectTyped("L1 ceiling +1", refused, "L1_CEILING_EXCEEDED");
  check("L1 ceiling refusal writes nothing to stdout", refused.stdout === "", JSON.stringify(refused.stdout.slice(0, 200)));
  check("L1 ceiling refusal stderr is exactly one typed JSON line",
    refused.stderr.endsWith("\n") && refused.stderr.trim().split("\n").length === 1 && typedError(refused)?.ok === false,
    JSON.stringify(refused.stderr.slice(0, 200)));
  check("L1 ceiling refusal message names declared count and ceiling",
    typedError(refused)?.message === `fleet declares ${BAND.maxConcurrentL1 + 1} L1 missions; sighting.dispatch.maxConcurrentL1 is ${BAND.maxConcurrentL1}`,
    JSON.stringify(typedError(refused)?.message));
  check("L1 ceiling refusal creates no state dir", !existsSync(STATE_DIR) && readdirSafe(STATE_DIR).length === 0);
  check("L1 ceiling refusal creates no worktree root", !existsSync(TREES_DIR) && readdirSafe(TREES_DIR).length === 0);
  // Same refusal against a patched authority: the message tracks the config
  // ceiling (not the fixture's value) and the L1 gate fires before the pane gate.
  const patched = configRoot((config) => {
    config.sighting.dispatch.maxConcurrentL1 = 2;
    config.sighting.windowPaneCeiling = 8;
  });
  const patchedRefused = launcher(["plan", "--spec", writeSpec(specAt(patched, { missions: missionsOf(3) })), "--json"]);
  expectTyped("L1 ceiling +1 under patched authority", patchedRefused, "L1_CEILING_EXCEEDED");
  check("L1 ceiling refusal message tracks the patched ceiling",
    typedError(patchedRefused)?.message === "fleet declares 3 L1 missions; sighting.dispatch.maxConcurrentL1 is 2",
    JSON.stringify(typedError(patchedRefused)?.message));
}

// ── 5. scope overlap ────────────────────────────────────────────────────────
say("refusal — scope overlap");
{
  const overlapping = baseSpec({
    missions: [
      { id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src"], skills: [] },
      { id: "tf-b", title: "B", axis: "b", goal: "b", scope: ["src/deep/x.ts"], skills: [] },
    ],
  });
  expectTyped("scope overlap", launcher(["plan", "--spec", writeSpec(overlapping)]), "SCOPE_OVERLAP");
  const adjacent = baseSpec({
    missions: [
      { id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src/core"], skills: [] },
      { id: "tf-b", title: "B", axis: "b", goal: "b", scope: ["src/correction"], skills: [] },
    ],
  });
  check("component-adjacent scopes accepted", launcher(["plan", "--spec", writeSpec(adjacent)]).status === 0, "src/core vs src/correction must not trip SCOPE_OVERLAP");
}

// ── 6. nested scopes refuse in both argument orders ────────────────────────
say("refusal — nested scope overlap, both argument orders");
{
  const nested = (aScope, bScope) => baseSpec({
    missions: [
      { id: "tf-a", title: "A", axis: "a", goal: "a", scope: [aScope], skills: [] },
      { id: "tf-b", title: "B", axis: "b", goal: "b", scope: [bScope], skills: [] },
    ],
  });
  const parentFirst = launcher(["plan", "--spec", writeSpec(nested("src", "src/deep/x.ts")), "--json"]);
  const childFirst = launcher(["plan", "--spec", writeSpec(nested("src/deep/x.ts", "src")), "--json"]);
  expectTyped("nested parent-first", parentFirst, "SCOPE_OVERLAP");
  expectTyped("nested child-first", childFirst, "SCOPE_OVERLAP");
  const parentMsg = typedError(parentFirst)?.message ?? "";
  const childMsg = typedError(childFirst)?.message ?? "";
  // The message names the id pair in spec order and the leading scope path, so an
  // asymmetric prefix compare (one direction only) cannot pass both orders.
  check("nested parent-first names both missions and the child path",
    parentMsg.includes("tf-a") && parentMsg.includes("tf-b")
      && parentMsg.startsWith("mission tf-a scope src overlaps")
      && parentMsg.includes("src/deep/x.ts"), parentMsg);
  check("nested child-first names both missions and the parent path",
    childMsg.includes("tf-a") && childMsg.includes("tf-b")
      && childMsg.startsWith("mission tf-a scope src/deep/x.ts overlaps")
      && childMsg.includes("src"), childMsg);
  // Deeper nesting refuses too — there is no depth or adjacency shortcut.
  expectTyped("deep nesting parent-first",
    launcher(["plan", "--spec", writeSpec(nested("src", "src/deep/a/b/c.ts")), "--json"]), "SCOPE_OVERLAP");
  expectTyped("deep nesting child-first",
    launcher(["plan", "--spec", writeSpec(nested("src/deep/a/b/c.ts", "src")), "--json"]), "SCOPE_OVERLAP");
  // Boundary: one mission owning both a parent and its child is a single writer.
  check("intra-mission nested entries accepted",
    launcher(["plan", "--spec", writeSpec(baseSpec({
      missions: [{ id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src", "src/deep/x.ts"], skills: [] }],
    })), "--json"]).status === 0,
    "one mission owning parent+child is not a cross-mission overlap");
}

// ── 7. identity validation ──────────────────────────────────────────────────
say("refusal — bad fleet name and duplicate ids");
{
  expectTyped("bad fleet", launcher(["plan", "--spec", writeSpec(baseSpec({ fleet: "Bad_Fleet!" }))]), "INVALID_SPEC");
  expectTyped("uppercase fleet", launcher(["plan", "--spec", writeSpec(baseSpec({ fleet: "Tower1" }))]), "INVALID_SPEC");
  expectTyped("duplicate ids", launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [
      { id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src/a"], skills: [] },
      { id: "tf-a", title: "B", axis: "b", goal: "b", scope: ["src/b"], skills: [] },
    ],
  }))]), "INVALID_SPEC");
  expectTyped("bad mission id", launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [{ id: "1-bad", title: "A", axis: "a", goal: "a", scope: ["src/a"], skills: [] }],
  }))]), "INVALID_SPEC");
  expectTyped("absolute scope", launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [{ id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["/etc/passwd"], skills: [] }],
  }))]), "INVALID_SPEC");
}

// ── 8. mutation guard ───────────────────────────────────────────────────────
say("refusal — mutation without --apply");
{
  const specPath = writeSpec(baseSpec());
  expectTyped("launch without --apply", launcher(["launch", "--spec", specPath]), "MUTATION_REQUIRES_APPLY");
  expectTyped("close without --apply", launcher(["close", "--spec", specPath]), "MUTATION_REQUIRES_APPLY");
  check("guard refused before any wall touch", !existsSync(STATE_DIR), "refusal must not create the state dir");
}

// ── 9. usage ────────────────────────────────────────────────────────────────
say("usage errors — exit 64");
{
  check("missing --spec", launcher(["plan"]).status === 64, String(launcher(["plan"]).status));
  check("unknown verb", launcher(["fly", "--spec", writeSpec(baseSpec())]).status === 64);
  check("unknown flag", launcher(["plan", "--spec", writeSpec(baseSpec()), "--wat"]).status === 64);
}

// ── 10. omp argv shape: exact token list and derivation from launchArgv ─────
say("plan — omp argv shape and derivation");
{
  const result = launcher(["plan", "--spec", writeSpec(baseSpec()), "--json"]);
  if (check("omp-argv plan exit 0", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(result.stdout);
    for (const row of plan.missions) {
      const wt = path.join(TREES_DIR, row.id);
      const expected = [
        "omp",
        "--cwd", wt,
        "--session-dir", path.join(STATE_DIR, "sessions", row.id),
        "--max-time", plan.maxTime,
        "--model", `@${BAND.l1Alias}`,
        "--config", path.join(UFO_ROOT, "config", "mission-nightcall.yml"),
        "--print-thoughts",
        "--auto-approve",
        `@${path.join(STATE_DIR, `${row.id}.prompt.md`)}`,
      ];
      check(`omp-argv ${row.id} exact token list`, JSON.stringify(row.ompArgv) === JSON.stringify(expected), JSON.stringify(row.ompArgv));
      check(`omp-argv ${row.id} omp --cwd equals wall --cwd`,
        row.ompArgv[row.ompArgv.indexOf("--cwd") + 1] === row.launchArgv[row.launchArgv.indexOf("--cwd") + 1],
        `${row.ompArgv[row.ompArgv.indexOf("--cwd") + 1]} vs ${row.launchArgv[row.launchArgv.indexOf("--cwd") + 1]}`);
      const dd = row.launchArgv.indexOf("--");
      check(`omp-argv ${row.id} ompArgv derives from launchArgv after --`,
        dd > 0 && JSON.stringify(row.launchArgv.slice(dd + 1)) === JSON.stringify(row.ompArgv), `dd=${dd}`);
    }
    // The --config path is emitted as a token only; plan never checks the file exists.
    check("omp-argv --config needs no file at plan time",
      !existsSync(path.join(UFO_ROOT, "config", "mission-nightcall.yml")) && result.status === 0);
    const altState = path.join(ROOT, "state-37m");
    const alt = launcher(["plan", "--spec", writeSpec(baseSpec({ maxTime: "37m", stateDir: altState })), "--json"]);
    if (check("omp-argv alt plan exit 0", alt.status === 0, `got ${alt.status}; stderr ${alt.stderr.slice(0, 200)}`)) {
      const altPlan = JSON.parse(alt.stdout);
      const row = altPlan.missions[0];
      check("omp-argv alt --max-time flows through", row.ompArgv[row.ompArgv.indexOf("--max-time") + 1] === "37m", row.ompArgv[row.ompArgv.indexOf("--max-time") + 1]);
      check("omp-argv alt --session-dir flows through",
        row.ompArgv[row.ompArgv.indexOf("--session-dir") + 1] === path.join(altState, "sessions", row.id),
        row.ompArgv[row.ompArgv.indexOf("--session-dir") + 1]);
      check("omp-argv alt prompt file under alt stateDir", row.ompArgv.at(-1) === `@${path.join(altState, `${row.id}.prompt.md`)}`, row.ompArgv.at(-1));
    }
  }
}

// ── 11. identical scope entries and component-disjoint siblings ─────────────
say("scopes — identical entries refused, component-disjoint siblings accepted");
{
  const pair = (aScope, bScope) => baseSpec({
    missions: [
      { id: "tf-same-a", title: "A", axis: "a", goal: "a", scope: [aScope], skills: [] },
      { id: "tf-same-b", title: "B", axis: "b", goal: "b", scope: [bScope], skills: [] },
    ],
  });
  const identical = launcher(["plan", "--spec", writeSpec(pair("src/x", "src/x")), "--json"]);
  expectTyped("identical scopes", identical, "SCOPE_OVERLAP");
  check("identical scopes name both missions and both scopes",
    typedError(identical)?.message === "mission tf-same-a scope src/x overlaps mission tf-same-b scope src/x",
    JSON.stringify(typedError(identical)?.message));
  const shallowest = launcher(["plan", "--spec", writeSpec(pair("src/x", "src/y")), "--json"]);
  const shallowPlan = shallowest.status === 0 ? JSON.parse(shallowest.stdout) : null;
  check("shallowest scope difference accepted", shallowest.status === 0 && shallowPlan?.writes === false,
    `exit ${shallowest.status}; stderr ${JSON.stringify(shallowest.stderr.slice(0, 200))}`);

  // "src/a" IS a string prefix of "src/ab" but not a component prefix, so the gate
  // (scopeOverlaps, compare part-by-part) must accept the fleet.
  check("prefix-name siblings accepted", launcher(["plan", "--spec", writeSpec(pair("src/a", "src/ab"))]).status === 0,
    "src/a vs src/ab must not trip SCOPE_OVERLAP (string prefix, not component prefix)");
  // components ["src","a","b"] and ["src","a-b"] — disjoint.
  check("dash-suffix sibling accepted", launcher(["plan", "--spec", writeSpec(pair("src/a/b", "src/a-b"))]).status === 0,
    "src/a/b vs src/a-b must not trip SCOPE_OVERLAP");

  // Multi-entry scopes: the whole cross-product must be disjoint, and the
  // normalized entries must survive into the plan.
  const multi = launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [
      { id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src/a", "src/b"], skills: [] },
      { id: "tf-b", title: "B", axis: "b", goal: "b", scope: ["src/c", "src/d"], skills: [] },
    ],
  })), "--json"]);
  if (check("multi-entry disjoint accepted", multi.status === 0, `got ${multi.status}; stderr ${JSON.stringify(multi.stderr.slice(0, 200))}`)) {
    const plan = JSON.parse(multi.stdout);
    check("multi-entry scopes survive normalized",
      JSON.stringify(plan.missions.map((row) => row.scope)) === JSON.stringify([["src/a", "src/b"], ["src/c", "src/d"]]),
      JSON.stringify(plan.missions.map((row) => row.scope)));
  }
  // Control: an overlap hidden in a LATER entry is still refused, so the exit-0
  // pins above are not the loop short-circuiting.
  expectTyped("multi-entry later-entry overlap", launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [
      { id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src/a", "src/b"], skills: [] },
      { id: "tf-b", title: "B", axis: "b", goal: "b", scope: ["src/c", "src/b/x"], skills: [] },
    ],
  }))]), "SCOPE_OVERLAP");
}

// ── 12. scope entry normalization and refusal forms ────────────────────────
say("scopes — accepted spellings normalize to one prefix");
{
  for (const [raw, expected] of [["./src", "src"], ["src/", "src"], ["src//", "src"], ["  src  ", "src"], ["src/a", "src/a"]]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({
      missions: [{ id: "tf-alpha", title: "Alpha axis", axis: "scope-normalization", goal: "Prove scope normalization.", scope: [raw], skills: [] }],
    })), "--json"]);
    if (!check(`scope ${JSON.stringify(raw)} exit 0`, result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) continue;
    const row = JSON.parse(result.stdout).missions[0];
    check(`scope ${JSON.stringify(raw)} echoes normalized prefix`, JSON.stringify(row.scope) === JSON.stringify([expected]), JSON.stringify(row.scope));
    check(`scope ${JSON.stringify(raw)} prompt scope line`, row.prompt.includes(`| scope | ${expected} — the only repo paths you may edit;`), "scope line");
  }
  // Different spellings of the same prefix are kept verbatim and in argv order (no dedup).
  const combined = launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [{ id: "tf-alpha", title: "Alpha axis", axis: "scope-normalization", goal: "Prove scope normalization.", scope: ["./src", "src/", "src//", "  src  ", "src/a"], skills: [] }],
  })), "--json"]);
  if (check("scope combined exit 0", combined.status === 0, `got ${combined.status}`)) {
    const row = JSON.parse(combined.stdout).missions[0];
    check("scope combined echoes normalized entries in order",
      JSON.stringify(row.scope) === JSON.stringify(["src", "src", "src", "src", "src/a"]), JSON.stringify(row.scope));
    check("scope combined prompt scope line",
      row.prompt.includes("| scope | src, src, src, src, src/a — the only repo paths you may edit;"), "scope line");
  }
  // Normalization runs before the overlap gate: differently spelled equal prefixes collide.
  expectTyped("scope overlap ./src vs src/", launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [
      { id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["./src"], skills: [] },
      { id: "tf-b", title: "B", axis: "b", goal: "b", scope: ["src/"], skills: [] },
    ],
  }))]), "SCOPE_OVERLAP");
  // Only trailing slashes collapse; an interior empty component is refused, not collapsed.
  expectTyped("scope interior double slash", launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [{ id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src//a"], skills: [] }],
  }))]), "INVALID_SPEC");
}

// ── 13. scope refusal forms: per-entry taxonomy and the empty-scope gate ───
say("scopes — per-entry refusal taxonomy");
{
  const single = (scope) => baseSpec({ missions: [{ id: "tf-a", title: "A", axis: "a", goal: "a", scope, skills: [] }] });
  const refuseEntry = (label, entry, message) => {
    const result = launcher(["plan", "--spec", writeSpec(single([entry])), "--json"]);
    expectTyped(label, result, "INVALID_SPEC");
    check(`${label} message`, typedError(result)?.message === message, JSON.stringify(typedError(result)?.message));
  };
  const NOT_STRING = `mission tf-a scope entry must be a non-empty string`;
  for (const entry of ["", "   ", 42, null, ["a"], { a: 1 }]) {
    refuseEntry(`scope entry ${JSON.stringify(entry)}`, entry, NOT_STRING);
  }
  // A non-empty string that collapses to "" only AFTER trimming/slash-stripping.
  for (const entry of ["/", "///", "./"]) {
    refuseEntry(`scope entry ${JSON.stringify(entry)} collapses empty`, entry,
      `mission tf-a scope entry ${entry} does not name a repo-relative path`);
  }
  for (const entry of ["/etc/passwd", "~/x", "~", "//x"]) {
    refuseEntry(`scope entry ${JSON.stringify(entry)} absolute`, entry,
      `mission tf-a scope entry ${entry} must be repo-relative, not absolute`);
  }
  for (const entry of ["src/../etc", "..", "src//x"]) {
    refuseEntry(`scope entry ${JSON.stringify(entry)} escapes`, entry,
      `mission tf-a scope entry ${entry} must stay inside the repo`);
  }
  // The container gate is its own message, distinct from every per-entry refusal.
  for (const [label, scope] of [["scope empty array", []], ["scope key absent", undefined]]) {
    const result = launcher(["plan", "--spec", writeSpec(single(scope)), "--json"]);
    expectTyped(label, result, "INVALID_SPEC");
    check(`${label} message`,
      typedError(result)?.message === "mission tf-a needs a non-empty scope array of repo-relative path prefixes",
      typedError(result)?.message);
  }
  check("scope refusals write nothing", !existsSync(STATE_DIR) && !existsSync(TREES_DIR), "validation must precede any write");
}

// ── 14. fleet-name pattern: charset, first char, length boundary ───────────
say("refusal — fleet name pattern");
{
  const PATTERN = "/^[a-z0-9][a-z0-9_-]{0,47}$/";
  for (const fleet of ["", "Bad_Fleet!", "Tower1", "_lead", "-lead", "a".repeat(49)]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ fleet })), "--json"]);
    const payload = typedError(result);
    check(`fleet ${JSON.stringify(fleet)} refused`, result.status === 2 && payload?.ok === false && payload?.code === "INVALID_SPEC",
      `exit ${result.status}; ${JSON.stringify(result.stderr.slice(0, 160))}`);
    check(`fleet ${JSON.stringify(fleet)} names the pattern`, payload?.message === `fleet name ${JSON.stringify(fleet)} must match ${PATTERN}`, payload?.message);
  }
  for (const fleet of ["0ok", "a", "a".repeat(48)]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ fleet })), "--json"]);
    const plan = result.status === 0 ? JSON.parse(result.stdout) : null;
    check(`fleet ${JSON.stringify(fleet)} accepted`, result.status === 0 && plan?.fleet === fleet && plan?.writes === false,
      `exit ${result.status}; ${JSON.stringify(result.stderr.slice(0, 160))}`);
  }
  const { fleet: dropped, ...noFleet } = baseSpec();
  const missing = launcher(["plan", "--spec", writeSpec(noFleet), "--json"]);
  check("missing fleet key refused", missing.status === 2 && typedError(missing)?.code === "INVALID_SPEC",
    `exit ${missing.status}; ${JSON.stringify(missing.stderr.slice(0, 160))}`);
  check("missing fleet key names the pattern", typedError(missing)?.message === `fleet name undefined must match ${PATTERN}`,
    typedError(missing)?.message);
}

// ── 15. mission-id pattern boundary and the duplicate gate ─────────────────
say("refusal — mission id pattern and duplicate gate");
{
  const MID = "/^[A-Za-z][A-Za-z0-9_-]{0,63}$/";
  const idCase = (id) => ({ id, title: "A", axis: "a", goal: "a", scope: ["src/x"], skills: [] });
  const refuse = (label, missions, message) => {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ missions })), "--json"]);
    expectTyped(label, result, "INVALID_SPEC");
    check(`${label} message`, typedError(result)?.message === message, JSON.stringify(typedError(result)?.message));
  };
  refuse("id empty string", [idCase("")], `mission id "" must match ${MID}`);
  refuse("id whitespace only", [idCase("   ")], `mission id "   " must match ${MID}`);
  refuse("id internal space", [idCase("tf a")], `mission id "tf a" must match ${MID}`);
  refuse("id 65 chars", [idCase("A".repeat(65))], `mission id ${JSON.stringify("A".repeat(65))} must match ${MID}`);
  refuse("id non-string", [idCase(7)], `mission id 7 must match ${MID}`);
  refuse("id key missing", [{ title: "A", axis: "a", goal: "a", scope: ["src/x"], skills: [] }], `mission id undefined must match ${MID}`);

  // 64 chars is the inclusive ceiling: accepted, and echoed/used verbatim.
  {
    const id = "A".repeat(64);
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ missions: [idCase(id)] })), "--json"]);
    if (check("id 64 chars accepted", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
      const row = JSON.parse(result.stdout).missions[0];
      check("id 64 chars echoed", row.id === id, row.id);
      check("id 64 chars names worktree", row.worktree === path.join(TREES_DIR, id), row.worktree);
    }
  }
  // The identity is the trimmed value: a spaced id is legal and normalized.
  {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ missions: [idCase(" tf-a ")] })), "--json"]);
    if (check("spaced id accepted", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
      const row = JSON.parse(result.stdout).missions[0];
      check("spaced id trimmed", row.id === "tf-a", row.id);
      check("spaced id names worktree", row.worktree === path.join(TREES_DIR, "tf-a"), row.worktree);
    }
  }
  // Duplicates are detected on the trimmed id, and outrank field/overlap refusals.
  refuse("duplicate ids", [idCase("tf-a"), { ...idCase("tf-a"), scope: ["src/y"] }], "duplicate mission id tf-a");
  refuse("duplicate ids via trim", [idCase(" tf-a "), { ...idCase("tf-a"), scope: ["src/y"] }], "duplicate mission id tf-a");
  refuse("duplicate ids both spaced", [idCase(" tf-a "), { ...idCase("  tf-a"), scope: ["src/y"] }], "duplicate mission id tf-a");
  refuse("duplicate beats per-mission checks", [idCase("tf-a"), { id: "tf-a", axis: "b", goal: "b", scope: ["src/y"], skills: [] }], "duplicate mission id tf-a");
  refuse("duplicate beats scope overlap", [idCase("tf-a"), { ...idCase("tf-a"), scope: ["src"] }], "duplicate mission id tf-a");
}

// ── 16. mission container shape and required fields ────────────────────────
say("refusal — mission shape and required fields");
{
  const singleMission = (over = {}) => baseSpec({
    missions: [{ id: "tf-a", title: "A", axis: "a", goal: "g", scope: ["src/a"], skills: [], ...over }],
  });
  const refused = (id, spec, expected) => {
    const result = launcher(["plan", "--spec", writeSpec(spec), "--json"]);
    expectTyped(id, result, "INVALID_SPEC");
    check(`${id} message`, typedError(result)?.message === expected, `got ${JSON.stringify(typedError(result)?.message)}`);
  };
  refused("missions absent", baseSpec({ missions: undefined }), "fleet spec needs at least one mission");
  refused("missions empty", baseSpec({ missions: [] }), "fleet spec needs at least one mission");
  refused("missions object", baseSpec({ missions: {} }), "fleet spec needs at least one mission");
  refused("missions scalar", baseSpec({ missions: "x" }), "fleet spec needs at least one mission");
  refused("mission element string", baseSpec({ missions: ["x"] }), "each mission must be an object");
  refused("mission element null", baseSpec({ missions: [null] }), "each mission must be an object");
  refused("mission element number", baseSpec({ missions: [7] }), "each mission must be an object");
  refused("title empty", singleMission({ title: "" }), "mission tf-a needs a non-empty title");
  refused("title blank", singleMission({ title: "   " }), "mission tf-a needs a non-empty title");
  refused("title missing", singleMission({ title: undefined }), "mission tf-a needs a non-empty title");
  refused("axis empty", singleMission({ axis: "" }), "mission tf-a needs a non-empty axis");
  refused("axis blank", singleMission({ axis: "   " }), "mission tf-a needs a non-empty axis");
  refused("axis missing", singleMission({ axis: undefined }), "mission tf-a needs a non-empty axis");
  refused("goal empty", singleMission({ goal: "" }), "mission tf-a needs a non-empty goal");
  refused("goal blank", singleMission({ goal: "   " }), "mission tf-a needs a non-empty goal");
  refused("goal missing", singleMission({ goal: undefined }), "mission tf-a needs a non-empty goal");
}

// ── 17. skills field validation ────────────────────────────────────────────
say("plan — skills field validation");
{
  const missionWith = (skills, include) => {
    const mission = { id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src/a"] };
    if (include) mission.skills = skills;
    return mission;
  };
  const planSkills = (skills, include) => {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ missions: [missionWith(skills, include)] })), "--json"]);
    return { result, skills: result.status === 0 ? JSON.parse(result.stdout).missions[0].skills : null };
  };
  const accept = (id, skills, expected, include = true) => {
    const { result, skills: echoed } = planSkills(skills, include);
    check(`${id} exit 0`, result.status === 0, `got ${result.status}; stderr ${JSON.stringify(result.stderr.slice(0, 200))}`);
    check(`${id} echoes normalized skills`, JSON.stringify(echoed) === JSON.stringify(expected), JSON.stringify(echoed));
  };
  const refuse = (id, skills, message) => {
    const { result } = planSkills(skills, true);
    expectTyped(id, result, "INVALID_SPEC");
    check(`${id} message`, typedError(result)?.message === message, JSON.stringify(typedError(result)?.message));
  };
  // Absent and null both normalize to the empty array; an explicit empty array is kept.
  accept("skills absent", undefined, [], false);
  accept("skills null", null, []);
  accept("skills empty", [], []);
  // Accepted names: 1-char, leading digit, punctuation, and the 64-char boundary.
  accept("skills one char", ["A"], ["A"]);
  accept("skills leading digit", ["1x"], ["1x"]);
  accept("skills punctuation", ["a.b_c-d"], ["a.b_c-d"]);
  accept("skills 64 chars", ["a".repeat(64)], ["a".repeat(64)]);
  // The array is echoed verbatim: no dedupe, no reordering.
  accept("skills verbose echo", ["b", "a", "b"], ["b", "a", "b"]);
  refuse("skills non-array", "tower", "mission tf-a skills must be an array of skill names");
  for (const bad of ["../x", "a b", "", ".x", "a/b", 42, "a".repeat(65)]) {
    refuse(`skills name ${JSON.stringify(bad)}`, [bad], `mission tf-a skill name ${JSON.stringify(bad)} is not a safe directory name`);
  }
  check("skills refusal writes nothing", !existsSync(STATE_DIR) && !existsSync(TREES_DIR), "refusal must not create state or worktrees");
}

// ── 18. maxTime: default, safe tokens, refusals ────────────────────────────
say("maxTime — default, safe tokens, refusals");
{
  const absent = launcher(["plan", "--spec", writeSpec(baseSpec({ maxTime: undefined })), "--json"]);
  const absentPlan = absent.status === 0 ? JSON.parse(absent.stdout) : null;
  check("maxTime default is 3h", absentPlan?.maxTime === "3h", `exit ${absent.status}; maxTime ${absentPlan?.maxTime}`);
  for (const [value, expected] of [["90m", "90m"], ["01:30", "01:30"], ["3H", "3H"], ["3h+x", "3h+x"], [90, "90"], [" 90m ", "90m"]]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ maxTime: value })), "--json"]);
    const plan = result.status === 0 ? JSON.parse(result.stdout) : null;
    const omp = plan?.missions?.[0]?.ompArgv ?? [];
    check(`maxTime ${JSON.stringify(value)} accepted as ${JSON.stringify(expected)}`, plan?.maxTime === expected,
      `exit ${result.status}; got ${JSON.stringify(plan?.maxTime)}; stderr ${JSON.stringify(result.stderr.slice(0, 120))}`);
    check(`maxTime ${JSON.stringify(value)} reaches omp --max-time`, omp[omp.indexOf("--max-time") + 1] === expected, omp.join(" "));
  }
  // Refusals: exit 2, typed INVALID_SPEC, message echoes the RAW value.
  for (const value of ["", "   ", "-2h", "3 h", "3h;rm -rf /"]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ maxTime: value }))]);
    expectTyped(`maxTime ${JSON.stringify(value)}`, result, "INVALID_SPEC");
    check(`maxTime ${JSON.stringify(value)} message`, typedError(result)?.message === `maxTime ${JSON.stringify(value)} is not a safe token`, typedError(result)?.message);
  }
  check("maxTime refusals write nothing", !existsSync(STATE_DIR) && !existsSync(TREES_DIR), "validation must precede any write");
}

// ── 19. roundCeiling: default, validation, and echo ────────────────────────
say("roundCeiling — default, validation, and echo");
{
  const defaulted = baseSpec();
  delete defaulted.roundCeiling;
  const def = launcher(["plan", "--spec", writeSpec(defaulted), "--json"]);
  if (check("roundCeiling absent exit 0", def.status === 0, `got ${def.status}; stderr ${def.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(def.stdout);
    check("roundCeiling absent -> plan.roundCeiling 1", plan.roundCeiling === 1, String(plan.roundCeiling));
    check("roundCeiling absent -> prompt line", plan.missions[0].prompt.includes(`| round ceiling | ${BAND.maxLanes} lanes per round; 1 rounds |`), "prompt line");
  }
  const two = launcher(["plan", "--spec", writeSpec(baseSpec({ roundCeiling: 2 })), "--json"]);
  if (check("roundCeiling 2 exit 0", two.status === 0, `got ${two.status}; stderr ${two.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(two.stdout);
    check("roundCeiling 2 -> plan.roundCeiling 2", plan.roundCeiling === 2, String(plan.roundCeiling));
    check("roundCeiling 2 -> prompt line", plan.missions[0].prompt.includes(`| round ceiling | ${BAND.maxLanes} lanes per round; 2 rounds |`), "prompt line");
  }
  check("roundCeiling 1 accepted", launcher(["plan", "--spec", writeSpec(baseSpec({ roundCeiling: 1 })), "--json"]).status === 0, "1 is a positive integer");
  for (const [label, value, shown] of [["0", 0, "0"], ["-1", -1, "-1"], ["1.5", 1.5, "1.5"], ['"2"', "2", '"2"'], ["null", null, "null"], ["true", true, "true"]]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ roundCeiling: value })), "--json"]);
    expectTyped(`roundCeiling ${label}`, result, "INVALID_SPEC");
    check(`roundCeiling ${label} message`, typedError(result)?.message === `roundCeiling must be a positive integer, got ${shown}`, typedError(result)?.message);
  }
}

// ── 20. spec shape and unreadable spec files ───────────────────────────────
say("refusal — spec shape and unreadable spec files");
{
  const absentPath = path.join(ROOT, "no-such-spec.json");
  const absent = launcher(["plan", "--spec", absentPath, "--json"]);
  expectTyped("spec absent", absent, "INVALID_SPEC");
  check("spec absent message", typedError(absent)?.message?.startsWith(`cannot read fleet spec ${absentPath}: `)
    && typedError(absent).message.includes("ENOENT"), JSON.stringify(typedError(absent)?.message));

  const malformedPath = writeRawSpec("{ not json");
  const malformed = launcher(["plan", "--spec", malformedPath, "--json"]);
  expectTyped("spec malformed JSON", malformed, "INVALID_SPEC");
  check("spec malformed message names the file", typedError(malformed)?.message?.startsWith(`cannot read fleet spec ${malformedPath}: `),
    JSON.stringify(typedError(malformed)?.message));

  const dirPath = path.join(ROOT, "spec-as-directory");
  mkdirSync(dirPath, { recursive: true });
  const asDir = launcher(["plan", "--spec", dirPath, "--json"]);
  expectTyped("spec path is a directory", asDir, "INVALID_SPEC");
  check("spec path is a directory message", typedError(asDir)?.message?.startsWith(`cannot read fleet spec ${dirPath}: `)
    && typedError(asDir).message.includes("EISDIR"), JSON.stringify(typedError(asDir)?.message));

  // Non-object JSON is caught by main()'s ufoRoot pre-gate, which reads the same
  // bytes before loadSpec runs: "fleet spec must be a JSON object" never fires.
  const NO_UFO_ROOT = "fleet spec needs ufoRoot (the substrate carrying config/ufo.json and scripts/ufo-sighting)";
  for (const [label, text] of [["array", "[]"], ["string", '"hello"'], ["null", "null"], ["number", "42"], ["empty object", "{}"]]) {
    const result = launcher(["plan", "--spec", writeRawSpec(text), "--json"]);
    expectTyped(`spec ${label}`, result, "INVALID_SPEC");
    const payload = typedError(result);
    check(`spec ${label} message is the ufoRoot gate`, payload?.message === NO_UFO_ROOT, JSON.stringify(payload?.message));
    check(`spec ${label} never reports a non-object spec`, !(payload?.message ?? "").includes("must be a JSON object"), String(payload?.message));
  }
  const gateFirst = launcher(["plan", "--spec", writeSpec({ fleet: "Bad_Fleet!", repo: REPO, missions: baseSpec().missions }), "--json"]);
  expectTyped("missing ufoRoot precedes fleet/repo validation", gateFirst, "INVALID_SPEC");
  check("missing ufoRoot message", typedError(gateFirst)?.message === NO_UFO_ROOT, JSON.stringify(typedError(gateFirst)?.message));
  for (const [label, rootValue] of [["empty ufoRoot", ""], ["blank ufoRoot", "   "], ["non-string ufoRoot", 7]]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ ufoRoot: rootValue })), "--json"]);
    expectTyped(`spec ${label}`, result, "INVALID_SPEC");
    check(`spec ${label} message`, typedError(result)?.message === NO_UFO_ROOT, JSON.stringify(typedError(result)?.message));
  }
  const noRepo = baseSpec();
  delete noRepo.repo;
  for (const [label, spec] of [["missing repo", noRepo], ["empty repo", baseSpec({ repo: "" })], ["blank repo", baseSpec({ repo: "   " })]]) {
    const result = launcher(["plan", "--spec", writeSpec(spec), "--json"]);
    expectTyped(`spec ${label}`, result, "INVALID_SPEC");
    check(`spec ${label} message`, typedError(result)?.message === "fleet spec needs a repo path", JSON.stringify(typedError(result)?.message));
  }
  // A ufoRoot that exists but carries no config/ufo.json: the authority refuses.
  const bareRoot = path.join(ROOT, "ufoRootWithoutConfig");
  mkdirSync(bareRoot, { recursive: true });
  const bareConfig = path.join(bareRoot, "config", "ufo.json");
  check("bare ufoRoot really lacks config/ufo.json", !existsSync(bareConfig), bareConfig);
  const bare = launcher(["plan", "--spec", writeSpec(baseSpec({ ufoRoot: bareRoot })), "--json"]);
  expectTyped("ufoRoot without config/ufo.json", bare, "CONFIG_UNREADABLE");
  check("ufoRoot without config message", typedError(bare)?.message?.startsWith(`cannot read band authority ${bareConfig}: `)
    && typedError(bare).message.includes("ENOENT"), JSON.stringify(typedError(bare)?.message));
  const authorityFirst = launcher(["plan", "--spec", writeSpec({ fleet: "Bad_Fleet!", repo: REPO, ufoRoot: bareRoot, missions: baseSpec().missions }), "--json"]);
  expectTyped("authority precedes spec-shape validation", authorityFirst, "CONFIG_UNREADABLE");
  const badFleet = launcher(["plan", "--spec", writeSpec(baseSpec({ fleet: "Bad_Fleet!" })), "--json"]);
  expectTyped("bad fleet with readable authority", badFleet, "INVALID_SPEC");
  check("bad fleet message", typedError(badFleet)?.message === 'fleet name "Bad_Fleet!" must match /^[a-z0-9][a-z0-9_-]{0,47}$/', JSON.stringify(typedError(badFleet)?.message));
  check("spec-shape refusals write nothing", !existsSync(STATE_DIR) && !existsSync(TREES_DIR), "stateDir/worktreeRoot must stay absent");
  check("valid spec still plans after the shape probes", launcher(["plan", "--spec", writeSpec(baseSpec()), "--json"]).status === 0);
}

// ── 21. panes: windowPaneCeiling read live, and the two-ceiling gate order ──
say("plan — windowPaneCeiling is read live, and the pane gate refuses");
{
  const PATCHED = 12; // must differ from the real config's value: a baked-in constant cannot pass.
  const paneRoot = configRoot((parsed) => { parsed.sighting.windowPaneCeiling = PATCHED; }); // maxConcurrentL1 left real
  const paneConfigPath = path.join(paneRoot, "config", "ufo.json");
  check("patched pane ceiling is distinctive", PATCHED !== BAND.windowPaneCeiling, `fixture-real ${BAND.windowPaneCeiling}`);
  check("patch stayed inside the temp ufoRoot",
    JSON.parse(readFileSync(paneConfigPath, "utf8")).sighting.windowPaneCeiling === PATCHED
      && JSON.parse(readFileSync(REAL_CONFIG, "utf8")).sighting.windowPaneCeiling === BAND.windowPaneCeiling,
    "temp config patched, real config untouched");

  const result = launcher(["plan", "--spec", writeSpec(specAt(paneRoot)), "--json"]);
  if (check("pane-ceiling plan exit 0", result.status === 0, `got ${result.status}; stderr ${JSON.stringify(result.stderr.slice(0, 200))}`)) {
    const plan = JSON.parse(result.stdout);
    check("plan echoes patched windowPaneCeiling", plan.band.windowPaneCeiling === PATCHED, `got ${plan.band.windowPaneCeiling}`);
    check("plan keeps the real maxConcurrentL1", plan.band.maxConcurrentL1 === BAND.maxConcurrentL1, `got ${plan.band.maxConcurrentL1}`);
  }
  // PATCHED+1 panes — still within the real maxConcurrentL1 — trips the pane gate.
  const over = launcher(["plan", "--spec", writeSpec(specAt(paneRoot, { missions: missionsOf(PATCHED + 1, "p") })), "--json"]);
  expectTyped("pane ceiling", over, "PANE_CEILING_EXCEEDED");
  check("pane ceiling message names both numbers",
    typedError(over)?.message === `fleet declares ${PATCHED + 1} panes; sighting.windowPaneCeiling is ${PATCHED}`,
    typedError(over)?.message);
  // Gate is `>` not `>=`: a fleet exactly at the (patched) pane ceiling plans clean.
  check("pane ceiling boundary accepted",
    launcher(["plan", "--spec", writeSpec(specAt(paneRoot, { missions: missionsOf(PATCHED, "p"), roundCeiling: 2 })), "--json"]).status === 0,
    "at-limit panes must plan");
  // When BOTH gates would trip, the L1 check runs first and its code wins.
  const bothRoot = configRoot((parsed) => {
    parsed.sighting.windowPaneCeiling = 2;
    parsed.sighting.dispatch.maxConcurrentL1 = 2;
  });
  expectTyped("both ceilings tripped reports the L1 gate",
    launcher(["plan", "--spec", writeSpec(specAt(bothRoot, { missions: missionsOf(3, "b") })), "--json"]), "L1_CEILING_EXCEEDED");
}

// ── 22. help — exit 0, usage on stdout, silent stderr ─────────────────────
say("help — exit 0 on stdout, silent stderr");
{
  for (const argv of [["--help"], ["-h"], ["plan", "--help"], ["launch", "-h"], ["--help", "--spec", "/nonexistent/spec.json"], ["--spec", "/nonexistent/spec.json", "--help"]]) {
    const label = argv.join(" ");
    const result = launcher(argv);
    check(`help ${label} exit 0`, result.status === 0, `got ${result.status}`);
    check(`help ${label} usage on stdout`, result.stdout === `${USAGE_TEXT}\n`, JSON.stringify(result.stdout));
    check(`help ${label} silent stderr`, result.stderr === "", JSON.stringify(result.stderr));
  }
  // --help is positional: it wins only when reached before the unknown token.
  const early = launcher(["-h", "--wat"]);
  check("help before unknown flag exits 0", early.status === 0, `got ${early.status}`);
  check("help before unknown flag stays silent on stderr", early.stderr === "", JSON.stringify(early.stderr));
  const late = launcher(["--wat", "-h"]);
  check("unknown flag before help still exits 64", late.status === 64, `got ${late.status}`);
  check("late help yields typed USAGE on stderr", late.stderr.startsWith('{"ok":false,"code":"USAGE"'), JSON.stringify(late.stderr));
}

// ── 23. usage — exit 64 with typed USAGE JSON and a plain usage line ───────
say("usage errors — exit 64 with typed JSON and a plain usage line");
{
  expectUsage("no args", launcher([]), "--spec is required");
  expectUsage("plan without --spec", launcher(["plan"]), "--spec is required");
  expectUsage("unknown verb fly", launcher(["fly", "--spec", writeSpec(baseSpec())]), "unknown verb fly");
  expectUsage("unknown flag --wat", launcher(["plan", "--spec", writeSpec(baseSpec()), "--wat"]), "unknown argument --wat");
  expectUsage("--spec final token", launcher(["plan", "--spec"]), "--spec needs a path");
  expectUsage("--mission final token", launcher(["plan", "--spec", writeSpec(baseSpec()), "--mission"]), "--mission needs an id");
  expectUsage("--mission on plan", launcher(["plan", "--spec", writeSpec(baseSpec()), "--mission", "x"]), "--mission only applies to close");
  expectUsage("flag-like verb --json", launcher(["--json"]), "--spec is required");

  // Duplicate --spec: parseArgs reassigns, so the LAST path wins (positive control).
  const first = writeSpec(baseSpec({ fleet: "firstwins" }));
  const second = writeSpec(baseSpec({ fleet: "secondwins" }));
  const dup = launcher(["plan", "--spec", first, "--spec", second, "--json"]);
  if (check("duplicate --spec exit 0", dup.status === 0, `got ${dup.status}; stderr ${dup.stderr.slice(0, 200)}`)) {
    check("duplicate --spec last wins", JSON.parse(dup.stdout).fleet === "secondwins", JSON.parse(dup.stdout).fleet);
    check("duplicate --spec writes nothing", JSON.parse(dup.stdout).writes === false);
  }
}

// ── 24. render fidelity — identity group binds into its template lines ─────
say("render fidelity — identity group binds into its template lines");
{
  const result = launcher(["plan", "--spec", writeSpec(baseSpec({
    fleet: "zqfix",
    missions: [{ id: "zq-alpha", title: "ZQ Title Marker", axis: "zq-axis-marker", goal: "ZQ goal marker 42", scope: ["src/zq"], skills: ["tower"] }],
  })), "--json"]);
  if (check("identity render exit 0", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
    const prompt = JSON.parse(result.stdout).missions[0].prompt;
    check("H1 title line binds mission id + axis", prompt.includes("# Tower fleet L1 — `zq-alpha` · axis `zq-axis-marker`"), "l1-prompt.md:5");
    check("intro prose binds mission id + fleet", prompt.includes("You are the **single L1** of mission `zq-alpha` in fleet `zqfix`: one"), "l1-prompt.md:7");
    check("fleet row binds fleet", prompt.includes("| fleet | `zqfix` |"), "l1-prompt.md:35");
    check("mission row binds mission id + title", prompt.includes("| mission | `zq-alpha` — ZQ Title Marker |"), "l1-prompt.md:36");
    check("axis row binds axis", prompt.includes("| axis | `zq-axis-marker` (the externally visible dimension you own this mission) |"), "l1-prompt.md:37");
    check("goal row binds goal verbatim", prompt.includes("| goal | ZQ goal marker 42 |"), "l1-prompt.md:38");
  }
}

// ── 25. render fidelity — goal text is inserted unescaped ──────────────────
say("render fidelity — goal text is inserted unescaped");
{
  const result = launcher(["plan", "--spec", writeSpec(baseSpec({
    fleet: "zqfix",
    missions: [{ id: "zq-alpha", title: "ZQ Title Marker", axis: "zq-axis-marker", goal: "ZQ |pipe| & <b>goal</b> `tick`", scope: ["src/zq"], skills: ["tower"] }],
  })), "--json"]);
  if (check("unescaped goal exit 0", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
    const prompt = JSON.parse(result.stdout).missions[0].prompt;
    check("goal row keeps raw markdown/HTML bytes", prompt.includes("| goal | ZQ |pipe| & <b>goal</b> `tick` |"), "l1-prompt.md:38");
  }
}

// ── 26. render fidelity — every path placeholder binds to its own line ─────
say("render fidelity — path placeholders bind to their template lines");
{
  const BASE = "zq-base-branch";
  const result = launcher(["plan", "--spec", writeSpec(baseSpec({ base: BASE })), "--json"]);
  if (check("render path exit 0", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(result.stdout);
    check("plan top-level repo", plan.repo === REPO, plan.repo);
    check("plan top-level stateDir", plan.stateDir === STATE_DIR, plan.stateDir);
    check("plan top-level worktreeRoot", plan.worktreeRoot === TREES_DIR, plan.worktreeRoot);
    check("plan top-level base", plan.base === BASE, plan.base);
    const row = plan.missions.find((mission) => mission.id === "tf-alpha");
    if (check("render row tf-alpha", Boolean(row), "mission row")) {
      const worktree = path.join(TREES_DIR, row.id);
      const reportDir = path.join(STATE_DIR, "reports", row.id);
      const validator = path.join(UFO_ROOT, "scripts", "ufo-swarm-wave.mjs");
      const prompt = row.prompt;
      // Content-based: the template's line layout is incidental, so assert the
      // rendered values, never their line numbers.
      check("prompt identity repo", prompt.includes(`| repo | \`${REPO}\` |`), "repo row");
      check("prompt identity worktree", prompt.includes(`| worktree | \`${worktree}\` (your cwd; commit here) |`), "worktree row");
      check("prompt identity base", prompt.includes(`| base | \`${BASE}\` |`), "base row");
      check("prompt identity validator", prompt.includes(`| validator | \`node ${validator}\` (\`plan\` / \`run\` / \`record\`) |`), "validator row");
      check("prompt identity stateDir", prompt.includes(`| state dir | \`${STATE_DIR}\` |`), "state dir row");
      check("prompt identity reportDir", prompt.includes(`| lane reports | \`${reportDir}\` |`), "lane reports row");
      check("prompt recipe project root", prompt.includes(`UFO_PROJECT_ROOT="${STATE_DIR}" \\`), "project root env");
      check("prompt recipe config path", prompt.includes(`UFO_CONFIG_PATH="${path.join(UFO_ROOT, "config", "ufo.json")}" \\`), "config path env");
      check("prompt recipe validator", prompt.includes(`node ${validator} plan --spec <spec.json>`), "validator recipe");
      check("prompt collect step", prompt.includes("5. **Collect.**"), "collect step");
      check("prompt integrate worktree", prompt.includes(`Integrate accepted work yourself in \`${worktree}\``), "integrate prose");
      check("prompt worktree-add repo", prompt.includes(`omp worktree add -C ${REPO} -b`), "worktree-add repo");
    }
  }
}

// ── 27. launch argv shape: wall half, token by token ───────────────────────
say("plan — launch argv wall half is one token per value");
{
  const spaced = "Alpha axis with space";
  const result = launcher(["plan", "--spec", writeSpec(baseSpec({
    missions: [
      { id: "tf-alpha", title: spaced, axis: "argv-shape", goal: "Pin the wall argv.", scope: ["sighting/wall-a"], skills: [] },
      { id: "tf-beta", title: "Beta axis", axis: "argv-shape", goal: "Pin the wall argv.", scope: ["sighting/wall-b"], skills: [] },
    ],
  })), "--json"]);
  if (check("argv plan exit 0", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(result.stdout);
    const byId = new Map(plan.missions.map((row) => [row.id, row]));
    const rows = [byId.get("tf-alpha"), byId.get("tf-beta")];
    check("argv plan has both missions", plan.missions.length === 2 && rows.every(Boolean), String(plan.missions.length));
    check("argv missions have distinct ids/titles/worktrees",
      new Set(rows.map((r) => r.id)).size === 2 && new Set(rows.map((r) => r.title)).size === 2 && new Set(rows.map((r) => r.worktree)).size === 2);
    for (const row of rows) {
      const argv = row.launchArgv;
      const wallHead = [
        "bash",
        path.join(UFO_ROOT, "scripts", "ufo-sighting"),
        "launch",
        "--run-id", row.id,
        "--session-id", row.id,
        "--title", row.title,
        "--fleet", "tftest",
        "--cwd", path.join(TREES_DIR, row.id),
        "--no-open",
        "--relay",
        "--runner-reservation", "1",
      ];
      check(`argv ${row.id} wall half length`, argv.length === wallHead.length + 1 + row.ompArgv.length, `${argv.length}`);
      wallHead.forEach((expected, i) => {
        check(`argv ${row.id} wall[${i}]`, argv[i] === expected, `got ${JSON.stringify(argv[i])} want ${JSON.stringify(expected)}`);
      });
      check(`argv ${row.id} title is one token`, argv[8] === row.title, JSON.stringify(argv[8]));
      const dd = argv.indexOf("--");
      check(`argv ${row.id} '--' occurs exactly once`, dd === wallHead.length && argv.filter((token) => token === "--").length === 1, `indexOf ${dd}`);
      check(`argv ${row.id} '--' immediately precedes omp argv`, argv[dd + 1] === "omp" && argv[dd + 1] === row.ompArgv[0], String(argv[dd + 1]));
      check(`argv ${row.id} after '--' equals ompArgv`, JSON.stringify(argv.slice(dd + 1)) === JSON.stringify(row.ompArgv));
    }
    check("argv spaced title stays a single token",
      byId.get("tf-alpha").launchArgv[8] === spaced && byId.get("tf-alpha").launchArgv.filter((token) => token === spaced).length === 1,
      JSON.stringify(byId.get("tf-alpha").launchArgv[8]));
  }
  // Boundary: a title that IS "--" produces two "--" tokens (the title value and
  // the separator). The argv array stays unambiguous — the value follows --title
  // and the omp tail follows the LAST "--" — so pin the structural reading, not
  // an indexOf("--") split that would mis-split this case.
  {
    const dash = launcher(["plan", "--spec", writeSpec(baseSpec({
      missions: [{ id: "tf-dash", title: "--", axis: "argv-shape", goal: "Pin the separator boundary.", scope: ["sighting/wall-dash"], skills: [] }],
    })), "--json"]);
    if (check("argv dash-title plan exit 0", dash.status === 0, `got ${dash.status}; stderr ${dash.stderr.slice(0, 200)}`)) {
      const row = JSON.parse(dash.stdout).missions[0];
      const argv = row.launchArgv;
      const lastSep = argv.lastIndexOf("--");
      check("argv dash title is the token after --title",
        argv[argv.indexOf("--title") + 1] === "--", JSON.stringify(argv.slice(argv.indexOf("--title"), argv.indexOf("--title") + 2)));
      check("argv dash title leaves two -- tokens and the tail intact",
        argv.filter((token) => token === "--").length === 2
          && lastSep === argv.length - row.ompArgv.length - 1
          && JSON.stringify(argv.slice(lastSep + 1)) === JSON.stringify(row.ompArgv),
        `seps=${argv.filter((token) => token === "--").length} lastSep=${lastSep} len=${argv.length}`);
    }
  }
}

// ── 28. mutation-guard ordering: guard precedes spec load and every wall call ─
say("refusal — mutation-guard ordering (guard precedes spec load and every wall call)");
{
  // Dedicated stub substrate: a fake scripts/ufo-sighting that records its argv, so every
  // wall call is observable and no real substrate is ever reached.
  const STUB_ROOT = path.join(ROOT, "stub-ufoRoot");
  mkdirSync(path.join(STUB_ROOT, "config"), { recursive: true });
  copyFileSync(REAL_CONFIG, path.join(STUB_ROOT, "config", "ufo.json"));
  mkdirSync(path.join(STUB_ROOT, "scripts"), { recursive: true });
  const STUB_LOG = path.join(ROOT, "wall-stub.log");
  writeFileSync(path.join(STUB_ROOT, "scripts", "ufo-sighting"), [
    "#!/usr/bin/env bash",
    `printf '%s\\n' "$*" >> '${STUB_LOG}'`,
    "printf '{\"ok\":true,\"missions\":[]}\\n'",
    "",
  ].join("\n"));
  const stubSpec = (overrides = {}) => baseSpec({ ufoRoot: STUB_ROOT, ...overrides });
  const stubCalls = () => (existsSync(STUB_LOG) ? readFileSync(STUB_LOG, "utf8").split("\n").filter(Boolean) : []);

  // Control: status is non-mutating, so it does reach the wall — proves the stub records argv.
  const control = launcher(["status", "--spec", writeSpec(stubSpec())]);
  check("stub control — non-mutating status reaches the wall", control.status === 0 && stubCalls().join(" ") === "status --lite",
    `exit ${control.status}; log ${JSON.stringify(stubCalls())}`);
  rmSync(STUB_LOG, { force: true });

  const validPath = writeSpec(stubSpec());
  const dupPath = writeSpec(stubSpec({
    missions: [
      { id: "tf-a", title: "A", axis: "a", goal: "a", scope: ["src/a"], skills: [] },
      { id: "tf-a", title: "B", axis: "b", goal: "b", scope: ["src/b"], skills: [] },
    ],
  }));
  const missingPath = path.join(ROOT, "does-not-exist.json");

  // parseArgs ends with the guard, after the verb/flag/--spec/--mission checks and
  // before main() reads the spec: so MUTATION_REQUIRES_APPLY outranks every spec verdict.
  for (const [id, args] of [
    ["launch valid no --apply", ["launch", "--spec", validPath]],
    ["launch duplicate-ids no --apply", ["launch", "--spec", dupPath]],
    ["launch missing-spec no --apply", ["launch", "--spec", missingPath]],
    ["close --mission bogus no --apply", ["close", "--spec", validPath, "--mission", "bogus"]],
  ]) {
    const result = launcher(args);
    expectTyped(id, result, "MUTATION_REQUIRES_APPLY");
    check(`${id} — no wall call`, stubCalls().length === 0, stubCalls().join(" | "));
    check(`${id} — state dir untouched`, !existsSync(STATE_DIR) && readdirSafe(STATE_DIR).length === 0);
    check(`${id} — worktree root untouched`, !existsSync(TREES_DIR) && readdirSafe(TREES_DIR).length === 0);
  }
  // Usage verdicts (exit 64, first stderr line {ok:false,code:"USAGE"}) outrank the guard:
  // typedError() cannot read them — it takes the LAST stderr line, the usage banner.
  for (const [id, args] of [
    ["unknown verb with --apply", ["fly", "--apply", "--spec", validPath]],
    ["unknown verb without --apply", ["fly", "--spec", validPath]],
    ["--mission on launch without --apply", ["launch", "--spec", validPath, "--mission", "tf-alpha"]],
    ["bare launch (missing --spec)", ["launch"]],
  ]) {
    const result = launcher(args);
    check(`${id} exits 64`, result.status === 64, `got ${result.status}; stderr ${JSON.stringify(result.stderr.slice(0, 200))}`);
    let payload = null;
    try { payload = JSON.parse(result.stderr.trim().split("\n")[0]); } catch { /* usage banner is not JSON */ }
    check(`${id} carries USAGE payload`, payload?.ok === false && payload.code === "USAGE", `stderr ${JSON.stringify(result.stderr.slice(0, 120))}`);
  }
  check("usage refusals never touch the wall", stubCalls().length === 0, stubCalls().join(" | "));

  // With --apply the guard is gone, so spec validation is the refusing voice — still no wall call.
  expectTyped("launch --apply missing spec", launcher(["launch", "--apply", "--spec", missingPath]), "INVALID_SPEC");
  expectTyped("launch --apply duplicate ids", launcher(["launch", "--apply", "--spec", dupPath]), "INVALID_SPEC");
  expectTyped("close --apply --mission bogus", launcher(["close", "--apply", "--spec", validPath, "--mission", "bogus"]), "UNKNOWN_MISSION");
  check("--apply refusals never touch the wall", stubCalls().length === 0, stubCalls().join(" | "));
  check("every refusal left stateDir/worktreeRoot absent", !existsSync(STATE_DIR) && !existsSync(TREES_DIR));
}

// ── 29. band authority integrity: fail-closed on a corrupt config ──────────
say("refusal — config band integrity");
{
  // Each case copies the fixture authority into its own temp ufoRoot with one
  // band number broken. loadBandAuthority runs in main() before loadSpec, so
  // every case must fail closed: exit 2, CONFIG_UNREADABLE, an exact message
  // naming the offending key, no stdout, and no stateDir/worktreeRoot.
  const bandCases = [
    {
      id: "missing waveMaxLanes",
      slug: "drop-wave-max",
      mutate: (c) => { delete c.sighting.dispatch.swarm.waveMaxLanes; },
      message: (configPath) => `${configPath} is missing sighting.dispatch.swarm.waveMaxLanes`,
    },
    {
      id: "missing waveMinLanes",
      slug: "drop-wave-min",
      mutate: (c) => { delete c.sighting.dispatch.swarm.waveMinLanes; },
      message: (configPath) => `${configPath} is missing sighting.dispatch.swarm.waveMinLanes`,
    },
    {
      id: "inverted band",
      slug: "inverted-band",
      mutate: (c) => { c.sighting.dispatch.swarm.waveMinLanes = 40; c.sighting.dispatch.swarm.waveMaxLanes = 32; },
      message: () => "swarm band is impossible: waveMinLanes 40 > waveMaxLanes 32",
    },
    {
      id: "waveMinLanes zero",
      slug: "wave-min-zero",
      mutate: (c) => { c.sighting.dispatch.swarm.waveMinLanes = 0; },
      message: () => "sighting.dispatch.swarm.waveMinLanes must be a positive integer, got 0",
    },
    {
      id: "waveMinLanes fraction",
      slug: "wave-min-fraction",
      mutate: (c) => { c.sighting.dispatch.swarm.waveMinLanes = 2.5; },
      message: () => "sighting.dispatch.swarm.waveMinLanes must be a positive integer, got 2.5",
    },
    {
      id: "waveMinLanes string",
      slug: "wave-min-string",
      mutate: (c) => { c.sighting.dispatch.swarm.waveMinLanes = "16"; },
      message: () => 'sighting.dispatch.swarm.waveMinLanes must be a positive integer, got "16"',
    },
    {
      id: "maxLanes zero",
      slug: "max-lanes-zero",
      mutate: (c) => { c.sighting.dispatch.swarm.maxLanes = 0; },
      message: () => "sighting.dispatch.swarm.maxLanes must be a positive integer, got 0",
    },
  ];
  for (const { id, slug, mutate, message } of bandCases) {
    const ufoRoot = path.join(ROOT, `band-${slug}`);
    mkdirSync(path.join(ufoRoot, "config"), { recursive: true });
    const authority = JSON.parse(readFileSync(path.join(UFO_ROOT, "config", "ufo.json"), "utf8"));
    mutate(authority);
    const configPath = path.join(ufoRoot, "config", "ufo.json");
    writeFileSync(configPath, JSON.stringify(authority, null, 1) + "\n");
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({
      ufoRoot,
      stateDir: path.join(ufoRoot, "state"),
      worktreeRoot: path.join(ufoRoot, "trees"),
    }))]);
    expectTyped(`band ${id}`, result, "CONFIG_UNREADABLE");
    const payload = typedError(result);
    check(`band ${id} message exact`, payload !== null && payload.message === message(configPath), `got ${JSON.stringify(payload && payload.message)}`);
    check(`band ${id} plan stdout empty`, result.stdout === "", `stdout ${JSON.stringify(result.stdout.slice(0, 120))}`);
    check(`band ${id} refused with zero mutation`, !existsSync(path.join(ufoRoot, "state")) && !existsSync(path.join(ufoRoot, "trees")),
      "band refusal must create neither stateDir nor worktreeRoot");
  }
  // Fail-closed precedence: band integrity outranks spec validation — an
  // impossible band plus an invalid fleet name still lands on CONFIG_UNREADABLE.
  {
    const ufoRoot = path.join(ROOT, "band-precedence");
    mkdirSync(path.join(ufoRoot, "config"), { recursive: true });
    const authority = JSON.parse(readFileSync(path.join(UFO_ROOT, "config", "ufo.json"), "utf8"));
    authority.sighting.dispatch.swarm.waveMinLanes = 40;
    authority.sighting.dispatch.swarm.waveMaxLanes = 32;
    writeFileSync(path.join(ufoRoot, "config", "ufo.json"), JSON.stringify(authority, null, 1) + "\n");
    expectTyped("band beats spec validation", launcher(["plan", "--spec", writeSpec(baseSpec({
      fleet: "Bad_Fleet!",
      ufoRoot,
      stateDir: path.join(ufoRoot, "state"),
      worktreeRoot: path.join(ufoRoot, "trees"),
    }))]), "CONFIG_UNREADABLE");
  }
  check("shared fixture intact", launcher(["plan", "--spec", writeSpec(baseSpec())]).status === 0, "band battery must not corrupt the shared UFO_ROOT");
}

// ── 30. band numbers are read live from <ufoRoot>/config/ufo.json ──────────
say("plan — band numbers mirror the patched fixture authority");
{
  // Distinctive numbers, all different from the substrate's real band, so a
  // launcher carrying a hardcoded band cannot satisfy this block (proven by
  // mutation: hardcoding renderPrompt's or verbPlan's band fails these checks).
  const liveRoot = configRoot((liveCfg) => {
    liveCfg.sighting.windowPaneCeiling = 12;
    liveCfg.sighting.dispatch.maxConcurrentL1 = 11;
    liveCfg.sighting.dispatch.swarm.waveMinLanes = 21;
    liveCfg.sighting.dispatch.swarm.waveMaxLanes = 29;
    liveCfg.sighting.dispatch.swarm.maxLanes = 47;
    liveCfg.sighting.dispatch.missionFormat.l1Alias = "m_probe";
  });
  const result = launcher(["plan", "--spec", writeSpec(specAt(liveRoot, { roundCeiling: 5 })), "--json"]);
  if (check("live-band plan exit 0", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(result.stdout);
    check("live-band plan mirrors every patched band field",
      plan.band.waveMin === 21 && plan.band.waveMax === 29 && plan.band.roundLaneCeiling === 47
        && plan.band.maxConcurrentL1 === 11 && plan.band.windowPaneCeiling === 12 && plan.band.l1Alias === "m_probe",
      JSON.stringify(plan.band));
    check("live-band plan echoes spec roundCeiling", plan.roundCeiling === 5, String(plan.roundCeiling));
    for (const row of plan.missions) {
      const bandLine = row.prompt.split("\n").find((line) => line.includes("| wave band |"));
      const ceilingLine = row.prompt.split("\n").find((line) => line.includes("| round ceiling |"));
      check(`live-band ${row.id} prompt wave band line`, bandLine === "| wave band | 21–29 lanes per wave |", bandLine);
      check(`live-band ${row.id} prompt round ceiling line`, ceilingLine === "| round ceiling | 47 lanes per round; 5 rounds |", ceilingLine);
      check(`live-band ${row.id} prompt carries no stock number`,
        !row.prompt.includes("16–32 lanes") && !row.prompt.includes("100 lanes per round"), `${bandLine} / ${ceilingLine}`);
      check(`live-band ${row.id} omp model alias`, row.ompArgv[row.ompArgv.indexOf("--model") + 1] === "@m_probe",
        row.ompArgv[row.ompArgv.indexOf("--model") + 1]);
    }
  }
}

// ── 31. band authority: config/ufo.json missing or broken ──────────────────
say("refusal — band authority unreadable, no silent fallback");
{
  const badCfg = mkdtempSync(path.join(tmpdir(), "tower-fleet-badcfg-"));
  try {
    const cases = [
      ["missing file", "missing", null, "read"],
      ["broken json", "corrupt", "{ not json ]]]", "read"],
      ["no sighting.dispatch", "nodisp", JSON.stringify({ sighting: { windowPaneCeiling: BAND.windowPaneCeiling } }), "shape"],
    ];
    for (const [label, dir, content, mode] of cases) {
      const root = path.join(badCfg, dir);
      mkdirSync(path.join(root, "config"), { recursive: true });
      if (content !== null) writeFileSync(path.join(root, "config", "ufo.json"), content);
      const configPath = path.join(root, "config", "ufo.json");
      const result = launcher(["plan", "--json", "--spec", writeSpec(baseSpec({ ufoRoot: root }))]);
      expectTyped(`config ${label}`, result, "CONFIG_UNREADABLE");
      check(`config ${label} emits no plan on stdout`, result.stdout === "", `stdout was ${JSON.stringify(result.stdout.slice(0, 160))}`);
      const payload = typedError(result);
      if (!payload) continue;
      check(`config ${label} message cites authority path`, payload.message.includes(configPath), JSON.stringify(payload.message));
      if (mode === "read") {
        check(`config ${label} message classifies as read failure`,
          payload.message.startsWith(`cannot read band authority ${configPath}: `), JSON.stringify(payload.message));
      } else {
        check(`config ${label} names the first missing authority field`,
          payload.message === `${configPath} is missing sighting.dispatch.maxConcurrentL1`, JSON.stringify(payload.message));
      }
    }
    // The authority read gates everything — a spec that would fail loadSpec later
    // is still refused as CONFIG_UNREADABLE, so no default band can leak through.
    const precedeSpec = writeSpec(baseSpec({ ufoRoot: path.join(badCfg, "missing"), fleet: "BAD FLEET!!" }));
    expectTyped("config refusal precedes spec validation", launcher(["plan", "--json", "--spec", precedeSpec]), "CONFIG_UNREADABLE");
  } finally {
    rmSync(badCfg, { recursive: true, force: true });
  }
}

// ── 32. render: template placeholder ledger ────────────────────────────────
say("render — every {{placeholder}} in l1-prompt.md is bound to its spec/authority value");
{
  const spec = baseSpec();
  const result = launcher(["plan", "--spec", writeSpec(spec), "--json"]);
  if (check("ledger plan exit 0", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
    const plan = JSON.parse(result.stdout);
    const template = readFileSync(path.join(REPO_ROOT, "sighting", "l1-prompt.md"), "utf8");
    const names = [...new Set((template.match(/\{\{([A-Za-z]+)\}\}/g) || []).map((token) => token.slice(2, -2)))].sort();
    // Ledger pin: adding/renaming a template placeholder must update this list.
    const LEDGER = ["axis", "base", "fleet", "goal", "missionId", "repo", "reportDir", "roundCeiling",
      "roundLaneCeiling", "scope", "stateDir", "title", "ufoRoot", "validator", "waveMax", "waveMin", "worktree"];
    check("template ledger exact", names.join(",") === LEDGER.join(","), names.join(","));
    check("l1Alias has no template placeholder", !names.includes("l1Alias"),
      "l1Alias is bound in renderPrompt but consumed only by launchArgv/band; {{l1Alias}} would be a new contract surface");
    for (const mission of spec.missions) {
      const row = plan.missions.find((entry) => entry.id === mission.id);
      if (!check(`ledger ${mission.id} row present`, row !== undefined, row ? row.id : String(row))) continue;
      // Reconstruct independently what renderPrompt MUST emit: template × (spec ∘ authority).
      const want = template.replace(/\{\{([A-Za-z]+)\}\}/g, (_match, key) => ({
        fleet: spec.fleet, missionId: mission.id, title: mission.title, axis: mission.axis,
        goal: mission.goal, scope: mission.scope.join(", "), repo: REPO,
        worktree: path.join(TREES_DIR, mission.id), base: spec.base, ufoRoot: UFO_ROOT,
        waveMin: String(BAND.waveMin), waveMax: String(BAND.waveMax),
        roundLaneCeiling: String(BAND.maxLanes), roundCeiling: String(spec.roundCeiling),
        stateDir: STATE_DIR, reportDir: path.join(STATE_DIR, "reports", mission.id),
        validator: path.join(UFO_ROOT, "scripts", "ufo-swarm-wave.mjs"),
      })[key]);
      const gotLines = row.prompt.split("\n");
      const wantLines = want.split("\n");
      const firstDiff = gotLines.findIndex((line, i) => line !== wantLines[i]);
      check(`render ${mission.id} prompt equals template×values`, row.prompt === want,
        firstDiff === -1 ? "line-by-line identical" : `first differing line: ${firstDiff}`);
      check(`render ${mission.id} prompt leaks no braces`, !row.prompt.includes("{{"), "zero literal {{ in rendered prompt");
    }
  }
}

// ── 33. no-write proof: recursive snapshot around every plan shape ─────────
say("plan — recursive snapshot proves no writes (json/human/bare/refused, against a shelling status)");
{
  // Stub wall CLI: logs argv OUTSIDE the snapshotted roots, prints a JSON body.
  const LOG_DIR = mkdtempSync(path.join(tmpdir(), "tower-fleet-stub-"));
  const STUB_LOG = path.join(LOG_DIR, "argv.log");
  stubWall(UFO_ROOT, STUB_LOG);
  const STUB = path.join(UFO_ROOT, "scripts", "ufo-sighting");

  const okSpec = writeSpec(baseSpec());
  const refusedSpec = writeSpec(baseSpec({ missions: missionsOf(BAND.maxConcurrentL1 + 1) }));

  const roots = [...new Set([ROOT, REPO, UFO_ROOT, path.dirname(STATE_DIR), path.dirname(TREES_DIR)])];
  const before = roots.map((root) => snapshotTree(root));

  const planJson = launcher(["plan", "--spec", okSpec, "--json"]);
  const planHuman = launcher(["plan", "--spec", okSpec]);
  const barePlan = launcher(["--spec", okSpec, "--json"]);
  const refusedPlan = launcher(["plan", "--spec", refusedSpec]);
  check("snapshot: plan never shelled out to the wall", !existsSync(STUB_LOG),
    existsSync(STUB_LOG) ? JSON.stringify(readFileSync(STUB_LOG, "utf8")) : "");
  const status = launcher(["status", "--spec", okSpec, "--json"]);

  const drifted = roots.filter((root, i) => before[i] !== snapshotTree(root)).map((root) => path.relative(ROOT, root) || ".");

  check("snapshot: plan/plan/bare exit 0", planJson.status === 0 && planHuman.status === 0 && barePlan.status === 0,
    `${planJson.status}/${planHuman.status}/${barePlan.status}`);
  check("snapshot: refused plan exits 2 at the L1 ceiling", refusedPlan.status === 2, String(refusedPlan.status));
  check("snapshot: every tree byte-identical after plan/plan/bare/refused/status", drifted.length === 0, `drifted: ${drifted.join(", ")}`);
  check("snapshot: stateDir never appears", !existsSync(STATE_DIR));
  check("snapshot: worktreeRoot never appears", !existsSync(TREES_DIR));
  check("snapshot: status did shell out to the wall", status.status === 0 && existsSync(STUB_LOG)
    && readFileSync(STUB_LOG, "utf8").trim() === "status --lite",
    `exit ${status.status}; log ${existsSync(STUB_LOG) ? JSON.stringify(readFileSync(STUB_LOG, "utf8")) : "absent"}`);

  rmSync(STUB, { force: true });
  rmSync(LOG_DIR, { recursive: true, force: true });
}

// ── 34. band authority: l1Alias and windowPaneCeiling parse gates ──────────
say("refusal — band authority: l1Alias and windowPaneCeiling");
{
  // NOTE (launcher finding, not pinned): loadBandAuthority:132 stringifies the alias
  // with String() and no typeof gate, so a JSON number/boolean/array alias is
  // accepted and routed into `--model @<coerced>` (e.g. `@42`). The tests below
  // pin the documented token gate for STRING aliases and the strict numeric gate
  // for the pane ceiling; the coercion laxness is recorded in the round receipt.
  const aliasRoot = (value) => configRoot((c) => { c.sighting.dispatch.missionFormat.l1Alias = value; });
  const ceilingRoot = (value) => configRoot((c) => { c.sighting.windowPaneCeiling = value; });
  let result;

  // Token gate: /^[A-Za-z0-9_.:-]+$/ on the alias.
  result = launcher(["plan", "--json", "--spec", writeSpec(specAt(aliasRoot("bad alias!")))]);
  expectTyped("authority unsafe alias", result, "CONFIG_UNREADABLE");
  check("authority unsafe alias message",
    typedError(result)?.message === "l1Alias bad alias! is not a safe alias token", typedError(result)?.message);

  result = launcher(["plan", "--json", "--spec", writeSpec(specAt(aliasRoot("")))]);
  expectTyped("authority empty alias", result, "CONFIG_UNREADABLE");
  // The message interpolates the raw value, so "" renders as a double space.
  check("authority empty alias message",
    typedError(result)?.message === "l1Alias  is not a safe alias token", JSON.stringify(typedError(result)?.message));

  // need() gate: a missing missionFormat names the field AND the fixture path.
  let root = configRoot((c) => { delete c.sighting.dispatch.missionFormat; });
  result = launcher(["plan", "--json", "--spec", writeSpec(specAt(root))]);
  expectTyped("authority missionFormat missing", result, "CONFIG_UNREADABLE");
  check("authority missionFormat missing message",
    typedError(result)?.message === `${path.join(root, "config", "ufo.json")} is missing sighting.dispatch.missionFormat.l1Alias`,
    typedError(result)?.message);

  // intOf gate: a safe positive integer only, with NO string coercion — the exact
  // contrast to the alias field above.
  result = launcher(["plan", "--json", "--spec", writeSpec(specAt(ceilingRoot(0)))]);
  expectTyped("authority zero ceiling", result, "CONFIG_UNREADABLE");
  check("authority zero ceiling message",
    typedError(result)?.message === "sighting.windowPaneCeiling must be a positive integer, got 0", typedError(result)?.message);

  result = launcher(["plan", "--json", "--spec", writeSpec(specAt(ceilingRoot("16")))]);
  expectTyped("authority string ceiling", result, "CONFIG_UNREADABLE");
  check("authority string ceiling message",
    typedError(result)?.message === 'sighting.windowPaneCeiling must be a positive integer, got "16"', typedError(result)?.message);

  root = ceilingRoot(undefined); // JSON.stringify drops undefined keys -> field absent
  result = launcher(["plan", "--json", "--spec", writeSpec(specAt(root))]);
  expectTyped("authority ceiling missing", result, "CONFIG_UNREADABLE");
  check("authority ceiling missing message",
    typedError(result)?.message === `${path.join(root, "config", "ufo.json")} is missing sighting.windowPaneCeiling`,
    typedError(result)?.message);

  // Precedence: parseArgs -> raw spec read + ufoRoot gate -> loadBandAuthority ->
  // loadSpec. A broken authority fires BEFORE spec validation and gates read-only
  // verbs too, but an unparseable spec masks it (the raw read runs first).
  const maskRoot = aliasRoot("bad alias!");
  result = launcher(["plan", "--json", "--spec", writeSpec(specAt(maskRoot, { fleet: "Bad_Fleet!" }))]);
  expectTyped("authority precedes spec validation", result, "CONFIG_UNREADABLE");
  check("authority precedes: unsafe alias message wins",
    typedError(result)?.message === "l1Alias bad alias! is not a safe alias token", typedError(result)?.message);
  result = launcher(["status", "--json", "--spec", writeSpec(specAt(maskRoot))]);
  expectTyped("authority gates read-only verbs", result, "CONFIG_UNREADABLE");
  const garbage = path.join(ROOT, "spec-authority-garbage.json");
  writeFileSync(garbage, "{not json");
  result = launcher(["plan", "--json", "--spec", garbage]);
  expectTyped("unparseable spec precedes authority", result, "INVALID_SPEC");
  check("unparseable spec masks broken authority",
    String(typedError(result)?.message).startsWith("cannot read fleet spec"), typedError(result)?.message);
}

// ── 35. interactive guard — the omp argv stays interactive ─────────────────
say("interactive — omp argv guard: shape, injection surface, alias regex precedence");
{
  const forbiddenTokens = (argv) => argv.filter((token) => token === "-p" || token === "--print" || token === "--mode" || token.startsWith("--mode="));
  const assertInteractive = (id, argv) => {
    check(`interactive ${id} no -p/--print/--mode tokens`, forbiddenTokens(argv).length === 0, forbiddenTokens(argv).join(" "));
    check(`interactive ${id} --model present, guard does not misread it`,
      argv.includes("--model") && argv[argv.indexOf("--model") + 1] === `@${BAND.l1Alias}`
      && argv.filter((token) => token.startsWith("--mod")).every((token) => token === "--model"),
      `mod tokens ${JSON.stringify(argv.filter((token) => token.startsWith("--mod")))}`);
    check(`interactive ${id} --print-thoughts survives exact-match guard`, argv.includes("--print-thoughts"));
  };
  const mk = (id, title, scope) => ({ id, title, axis: "argv-shape", goal: `guard probe ${id}`, scope: [scope], skills: [] });

  // Three specs, two missions each, distinct ids/titles/maxTime; hostile flag text inside titles.
  for (const v of [
    { maxTime: "90m", missions: [mk("ig-alpha", "Alpha axis", "src/alpha"), mk("ig-beta", "Beta -p axis", "src/beta")] },
    { maxTime: "1h+30m", missions: [mk("ig-gamma", "Gamma: --print", "src/gamma"), mk("ig-delta", "Delta --mode=rpc", "src/delta")] },
    { maxTime: "2:00", missions: [mk("ig-eps", "Epsilon", "src/eps"), mk("ig-zeta", "Zeta -p inside --model talk", "src/zeta")] },
  ]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ maxTime: v.maxTime, missions: v.missions })), "--json"]);
    if (check(`interactive plan ${v.maxTime} exit 0`, result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
      for (const row of JSON.parse(result.stdout).missions) assertInteractive(`${v.maxTime}/${row.id}`, row.ompArgv);
    }
  }
  // A maxTime forged from a forbidden flag is refused upstream of the guard.
  for (const smuggle of ["-p", "--print", "--mode", "--mode=rpc"]) {
    expectTyped(`maxTime smuggle ${smuggle}`,
      launcher(["plan", "--spec", writeSpec(baseSpec({ maxTime: smuggle, missions: [mk("ig-bad", "B", "src/bad")] }))]),
      "INVALID_SPEC");
  }
  // A maxTime merely CONTAINING flag text passes as ONE --max-time value token.
  for (const embedded of ["x-p", "x--print"]) {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ maxTime: embedded, missions: [mk("ig-emb", "E", "src/emb")] })), "--json"]);
    if (check(`maxTime embedded ${embedded} accepted`, result.status === 0, `got ${result.status}`)) {
      const argv = JSON.parse(result.stdout).missions[0].ompArgv;
      check(`maxTime embedded ${embedded} is a single value token`,
        argv[argv.indexOf("--max-time") + 1] === embedded && forbiddenTokens(argv).length === 0, JSON.stringify(argv));
    }
  }
  // Mission ids can never be flags; a hostile title reaches only the wall argv
  // (--title <one token> before `--`), never the guarded omp argv.
  expectTyped("mission id -p", launcher(["plan", "--spec", writeSpec(baseSpec({ missions: [mk("-p", "I", "src/id")] }))]), "INVALID_SPEC");
  {
    const result = launcher(["plan", "--spec", writeSpec(baseSpec({ missions: [mk("ig-title", "--print --mode x", "src/title")] })), "--json"]);
    if (check("hostile title plans", result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
      const row = JSON.parse(result.stdout).missions[0];
      assertInteractive(`title ${row.id}`, row.ompArgv);
      const ti = row.launchArgv.indexOf("--title");
      check("hostile title is one wall token before --",
        row.launchArgv[ti + 1] === "--print --mode x" && !row.ompArgv.includes("--print --mode x"),
        JSON.stringify(row.launchArgv.slice(ti, ti + 2)));
    }
  }
  // Config-injected aliases: the authority regex refuses `=` and `/` forms before
  // the guard runs; `-`-leading aliases survive the regex but land as `@<alias>`,
  // so they can never equal the guard's exact tokens.
  {
    const aliasRoot = mkdtempSync(path.join(ROOT, "alias-"));
    mkdirSync(path.join(aliasRoot, "config"), { recursive: true });
    const cfgDoc = JSON.parse(readFileSync(path.join(UFO_ROOT, "config", "ufo.json"), "utf8"));
    const planWithAlias = (alias) => {
      cfgDoc.sighting.dispatch.missionFormat.l1Alias = alias;
      writeFileSync(path.join(aliasRoot, "config", "ufo.json"), JSON.stringify(cfgDoc));
      return launcher(["plan", "--spec", writeSpec(baseSpec({ ufoRoot: aliasRoot, missions: [mk("ig-alias", "A", "src/alias")] })), "--json"]);
    };
    for (const blocked of ["--mode=rpc", "x/-p"]) {
      expectTyped(`alias ${blocked} rejected by regex`, planWithAlias(blocked), "CONFIG_UNREADABLE");
    }
    for (const prefixable of ["-p", "--print", "--mode"]) {
      const result = planWithAlias(prefixable);
      if (check(`alias ${prefixable} plans via @-prefix`, result.status === 0, `got ${result.status}; stderr ${result.stderr.slice(0, 200)}`)) {
        const argv = JSON.parse(result.stdout).missions[0].ompArgv;
        check(`alias ${prefixable} neutralized to @${prefixable}`,
          argv[argv.indexOf("--model") + 1] === `@${prefixable}` && forbiddenTokens(argv).length === 0, JSON.stringify(argv));
      }
    }
  }
}

// ── 36. wall isolation — no check can reach the real wall or tmux ──────────
say("isolation — shell-outs are spec-derived; the stub wall is the only spawn");
{
  const ISO = path.join(ROOT, "iso");
  const isoUfo = path.join(ISO, "ufoRoot");
  mkdirSync(path.join(isoUfo, "config"), { recursive: true });
  mkdirSync(path.join(isoUfo, "scripts"), { recursive: true });
  copyFileSync(REAL_CONFIG, path.join(isoUfo, "config", "ufo.json"));
  const isoCli = path.join(isoUfo, "scripts", "ufo-sighting");
  const argvLog = path.join(ISO, "wall-argv.log");
  // The launcher always spawns `bash <spec.ufoRoot>/scripts/ufo-sighting`, so the
  // stub needs no exec bit. It records the script path bash resolved ($0) plus
  // every argv token, then prints the minimal JSON body status accepts.
  writeFileSync(isoCli, [
    "#!/usr/bin/env bash",
    "{",
    '  echo "SCRIPT=$0"',
    '  for a in "$@"; do echo "ARG=$a"; done',
    '  echo "END"',
    `} >> '${argvLog}'`,
    "printf '{\"ok\":true,\"status\":\"present\",\"missions\":[]}'",
  ].join("\n"));
  const wallBlocks = () => (existsSync(argvLog) ? readFileSync(argvLog, "utf8").split("END\n").filter((block) => block.trim() !== "") : []);
  const tokensOf = (block) => block.split("\n").filter((line) => line.startsWith("ARG=")).map((line) => line.slice(4));
  const realCli = path.join(SUBSTRATE, "scripts", "ufo-sighting");

  // plan must never open the wall at all.
  const isoSpec = writeSpec(baseSpec({ ufoRoot: isoUfo }));
  const plan = launcher(["plan", "--spec", isoSpec, "--json"]);
  check("isolation: plan exit 0", plan.status === 0, `got ${plan.status}; stderr ${plan.stderr.slice(0, 200)}`);
  check("isolation: plan spawns the wall zero times", wallBlocks().length === 0, `log blocks=${wallBlocks().length}`);
  if (plan.status === 0) {
    const planJson = JSON.parse(plan.stdout);
    check("isolation: launchArgv is bash + spec-derived temp CLI",
      planJson.missions.every((row) => row.launchArgv[0] === "bash" && row.launchArgv[1] === isoCli),
      planJson.missions[0].launchArgv.slice(0, 3).join(" "));
    check("isolation: plan output never names the real substrate", !plan.stdout.includes(SUBSTRATE), plan.stdout.slice(0, 160));
  }
  // status must spawn the temp stub with the status subcommand.
  const status = launcher(["status", "--spec", isoSpec, "--json"]);
  check("isolation: status exit 0", status.status === 0, `got ${status.status}; stderr ${status.stderr.slice(0, 200)}`);
  const afterStatus = wallBlocks();
  check("isolation: status spawned the wall exactly once", afterStatus.length === 1, `blocks=${afterStatus.length}`);
  if (afterStatus.length === 1) {
    check("isolation: status spawned via the temp ufoRoot", afterStatus[0].startsWith(`SCRIPT=${isoCli}`), afterStatus[0].split("\n")[0]);
    check("isolation: status argv is [status --lite]", tokensOf(afterStatus[0]).join(" ") === "status --lite", tokensOf(afterStatus[0]).join(" "));
  }
  // close --apply must complete each mission against the same temp stub.
  const close = launcher(["close", "--spec", isoSpec, "--apply", "--force", "--json"]);
  check("isolation: close --apply exit 0", close.status === 0, `got ${close.status}; stderr ${close.stderr.slice(0, 200)}`);
  const allBlocks = wallBlocks();
  check("isolation: close reads wall registry and skips missions absent from it",
    allBlocks.length === 2 && allBlocks.every((block) => tokensOf(block).join(" ") === "status --lite"),
    `blocks=${allBlocks.length}; argv=${allBlocks.map((block) => tokensOf(block).join(" ")).join(" | ")}`);
  check("isolation: every spawn was the temp stub", allBlocks.every((block) => block.startsWith(`SCRIPT=${isoCli}`)),
    allBlocks.map((block) => block.split("\n")[0]).join("; "));
  const logText = existsSync(argvLog) ? readFileSync(argvLog, "utf8") : "";
  check("isolation: the real wall CLI is never spawned", !logText.includes(realCli), `hits=${logText.split(realCli).length - 1}`);
  check("isolation: no spawn ever names tmux", !logText.includes("tmux"), "argv log scanned");
  check("isolation: status/close wrote no fleet state", !existsSync(STATE_DIR) && !existsSync(TREES_DIR),
    `stateDir=${existsSync(STATE_DIR)} worktreeRoot=${existsSync(TREES_DIR)}`);
}

// ── finish ──────────────────────────────────────────────────────────────────
say(failures === 0 ? "ALL CHECKS PASS" : `FAILURES ${failures}`);
finish(failures === 0 ? 0 : 1);
