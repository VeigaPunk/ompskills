# tf-probe-band — wave-band chain verification (axis: `band-verification`)

Mission: verify the wave-band chain (16–32 lanes per wave, 100 per round) at
sixteen independent points. One finding per point, evidence-first, nothing
claimed that was not run. Read-only mission: the only file written in the repo
is this one.

**Headline.** The chain the feature *declares* is coherent and green — delta →
`apply.mjs` wave gate → live-derived launcher/prompt → docs → tests → routing.
But the **live band authority is not stable while concurrent work runs**: the
substrate file `ufo-fsd-alpha/config/ufo.json` was written three times in
seventeen minutes (two `apply --apply` merges and one rollback to the committed
`32-100` band), and the rollback broke four of the sixteen points for ~8.7
minutes mid-mission. The rollback is attributed and corroborated: a sibling
mission's scratch root symlinked `config/ufo.json` to the live file, so its
"write the committed config into the scratch copy" landed in the substrate
(§2a). "The live config carries the merged band" is therefore **false as a
steady-state claim**, even though it is true right now. Every live-authority
claim in this report is pinned to a sha256 and a wall-clock window for exactly
that reason.

---

## 1. Method

**Round axes** (dynamic, declared before dispatch, mapped per lane):

| axis | externally visible meaning |
| ---- | -------------------------- |
| `band-declaration` | the declared numbers agree with the operator directive across manifest, live config, prose, tests |
| `band-enforcement` | the validator admits/refuses at the exact edges with the exact typed codes |
| `live-derivation` | consumers read the band from the authority instead of hardcoding it |
| `route-integrity` | nothing pins a provider/model; every route resolves through the global `@m_*` alias table |

**WWKD plan.** Data walk (read the delta, `apply.mjs` step 6, `tower-fleet.mjs`
band reader, the prompt template, both skills, both tests, the validator gate)
→ skeleton (16 points → 16 disjoint items) → one real case (L1 ran the planner
itself at the 16-lane floor before dispatching) → generalization (the wave).

**Wave.** Sixteen points = one wave of 16 lanes, exactly the band floor, so no
wave splitting and no padding. Spec
`.tower/fleets/towerprobe/tf-probe-band-r1.spec.json`; validated with

```bash
UFO_PROJECT_ROOT=/home/vgpnk/Projects/ompskills/.tower/fleets/towerprobe \
UFO_CONFIG_PATH=/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json \
UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 \
  node /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs plan --spec …/tf-probe-band-r1.spec.json
```

→ `ufo-swarm-wave-v1`, exit 0, `counts.total 16`, `policy {source: config,
maxLanes 100, minLanes 16, waveMinLanes 16, waveMaxLanes 32}`; `run` emitted
`ufo-swarm-wave-dispatch-v1` and the wave was dispatched as **exactly one**
batched `task` call (16 lanes, roles `scout reviewer revenger executor
mutation-tester simplifier connector critic scribe sentinel`), agent ids
recorded into `.ufo/scopes/tf-probe-band-r1/swarm-registry.json`. Every lane was
read-only against both checkouts and wrote exactly one report file under
`.tower/fleets/towerprobe/reports/tf-probe-band/`.

**Evidence pins** (sha256, first 16 hex; worktree = `tower/towerprobe/tf-probe-band` @ `97e22a4`):

| artifact | sha256 |
| -------- | ------ |
| `host/ufo-sighting-dispatch.json` | `3c0c4d67af146b14` |
| `host/apply.mjs` | `dede60cc6a3cb828` |
| `sighting/tower-fleet.mjs` | `0bdfdcdf2d015a8c` |
| `sighting/l1-prompt.md` | `df499cb4b838c79d` |
| `.omp/skills/tower/SKILL.md` | `0fa104594a2d06f2` |
| `.omp/skills/swarm/SKILL.md` | `01d1c6f09babadd4` |
| `test/run-wave-test.mjs` | `1199b39da0ea88a0` |
| `test/sighting-wave-smoke.md` | `1f0ab2d6bbb18b6b` |
| `test/tower-fleet.test.mjs` | `79f384a8cef678df` |
| `ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` | `cd8247af7e7a9dc3…` |

