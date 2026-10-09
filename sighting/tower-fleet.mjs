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
 *   node sighting/tower-fleet.mjs close  --spec <fleet.json> --apply [--mission <id>] [--json]
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
 *     `<stateDir>`, `<worktreeRoot>`, and the mission worktrees;
 *   - every shell-out is `spawnSync` with an explicit argv array — no shell
 *     strings built from spec content;
 *   - the omp argv stays interactive (no `-p`/`--print`, no `--mode`), and
 *     `omp --cwd` always equals the mission cwd.
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
  mkdirSync,
  readFileSync,
  readdirSync,
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
    "usage: node sighting/tower-fleet.mjs [plan|launch|status|close] --spec <fleet.json> [--apply] [--mission <id>] [--json]\n"
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

  return {
    fleet: raw.fleet,
    repo,
    ufoRoot,
    base,
    roundCeiling,
    maxTime,
    stateDir: resolveRepoPath(repo, raw.stateDir ?? `.tower/fleets/${raw.fleet}`, "stateDir"),
    worktreeRoot: resolveRepoPath(repo, raw.worktreeRoot ?? `.tower/worktrees/${raw.fleet}`, "worktreeRoot"),
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
  // Open the wall once for the whole run.
  const opened = wallCli(spec, "open");
  if (opened.status !== 0) {
    typed("WALL_OPEN_FAILED", `bash ${wallCliPath} open exited ${opened.status}: ${(opened.stderr || opened.stdout).slice(0, 400)}`);
  }
  mkdirSync(spec.stateDir, { recursive: true });

  const records = [];
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
      launchResult: null,
    };

    // 1. worktree — reuse an existing one with a warning, never clobber it.
    if (existsSync(row.worktree)) {
      warn(`worktree ${row.worktree} already exists — reusing it as-is`);
      record.worktreeReused = true;
    } else {
      const added = run([
        "omp", "worktree", "add",
        "-C", spec.repo,
        "-b", row.branch,
        row.worktree,
        spec.base,
      ]);
      if (added.status !== 0) {
        typed("WORKTREE_ADD_FAILED", `omp worktree add failed for ${row.id} (exit ${added.status}): ${(added.stderr || added.stdout).slice(0, 400)}`);
      }
    }

    // 2. skills — copy each named skill into the worktree; missing is a warning.
    for (const skill of mission.skills) {
      const source = copySkill(skill, spec, row.worktree);
      if (source === null) warn(`skill ${skill} not found for mission ${row.id} (searched repo, ufoRoot, ~/.agents/skills) — continuing`);
      record.skills.push({ name: skill, source });
    }

    // 3. prompt into the state dir (+ per-mission session dir).
    const sessionsDir = path.join(spec.stateDir, "sessions", row.id);
    mkdirSync(sessionsDir, { recursive: true });
    writeFileSync(row.promptPath, row.prompt);

    // 5. launch the pane; capture the wall's JSON result.
    const launched = wallCli(spec, ...row.launchArgv.slice(2));
    if (launched.status !== 0) {
      let detail = (launched.stderr || launched.stdout).slice(0, 400);
      try {
        const failure = JSON.parse(launched.stdout || launched.stderr);
        if (failure?.code) detail = `${failure.code}: ${failure.message ?? detail}`;
      } catch { /* verbatim text is the fallback detail */ }
      typed("LAUNCH_FAILED", `wall launch failed for mission ${row.id} (exit ${launched.status}): ${detail}`);
    }
    const result = parseJsonOutput(launched.stdout, `wall launch for ${row.id}`);
    record.launchResult = result;
    const rowView = (result.missions ?? []).find((m) => m.runId === row.id || m.missionId === row.id);
    record.paneId = rowView?.paneId ?? null;
    if (record.paneId === null) warn(`wall launch for ${row.id} reported no pane id`);
    records.push(record);
  }

  // 6. fleet state, written only under <stateDir>.
  const fleetPath = path.join(spec.stateDir, "fleet.json");
  writeFileSync(fleetPath, JSON.stringify({
    ok: true,
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
    emitJson({ ok: true, verb: "launch", fleet: spec.fleet, fleetStatePath: fleetPath, missions: records.map(({ launchResult, ...rest }) => ({ ...rest, launchResultRecorded: Boolean(launchResult) })) });
  } else {
    for (const record of records) {
      process.stdout.write(`launched ${record.id} · pane ${record.paneId ?? "?"} · worktree ${record.worktree}\n`);
    }
    process.stdout.write(`fleet state: ${fleetPath}\n`);
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

function verbStatus(spec, authority, options) {
  const result = wallCli(spec, "status", "--lite");
  if (result.status !== 0) {
    typed("WALL_STATUS_FAILED", `wall status --lite exited ${result.status}: ${(result.stderr || result.stdout).slice(0, 400)}`);
  }
  const wall = parseJsonOutput(result.stdout, "wall status --lite");
  const fleetMissions = (wall.missions ?? []).filter((mission) => (mission.fleet ?? null) === spec.fleet);
  const rows = fleetMissions.map((mission) => ({
    id: mission.runId ?? mission.missionId,
    missionId: mission.missionId,
    title: mission.title,
    status: mission.status ?? mission.phase ?? "unknown",
    paneId: mission.paneId,
    rounds: roundReceipts(spec.stateDir, mission.runId ?? mission.missionId).map((file) => path.basename(file)),
  }));
  if (rows.length < spec.missions.length) {
    const known = new Set(rows.map((row) => row.id));
    for (const mission of spec.missions) {
      if (!known.has(mission.id)) rows.push({ id: mission.id, missionId: null, title: mission.title, status: "not-on-wall", paneId: null, rounds: roundReceipts(spec.stateDir, mission.id).map((file) => path.basename(file)) });
    }
  }
  if (options.json) {
    emitJson({ ok: true, verb: "status", fleet: spec.fleet, wallStatus: wall.status ?? "present", stateDir: spec.stateDir, missions: rows });
  } else {
    const header = ["id", "status", "paneId", "rounds"];
    const table = rows.map((row) => [row.id, row.status, row.paneId ?? "-", row.rounds.join(",") || "-"]);
    const widths = header.map((name, i) => Math.max(name.length, ...table.map((cells) => cells[i].length), 1));
    const line = (cells) => cells.map((cell, i) => cell.padEnd(widths[i])).join("  ").trimEnd();
    process.stdout.write(`fleet ${spec.fleet} · wall ${wall.status ?? "present"} · ${rows.length} mission(s)\n`);
    process.stdout.write(line(header) + "\n");
    for (const cells of table) process.stdout.write(line(cells) + "\n");
  }
  return EXIT_OK;
}

function verbClose(spec, authority, options) {
  let targets = spec.missions;
  if (options.mission) {
    targets = spec.missions.filter((mission) => mission.id === options.mission);
    if (targets.length === 0) typed("UNKNOWN_MISSION", `--mission ${options.mission} is not in fleet ${spec.fleet}`);
  }
  const results = [];
  for (const mission of targets) {
    const completed = wallCli(spec, "complete", "--mission", mission.id, "--note", "tower-fleet close");
    const detail = (completed.stdout || completed.stderr).slice(0, 200);
    if (completed.status !== 0) {
      typed("COMPLETE_FAILED", `wall complete failed for ${mission.id} (exit ${completed.status}): ${detail}`);
    }
    results.push({ id: mission.id, status: completed.status, worktree: path.join(spec.worktreeRoot, mission.id) });
  }
  if (options.json) {
    emitJson({ ok: true, verb: "close", fleet: spec.fleet, missions: results, worktreeRemoval: "manual-only" });
  } else {
    for (const row of results) process.stdout.write(`completed wall mission ${row.id}\n`);
    process.stdout.write("\nWorktrees are NEVER removed automatically. Preserve unmerged work first (inspect, then integrate or keep the branch).\n");
    process.stdout.write(`For each mission, retire its worktree by path only — never \`omp worktree clear\`:\n`);
    for (const row of results) {
      process.stdout.write(`  git -C ${spec.repo} worktree remove ${row.worktree}\n`);
    }
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
  const options = { verb, spec: null, apply: false, json: false, mission: null };
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
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write("usage: node sighting/tower-fleet.mjs [plan|launch|status|close] --spec <fleet.json> [--apply] [--mission <id>] [--json]\n");
      process.exit(EXIT_OK);
    } else {
      usageExit(`unknown argument ${arg}`);
    }
  }
  if (options.spec === null) usageExit("--spec is required");
  if (options.mission !== null && options.verb !== "close") usageExit("--mission only applies to close");
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
