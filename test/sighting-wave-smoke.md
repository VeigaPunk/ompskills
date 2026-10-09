# UFO Sighting × Godspeed — 16–32-lane wave smoke test

The live procedure for the operator directive *"integrate the ufo sighting (tmux
usage) and the godspeed directive into it; as a test … dispatched in swarms of
16–32, up to 100 per round"*.

Three artifacts, one test:

| File | Role |
| ---- | ---- |
| `test/run-wave-test.mjs` | the automated dry half — every check that can be proven without burning a model call, and a hard stop at the dispatch boundary |
| `test/tower-fleet.test.mjs` | the tower-fleet launcher's dry half — fixture specs only, it never touches the real wall or the substrate |
| `test/sighting-wave-smoke.md` | this file — the live half, step by step, including the one step no script may take |

Two repo files these steps drive, neither of them a test: `sighting/tower-fleet.mjs`
(the launcher that turns the wall into a one-pane-per-L1 fleet) and its prompt
template `sighting/l1-prompt.md`.

Everything the dry half produces lands under `test/evidence/<stamp>/`. Evidence
is run output, not source: `test/evidence/.gitignore` keeps the directory and
ignores its contents.

## Band authority — the numbers this test is about

One source: `host/ufo-sighting-dispatch.json`, merged into
`<ufoRoot>/config/ufo.json` by `node host/apply.mjs --apply`. Post-apply:

| Key | Value | Meaning |
| --- | ----- | ------- |
| `sighting.dispatch.swarm.waveMinLanes` | 16 | wave floor |
| `sighting.dispatch.swarm.waveMaxLanes` | 32 | wave ceiling |
| `sighting.dispatch.swarm.maxLanes` | 100 | per-L1 round ceiling (sequential waves) |
| `sighting.dispatch.maxConcurrentL1` | 16 | live L1 missions on the wall, globally |
| `sighting.windowPaneCeiling` | 16 | panes in one `--fleet` window |
| `sighting.dispatch.missionFormat.l1Alias` | `m_strong` | the only model reference any argv carries |

A **wave** is 16–32 lanes. A **round** is up to 100 lanes, dispatched as
sequential waves of at most 32. Nothing in this test hardcodes a provider,
model, or credential: routing is the role → `@m_*` table in the operator's
global `~/.omp/agent/config.yml`.

Measure the band from the merged `<ufoRoot>/config/ufo.json`, never from this
table alone — that file is a mutable working-tree artifact. Until `--apply`
writes it, it still carries the pre-apply 32–100 band, and
`test/run-wave-test.mjs --band live` refuses with `apply_not_landed` (exit 1)
rather than testing the wrong band; use `--band fixture` until then.
`host/omp-agent.config.yml` is installed verbatim by the same apply, but its
prose comments are not the band authority — `host/ufo-sighting-dispatch.json` is.

## What this test proves

1. The post-apply swarm band admits the 16-lane floor wave and the 32-lane wave
   ceiling, and refuses 15 (`too_few_lanes`), 33 (`wave_too_wide`) and 101
   (`too_many_lanes`) — every edge is real, not cosmetic.
2. `scripts/ufo-swarm-wave.mjs run` renders a `ufo-swarm-wave-dispatch-v1`
   payload whose 16 lanes each carry an explicit taxonomy role, no per-lane
   `model` param, and `/skill:godspeed` as the leading line — the Godspeed
   posture is *invoked* per lane, not assumed.
3. The wave is dispatchable as **exactly one** batched OMP `task` call.
4. `sighting/tower-fleet.mjs plan` reads every band number, ceiling and alias
   live from `<ufoRoot>/config/ufo.json` (nothing hardcoded), writes nothing,
   and emits per-mission worktree, branch, prompt path, and the exact
   `ufo-sighting launch … -- omp …` argv it would run — interactive omp only,
   `--model @<l1Alias>` as the sole routing reference.
5. The operator wall (tmux session `ufo_sighting`) opens, reports state, hosts a
   `--fleet` window, and can be closed honestly.
6. Per-lane report artifacts are collectable and joinable into the
   `ufo-mission-result-v1` envelope.

## What it does not prove — read this before claiming a pass

