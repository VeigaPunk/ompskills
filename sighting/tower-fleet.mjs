#!/usr/bin/env node
/**
 * tower-fleet — turn the UFO Sighting wall into a tower-mode fleet.
 *
 * One interactive omp pane per L1 mission, each with its own worktree, its
 * own branch `tower/<fleet>/<id>`, and its prompt rendered from
 * `sighting/l1-prompt.md`. Every band number, ceiling, and role alias is
 * read live from `<ufoRoot>/config/ufo.json`; nothing here hardcodes the
 * swarm band and nothing pins a provider/model — routing is `--model @<l1Alias>`.
 *
 * Verbs:
 *   node sighting/tower-fleet.mjs plan   --spec <fleet.json> [--json]
 *   node sighting/tower-fleet.mjs launch --spec <fleet.json> --apply [--json]
 *   node sighting/tower-fleet.mjs status --spec <fleet.json> [--json]
 *   node sighting/tower-fleet.mjs close  --spec <fleet.json> --apply [--mission <id>] [--force] [--json]
 *
 * Default verb is `plan` (which writes nothing). `launch` and `close` refuse
 * without `--apply`. Exit codes: 0 ok · 2 typed error (`{ok:false,code,
 * message}` JSON on stderr) · 64 usage error.
 *
 * Safety contract:
 *   - never `omp worktree clear` (repo-wide sweep) — worktrees are only ever
 *     removed by the operator with the exact per-path command this tool
 *     prints, never automatically;
 *   - never edit anything under `<ufoRoot>`; writes land only under
 *     `<stateDir>`, `<worktreeRoot>`, and the mission worktrees — and both
 *     write roots are refused (INVALID_SPEC) when their realpath lands inside
 *     the substrate, on the repo root, or inside the repo's `.git`;
 *   - every shell-out is `spawnSync` with an explicit argv array — no shell
 *     strings built from spec content;
 *   - the omp argv stays interactive (no `-p`/`--print`, no `--mode`), and
 *     `omp --cwd` always equals the mission cwd;
 *   - a failed mission never aborts the run: it is recorded with its typed
 *     failure, the panes already up keep running, and fleet.json is written
 *     either way (`ok:false`, exit 2, code LAUNCH_PARTIAL);
 *   - relaunch is idempotent: an existing worktree, an existing prompt (byte
 *     identical -> left untouched), and an existing wall row are all adopted
 *     instead of recreated; the row is looked up in the wall's whole registry
 *     (live rows plus its retired `completed[]`/`stopped[]` history), because
 *     a run id stays reserved while any registered row holds it — a retired
 *     row is recorded as RUN_ID_RESERVED, never re-launched;
 *   - liveness is read from the wall's LIVE view only (`status --lite`'s
 *     `missions[]`, `levels.l1` = the wall's own `isLiveStatus`), never from a
 *     retired row's `phase`, which is a dispatcher observation: a retired row
 *     therefore can never read as live, and a live-view row without a level
 *     reads as live rather than risking a completion or a re-launch;
 *   - `status` reconciles the wall against `<stateDir>/fleet.json` in both
 *     directions and writes nothing;
 *   - `close` refuses (PANE_LIVE) when a target's pane is still live on the
 *     wall, unless `--force`; a mission absent from the wall is skipped, not
 *     an error; a wall `complete` failure is recorded per mission and the run
 *     finishes with exit 2 / COMPLETE_FAILED listing every outcome.
 *
 * Fleet spec (JSON):
 * {
 *   "fleet": "tower1",                       // ^[a-z0-9][a-z0-9_-]{0,47}$
 *   "repo": "/abs/or/relative/repo",
 *   "base": "main",                          // default: repo HEAD branch
 *   "ufoRoot": "/home/vgpnk/Projects/ufo-fsd-alpha",
 *   "stateDir": "<repo>/.tower/fleets/<fleet>",
 *   "worktreeRoot": "<repo>/.tower/worktrees/<fleet>",
 *   "roundCeiling": 1,
 *   "maxTime": "3h",
 *   "missions": [
 *     { "id": "tf-x", "title": "…", "axis": "…", "goal": "…",
 *       "scope": ["path/prefix"], "skills": ["tower"] }
 *   ]
 * }
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_TEMPLATE_PATH = path.join(HERE, "l1-prompt.md");

const EXIT_OK = 0;
const EXIT_TYPED = 2;
const EXIT_USAGE = 64;

const FLEET_PATTERN = /^[a-z0-9][a-z0-9_-]{0,47}$/;
const MISSION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const MAXTIME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:+-]*$/;

const VERBS = new Set(["plan", "launch", "status", "close"]);

class TypedError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function typed(code, message) {
  throw new TypedError(code, message);
}

function usageExit(message) {
  process.stderr.write(JSON.stringify({ ok: false, code: "USAGE", message }) + "\n");
  process.stderr.write(
    "usage: node sighting/tower-fleet.mjs [plan|launch|status|close] --spec <fleet.json> [--apply] [--mission <id>] [--force] [--json]\n"
  );
  process.exit(EXIT_USAGE);
}

function emitJson(value) {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

const warnings = [];
function warn(message) {
  warnings.push(message);
  process.stderr.write(`warning: ${message}\n`);
}

// ── config authority ────────────────────────────────────────────────────────

/** Read the band authority live from `<ufoRoot>/config/ufo.json`. */
function loadBandAuthority(ufoRoot) {
  const configPath = path.join(ufoRoot, "config", "ufo.json");
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    typed("CONFIG_UNREADABLE", `cannot read band authority ${configPath}: ${error.message}`);
  }
  const dispatch = config?.sighting?.dispatch;
  const swarm = dispatch?.swarm;
  const missionFormat = dispatch?.missionFormat;
  const need = (value, name) => {
    if (value === undefined || value === null) typed("CONFIG_UNREADABLE", `${configPath} is missing sighting.${name}`);
    return value;
  };
  const intOf = (value, name) => {
    if (!Number.isSafeInteger(value) || value < 1) typed("CONFIG_UNREADABLE", `sighting.${name} must be a positive integer, got ${JSON.stringify(value)}`);
    return value;
  };
  const authority = {
    configPath,
    maxConcurrentL1: intOf(need(dispatch?.maxConcurrentL1, "dispatch.maxConcurrentL1"), "dispatch.maxConcurrentL1"),
    windowPaneCeiling: intOf(need(config?.sighting?.windowPaneCeiling, "windowPaneCeiling"), "windowPaneCeiling"),
    waveMin: intOf(need(swarm?.waveMinLanes, "dispatch.swarm.waveMinLanes"), "dispatch.swarm.waveMinLanes"),
    waveMax: intOf(need(swarm?.waveMaxLanes, "dispatch.swarm.waveMaxLanes"), "dispatch.swarm.waveMaxLanes"),
    roundLaneCeiling: intOf(need(swarm?.maxLanes, "dispatch.swarm.maxLanes"), "dispatch.swarm.maxLanes"),
    l1Alias: String(need(missionFormat?.l1Alias, "dispatch.missionFormat.l1Alias")),
  };
  if (authority.waveMin > authority.waveMax) {
    typed("CONFIG_UNREADABLE", `swarm band is impossible: waveMinLanes ${authority.waveMin} > waveMaxLanes ${authority.waveMax}`);
  }
  if (!/^[A-Za-z0-9_.:-]+$/.test(authority.l1Alias)) {
    typed("CONFIG_UNREADABLE", `l1Alias ${authority.l1Alias} is not a safe alias token`);
  }
  return authority;
}