Verification base: `97e22a4` (worktree HEAD at mission launch). `main` advanced
during the mission by two sibling commits — `3dee568` (launcher records partial
launch failures instead of aborting mid-fleet) and `cc0d61f` (L1 prompt forbids
substrate writes through symlinks — the very hazard §5 records). Neither touches
a band number; re-diff the pins above if you re-verify against current `main`.

---

## 2. The live authority flapped — timeline (this is the mission's real finding)

| time (Z) | observation | evidence |
| -------- | ----------- | -------- |
| 01:14:17 | `apply --apply` ran; backup `config/ufo.json.2026-10-09T01-14-17-257Z.bak` created holding the pre-merge `32-100 / minLanes 64` | backup file + its band values |
| 01:19–01:21 | **live band = 16-32, cap 100, minLanes 16.** L1 parses the file, and the planner run at 01:20:32Z reports `policy {source: config, minLanes 16, waveMinLanes 16, waveMaxLanes 32, maxLanes 100}`; the L1's own 16-lane wave is admitted at 01:20:49Z | `/tmp/bandplan1.json`, `/tmp/bandrun1.json` (mtime 01:20:32Z / 01:20:49Z) |
| **01:22:15** | **rollback** (cause now attributed): file rewritten to exactly the committed bytes and `git status` shows it *unmodified* → live band reverts to `32-100 / minLanes 64`, sha256 `7efc813b23ca65282e9839dc930aeba9fd7349264b8bc67becc917f40a61b0d1` | `stat` mtime; `git diff` empty; lanes 3/4/5/7/8/12 each re-read and hash it; mechanism in the sibling `tf-band` transcript, §2a |
| 01:22–01:30 | four points measured red against this authority (findings 3, 4, 7, 12 below) | lane reports |
| **01:30:57** | a **second `apply --apply`**: new backup `…2026-10-09T01-30-57-403Z.bak` (holding `32-100`) and the delta merged again → live `16-32 / cap 100 / minLanes 16`, sha256 `0e416f0abc559e9a91bc0c35…`, byte-diff vs HEAD = exactly the delta's six values | backup file, `diff -u HEAD:config/ufo.json config/ufo.json` |
| 01:35:20 | L1 re-probe of all five edges against the restored authority: 15 refused `too_few_lanes`, 16 admitted, 32 admitted, 33 `wave_too_wide`, 101 `too_many_lanes`; sha256 unchanged across the probe | this session |
| 01:36 | `node test/run-wave-test.mjs --band live` → **exit 0, 60 checks passed** (was `apply_not_landed` during the rollback window) | run output |

Live-vs-HEAD delta merge, verified equal to `host/ufo-sighting-dispatch.json`:
`maxConcurrentL1 16`, `missionFormat.l1Alias m_strong`, `swarm {maxLanes 100,
minLanes 16, waveMinLanes 16, waveMaxLanes 32}` — HEAD carries
`minLanes 64, waveMinLanes 32, waveMaxLanes 100`.

### 2a. Cause of the 01:22:15Z rollback — attributed and corroborated

The operator attributed it to the sibling fleet's mission `tf-band`, and the
sibling's own transcript contains the mechanism verbatim:

```js
// real file: the COMMITTED pre-apply ufo.json (band 32-100)
const committed = await (await Bun.$`git -C ${ufo} show HEAD:config/ufo.json`.quiet()).text();
await Bun.write(pre + "/config/ufo.json", committed);
```

where `pre` is the scratch root `/tmp/ufopre-band`, which the same eval had
populated by symlinking every `config/` entry to the live substrate
(`ln -s ${ufo}/config/${e} ${pre}/config/${e}`). `pre/config/ufo.json` was
therefore a **symlink to the live file**, and `Bun.write` followed it — writing
the committed `32-100` bytes into
`/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json` itself. Not a git
operation, which is exactly why the file landed byte-identical to HEAD, why
`git status` reported it clean, and why no `.bak` was created.

This fits every artifact-level observation independently gathered here: no
backup at 01:22:15, size `12000` (the committed file's size; the merged file is
`11999`), `minLanes 64` (a value the delta never writes), empty `diff` against
the newest `.bak` *and* against `HEAD:config/ufo.json`, and lanes 3/4/5/7/8/12
all hashing `7efc813b…` at their own read times. The symlink root was cleaned up
before this review, so the confirmation is the transcript plus that byte/mtime
forensics — not a live inspection of the symlink. The operator reports the
dispatch template now forbids substrate writes through symlinks.