**Swarm lanes.**
- **Swarm lanes are not wall missions.** Nothing registers an OMP `task` lane as
  a mission or a pane. The two auto-registration paths that do exist register
  something else: `sighting.autoRegisterInvokedNativeTrial` registers an
  interactive *native trial*, and `sighting.dispatch.autoDispatchMissions`
  registers a *queue task* — neither is a lane. A wave appears on the wall only
  as the *parent* mission's L2 counter (`levels.l2` = the **count** of
  spawned-not-settled task ids read from that session's transcript, never the
  ids themselves), and only when the parent session was itself launched or
  registered on the wall. `levels.l2: null` with `levelDetails.l2.status:
  "opaque"` means **unknown** — the per-mission spelling of an unreadable
  transcript can also be `"unavailable"`; never report either as settled.
- **The wall cannot show wave lanes as panes.** Window 1's capacity is the geometry grid
  (3×5 = 15 on 16:9, 3×6 = 18 on 21:9 — computed products, not config values);
  a named `--fleet` window renders its own 3-row grid and is capped by
  `sighting.windowPaneCeiling` = 16. This is display capacity, not a wave bound,
  and it is irrelevant to task lanes.
- **`complete --mission` kills the mission's pane.** Completing the parent while
  lanes are still running ends the wave under test. It is the last step, after
  settle is evidenced, never before.
- **The Godspeed hook is project-scoped.** `.omp/hooks/pre/ufo-godspeed-inject.js`
  lives in `ufo-fsd-alpha`, so it only enforces the leading line for OMP
  sessions rooted there. Dispatching from this repo means the guarantee comes
  from the wave renderer alone — which step 4 asserts lane by lane.

**The tower fleet.**
- **A launched pane is not a working fleet.** `launch --apply` proves that
  worktrees, prompts and panes were created. It proves nothing about what the L1
  in that pane does next, and a pane id is not a settled mission.
- **`launch` does not prove the wave dispatches.** Only the L1's own steps 5–7
  (below) do. The launcher never issues a `task` call.
- **The launcher's ceiling check is necessary, not sufficient.**
  `L1_CEILING_EXCEEDED`/`PANE_CEILING_EXCEEDED` refuse a fleet bigger than
  `min(maxConcurrentL1, windowPaneCeiling)` at plan time, but `maxConcurrentL1`
  bounds **globally live** missions, not this fleet. The real tower1 launch is
  the proof: 16 missions declared, 15 panes up, and the 16th refused by the wall
  itself (`LAUNCH_FAILED` / `L1_CEILING_EXCEEDED: global L1 mission ceiling is
  16`) because other missions were already live. Only `fleet.json`'s per-mission
  `failure` says what actually happened.
- **A partial launch is a result.** `launch` records the failure, keeps the
  panes that came up, writes `fleet.json`, and exits 2 with `LAUNCH_PARTIAL`.
  It never rolls back, and it never removes a worktree it created.
- **`close` is not cleanup.** It completes wall missions with the fixed note
  `tower-fleet close` (there is no `--note` flag), so an honest
  `16/16 lanes reported` note needs `scripts/ufo-sighting complete` directly.
  It defaults to **all** missions in the spec, aborts the loop on the first
  failure (`COMPLETE_FAILED`, earlier missions already completed), and **never
  removes a worktree** — it prints the per-mission `git -C <repo> worktree
  remove <path>` line and warns that unmerged work must be preserved first.
- **`status` reports the wall, not the truth about the work.** A spec mission
  absent from the wall shows as `not-on-wall`; a live pane shows whatever phase
  the wall last recorded. Neither is a settle signal.
- **Worktree reuse is a warning path, not idempotence.** Relaunching over an
  existing worktree reuses it as-is (`warning: worktree … already exists`); that
  is not proof of a clean relaunch.

## Preconditions and sequencing

The tower runs these in order; the smoke test is meaningless if the apply has
not landed, because the band it validates is the *merged* band. See
**Band authority** above for the pre-apply refusal.

```bash
REPO=/home/vgpnk/Projects/ompskills            # this checkout (post-merge)
UFO=/home/vgpnk/Projects/ufo-fsd-alpha         # the substrate under test

node "$REPO/host/apply.mjs"                    # dry run: must exit 0, writes nothing
node "$REPO/host/apply.mjs" --apply            # installs ~/.omp/agent/config.yml + merges config/ufo.json
node "$REPO/test/run-wave-test.mjs" --band live   # the dry half against the REAL post-apply band
node "$REPO/test/tower-fleet.test.mjs"            # the launcher's dry half (fixtures only)
```

