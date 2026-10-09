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
 *   2. plan writes nothing (stateDir and worktreeRoot stay empty).
 *   3. default verb is plan.
 *   4. > maxConcurrentL1 missions refused (L1_CEILING_EXCEEDED).
 *   5. overlapping scopes refused (SCOPE_OVERLAP); component-adjacent but
 *      disjoint scopes ("src/core" vs "src/correction") accepted.
 *   6. bad fleet name and duplicate mission ids refused.
 *   7. launch/close without --apply refused (MUTATION_REQUIRES_APPLY).
 *   8. usage errors: missing --spec, unknown verb → exit 64.
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

// ── 4. ceilings ─────────────────────────────────────────────────────────────
say("refusal — L1 ceiling");
{
  const missions = Array.from({ length: BAND.maxConcurrentL1 + 1 }, (_, i) => ({
    id: `m${i + 1}`,
    title: `Mission ${i + 1}`,
    axis: `axis-${i + 1}`,
    goal: `goal ${i + 1}`,
    scope: [`src/mission-${i + 1}`],
    skills: [],
  }));
  expectTyped("L1 ceiling", launcher(["plan", "--spec", writeSpec(baseSpec({ missions }))]), "L1_CEILING_EXCEEDED");
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

// ── 6. identity validation ──────────────────────────────────────────────────
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

// ── 7. mutation guard ───────────────────────────────────────────────────────
say("refusal — mutation without --apply");
{
  const specPath = writeSpec(baseSpec());
  expectTyped("launch without --apply", launcher(["launch", "--spec", specPath]), "MUTATION_REQUIRES_APPLY");
  expectTyped("close without --apply", launcher(["close", "--spec", specPath]), "MUTATION_REQUIRES_APPLY");
  check("guard refused before any wall touch", !existsSync(STATE_DIR), "refusal must not create the state dir");
}

// ── 8. usage ────────────────────────────────────────────────────────────────
say("usage errors — exit 64");
{
  check("missing --spec", launcher(["plan"]).status === 64, String(launcher(["plan"]).status));
  check("unknown verb", launcher(["fly", "--spec", writeSpec(baseSpec())]).status === 64);
  check("unknown flag", launcher(["plan", "--spec", writeSpec(baseSpec()), "--wat"]).status === 64);
}

// ── finish ──────────────────────────────────────────────────────────────────
say(failures === 0 ? "ALL CHECKS PASS" : `FAILURES ${failures}`);
finish(failures === 0 ? 0 : 1);