**Consequence for method.** Any "the live authority carries X" claim is only
meaningful with a sha256 and a time window. Lanes were judged against the
authority in force at their own run time, and this report gives both the
as-measured verdict and the status after recovery.

---

## 3. The sixteen findings

| # | point | verdict as measured | status @01:35–01:36Z |
| - | ----- | ------------------- | -------------------- |
| 1 | delta declares 16/32/100/16 | **PASS** | PASS |
| 2 | `apply.mjs` probes the band both ways | **PASS** | PASS |
| 3 | live config carries the merged band | **PASS** at 01:34:05Z; FAIL observed 01:22–01:30 (rollback window) | PASS (restored) |
| 4 | validator admits 16 | **FAIL** (rollback window) | PASS |
| 5 | refuses 15 as `too_few_lanes` | **PASS** (L1 adjudicated; lane voted FAIL — see §4) | PASS |
| 6 | admits 32 | **PASS** | PASS |
| 7 | refuses 33 as `wave_too_wide` | **FAIL** (rollback window) | PASS |
| 8 | refuses 101 as `too_many_lanes` | **PASS** (L1 adjudicated; lane voted FAIL — see §4) | PASS |
| 9 | `tower-fleet.mjs` reads the band live, hardcodes nothing | **PASS** | PASS |
| 10 | `l1-prompt.md` renders the band from the launcher | **PASS** | PASS |
| 11 | `tower/SKILL.md` states the band correctly | **PASS** | PASS |
| 12 | `swarm/SKILL.md` states the band correctly | **FAIL** (numbers vs live authority) | PASS |
| 13 | `run-wave-test.mjs` asserts the new band | **PASS** | PASS (live leg green) |
| 14 | `sighting-wave-smoke.md` states the new band | **PASS** | PASS |
| 15 | no pinned provider/model anywhere in the feature | **PASS** | PASS |
| 16 | every route resolves through the global `@m_*` alias table | **PASS** | PASS |

**1 — delta declares the band. PASS.** `host/ufo-sighting-dispatch.json`
(sha256 `3c0c4d67…`) declares `swarm {waveMinLanes 16, waveMaxLanes 32,
maxLanes 100, minLanes 16}`, all four as JSON numbers (`Number.isInteger` true),
`maxConcurrentL1 16`, `missionFormat.l1Alias "m_strong"`, and no contradictory
band key. Load-bearing, not inert: `DELTA_PATH` at `host/apply.mjs:60` resolves
to this file, which `dispatchGate` reads and validates. Gap found by the lane:
`minLanes` is present and numeric but not gated by `dispatchGate`'s
`positiveInt` calls (only `waveMinLanes`/`waveMaxLanes`/`maxLanes` are) — a
latent hole, no effect on the declaration itself.

**2 — `apply.mjs` probes the band both ways. PASS.** Step 6 probes **twice
through the real planner, not a local reimplementation**: (a) a real subprocess
CLI leg at `WAVE_CLI_PROBE_LANES = 32` — a width inside both the pre- and
post-apply band, so the dry run is green before and after the merge; (b) the
imported `planSwarmWave` with the **post-apply** policy injected from the delta —
16 admitted (floor), 15 `too_few_lanes`, 32 admitted (ceiling), 33
`wave_too_wide`, 101 `too_many_lanes`. Observed run: `node host/apply.mjs` exit
0; the step-6 lines quote the CLI leg ("a 32-lane spawn wave plans clean") and
all five injected edges; `git status --porcelain` clean before and after; temp
probe dirs removed by a `finally` block. (The CLI leg read the live band as it
stood, `32-100`, at that moment — which is exactly why the dry run passes both
before and after the merge.)

