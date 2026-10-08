#!/usr/bin/env node
/**
 * run-wave-test — the automated half of the ufo-sighting 32-lane wave smoke
 * test. It proves every claim the live procedure in test/sighting-wave-smoke.md
 * makes about the wave planner, then STOPS at the dispatch boundary and prints
 * the exact step the operator executes by hand.
 *
 * This script never dispatches a wave. There is no flag that makes it dispatch:
 * the one batched OMP `task` call is the model-burning step, and it is issued
 * deliberately by the operator after reading the printed payload path.
 *
 * What it does, in order:
 *   1. preflight   node, tmux, the ufo-fsd-alpha checkout, and `node
 *                  host/apply.mjs` (dry run) exiting 0. The apply gate is
 *                  hard: no verified candidate config, no test. Then the
 *                  authorities: the checkout's own planner module and the seat
 *                  → @alias table resolved from the candidate global config, so
 *                  every role claim below is the repo's resolution, not a
 *                  restated table.
 *   2. band        resolve the swarm band authority — a synthesized post-apply
 *                  fixture config (`--band fixture`, the default, works before
 *                  the apply has landed) or the real config/ufo.json (`--band
 *                  live`, refuses with apply_not_landed while the floor is
 *                  still 16).
 *   3. spec        build the 32-lane wave spec: pairwise-distinct prompts,
 *                  explicit taxonomy roles spread over two route families.
 *   4. plan        `ufo-swarm-wave.mjs plan` — exit 0, band, counts, roles.
 *   5. run         `ufo-swarm-wave.mjs run` — the ufo-swarm-wave-dispatch-v1
 *                  payload: 32 spawn lanes, no per-lane model param,
 *                  /skill:godspeed as the leading line of every spawned task,
 *                  registry persisted on disk.
 *   6. negatives   16 and 31 lanes refused too_few_lanes; 101 refused
 *                  too_many_lanes; a resume-only wave admitted below the floor
 *                  (floor-exempt) and carrying no godspeed invocation; the
 *                  refusal vocabulary (duplicate_expansion, role_required,
 *                  unknown_role, impossible_band, resume_unknown_member,
 *                  resume_role_forbidden); an all-m_fast wave flagged
 *                  singleFamily while the mixed wave is not.
 *   7. wall        with --live-wall only: open the operator wall and capture
 *                  status --lite / overview / surface --json. Without it the
 *                  wall commands are printed, never run — a dry invocation
 *                  touches the live tmux server only to ask whether the session
 *                  exists.
 *   8. boundary    print the dispatch step and exit 0.
 *
 * Everything it writes lands under test/evidence/<stamp>/: the specs, the plan,
 * the payload, the registry, the validator output of every refusal, the apply
 * dry-run log, the wall captures, and manifest.json.
 *
 * Containment: the planner gates its config and registry paths beneath its
 * project root, so the wave CLI runs with UFO_PROJECT_ROOT pointed at a scratch
 * root inside the evidence dir. No invocation writes into the ufo-fsd-alpha
 * checkout, and no invocation reads or writes the operator's live tmux session
 * unless --live-wall is passed.
 *
 * Usage:
 *   node test/run-wave-test.mjs                     # dry, fixture band
 *   node test/run-wave-test.mjs --band live         # dry, real config/ufo.json
 *   node test/run-wave-test.mjs --live-wall         # also open/capture the wall
 *   node test/run-wave-test.mjs --lanes 40          # a wider wave in-band
 *   node test/run-wave-test.mjs --help
 *
 * Exit codes: 0 every gate passed and the run stopped at the dispatch boundary
 * · 1 a gate failed (the failing check is named) · 64 usage.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TEST_DIR, "..");
const HOST_DIR = path.join(REPO_ROOT, "host");
const APPLY_SCRIPT = path.join(HOST_DIR, "apply.mjs");
const CANDIDATE_GLOBAL_CONFIG = path.join(HOST_DIR, "omp-agent.config.yml");
const DELTA_PATH = path.join(HOST_DIR, "ufo-sighting-dispatch.json");
const EVIDENCE_ROOT = path.join(TEST_DIR, "evidence");
const DEFAULT_UFO_ROOT = "/home/vgpnk/Projects/ufo-fsd-alpha";
const WAVE_SESSION = "ufo_sighting";

// The operator directive under test: "swarm waves of 32 workers but up to 100".
// 32 is the narrowest legal spawn wave after the apply, so it is the wave this
// script proves admissible; 16 and 31 are the refusals that show the floor bites.
const FLOOR_LANES = 32;
const HARD_CEILING = 100;

// Two route families on purpose. Which family a role lands in is read from the
// candidate global config at runtime (loadAuthorities), never hardcoded here:
// on the current candidate scout+scribe+simplifier+mutation-tester resolve to
// @m_fast and reviewer+executor+connector+sentinel+revenger to @m_mid, so a
// wave mixing them is not a singleFamily concentration (the 16/36 and 44/48
// death shape the route preflight exists to flag).
const MIXED_ROLES = ["scout", "reviewer", "scribe", "executor"];
// One family only, for the negative singleFamily assertion. Never dispatched.
const SINGLE_FAMILY_ROLES = ["scout", "scribe", "simplifier", "mutation-tester"];

// Authorities imported from the checkout under test, so every role/family claim
// in this script is the repo's own resolution rather than a restated table:
//   ufo-swarm-wave.mjs   SWARM_ROLES, planSwarmWave, waveRoutePreflight
//   omp-global-config.mjs readGlobalSeatRouting (seat → @alias)
let waveMod = null;
let seatAlias = new Map();

async function loadAuthorities() {
  // Continues step 1: resolving the candidate routing table and importing the
  // planner are preflight, not a measured step of their own.
  say("");
  say("  authorities — the candidate routing table and the real planner");
  waveMod = await import(WAVE_CLI);
  const routingMod = await import(path.join(UFO_SCRIPTS, "omp-global-config.mjs"));
  const routing = routingMod.readGlobalSeatRouting({ path: CANDIDATE_GLOBAL_CONFIG });
  seatAlias = new Map([...routing.seats].map(([seat, entry]) => [seat, entry?.via?.alias ?? null]));
  ok("authority.seats", `${seatAlias.size} seats resolved from the candidate global config ${CANDIDATE_GLOBAL_CONFIG} (sha256 ${routing.sha256.slice(0, 16)}…)`);
  const unpinned = [...MIXED_ROLES, ...SINGLE_FAMILY_ROLES].filter((role) => !seatAlias.has(role));
  check("authority.pinned", unpinned.length === 0,
    unpinned.length === 0
      ? `every role this test uses is pinned by task.agentModelOverrides: ${[...new Set([...MIXED_ROLES, ...SINGLE_FAMILY_ROLES])].map((role) => `${role}→@${seatAlias.get(role)}`).join(", ")}`
      : `these roles are not pinned in the candidate config, so no family can be attributed: ${JSON.stringify(unpinned)}`);
  check("authority.mixedSpansFamilies", new Set(MIXED_ROLES.map((role) => seatAlias.get(role))).size >= 2,
    `MIXED_ROLES spans ${new Set(MIXED_ROLES.map((role) => seatAlias.get(role))).size} aliases: ${JSON.stringify(MIXED_ROLES.map((role) => seatAlias.get(role)))}`);
  check("authority.singleFamilyIsOne", new Set(SINGLE_FAMILY_ROLES.map((role) => seatAlias.get(role))).size === 1,
    `SINGLE_FAMILY_ROLES all resolve to @${seatAlias.get(SINGLE_FAMILY_ROLES[0])}: ${JSON.stringify(SINGLE_FAMILY_ROLES)}`);
}

/** The candidate config's alias for a swarm role, or null when unpinned. */
function familyOf(role) {
  return seatAlias.get(role) ?? null;
}

