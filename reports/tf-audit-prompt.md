# tf-audit-prompt — audit of `sighting/l1-prompt.md`

Mission `tf-audit-prompt` · fleet `tower1` · axis `audit-prompt`. Rounds: **1 = full audit (18 lanes)**,
**2 = falsification of round 1's findings (16 lanes)**. This revision is round 2's output: every
severity below has been re-tested, and the corrections are listed in §8.

Target: `sighting/l1-prompt.md` (106 lines), the template the tower-fleet launcher
(`sighting/tower-fleet.mjs`, `renderPrompt`) renders into every mission pane's prompt.
Comparators: `.omp/skills/tower/SKILL.md`, `.omp/skills/swarm/SKILL.md`,
`/home/vgpnk/.agents/skills/godspeed/SKILL.md`,
`/home/vgpnk/Projects/ufo-fsd-alpha/.omp/skills/wwkd/SKILL.md`, and the named validator
`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`.

The operator's three targets: **contradictions** with those skills, **missing duties**, and
**placeholders the launcher does not supply**.

| field | value |
| ----- | ----- |
| round axes | r1 `fidelity`, `contradiction`, `coverage`, `actionability` · r2 `verification` (+`fidelity`, `actionability`) |
| wave specs | `<stateDir>/waves/tf-audit-prompt-r1.json` (18 lanes), `<stateDir>/waves/tf-audit-prompt-r2.json` (16 lanes) |
| dispatch | one batched `task` call per wave; `counts {spawn 18}` and `{spawn 16}`; band 16–32 from live `config/ufo.json` |
| registry | `<stateDir>/reports/tf-audit-prompt/swarm-registry.json` (34 members: 18 r1 + 16 r2; r1 handles recorded) |
| lane reports | `<stateDir>/reports/tf-audit-prompt/<Lane>.md` (34 files: 18 r1 + 16 r2) |
| render ground truth | `<stateDir>/tf-audit-prompt.prompt.md` (0 unresolved `{{...}}`) |

## 1. What was audited and how

Round 1: eighteen lanes, one disjoint dimension each (`reviewer`×3, `scout`×3, `critic`×5,
`executor`×2, `sentinel`×2, `simplifier`, `connector`, `mutation-tester`) → 75 raw findings,
clustered by the L1 into 36.

Round 2: sixteen lanes, adversarial (`mutation-tester`×6, `critic`×4, `sentinel`×2, `reviewer`×2,
`scout`), each assigned one cluster and told to **refute** it. Verdict vocabulary: `confirmed`,
`overstated`, `refuted`, `nuanced`. Every `refuted`/`overstated` verdict cites an executed result
or an exact source line.

Evidence classes, kept separate throughout:

- **L1-read** / **lane-read** — the source was read and quoted (`path:line`).
- **L1-run** / **lane-run** — a command was executed and its result reported (validator runs,
  `git` probes, replicated functions, `bash -n`, `git check-ref-format`, `find`, `grep -c`).
- `[INFERENCE]` — reasoning from source, not executed.

Provenance honesty: no lane may edit the target, skills, launcher, or repo; each wrote only its own
report. **One provenance error was committed in round 1 and caught by round 2** — AUD-04 quoted the
validator as calling `hub send` "vocabulary, not an omp command"; that phrase appears nowhere in
its source. It is corrected below; the underlying defect stands.

## 2. Verdict (post-verification)

The template's *substance* is sound: every placeholder is supplied, the role list, band
arithmetic, receipt path, and routing claims match the validator, and all five "UFO essence"
claims are genuinely present. The defects are **executable and duty-shaped**.

- **5 instructions fail when followed literally** (AUD-01 … AUD-05) — three of them reproduced by
  execution on this substrate.
- **22 missing/ambiguous duties** (AUD-06 … AUD-30, AUD-34) — most carry a silent or late failure.
- **9 wording/dead-weight findings** (AUD-11, 12, 18, 21, 31 … 36).
- **The third mission target is answered cleanly**: no `{{...}}` placeholder is unsupplied (the
  value-side gaps are §3.C).

Round 2 overturned **five** of round 1's blocker grades: AUD-06, AUD-07, AUD-08, AUD-13 and AUD-15
are medium (no enforced instruction fails; the failure modes are loud, mitigated, or
definitional). Round 1's consolidation had escalated those past their source lanes' own gradings;
§8 records each correction. Nothing was refuted outright; one sub-claim (AUD-18c) was refuted and
re-aimed.

A cross-cutting judgment that also explains several downgrades: the template **mandates** reading
`skill://tower`, `skill://swarm` and `skill://godspeed` before the first dispatch, and those three
bodies **do** resolve in a pane (verified). Duties they carry verbatim are therefore *text-only*
gaps in the template — restatements are still worth making (the template must stand when the skill
read fails, which its own lines 28-29 contemplate), but they are not contract holes. Duties that
live only in `wwkd` (AUD-27) or nowhere are. The amplifier this audit cares about is that the
template's fallback path ("proceed with the structure written here") explicitly blesses *not*
reading them.

## 3. Findings

Severity: **blocker** = an instruction fails or misleads when followed literally;
**medium** = a duty is missing/ambiguous or a failure mode is silent/late/definitional;
**low** = wording drift or dead weight.

### A. Blocker — instructions that fail as written