**3 — live config carries the merged band. PASS on the final state; FAIL
observed mid-mission.** Final measurement 01:34:05Z: `{waveMinLanes 16,
waveMaxLanes 32, maxLanes 100, minLanes 16}`, all integers, sha256 `0e416f0a…`;
the diff against the newest backup (`…01-30-57-403Z.bak`, sha `7efc813b…`) is
exactly three value lines (`minLanes 64→16`, `waveMinLanes 32→16`,
`waveMaxLanes 100→32`) and nothing else, and the backup's mtime equals the
file's to the nanosecond (a single apply op). Byte arithmetic closes the merge
completely: the only length delta is `100→32` (−1 byte), `12000 → 11999`, so
there is zero non-band content drift. The lane first yielded FAIL, then
corrected it on the recovered state, and it recorded the interim measurement
rather than dropping it. During the rollback window (01:22:15–01:30:57Z) the
same lane measured `waveMinLanes 32, waveMaxLanes 100, maxLanes 100,
minLanes 64` (sha256 `7efc813b…`), byte-identical to the newest `.bak` **and**
to `git HEAD` (commit `5ace2559`), with an empty `diff -u` between backup and
file. The full backup chain never holds `16/32/16`: the only earlier band change
is the inverse (floor 16 → 32 at the 19:59Z apply). L1 cross-check: the merged
band **was** live at 01:19–01:21Z (planner policy `source: config, 16-32/100/16`
at 01:20:32Z) and **is** live again since 01:30:57Z (live == delta on all six
merged values). So the substrate did not carry the merged band for ~8.7 minutes
of this mission, by a mechanism no lane or transcript evidences; the point is
satisfied now, and only under a sha256 + timestamp.

**4 — validator admits a 16-lane wave. FAIL as measured, PASS under the
declared and now-live band.** Under the rollback authority a 16-lane spec exits
1 `too_few_lanes` ("needs at least 32 lanes (got 16)"), and the lane quotes it.
Evidence that admission is real and not vacuous: the L1's own wave of 16 lanes
was admitted at 01:20:49Z by the same planner reading `source: config` with
`waveMinLanes 16`; the lane's injected in-process 16/32 policy admits exactly 16
(`counts.total 16`, `dispatch.calls 1`); after recovery the live 16-lane plan is
green again (01:35:20Z) and `run-wave-test --band live` reports
`negative.floorAdmits: 16 lanes (exactly the floor) plans clean, exit 0`.
Falsifier that would flip it: any live plan at 16 lanes exiting 1 while the
authority declares `waveMinLanes 16`.

**5 — refuses 15 as `too_few_lanes`. PASS** (as stated; the lane voted FAIL — see
§4). 15 lanes is refused with the typed code under **every** authority observed:
live `16-32` (message "needs at least 16 lanes (got 15)"), live `32-100`
("needs at least 32 lanes (got 15)"), the bundled mirror `16-100`, and an
injected `/tmp` `16/32` policy. The mutation discipline was correct: the 15-lane
and 16-lane specs differ by exactly one added item element, and the same builder
admits 32 under live and 16 under a floor-16 policy, so the refusal is the band
floor and not a broken spec builder. Refusal JSON goes to **stderr** with exit 1
(stdout empty) — the tasking text said stdout; the lanes recorded the correction.

**6 — admits 32. PASS.** 32 lanes is exactly the ceiling of the declared band and
the plan is admitted under both authorities (`16-32` and `32-100`), exit 0,
`counts.spawn 32`, `dispatch.calls 1`; `run` emits
`ufo-swarm-wave-dispatch-v1` with 32 lanes in one `taskCall`. Inclusivity was
proven behaviourally by tightening `spec.maxLanes` to 32: 32 admitted
(`declaredMaxLanes: 32`), 33 refused — the gate's comparison is strict (`>`), so
the ceiling admits its own value. The lane correctly refused to quote a
`policy.waveMaxLanes 32` line from a post-rollback run and said so instead.