// ── spec loading + validation ───────────────────────────────────────────────

function resolveRepoPath(repo, value, field) {
  if (typeof value !== "string" || value.length === 0) typed("INVALID_SPEC", `${field} must be a non-empty string`);
  return path.isAbsolute(value) ? path.normalize(value) : path.resolve(repo, value);
}

/** Normalize a scope entry to a repo-relative path prefix, or refuse. */
function normalizeScopePath(raw, missionId) {
  if (typeof raw !== "string" || raw.trim() === "") typed("INVALID_SPEC", `mission ${missionId} scope entry must be a non-empty string`);
  const value = raw.trim().replace(/^\.\//, "").replace(/\/+$/, "");
  if (value === "" ) typed("INVALID_SPEC", `mission ${missionId} scope entry ${raw} does not name a repo-relative path`);
  if (path.isAbsolute(value) || value.startsWith("~")) {
    typed("INVALID_SPEC", `mission ${missionId} scope entry ${raw} must be repo-relative, not absolute`);
  }
  const parts = value.split("/");
  if (parts.some((part) => part === ".." || part === "")) {
    typed("INVALID_SPEC", `mission ${missionId} scope entry ${raw} must stay inside the repo`);
  }
  return parts;
}

function scopeOverlaps(a, b) {
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  return long.every((part, index) => index >= short.length || short[index] === part)
    && short.every((part, index) => long[index] === part);
}

/** Resolve a path that may not exist yet by realpath-ing its deepest existing
 * ancestor: a symlinked parent must not smuggle the result somewhere else.
 * A dangling link on the way is reported (`dangling: true`) instead of being
 * silently resolved lexically — the kernel would fail the write later, after
 * the wall has been touched. */
function realpathDeepest(target) {
  let current = path.resolve(target);
  const tail = [];
  while (!existsSync(current)) {
    // `throwIfNoEntry` suppresses ENOENT only: an intermediate component that
    // is not a directory (ENOTDIR) still throws, and that must not turn a
    // refused write root into an untyped error.
    let isLink = false;
    try {
      isLink = lstatSync(current)?.isSymbolicLink() === true;
    } catch {
      isLink = false;
    }
    if (isLink) {
      return { resolved: path.resolve(target), dangling: true };
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    tail.unshift(path.basename(current));
    current = parent;
  }
  try {
    return { resolved: path.resolve(realpathSync(current), ...tail), dangling: false };
  } catch {
    return { resolved: path.resolve(target), dangling: false };
  }
}

/** A write root must never reach into the substrate or the repo's own git
 * plumbing — the two places the safety contract forbids, both reachable
 * through a spec field, a symlinked parent, or a symlinked repo/ufoRoot. BOTH
 * sides of every comparison are realpath-resolved, so neither a symlinked
 * child nor a symlinked parent can launder the write. */
function assertSafeWriteRoot(value, field, roots) {
  const { resolved, dangling } = realpathDeepest(value);
  if (dangling) {
    typed("INVALID_SPEC", `${field} ${value} resolves through a dangling symlink — the write would fail after the wall was touched`);
  }
  const inside = (child, parent) => child === parent || child.startsWith(parent + path.sep);
  if (inside(resolved, roots.ufoReal) || inside(resolved, roots.ufoLexical)) {
    typed("INVALID_SPEC", `${field} ${value} resolves inside ufoRoot ${roots.ufoLexical} (${roots.ufoReal}) — the substrate is never written`);
  }
  if (resolved === roots.repoReal || resolved === roots.repoLexical) {
    typed("INVALID_SPEC", `${field} ${value} resolves to the repo root itself — declare a subdirectory`);
  }
  if (inside(resolved, path.join(roots.repoReal, ".git")) || inside(resolved, path.join(roots.repoLexical, ".git"))) {
    typed("INVALID_SPEC", `${field} ${value} resolves inside the repo's .git directory`);
  }
}

function gitHeadBranch(repo) {
  const result = run(["git", "-C", repo, "rev-parse", "--abbrev-ref", "HEAD"]);
  const branch = (result.stdout || "").trim();
  if (result.status !== 0 || branch === "" || branch === "HEAD") {
    typed("INVALID_SPEC", `cannot resolve repo HEAD branch for base default (${repo}${result.status !== 0 ? "; is it a git checkout?" : "; detached HEAD — set base explicitly"})`);
  }
  return branch;
}

function loadSpec(specPath, authority) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(specPath, "utf8"));
  } catch (error) {
    typed("INVALID_SPEC", `cannot read fleet spec ${specPath}: ${error.message}`);
  }
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) typed("INVALID_SPEC", "fleet spec must be a JSON object");
  if (!FLEET_PATTERN.test(raw.fleet ?? "")) {
    typed("INVALID_SPEC", `fleet name ${JSON.stringify(raw.fleet)} must match ${FLEET_PATTERN}`);
  }
  if (typeof raw.repo !== "string" || raw.repo.trim() === "") typed("INVALID_SPEC", "fleet spec needs a repo path");
  if (typeof raw.ufoRoot !== "string" || raw.ufoRoot.trim() === "") typed("INVALID_SPEC", "fleet spec needs ufoRoot (the substrate carrying config/ufo.json and scripts/ufo-sighting)");
  const repo = path.resolve(raw.repo.trim());
  const ufoRoot = path.resolve(raw.ufoRoot.trim());

  const missions = raw.missions;
  if (!Array.isArray(missions) || missions.length === 0) typed("INVALID_SPEC", "fleet spec needs at least one mission");
  if (missions.length > authority.maxConcurrentL1) {
    typed("L1_CEILING_EXCEEDED", `fleet declares ${missions.length} L1 missions; sighting.dispatch.maxConcurrentL1 is ${authority.maxConcurrentL1}`);
  }
  if (missions.length > authority.windowPaneCeiling) {
    typed("PANE_CEILING_EXCEEDED", `fleet declares ${missions.length} panes; sighting.windowPaneCeiling is ${authority.windowPaneCeiling}`);
  }

  const seenIds = new Set();
  const normalized = [];
  for (const mission of missions) {
    if (mission === null || typeof mission !== "object") typed("INVALID_SPEC", "each mission must be an object");
    const id = typeof mission.id === "string" ? mission.id.trim() : "";
    if (!MISSION_ID_PATTERN.test(id)) typed("INVALID_SPEC", `mission id ${JSON.stringify(mission.id)} must match ${MISSION_ID_PATTERN}`);
    if (seenIds.has(id)) typed("INVALID_SPEC", `duplicate mission id ${id}`);
    seenIds.add(id);
    for (const field of ["title", "axis", "goal"]) {
      if (typeof mission[field] !== "string" || mission[field].trim() === "") {
        typed("INVALID_SPEC", `mission ${id} needs a non-empty ${field}`);
      }
    }
    if (!Array.isArray(mission.scope) || mission.scope.length === 0) {
      typed("INVALID_SPEC", `mission ${id} needs a non-empty scope array of repo-relative path prefixes`);
    }
    const scope = mission.scope.map((entry) => normalizeScopePath(entry, id).join("/"));
    const skills = mission.skills === undefined || mission.skills === null
      ? []
      : (Array.isArray(mission.skills)
        ? mission.skills.map((skill) => {
            if (typeof skill !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(skill)) {
              typed("INVALID_SPEC", `mission ${id} skill name ${JSON.stringify(skill)} is not a safe directory name`);
            }
            return skill;
          })
        : (typed("INVALID_SPEC", `mission ${id} skills must be an array of skill names`), []));
    normalized.push({ id, title: mission.title.trim(), axis: mission.axis.trim(), goal: mission.goal.trim(), scope, skills });
  }

  // Pairwise disjoint scopes — one writer per path, enforced at the fleet gate.
  for (let i = 0; i < normalized.length; i += 1) {
    for (let j = i + 1; j < normalized.length; j += 1) {
      for (const a of normalized[i].scope) {
        for (const b of normalized[j].scope) {
          if (scopeOverlaps(a.split("/"), b.split("/"))) {
            typed("SCOPE_OVERLAP", `mission ${normalized[i].id} scope ${a} overlaps mission ${normalized[j].id} scope ${b}`);
          }
        }
      }
    }
  }

  const base = raw.base === undefined || String(raw.base).trim() === "" ? gitHeadBranch(repo) : String(raw.base).trim();
  const roundCeiling = raw.roundCeiling === undefined ? 1 : raw.roundCeiling;
  if (!Number.isSafeInteger(roundCeiling) || roundCeiling < 1) typed("INVALID_SPEC", `roundCeiling must be a positive integer, got ${JSON.stringify(raw.roundCeiling)}`);
  const maxTime = raw.maxTime === undefined ? "3h" : String(raw.maxTime).trim();
  if (!MAXTIME_PATTERN.test(maxTime) || maxTime.startsWith("-")) typed("INVALID_SPEC", `maxTime ${JSON.stringify(raw.maxTime)} is not a safe token`);

  const stateDir = resolveRepoPath(repo, raw.stateDir ?? `.tower/fleets/${raw.fleet}`, "stateDir");
  const worktreeRoot = resolveRepoPath(repo, raw.worktreeRoot ?? `.tower/worktrees/${raw.fleet}`, "worktreeRoot");
  const roots = {
    repoLexical: repo,
    ufoLexical: ufoRoot,
    repoReal: realpathDeepest(repo).resolved,
    ufoReal: realpathDeepest(ufoRoot).resolved,
  };
  assertSafeWriteRoot(stateDir, "stateDir", roots);
  assertSafeWriteRoot(worktreeRoot, "worktreeRoot", roots);

  return {
    fleet: raw.fleet,
    repo,
    ufoRoot,
    base,
    roundCeiling,
    maxTime,
    stateDir,
    worktreeRoot,
    missions: normalized,
  };
}