#### AUD-01 — The writer-isolation branch name collides with the mission branch (D/F conflict)
**Severity: blocker (confirmed, r2).** Line 94 hands the pane `-b tower/{{fleet}}/{{missionId}}/<lane>`,
but the launcher already created `tower/{{fleet}}/{{missionId}}` for the pane itself
(`tower-fleet.mjs:397`, `511-517`).
*Evidence:* `SwarmWriterIsolation` + `SwarmPathTraps` reproduced the collision; `SwarmR2BranchCollision`
re-ran it (git 2.55.0, several orderings, the literal token, and the real `omp worktree add`): rc 128
`cannot lock ref … exists; cannot create`, and the omp wrapper surfaces it opaquely as
`git branch: An IO error occurred while applying an edit` (exit 1). Precondition verified live:
`refs/heads/tower/tower1/tf-audit-prompt` exists and is the worktree's HEAD. The conflict is
order-dependent — nested-first succeeds and then the mission branch fails — and the launcher always
creates the parent first.
*Fix:* `-b tower/{{fleet}}/{{missionId}}-<lane>` (**verified** rc 0 via git and omp). Do **not** use
`tower/{{fleet}}/lanes/<lane>`: the round-2 lane proved that form re-collides when two missions of
one fleet reuse a lane name (this fleet has 16).

#### AUD-02 — Step 6's `git commit -- <paths>` aborts; the ordered form is the only working one
**Severity: blocker (confirmed, r2).** Lines 83-84: `git add -- <paths> && git commit -- <paths>`.
*Evidence:* `SwarmJudgeSemantics` and `SwarmR2CommitForm` (nine probes) in pane-like environments:
`GIT_EDITOR=true` → "Aborting commit due to empty commit message", exit 1, HEAD unmoved;
`git commit -- <paths> -m msg` → `pathspec '-m' did not match` (and `'msg'` too); all editor vars
unset → "Terminal is dumb, but EDITOR unset". **No environment was found where the literal form
works.** `git add` is needed only for a new/untracked file, exactly as scoped.
*Fix:* `git add -- <paths> && git commit -m "<one-line summary>" -- <paths>` (message flag before
`--`). The command is at line 84 (83 is prose).

#### AUD-03 — `--spec <spec.json>` is shell redirection syntax
**Severity: blocker (confirmed for the abort half; collision half nuanced).** The step-3 fence
(lines 65-70) ends in a literal `<spec.json>`; the renderer substitutes only `{{...}}`, so the token
survives into all 16 rendered pane prompts.
*Evidence:* `SwarmRuntimeProbe`, `SwarmValidationCmd`, `SwarmR2SpecLiteral`: run verbatim from the
pane's cwd → **exit 2**, `syntax error near unexpected token 'newline'` (node never runs);
reproduced under `env -i`; a positive control with a real path → exit 0.
*Fix:* name a real form and where specs live. Correction from r2: `--spec` resolves against the
**process cwd**, never `UFO_PROJECT_ROOT` (`ufo-swarm-wave.mjs:1412`). From the pane's cwd the bare
name is absent (`invalid_spec: spec: ENOENT`); from `<stateDir>` the same name *is* the fleet spec,
refused `invalid_spec: unknown spec key "fleet"`. Real wave specs live in `<stateDir>/waves/`. The
other legal forms (`--spec -`, `--spec-json`) are never named either.

#### AUD-04 — `hub send` is named but does not exist on this substrate
**Severity: blocker (defect, severity and fix confirmed; evidence sentence corrected).**
Line 77-78: "Resume lanes go through `hub send`".
*Evidence (corrected):* `SwarmR2HubSend` exhausted the surface: `hub send …` → `command not found`,
exit 127; no PATH entry, user bin, shell alias/function, omp subcommand, CLI-reference entry, or
tool device; `l0Hub: unavailable` in `fleet.json`; the two other "hub" senses are non-CLI (OMP
Agent Hub is TUI; the substrate's internal `hub` module). The validator asserts the *opposite* of
the phrase round 1 wrongly attributed to it — `ufo-swarm-wave.mjs:22-23` says the OMP mapping **is**
`hub send`/`handle.send` to the parked agent id — and its own emitted dispatch note
(`:1341-1342`, also `:1270-1271`, `:761`) plus `config/ufo.json:92` instruct the literal shell
string, which step 4 then orders used "verbatim". So the trap is machine-emitted, not prose-only.
The OMP-native door is a message to the parked agent: `write agent://<entry.resume>` with
`entry.message` (`omp://tools/task.md:117,:186`).
*Fix:* name the mechanism: "deliver each `resumeSends` entry as a message to
`agent://<entry.resume>` (`entry.name` is bookkeeping, not an address; the message revives the
parked agent); a `hub send` CLI exists only on substrates that ship one."

#### AUD-05 — `reportDir` is supplied only in a spelling the validator refuses
**Severity: blocker (confirmed, r2).** The table renders `{{reportDir}}` absolute and step 5 orders
lanes to write there; the validator's `spec.reportDir` rejects absolute paths.
*Evidence:* L1-run + `SwarmR2ReportRoot`: absolute → `{"code":"invalid_report_dir"}`, exit 1;
relative `reports/tf-audit-prompt` → exit 0 and 18 identical `Report: write your scoped findings to
reports/tf-audit-prompt/<Name>.md` lines in the payload. Reported independently by five round-1
lanes.
*Live consequence:* the appended instruction is **ROOT-relative** while the lane's base is its cwd,
so both waves split their lane reports across `<stateDir>/reports/tf-audit-prompt/` and
`<worktree>/reports/tf-audit-prompt/` (r2 observed 9 worktree-side at 23:03-23:06 with 0
state-side). The L1 hand-substituted the relative spelling and consolidated after each wave; round-2
reports reproduced the split, so it is a live property, not a round-1 accident.
*Fix (corrected):* supplying a relative `{{reportDir}}` alone is **insufficient** — the same value
renders into the table and step 5 by verbatim substitution, so a relative value would move the
declared root into the lane cwd and desync it from the registry/collector base
(`UFO_PROJECT_ROOT={{stateDir}}`). The operative fix is on the emitting side (state the base, or
emit an absolute lane instruction) **plus** a template clause pinning the spec field to the
stateDir-relative spelling.

### B. Medium — missing or ambiguous duties

#### AUD-06 — The scope row forbids the writes steps 5 and 7 mandate
**Severity: medium (down from blocker, r2).** Line 42 renders `reports/tf-audit-prompt.md — never
edit outside it`, while step 5's `{{reportDir}}` and step 7's `<stateDir>/rounds/` are in another
tree (`tower-fleet.mjs:262-263`, `272`).
*Evidence:* `SwarmReceiptPath` (high), `SwarmIdentityTable` SIT-4 (medium), `SwarmR2ScopeReceipt`
(overstated): the ban is real and is the outlier — the launcher's own contract names `<stateDir>` a
legal write zone (`tower-fleet.mjs:25-26`) and enforcement gates only mission-vs-mission scope
overlap (`:236-245`). Nothing executes-and-fails: the mission wrote anyway (17 report trees +
`rounds/tf-audit-prompt-r1.md`).
*Fix:* add a stateDir carve-out to line 42; the sharpest anchor is step 7.

#### AUD-07 — Nothing creates `<stateDir>/rounds`, and step 7 does not either
**Severity: medium (down from blocker, r2).** `roundReceipts()` only reads the dir
(`tower-fleet.mjs:598-606`); `verbLaunch` mkdirs `stateDir` and `sessions/<id>` only.
*Evidence:* `SwarmReceiptPath` proved `fs.writeFileSync` → ENOENT and bash heredoc → exit 1 in the
launch end-state; `SwarmR2ScopeReceipt` (overstated) hunted every creator (launcher, validator,
wall script, repo-wide) and found none — **but** the pane's own write tool auto-creates missing
parent levels (executed: "Successfully wrote 5 bytes" with both parents created), so a pane
following step 7 normally succeeds. Residual harm: only shell-redirect/raw-fs writers fail, and
`roundReceipts` returns `[]` silently. Live: the dir was born 22:21:04, 101.77 s after `fleet.json`,
empty until 22:39.
*Fix:* step 7 begins with `mkdir -p "{{stateDir}}/rounds"`.

#### AUD-08 — "Fold a short tail into the previous wave" is unsatisfiable inside the band
**Severity: medium (down from blocker, r2).** Lines 57-58.
*Evidence:* `SwarmWaveSizing` and `SwarmR2FoldTail` (18 generated specs): the literal fold reading
is refused (N=44 → `wave_too_wide` "a wave carries at most 32 lanes (got 44); split it into
sequential waves of 16-32"; N=33 same), and the boundary is exact (N mod 32 in 1..15; N=48 tail 16
→ exit 0). **But** a compliant rebalance reading exists and validates (22+22, 17+16, 24+23 all
exit 0), the refusal is loud and pre-dispatch, writes nothing, and its own message names the legal
band. The phrase is inherited verbatim from `.omp/skills/swarm/SKILL.md:37` (that skill carries the
same defect).
*Fix:* "…(rebalance so every wave lands inside {{waveMin}}–{{waveMax}} and never exceeds
{{waveMax}})" — mirror in the swarm skill.