**7 — refuses 33 as `wave_too_wide`. FAIL as measured, PASS under the declared
band.** Under the rollback authority a 33-lane spec exits **0** (`counts.total
33`) — the gate's wave ceiling equals the cap (100) there, so `wave_too_wide` is
unreachable by lane count. The gate itself is correct and was proven by
isolating the one variable: the same spec with a `/tmp` config differing only in
`waveMaxLanes 100→32` (and floor back to 16) exits 1 `wave_too_wide` ("a wave
carries at most 32 lanes (got 33)"). L1 cross-check: under the band live at
01:20Z, 33 was refused `wave_too_wide`, and under the restored band at 01:35:20Z
it is refused again. Falsifier: 33 admitted while the authority declares
`waveMaxLanes 32`.

**8 — refuses 101 as `too_many_lanes`. PASS.** The literal claim holds under
**both** authorities: 101 > cap 100 → exit 1 `too_many_lanes` ("wave has 101
lanes; the cap is 100 (hard ceiling 100)"), observed by the lane live, by the
L1 at 01:20Z and at 01:35:20Z. The two gates are distinct comparisons in the
validator (`total > cap` before `total > effective wave ceiling`), which is why
101 never answers `wave_too_wide`.

**9 — `tower-fleet.mjs` reads the band live and hardcodes nothing. PASS.** The
strongest available probe: three `ufoRoot`s → three bands. A synthetic root
(`waveMinLanes 20 / waveMaxLanes 40`) yields reported
`band {waveMin 20, waveMax 40, …}` and a rendered prompt line
`| wave band | 20–40 lanes per wave |`; the real root yields whatever the
authority says (the lane saw `32-100` during the rollback window, the L1 sees
`16-32` now) — i.e. the numbers track the config, and a second synthetic config
proved the transition in the other direction. No band numeral appears anywhere
in the launcher's live logic (digit scan: only `EXIT_USAGE = 64` and
`windowPaneCeiling` read-through; the band fields come from
`loadBandAuthority`'s `need()`/`intOf()` fail-closed reads). `plan` is
non-mutating: two runs, byte-identical JSON, `stateDir`/`worktreeRoot` never
created. The lane's own caveat is recorded: its 16-32 expectation came from the
task text, and the file's live content is the authority.

**10 — `l1-prompt.md` renders the band from the launcher. PASS.** The template
carries `{{waveMin}}`, `{{waveMax}}`, `{{roundLaneCeiling}}` (plus 14 other
placeholders) and **zero literal band numerals**; `renderPrompt` fills them from
`authority` (live config) and refuses to emit anything if a placeholder
survives (`RENDER_UNRESOLVED`). Rendered for real through `plan --json`: scratch
config `20/40` → `| wave band | 20–40 lanes per wave |`; live config during the
rollback → `32–100`; live config after recovery → `16–32`. Guards exercised
live: an unknown placeholder exits 2 `RENDER_UNRESOLVED`; an impossible band
(`waveMin 45 > waveMax 40`) exits 2 `CONFIG_UNREADABLE`. `roundCeiling` comes
from the fleet spec by design (not the config) — noted, not a defect.

**11 — `tower/SKILL.md` states the band correctly. PASS.** The band sentence
hardcodes **no number**: it names
`sighting.dispatch.swarm.waveMinLanes`–`waveMaxLanes` and `maxLanes` and says
every number is read live from `<ufoRoot>/config/ufo.json`, never hardcoded. All
cited keys resolve uniquely in the authority; the "three buckets" claim matches
the operator's global config bindings (`m_strong`/`m_mid`/`m_fast`);
`git log -S"32-100"` and `-S"16-32"` on the file are empty. Because it states no
number, it is correct under **both** the declared band and the rolled-back one.

**12 — `swarm/SKILL.md` states the band correctly. FAIL as measured against the
live authority.** The skill states numbers — 16–32 total members per wave,
`maxLanes` 100 round ceiling, `minLanes 16` floor, built-in floor 2, the
100-vs-32 distinction — and during the rollback window the live authority read
`waveMinLanes 32 / waveMaxLanes 100 / minLanes 64`, so the lane measured the
stated band and `minLanes 16` as false against it. The rest of the skill's
*semantics* verified true against the validator: spawns+resumes counted together
(31 + 1 resume admitted vs 31 alone refused), resume-only floor exemption,
`spec.maxLanes` tightening only (`impossible_band` below the floor),
band-less built-in floor 2, `maxConcurrency 32` as a dispatch window separate
from the band. After recovery (live `16-32 / minLanes 16`) the stated numbers
match the authority again. Open framing gap recorded by the lane: the 100
"round ceiling" is enforced **per wave** by the validator — there is no
cross-wave round accounting in the planner.

**13 — `run-wave-test.mjs` asserts the new band. PASS**, with the drift visible
in its own output. Fixture leg: exit 0, "61 checks passed; nothing dispatched",
`plan.band: policy band 16-32, cap 100, source config`, `negative.band.*` for
15/33/101, `floorAdmits` 16, `ceilingAdmits` 32, `resumeFloorExempt` 1, plus the
refusal taxonomy and route-family checks. The expected 16 is **delta-sourced**
(`band.expected = delta.swarm.*`, read from
`host/ufo-sighting-dispatch.json`), not a literal. Live leg: during the rollback
it exited 1 `apply_not_landed` — the correct behaviour, and the discriminating
leg — and after recovery (L1 re-run, 01:36Z) it exits 0 with 60 checks,
`band.live: waveMinLanes 16, waveMaxLanes 32, maxLanes 100, minLanes 16`.
Weaknesses reported by the lane and accepted as accurate: `band.live`,
`band.authority` and `band.fixture` are always-pass printouts (recorded `ok`
even while the live config read `32/100`); in default `--band fixture` mode
`plan.band` compares the delta against a delta-merged fixture, so it cannot
distinguish `16-32` from `32-100` — the live leg is what discriminates;
`negative.band.too_many_lanes.101` is literal-pinned to the unchanged cap 100;
`plan.floorBoundary` is a tautology under the `--lanes` arg gate. The live gate
compares only `waveMinLanes`, so a half-merged ceiling surfaces as a `plan.band`
failure, still exit 1.

**14 — `sighting-wave-smoke.md` states the new band. PASS.** Every band claim
verified against the authority and the validator: the 16-lane floor wave and
32-lane ceiling, the 15/33/101 refusals with their codes and messages, the round
ceiling 100, the window pane ceiling 16 (correctly labelled display capacity,
unrelated to the wave bound, and the wave path never reads that key), and the
"wall cannot show wave lanes as panes" section. The single `32-100` mention is
explicitly labelled **pre-apply** and matched the live config while the merge
was rolled back; no stale band is presented as current. Out-of-scope incidental
found: `host/omp-agent.config.yml` comments still say "32-100 per wave" (stale
prose) — not the doc under test.

**15 — no provider/model pinned anywhere in the feature. PASS.** The lane
grepped the nine scoped files for provider names, `"model"` keys, `--model`
flags and effort shapes. Seven match lines exist, **all** in `host/apply.mjs`
(`GEMINI_MARKERS` 413/425/426/501, the `provider/model:effort` doc comment 145)
and all are the ban **gate** replicated from the substrate's own
`sync-global-routing.mjs` — a prohibition, never a selection. The one `--model`
site is `sighting/tower-fleet.mjs:326`, which emits `--model @${authority.l1Alias}`
read live from the config, with a token guard (an alias containing `/` is
refused, so a literal provider/model cannot pass as `l1Alias`). Zero route
literals in the launcher or its test. `host/omp-agent.config.yml` is classified
as the operator-owned routing authority staged for verbatim install, not
feature; concrete routes legitimately live only there. No credentials printed.

**16 — every route resolves through the global `@m_*` alias table. PASS.** The
launch argv is `--model @m_strong` with the alias read live from
`missionFormat.l1Alias`; `m_strong` exists in `modelRoles` and `main` is bound
`@m_strong` in both the operator's global config and the staged candidate
(15 `m_*` aliases, 14 seat bindings, 31 non-empty chains, tables identical);
all ten swarm roles bind to `@m_strong`/`@m_mid`/`@m_fast` via
`task.agentModelOverrides`; the validator refuses any lane that carries a
`model` key (`invalid_spec`, unknown key) and the emitted `taskCall` lane keys
are exactly `[agent, name, task]`; fallback chains exist for the bound aliases
(`m_strong` 9 hops, `m_mid` 6, `m_fast` 6). Alias keys only were reported —
no route targets, no credentials.

---

## 4. Adjudication — where I overrode a lane

Lanes advise; the L1 judges. Two lane verdicts were stricter than the point as
written, and I overrode them to PASS, recording the lane's reading rather than
burying it:

- **Point 5** (lane voted FAIL): the stated claim is "it refuses 15 as
  `too_few_lanes`", which was observed true under **every** authority in play.
  The lane's FAIL came from a *companion* claim it built itself — that 16 is
  admissible — which belongs to point 4 and is reported there as FAIL for the
  rollback window. Verdict as stated: PASS.
- **Point 8** (lane voted FAIL): the stated claim is "it refuses 101 as
  `too_many_lanes`", observed true live and under the injected band; the lane's
  FAIL rested on requiring `33 → wave_too_wide` from the same run, which is
  point 7's claim and is reported as FAIL there. Verdict as stated: PASS.

No lane verdict was upgraded without a re-measurement by me (points 4 and 7
stayed as the lanes found them; their post-recovery status is reported
separately in §3 and §2). No lane output was taken on trust where a lane's own
report contradicted its JSON summary — none did.

Two lanes re-ran after L1 steering and both corrected themselves rather than
restating the first reading:

- **Point 3** first yielded FAIL on the rollback state, then re-measured at
  01:34:05Z and issued PASS on the recovered state, keeping the interim
  measurement in the report. I kept both: the point is satisfied, and the
  window in which it was not is the mission's headline finding.
- **Point 5** re-ran under an explicit authority ledger (live 16-32? live
  32-100? injected 16/32?) after steering, and reported that **no** run of its
  used a live 16-32 authority — its first live read already showed floor 32.
  Its A/B/C used live `32-100` (sha `7efc813b…`), D/E the bundled mirror
  `16-100` (`1f6b2115`), F an injected `/tmp 16/32` policy (`799082e3`) with
  values taken from the delta. That ledger is why point 5's verdict is PASS as
  stated while point 4's is FAIL: the two lanes measured different layers, and
  the accounting makes the difference visible instead of averaged away.

## 5. What is proven, and what is not

Proven by observation in this mission:

- the declared band, the apply gate (both directions, including edges not yet
  on disk), the live derivation in the launcher and the prompt, the docs, the
  tests, and the routing table are all coherent with `16-32 / 100 / 16`;
- all five validator edges (`16`/`15`/`32`/`33`/`101`) hold against the live
  authority as of 01:35:20Z, and held at 01:20Z before the rollback;
- the substrate config is written by concurrent actors: three writes, three
  distinct contents, seventeen minutes — `apply --apply` at 01:14:17Z,
  byte-identical rollback to HEAD at 01:22:15Z, `apply --apply` again at
  01:30:57Z.

Not proven / unresolved:

- **who** ran the 01:30:57Z re-apply. Its signature is unambiguous
  (`apply --apply`: new timestamped backup holding `32-100`, then the six-value
  merge), and a sibling transcript reasons that "`apply.mjs --apply` would fix
  the drift for all missions", but no executed command recording it was found in
  the searches performed. The 01:22:15Z rollback, by contrast, is now attributed
  and corroborated (§2a);
- that the live authority stays stable: it demonstrably did not, so **every
  point above that reads the live config is time-bounded**. Re-verify by
  re-reading `config/ufo.json`'s sha256 before trusting any of them;
- the 100-lane "round ceiling" as a *round* bound: the validator enforces
  `maxLanes` per wave; no cross-wave accounting was found (point 12's framing
  gap).

**Hazard this mission surfaced for other missions.** A scratch root that
symlinks substrate entries turns an "isolated copy" into a write path to the
live file. Any verification harness that writes into a scratch `config/ufo.json`
must materialize (copy) the file, never symlink it — and a live-authority check
must be pinned to a sha256 at check time, because a concurrent writer can flip
the band between two reads inside one lane.

## 6. Reproduce

```bash
R=/home/vgpnk/Projects/ompskills/.tower/worktrees/towerprobe/tf-probe-band
U=/home/vgpnk/Projects/ufo-fsd-alpha
C=$U/config/ufo.json

sha256sum $C; stat -c '%y' $C            # pin the authority BEFORE trusting any live claim
node -e 'const s=require("'$C'").sighting.dispatch.swarm;console.log(s)'   # expect 16/32/100/16
node $R/host/apply.mjs                   # dry run: green, writes nothing
node $R/test/run-wave-test.mjs --band live --out /tmp/rw     # 60 checks, exit 0
node $R/test/tower-fleet.test.mjs                            # hermetic launcher band derivation
for n in 15 16 32 33 101; do             # the five edges against the live authority
  UFO_PROJECT_ROOT=/tmp/edge$n UFO_CONFIG_PATH=$C UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 \
    node $U/scripts/ufo-swarm-wave.mjs plan --spec /tmp/edge$n/spec.json; echo "lanes=$n exit=$?"
done
```

Per-point lane reports (verbatim evidence, one file per point):
`.tower/fleets/towerprobe/reports/tf-probe-band/point-NN-*.md` (16 files).
Round receipt: `.tower/fleets/towerprobe/rounds/tf-probe-band-r1.md`.