// Renderer contract (ufo-swarm-wave.mjs GODSPEED_INVOCATION + hook parity):
// a spawn lane's composed text opens with the invocation; a resume message
// never carries it.
const GODSPEED_LEADING = /^\s*\/skill:godspeed(?:\s|$)/u;
const GODSPEED_INVOCATION = "/skill:godspeed";

const USAGE = [
  "usage: node test/run-wave-test.mjs [--ufo-root PATH] [--band fixture|live]",
  "                                   [--lanes N] [--report-dir REL] [--out DIR]",
  "                                   [--live-wall] [--verify] [--help]",
  "  --ufo-root PATH   ufo-fsd-alpha checkout (default " + DEFAULT_UFO_ROOT + ")",
  "  --band MODE       fixture: synthesize the post-apply band from host/ (default)",
  "                    live: read the checkout's config/ufo.json as the band authority",
  "                    and refuse with apply_not_landed while the floor is not 32",
  "  --lanes N         spawn lanes for the admitted wave (default 32, band 32-100)",
  "  --report-dir REL  per-lane reportDir written into the spec (relative, no '..')",
  "  --out DIR         evidence dir (default test/evidence/<stamp>)",
  "  --live-wall       open the operator wall and capture its state. WITHOUT this",
  "                    flag no ufo-sighting verb is executed",
  "  --verify          accepted alias: the apply dry-run gate always runs",
  "  never dispatched: this script stops at the dispatch boundary and prints the step",
].join("\n");

// ── console + result plumbing ──────────────────────────────────────────────
let failures = 0;
const results = [];
// Filled in as the run learns them; folded into manifest.json at the end so one
// file carries both the verdicts and the environment they were measured in.
const runMeta = {};

function say(line = "") {
  process.stdout.write(`${line}\n`);
}

function rule(title) {
  say("");
  say(`── ${title} ${"─".repeat(Math.max(0, 66 - title.length))}`);
}

function ok(id, detail) {
  results.push({ id, ok: true, detail });
  say(`  ok   ${id}: ${detail}`);
}

function bad(id, detail) {
  failures += 1;
  results.push({ id, ok: false, detail });
  say(`  FAIL ${id}: ${detail}`);
}

function check(id, condition, detail) {
  if (condition) ok(id, detail);
  else bad(id, detail);
  return Boolean(condition);
}

function die(code, message) {
  say("");
  say(`── refused ──`);
  say(`  ${message}`);
  process.exit(code);
}

function gate(id, message) {
  // A preflight gate: unlike check() it stops the run, because everything
  // after it would be measuring a broken environment.
  say(`  FAIL ${id}: ${message}`);
  failures += 1;
  results.push({ id, ok: false, detail: message, gate: true });
  finish(1);
}

// ── args ───────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const opts = {
    ufoRoot: DEFAULT_UFO_ROOT,
    band: "fixture",
    lanes: FLOOR_LANES,
    reportDir: null,
    out: null,
    liveWall: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) die(64, `${arg} requires a value\n\n${USAGE}`);
      i += 1;
      return next;
    };
    if (arg === "--help" || arg === "-h") {
      say(USAGE);
      process.exit(0);
    } else if (arg === "--ufo-root") opts.ufoRoot = path.resolve(value());
    else if (arg === "--band") opts.band = value();
    else if (arg === "--lanes") opts.lanes = Number(value());
    else if (arg === "--report-dir") opts.reportDir = value();
    else if (arg === "--out") opts.out = path.resolve(value());
    else if (arg === "--live-wall") opts.liveWall = true;
    else if (arg === "--verify") {
      // Accepted for the mission's wording; the apply gate is unconditional.
      opts.verifyAlias = true;
    } else die(64, `unexpected argument: ${arg}\n\n${USAGE}`);
  }
  if (opts.band !== "fixture" && opts.band !== "live") {
    die(64, `--band must be fixture or live, got ${JSON.stringify(opts.band)}\n\n${USAGE}`);
  }
  if (!Number.isSafeInteger(opts.lanes) || opts.lanes < 1) {
    die(64, `--lanes must be a positive integer, got ${JSON.stringify(opts.lanes)}\n\n${USAGE}`);
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));

const stamp = new Date().toISOString().replace(/[-:]/gu, "").replace(/\.\d{3}/u, "");
const EVIDENCE = opts.out ?? path.join(EVIDENCE_ROOT, `wave-${stamp}`);
const SCRATCH_ROOT = path.join(EVIDENCE, "ufo-root");
const UFO_SCRIPTS = path.join(opts.ufoRoot, "scripts");
const WAVE_CLI = path.join(UFO_SCRIPTS, "ufo-swarm-wave.mjs");
const SIGHTING_CLI = path.join(UFO_SCRIPTS, "ufo-sighting");
const LIVE_CONFIG = path.join(opts.ufoRoot, "config", "ufo.json");
const FIXTURE_CONFIG = path.join(SCRATCH_ROOT, "config", "ufo.json");
// Lane reports are written by the lanes themselves, relative to the dispatching
// session's cwd; the registry is written by `run`, relative to UFO_PROJECT_ROOT.
// Keeping reportDir inside test/evidence means a live run's lane artifacts land
// in the evidence tree this script already owns.
const REPORT_DIR = opts.reportDir ?? path.posix.join("test", "evidence", path.basename(EVIDENCE), "lane-reports");
const WAVE_NAME = `sighting-wave-${opts.lanes}`;

function sha256File(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

/** Repo-relative when the path is inside the repo, absolute otherwise — a
 * relative walk out of the repo root reads as noise in the evidence log. */
function displayPath(file) {
  const rel = path.relative(REPO_ROOT, file);
  return rel.startsWith("..") || path.isAbsolute(rel) ? file : rel;
}

function writeEvidence(name, text) {
  const target = path.join(EVIDENCE, name);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, text, "utf8");
  return target;
}

function writeEvidenceJson(name, value) {
  return writeEvidence(name, `${JSON.stringify(value, null, 1)}\n`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    cwd: options.cwd ?? opts.ufoRoot,
    env: options.env ?? process.env,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error ?? null,
  };
}