`apply.mjs --apply` writes exactly two files (`~/.omp/agent/config.yml`, and
`<ufoRoot>/config/ufo.json`), each with a timestamped backup when the target
already exists. It deliberately leaves derived artifacts stale —
`crates/ufo-core-runtime/bundled/omp-seat-routing.json`,
`crates/ufo-core-runtime/bundled/config.json`, the AGENTS.md band mentions, and
the AGENTS.md generated seat table — so `contracts:check` and
`sync-global-routing.mjs --check` report drift afterwards by design. That is the
operator's deferred state, not a smoke-test failure.

`tmux` must be installed, and `open` needs a GUI terminal: it spawns
`omarchy-launch-or-focus-tui` and waits up to 10 s for exactly one attached
client, failing `ATTACH_TIMEOUT`, `DUPLICATE_CLIENTS` or
`TERMINAL_LAUNCHER_MISSING` otherwise. The fleet launch needs the same terminal
path, because it opens the wall once for the whole run.

---

## Step 0 — the automated dry half

```bash
cd "$REPO"
node test/run-wave-test.mjs --band live          # post-apply; use --band fixture before the apply lands
node test/tower-fleet.test.mjs                   # the launcher: plan/refusals/argv, fixtures only
```

`run-wave-test.mjs`: exit 0 means every check passed **and nothing was
dispatched**; exit 1 names the failing check; exit 64 is a usage error. Before
the apply has landed, `--band live` refuses with `apply_not_landed` and points at
`--apply` — that refusal is correct behaviour, not a broken test.
`tower-fleet.test.mjs`: exit 0 every check passed, 1 a check failed, 64 usage; it
never opens the wall or writes outside its own temp fixtures.

The wave run writes, under `test/evidence/<stamp>/`:

| Artifact | What it is |
| -------- | ---------- |
| `apply-dry-run.log` | the `host/apply.mjs` gate's full output and exit code |
| `ufo-root/config/ufo.json` | the band authority used (`--band fixture` synthesizes it; `--band live` points at the real file instead) |
| `spec-16.json`, `spec-15.json`, `spec-33.json`, `spec-101.json`, `spec-ceiling-32.json`, `spec-single-family-16.json`, `spec-resume-only.json` | every spec the run judged |
| `plan-16.stdout.json`, `dispatch-16.json` | the plan and the dispatch payload |
| `swarm-registry.json` | copy of the `ufo-swarm-registry-v1` member registry `run` persisted |
| `refusal-15.json`, `refusal-33.json`, `refusal-101.json` | the band-edge refusals, verbatim |
| `refusals/<code>.json`, `refusals/<code>.output.json` | the rest of the refusal vocabulary — each spec and the planner's typed answer |
| `plan-resume-only.json`, `record-synthetic.stdout.json` | the floor-exempt resume proof |
| `route-preflight.json`, `plan-route-families.json` | route-family concentration, single-family vs mixed |
| `fixture-home/.omp/agent/config.yml` | copy of the candidate global config, used only to prove the operator-facing `plan --route-families` flag end to end |
| `wall-*.log` | wall captures, `--live-wall` only |
| `dispatch-boundary.txt` | the printed manual step, as evidence of where the script stopped |
| `manifest.json` | every check, its verdict and its detail, plus `dispatched: false` |

Containment: the planner gates its config and registry paths beneath its project
root, so the script runs the CLI with `UFO_PROJECT_ROOT` set to a scratch root
inside the evidence directory. A dry invocation writes nothing into
`ufo-fsd-alpha` and touches the live tmux server only to ask whether the session
exists; `--live-wall` is the exception on both counts, because opening the wall
writes `.ufo/sighting/manifest.json` there and attaches a terminal.

## Step 1 — open the wall

```bash
cd "$UFO"
bash scripts/ufo-sighting open
```

Expect exit 0 with JSON on stdout showing `status: "attached"` and
`attachedClientCount: 1`. The verb starts the tmux server and session
`ufo_sighting` (window 1) if absent, creates `.ufo/sighting/manifest.json`, and
focuses a terminal. It registers **no** missions. Exit 2 with a typed code on
stderr means the wall did not open — do not continue and claim wall evidence.

Captures that are safe to take at any point:

```bash
bash scripts/ufo-sighting status --lite          # machine-readable wall state (JSON, stdout)
bash scripts/ufo-sighting overview --width 200   # text render of the grid
bash scripts/ufo-sighting surface --json         # static verb/exit-code/caps contract
bash scripts/ufo-sighting overview --watch       # human dashboard, long-running — terminal only, never captured
```