// ── prompt rendering ────────────────────────────────────────────────────────

function renderPrompt(mission, spec, authority) {
  const template = readFileSync(PROMPT_TEMPLATE_PATH, "utf8");
  const worktree = path.join(spec.worktreeRoot, mission.id);
  const values = {
    fleet: spec.fleet,
    missionId: mission.id,
    title: mission.title,
    axis: mission.axis,
    goal: mission.goal,
    scope: mission.scope.join(", "),
    repo: spec.repo,
    worktree,
    base: spec.base,
    ufoRoot: spec.ufoRoot,
    waveMin: String(authority.waveMin),
    waveMax: String(authority.waveMax),
    roundLaneCeiling: String(authority.roundLaneCeiling),
    roundCeiling: String(spec.roundCeiling),
    stateDir: spec.stateDir,
    reportDir: path.join(spec.stateDir, "reports", mission.id),
    validator: path.join(spec.ufoRoot, "scripts", "ufo-swarm-wave.mjs"),
    l1Alias: authority.l1Alias,
  };
  const rendered = template.replace(/\{\{([A-Za-z]+)\}\}/g, (match, key) => {
    if (!(key in values)) typed("RENDER_UNRESOLVED", `l1-prompt.md references unknown placeholder {{${key}}}`);
    return values[key];
  });
  if (/\{\{[A-Za-z]+\}\}/.test(rendered)) {
    typed("RENDER_UNRESOLVED", `rendered prompt for ${mission.id} still carries a placeholder`);
  }
  return rendered;
}

// ── argv builders ───────────────────────────────────────────────────────────

function interactiveGuard(tokens, missionId) {
  // Interactive omp only: no -p/--print, no --mode <json|rpc|rpc-ui>.
  // Match --mode as an exact token or a --mode=... form so --model is safe.
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === "-p" || token === "--print") {
      typed("INTERACTIVE_GUARD", `mission ${missionId} omp argv must stay interactive (${token})`);
    }
    if (token === "--mode" || token.startsWith("--mode=")) {
      typed("INTERACTIVE_GUARD", `mission ${missionId} omp argv must not set --mode`);
    }
  }
}

function buildOmpArgv(mission, spec, authority) {
  const worktree = path.join(spec.worktreeRoot, mission.id);
  const argv = [
    "omp",
    "--cwd", worktree,
    "--session-dir", path.join(spec.stateDir, "sessions", mission.id),
    "--max-time", spec.maxTime,
    "--model", `@${authority.l1Alias}`,
    "--config", path.join(spec.ufoRoot, "config", "mission-nightcall.yml"),
    "--print-thoughts",
    "--auto-approve",
    `@${path.join(spec.stateDir, `${mission.id}.prompt.md`)}`,
  ];
  // The wall's own preflight refuses non-interactive argv; fail before it does.
  interactiveGuard(argv.slice(1), mission.id);
  if (argv[2] !== worktree) typed("INTERACTIVE_GUARD", `mission ${mission.id}: omp --cwd must equal the mission cwd`);
  return argv;
}

function buildLaunchArgv(mission, spec) {
  const worktree = path.join(spec.worktreeRoot, mission.id);
  return [
    "bash",
    path.join(spec.ufoRoot, "scripts", "ufo-sighting"),
    "launch",
    "--run-id", mission.id,
    "--session-id", mission.id,
    "--title", mission.title,
    "--fleet", spec.fleet,
    "--cwd", worktree,
    "--no-open",
    "--relay",
    "--runner-reservation", "1",
    "--",
  ];
}

// ── shell-out plumbing (argv arrays only, never shell strings) ──────────────