function plannerEnv(extra = {}) {
  // UFO_PROJECT_ROOT keeps the planner's config and registry gates inside the
  // evidence tree. UFO_FLEET_ALLOW_EXTERNAL_TOOLS is the documented escape the
  // repo's own harnesses use for a config path outside that root (--band live
  // and the fixture-home route check both need it); it widens path gating only,
  // never routing authority.
  return {
    ...process.env,
    UFO_PROJECT_ROOT: SCRATCH_ROOT,
    UFO_FLEET_ALLOW_EXTERNAL_TOOLS: "1",
    ...extra,
  };
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    gate(label, `unparseable JSON: ${error?.message ?? error}`);
  }
  return null;
}

/** Run the wave CLI and return {status, json, raw}. */
function waveCli(command, specPath, extraArgs = [], env = {}) {
  const result = run(process.execPath, [WAVE_CLI, command, "--spec", specPath, ...extraArgs], {
    env: plannerEnv(env),
  });
  const combined = `${result.stdout}\n${result.stderr}`.trim();
  let json = null;
  try {
    json = JSON.parse(result.stdout.trim() === "" ? result.stderr.trim() : result.stdout.trim());
  } catch {
    json = null;
  }
  return { ...result, json, raw: combined };
}

// ── spec builders ──────────────────────────────────────────────────────────
// Every prompt is pairwise distinct by construction (the planner refuses a
// duplicate expansion with duplicate_expansion rather than deduping silently),
// and every lane is a cheap, non-mutating observation so the live run burns
// little and still produces one artifact per lane.
function buildSpec(lanes, roles, wave, purpose) {
  const items = [];
  for (let i = 0; i < lanes; i += 1) {
    const role = roles[i % roles.length];
    items.push({
      role,
      prompt: [
        `Sighting wave smoke lane ${i + 1} of ${lanes} (${wave}, role ${role}).`,
        `Task ${i + 1}/${lanes}: read one file of your choice under the repository`,
        `you were started in and report exactly one observable fact about it — its`,
        `path, its size in bytes, and the fact. Do not modify any file, do not`,
        `dispatch a subagent, do not run a network command. ${purpose}`,
      ].join(" "),
    });
  }
  return {
    wave,
    context: [
      "# Goal",
      `UFO Sighting smoke test: one wave of ${lanes} independent observation lanes,`,
      "dispatched as exactly one batched OMP task call and observed on the wall.",
      "",
      "# Constraints",
      "Leaf member — no subagent dispatch, no file mutation, no network access.",
      "Report the lane's single observable fact and stop.",
      "",
      "# Contract",
      "Write the lane report to the path your task text names; the collector joins",
      "it by member name.",
    ].join("\n"),
    reportDir: REPORT_DIR,
    items,
  };
}

function specFile(name, spec) {
  const file = path.join(EVIDENCE, name);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(spec, null, 1)}\n`, "utf8");
  return file;
}

// ── step 1: preflight ──────────────────────────────────────────────────────
function preflight() {
  rule("1/8  preflight — environment, checkout, apply dry run");

  const nodeVersion = process.versions.node;
  check("preflight.node", typeof nodeVersion === "string" && nodeVersion.length > 0,
    `node ${nodeVersion} (${process.execPath})`);

  const tmux = run("tmux", ["-V"], { cwd: REPO_ROOT });
  if (tmux.status !== 0) {
    gate("preflight.tmux", `tmux is required for the operator wall and is not runnable: ${tmux.stderr.trim() || `exit ${tmux.status}`}`);
  }
  const tmuxPath = run("which", ["tmux"], { cwd: REPO_ROOT }).stdout.trim();
  ok("preflight.tmux", `${tmux.stdout.trim()} at ${tmuxPath || "<not on PATH>"}`);

  for (const [id, file] of [
    ["preflight.repo.waveCli", WAVE_CLI],
    ["preflight.repo.sightingCli", SIGHTING_CLI],
    ["preflight.repo.config", LIVE_CONFIG],
    ["preflight.host.apply", APPLY_SCRIPT],
    ["preflight.host.candidate", CANDIDATE_GLOBAL_CONFIG],
    ["preflight.host.delta", DELTA_PATH],
  ]) {
    if (!existsSync(file)) gate(id, `missing required file: ${file}`);
    ok(id, file);
  }

  // Read-only: does the wall session already exist? This neither creates nor
  // attaches to it — `has-session` only asks the running server.
  const session = run("tmux", ["has-session", "-t", WAVE_SESSION], { cwd: REPO_ROOT });
  const wallPresent = session.status === 0;
  ok("preflight.wall", wallPresent
    ? `tmux session ${WAVE_SESSION} already exists — --live-wall would reuse it, not open a second one`
    : `tmux session ${WAVE_SESSION} is not running — the live procedure opens it`);

  // The hard gate the mission names: no verified candidate config, no test.
  // `node host/apply.mjs` with no flags is the dry run — apply.mjs has no
  // --verify flag, its flagless invocation IS the verification pass, and it
  // writes nothing.
  const apply = run(process.execPath, [APPLY_SCRIPT, "--ufo-root", opts.ufoRoot], { cwd: REPO_ROOT });
  const applyLog = writeEvidence("apply-dry-run.log",
    `$ node host/apply.mjs --ufo-root ${opts.ufoRoot}\nexit=${apply.status}\n\n── stdout ──\n${apply.stdout}\n── stderr ──\n${apply.stderr}\n`);
  if (apply.status !== 0) {
    gate("preflight.apply", `host/apply.mjs dry run exited ${apply.status} — the candidate config is not verified, so the wave test would measure an unroutable host. Log: ${applyLog}\n  last lines:\n${apply.stdout.trim().split("\n").slice(-6).map((line) => `    ${line}`).join("\n")}`);
  }
  ok("preflight.apply", `host/apply.mjs dry run exit 0 (resolver, route gate, replicated compile gate and its own 32-lane wave gate all pass) — log ${displayPath(applyLog)}`);

  return { wallPresent, applyLog };
}

// ── step 2: band authority ─────────────────────────────────────────────────
function resolveBand(delta) {
  rule("2/8  band authority — the swarm floor under test");

  mkdirSync(path.join(SCRATCH_ROOT, "config"), { recursive: true });

  if (!existsSync(LIVE_CONFIG)) gate("band.source", `config/ufo.json not found at ${LIVE_CONFIG}`);
  const liveRaw = readFileSync(LIVE_CONFIG, "utf8");
  const live = parseJson(liveRaw, "band.source");
  const liveSwarm = live?.sighting?.dispatch?.swarm ?? null;
  if (liveSwarm === null) gate("band.source", "config/ufo.json has no sighting.dispatch.swarm object");

  ok("band.live", `checkout band as it stands: waveMinLanes ${liveSwarm.waveMinLanes}, waveMaxLanes ${liveSwarm.waveMaxLanes}, maxLanes ${liveSwarm.maxLanes}, minLanes ${liveSwarm.minLanes}`);

  if (opts.band === "live") {
    // The real file is the authority. It must already carry the post-apply
    // floor, or every negative assertion below would be measuring the old band.
    if (liveSwarm.waveMinLanes !== delta.swarm.waveMinLanes) {
      die(1, `apply_not_landed: ${LIVE_CONFIG} still declares swarm.waveMinLanes ${liveSwarm.waveMinLanes}; `
        + `--band live needs the merged delta (${delta.swarm.waveMinLanes}). `
        + `Run \`node host/apply.mjs --apply\` first (the tower sequences this), or use --band fixture `
        + `to validate against the synthesized post-apply band.`);
    }
    ok("band.authority", `live: ${LIVE_CONFIG} (sha256 ${sha256File(LIVE_CONFIG).slice(0, 16)}…) is the band authority`);
    return {
      mode: "live",
      configPath: LIVE_CONFIG,
      env: { UFO_CONFIG_PATH: LIVE_CONFIG },
      expected: {
        waveMinLanes: delta.swarm.waveMinLanes,
        waveMaxLanes: delta.swarm.waveMaxLanes,
        maxLanes: delta.swarm.maxLanes,
      },
    };
  }

  // fixture: the checkout's own config with exactly the delta's five values set,
  // which is the object state `apply.mjs --apply` produces. The merge is
  // in-memory and lands inside the evidence tree.
  const fixture = JSON.parse(liveRaw);
  const dispatch = fixture.sighting.dispatch;
  dispatch.maxConcurrentL1 = delta.maxConcurrentL1;
  dispatch.missionFormat.l1Alias = delta.missionFormat.l1Alias;
  dispatch.swarm.maxLanes = delta.swarm.maxLanes;
  dispatch.swarm.waveMinLanes = delta.swarm.waveMinLanes;
  dispatch.swarm.waveMaxLanes = delta.swarm.waveMaxLanes;
  writeFileSync(FIXTURE_CONFIG, `${JSON.stringify(fixture, null, 1)}\n`, "utf8");
  ok("band.authority", `fixture: ${FIXTURE_CONFIG} = checkout config/ufo.json with host/ufo-sighting-dispatch.json merged`);
  ok("band.fixture", `synthesized post-apply band: waveMinLanes ${dispatch.swarm.waveMinLanes}, waveMaxLanes ${dispatch.swarm.waveMaxLanes}, maxLanes ${dispatch.swarm.maxLanes}, maxConcurrentL1 ${dispatch.maxConcurrentL1}, l1Alias ${dispatch.missionFormat.l1Alias}`);
  return {
    mode: "fixture",
    configPath: FIXTURE_CONFIG,
    env: { UFO_CONFIG_PATH: FIXTURE_CONFIG },
    expected: {
      waveMinLanes: delta.swarm.waveMinLanes,
      waveMaxLanes: delta.swarm.waveMaxLanes,
      maxLanes: delta.swarm.maxLanes,
    },
  };
}

