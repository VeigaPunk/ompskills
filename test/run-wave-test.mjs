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
 *                  hard: no verified global config, no test. Then the
 *                  authorities: the checkout's own planner module and the seat
 *                  → @alias table resolved from the live global config, so
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
 *   6. negatives   the spawn-wave size matrix, each expected code DERIVED from
 *                  the resolved band (floor-1 refused too_few_lanes; floor and
 *                  wave ceiling admitted; ceiling+1 and the 256-lane cap
 *                  refused wave_too_wide; cap+1 too_many_lanes); the per-spec
 *                  cap (below the floor impossible_band, at the ceiling it
 *                  tightens, above the policy cap it is clamped and never
 *                  widened); the resume exemption measured at BOTH ends of the
 *                  band it is exempt from (below the floor and above the
 *                  ceiling admitted, past the cap still refused, and the
 *                  resume-only dispatch carrying taskCall null, one hub send
 *                  per lane, no godspeed invocation); resumes counted toward a
 *                  spawn wave's total; the typed refusal vocabulary with its
 *                  shared error envelope; and route-family concentration
 *                  recomputed from the candidate seat table.
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
 *   node test/run-wave-test.mjs --lanes 24          # a wider wave in-band
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
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TEST_DIR, "..");
const HOST_DIR = path.join(REPO_ROOT, "host");
const APPLY_SCRIPT = path.join(HOST_DIR, "apply.mjs");
const GLOBAL_CONFIG = path.join(homedir(), ".omp", "agent", "config.yml");
const DELTA_PATH = path.join(HOST_DIR, "ufo-sighting-dispatch.json");
const EVIDENCE_ROOT = path.join(TEST_DIR, "evidence");
const DEFAULT_UFO_ROOT = "/home/vgpnk/Projects/ufo-fsd-alpha";
const WAVE_SESSION = "ufo_sighting";

// The operator directive under test: "dispatched in swarms of 32-256, up to
// 256 per round". 32 is the narrowest legal spawn wave after the apply, so it
// is the wave this script proves admissible; 31 is the refusal that shows the
// floor bites, 257 the one that shows the wave ceiling and member cap bite.
const FLOOR_LANES = 32;
const HARD_CEILING = 256;
// Every typed refusal is this envelope on stderr with exit 1 — never the plan
// schema the admitted path uses. Each code asserted below is checked with it.
const WAVE_ERROR_SCHEMA = "ufo-swarm-wave-error-v1";

// Two route families on purpose. Which family a role lands in is read from the
// candidate global config at runtime (loadAuthorities), never hardcoded here:
// on the current candidate scout+scribe+simplifier+mutation-tester resolve to
// @m_fast and reviewer+executor+connector+sentinel+revenger to @m_mid, so a
// wave mixing them is not a singleFamily concentration (the all-in-one-family
// death shapes the route preflight exists to flag).
const MIXED_ROLES = ["scout", "reviewer", "scribe", "executor"];
// One family only, for the negative singleFamily assertion. Never dispatched.
const SINGLE_FAMILY_ROLES = ["simplifier", "mutation-tester", "executor", "scribe"];

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
  const routing = routingMod.readGlobalSeatRouting({ path: GLOBAL_CONFIG });
  seatAlias = new Map([...routing.seats].map(([seat, entry]) => [seat, entry?.via?.alias ?? null]));
  ok("authority.seats", `${seatAlias.size} seats resolved from the live global config ${GLOBAL_CONFIG} (sha256 ${routing.sha256.slice(0, 16)}…)`);
  const unpinned = [...MIXED_ROLES, ...SINGLE_FAMILY_ROLES].filter((role) => !seatAlias.has(role));
  check("authority.pinned", unpinned.length === 0,
    unpinned.length === 0
      ? `every role this test uses is pinned by task.agentModelOverrides: ${[...new Set([...MIXED_ROLES, ...SINGLE_FAMILY_ROLES])].map((role) => `${role}→@${seatAlias.get(role)}`).join(", ")}`
      : `these roles are not pinned in the global config, so no family can be attributed: ${JSON.stringify(unpinned)}`);
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

/** How many godspeed invocation bytes a composed lane text carries anywhere. */
function godspeedInvocations(text) {
  return (String(text ?? "").match(/\/skill:godspeed/gu) ?? []).length;
}