function run(argv, options = {}) {
  const result = spawnSync(argv[0], argv.slice(1), { encoding: "utf8", ...options });
  if (result.error && result.error.code === "ENOENT") {
    typed("COMMAND_MISSING", `cannot spawn ${argv[0]}: ${result.error.message}`);
  }
  return {
    status: result.status ?? 127,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function wallCli(spec, ...subArgs) {
  return run(["bash", path.join(spec.ufoRoot, "scripts", "ufo-sighting"), ...subArgs]);
}

function parseJsonOutput(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    typed("WALL_OUTPUT", `${label} did not print JSON: ${text.slice(0, 200)}`);
  }
}

// ── wall state: the single source of liveness ───────────────────────────────

/** Read the wall's mission view once. Every verb that reasons about an
 * existing mission (launch reuse, status reconciliation, the close guard)
 * reads liveness here, never from the launcher's own bookkeeping. */
function readWall(spec) {
  const result = wallCli(spec, "status", "--lite");
  if (result.status !== 0) {
    typed("WALL_STATUS_FAILED", `wall status --lite exited ${result.status}: ${(result.stderr || result.stdout).slice(0, 400)}`);
  }
  return parseJsonOutput(result.stdout, "wall status --lite");
}

function wallRowId(row) {
  return row?.runId ?? row?.missionId ?? null;
}

/** Liveness for a row of the wall's LIVE view (`missions[]`). `levels.l1` is
 * `isLiveStatus(status)` there — the manifest truth, and it always wins: a
 * row's `phase` can instead come from the dispatcher's observation sidecar
 * (`obs?.phase ?? statusPhase(mission)`) and a stale observation can disagree.
 * A live-view row that carries no numeric level is reported LIVE, because the
 * two consumers of this answer both act on "not live" — `close` completes the
 * mission and `launch` re-launches the run id — and neither may happen by
 * accident. Retired rows (`completed[]`/`stopped[]`) are NEVER passed here:
 * they carry no `levels` and their `phase` is an observation, so liveness is
 * sourced by array membership, not by guessing from the phase. */
function wallRowLive(row) {
  if (row === undefined || row === null) return false;
  const l1 = row.levels?.l1;
  if (typeof l1 === "number") return l1 > 0;
  return true;
}

function wallRowPhase(row) {
  return row?.phase ?? (wallRowLive(row) ? "working" : "unknown");
}

/** What the wall's record says the mission *is*: a retired row's own array
 * (`completed`/`stopped`), else its live phase. Never used for liveness. */
function wallRowDisposition(row) {
  return row?.disposition ?? wallRowPhase(row);
}

/** The wall's live view keyed by run id: the ONLY place liveness is read from. */
function liveViewById(registry) {
  return new Map(registry.active.map((row) => [wallRowId(row), row]));
}

/** The state file `launch` wrote, or null when it is absent/unreadable — a
 * missing fleet.json is exactly the divergence `status` must report, not an
 * error. */
function readFleetState(spec) {
  const fleetPath = path.join(spec.stateDir, "fleet.json");
  if (!existsSync(fleetPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(fleetPath, "utf8"));
    return parsed !== null && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    warn(`fleet state ${fleetPath} is unreadable (${error.message}) — continuing without it`);
    return null;
  }
}

// ── verbs ───────────────────────────────────────────────────────────────────

function buildPlan(spec, authority) {
  return spec.missions.map((mission) => {
    const worktree = path.join(spec.worktreeRoot, mission.id);
    const promptPath = path.join(spec.stateDir, `${mission.id}.prompt.md`);
    const ompArgv = buildOmpArgv(mission, spec, authority);
    return {
      id: mission.id,
      title: mission.title,
      axis: mission.axis,
      goal: mission.goal,
      scope: mission.scope,
      skills: mission.skills,
      worktree,
      branch: `tower/${spec.fleet}/${mission.id}`,
      promptPath,
      ompArgv,
      launchArgv: [...buildLaunchArgv(mission, spec), ...ompArgv],
      prompt: renderPrompt(mission, spec, authority),
    };
  });
}

function quoteArg(token) {
  return /^[\w@./:=+-]+$/.test(token) ? token : `'${token.replace(/'/g, `'\\''`)}'`;
}

/** Record one mission's failure exactly once. A mission can hit two causes
 * (e.g. a reserved run id and a failed worktree add); the FIRST is the one
 * that blocked it, the second is kept as `secondaryFailure`, and the mission
 * is counted once so the LAUNCH_PARTIAL summary cannot read "2 of 1". */
function recordMissionFailure(record, failures, code, detail) {
  if (record.failure === undefined) {
    record.failure = { code, detail };
    failures.push({ id: record.id, detail });
    return;
  }
  record.secondaryFailure = { code, detail };
}

function printPlanHuman(spec, authority, plan) {
  const lines = [];
  lines.push(`tower-fleet plan · fleet ${spec.fleet} · repo ${spec.repo} · base ${spec.base}`);
  lines.push(`band authority (${authority.configPath}): wave ${authority.waveMin}-${authority.waveMax} lanes, round ceiling ${authority.roundLaneCeiling} lanes, L1 max ${authority.maxConcurrentL1}, panes/window ${authority.windowPaneCeiling}, alias @${authority.l1Alias}`);
  for (const row of plan) {
    lines.push("");
    lines.push(`mission ${row.id} — ${row.title} (axis ${row.axis})`);
    lines.push(`  worktree: ${row.worktree}`);
    lines.push(`  branch:   ${row.branch}`);
    lines.push(`  prompt:   ${row.promptPath}`);
    lines.push(`  scope:    ${row.scope.join(", ")}`);
    lines.push(`  launch:   ${row.launchArgv.map(quoteArg).join(" ")}`);
  }
  lines.push("");
  lines.push("plan writes nothing; run `launch --spec <fleet.json> --apply` to create worktrees, prompts, and panes.");
  process.stdout.write(lines.join("\n") + "\n");
}

function verbPlan(spec, authority, options) {
  const plan = buildPlan(spec, authority);
  if (options.json) {
    emitJson({
      ok: true,
      verb: "plan",
      writes: false,
      fleet: spec.fleet,
      repo: spec.repo,
      base: spec.base,
      stateDir: spec.stateDir,
      worktreeRoot: spec.worktreeRoot,
      roundCeiling: spec.roundCeiling,
      maxTime: spec.maxTime,
      band: {
        waveMin: authority.waveMin,
        waveMax: authority.waveMax,
        roundLaneCeiling: authority.roundLaneCeiling,
        maxConcurrentL1: authority.maxConcurrentL1,
        windowPaneCeiling: authority.windowPaneCeiling,
        l1Alias: authority.l1Alias,
      },
      missions: plan,
    });
  } else {
    printPlanHuman(spec, authority, plan);
  }
  return EXIT_OK;
}

function skillSourceDirs(spec) {
  return [
    path.join(spec.repo, ".omp", "skills"),
    path.join(spec.ufoRoot, ".omp", "skills"),
    path.join(os.homedir(), ".agents", "skills"),
  ];
}

function copySkill(name, spec, worktree) {
  for (const dir of skillSourceDirs(spec)) {
    const source = path.join(dir, name);
    if (existsSync(source)) {
      const target = path.join(worktree, ".omp", "skills", name);
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(source, target, { recursive: true });
      return source;
    }
  }
  return null;
}

function verbLaunch(spec, authority, options) {
  const plan = buildPlan(spec, authority);
  const wallCliPath = path.join(spec.ufoRoot, "scripts", "ufo-sighting");
  // Open the wall once for the whole run, then read its mission view: a
  // relaunch must adopt rows the wall already holds (the run id stays reserved
  // while the row exists, so a second `launch` of the same id is a
  // RUN_ID_CONFLICT, not a no-op). The decision is made from wall state.
  const opened = wallCli(spec, "open");
  if (opened.status !== 0) {
    typed("WALL_OPEN_FAILED", `bash ${wallCliPath} open exited ${opened.status}: ${(opened.stderr || opened.stdout).slice(0, 400)}`);
  }
  // Adoption is keyed by run id across the WHOLE registry — the live view plus
  // retired rows, any fleet: the wall reserves a run id globally
  // (`ensureUniqueMission` scans every registered row), so a row that holds our
  // id blocks a fresh launch whether it is live or long retired.
  const registry = wallRegistry(spec);
  const { byId: registryById } = registry;
  const liveById = liveViewById(registry);
  const previousById = new Map((readFleetState(spec)?.missions ?? []).map((mission) => [mission.id, mission]));
  try {
    mkdirSync(spec.stateDir, { recursive: true });
  } catch (error) {
    typed("STATE_DIR_UNAVAILABLE", `cannot create stateDir ${spec.stateDir}: ${error.message}`);
  }

  const records = [];
  const failures = [];
  for (const row of plan) {
    const mission = spec.missions.find((m) => m.id === row.id);
    const record = {
      id: row.id,
      title: row.title,
      axis: row.axis,
      worktree: row.worktree,
      branch: row.branch,
      base: spec.base,
      promptPath: row.promptPath,
      skills: [],
      paneId: null,
      paneReused: false,
      panePhase: null,
      promptReused: false,
      worktreeReused: false,
      launchResult: null,
    };

    try {
      // 1. Adopt the wall row this run id already owns, FIRST: the wall reserves
      //    a run id globally, and a live pane must be recorded even when the
      //    local worktree cannot be recreated (a failed `omp worktree add` used
      //    to drop the pane reference on the floor).
      const existing = registryById.get(row.id);
      if (existing !== undefined) {
        const live = wallRowLive(liveById.get(row.id));
        record.paneId = existing.paneId ?? null;
        record.panePhase = wallRowDisposition(existing);
        record.paneReused = true;
        record.retired = !live;
        // Keep the prior run's raw pane receipt: adoption re-reads the wall, and
        // overwriting the record with null would lose what launch actually saw.
        const prior = previousById.get(row.id);
        if (prior?.launchResult !== undefined && prior.launchResult !== null) {
          record.launchResult = prior.launchResult;
          record.launchResultFrom = "prior-state";
        }
        if (live) {
          warn(`mission ${row.id} is already on the wall (${record.panePhase}) — reusing pane ${record.paneId ?? "?"}, not relaunching`);
          if ((existing.fleet ?? null) !== spec.fleet) {
            warn(`mission ${row.id} is registered under fleet ${existing.fleet ?? "(none)"}, not ${spec.fleet} — reusing the wall row as-is`);
          }
        } else {
          // The run id is still reserved by a retired row, so no fresh pane can be
          // launched under it. Report that instead of letting the wall answer a
          // bare RUN_ID_CONFLICT, and keep the retired row's pane reference.
          const missionRef = existing.missionId ?? row.id;
          const remedy = record.panePhase === "suspended"
            ? `the wall can revive this same run id (\`bash <ufoRoot>/scripts/ufo-sighting resume --mission ${missionRef} -- <omp argv>\`), or retire the row (\`bash <ufoRoot>/scripts/ufo-sighting remove --mission ${missionRef}\`) or use a new mission id`
            : `retire the row (\`bash <ufoRoot>/scripts/ufo-sighting remove --mission ${missionRef}\`) or use a new mission id`;
          const detail = `run id ${row.id} is still registered by a ${record.panePhase} wall row — a fresh pane cannot launch under a reserved run id; ${remedy}`;
          recordMissionFailure(record, failures, "RUN_ID_RESERVED", detail);
          warn(`mission ${row.id} is ${record.panePhase} on the wall and its run id is still reserved — recording RUN_ID_RESERVED, not relaunching`);
        }
      }

      // 2. worktree — reuse an existing one with a warning, never clobber it.
      //    A failed add is this mission's failure, not a mid-fleet abort: the
      //    panes already up must stay recorded in fleet.json.
      if (existsSync(row.worktree)) {
        warn(`worktree ${row.worktree} already exists — reusing it as-is`);
        record.worktreeReused = true;
      } else {
        const adoptedWithoutTree = record.paneReused;
        if (adoptedWithoutTree) {
          warn(`mission ${row.id} reuses a wall row but its worktree ${row.worktree} is missing`);
        }
        const added = run([
          "omp", "worktree", "add",
          "-C", spec.repo,
          "-b", row.branch,
          row.worktree,
          spec.base,
        ]);
        if (added.status !== 0) {
          // The tree is still gone, so only now is the fact worth recording.
          if (adoptedWithoutTree) record.worktreeMissing = true;
          recordMissionFailure(record, failures, "WORKTREE_ADD_FAILED", `omp worktree add exited ${added.status}: ${(added.stderr || added.stdout).slice(0, 400)}`);
          records.push(record);
          continue;
        }
        if (adoptedWithoutTree) record.worktreeRecreated = true;
      }

      // 3. skills — copy each named skill into the worktree; missing is a warning.
      for (const skill of mission.skills) {
        const source = copySkill(skill, spec, row.worktree);
        if (source === null) warn(`skill ${skill} not found for mission ${row.id} (searched repo, ufoRoot, ~/.agents/skills) — continuing`);
        record.skills.push({ name: skill, source });
      }

      // 4. prompt into the state dir (+ per-mission session dir). The rendered
      //    prompt is the source of truth, so a relaunch regenerates it from the
      //    spec; only byte-identical content is left untouched (no churn, and
      //    `promptReused` records which happened — a hand-edited prompt is
      //    overwritten).
      const sessionsDir = path.join(spec.stateDir, "sessions", row.id);
      mkdirSync(sessionsDir, { recursive: true });
      const existingPrompt = existsSync(row.promptPath) ? readFileSync(row.promptPath, "utf8") : null;
      if (existingPrompt === row.prompt) {
        record.promptReused = true;
      } else {
        writeFileSync(row.promptPath, row.prompt);
      }

      // 5. launch the pane only when no wall row was adopted: a second wall
      //    launch of a reserved run id is RUN_ID_CONFLICT, which is the failure
      //    this whole adoption path exists to avoid.
      if (record.paneReused) {
        records.push(record);
        continue;
      }
      const launched = wallCli(spec, ...row.launchArgv.slice(2));
      let failure = null;
      let result = null;
      if (launched.status !== 0) {
        let detail = (launched.stderr || launched.stdout).slice(0, 400);
        try {
          const parsed = JSON.parse(launched.stdout || launched.stderr);
          if (parsed?.code) detail = `${parsed.code}: ${parsed.message ?? detail}`;
          // A run id can still be reserved by a row the registry cannot see —
          // a ghost row (manifest-live, pane dead) is in none of its arrays.
          // The wall's refusal is the authority; name the stale count when it
          // is the likely cause instead of leaving a bare conflict.
          if (parsed?.code === "RUN_ID_CONFLICT" && registry.staleCount > 0) {
            detail = `${detail}; the wall also reports ${registry.staleCount} stale mission(s) with no live pane — \`bash <ufoRoot>/scripts/ufo-sighting reconcile\` may clear the reservation`;
          }
        } catch { /* verbatim text is the fallback detail */ }
        failure = { code: "LAUNCH_FAILED", detail };
      } else {
        // A zero exit with unparseable stdout is a failure too: the pane may be
        // up but its id is unknown, so recording it as a failure keeps fleet.json
        // written instead of aborting mid-fleet through parseJsonOutput.
        try {
          result = JSON.parse(launched.stdout);
        } catch {
          failure = { code: "WALL_OUTPUT", detail: `wall launch for ${row.id} did not print JSON: ${launched.stdout.slice(0, 200)}` };
        }
      }
      if (failure !== null) {
        // Partial-failure policy: record the failure, keep the panes already
        // launched, and continue. The fleet state file is written either way, so
        // an operator can see exactly which missions came up.
        recordMissionFailure(record, failures, failure.code, failure.detail);
        records.push(record);
        continue;
      }
      record.launchResult = result;
      const rowView = (result.missions ?? []).find((m) => m.runId === row.id || m.missionId === row.id);
      record.paneId = rowView?.paneId ?? null;
      if (record.paneId === null) warn(`wall launch for ${row.id} reported no pane id`);
      records.push(record);
    } catch (error) {
      // A throw inside one mission (a missing binary, an fs error) must not lose
      // the missions already up either: it is that mission's failure, recorded,
      // and the run still writes fleet.json.
      const code = error instanceof TypedError ? error.code : "MISSION_FAILED";
      const detail = error instanceof TypedError ? error.message : String(error?.message ?? error);
      recordMissionFailure(record, failures, code, detail);
      warn(`mission ${row.id} failed (${code}): ${detail}`);
      records.push(record);
    }
  }

  // 6. fleet state, written only under <stateDir>.
  const fleetPath = path.join(spec.stateDir, "fleet.json");
  writeFileSync(fleetPath, JSON.stringify({
    ok: failures.length === 0,
    fleet: spec.fleet,
    repo: spec.repo,
    ufoRoot: spec.ufoRoot,
    base: spec.base,
    stateDir: spec.stateDir,
    worktreeRoot: spec.worktreeRoot,
    roundCeiling: spec.roundCeiling,
    maxTime: spec.maxTime,
    band: {
      waveMin: authority.waveMin,
      waveMax: authority.waveMax,
      roundLaneCeiling: authority.roundLaneCeiling,
      maxConcurrentL1: authority.maxConcurrentL1,
      windowPaneCeiling: authority.windowPaneCeiling,
      l1Alias: authority.l1Alias,
    },
    launchedAt: new Date().toISOString(),
    warnings: [...warnings],
    missions: records,
  }, null, 2) + "\n");

  if (options.json) {
    emitJson({ ok: failures.length === 0, verb: "launch", fleet: spec.fleet, fleetStatePath: fleetPath, failures, missions: records.map(({ launchResult, ...rest }) => ({ ...rest, launchResultRecorded: Boolean(launchResult) })) });
  } else {
    for (const record of records) {
      if (record.failure !== undefined) {
        process.stdout.write(`FAILED ${record.id} · ${record.failure.code} · worktree ${record.worktree}\n`);
        if (record.secondaryFailure !== undefined) {
          process.stdout.write(`       ${record.id} also hit ${record.secondaryFailure.code}\n`);
        }
      } else {
        process.stdout.write(`launched ${record.id} · pane ${record.paneId ?? "?"}${record.paneReused ? " (reused)" : ""} · worktree ${record.worktree}\n`);
      }
    }
    process.stdout.write(`fleet state: ${fleetPath}\n`);
  }
  if (failures.length > 0) {
    typed("LAUNCH_PARTIAL", `${failures.length} of ${plan.length} missions failed to launch (${failures.map((f) => f.id).join(", ")}); the panes that did launch are live and fleet state is at ${fleetPath}`);
  }
  return EXIT_OK;
}