// ── steps 4-5: the admitted wave ───────────────────────────────────────────
async function planAndRun(band) {
  rule(`3/8  spec — the ${opts.lanes}-lane wave declaration`);

  const spec = buildSpec(opts.lanes, MIXED_ROLES, WAVE_NAME, "This lane is part of a live smoke test of the wave band and the sighting wall.");
  const specPath = specFile(`spec-${opts.lanes}.json`, spec);
  const specRoles = [...new Set(spec.items.map((item) => item.role))];
  check("spec.count", spec.items.length === opts.lanes, `${spec.items.length} items in ${specPath}`);
  check("spec.distinct", new Set(spec.items.map((item) => item.prompt)).size === spec.items.length,
    `${new Set(spec.items.map((item) => item.prompt)).size} pairwise-distinct prompts — a duplicate expansion is a typed refusal, never a silent dedupe`);
  check("spec.rolesExplicit", specRoles.every((role) => waveMod.SWARM_ROLES.has(role)) && specRoles.length >= 2,
    `explicit taxonomy roles ${JSON.stringify(specRoles)}, all within the planner's ${waveMod.SWARM_ROLES.size} swarm roles (no frozen-topology seat)`);
  check("spec.routeFamilies", new Set(specRoles.map(familyOf)).size >= 2,
    `roles span ${new Set(specRoles.map(familyOf)).size} route families on the candidate global config — ${specRoles.map((role) => `${role}→@${familyOf(role)}`).join(", ")} — so the wave is not a singleFamily concentration`);
  check("spec.reportDir", spec.reportDir === REPORT_DIR, `reportDir ${spec.reportDir} (relative, no '..' segment)`);

  rule(`4/8  plan — the wave validates against the real planner`);
  const planned = waveCli("plan", specPath, [], band.env);
  writeEvidence(`plan-${opts.lanes}.stdout.json`, planned.stdout || planned.raw);
  if (planned.status !== 0) {
    gate("plan.exit", `plan exited ${planned.status}: ${planned.raw.slice(0, 400)}`);
  }
  const plan = planned.json;
  check("plan.schema", plan?.schema === "ufo-swarm-wave-v1", `schema ${plan?.schema}`);
  check("plan.counts", plan?.counts?.spawn === opts.lanes && plan?.counts?.total === opts.lanes && plan?.counts?.resume === 0,
    `counts ${JSON.stringify(plan?.counts)}`);
  check("plan.band", plan?.policy?.waveMinLanes === band.expected.waveMinLanes
    && plan?.policy?.waveMaxLanes === band.expected.waveMaxLanes
    && plan?.policy?.maxLanes === band.expected.maxLanes,
    `policy band ${plan?.policy?.waveMinLanes}-${plan?.policy?.waveMaxLanes}, cap ${plan?.policy?.maxLanes}, source ${plan?.policy?.source}`);
  check("plan.floorBoundary", opts.lanes === band.expected.waveMinLanes || opts.lanes > band.expected.waveMinLanes,
    opts.lanes === band.expected.waveMinLanes
      ? `${opts.lanes} lanes sits exactly on the post-apply floor — the narrowest legal spawn wave`
      : `${opts.lanes} lanes is inside the band ${band.expected.waveMinLanes}-${band.expected.waveMaxLanes}`);

  rule(`5/8  run — the ufo-swarm-wave-dispatch-v1 payload`);
  const ran = waveCli("run", specPath, [], band.env);
  const payloadPath = writeEvidence(`dispatch-${opts.lanes}.json`, ran.stdout || ran.raw);
  if (ran.status !== 0) {
    gate("run.exit", `run exited ${ran.status}: ${ran.raw.slice(0, 400)}`);
  }
  const payload = ran.json;
  check("run.schema", payload?.schema === "ufo-swarm-wave-dispatch-v1", `schema ${payload?.schema}`);

  const tasks = payload?.taskCall?.tasks ?? [];
  check("run.laneCount", tasks.length === opts.lanes,
    `${tasks.length} spawn lanes in exactly one taskCall (resumeSends ${payload?.resumeSends?.length ?? 0})`);
  check("run.noModelParam", tasks.every((task) => !("model" in task)),
    `no lane carries a model param — task keys are ${JSON.stringify([...new Set(tasks.flatMap((task) => Object.keys(task)))].sort())}; routing is the global config's role→alias table`);
  check("run.godspeedLeading", tasks.every((task) => typeof task.task === "string" && GODSPEED_LEADING.test(task.task)),
    `every spawned task opens with the leading line ${JSON.stringify(GODSPEED_INVOCATION)}`);
  check("run.godspeedSingle", tasks.every((task) => (task.task.match(/\/skill:godspeed/gu) ?? []).length === 1),
    "no task stacks a second godspeed invocation (hook idempotence parity)");
  check("run.distinctPrompts", new Set(tasks.map((task) => task.task)).size === tasks.length,
    `${new Set(tasks.map((task) => task.task)).size} pairwise-distinct lane texts`);
  check("run.distinctNames", new Set(tasks.map((task) => task.name)).size === tasks.length,
    `${new Set(tasks.map((task) => task.name)).size} distinct member names`);
  check("run.rolesExplicit", tasks.every((task) => typeof task.agent === "string" && task.agent.length > 0),
    `every lane carries an explicit taxonomy role: ${JSON.stringify([...new Set(tasks.map((task) => task.agent))].sort())}`);
  check("run.context", typeof payload?.taskCall?.context === "string" && payload.taskCall.context.length > 0,
    `taskCall.context is a ${payload?.taskCall?.context.length}-byte string — the batched call needs both fields verbatim`);
  check("run.reportInstruction", tasks.every((task) => task.task.includes(`${REPORT_DIR}/${task.name}.md`)),
    `every lane is told to write ${REPORT_DIR}/<Name>.md`);

  // The registry `run` persists is the resume authority for a later wave.
  const registryRel = payload?.registry?.path ?? null;
  const registryAbs = registryRel === null ? null : path.join(SCRATCH_ROOT, registryRel);
  if (registryRel === null || !existsSync(registryAbs)) {
    gate("run.registry", `run did not persist a registry at ${registryAbs ?? "<none>"}`);
  }
  const registry = parseJson(readFileSync(registryAbs, "utf8"), "run.registry");
  check("run.registrySchema", registry?.schema === "ufo-swarm-registry-v1", `${registryRel} is ${registry?.schema}`);
  check("run.registryMembers", Object.keys(registry?.members ?? {}).length === opts.lanes,
    `${Object.keys(registry?.members ?? {}).length} members, every spawn row agentId null until \`record\` fills it`);
  const registryCopy = path.join(EVIDENCE, "swarm-registry.json");
  copyFileSync(registryAbs, registryCopy);
  ok("run.registryCopy", `copied to ${registryCopy} (authoritative copy stays at ${registryAbs})`);

  return { spec, specPath, plan, payload, payloadPath, registryRel, registryAbs, registryCopy };
}