const USAGE = [
  "usage: node test/run-wave-test.mjs [--ufo-root PATH] [--band fixture|live]",
  "                                   [--lanes N] [--report-dir REL] [--out DIR]",
  "                                   [--live-wall] [--verify] [--help]",
  "  --ufo-root PATH   ufo-fsd-alpha checkout (default " + DEFAULT_UFO_ROOT + ")",
  "  --band MODE       fixture: synthesize the post-apply band from host/ (default)",
  "                    live: read the checkout's config/ufo.json as the band authority",
  "                    and refuse with apply_not_landed while the floor is not 32",
  "  --lanes N         spawn lanes for the admitted wave (default 32, band 32-256)",
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
    ["preflight.globalConfig", GLOBAL_CONFIG],
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
  ok("preflight.apply", `host/apply.mjs dry run exit 0 (resolver, route gate, replicated compile gate and its own 32-256 wave-band gate all pass) — log ${displayPath(applyLog)}`);

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
    // The real file is the authority, and the WHOLE band must already match the
    // merged delta — a partial apply that landed the floor but left the wave
    // ceiling or the cap pre-apply would otherwise pass this gate as the live
    // authority, and only the downstream matrix would notice, only for the cells
    // it happens to cover.
    const drifted = ["waveMinLanes", "waveMaxLanes", "maxLanes"]
      .filter((key) => liveSwarm[key] !== delta.swarm[key])
      .map((key) => `swarm.${key} ${liveSwarm[key]} (delta ${delta.swarm[key]})`);
    if (drifted.length > 0) {
      die(1, `apply_not_landed: ${LIVE_CONFIG} still declares ${drifted.join(", ")}; `
        + `--band live needs the merged delta (${["waveMinLanes", "waveMaxLanes", "maxLanes"].map((key) => `${key} ${delta.swarm[key]}`).join(", ")}). `
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

  // fixture: the checkout's own config with exactly the delta's six values set,
  // which is the object state `apply.mjs --apply` produces. The merge is
  // in-memory and lands inside the evidence tree.
  const fixture = JSON.parse(liveRaw);
  const dispatch = fixture.sighting.dispatch;
  dispatch.maxConcurrentL1 = delta.maxConcurrentL1;
  dispatch.missionFormat.l1Alias = delta.missionFormat.l1Alias;
  dispatch.swarm.maxLanes = delta.swarm.maxLanes;
  dispatch.swarm.minLanes = delta.swarm.minLanes;
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
  const specPrompts = spec.items.map((item) => item.prompt);
  check("spec.distinct", new Set(specPrompts).size === specPrompts.length,
    `${new Set(specPrompts).size} pairwise-distinct prompts for ${specPrompts.length} lanes — a duplicate expansion is a typed refusal, never a silent dedupe, and run.distinctPrompts re-proves it on the composed payload`);
  check("spec.rolesExplicit", spec.items.every((item) => typeof item.role === "string" && waveMod.SWARM_ROLES.has(item.role)) && specRoles.length >= 2,
    `every one of the ${spec.items.length} lanes carries an explicit taxonomy role from the planner's ${waveMod.SWARM_ROLES.size} (${JSON.stringify(specRoles)}), so no lane hides behind its siblings`);
  check("spec.routeFamilies", new Set(specRoles.map(familyOf)).size >= 2,
    `roles span ${new Set(specRoles.map(familyOf)).size} route families on the candidate global config — ${specRoles.map((role) => `${role}→@${familyOf(role)}`).join(", ")} — so the wave is not a singleFamily concentration`);
  // reportDir is the directory the planner joins into every lane's report path,
  // so the shape the planner enforces is asserted here rather than described:
  // relative, no backslash, no empty/'.'/'..' segment (the planner refuses a
  // violating value as invalid_report_dir; --report-dir must fail here first).
  check("spec.reportDir", typeof spec.reportDir === "string" && !spec.reportDir.startsWith("/")
    && !spec.reportDir.includes("\\")
    && !spec.reportDir.split("/").some((segment) => segment === "" || segment === "." || segment === ".."),
    `reportDir ${JSON.stringify(spec.reportDir)} is a relative path with no empty, '.' or '..' segment`);

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
  // The plan's own provenance echo. `source` must be "config" — a planner that
  // fell through to the built-in defaults (floor 2) would otherwise measure a
  // band nobody declared — and the effective cap must be the resolved one, with
  // the hard ceiling read from the planner rather than assumed.
  check("plan.capAuthority", plan?.policy?.maxLanes === band.expected.maxLanes
    && plan?.policy?.source === "config"
    && plan?.policy?.hardCeiling === HARD_CEILING,
    `the plan was judged by the resolved authority: maxLanes ${plan?.policy?.maxLanes} == cap ${band.expected.maxLanes}, source ${JSON.stringify(plan?.policy?.source)}, hard ceiling ${plan?.policy?.hardCeiling}`);
  ok("plan.admittedSize", `${opts.lanes} lanes admitted inside ${band.expected.waveMinLanes}-${band.expected.waveMaxLanes}${opts.lanes === band.expected.waveMinLanes ? " (exactly the floor — the narrowest legal spawn wave)" : opts.lanes === band.expected.waveMaxLanes ? " (exactly the wave ceiling — the widest legal spawn wave)" : ""}`);

  rule(`5/8  run — the ufo-swarm-wave-dispatch-v1 payload`);
  const ran = waveCli("run", specPath, [], band.env);
  const payloadPath = writeEvidence(`dispatch-${opts.lanes}.json`, ran.stdout || ran.raw);
  if (ran.status !== 0) {
    gate("run.exit", `run exited ${ran.status}: ${ran.raw.slice(0, 400)}`);
  }
  const payload = ran.json;
  check("run.schema", payload?.schema === "ufo-swarm-wave-dispatch-v1", `schema ${payload?.schema}`);

  const tasks = payload?.taskCall?.tasks ?? [];
  // A payload with the wrong lane count is a structural failure, not a datum:
  // every `every()` assertion below would be vacuously true on an empty list, so
  // this stops the run instead of letting a short payload pass them all.
  if (tasks.length !== opts.lanes) {
    gate("run.laneCount", `${tasks.length} spawn lanes in the payload, want ${opts.lanes} (resumeSends ${payload?.resumeSends?.length ?? 0}) — every lane assertion below would be vacuous on a short list`);
  }
  ok("run.laneCount", `${tasks.length} spawn lanes in exactly one taskCall (resumeSends ${payload?.resumeSends?.length ?? 0})`);
  check("run.noModelParam", tasks.every((task) => !("model" in task)),
    `no lane carries a model param — task keys are ${JSON.stringify([...new Set(tasks.flatMap((task) => Object.keys(task)))].sort())}; routing is the global config's role→alias table`);
  check("run.godspeedLeading", tasks.every((task) => typeof task.task === "string" && GODSPEED_LEADING.test(task.task)),
    `every spawned task opens with the leading line ${JSON.stringify(GODSPEED_INVOCATION)}`);
  check("run.godspeedSingle", tasks.every((task) => godspeedInvocations(task.task) === 1),
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
  const registryRows = Object.values(registry?.members ?? {});
  check("run.registryMembers", registryRows.length === opts.lanes
    && registryRows.every((row) => row.kind === "spawn" && row.agentId === null),
    `${registryRows.length} members, every row kind "spawn" with a null agentId until \`record\` fills it (agentIds seen: ${JSON.stringify([...new Set(registryRows.map((row) => row.agentId))])})`);
  const registryCopy = path.join(EVIDENCE, "swarm-registry.json");
  copyFileSync(registryAbs, registryCopy);
  ok("run.registryCopy", `copied to ${registryCopy} (authoritative copy stays at ${registryAbs})`);

  return { spec, specPath, plan, payload, payloadPath, registryRel, registryAbs, registryCopy };
}

// ── step 6 helpers: expectations derived from the band, not a restated table
/**
 * What the resolved band says a spawn wave of `lanes` must get. Deriving the
 * expected code from the band (rather than listing edges as literals) is what
 * makes a band that moved without this script changing fail here instead of
 * quietly measuring the old edges.
 */
function bandVerdict(lanes, band) {
  if (lanes > band.expected.maxLanes) return "too_many_lanes";
  if (lanes > band.expected.waveMaxLanes) return "wave_too_wide";
  if (lanes < band.expected.waveMinLanes) return "too_few_lanes";
  return null;
}

/** A spawn spec of `lanes` lanes, with an optional per-spec cap. */
function bandSpec(lanes, wave, maxLanes) {
  const spec = buildSpec(lanes, MIXED_ROLES, wave, "Never dispatched: this spec exists to prove a band boundary.");
  if (maxLanes !== undefined) spec.maxLanes = maxLanes;
  return spec;
}

/** Plan one spec, keep its raw output as evidence, return the parsed result. */
function planCase(evidenceName, specPath, band) {
  const result = waveCli("plan", specPath, [], band.env);
  writeEvidence(evidenceName, result.raw || "<empty stdout and stderr>\n");
  return result;
}

/**
 * One typed refusal as a single conjunction: exit 1, the exact code, and the
 * shared refusal envelope. A refusal that exits 0, names another code, or drops
 * the envelope fails — none of those is a pass.
 */
function refusal(id, result, code, why) {
  const json = result.json;
  const observed = `exit ${result.status}, code ${JSON.stringify(json?.code ?? null)}, schema ${JSON.stringify(json?.schema ?? null)}`;
  check(id, result.status === 1 && json?.code === code && json?.schema === WAVE_ERROR_SCHEMA,
    `${code} (${observed}) — ${why}${json?.message ? `: ${json.message}` : ""}`);
  return json;
}

/** One admitted plan as a single conjunction: exit 0 and the exact counts. */
function admission(id, result, expected, why) {
  const counts = result.json?.counts ?? null;
  check(id, result.status === 0 && counts !== null
    && counts.spawn === expected.spawn && counts.resume === expected.resume && counts.total === expected.total,
    `exit ${result.status}, counts ${JSON.stringify(counts)} (want ${JSON.stringify(expected)}) — ${why}`);
  return result.json;
}

/**
 * A prior wave's registry, sized past one legal wave. The planner needs an
 * owned member per resume lane, and no legal wave carries more than the wave
 * ceiling — so the resume-only shapes that must sit ABOVE the ceiling, and the
 * cap boundary itself, can only be declared against a registry wider than any
 * one wave. This fixture is that registry; it is `ufo-swarm-registry-v1`, the
 * planner validates it like any other, and a malformed or duplicated handle
 * would refuse rather than pass.
 */
function priorsFixture(count, wave) {
  const members = {};
  for (let i = 0; i < count; i += 1) {
    members[`FixturePrior${String(i + 1).padStart(3, "0")}`] = {
      kind: "spawn",
      role: MIXED_ROLES[i % MIXED_ROLES.length],
      agentId: `agent-prior${String(i + 1).padStart(16, "0")}`,
      item: null,
    };
  }
  const rel = `priors/${wave}/swarm-registry.json`;
  const abs = path.join(SCRATCH_ROOT, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify({
    schema: "ufo-swarm-registry-v1",
    wave: `${wave}-priors`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reportDir: `priors/${wave}`,
    members,
  }, null, 1)}\n`, "utf8");
  return { rel, abs, ids: Object.values(members).map((member) => member.agentId), names: Object.keys(members) };
}

// ── step 6: negative assertions ────────────────────────────────────────────
function negatives(band, admitted) {
  rule("6/8  negatives — the band edges, the resume exemption, the route families");

  const floor = band.expected.waveMinLanes;
  const ceiling = band.expected.waveMaxLanes;
  const cap = band.expected.maxLanes;
  check("negative.bandShape", floor >= 1 && floor < ceiling && ceiling <= cap && cap <= HARD_CEILING,
    `the band resolved from the ${band.mode} authority is coherent: floor ${floor} < wave ceiling ${ceiling} <= cap ${cap} <= hard ceiling ${HARD_CEILING}`);

  // The file's own directive constants must agree with the band authority it was
  // handed. The cap half is the load-bearing one (a delta cap tightened to 99
  // flips this check alone); the floor half is backstopped upstream by the apply
  // dry run's own hardcoded 32-lane probe, which refuses any delta floor other
  // than the directive's before section 6 is reached — a floor drift is caught,
  // just earlier and by a different gate.
  check("negative.authorityConstants", FLOOR_LANES === floor && HARD_CEILING === cap,
    `the directive constants agree with the ${band.mode} authority: FLOOR_LANES ${FLOOR_LANES} == floor ${floor}, HARD_CEILING ${HARD_CEILING} == cap ${cap} (the cap half is the one no earlier gate covers)`);

  // 6a: the spawn-wave size matrix. Every cell asserts exactly what the band's
  // own arithmetic predicts, so floor, wave ceiling and cap are all pinned by
  // observation — cap and wave ceiling coincide under the 32-256 directive,
  // so a ceiling-lane wave is judged once, by the wave bound.
  const sizeMatrix = [...new Set([floor - 1, floor, floor + 1, ceiling, ceiling + 1, cap, cap + 1])]
    .filter((lanes) => lanes >= 1)
    .sort((a, b) => a - b);
  for (const lanes of sizeMatrix) {
    const code = bandVerdict(lanes, band);
    const specPath = specFile(`spec-band-${lanes}.json`, bandSpec(lanes, `sighting-wave-band-${lanes}`));
    const result = planCase(`band-${lanes}.json`, specPath, band);
    if (code === null) {
      admission(`negative.band.admits.${lanes}`, result, { spawn: lanes, resume: 0, total: lanes },
        `${lanes} lanes sits inside ${floor}-${ceiling} and plans clean — nothing was dispatched`);
    } else {
      refusal(`negative.band.${code}.${lanes}`, result, code,
        `a ${lanes}-lane spawn wave is refused as the band's arithmetic predicts (floor ${floor}, wave ceiling ${ceiling}, cap ${cap})`);
    }
  }

  // 6b: the per-spec cap. It may only tighten, and it is judged before the wave
  // ceiling — so a cap pinched below the policy ceiling refuses the lane count
  // as too_many_lanes, and a cap declared above the ceiling cannot widen the
  // wave either: when the ceiling and the member cap coincide (the 32-256
  // band), the same refusal fires as too_many_lanes, and when they diverge a
  // ceiling+1 wave under the cap is wave_too_wide. A cap below the floor makes
  // the band unreachable, and feasibility is judged before both size checks.
  const capMatrix = [
    { lanes: floor, maxLanes: floor - 1, code: "impossible_band",
      why: `cap ${floor - 1} < floor ${floor}: no spawn wave can satisfy the band, and feasibility is judged first` },
    { lanes: floor - 1, maxLanes: floor, code: "too_few_lanes",
      why: `cap ${floor} == floor: the band is reachable, so the short lane count is the refusal` },
    { lanes: ceiling + 1, maxLanes: ceiling + 1, code: ceiling + 1 > cap ? "too_many_lanes" : "wave_too_wide",
      why: `a cap declared at ${ceiling + 1} cannot widen the wave: ${ceiling + 1} lanes is refused${ceiling + 1 > cap ? " by the shared ceiling/cap" : " as wave_too_wide"}` },
    { lanes: cap, maxLanes: cap - 1, code: "too_many_lanes",
      why: `a cap tightened to ${cap - 1} refuses the ${cap} lanes the policy cap would have admitted — the cap is judged before the wave ceiling` },
  ];
  for (const { lanes, maxLanes, code, why } of capMatrix) {
    const specPath = specFile(`spec-cap-${maxLanes}x${lanes}.json`, bandSpec(lanes, `sighting-wave-cap-${maxLanes}x${lanes}`, maxLanes));
    refusal(`negative.cap.${code}.${maxLanes}x${lanes}`, planCase(`cap-${maxLanes}x${lanes}.json`, specPath, band), code, why);
  }
  const tightPath = specFile("spec-cap-tight.json", bandSpec(ceiling, "sighting-wave-cap-tight", ceiling));
  const tight = planCase("cap-tight.json", tightPath, band);
  admission(`negative.cap.admits.${ceiling}x${ceiling}`, tight, { spawn: ceiling, resume: 0, total: ceiling },
    `a spec cap exactly at the wave ceiling still admits ${ceiling} lanes`);
  check("negative.cap.echo", tight.json?.policy?.maxLanes === ceiling && tight.json?.policy?.declaredMaxLanes === ceiling,
    `the plan echoes both caps: policy.maxLanes ${tight.json?.policy?.maxLanes}, declaredMaxLanes ${tight.json?.policy?.declaredMaxLanes}`);

  // A declared cap above the policy cap is clamped, never widened: the effective
  // cap stays at the policy's while the declaration is recorded as unapplied.
  const widenPath = specFile("spec-cap-widen.json", bandSpec(ceiling, "sighting-wave-cap-widen", cap + 1));
  const widen = planCase("cap-widen.json", widenPath, band);
  const widenCounts = widen.json?.counts ?? null;
  check("negative.cap.tightenOnly", widen.status === 0 && widenCounts?.spawn === ceiling && widenCounts?.total === ceiling
    && widen.json?.policy?.maxLanes === cap && widen.json?.policy?.declaredMaxLanes === cap + 1,
    `a declared cap of ${cap + 1} cannot widen the ${cap}-lane policy cap: exit ${widen.status}, counts ${JSON.stringify(widenCounts)}, policy.maxLanes ${widen.json?.policy?.maxLanes}, declaredMaxLanes ${widen.json?.policy?.declaredMaxLanes}`);

  // 6d — the resume exemption, probed against the band it is exempt from. Every
  // spawn row of the admitted wave first receives a SYNTHETIC handle (a live run
  // records the ids the task call returned), and a second registry fixture is
  // sized past one legal wave so the exemption can be probed ABOVE the ceiling
  // too, not just below the floor. Plan and run only — no dispatch, no hub send.
  const memberNames = (admitted.payload?.taskCall?.tasks ?? []).map((task) => task.name);
  if (memberNames.length === 0) gate("negative.resume", "the admitted payload has no spawn lane to own a handle");
  const synthetic = memberNames.map((name, i) => [name, `agent-dryrun${String(i + 1).padStart(16, "0")}`]);
  const syntheticAgent = synthetic[0][1];
  const recorded = run(process.execPath, [
    WAVE_CLI, "record",
    "--registry", admitted.registryRel,
    "--assignments", JSON.stringify(Object.fromEntries(synthetic)),
  ], { env: plannerEnv(band.env) });
  writeEvidence("record-synthetic.stdout.json", recorded.stdout || recorded.stderr);
  check("negative.record", recorded.status === 0,
    `record filled ${synthetic.length} members with synthetic handles (a live run records the ids the task call returned)`);

  const priors = priorsFixture(cap + 1, WAVE_NAME);
  ok("negative.priors", `a ${priors.ids.length}-member fixture registry (wider than any one legal wave) is the owned-handle pool for the resume shapes above the ceiling — ${displayPath(priors.abs)}`);

  /** A resume-only spec of `n` lanes drawn from the fixture registry. */
  const resumeOnlySpec = (n, wave, maxLanes) => {
    const spec = {
      wave,
      priorRegistry: priors.rel,
      items: priors.ids.slice(0, n).map((id, i) => ({
        resume: id,
        message: `Resume smoke-test lane ${i + 1} of ${n}: continue your assigned lane and report the one observable fact you recorded.`,
      })),
    };
    if (maxLanes !== undefined) spec.maxLanes = maxLanes;
    return spec;
  };

  // The exemption is from the band, never from the cap: below the floor is
  // admitted, and one lane past the cap is not. With ceiling == cap, lanes
  // above the ceiling are already past the cap — too_many_lanes, never an
  // admitted exemption case.
  const resumeCases = [
    { lanes: floor - 1, admit: true, why: `below the ${floor}-lane floor` },
    { lanes: ceiling + 1, admit: ceiling + 1 <= cap, code: "too_many_lanes", why: `above the ${ceiling}-lane wave ceiling${ceiling + 1 > cap ? ", which is already past the shared cap" : ""}` },
    { lanes: cap + 1, admit: false, code: "too_many_lanes", why: `one lane past the ${cap}-lane cap` },
  ];
  for (const { lanes, admit, code, why } of resumeCases) {
    if (lanes > priors.ids.length) {
      check(`negative.resume.pool.${lanes}`, false, `the fixture registry holds ${priors.ids.length} handles, short of the ${lanes} this case needs`);
      continue;
    }
    const specPath = specFile(`spec-resume-only-${lanes}.json`, resumeOnlySpec(lanes, `${WAVE_NAME}-resume-${lanes}`));
    const result = planCase(`resume-only-${lanes}.json`, specPath, band);
    if (admit) {
      admission(`negative.resume.floorExempt.${lanes}`, result, { spawn: 0, resume: lanes, total: lanes },
        `a ${lanes}-lane resume-only wave is admitted with zero spawn lanes — ${why}, and resumes are continuity rather than a new wave`);
    } else {
      refusal(`negative.resume.capBinds.${lanes}`, result, code,
        `the exemption is from the band only: ${lanes} resume lanes are still refused — ${why}`);
    }
  }

  // A resume lane keeps the member's identity: the plan row is kind "resume"
  // with a null handle and the ORIGINAL member name, because the handle binds at
  // record time, never at plan time.
  const onePath = specFile("spec-resume-only.json", resumeOnlySpec(1, `${WAVE_NAME}-resume`));
  const one = planCase("plan-resume-only.json", onePath, band);
  admission("negative.resume.one", one, { spawn: 0, resume: 1, total: 1 }, `one resume lane is admitted far below the ${floor}-lane floor`);
  const oneRows = Object.entries(one.json?.registry?.members ?? {});
  check("negative.resume.identity", oneRows.length === 1 && oneRows[0][1].kind === "resume"
    && oneRows[0][1].agentId === null && oneRows[0][1].member === priors.names[0],
    `the resume row is ${JSON.stringify(oneRows[0]?.[1] ?? null)} — kind "resume", a null handle, and the original member name ${JSON.stringify(priors.names[0])}`);
  const resumeLane = one.json?.tasks?.[0] ?? null;
  check("negative.resumeNoGodspeed", resumeLane !== null && godspeedInvocations(resumeLane.message) === 0,
    "the resume message carries no /skill:godspeed invocation — a resumed lane keeps its session, and a stacked invocation would reach it twice");

  // The resume-only dispatch shape: no task call at all, one hub send per lane.
  const resumeRun = waveCli("run", onePath, [], band.env);
  writeEvidence("run-resume-only.json", resumeRun.raw || "<empty stdout and stderr>\n");
  const resumePayload = resumeRun.json;
  check("negative.resume.taskCallNull", resumeRun.status === 0 && resumePayload !== null && "taskCall" in resumePayload && resumePayload.taskCall === null,
    `run exits ${resumeRun.status} with taskCall ${JSON.stringify(resumePayload?.taskCall)} — a resume-only wave issues no task call`);
  const sends = resumePayload?.resumeSends ?? [];
  check("negative.resume.sends", sends.length === 1 && sends[0]?.resume === priors.ids[0]
    && typeof sends[0]?.message === "string" && godspeedInvocations(sends[0].message) === 0,
    `one hub send bound to ${JSON.stringify(sends[0]?.resume ?? null)} with a ${(sends[0]?.message ?? "").length}-byte message and no godspeed invocation (keys ${JSON.stringify(Object.keys(sends[0] ?? {}).sort())})`);

  // A wave carrying even one spawn lane is a spawn wave: its TOTAL (spawn +
  // resumes) must satisfy the band, which is what makes "resume-only" the exact
  // shape of the exemption.
  const mixedCases = [
    { spawns: 1, resumes: floor - 2, code: "too_few_lanes" },
    { spawns: 1, resumes: floor - 1, code: null },
  ];
  for (const { spawns, resumes, code } of mixedCases) {
    const total = spawns + resumes;
    const spec = {
      wave: `${WAVE_NAME}-mixed-${total}`,
      priorRegistry: priors.rel,
      items: [
        ...Array.from({ length: spawns }, (_, i) => ({ role: "scout", prompt: `Mixed smoke-test spawn lane ${i + 1} of ${spawns}: report one observable fact.` })),
        ...priors.ids.slice(0, resumes).map((id, i) => ({ resume: id, message: `Mixed smoke-test resume lane ${i + 1} of ${resumes}: continue your lane.` })),
      ],
    };
    const specPath = specFile(`spec-mixed-${total}.json`, spec);
    const result = planCase(`mixed-${total}.json`, specPath, band);
    if (code === null) {
      admission(`negative.mixed.admits.${total}`, result, { spawn: spawns, resume: resumes, total },
        `${spawns} spawn + ${resumes} resumes = ${total} is admitted: resumes count toward the band of a spawn wave`);
    } else {
      refusal(`negative.mixed.${code}.${total}`, result, code,
        `${spawns} spawn + ${resumes} resumes = ${total} is refused: with a spawn lane present the floor is enforced on the total, not on the spawn count`);
    }
  }

  // The per-spec cap still binds a resume-only wave, so the exemption is exactly
  // the 32-256 band and nothing else: cap 1 refuses 2 resume lanes.
  const capPath = specFile("spec-resume-cap.json", resumeOnlySpec(2, `${WAVE_NAME}-resume-cap`, 1));
  refusal("negative.resume.specCap", planCase("resume-cap.json", capPath, band), "too_many_lanes",
    "a per-spec cap of 1 refuses 2 resume lanes — the cap is not part of the band exemption");

  // The one lane count where the clamp itself decides admission: a resume-only
  // wave one lane past the cap that declares its own cap high enough to admit
  // itself. The wave ceiling never applies to a resume-only wave, so the clamp
  // is the only guard left — a planner that widened on a declaration would admit
  // this wave, and nothing else in the suite would notice.
  const widenResumePath = specFile("spec-resume-widen.json", resumeOnlySpec(cap + 1, `${WAVE_NAME}-resume-widen`, cap + 1));
  refusal("negative.resume.widenRefused", planCase("resume-widen.json", widenResumePath, band), "too_many_lanes",
    `a resume-only wave of ${cap + 1} lanes declaring its own cap of ${cap + 1} is still refused by the clamped ${cap}-lane policy cap`);

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
    {
      id: "resume_item_forbidden",
      why: "a resume re-declaring the member's item would fork the partition the spawn bound",
      spec: () => ({
        wave: `${WAVE_NAME}-resumeitem`,
        priorRegistry: admitted.registryRel,
        items: [{ resume: syntheticAgent, item: "Refusal probe: item on a resume.", message: "Refusal probe: item on a resume." }],
      }),
    },
    {
      id: "resume_meta_forbidden",
      why: "axes/milestone bind at spawn, so re-declaring them on a wake would fork the judgment contract",
      spec: () => ({
        wave: `${WAVE_NAME}-resumemeta`,
        priorRegistry: admitted.registryRel,
        items: [{ resume: syntheticAgent, axes: ["coverage"], message: "Refusal probe: axes on a resume." }],
      }),
    },
  ];
  for (const testCase of refusalCases) {
    const casePath = specFile(`refusals/${testCase.id}.json`, testCase.spec());
    refusal(`negative.refusal.${testCase.id}`, planCase(`refusals/${testCase.id}.output.json`, casePath, band), testCase.id, testCase.why);
  }

  // The admitted wave's own registry is the record path's live shape: `record`
  // just filled it with synthetic handles above, so its rows must now carry them
  // (the `run.registryMembers` claim below is the null-handle half of this).
  const filled = parseJson(readFileSync(admitted.registryAbs, "utf8"), "negative.registryFilled");
  const filledRows = Object.entries(filled?.members ?? {});
  const assigned = new Map(synthetic);
  check("negative.registryFilled", recorded.status === 0 && filledRows.length === synthetic.length
    && filledRows.every(([name, row]) => row.agentId === assigned.get(name)),
    `record exited ${recorded.status} and wrote the handle it was handed into each of the ${filledRows.length} rows (want ${synthetic.length}) — the registry is the resume authority a later wave names`);

  // 6f: route-family concentration is asserted in routeFamilies(), which needs
  // the async module boundary — see main().
}