#### AUD-09 — The registry duty is not restated in the template
**Severity: medium-low (down from blocker, r2).** The verb row scopes the validator to
"(plan / run)"; no step names `record`.
*Evidence:* `SwarmR2ResumeRail` (overstated): the mechanism reproduces exactly (`run` leaves
`agentId: null`; only `record` fills handles; an unrecorded resume dies `resume_unknown_member` —
all executed in `/tmp`), and the template has zero hits for `record|priorRegistry|registry`. **But**
the template mandates `skill://swarm`, which **resolves** in a pane and carries the duty at
`:47` and the ownership rules at `:86-90`; `run`'s payload also surfaces `registry.path`. This
mission recorded 18 handles in round 1 and no wave ever carried a resume lane, so the
"(lethal in round ≥2)" framing was wrong.
*Fix:* a restatement tied to skill://swarm:47, not a new contract.

#### AUD-10 — "Dispatch the tasks array verbatim" drops the tool's advertised-required `solutionSpace`
**Severity: medium (headline corrected, r2).** The emitted per-task keys are exactly
`{name, agent, task}` (`ufo-swarm-wave.mjs:1187`; verified on r1's 18 and r2's 16 tasks — zero
`solutionSpace` anywhere in the payload).
*Evidence:* `SwarmR2VerbatimShape` (overstated): the headline "is not literally executable" is
**false** — verbatim dispatch executes, because the tool advertises `solutionSpace` as required yet
tolerates the omission (silently defaulting it to the task text). The real failure mode is the
pressure it creates: three dispatchers in this fleet fabricated per-lane `solutionSpace` values the
validator never produced (this round-1 L1 was one of them).
*Fix:* keep the sentence: the emitted keys are `name`/`agent`/`task`; never invent per-item fields.

#### AUD-11 — Step 4 has no `taskCall: null` branch
**Severity: low (down from medium, r2).** A resume-only wave legally emits `taskCall: null`
(`ufo-swarm-wave.mjs:1334-1335`); step 4 commands the batched call unconditionally (applying it
literally to such a payload throws — executed).
*Evidence:* `SwarmR2ResumeRail`: the branch is already carried by three surfaces the same reader
sees — `skill://swarm:50-54` (verbatim), `test/sighting-wave-smoke.md:269-271`, and the payload's
own note (`:1342`).
*Fix (corrected):* "If `taskCall` is `null`, resume only — issue no `task` call; deliver each
`resumeSends` entry to its parked member. A mixed wave issues **one** `task` call for
`taskCall.tasks` and, separately, one message per `resumeSends` entry — never a second `task` call."

#### AUD-12 — The resume identity rule is not restated
**Severity: low (down from low-medium, r2).** A resume continues the recorded member; it must not
restate role/agent/axes/milestone/item.
*Evidence:* `SwarmR2ResumeRail`: the validator already fails closed (`resume_role_forbidden`,
`resume_meta_forbidden`, `resume_item_forbidden` — all executed), and `skill://swarm:90-92` states
it.