// ── step 6: negative assertions ────────────────────────────────────────────
function negatives(band, admitted) {
  rule("6/8  negatives — the floor bites, resumes are exempt, families are counted");

  // 6a/6b: below the floor. Both must die too_few_lanes with exit 1, never a
  // silent pass and never a different code.
  for (const lanes of [16, 31]) {
    const specPath = specFile(`spec-${lanes}.json`,
      buildSpec(lanes, MIXED_ROLES, `sighting-wave-refusal-${lanes}`, "Never dispatched: this spec exists to prove the floor refuses it."));
    const refused = waveCli("plan", specPath, [], band.env);
    writeEvidence(`refusal-${lanes}.json`, refused.raw);
    check(`negative.tooFew.${lanes}`, refused.status === 1 && refused.json?.code === "too_few_lanes",
      `a ${lanes}-lane spec exits ${refused.status} as ${refused.json?.code ?? "<unparseable>"}: ${refused.json?.message ?? refused.raw.slice(0, 160)}`);
  }

  // 6c: the floor boundary from the other side — the same spec shape at exactly
  // the floor is admitted, so the refusals above are the floor and not a broken
  // spec builder.
  const admittedAgain = waveCli("plan", admitted.specPath, [], band.env);
  check("negative.floorAdmits", admittedAgain.status === 0,
    `${opts.lanes} lanes (exactly the floor) plans clean, exit 0 — nothing was dispatched`);

  // 6d: a resume-only wave is floor-exempt. It needs an owned member, so
  // `record` first fills one spawn row with a SYNTHETIC agent id; a real wave
  // records the ids the task call returned. Plan only — no dispatch, no send.
  const syntheticAgent = "agent-dryrun0000000001";
  const registryRel = admitted.registryRel;
  const memberName = Object.keys(admitted.payload?.taskCall?.tasks ?? {}).length > 0
    ? admitted.payload.taskCall.tasks[0].name
    : null;
  if (memberName === null) gate("negative.resume", "no member name to resume");
  const recorded = run(process.execPath, [
    WAVE_CLI, "record",
    "--registry", registryRel,
    "--assignments", JSON.stringify({ [memberName]: syntheticAgent }),
  ], { env: plannerEnv(band.env) });
  writeEvidence("record-synthetic.stdout.json", recorded.stdout || recorded.stderr);
  check("negative.record", recorded.status === 0,
    `record filled ${memberName} → ${syntheticAgent} (synthetic id; a live run records the ids the task call returns)`);

  const resumeSpec = specFile("spec-resume-only.json", {
    wave: `${WAVE_NAME}-resume`,
    priorRegistry: registryRel,
    items: [{ resume: syntheticAgent, message: "Continue your assigned smoke-test lane and report the one fact you observed." }],
  });
  const resumed = waveCli("plan", resumeSpec, [], band.env);
  writeEvidence("plan-resume-only.json", resumed.stdout || resumed.raw);
  check("negative.resumeFloorExempt", resumed.status === 0 && resumed.json?.counts?.resume === 1 && resumed.json?.counts?.spawn === 0,
    `a 1-lane resume-only wave plans clean under the ${band.expected.waveMinLanes}-lane floor (counts ${JSON.stringify(resumed.json?.counts ?? null)}) — resumes are continuity, not a new wave`);
  const resumeLane = resumed.json?.tasks?.[0] ?? null;
  check("negative.resumeNoGodspeed", resumeLane !== null && !GODSPEED_LEADING.test(resumeLane.message ?? ""),
    "the resume message carries no /skill:godspeed invocation — a resumed lane keeps its session, and a stacked invocation would reach it twice");

  // 6e: the rest of the typed refusal vocabulary the smoke procedure documents.
  // Each case is a spec the planner must refuse with an exact code — a refusal
  // is a reason to fix the spec, never a reason to bypass validation.
  const refusalCases = [
    {
      id: "duplicate_expansion",
      why: "two lanes expanding to identical prompts are refused, never silently deduped",
      spec: () => {
        const items = Array.from({ length: opts.lanes }, (_, i) => ({
          role: MIXED_ROLES[i % MIXED_ROLES.length],
          prompt: `Refusal probe lane ${i + 1}: report one observable fact.`,
        }));
        items[1] = { ...items[1], prompt: items[0].prompt };
        return { wave: `${WAVE_NAME}-duplicate`, items };
      },
    },
    {
      id: "role_required",
      why: "a spawn lane without an explicit taxonomy role is refused — no wave of generic task agents",
      spec: () => ({ wave: `${WAVE_NAME}-norole`, items: [{ prompt: "Refusal probe: no role declared." }] }),
    },
    {
      id: "unknown_role",
      why: "a frozen-topology seat (planner) is not a swarm role",
      spec: () => ({ wave: `${WAVE_NAME}-badrole`, items: [{ role: "planner", prompt: "Refusal probe: frozen seat as a swarm role." }] }),
    },
    {
      id: "impossible_band",
      why: "a spec cap below the wave floor makes the band unreachable and fails before any lane spawns",
      spec: () => ({
        wave: `${WAVE_NAME}-caplow`,
        maxLanes: band.expected.waveMinLanes - 1,
        items: Array.from({ length: opts.lanes }, (_, i) => ({
          role: "scout",
          prompt: `Refusal probe lane ${i + 1}: cap below the floor.`,
        })),
      }),
    },
    {
      id: "resume_unknown_member",
      why: "a resume naming an agent id no registry owns fails closed before any lane spawns",
      spec: () => ({ wave: `${WAVE_NAME}-badresume`, items: [{ resume: "agent-neverowned000001", message: "Refusal probe: unowned handle." }] }),
    },
    {
      id: "resume_role_forbidden",
      why: "a resume carrying a role would mint a replacement identity for an existing agent",
      spec: () => ({
        wave: `${WAVE_NAME}-resumerole`,
        priorRegistry: admitted.registryRel,
        items: [{ resume: syntheticAgent, role: "scout", message: "Refusal probe: role on a resume." }],
      }),
    },
  ];
  for (const testCase of refusalCases) {
    const casePath = specFile(`refusals/${testCase.id}.json`, testCase.spec());
    const refused = waveCli("plan", casePath, [], band.env);
    writeEvidence(`refusals/${testCase.id}.output.json`, refused.raw);
    check(`negative.refusal.${testCase.id}`, refused.status === 1 && refused.json?.code === testCase.id,
      `${testCase.id}: exit ${refused.status}, code ${JSON.stringify(refused.json?.code ?? null)} — ${testCase.why}`);
  }

  // 6f: route-family concentration is asserted in routeFamilies(), which needs
  // the async module boundary — see main().
}