Use `status --lite` for evidence: plain `status` also takes the display lock,
rewrites tmux options and can create the dashboard pane. `reconcile` is a
standalone verb — `status reconcile` is rejected as an unexpected argument even
though the usage line reads as if it were valid. Exit codes for every verb are
**0 ok / 2 typed error**, with `{ok:false,code,message}` on stderr; there is no
64 in this CLI. `surface --json` is a static self-description, not the
authority: it omits itself from its own verb map and under-reports
`complete --dry-run`, so never use it to "disprove" a flag the CLI accepts.

### Step 1b — only if the wave must be visible on the wall

The wave is visible as an L2 counter only when the *dispatching* session is a
registered mission. Two ways in:

```bash
# a pane of its own, running the command you give it
bash scripts/ufo-sighting launch --run-id sighting-wave-16 --session-id <omp-session-id> -- omp …

# or adopt an existing live pane in window 1 (run from inside that pane)
bash scripts/ufo-sighting register --run-id sighting-wave-16 --session-id <omp-session-id> --pane-id "$TMUX_PANE" -- omp …
```

`runId` must match `^[A-Za-z][A-Za-z0-9_-]{0,63}$`, `sessionId`
`^[A-Za-z][A-Za-z0-9_.-]{0,127}$`. `register` fails `WALL_ABSENT` if the wall is
not open and `INVALID_PANE` if the pane is not in window 1 (a `--fleet` pane is
not in window 1, so `register` cannot adopt it).

If the tower dispatches from a plain OMP session instead, that is legitimate —
the wall then contributes `open`/`status`/`overview` captures only, and settle
is proven by steps 6 and 7 alone. Say which of the two happened.

## Step 1c — launch the tower fleet (the live launch procedure)

This is the step that turns the wall into a fleet: one interactive omp pane per
L1 mission, each in its own worktree, with its prompt rendered from
`sighting/l1-prompt.md`. It is **not** part of the wave; it is what a wave-pilot
mission runs when the operator wants several L1 missions live at once.

```bash
cd "$REPO"
SPEC=.tower/fleets/<fleet>/spec.json

node sighting/tower-fleet.mjs plan   --spec "$SPEC"            # default verb; writes nothing
node sighting/tower-fleet.mjs plan   --spec "$SPEC" --json     # the same, machine-readable

node sighting/tower-fleet.mjs launch --spec "$SPEC" --apply    # worktrees + prompts + panes
node sighting/tower-fleet.mjs status --spec "$SPEC"            # live rows + round receipts
node sighting/tower-fleet.mjs close  --spec "$SPEC" --apply [--mission <id>]
```

Exit codes are **0 ok / 2 typed `{ok:false,code,message}` on stderr / 64 usage**.
`launch` and `close` refuse without `--apply` (`MUTATION_REQUIRES_APPLY`) inside
argument parsing — before the spec is even read, so a refused mutation writes
nothing.

The fleet spec is JSON:

```json
{
  "fleet": "tower1", "repo": "/home/vgpnk/Projects/ompskills", "base": "main",
  "ufoRoot": "/home/vgpnk/Projects/ufo-fsd-alpha",
  "roundCeiling": 2, "maxTime": "3h",
  "missions": [
    { "id": "tf-x", "title": "…", "axis": "…", "goal": "…",
      "scope": ["path/prefix"], "skills": ["tower"] }
  ]
}
```

Defaults: `base` = the repo HEAD branch, `roundCeiling` = 1, `maxTime` = `3h`,
`stateDir` = `<repo>/.tower/fleets/<fleet>`, `worktreeRoot` =
`<repo>/.tower/worktrees/<fleet>`, `skills` = `[]`. Unknown keys are ignored.
Every mission needs non-empty `title`/`axis`/`goal` and a non-empty, repo-relative
`scope`; scopes must be pairwise disjoint (`SCOPE_OVERLAP`), and the fleet must
fit `min(maxConcurrentL1, windowPaneCeiling)` (`L1_CEILING_EXCEEDED`,
`PANE_CEILING_EXCEEDED`). Everything else is `INVALID_SPEC`.

`plan` prints (and `--json` returns) the band it read live, then per mission: the
worktree, the branch `tower/<fleet>/<id>`, the prompt path, and the exact
argv pair it would run.

`launch --apply`, per mission, in order:

1. reuses an existing worktree with a warning, else
   `omp worktree add -C <repo> -b tower/<fleet>/<id> <worktree> <base>`;
2. copies each named `skills` entry into `<worktree>/.omp/skills/<name>`
   (searched in the repo, then `ufoRoot`, then `~/.agents/skills`; a miss is a
   warning, never a failure);