#### AUD-13 — No `--cwd` discipline for writer lanes; `task` agents are not worktree-isolated
**Severity: medium (down from blocker-adjacent, r2).** The isolation bullet gives a worktree recipe
but never says lane commands run with `--cwd <lane path>`.
*Evidence:* `SwarmR2Isolation` (overstated): the template does mandate `skill://tower`, which
carries the discipline verbatim (SKILL.md:28-35), and no writer lane existed fleet-wide, so the
hazard never manifested. Confirmed hazard remains: the emitted task entries carry **no cwd
carrier** (16/16 are `{name, agent, task}`), so a lane path must be spelled into the assignment
text as an absolute path.
*Fix:* "run every lane command with `--cwd <lane path>`; a `task` agent is not isolated by itself —
spell the absolute lane path into the lane's assignment."

#### AUD-14 — Lane leaf shape is unstated
**Severity: medium (confirmed, r2).** The only delegate bound is "advisory" (lines 91-92).
*Evidence:* `SwarmR2Isolation` executed a spawn+resume probe: all spawn tasks end with
`Lane bounds: leaf member - no subagent dispatch.`; resume messages carry **no** lane-bounds text.
Addition: the runtime suffix itself drops half the bound — "no background jobs" appears in
`swarm SKILL.md:99` but in **no** lane payload (`ufo-swarm-wave.mjs:749-750`).
*Fix:* extend the One-L1 bullet with the full leaf statement (no subagent dispatch, no background
jobs; only `executor` may spawn its single `labrat`).

#### AUD-15 — Writer class is undefined: "otherwise lanes are read-only" vs "every lane writes"
**Severity: medium (reframed from blocker-adjacent, r2).** Lines 79 and 93-96.
*Evidence:* `SwarmR2Isolation` (nuanced): with "writes" read as *scope edits*, line 96 is
consistent, so this is an **equivocation**, not a strict contradiction — the title "Writer class
undefined" is the accurate framing, and round 1's escalation past both source lanes (high/medium)
overclaimed. Live instantiation: this wave's own reports resolved under the worktree while the
registry stayed at the fleet root.
*Fix:* define the writer class as repo/scope edits, exempt `reportDir` files explicitly, and pin
`reportDir` relative to `{{stateDir}}` while handing lanes the absolute path.

#### AUD-16 — The settle / recover / clean-up rail is not mirrored
**Severity: medium (nuanced, r2).** tower SKILL.md binds: track each worktree to completion; on
interruption preserve branch + worktree including uncommitted changes; inspect with
`omp worktree list`; preview with `clear --dry-run`; retire **one** worktree by its own path;
**never** `omp worktree clear --all`.
*Evidence:* `SwarmR2SettleStop`: `skill://tower` resolves inside the pane and carries the rail
verbatim (SKILL.md:98-120) — so "absent" is true of the template text only and operative on the
template's own fallback path (:28-29). `close --apply` sees only mission trees
(`tower-fleet.mjs:655`); 16 missions / 16 trees.
*Fix:* mirror the rail as a settle bullet; the `--max-time` rationale belongs to the
relaunch/recovery case, not to a killed pane (which cannot execute the bullet).

#### AUD-17 — Mission completion is not named; the screen is treated as the record
**Severity: medium (nuanced, r2).** The stop section makes the terminal the artifact; the session
is capped by `--max-time`.
*Evidence:* `SwarmR2SettleStop` (wall probe executed): the L1 ceiling is 16 / active 16 / headroom
0; completion persists **0** screen lines (`COMPLETED_CAPTURE_LINES=0`). Correction: "not
actionable" is refuted while the pane lives — `peek --mission` reads it; and an *exited* pane is
"stopped" and frees the slot, while an open-and-running stopped pane holds it.
*Fix (kept):* "the file, not the screen, is the record: confirm
`{{stateDir}}/rounds/{{missionId}}-r<N>.md` exists; stopping does not deregister you — the operator
runs `close --apply`; never remove a worktree with a repo-wide sweep."

#### AUD-18 — Stop kinds are under-specified
**Severity: low (down from medium, r2).** (a) "the round ceiling" names two quantities:
`{{roundLaneCeiling}}`=100 per-round members and `{{roundCeiling}}`=2 rounds. (b) "a clean round
accepts nothing" is undefined. (c) contradictory lane findings.
*Evidence (corrected sourcing):* "round ceiling" occurs **0** times in tower SKILL.md (r2 executed
the census; L1 re-verified) — the rival assigner is `swarm SKILL.md:64` and the launcher's plan line
(`tower-fleet.mjs:413`). (b) line 80 already forbids the exhaustion→saturation mislabel. **(c) was
refuted**: "when blocked with a named cause" is a cause-agnostic stop path (SSC-3 itself conceded
the hook exists), so the fix becomes a step-6 reconcile sentence, not a new stop kind.
*Fix:* rename the row to "round lane budget"; define saturation; add step 6: "when two lanes'
findings contradict, reconcile on evidence before accepting; if irreconcilable, accept neither and
stop as blocked (named cause: contradictory lane evidence)."

#### AUD-19 — No round-level budget is stated, and nothing enforces the sum
**Severity: medium (confirmed, r2).** Sequential waves of one round share `maxLanes`=100; the
validator checks only per wave.
*Evidence:* `SwarmR2Budget` executed four sequential 32-lane waves in one round: 32/32/32/31 = 127
total, all exit 0; the validator never sums waves and never reads `roundCeiling`. (It also noted the
validator's own header documents `maxLanes` as per-wave, while the template calls it per-round —
the round budget exists only in template/skill vocabulary.)
*Fix:* "The round's sequential waves share {{roundLaneCeiling}} lanes; if N exceeds it, reduce N or
carry the remainder into a later round."