function roundReceipts(stateDir, missionId) {
  const roundsDir = path.join(stateDir, "rounds");
  if (!existsSync(roundsDir)) return [];
  return readdirSync(roundsDir)
    .filter((name) => name.startsWith(`${missionId}-r`) && name.endsWith(".md"))
    .sort((a, b) => Number(a.match(/r(\d+)\.md$/)?.[1] ?? 0) - Number(b.match(/r(\d+)\.md$/)?.[1] ?? 0))
    .map((name) => path.join(roundsDir, name));
}

/** Every row the wall still registers for a run id: the live view plus the
 * retired history the wall keeps in its own `completed[]`/`stopped[]` arrays.
 * A run id is reserved while ANY of those rows exists (`ensureUniqueMission`
 * scans the whole manifest), so adoption, launch reuse, status reconciliation,
 * and close resolution all read this registry — never the live view alone, or
 * a retired mission would look absent while its id still blocks a fresh pane. */
function wallRegistry(spec) {
  const wall = readWall(spec);
  const active = Array.isArray(wall.missions) ? wall.missions : [];
  const retired = [
    // Tagged with the array the row came from, using the wall's OWN vocabulary
    // (`statusPhase`: completed row -> "completed", stopped row -> "suspended",
    // which is exactly what the wall's `resume` verb gates on). A retired row's
    // own `phase` is a dispatcher observation and can be stale, so the array is
    // the authoritative input everywhere liveness or status is reported.
    ...(Array.isArray(wall.completed) ? wall.completed : []).map((row) => ({ ...row, disposition: "completed" })),
    ...(Array.isArray(wall.stopped) ? wall.stopped : []).map((row) => ({ ...row, disposition: "suspended" })),
  ];
  // The retired arrays are the wall's display slice, not the whole manifest:
  // when they are truncated, a run id can be reserved invisibly, so the
  // fallback (the wall refusing the launch itself) is the only honest answer.
  const truncated = (count, rows) => Number.isSafeInteger(count) && Array.isArray(rows) && rows.length < count;
  if (truncated(wall.completedMissionCount, wall.completed) || truncated(wall.stoppedMissionCount, wall.stopped)) {
    warn(`wall registry view is truncated (completed ${Array.isArray(wall.completed) ? wall.completed.length : 0}/${wall.completedMissionCount ?? "?"}, stopped ${Array.isArray(wall.stopped) ? wall.stopped.length : 0}/${wall.stoppedMissionCount ?? "?"}) — a hidden retired row still reserves its run id`);
  }
  return {
    wall,
    active,
    retired,
    // A ghost row — live in the manifest, pane dead — is in NONE of the three
    // arrays (missions[] is pane-filtered, completed[]/stopped[] are
    // status-filtered). `staleMissionCount` is the only field that names it,
    // and such a row still holds L1 capacity, so the verbs surface it.
    staleCount: Number.isSafeInteger(wall.staleMissionCount) ? wall.staleMissionCount : 0,
    // The wall's own word for itself: "attached" when it is up, "absent" when
    // there is no wall session (getStatus returns that at exit 0 with empty
    // arrays), so a mutation verb can refuse instead of silently no-oping.
    wallStatus: typeof wall.status === "string" ? wall.status : null,
    fleetRows: active.filter((row) => (row.fleet ?? null) === spec.fleet),
    // Live rows LAST: if a run id ever appears in both views, the live row's
    // paneId/phase must win over a retired projection of the same mission.
    byId: new Map([...retired, ...active].map((row) => [wallRowId(row), row])),
  };
}