async function routeFamilies(band, admitted) {
  const mod = waveMod;
  const routingOptions = { path: GLOBAL_CONFIG };
  const reports = {};
  const ceiling = band.expected.waveMaxLanes;

  // In-process planSwarmWave would otherwise read the live config's band, which
  // is not the band under test until the apply lands. Judge with the resolved
  // band explicitly, the same injected-policy mechanism apply.mjs uses.
  const bandPolicy = {
    ...(admitted.plan?.policy ?? {}),
    source: "config",
    maxLanes: band.expected.maxLanes,
    waveMinLanes: band.expected.waveMinLanes,
    waveMaxLanes: band.expected.waveMaxLanes,
  };
  // Both waves are declared AT the wave ceiling, so the concentration shapes are
  // pinned where the band is tightest: the all-one-family death shape the
  // preflight exists to flag, and the spread wave this smoke test dispatches.
  const mixedSpecPath = specFile(`spec-route-mixed-${ceiling}.json`,
    buildSpec(ceiling, MIXED_ROLES, `sighting-wave-route-mixed-${ceiling}`, "Never dispatched: the route-family concentration probe."));
  const fastSpecPath = specFile(`spec-route-single-family-${ceiling}.json`,
    buildSpec(ceiling, SINGLE_FAMILY_ROLES, `sighting-wave-route-single-family-${ceiling}`, "Never dispatched: the one-family concentration probe."));
  const planOf = (specPath) => mod.planSwarmWave(JSON.parse(readFileSync(specPath, "utf8")), { policy: bandPolicy });
  const mixed = mod.waveRoutePreflight(planOf(mixedSpecPath), { routingOptions });
  const fast = mod.waveRoutePreflight(planOf(fastSpecPath), { routingOptions });
  reports.mixed = mixed;
  reports.singleFamily = fast;
  writeEvidenceJson("route-preflight.json", {
    globalConfig: GLOBAL_CONFIG,
    globalConfigSha256: sha256File(GLOBAL_CONFIG),
    note: "routePreflight against the live global config, the same table --route-families on the CLI reads.",
    mixedWave: mixed,
    singleFamilyWave: fast,
  });

  // The expectation is recomputed from the authority the preflight itself read —
  // the candidate seat -> alias table resolved in preflight — and grouped by the
  // alias each lane's role lands on. Comparing observed against that is what
  // makes these a cross-check of the report instead of a restatement of it. The
  // family KEY is the route+chain cascade (finer than the alias), so the alias
  // totals are compared and the family count is asserted to be at least the
  // alias count, never assumed equal.
  const aliasLanes = (lanes, roles) => {
    const byAlias = new Map();
    for (let i = 0; i < lanes; i += 1) {
      const alias = familyOf(roles[i % roles.length]);
      byAlias.set(alias, (byAlias.get(alias) ?? 0) + 1);
    }
    return byAlias;
  };
  const observedAliasLanes = (report) => {
    const byAlias = new Map();
    for (const family of report.families) byAlias.set(family.alias, (byAlias.get(family.alias) ?? 0) + family.lanes);
    return byAlias;
  };
  const sameTotals = (want, got) => want.size === got.size && [...want].every(([alias, lanes]) => got.get(alias) === lanes);
  const wantMixed = aliasLanes(ceiling, MIXED_ROLES);
  const wantFast = aliasLanes(ceiling, SINGLE_FAMILY_ROLES);

  const describe = (report) => `families ${report.concentration.families}, largest ${report.concentration.largestFamilyLanes}, `
    + `pinned ${report.concentration.pinnedLanes}, aliases ${JSON.stringify(report.families.map((family) => `${family.alias}:${family.lanes}`))}`;
  check("negative.routeFamiliesMixed", mixed.concentration.singleFamily === false
    && sameTotals(wantMixed, observedAliasLanes(mixed))
    && mixed.concentration.families >= wantMixed.size,
    `the ${ceiling}-lane mixed wave is NOT singleFamily and its per-alias lane totals match the candidate seat table (${describe(mixed)}; want ${JSON.stringify([...wantMixed])})`);
  check("negative.routeFamiliesSingle", fast.concentration.singleFamily === true && fast.concentration.families === 1
    && fast.concentration.largestFamilyLanes === ceiling && sameTotals(wantFast, observedAliasLanes(fast)),
    `an all-${familyOf(SINGLE_FAMILY_ROLES[0])} ${ceiling}-lane wave IS flagged singleFamily, one family of ${ceiling} lanes (${describe(fast)})`);
  check("negative.routePinned", mixed.concentration.pinnedLanes === ceiling && mixed.unpinned.length === 0
    && mixed.concentration.singleFamily === (wantMixed.size === 1 && ceiling > 1),
    `${mixed.concentration.pinnedLanes}/${ceiling} lanes are pinned by the candidate config, ${mixed.unpinned.length} unpinned, and the flag follows the collapse rule (${describe(mixed)})`);
  check("negative.routeUnprobed", mixed.status === "unprobed" && mixed.pings === 0
    && mixed.families.every((family) => family.status === "unprobed"),
    `with no probe the preflight records the sizing snapshot only: status ${JSON.stringify(mixed.status)}, ${mixed.pings} pings, family statuses ${JSON.stringify([...new Set(mixed.families.map((family) => family.status))])} — an absent probe never refuses`);
  check("negative.routeConfigBound", [mixed, fast].every((report) => report.config?.sha256 === sha256File(GLOBAL_CONFIG)),
    `both reports bind the routing authority they read: ${mixed.config?.path} sha256 ${String(mixed.config?.sha256).slice(0, 16)}… equals the global config on disk`);

  // The operator-facing form of the same checks, proved end to end: the CLI flag
  // with a fixture HOME holding a copy of the live config as .omp/agent/config.yml.
  // A live run needs no override — it reads the global config directly.
  const fixtureHome = path.join(EVIDENCE, "fixture-home");
  mkdirSync(path.join(fixtureHome, ".omp", "agent"), { recursive: true });
  copyFileSync(GLOBAL_CONFIG, path.join(fixtureHome, ".omp", "agent", "config.yml"));
  for (const [id, specPath, wantSingle] of [
    ["negative.routeCliMixed", mixedSpecPath, false],
    ["negative.routeCliSingleFamily", fastSpecPath, true],
  ]) {
    const cli = waveCli("plan", specPath, ["--route-families"], { ...band.env, HOME: fixtureHome });
    writeEvidence(`plan-route-families-${wantSingle ? "single" : "mixed"}.json`, cli.stdout || cli.raw);
    const concentration = cli.json?.routePreflight?.concentration ?? null;
    check(id, cli.status === 0 && concentration?.singleFamily === wantSingle,
      `plan --route-families (HOME=${fixtureHome}) exits ${cli.status} and reports singleFamily ${concentration?.singleFamily} over ${concentration?.families} families for the ${wantSingle ? "one-family" : "mixed"} wave`);
  }

  return reports;
}