#### AUD-20 — Resume-only exemption and resume-inclusive sizing are unstated
**Severity: medium (confirmed, r2).** The band counts spawns **plus** resumes; resume-only waves are
exempt from the spawn band.
*Evidence:* `SwarmR2Budget` (executed): spawn20+resume15 → `wave_too_wide (got 35)`; resume-only 1
and 40 both available (band checks skipped, still capped at the 100 hard cap).
*Fix (extended):* "Resumes count toward a wave's size; a resume-only wave is exempt from the spawn
band (floor **and** wave ceiling) and may be one lane, still capped at {{roundLaneCeiling}}."

#### AUD-21 — `spec.maxLanes` is undocumented
**Severity: low (confirmed, r2).** Only-tightens; below the floor it is `impossible_band`; widening
is clamped to 100 (executed: 12 → refused, 16 → ok, 20 → policy 20, 200+101 lanes →
`too_many_lanes`).

#### AUD-22 — The band row is a launch-time snapshot of live authority
**Severity: medium (confirmed, r2).** The template bakes the band into the pane prompt; the
validator reads `config/ufo.json` live per invocation.
*Evidence:* `SwarmR2EnvBand` re-ran the divergence with a `/tmp` copy of the config (a 35-item spec
validates under 32–100 and is refused under the real 16–32) and re-planned the sibling
`tf-audit-routing-r1.spec.json` (recorded band 32/100 with a 35-lane admit; now `wave_too_wave`
(got 35)). L1-run: the live authority was clobbered at 01:22Z by a sibling lane's symlink write and
restored by the operator; while clobbered, this mission's 18-lane wave was refused `too_few_lanes`
("needs at least 32"). The prompt row was correct at launch and diverges only on a post-launch
retune.
*Fix:* "re-read the live band before sizing; the table's numbers are the launch-time snapshot."

#### AUD-23 — Env-var semantics are undocumented, and one omission degrades silently
**Severity: medium (confirmed, r2).** All three vars change behavior (executed, both rounds).
*Evidence (corrected wording):* all three → exit 0, `policy.source config`, band 16–32; minus
`UFO_FLEET_ALLOW_EXTERNAL_TOOLS` → exit 1 `EXEC_PATH_OUTSIDE_ROOT`; minus `UFO_CONFIG_PATH` →
exit 0 with the band swapped to 2–100 (`policy.source default`, `globalRunnerCeiling null`) — silent
in exit/refusal terms, though `policy.source: default` is visible in the plan payload, and the swap
requires the template's own `ROOT=stateDir` + dropped-override pairing. `SwarmRuntimeProbe` SRP-2 /
`SwarmPathTraps`: the template unconditionally sets the substrate's documented *test-only* escape
hatch (`UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`), disabling the outside-root gate on every pane —
necessary here only because `UFO_PROJECT_ROOT` is pointed at the fleet state dir.
*Fix:* state each var's effect, the silent-degradation hazard, why the escape hatch is required, and
that the state dir is not a project root.

#### AUD-24 — Line 94's `<path>` has no supplied value; the table omits what the launcher pins
**Severity: medium (overstated — fix was incomplete, r2).** All four factual limbs confirmed:
`renderPrompt`'s `values` has no `worktreeRoot` and `l1Alias` is referenced by no placeholder; line
94 keeps a literal `<path>` and no base start-point while the launcher's own identical call passes
`spec.base` (`tower-fleet.mjs:511-517`) and the tower skill forbids guessing a base; the table has no
row for `--max-time` (3 h), `--session-dir`, `{{ufoRoot}}`, or the pane's own `--model @<l1Alias>`.
*Fix (extended):* add the missing rows, supply a lane-worktree-root value, **and append `{{base}}`
on line 94**; dedupe the `{{ufoRoot}}` row with AUD-36.

#### AUD-25 — Step 3 omits the spec's own bounds and key vocabulary
**Severity: medium (confirmed, r2).** `axes` (1–8 distinct, ≤256 B), `milestone` (≤256 B), lane
`name` (CamelCase 2–32, wave-unique), item ≤4 KiB, prompt/template ≤64 KiB, the fail-closed key
whitelists, the `template`/`{{item}}`+`hoist` form, and the frozen-topology ban
(planner/distiller/labrat/Main may never be swarm lanes).
*Evidence:* every bound re-checked against validator source in r2; four confirming refusals executed
(9 axes, bad name, duplicate name, unknown spec key). Scope note: `skill://swarm:42-44,80-84`
already carries the axes bounds, the frozen-seat ban and the `{{item}}` form, and disclaims its own
numbers — but name shape, the byte caps, the key whitelists and `hoist` exist in **no
pane-readable prose**.
*Fix:* add a bounds clause to step 3 + the frozen-seat sentence.

#### AUD-26 — The round's "axis set" is not the object the validator judges
**Severity: medium (confirmed, r2).** Nothing binds it to `spec.axes` (optional — an unbound wave
both **plans and dispatches** clean, executed); "stable within the round" is unenforced across
waves; two different things are called "axis".
*Evidence:* `SwarmR2TableBounds` executed a 16-lane zero-binding wave (`plan` **and** `run` exit 0,
0 `Judged on` lines), re-planned `tf-band-r1.spec.json` (0/16 bindings, exit 0), and confirmed two
chained waves with disjoint axis names both pass. Fleet census: `tf-band` bound nothing;
`tf-audit-prompt-r1` bound 4 spec + 18/18 item axes; r2 bound 3 with per-item subsets.
*Fix (added — the round-1 block had none):* bind step 1's set to `spec.axes` plus per-item
`axes` subsets, declare the same list for every wave of the round, and state the relation to
`{{axis}}`.