function verbStatus(spec, authority, options) {
  const { wall, active: allWallRows, retired: allRetiredRows, fleetRows, staleCount, wallStatus } = wallRegistry(spec);
  const state = readFleetState(spec);
  const stateMissions = Array.isArray(state?.missions) ? state.missions : [];

  // Reconcile the wall against the state file `launch` wrote, in both
  // directions: a mission on the wall that fleet.json never recorded, and a
  // mission fleet.json records that the wall does not report. Status is
  // read-only — divergences are reported, never repaired here.
  const stateIds = new Set(stateMissions.map((mission) => mission.id));
  const specIds = new Set(spec.missions.map((mission) => mission.id));
  const ownIds = new Set([...stateIds, ...specIds]);
  // Relevant rows: this fleet's own rows, plus any row holding a run id this
  // fleet owns. `launch` adopts those globally (the wall reserves a run id
  // across every fleet), so status must see them too or the two verbs would
  // disagree about the same mission.
  const relevant = [...fleetRows];
  const seen = new Set(fleetRows.map(wallRowId));
  for (const row of allWallRows) {
    const id = wallRowId(row);
    if (seen.has(id) || !ownIds.has(id)) continue;
    seen.add(id);
    relevant.push(row);
  }
  // The wall keeps no pane for a retired mission, so it drops out of
  // `missions[]` and moves to `completed[]`/`stopped[]` with the authoritative
  // terminal state. Those rows are tracked history, not missions missing from
  // the wall — fleet.json still records them.
  const retiredRows = allRetiredRows.filter((row) => ownIds.has(wallRowId(row)));
  const retiredById = new Map(retiredRows.map((row) => [wallRowId(row), row]));
  const trackedIds = new Set([...relevant.map(wallRowId), ...retiredById.keys()]);
  const onWallNotInState = [...new Set([...relevant.map(wallRowId), ...retiredById.keys()])].filter((id) => !stateIds.has(id));
  const inStateNotOnWall = stateMissions.map((mission) => mission.id).filter((id) => !trackedIds.has(id));
  const foreignRows = relevant.filter((row) => (row.fleet ?? null) !== spec.fleet);

  const rows = relevant.map((row) => {
    const id = wallRowId(row);
    const rowFleet = row.fleet ?? null;
    return {
      id,
      missionId: row.missionId ?? null,
      title: row.title,
      source: "wall",
      status: wallRowPhase(row),
      live: wallRowLive(row),
      paneId: row.paneId ?? null,
      fleet: rowFleet,
      foreignFleet: rowFleet === spec.fleet ? null : rowFleet,
      inFleetState: stateIds.has(id),
      inSpec: specIds.has(id),
      rounds: roundReceipts(spec.stateDir, id).map((file) => path.basename(file)),
    };
  });
  // Missions the state file (or, failing that, the spec) knows about but the
  // wall does not report: never launched, or removed from the wall since.
  const known = new Set(rows.map((row) => row.id));
  const notOnWall = [
    ...stateMissions.map((mission) => ({ id: mission.id, title: mission.title, failure: mission.failure?.code ?? null })),
    ...spec.missions.map((mission) => ({ id: mission.id, title: mission.title, failure: null })),
  ];
  for (const mission of notOnWall) {
    if (known.has(mission.id)) continue;
    known.add(mission.id);
    const retiredRow = retiredById.get(mission.id);
    if (retiredRow !== undefined) {
      rows.push({
        id: mission.id,
        missionId: retiredRow.missionId ?? null,
        title: retiredRow.title ?? mission.title,
        source: "wall-retired",
        status: wallRowDisposition(retiredRow),
        live: false,
        retired: true,
        retiredAt: retiredRow.completedAt ?? retiredRow.stoppedAt ?? null,
        paneId: retiredRow.paneId ?? null,
        inFleetState: stateIds.has(mission.id),
        inSpec: specIds.has(mission.id),
        failure: mission.failure,
        rounds: roundReceipts(spec.stateDir, mission.id).map((file) => path.basename(file)),
      });
      continue;
    }
    rows.push({
      id: mission.id,
      missionId: null,
      title: mission.title,
      source: stateIds.has(mission.id) ? "state" : "spec",
      status: "not-on-wall",
      live: false,
      paneId: null,
      inFleetState: stateIds.has(mission.id),
      inSpec: specIds.has(mission.id),
      failure: mission.failure,
      rounds: roundReceipts(spec.stateDir, mission.id).map((file) => path.basename(file)),
    });
  }

  const fleetStatePath = path.join(spec.stateDir, "fleet.json");
  if (options.json) {
    emitJson({
      ok: true,
      verb: "status",
      fleet: spec.fleet,
      wallStatus: wall.status ?? "present",
      stateDir: spec.stateDir,
      reconciliation: {
        fleetStatePath,
        fleetStatePresent: state !== null,
        onWallNotInState,
        inStateNotOnWall,
        foreignFleetRows: foreignRows.map(wallRowId),
        retiredRows: [...retiredById.keys()],
        staleMissionCount: staleCount,
      },
      missions: rows,
    });
  } else {
    const header = ["id", "source", "status", "live", "paneId", "rounds"];
    const table = rows.map((row) => [row.id, row.source, row.status, row.live ? "live" : "-", row.paneId ?? "-", row.rounds.join(",") || "-"]);
    const widths = header.map((name, i) => Math.max(name.length, ...table.map((cells) => cells[i].length), 1));
    const line = (cells) => cells.map((cell, i) => cell.padEnd(widths[i])).join("  ").trimEnd();
    process.stdout.write(`fleet ${spec.fleet} · wall ${wall.status ?? "present"} · ${rows.length} mission(s)\n`);
    process.stdout.write(line(header) + "\n");
    for (const cells of table) process.stdout.write(line(cells) + "\n");
    if (!state) process.stdout.write(`reconcile: no fleet state at ${fleetStatePath} (launch has not run, or it was removed)\n`);
    if (onWallNotInState.length > 0) {
      process.stdout.write(`reconcile: on the wall but missing from fleet state: ${onWallNotInState.join(", ")}\n`);
    }
    if (inStateNotOnWall.length > 0) {
      process.stdout.write(`reconcile: in fleet state but not on the wall: ${inStateNotOnWall.join(", ")}\n`);
    }
    if (foreignRows.length > 0) {
      process.stdout.write(`reconcile: wall row(s) registered under another fleet for run id(s) this fleet tracks: ${foreignRows.map((row) => `${wallRowId(row)} (${row.fleet ?? "none"})`).join(", ")}\n`);
    }
    if (staleCount > 0) {
      process.stdout.write(`reconcile: the wall reports ${staleCount} stale mission(s) with no live pane and no registry row (they still hold L1 capacity) — run \`bash <ufoRoot>/scripts/ufo-sighting reconcile\`\n`);
    }
    if (wallStatus === "absent") {
      process.stdout.write("reconcile: the wall reports status \"absent\" (no wall session) — every mission below is reported not-on-wall; nothing is running\n");
    }
  }
  return EXIT_OK;
}