async function routeFamilies(band, admitted) {
  const mod = waveMod;
  const routingOptions = { path: CANDIDATE_GLOBAL_CONFIG };
  const reports = {};

  const fastSpec = buildSpec(opts.lanes, SINGLE_FAMILY_ROLES, `sighting-wave-single-family-${opts.lanes}`,
    "Never dispatched: this spec exists to prove the route preflight flags a one-family wave.");
  const fastSpecPath = specFile(`spec-single-family-${opts.lanes}.json`, fastSpec);
  const mixedPlan = mod.planSwarmWave(JSON.parse(readFileSync(admitted.specPath, "utf8")));
  const fastPlan = mod.planSwarmWave(JSON.parse(readFileSync(fastSpecPath, "utf8")));
  const mixed = mod.waveRoutePreflight(mixedPlan, { routingOptions });
  const fast = mod.waveRoutePreflight(fastPlan, { routingOptions });
  reports.mixed = mixed;
  reports.singleFamily = fast;
  writeEvidenceJson("route-preflight.json", {
    candidateGlobalConfig: CANDIDATE_GLOBAL_CONFIG,
    candidateSha256: sha256File(CANDIDATE_GLOBAL_CONFIG),
    note: "routePreflight against the candidate global config apply.mjs installs. --route-families on the CLI reads the same table through the operator's live ~/.omp/agent/config.yml.",
    mixedWave: mixed,
    singleFamilyWave: fast,
  });

  const describe = (report) => `families ${report.concentration.families}, largest ${report.concentration.largestFamilyLanes}, `
    + `pinned ${report.concentration.pinnedLanes}, aliases ${JSON.stringify(report.families.map((family) => `${family.alias}:${family.lanes}`))}`;
  check("negative.singleFamilyFlagged", fast.concentration.singleFamily === true,
    `an all-m_fast ${opts.lanes}-lane wave IS flagged singleFamily (${describe(fast)})`);
  check("negative.mixedNotFlagged", mixed.concentration.singleFamily === false && mixed.concentration.families >= 2,
    `the mixed ${opts.lanes}-lane wave is NOT singleFamily (${describe(mixed)})`);
  check("negative.routeConfigBound", typeof mixed.config?.sha256 === "string" && mixed.config.sha256.length === 64,
    `both reports bind the routing authority they read: ${mixed.config.path} sha256 ${mixed.config.sha256.slice(0, 16)}…`);

  // The operator-facing form of the same check, proved end to end: the CLI flag
  // with a fixture HOME holding the candidate config as .omp/agent/config.yml.
  // A live run needs no override — it reads the installed authority.
  const fixtureHome = path.join(EVIDENCE, "fixture-home");
  mkdirSync(path.join(fixtureHome, ".omp", "agent"), { recursive: true });
  copyFileSync(CANDIDATE_GLOBAL_CONFIG, path.join(fixtureHome, ".omp", "agent", "config.yml"));
  const cliFamilies = waveCli("plan", admitted.specPath, ["--route-families"], {
    ...band.env,
    HOME: fixtureHome,
  });
  writeEvidence("plan-route-families.json", cliFamilies.stdout || cliFamilies.raw);
  check("negative.routeCli", cliFamilies.status === 0
    && cliFamilies.json?.routePreflight?.concentration?.singleFamily === false,
    `plan --route-families (HOME=${fixtureHome}) exits ${cliFamilies.status} and reports singleFamily `
    + `${cliFamilies.json?.routePreflight?.concentration?.singleFamily} over ${cliFamilies.json?.routePreflight?.concentration?.families} families`);

  return reports;
}