#### AUD-27 — Step 1's WWKD chain is unbacked and dropped the verification gate
**Severity: medium (confirmed, r2).** `skill://wwkd` does not resolve in any tower1 pane, so step 1's
"WWKD plan first" rests on a lossy inline chain that also dropped wwkd's non-negotiables: structural
verification at every step, the Data Walk *artifact*, one capability per milestone, one-file
minimum.
*Evidence:* `SwarmR2WwkdHook` re-executed: `skill://wwkd` → `Unknown skill`; no mission carries a
`skills` key (absent, normalized to `[]` at `tower-fleet.mjs:223`; `fleet.json` shows 16 × `skills:[]`),
so `copySkill` never runs. The canonical compression keeps five items
(`ufo SKILL.md:43-45`) — including "verification gate per milestone"; the template kept four and
dropped exactly the gate.
*Fix:* ship the skill (add `wwkd` to `mission.skills` + a fourth `/skill:wwkd` marker), or demote
item 4 to the optional class and make step 1 self-contained with the gate restored.

#### AUD-28 — Verification duty and the delegate/verdict boundary
**Severity: medium (unrefuted).** Step 6 judges and integrates but never verifies, while the tower
skill binds verification of the resulting project to the parent; and "delegates … never judge" is
unqualified against lane roles whose product is the judge's input.
*Evidence:* `SwarmJudgeSemantics` SJS-3/SJS-5 ("verif" appears nowhere in the target); no round-2
lane challenged it.

#### AUD-29 — The invocation guard is claimed as enforced but the hook is substrate-scoped
**Severity: medium (confirmed, r2).** tower SKILL.md and swarm SKILL.md both cite
`.omp/hooks/pre/ufo-godspeed-inject.js`; that file exists only in the substrate.
*Evidence:* `SwarmR2WwkdHook` re-verified: hook present only at
`<ufoRoot>/.omp/hooks/pre/ufo-godspeed-inject.js`; absent in the worktree, `ompskills/.omp`, `~/.omp`,
and any global registration; `verbLaunch` writes the rendered prompt verbatim with zero
godspeed/prepend in the launcher or the wall CLI — only template line 2 supplies the leading
invocation, so tower SKILL.md's *fleet renderer prepends* claim is false. Important distinction:
the swarm skill's separate *wave renderer injects* claim **is true**
(`ufo-swarm-wave.mjs:1166-1167`). Also: the godspeed body self-describes its reader as a
"Godspeed-enabled subagent" inside a pane whose identity is the single L1.
*Fix:* state that the hook is substrate-scoped, so any hand-authored `task` dispatch must be led
with `/skill:godspeed` by the L1; and qualify the godspeed read as posture, not identity.

#### AUD-30 — Wall / visibility negatives are absent
**Severity: medium (relabelled from "low-medium", r2).** No "only `launch` creates a pane", no
"task workers do not automatically appear on the wall", no "do not launch missions just to suggest
visibility".
*Evidence:* `SwarmSettleDuties`; `SwarmR2ValueSide` additionally observed the 16-slot ceiling hit
for real (`fleet.json`: one mission `LAUNCH_FAILED`/`L1_CEILING_EXCEEDED`, 15 attached).

#### AUD-34 — "Move"/"accepted change" is undefined for a findings-only mission
**Severity: medium (relabelled from low, r2).** Lanes are read-only and their artifacts live
outside the worktree, so step 6's "integrate accepted work in `{{worktree}}`" has no lane-side
object; also `{{scope}}` and `{{reportDir}}` share the basename across two trees.
*Evidence:* `SwarmJudgeSemantics` SJS-2 with a concrete observed failure (`git add` of a state-dir
path → `fatal: … is outside repository`); `SwarmR2ValueSide` confirmed both claims and flagged the
misplacement.
*Fix:* "A *move* is a change to your scoped deliverable (`{{scope}}`); a lane's finding is a
candidate move. Integration means consolidating accepted findings into `{{scope}}` — never
committing lane reports, which live outside this worktree."

### C. Values the launcher supplies wrongly or not at all (mission target 3)

**Answer (independently re-derived in round 2):** of the 17 distinct `{{...}}` tokens, **none is
unsupplied**. A class-agnostic token scan finds exactly 17, all letter-only, all keys of
`renderPrompt`'s `values`; a replicated renderer on the real template produced 0 errors and 0
survivors, and the rendered pane prompt carries none. Both `RENDER_UNRESOLVED` arms are real. What
*is* wrong on the value side:

1. **AUD-05** — `{{reportDir}}` exists but only in a spelling the validator rejects; the lane
   instruction is ROOT-relative while the lane's base is its cwd (live dual-root split).
2. **AUD-24** — line 94's `<path>` has no supplied value (`values` has no `worktreeRoot`), and the
   same line omits the base start-point the launcher passes.