function verbClose(spec, authority, options) {
  let targets = spec.missions;
  if (options.mission) {
    targets = spec.missions.filter((mission) => mission.id === options.mission);
    if (targets.length === 0) typed("UNKNOWN_MISSION", `--mission ${options.mission} is not in fleet ${spec.fleet}`);
  }
  // The wall is the only authority on whether a pane is live. Refuse the whole
  // close while any target is live: completing one mission of a fleet while a
  // sibling still runs tears the fleet apart for a mission that is not done.
  const registry = wallRegistry(spec);
  const registryById = registry.byId;
  const liveById = liveViewById(registry);
  const live = targets.filter((mission) => wallRowLive(liveById.get(mission.id)));
  if (registry.wallStatus === "absent") {
    // The wall reports itself absent (no session): every target would resolve
    // as "absent" and the run would exit 0 having completed nothing. Refuse.
    typed("WALL_ABSENT", `the sighting wall reports status "absent" — nothing was completed; open it first (\`bash <ufoRoot>/scripts/ufo-sighting open\`)`);
  }
  if (live.length > 0 && !options.force) {
    typed("PANE_LIVE", `mission(s) ${live.map((mission) => mission.id).join(", ")} still live on the wall; refusing to complete a live mission (pass --force to complete anyway — their panes keep running)`);
  }
  if (live.length > 0) {
    warn(`--force: completing live mission(s) ${live.map((mission) => mission.id).join(", ")} — their panes keep running`);
  }
  const results = [];
  const failures = [];
  for (const mission of targets) {
    const row = registryById.get(mission.id);
    const worktree = path.join(spec.worktreeRoot, mission.id);
    if (row === undefined) {
      // Nothing the wall's registry reports. A ghost row (manifest-live, pane
      // dead) lands here too, and it still holds L1 capacity — so name the
      // wall's own reconcile verb instead of just "nothing to complete".
      const stale = registry.staleCount > 0
        ? `; the wall reports ${registry.staleCount} stale mission(s) with no live pane — \`bash <ufoRoot>/scripts/ufo-sighting reconcile\` may be required`
        : "";
      warn(`mission ${mission.id} is not in the wall's registry — nothing to complete${stale}`);
      results.push({ id: mission.id, status: "absent", completed: false, paneLive: false, worktree });
      continue;
    }
    const paneLive = wallRowLive(liveById.get(mission.id));
    if ((row.fleet ?? null) !== null && (row.fleet ?? null) !== spec.fleet) {
      warn(`mission ${mission.id} is registered under fleet ${row.fleet} — completing it from fleet ${spec.fleet} by run id`);
    }
    const completed = wallCli(spec, "complete", "--mission", mission.id, "--note", "tower-fleet close");
    const detail = (completed.stdout || completed.stderr).slice(0, 200);
    if (completed.status !== 0) {
      // Same partial-state policy as launch: record this mission's failure, keep
      // the completions that already landed, and report every outcome instead of
      // aborting with nothing but a typed error.
      failures.push({ id: mission.id, detail });
      warn(`wall complete failed for ${mission.id} (exit ${completed.status}): ${detail}`);
      results.push({ id: mission.id, status: completed.status, completed: false, paneLive, phase: wallRowPhase(row), failure: { code: "COMPLETE_FAILED", detail }, worktree });
      continue;
    }
    results.push({ id: mission.id, status: completed.status, completed: true, paneLive, phase: wallRowPhase(row), worktree });
  }
  if (options.json) {
    emitJson({ ok: failures.length === 0, verb: "close", fleet: spec.fleet, forced: Boolean(options.force), failures, missions: results, worktreeRemoval: "manual-only" });
  } else {
    for (const row of results) {
      if (row.completed) {
        process.stdout.write(`completed wall mission ${row.id}${row.paneLive ? " (pane left running: --force)" : ""}\n`);
      } else if (row.status === "absent") {
        process.stdout.write(`skipped ${row.id} — not in the wall's registry\n`);
      } else {
        process.stdout.write(`FAILED ${row.id} — exit ${row.status}: ${row.failure?.detail ?? ""}\n`);
      }
    }
    process.stdout.write("\nWorktrees are NEVER removed automatically. Preserve unmerged work first (inspect, then integrate or keep the branch).\n");
    process.stdout.write(`For each mission, retire its worktree by path only — never \`omp worktree clear\`:\n`);
    for (const row of results) {
      process.stdout.write(`  git -C ${spec.repo} worktree remove ${row.worktree}\n`);
    }
  }
  if (failures.length > 0) {
    typed("COMPLETE_FAILED", `${failures.length} of ${targets.length} missions failed to complete (${failures.map((failure) => failure.id).join(", ")}); the completions that did land are recorded above`);
  }
  return EXIT_OK;
}