// ── step 6g: band cross-check through the injected policy ──────────────────
async function bandCrossCheck(delta, admitted) {
  // The same mechanism apply.mjs's own wave gate uses: the real planner judging
  // the delta's numbers directly, independent of any config file on disk. It
  // pins host/ufo-sighting-dispatch.json as the source of the band this whole
  // test claims.
  const mod = waveMod;
  const postPolicy = {
    ...(admitted.plan?.policy ?? {}),
    source: "config",
    maxLanes: delta.swarm.maxLanes,
    waveMinLanes: delta.swarm.waveMinLanes,
    waveMaxLanes: delta.swarm.waveMaxLanes,
  };
  const spec = JSON.parse(readFileSync(path.join(EVIDENCE, `spec-${opts.lanes}.json`), "utf8"));
  const admittedPlan = mod.planSwarmWave(spec, { policy: postPolicy });
  check("crosscheck.admitted", admittedPlan?.counts?.total === opts.lanes,
    `injected post-apply band ${postPolicy.waveMinLanes}-${postPolicy.waveMaxLanes}: planSwarmWave admits ${admittedPlan?.counts?.total} lanes`);

  const below = delta.swarm.waveMinLanes - 1;
  let refusal = null;
  try {
    mod.planSwarmWave(buildSpec(below, MIXED_ROLES, `sighting-wave-crosscheck-${below}`, "Never dispatched."), { policy: postPolicy });
  } catch (error) {
    refusal = error?.code ?? error?.message ?? "unknown";
  }
  check("crosscheck.refused", refusal === "too_few_lanes",
    `the same planner refuses ${below} lanes as ${JSON.stringify(refusal)} — the floor is the delta's, not a fixture artifact`);

  let ceilingRefusal = null;
  try {
    mod.planSwarmWave(buildSpec(HARD_CEILING + 1, MIXED_ROLES, "sighting-wave-crosscheck-over", "Never dispatched."), { policy: postPolicy });
  } catch (error) {
    ceilingRefusal = error?.code ?? error?.message ?? "unknown";
  }
  check("crosscheck.ceiling", ceilingRefusal === "too_many_lanes",
    `${HARD_CEILING + 1} lanes is refused as ${JSON.stringify(ceilingRefusal)} — the band ceiling is ${HARD_CEILING}`);
}

// ── step 7: the wall ───────────────────────────────────────────────────────
function wall(preflightState) {
  rule("7/8  operator wall — ufo-sighting");

  // Verified against scripts/ufo-sighting.mjs, not assumed:
  //   open          HEAVY — starts the tmux server and session if absent, writes
  //                 .ufo/sighting/manifest.json, spawns a GUI terminal and waits
  //                 up to 10 s for exactly one attached client (ATTACH_TIMEOUT /
  //                 DUPLICATE_CLIENTS / TERMINAL_LAUNCHER_MISSING on failure).
  //                 It registers no missions.
  //   status --lite machine-readable wall state on stdout, skips the display
  //                 refresh. Plain `status` also rewrites tmux options and can
  //                 create the dashboard pane, so --lite is the capture form.
  //   overview      text render of the grid. NEVER --watch here: that is a
  //                 long-running loop and would hang this script.
  //   surface --json a STATIC contract description (verbs, exit codes, caps),
  //                 not wall state — captured once as contract evidence.
  //   reconcile     the standalone verb; `status reconcile` is rejected as an
  //                 unexpected argument despite what the usage line suggests.
  // Exit codes are 0 ok / 2 typed error with {ok:false,code,message} on stderr.
  const wallCommands = [
    { id: "open", args: ["open"], note: "opens session ufo_sighting window 1 and attaches a terminal; writes the manifest" },
    { id: "status", args: ["status", "--lite"], note: "wall state JSON — the evidence capture" },
    { id: "overview", args: ["overview", "--width", "200"], note: "text render of the grid (no --watch: that never returns)" },
    { id: "surface", args: ["surface", "--json"], note: "static verb/exit-code/caps contract" },
  ];

  if (!opts.liveWall) {
    ok("wall.dryRun", `--live-wall not passed: no ufo-sighting verb was executed (session ${WAVE_SESSION} ${preflightState.wallPresent ? "is live and was left untouched" : "is not running"})`);
    say("");
    say("  the live procedure runs these from the checkout, in this order:");
    for (const command of wallCommands) {
      say(`    cd ${opts.ufoRoot} && bash scripts/ufo-sighting ${command.args.join(" ")}`);
      say(`      # ${command.note}`);
    }
    say("");
    say("  Swarm lanes are NOT wall missions. A 32-lane wave shows up only as the");
    say("  parent mission's L2 counter (levels.l2 = unsettled task ids read from that");
    say("  session's transcript), and only when the parent session was itself launched");
    say("  or registered on the wall. L2 null with levelDetails.l2.status \"opaque\"");
    say("  means unknown — never read it as settled.");
    return { executed: false, wallCommands };
  }

  const captured = [];
  for (const command of wallCommands) {
    const result = run(process.execPath, [SIGHTING_CLI, ...command.args], { cwd: opts.ufoRoot });
    const file = writeEvidence(`wall-${command.id}.log`,
      `$ node scripts/ufo-sighting ${command.args.join(" ")}\nexit=${result.status}\n\n── stdout ──\n${result.stdout}\n── stderr ──\n${result.stderr}\n`);
    captured.push({ id: command.id, args: command.args, status: result.status, log: file });
    const detail = `ufo-sighting ${command.args.join(" ")} exit ${result.status} → ${displayPath(file)}`;
    if (result.status !== 0) {
      let code = null;
      try {
        code = JSON.parse(result.stderr.trim())?.code ?? null;
      } catch {
        code = null;
      }
      bad(`wall.${command.id}`, `${detail}; typed code ${JSON.stringify(code)}`);
      continue;
    }
    if (command.id === "open") {
      // `open` exiting 0 is not enough: it must report an attached client, or
      // the wall is a session nobody can see.
      let opened = null;
      try {
        opened = JSON.parse(result.stdout.trim());
      } catch {
        opened = null;
      }
      check("wall.open", opened !== null
        && (opened?.attachedClientCount === 1 || opened?.status === "attached"),
        `open reports status ${JSON.stringify(opened?.status ?? null)} with ${opened?.attachedClientCount ?? "?"} attached client(s) → ${displayPath(file)}`);
      continue;
    }
    ok(`wall.${command.id}`, detail);
  }
  return { executed: true, wallCommands, captured };
}