3. **Pseudo-placeholders** — `<spec.json>` (69), `<lane>`/`<path>` (94), `<paths>` (84), `<N>` (85)
   are not substituted by design. Classification (round-2 confirmed): `<spec.json>` and `<lane>` are
   **executable traps** (AUD-03, AUD-01); `<path>` is an **unsupplied slot** (AUD-24); `<paths>` and
   `<N>` are harmless labels (`<N>` matches the launcher's receipt matcher).
4. **Dead value** — `values.l1Alias` is supplied and referenced by no placeholder.
5. **Blind spot** — substitution and its post-check share the `[A-Za-z]+` class; round-2 executed
   the counter-case (`{{wave2}}`, `{{report-dir}}` ship verbatim with no error).

### D. Low — wording drift / dead weight

- **AUD-11 / AUD-12** — the `taskCall: null` branch and the resume identity rule are not restated
  (both carried by `skill://swarm` and enforced by the validator).
- **AUD-18** — stop kinds under-specified; "round ceiling" collides with the launcher/skill sense.
- **AUD-21** — `spec.maxLanes` undocumented.
- **AUD-31** — "regress none" narrows godspeed's "harm none" *conditionally*: godspeed never
  defines the object of "harm", so the narrowing holds only under a broad reading
  (`SwarmR2ValueSide`: nuanced).
- **AUD-32** — the non-blocking rule is stated twice (lines 26-29) — confirmed as written.
- **AUD-33** — "least-disruption generalization" fuses wwkd's regularization-ordering principle into
  the generalization stage; attribution corrected — the compound is verbatim from the canonical
  compression (`ufo SKILL.md:43-44`), and wwkd's own front-matter fuses too; the actionable residue
  (Phase-3 one-axis-at-a-time gating uncarried) belongs to AUD-27.
- **AUD-35** — what is unpinned is narrower than "the receipt spelling": line 85 does print the
  canonical pattern; unpinned are `<N>`'s base/bound/terminator/lowercasing. Executed replication
  confirms canonical names collect and sort numerically, `-r2-final`/`-round2` collect at sort key 0
  (ahead of round 0), and `-r5.MD`/`-r6.json` are dropped silently.
- **AUD-36** — `{{ufoRoot}}` has no table row (cross-ref AUD-24's shared fix).

## 4. Answering the three mission targets

**Contradictions.** (i) Line 42 vs steps 5/7 (AUD-06, now medium: unenforced wording defect).
(ii) Line 79 vs line 95 (AUD-15, reframed as an equivocation). (iii) The snapshot band vs the live
band (AUD-22). (iv) tower SKILL.md's "fleet renderer prepends" vs `verbLaunch` writing verbatim
(AUD-29). (v) The template's mandatory `skill://wwkd` vs that skill's own non-gating classification
(AUD-27). (vi) Step 4's "verbatim" vs the `task` tool's schema (AUD-10, reworded). No contradiction
was found between the role menu, band arithmetic, or routing claims and the validator.

**Missing duties.** Registry restatement (AUD-09), verbatim/solutionSpace (AUD-10), `taskCall: null`
(AUD-11), resume identity (AUD-12), cwd discipline (AUD-13), leaf statement (AUD-14), writer class
(AUD-15), settle rail (AUD-16), completion/record (AUD-17), stop kinds (AUD-18), round budget
(AUD-19), resume sizing (AUD-20), `spec.maxLanes` (AUD-21), live-band re-read (AUD-22), env
semantics (AUD-23), table rows + lane worktree root (AUD-24), spec bounds + frozen seats (AUD-25),
axis binding (AUD-26), the WWKD gate (AUD-27), verification (AUD-28), the substrate-scoped hook
(AUD-29), wall negatives (AUD-30), the definition of a move (AUD-34).

**Placeholders the launcher does not supply.** None — see §3.C for the value-side and
pseudo-placeholder gaps.

## 5. Verified sound (no finding)

Checked by at least two lanes, or re-executed in round 2:

- All 17 `{{...}}` tokens are supplied; 0 survivors in the rendered prompt; both `RENDER_UNRESOLVED`
  arms real (r1 + r2 independent inventories).
- The ten roles of step 3 match `SWARM_ROLES` exactly; the frozen seats are correctly absent from
  the menu.
- "pairwise-distinct prompts" matches the duplicate-expansion refusal.
- The receipt name register matches `roundReceipts()`; canonical names sort numerically (r1 + r2
  replications).
- "No per-lane model param" matches the emitted keys (no `model` key anywhere).
- `taskCall.context` is always dispatchable; the spawn/resume split is not lossy.
- `agent:<role>` resolves as an agent type with a routing entry (observed at dispatch).
- The path-scoped commit is valid on the mission branch (`-m` before `--`); a probe commit landed on
  that branch and touched only named paths.
- All five "UFO essence" claims are genuinely present in the body.
- The terminal godspeed envelope marker is not required on the launch path and is correctly absent.
- `git check-ref-format` accepts the taxonomy lane names; only the nesting (AUD-01) is the problem.

## 6. Residual uncertainty

- The registry-write re-basing when `UFO_PROJECT_ROOT` is dropped is `[INFERENCE]` from code paths
  (deliberately not executed against the substrate).
- The dual-root report split's mechanism (lane cwd inheritance) is `[INFERENCE]`; the split itself
  is observed in both rounds.
- Whether omp parses `/skill:` lines inside an `@file` argv payload is untestable from a pane
  session; both hedge branches are safe.
- AUD-17's pane-lifecycle distinction (open-and-running "stopped" holds the slot; exited-stopped
  frees it) rests on a source reading of the wall script, not on a drove-a-pane-to-completion test.
- The live band authority was clobbered mid-mission (01:22Z, a sibling lane's symlink write) and
  restored by the operator; band-dependent observations state the value in force at the time.

## 7. Lane index

Round 1 (audit):

| lane | role | verdict | report |
| ---- | ---- | ------- | ------ |
| SwarmPlaceholderCoverage | reviewer | 6 findings | `SwarmPlaceholderCoverage.md` |
| SwarmIdentityTable | scout | 8 findings | `SwarmIdentityTable.md` |
| SwarmLoadOrder | scout | 4 findings | `SwarmLoadOrder.md` |
| SwarmPlanStance | critic | 4 findings | `SwarmPlanStance.md` |
| SwarmWaveSizing | critic | 6 findings | `SwarmWaveSizing.md` |
| SwarmValidationCmd | executor | 4 findings | `SwarmValidationCmd.md` |
| SwarmOneCallResume | critic | 4 findings | `SwarmOneCallResume.md` |
| SwarmRegistryContinuity | scout | 2 findings | `SwarmRegistryContinuity.md` |
| SwarmLaneShape | reviewer | 3 findings | `SwarmLaneShape.md` |
| SwarmTaxonomyBounds | reviewer | 5 findings | `SwarmTaxonomyBounds.md` |
| SwarmJudgeSemantics | critic | 5 findings | `SwarmJudgeSemantics.md` |
| SwarmReceiptPath | executor | 4 findings | `SwarmReceiptPath.md` |
| SwarmStopClose | critic | 6 findings | `SwarmStopClose.md` |
| SwarmWriterIsolation | sentinel | 7 findings | `SwarmWriterIsolation.md` |
| SwarmSettleDuties | sentinel | 4 findings | `SwarmSettleDuties.md` |
| SwarmEnvelopeCheck | simplifier | 3 findings | `SwarmEnvelopeCheck.md` |
| SwarmPathTraps | connector | 7 findings | `SwarmPathTraps.md` |
| SwarmRuntimeProbe | mutation-tester | 3 findings | `SwarmRuntimeProbe.md` |

Round 2 (falsification):

| lane | role | assignment | verdicts |
| ---- | ---- | ---------- | -------- |
| SwarmR2BranchCollision | mutation-tester | AUD-01 | 1 confirmed (+fix refinement) |
| SwarmR2CommitForm | mutation-tester | AUD-02 | 1 confirmed |
| SwarmR2SpecLiteral | mutation-tester | AUD-03 | 1 nuanced |
| SwarmR2HubSend | critic | AUD-04 | 1 nuanced (evidence corrected) |
| SwarmR2ReportRoot | mutation-tester | AUD-05 | 1 confirmed (+fix corrected) |
| SwarmR2ScopeReceipt | critic | AUD-06, AUD-07 | 2 overstated |
| SwarmR2FoldTail | mutation-tester | AUD-08 | 1 overstated |
| SwarmR2ResumeRail | critic | AUD-09, 11, 12 | 3 overstated |
| SwarmR2VerbatimShape | mutation-tester | AUD-10 | 1 overstated |
| SwarmR2Isolation | sentinel | AUD-13, 14, 15 | 1 overstated, 1 confirmed, 1 nuanced |
| SwarmR2SettleStop | sentinel | AUD-16, 17, 18 | 2 nuanced, 1 overstated |
| SwarmR2Budget | critic | AUD-19, 20, 21 | 3 confirmed |
| SwarmR2EnvBand | mutation-tester | AUD-22, 23 | 2 confirmed |
| SwarmR2TableBounds | reviewer | AUD-24, 25, 26 | 1 overstated, 2 confirmed |
| SwarmR2WwkdHook | scout | AUD-27, 29 | 2 confirmed |
| SwarmR2ValueSide | reviewer | §3.C + AUD-30…36 | 3 confirmed, 2 overstated, 3 nuanced |

## 8. Round-2 verification record (corrections applied)

Round 1 produced 36 findings; round 2 tested 30 clusters (AUD-28 was not challenged). Net changes:

| finding | r1 grade | r2 verdict | applied change |
| ------- | -------- | ---------- | -------------- |
| AUD-01 | blocker | confirmed | fix narrowed to `tower/<fleet>/<missionId>-<lane>`; the `lanes/<lane>` alternative proven to re-collide; wording nit fixed |
| AUD-02 | blocker | confirmed | added nine-probe evidence and the line reference (:84) |
| AUD-03 | blocker | nuanced | collision half rewritten cwd-qualified (`--spec` resolves against process cwd) |
| AUD-04 | blocker | nuanced | **false quotation removed**; true citations added (validator :22-23, emitted note :1341-1342, l0Hub unavailable) |
| AUD-05 | blocker | confirmed | fix corrected: a relative value alone is insufficient; the emitting side must be fixed too |
| AUD-06 | blocker | overstated | **severity → medium**; enforcement fact added |
| AUD-07 | blocker | overstated | **severity → medium**; write-tool auto-mkdir counter-evidence restored |
| AUD-08 | blocker | overstated | **severity → medium**; message/attribution fixes; compliant rebalance reading recorded |
| AUD-09 | medium | overstated | re-scoped to a template-text gap; "(lethal in round ≥2)" and the >32 clause deleted; severity medium-low |
| AUD-10 | medium | overstated | headline reworded: executable-with-defaulted-field; fabrication pressure recorded |
| AUD-11 | medium | overstated | severity → low; fix corrected (one task call + separate resume messages) |
| AUD-12 | low-medium | overstated | severity → low; validator refusals recorded |
| AUD-13 | blocker-adjacent | overstated | severity → medium; "no cwd carrier" made the operative hazard; fix re-aimed |
| AUD-14 | medium | confirmed | addition: the runtime suffix omits "no background jobs" |
| AUD-15 | blocker-adjacent | nuanced | reframed as an equivocation; severity → medium; `reportDir` pinning added to the fix |
| AUD-16 | medium | nuanced | headline reworded (text-only; present via `skill://tower`); rationale re-aimed |
| AUD-17 | medium | nuanced | "not actionable" qualified; the two "stopped" states disambiguated |
| AUD-18 | medium | overstated | severity → low; (a) sourcing corrected to swarm skill + launcher; (c) **sub-claim refuted**, fix becomes a step-6 reconcile sentence |
| AUD-19/20/21 | medium/medium/low | confirmed | AUD-20's fix extended (exemption covers floor and wave ceiling) |
| AUD-22/23 | medium | confirmed | AUD-23's "silent" qualified; the ROOT+no-override pairing recorded |
| AUD-24 | medium | overstated | fix extended with `{{base}}`; `{{ufoRoot}}` row deduped with AUD-36 |
| AUD-25 | medium | confirmed | scope note added for skill-carried bounds |
| AUD-26 | medium | confirmed | **missing fix line added** |
| AUD-27 | medium | confirmed | "declares `skills: null`" corrected to "no `skills` key (absent, normalized to `[]`)" |
| AUD-29 | medium | confirmed | distinction added: the *wave* renderer's injection claim is true |
| AUD-30 | low-medium | overstated | relabelled to medium (the taxonomy has no blended class) |
| AUD-31/33/35 | low | nuanced | attributions/rewordings applied |
| AUD-32/36 | low | confirmed | unchanged |
| AUD-34 | low | overstated | **moved to §3.B, severity → medium** |
| §3.C | answer | confirmed | re-derived by an independent class-agnostic scan + renderer replication |

Result: **5 blockers** (AUD-01…05), **22 medium**, **9 low**; 0 findings retracted, 1 sub-claim
refuted (AUD-18c), 11 grade corrections, 1 provenance error caught and fixed.