3. renders `sighting/l1-prompt.md` to `<stateDir>/<id>.prompt.md` and creates
   `<stateDir>/sessions/<id>`;
4. opens the wall once for the whole run, then launches the pane:

   ```bash
   bash <ufoRoot>/scripts/ufo-sighting launch \
     --run-id <id> --session-id <id> --title "<title>" \
     --fleet <fleet> --cwd <worktree> --no-open --relay --runner-reservation 1 \
     -- omp --cwd <worktree> --session-dir <stateDir>/sessions/<id> \
            --max-time <maxTime> --model @<l1Alias> \
            --config <ufoRoot>/config/mission-nightcall.yml \
            --print-thoughts --auto-approve "@<stateDir>/<id>.prompt.md"
   ```
5. writes `<stateDir>/fleet.json` — band, per-mission worktree/branch/prompt/
   `paneId`, warnings, failures.

The omp argv stays **interactive**: `-p`/`--print` and `--mode`/`--mode=…` are
refused (`INTERACTIVE_GUARD`), and `omp --cwd` must equal the mission worktree.
The only model reference is `--model @<l1Alias>`, read live; no provider or model
literal appears anywhere in the argv.

**Wall evidence for the fleet.** `launch --fleet <fleet>` puts every fleet
mission into one titled tmux window, separate from window 1 (whose own name is
literally `fleet`; a `--fleet` name that collides with it is refused).

```bash
cd "$UFO"
bash scripts/ufo-sighting status --lite          # missions[] rows carry fleet, paneId, runId
bash scripts/ufo-sighting overview --width 200   # the fleet window renders as its own 3-row grid
bash scripts/ufo-sighting peek --mission <id> --lines 120
```

`tower-fleet.mjs status` is the same wall state filtered to the spec's fleet,
joined with each mission's `rounds/<id>-r<N>.md` receipts; a spec mission the
wall does not carry is listed as `not-on-wall` rather than hidden.

## Step 2 — declare the 16-lane wave spec

The spec `test/run-wave-test.mjs` builds is the reference; it is written to
`test/evidence/<stamp>/spec-16.json`. Its shape:

- 16 items, each with an explicit `role` from the ten swarm roles and a
  pairwise-distinct `prompt` (a duplicate expansion is the typed refusal
  `duplicate_expansion`, never a silent dedupe);
- roles cycling `scout, reviewer, scribe, executor` — two route families on the
  candidate global config (`scout`/`scribe` → `@m_fast`, `reviewer`/`executor` →
  `@m_mid`), so the wave is **not** a `singleFamily` concentration;
- one cheap, non-mutating observation per lane (read one file, report one fact),
  so the live run burns little and still yields one artifact per lane;
- `reportDir: test/evidence/<stamp>/lane-reports`, which is where lanes write
  `<Name>.md` and where `run` persists the registry;
- a shared `context` stating goal, leaf constraints and the report contract.

Note the reportDir difference: a wave lane's prompt carries a **relative**
`reportDir`, so its report lands under the dispatching session's cwd; a
tower-fleet L1's prompt carries the **absolute** `<stateDir>/reports/<id>`.

Frozen-topology seats (`planner`, `distiller`, `labrat`, `Main`) are not swarm
roles and must not appear.

## Step 3 — plan

```bash
cd "$UFO"
UFO_PROJECT_ROOT="$REPO/test/evidence/<stamp>/ufo-root" \
UFO_CONFIG_PATH="$UFO/config/ufo.json" \
UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 \
  node scripts/ufo-swarm-wave.mjs plan --spec "$REPO/test/evidence/<stamp>/spec-16.json"
```

Expect exit 0 and `schema: ufo-swarm-wave-v1` with `counts.spawn == counts.total
== 16`, `counts.resume == 0`, and `policy.waveMinLanes == 16`,
`policy.waveMaxLanes == 32`, `policy.maxLanes == 100`, `policy.source ==
"config"`. `plan` writes nothing.

The `UFO_PROJECT_ROOT` / `UFO_CONFIG_PATH` pair is what keeps the real
post-apply `config/ufo.json` as the band authority while every write stays
inside this repo's evidence tree (`UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` is the
repo's documented escape for a config path outside that root; it widens path
gating only, never routing authority). Running plain
`node scripts/ufo-swarm-wave.mjs plan --spec …` from `$UFO` is equally valid —
it just resolves the registry under `$UFO` instead. If the config path is wrong
the planner silently falls back to its built-in band and refuses 16 lanes as
`too_few_lanes` — a band refusal you did not cause is almost always a config
path that did not resolve.