// ── step 8: the dispatch boundary ──────────────────────────────────────────
function dispatchBoundary(admitted) {
  rule("8/8  DISPATCH BOUNDARY — this script stops here");

  const payloadRel = displayPath(admitted.payloadPath);
  const lines = [
    "",
    "  Nothing was dispatched. No lane was spawned, no model was called, and no",
    "  hub message was sent. The wave is validated and rendered; issuing it is a",
    "  deliberate human step because it burns 32 lane completions.",
    "",
    `  Payload:   ${admitted.payloadPath}`,
    `             (${payloadRel}, schema ufo-swarm-wave-dispatch-v1)`,
    `  Registry:  ${admitted.registryAbs}`,
    `             (copied to ${admitted.registryCopy})`,
    `  Reports:   each lane writes <dispatching session cwd>/${REPORT_DIR}/<Name>.md`,
    "",
    "  THE STEP TO RUN BY HAND — exactly one batched OMP task call, from an OMP",
    "  session, using taskCall.context and the complete taskCall.tasks array",
    "  verbatim. Never split it into several task calls: one wave is one call.",
    "",
    "    1. print the call you are about to make:",
    `       node -e 'const d=require(${JSON.stringify(admitted.payloadPath)});`,
    `         console.log(JSON.stringify(d.taskCall,null,1))'`,
    "",
    "    2. in the OMP session, issue ONE task tool call with",
    "         context = payload.taskCall.context",
    `         tasks   = payload.taskCall.tasks   (${opts.lanes} entries, as-is)`,
    "       Do not add, drop, rename or reword a lane; do not add a model param.",
    "",
    "    3. watch it settle. Swarm lanes are not wall missions, so the wall shows",
    "       the wave only as the parent mission's L2 counter; the per-lane proof is",
    "       the report files. In this order:",
    `       cd ${opts.ufoRoot} && bash scripts/ufo-sighting overview --watch   # human, in a terminal`,
    `       cd ${opts.ufoRoot} && bash scripts/ufo-sighting status --lite      # machine-readable`,
    `       ls -1 ${path.join(REPO_ROOT, REPORT_DIR)}/*.md | wc -l              # expect ${opts.lanes}`,
    "       A wall row with levels.l2 null and levelDetails.l2.status \"opaque\"",
    "       means UNKNOWN, not settled — say so instead of claiming a clean run.",
    "",
    "    4. record the agent ids the task call returned, so a later wave can",
    "       resume these members by name (REAL ids, not the synthetic one this",
    "       dry run used):",
    `       cd ${opts.ufoRoot} && UFO_PROJECT_ROOT=${SCRATCH_ROOT} \\`,
    `         node scripts/ufo-swarm-wave.mjs record --registry ${admitted.registryRel} \\`,
    `         --assignments '{"${admitted.payload.taskCall.tasks[0].name}":"<real agent id>", …one entry per lane…}'`,
    "",
    "    5. collect the settled outcomes into the evidence envelope (note the",
    "       `collect` subcommand; --results is a ufo-swarm-results-v1 file with one",
    "       row per member, status ∈ completed|failed|timeout|cancelled|aborted):",
    `       cd ${opts.ufoRoot} && UFO_PROJECT_ROOT=${SCRATCH_ROOT} \\`,
    `         node scripts/ufo-swarm-collect.mjs collect --wave ${admitted.payloadPath} \\`,
    "         --results <settled.json> \\",
    `         --out ${path.join(EVIDENCE, "wave-envelope.json")}`,
    `       then assert reportSummary.present == ${opts.lanes} and reportSummary.missing == []`,
    "",
    "    6. close the wall mission honestly. complete --mission takes a REGISTERED",
    "       runId or m_<hex> — a swarm lane is not one — and it kills that",
    "       mission's pane, so running it before the lanes settled would end the",
    "       wave you are testing. Probe first, then complete:",
    `       cd ${opts.ufoRoot} && bash scripts/ufo-sighting complete --mission <RUN_OR_MISSION> --dry-run`,
    `       cd ${opts.ufoRoot} && bash scripts/ufo-sighting complete --mission <RUN_OR_MISSION> \\`,
    `         --note "32-lane sighting wave smoke: N/${opts.lanes} lanes reported"`,
    "       If no mission was ever registered for the parent session, there is",
    "       nothing to complete: record that honestly (MISSION_NOT_FOUND is the",
    "       expected code) rather than registering a dummy row to close it.",
    "",
  ];
  for (const line of lines) say(line);
  writeEvidence("dispatch-boundary.txt", `${lines.join("\n")}\n`);
  return lines.join("\n");
}

// ── finish ─────────────────────────────────────────────────────────────────
function finish(code) {
  const passed = results.filter((row) => row.ok).length;
  const failed = results.filter((row) => !row.ok);
  say("");
  say(`── verdict ${"─".repeat(58)}`);
  if (failed.length === 0) {
    say(`  ok   ${passed} checks passed; nothing dispatched.`);
  } else {
    say(`  FAIL ${failed.length} of ${passed + failed.length} checks failed:`);
    for (const row of failed) say(`       ${row.id}: ${row.detail}`);
  }
  try {
    writeEvidenceJson("manifest.json", {
      schema: "ufo-sighting-wave-smoke-manifest-v1",
      stamp,
      generatedAt: new Date().toISOString(),
      repoRoot: REPO_ROOT,
      ufoRoot: opts.ufoRoot,
      bandMode: opts.band,
      lanes: opts.lanes,
      wave: WAVE_NAME,
      reportDir: REPORT_DIR,
      evidenceDir: EVIDENCE,
      scratchProjectRoot: SCRATCH_ROOT,
      liveWall: opts.liveWall,
      dispatched: false,
      node: process.versions.node,
      ...runMeta,
      checks: results,
      passed: failed.length === 0,
      exitCode: code,
    });
  } catch {
    // The manifest is evidence, not a gate: a failure to write it must not mask
    // the verdict already printed.
  }
  say(`  evidence: ${EVIDENCE}`);
  process.exit(code);
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  say(`ufo-sighting 32-lane wave smoke test — dry half`);
  say(`  repo:      ${REPO_ROOT}`);
  say(`  ufo root:  ${opts.ufoRoot}`);
  say(`  band mode: ${opts.band}`);
  say(`  lanes:     ${opts.lanes}`);
  say(`  evidence:  ${EVIDENCE}`);
  say(`  live wall: ${opts.liveWall ? "YES — ufo-sighting verbs will run" : "no — wall commands are printed only"}`);
  mkdirSync(EVIDENCE, { recursive: true });

  const delta = parseJson(readFileSync(DELTA_PATH, "utf8"), "preflight.delta");
  if (!Number.isSafeInteger(delta?.swarm?.waveMinLanes)) gate("preflight.delta", "host/ufo-sighting-dispatch.json has no swarm.waveMinLanes");
  if (opts.lanes < delta.swarm.waveMinLanes || opts.lanes > Math.min(delta.swarm.waveMaxLanes, HARD_CEILING)) {
    die(64, `--lanes ${opts.lanes} is outside the band under test ${delta.swarm.waveMinLanes}-${Math.min(delta.swarm.waveMaxLanes, HARD_CEILING)}`);
  }

  const preflightState = preflight();
  await loadAuthorities();
  const band = resolveBand(delta);
  const admitted = await planAndRun(band);
  negatives(band, admitted);
  await routeFamilies(band, admitted);
  await bandCrossCheck(delta, admitted);
  const wallState = wall(preflightState);
  dispatchBoundary(admitted);

  runMeta.band = { mode: band.mode, configPath: band.configPath, expected: band.expected };
  runMeta.wall = { executed: wallState.executed, commands: wallState.wallCommands.map((command) => command.args.join(" ")) };
  runMeta.payload = { path: admitted.payloadPath, registry: admitted.registryAbs, lanes: admitted.payload?.taskCall?.tasks?.length ?? 0 };
  runMeta.seatAliases = Object.fromEntries(seatAlias);
  finish(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  say("");
  say(`── unexpected failure ──`);
  say(`  ${error?.stack ?? error?.message ?? error}`);
  process.exit(1);
});