// ── argument parsing ────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = [...argv];
  let verb = "plan";
  if (args.length > 0 && !args[0].startsWith("-")) {
    verb = args.shift();
    if (!VERBS.has(verb)) usageExit(`unknown verb ${verb}`);
  }
  const options = { verb, spec: null, apply: false, json: false, mission: null, force: false };
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--spec") {
      if (args.length === 0) usageExit("--spec needs a path");
      options.spec = path.resolve(args.shift());
    } else if (arg === "--apply") {
      options.apply = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--mission") {
      if (args.length === 0) usageExit("--mission needs an id");
      options.mission = args.shift();
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write("usage: node sighting/tower-fleet.mjs [plan|launch|status|close] --spec <fleet.json> [--apply] [--mission <id>] [--force] [--json]\n");
      process.exit(EXIT_OK);
    } else {
      usageExit(`unknown argument ${arg}`);
    }
  }
  if (options.spec === null) usageExit("--spec is required");
  if (options.mission !== null && options.verb !== "close") usageExit("--mission only applies to close");
  if (options.force && options.verb !== "close") usageExit("--force only applies to close");
  if ((options.verb === "launch" || options.verb === "close") && !options.apply) {
    typed("MUTATION_REQUIRES_APPLY", `${options.verb} mutates the wall and the worktrees; pass --apply to confirm`);
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const specPath = options.spec;
  // The fleet spec carries ufoRoot; the band authority must be read before
  // ceilings can be enforced, and the raw spec before it can be normalized.
  let preSpec;
  try {
    preSpec = JSON.parse(readFileSync(specPath, "utf8"));
  } catch (error) {
    typed("INVALID_SPEC", `cannot read fleet spec ${specPath}: ${error.message}`);
  }
  if (typeof preSpec?.ufoRoot !== "string" || preSpec.ufoRoot.trim() === "") {
    typed("INVALID_SPEC", "fleet spec needs ufoRoot (the substrate carrying config/ufo.json and scripts/ufo-sighting)");
  }
  const authority = loadBandAuthority(path.resolve(preSpec.ufoRoot.trim()));
  const spec = loadSpec(specPath, authority);
  switch (options.verb) {
    case "plan": return verbPlan(spec, authority, options);
    case "launch": return verbLaunch(spec, authority, options);
    case "status": return verbStatus(spec, authority, options);
    case "close": return verbClose(spec, authority, options);
    default: usageExit(`unhandled verb ${options.verb}`);
  }
}

try {
  process.exitCode = main();
} catch (error) {
  if (error instanceof TypedError) {
    process.stderr.write(JSON.stringify({ ok: false, code: error.code, message: error.message }) + "\n");
    process.exit(EXIT_TYPED);
  }
  process.stderr.write(JSON.stringify({ ok: false, code: "UNEXPECTED_ERROR", message: String(error?.message ?? error) }) + "\n");
  process.exit(EXIT_TYPED);
}