// ── step 6g: band cross-check through the injected policy ──────────────────
async function bandCrossCheck(delta, admitted) {
  // The same mechanism apply.mjs's own wave gate uses: the real planner judging
  // the delta's numbers directly, independent of any config file on disk. It
  // pins host/ufo-sighting-dispatch.json as the source of the band this whole
  // test claims, and the policy echo below is what proves the injection bound —
  // an ignored injection would leave the ambient band in place and the matrix
  // would judge the wrong floor.
  const mod = waveMod;
  const injected = {
    ...(admitted.plan?.policy ?? {}),
    source: "config",
    maxLanes: delta.swarm.maxLanes,
    waveMinLanes: delta.swarm.waveMinLanes,
    waveMaxLanes: delta.swarm.waveMaxLanes,
  };
  const planOf = (spec, policy = injected) => mod.planSwarmWave(spec, { policy });
  const codeOf = (fn) => {
    try {
      fn();
      return null;
    } catch (error) {
      return error?.code ?? error?.message ?? "unknown";
    }
  };
  const specOf = (lanes, extra = {}) => ({
    ...JSON.parse(JSON.stringify(buildSpec(lanes, MIXED_ROLES, `sighting-wave-crosscheck-${lanes}`, "Never dispatched: an injected-policy probe."))),
    ...extra,
  });

  const admittedPlan = (() => {
    try {
      return planOf(JSON.parse(readFileSync(admitted.specPath, "utf8")));
    } catch (error) {
      return { error: error?.code ?? error?.message ?? "unknown" };
    }
  })();
  check("crosscheck.injected", admittedPlan?.policy?.waveMinLanes === delta.swarm.waveMinLanes
    && admittedPlan?.policy?.waveMaxLanes === delta.swarm.waveMaxLanes
    && admittedPlan?.policy?.maxLanes === delta.swarm.maxLanes,
    `the injected policy is what judged the plan: waveMinLanes ${admittedPlan?.policy?.waveMinLanes}, waveMaxLanes ${admittedPlan?.policy?.waveMaxLanes}, maxLanes ${admittedPlan?.policy?.maxLanes} — the delta's numbers echoed back, not the ambient config's`);
  check("crosscheck.admitted", admittedPlan?.counts?.total === opts.lanes,
    `injected post-apply band ${injected.waveMinLanes}-${injected.waveMaxLanes}: planSwarmWave admits ${admittedPlan?.counts?.total ?? JSON.stringify(admittedPlan)} lanes`);

  // The same refusals the band matrix asserts through the CLI, judged here by
  // the delta's numbers alone — so the floor, the wave ceiling and the cap are
  // the delta's, not a fixture artifact.
  const matrix = [
    [delta.swarm.waveMinLanes - 1, "too_few_lanes", `one below the delta's floor ${delta.swarm.waveMinLanes}`],
    [delta.swarm.waveMaxLanes + 1, delta.swarm.waveMaxLanes + 1 > delta.swarm.maxLanes ? "too_many_lanes" : "wave_too_wide", `one above the delta's wave ceiling ${delta.swarm.waveMaxLanes}`],
    [delta.swarm.maxLanes + 1, "too_many_lanes", `one above the delta's cap ${delta.swarm.maxLanes}`],
  ];
  for (const [lanes, code, why] of matrix) {
    const observed = codeOf(() => planOf(specOf(lanes)));
    check(`crosscheck.${code}.${lanes}`, observed === code,
      `the same planner refuses ${lanes} lanes as ${JSON.stringify(observed)} — ${why}, injected into the policy rather than read from a config`);
  }
  const capBelowFloor = codeOf(() => planOf(specOf(delta.swarm.waveMinLanes, { maxLanes: delta.swarm.waveMinLanes - 1 })));
  check("crosscheck.impossibleBand", capBelowFloor === "impossible_band",
    `a spec cap below the injected floor refuses as ${JSON.stringify(capBelowFloor)} — the injected band, not a file, is the authority`);

  // The resume exemption travels with the policy too: below-floor resume-only
  // lanes are admitted under the injected band, while the injected cap still
  // binds them. The prior registry is a fixture sized past one legal wave, and
  // the in-process planner resolves it against UFO_PROJECT_ROOT (declared as the
  // scratch root in main() before this module was imported).
  const belowFloor = delta.swarm.waveMinLanes - 1;
  const priors = priorsFixture(delta.swarm.maxLanes + 1, `${WAVE_NAME}-crosscheck`);
  const resumeOnly = (n, extra = {}) => ({
    wave: `${WAVE_NAME}-crosscheck-resume-${n}`,
    priorRegistry: priors.rel,
    items: priors.ids.slice(0, n).map((id, i) => ({ resume: id, message: `Crosscheck resume lane ${i + 1} of ${n}: continue your lane.` })),
    ...extra,
  });
  const resumed = (() => {
    try {
      return planOf(resumeOnly(belowFloor)).counts;
    } catch (error) {
      return { code: error?.code ?? error?.message ?? "unknown" };
    }
  })();
  check("crosscheck.resumeFloorExempt", resumed?.spawn === 0 && resumed?.resume === belowFloor && resumed?.total === belowFloor,
    `under the injected band ${belowFloor} resume-only lanes are admitted (counts ${JSON.stringify(resumed)}) — the below-floor exemption is the policy's, not the fixture's`);
  const resumeCap = codeOf(() => planOf(resumeOnly(2, { maxLanes: 1 })));
  check("crosscheck.resumeCapBinds", resumeCap === "too_many_lanes",
    `the injected cap still binds resumes: 2 lanes at cap 1 refuse as ${JSON.stringify(resumeCap)}`);
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
    say(`  Swarm lanes are NOT wall missions. A ${opts.lanes}-lane wave shows up only as the`);
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
    `  deliberate human step because it burns ${opts.lanes} lane completions.`,
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
    `         --note "${opts.lanes}-lane sighting wave smoke: N/${opts.lanes} lanes reported"`,
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
  say(`ufo-sighting ${opts.lanes}-lane wave smoke test — dry half`);
  say(`  repo:      ${REPO_ROOT}`);
  say(`  ufo root:  ${opts.ufoRoot}`);
  say(`  band mode: ${opts.band}`);
  say(`  lanes:     ${opts.lanes}`);
  say(`  evidence:  ${EVIDENCE}`);
  say(`  live wall: ${opts.liveWall ? "YES — ufo-sighting verbs will run" : "no — wall commands are printed only"}`);
  mkdirSync(EVIDENCE, { recursive: true });
  // The in-process planner resolves root-relative registry paths against
  // UFO_PROJECT_ROOT, read when the authority module is imported — so the
  // scratch root has to be declared before loadAuthorities(), or a resume probe
  // would resolve its prior registry against the ufo-fsd-alpha checkout (and
  // never find the fixture) instead of the evidence tree.
  process.env.UFO_PROJECT_ROOT = SCRATCH_ROOT;

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