Optional route preflight, which records family concentration without probing:

```bash
node scripts/ufo-swarm-wave.mjs plan --spec … --route-families
```

`--route-probe scripts/probe-ufo-route-health.mjs` additionally pings each
distinct hop and **spends one minimal completion per hop** — use it only when a
route health question is actually open, and never as a routine pre-dispatch
step.

## Step 4 — run, then assert the payload

```bash
UFO_PROJECT_ROOT=… UFO_CONFIG_PATH=… UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 \
  node scripts/ufo-swarm-wave.mjs run --spec "$REPO/test/evidence/<stamp>/spec-16.json" \
  > "$REPO/test/evidence/<stamp>/dispatch-16.json"
```

`run` persists the member registry before emitting the payload. Assert every one
of these on `dispatch-16.json` (the script asserts all of them; this is the list
to re-read by eye before spending tokens):

| Assertion | Expected |
| --------- | -------- |
| `schema` | `ufo-swarm-wave-dispatch-v1` |
| `counts` | `{spawn: 16, resume: 0, total: 16}` |
| `taskCall` | non-null — one call, `context` + `tasks` |
| `taskCall.tasks.length` | 16 |
| per-task keys | exactly `name`, `agent`, `task` — **no `model` key anywhere**; there is no per-lane model knob |
| `task.task` leading line | `/skill:godspeed`, once, on all 16 |
| `task.task` distinctness | 16 pairwise-distinct texts |
| `task.name` distinctness | 16 distinct CamelCase member names |
| `task.agent` | an explicit taxonomy role on every lane |
| registry | `ufo-swarm-registry-v1` at `registry.path`, 16 members, every spawn row `agentId: null` |

## Step 5 — dispatch: exactly one batched OMP `task` call

**This is the step no script takes.** From an OMP session, issue **one** `task`
tool call whose `context` is `payload.taskCall.context` and whose `tasks` is the
complete `payload.taskCall.tasks` array, verbatim:

```bash
node -e 'const d=require("'"$REPO"'/test/evidence/<stamp>/dispatch-16.json");
  console.log(JSON.stringify(d.taskCall,null,1))'
```

- Never split the wave into several `task` calls — one wave is one call, and
  splitting it to dodge a refusal is explicitly forbidden.
- Never add, drop, rename or reword a lane, and never add a model param.
  Routing is the role → `@alias` table in the operator's global
  `~/.omp/agent/config.yml`, resolved by OMP.
- `task.maxConcurrency` is 32 in the candidate host config — omp's own default —
  but it is **not** the wave bound: the band's own `waveMaxLanes` 32 is, and the
  substrate's per-run overlays pin the host cap to 0. A 16-lane wave simply
  leaves the spare slots idle; lanes from the later waves of a 100-member round
  queue behind the earlier waves. That queueing is normal and is not a refusal.
- If `taskCall` is `null`, the wave is resume-only: issue **no** task call and
  send each `resumeSends` entry as
  `hub send --to <entry.resume> --message <entry.message>`.

## Step 6 — observe settle

Settle is a per-lane property: a wave settles when every dispatched lane has a
recorded terminal outcome (`completed`, `failed` or `aborted`). No wall verb
proves that on its own.

```bash
# per-lane artifacts. The reportDir in a lane prompt is RELATIVE, so reports
# land under the dispatching session's cwd — this path is right when that cwd is
# $REPO, which is what the runner's reportDir assumes.
ls -1 "$REPO/test/evidence/<stamp>/lane-reports/"*.md | wc -l     # expect 16

# wall view (parent mission's L2 counter, if step 1b registered it)
cd "$UFO" && bash scripts/ufo-sighting status --lite
cd "$UFO" && bash scripts/ufo-sighting overview --width 200

# read a registered mission's pane back
bash scripts/ufo-sighting peek --mission <RUN_OR_MISSION> --lines 120
# operator input to a registered mission, one line
bash scripts/ufo-sighting steer --mission <RUN_OR_MISSION> --text "<one line>"
```

`peek` prints plain text (not JSON) and needs a live owned pane: `MISSION_NOT_LIVE`
for a stopped/completed row, `DEAD_PANE` when a live row's pane is gone.
`steer` needs exactly one of `--text`/`--text-file`, one printable line ≤ 4096
bytes, and fails `PANE_IN_MODE` if the pane is in copy mode.

If lane reports are not where the payload said, they landed relative to a
different cwd — locate them rather than assuming they are missing:

```bash
find "$REPO" "$UFO" -path '*lane-reports/*.md' -newer "$REPO/test/evidence/<stamp>/spec-16.json" 2>/dev/null
```

## Step 7 — record, then collect

Record the **real** agent ids the `task` call returned, so a later wave can
resume these members by name:

```bash
cd "$UFO"
UFO_PROJECT_ROOT="$REPO/test/evidence/<stamp>/ufo-root" \
  node scripts/ufo-swarm-wave.mjs record \
  --registry "test/evidence/<stamp>/lane-reports/swarm-registry.json" \
  --assignments '{"SwarmScout01":"<real agent id>", …one entry per lane…}'
```

One handle owns one member: mapping two members to one id, or re-pointing a
member to a different id, is a typed refusal (`conflicting_assignment`).

Then join the settled outcomes into the evidence envelope. `--results` is a
`ufo-swarm-results-v1` file with exactly one row per dispatch member
(`status ∈ completed|failed|timeout|cancelled|canceled|aborted`, optional typed
`failureClass`, forbidden on completed rows):

```bash
UFO_PROJECT_ROOT="$REPO/test/evidence/<stamp>/ufo-root" \
  node scripts/ufo-swarm-collect.mjs collect \
  --wave "$REPO/test/evidence/<stamp>/dispatch-16.json" \
  --results "$REPO/test/evidence/<stamp>/settled.json" \
  --out "$REPO/test/evidence/<stamp>/wave-envelope.json"
```

Exit 0 / 1 typed failure / 64 usage. The join is fail-closed in both directions
(`unmapped_member`, `unexpected_member`, `duplicate_member`,
`conflicting_member`, `missing_agent_id`) — a member whose outcome the inputs
cannot name is never invented. With a trusted `reportDir` the collector checks
each `<reportDir>/<Name>.md` exists as a regular file and emits
`reportSummary {expected, present, missing}`; **presence only** — it never reads
or judges report contents. Assert `reportSummary.present == 16` and
`reportSummary.missing == []`.

The envelope is evidence for the L1/L0. It is advisory: no lane becomes a judge
verdict, and wave output never widens a lane's scope.

## Step 8 — close honestly

```bash
cd "$UFO"
bash scripts/ufo-sighting complete --mission <RUN_OR_MISSION> --dry-run   # plan only, changes nothing
bash scripts/ufo-sighting complete --mission <RUN_OR_MISSION> \
  --note "16-lane sighting wave smoke: <N>/16 lanes reported"
```

`--mission` takes a registered `runId` or `m_<hex>` row id — there is no slug
form, and a swarm lane is not a mission. `--dry-run` prints the retention plan
without flipping status or writing the manifest. The real call sets
`status: "completed"`, records `completedAt` and `finalNote`, prunes session
scratch, **kills the mission's pane** (or respawns the idle keeper when it was
the last live pane), and writes the manifest twice. Completing an already
completed mission is an idempotent no-op that keeps the original note.

For a whole tower fleet the launcher wraps the same verb (`close --apply`), but
it passes a fixed note and aborts on the first failure — use the direct verb
above when the note must carry the honest lane count.

Honest closing rules:

- Complete only after step 6/7 evidence exists. Completing a live parent
  terminates the process tree the lanes hang off.
- The note states what was actually observed — `16/16 lanes reported`, or
  `13/16 lanes reported, 3 failed (lane_timeout)`. Never a round number you did
  not count.
- If no mission was ever registered for the dispatching session, there is
  nothing to complete: `MISSION_NOT_FOUND` is the expected code. Record that
  plainly instead of registering a dummy row so the verb has something to close.
- A failed or partial wave is a **result**, not a reason to retry silently until
  it looks clean.

---

## Negative assertions — what must be refused

All of these are checked by `test/run-wave-test.mjs` against the real planner
under the post-apply band, and none of them dispatches anything.

| Case | Expected | Why it matters |
| ---- | -------- | -------------- |
| 15-lane spawn spec | exit 1, `too_few_lanes` | one below the floor — the floor actually bites |
| 16-lane spawn spec | exit 0, admitted | exactly at the floor: the narrowest legal wave |
| 32-lane spawn spec | exit 0, admitted | exactly at the wave ceiling: the widest legal wave |
| 33-lane spawn spec | exit 1, `wave_too_wide` | one above the wave ceiling — one wave never exceeds 32 |
| 101-lane spawn spec | exit 1, `too_many_lanes` | the "up to 100" per-L1 round ceiling holds |
| resume-only wave, 1 lane | exit 0, `counts.resume == 1` | floor-exempt — a resume is continuity to a parked agent, not a new wave |
| resume message text | no `/skill:godspeed` | a resumed lane keeps its session; a stacked invocation would reach it twice |
| all-`m_fast` 16-lane wave | `routePreflight.concentration.singleFamily == true` | the concentration shape the preflight exists to flag (the 1-family / 16-lane counts are the run's details, not script assertions) |
| mixed 16-lane wave | `singleFamily == false`, ≥ 2 families | the wave under test is genuinely spread |
| duplicate prompt expansion | `duplicate_expansion` | never a silent dedupe |
| spawn lane without a role | `role_required` | no wave of generic `task` agents |
| role outside the ten | `unknown_role` | frozen-topology seats are not swarm lanes |
| resume naming an unowned id | `resume_unknown_member` | fail closed before any lane spawns |
| resume carrying a role | `resume_role_forbidden` | a role would mint a replacement identity for an existing agent |
| `spec.maxLanes` below the floor | `impossible_band` | an unreachable band fails before spawning |

`test/tower-fleet.test.mjs` asserts the launcher's own refusals on fixtures:
`MUTATION_REQUIRES_APPLY` for `launch`/`close` without `--apply` (with zero
mutation), `INVALID_SPEC` for a bad fleet name, uppercase fleet, duplicate ids,
bad mission id, absolute `scope`, bad `maxTime`; `SCOPE_OVERLAP` for
overlapping scopes (component-adjacent scopes like `src/core` vs
`src/correction` must pass); `L1_CEILING_EXCEEDED`; plus exit 64 for usage
errors. The collector and wall codes (`unmapped_member`, `WALL_ABSENT`,
`MISSION_NOT_FOUND`, …) are not in either dry half — they belong to the live
half, and the tables above name them where they can fire.

## Failure and honesty rules

- A refusal is a reason to fix the spec or execute the work directly — never a
  reason to bypass validation, and never a reason to split one wave into several
  `task` calls.
- Report only observed results. If the wall says `opaque`, the reports are 13/16,
  or a lane timed out, that is the finding.
- The wave is advisory input to one L1. No lane judges, no lane spawns (lanes are
  leaf; `agents/executor.md`'s single `labrat` is the only permitted exception,
  bounded by `task.maxRecursionDepth: 2`), and no lane edits routing config.
- Never hardcode a provider, model or credential anywhere in this test. The
  global config is the sole routing and authentication authority.
- A launcher failure is data too: `LAUNCH_PARTIAL`, a `not-on-wall` row, or a
  reused worktree warning goes in the record verbatim, never smoothed over.

## Post-merge command list for the tower

```bash
REPO=/home/vgpnk/Projects/ompskills
UFO=/home/vgpnk/Projects/ufo-fsd-alpha

# 1. land the config (two files, timestamped backups)
node "$REPO/host/apply.mjs"                 # dry run must exit 0
node "$REPO/host/apply.mjs" --apply

# 2. the automated dry halves against the real post-apply band (dispatch nothing)
cd "$REPO" && node test/run-wave-test.mjs --band live
cd "$REPO" && node test/tower-fleet.test.mjs

# 3. the wall, captured as evidence
cd "$REPO" && node test/run-wave-test.mjs --band live --live-wall

# 4. (optional) launch a tower fleet: one L1 pane per mission, its own worktree.
#    plan first — it writes nothing and prints the band it read live.
cd "$REPO" && node sighting/tower-fleet.mjs plan   --spec .tower/fleets/<fleet>/spec.json
cd "$REPO" && node sighting/tower-fleet.mjs launch --spec .tower/fleets/<fleet>/spec.json --apply
cd "$REPO" && node sighting/tower-fleet.mjs status --spec .tower/fleets/<fleet>/spec.json
#    close completes the wall missions; it never removes a worktree, and it
#    prints the per-mission `git -C "$REPO" worktree remove <path>` for the
#    operator to run by hand once the work is integrated.

# 5. THE DISPATCH — by hand, from an OMP session, exactly one batched task call,
#    using taskCall.context and the complete taskCall.tasks array from the
#    dispatch-16.json that step 2/3 wrote. No script does this.

# 6. settle, record, collect, close — steps 6 to 8 above
```

Wider waves: `node test/run-wave-test.mjs --band live --lanes 32` validates the
ceiling end of the wave band the same way (still dispatching nothing). Plain
`node test/run-wave-test.mjs` uses `--lanes 16`, the floor end.