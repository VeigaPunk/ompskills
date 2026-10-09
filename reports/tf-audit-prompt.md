# tf-audit-prompt — audit of `sighting/l1-prompt.md`

Mission `tf-audit-prompt` · fleet `tower1` · axis `audit-prompt` · round 1 (18 lanes).
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
| round axes | `fidelity`, `contradiction`, `coverage`, `actionability` |
| wave spec | `<stateDir>/waves/tf-audit-prompt-r1.json` (18 lanes, band 16–32 from live `config/ufo.json`) |
| dispatch payload | `plan`/`run` exit 0, `counts {spawn 18, resume 0}`, one `task` call |
| registry | `<stateDir>/reports/tf-audit-prompt/swarm-registry.json` (18 members, agentIds recorded) |
| lane reports | `<stateDir>/reports/tf-audit-prompt/<Lane>.md` (18 files) |
| render ground truth | `<stateDir>/tf-audit-prompt.prompt.md` (0 unresolved `{{...}}`) |

## 1. What was audited and how

Eighteen lanes, one disjoint dimension each, dispatched as one validated wave: `reviewer` ×3,
`scout` ×3, `critic` ×5, `executor` ×2, `sentinel` ×2, `simplifier`, `connector`,
`mutation-tester`. Evidence classes, kept separate below:

- **L1-read** — the L1 read the file/source directly in this session.
- **lane-read** — a lane read source and quoted it (`path:line`).
- **lane-run** — a lane executed a command and reported the observed result (validator runs,
  `git` probes, replicated functions, `bash -n`, `git check-ref-format`).
- **L1-run** — the L1 executed it (wave validation, dispatch, registry `record`, ref-format
  probe, `test -d`).
- `[INFERENCE]` — reasoning from source, not executed.

Verification honesty: no lane may edit the target, skills, launcher, or repo; each wrote only
its own report. Reports landed in two roots (see AUD-09) — all 18 are now consolidated under
`<stateDir>/reports/tf-audit-prompt/`.

## 2. Verdict

The template's *substance* is sound: every placeholder is supplied, the role list, band
semantics, receipt path, and routing claims match the validator, and all five "UFO essence"
claims are genuinely present. The defects are **executable and duty-shaped**:

- **8 blocker-class instructions fail when followed literally** (AUD-01 … AUD-08), three of them
  observed live during this very mission.
- **20 missing/ambiguous duties** (AUD-09 … AUD-28), several of which silently degrade judgment
  rather than failing loudly.
- **The mission's third target is answered cleanly for `{{...}}` placeholders** (all 17 supplied)
  but **not for the value side**: one supplied value is unusable where the template sends it
  (AUD-09), one required path has no supplied value at all (AUD-24), and one unsubstituted token
  is an executable trap (AUD-03).

## 3. Findings

Severity: **blocker** = a pane following the template literally fails or is misled;
**medium** = a duty is missing/ambiguous, or a failure mode is silent; **low** = wording drift or
dead weight.

### A. Blocker — instructions that fail as written

#### AUD-01 — The writer-isolation branch name collides with the mission branch (D/F conflict)
**Severity: blocker.** Line 94 hands the pane `-b tower/{{fleet}}/{{missionId}}/<lane>`, but the
launcher already created `tower/{{fleet}}/{{missionId}}` for the pane itself
(`tower-fleet.mjs:397`, `511-517`; live: `tower/tower1/tf-audit-prompt`). git refuses to create a
ref that is a directory of an existing ref.
*Evidence:* `SwarmWriterIsolation` reproduced it in a throwaway repo (`cannot lock ref … exists;
cannot create`, exit 128) and verified `-b tower/tower1/tf-audit-prompt-<lane>` succeeds;
`SwarmPathTraps` reproduced the same collision independently.
*Fix:* flatten the lane ref (e.g. `tower/{{fleet}}/{{missionId}}-<lane>`), or run lane worktrees
on `tower/{{fleet}}/lanes/<lane>`.

#### AUD-02 — Step 6's `git commit -- <paths>` aborts; the ordered form is the only working one
**Severity: blocker.** Lines 83-84 give `git add -- <paths> && git commit -- <paths>`. In the
pane environment (`GIT_EDITOR=true`) that aborts with "empty commit message"; the natural repair
`git commit -- <paths> -m msg` also fails (`pathspec '-m' did not match`).
*Evidence:* `SwarmJudgeSemantics` probed both in a linked worktree; only
`git commit -m "<summary>" -- <paths>` works. `git add` remains necessary for a new file.
*Fix:* `git add -- <paths> && git commit -m "<one-line summary>" -- <paths>`.

#### AUD-03 — `--spec <spec.json>` is shell redirection syntax, and its name collides with the fleet spec
**Severity: blocker.** The step-3 fence (lines 65-70) ends in a literal `<spec.json>`; the
renderer substitutes only `{{...}}`, so this token survives into every pane prompt (verified in
each of the 16 rendered prompts).
*Evidence:* `SwarmRuntimeProbe` and `SwarmValidationCmd` both ran it verbatim: **exit 2**,
`syntax error near unexpected token 'newline'`. `SwarmPathTraps` adds that the same name denotes
`<stateDir>/spec.json` — the *fleet* spec, which the validator refuses (`unknown spec key`).
*Fix:* write the real form (`--spec <stateDir>/waves/<wave>.json`, or `--spec -`, or
`--spec-json '<json>'`) and say where a wave spec is expected to live.

#### AUD-04 — `hub send` is named but does not exist on this substrate
**Severity: blocker.** Line 77-78 says "Resume lanes go through `hub send`". No `hub` binary is
on PATH, no `hub` subcommand exists in omp, and no `hub` tool device is mounted.
*Evidence:* `SwarmOneCallResume`: `type -a hub` → not found; `omp://cli-reference.md` has no
`hub` subcommand; the swarm skill repeats the shell string, but the validator's own header calls
it "vocabulary, not an omp command" (`ufo-swarm-wave.mjs:22-23`). The OMP-native door is a
message to the parked agent: `write agent://<entry.resume>` with `entry.message`.
*Fix:* name the mechanism, not the vocabulary: "deliver each `resumeSends` entry as a message to
`agent://<entry.resume>` (`entry.name` is bookkeeping; the message revives the parked agent)."

#### AUD-05 — `reportDir` is supplied only in a spelling the validator refuses
**Severity: blocker.** The table renders `{{reportDir}}` absolute
(`path.join(stateDir,'reports',missionId)`), and step 5 orders lanes to write there. The
validator's `spec.reportDir` **rejects absolute paths**.
*Evidence:* L1-run: `{"code":"invalid_report_dir","message":"reportDir must be a relative path"}`
for the absolute value; `reportDir: "reports/tf-audit-prompt"` (relative to
`UFO_PROJECT_ROOT={{stateDir}}`) validates. Lanes report this five ways: `SwarmIdentityTable`
SIT-1, `SwarmPathTraps` (observed live), `SwarmPlaceholderCoverage`, `SwarmLaneShape`,
`SwarmValidationCmd`.
*Live consequence:* the appended instruction is *relative* (`reports/tf-audit-prompt/<lane>.md`)
and resolves against the lane's cwd — this wave's reports split across
`<stateDir>/reports/tf-audit-prompt/` (8) and `<worktree>/reports/tf-audit-prompt/` (14), with 4
byte-identical duplicates. The L1 had to hand-substitute the relative spelling.
*Fix:* supply a relative value (e.g. `reportDirRel`) in `renderPrompt`'s `values`, or state the
relative root in step 3/5.

#### AUD-06 — The scope row forbids the writes steps 5 and 7 mandate
**Severity: blocker.** Line 42: "`{{scope}}` — never edit outside it". For this mission class
`{{scope}}` is a single worktree file (`reports/tf-audit-prompt.md`), while step 5 mandates
writes to `<stateDir>/reports/<missionId>/` and step 7 to `<stateDir>/rounds/`.
*Evidence:* `SwarmReceiptPath` (new trio, not covered elsewhere) and `SwarmIdentityTable` SIT-4.
The launcher's own policy (`tower-fleet.mjs:25-26`, and `verbLaunch` writing `stateDir`/
`sessions/`) treats stateDir writes as expected, so the template's absolute ban is the outlier.
*Fix:* line 42 gains a carve-out: "…never edit outside it, except the stateDir lane-report and
receipt paths named below."

#### AUD-07 — Nothing creates `<stateDir>/rounds`, and step 7 does not either
**Severity: blocker (silent until the first receipt).** `roundReceipts()` only reads the dir
(`tower-fleet.mjs:598-606`); `verbLaunch` mkdirs `stateDir` and `sessions/<id>` only.
*Evidence:* `SwarmReceiptPath` proved the end-state in `/tmp` (stateDir present, `rounds` absent):
`fs.writeFileSync` → `ENOENT`, bash heredoc → exit 1; `roundReceipts` → `[]` silently. Live:
`<stateDir>/rounds` exists (birth 22:21:04, **101 s after** `fleet.json` 22:19:22) and was empty
until 22:39 — pane-created, not launcher-created.
*Fix:* step 7 begins with `mkdir -p "{{stateDir}}/rounds"`.

#### AUD-08 — "Fold a short tail into the previous wave" is unsatisfiable inside the band
**Severity: blocker.** Lines 57-58 make the greedy reading mandatory for N>32 with `N mod 32 ≤ 15`
— folding produces a wave >32.
*Evidence:* `SwarmWaveSizing` (lane-run): N=44 → `wave_too_wide` ("at most 32 lanes (got 44)");
N=33 same; not folding instead leaves a sub-floor tail → `too_few_lanes`. The validator's own
message recommends rebalance (22+22, 17+16), which the clause never states. The phrase is
inherited verbatim from `.omp/skills/swarm/SKILL.md:37`, so the skill carries the same defect.
*Fix:* "…(rebalance so every wave lands inside {{waveMin}}–{{waveMax}} and never exceeds
{{waveMax}})" — mirror it in the swarm skill to avoid drift.

### B. Missing or ambiguous duties

#### AUD-09 — The registry duty is absent; resume is fail-closed without it
**Severity: medium (lethal in round ≥2).** The identity table scopes the validator to
"(plan / run)" (line 45) and no step mentions `record --registry … --assignments …`.
*Evidence:* `SwarmRegistryContinuity` SRC-1/`SwarmTaxonomyBounds`/`SwarmPathTraps`/
`SwarmValidationCmd`/`SwarmIdentityTable` SIT-8 all trace it: `run` persists
`<reportDir>/swarm-registry.json` with `agentId: null` for spawn lanes; only `record` fills them;
a later wave's resume then fails `resume_unknown_member` before spawning. With
`roundCeiling: 2` and ≤32 lanes per wave, any item set >32 forces wave 2 to lose continuity.
(This round's L1 ran `record` and the registry now holds 18 non-null agentIds.)
*Fix:* add `record` to the verb row and one step-4 sentence naming the registry path and the
`{memberName: agentId}` assignment shape; add `priorRegistry` when a later wave uses a different
`reportDir`.

#### AUD-10 — "Dispatch the tasks array verbatim" is not literally executable
**Severity: medium.** The emitted per-task keys are exactly `{name, agent, task}`; the OMP `task`
tool advertises `solutionSpace` as required.
*Evidence:* `SwarmOneCallResume` SOCR-3 — recorded *from this mission's own round-1 dispatch*:
the L1 re-keyed all 18 items and fabricated a per-lane `solutionSpace` the validator never
produced. Lenient validation tolerates the omission, so both paths work — which is why the
template must say so.
*Fix:* one sentence: the emitted keys are `name`/`agent`/`task`; do not invent per-item fields.

#### AUD-11 — Step 4 has no `taskCall: null` branch
**Severity: medium.** A resume-only wave legally emits `taskCall: null` (zero task calls, all
deliveries to parked members). The template commands exactly one batched call unconditionally.
*Evidence:* `SwarmOneCallResume` SOCR-1, `SwarmPlaceholderCoverage` (dispatch-surface-null-taskcall);
the fleet's *own* reference doc carries the branch (`test/sighting-wave-smoke.md:268-270`).
*Fix:* "If `taskCall` is `null`, the wave resumes only — issue no `task` call; deliver each
`resumeSends` entry to its parked member. A mixed wave dispatches `tasks` **and** the
`resumeSends` entries — one call, never two."

#### AUD-12 — The resume identity rule is absent
**Severity: low-medium.** A resume continues the recorded member; it must not restate
role/agent/axes/milestone.
*Evidence:* `SwarmOneCallResume` SOCR-4; validator fails closed (`resume_role_forbidden`,
`resume_meta_forbidden`), so the gap bites only when the pane composes the resume itself.

#### AUD-13 — No `--cwd` discipline for writer lanes; task agents are not worktree-isolated
**Severity: blocker-adjacent (real concurrency hazard).** The isolation bullet gives a worktree
recipe but never says lane commands run with `--cwd <lane path>`; step 4 dispatches through
`task`, which is *not* worktree-isolated by default (tower SKILL.md).
*Evidence:* `SwarmWriterIsolation` (no-cwd-discipline, high in its own grading). Live: no per-lane
worktrees exist under `.tower/worktrees/tower1/`.
*Fix:* "run every lane command with `--cwd <lane path>`; a `task` agent is not isolated by
itself."

#### AUD-14 — Lane leaf shape (No subagents / no background jobs) is unstated
**Severity: medium.** The only bound on a delegate is "advisory" (lines 91-92).
*Evidence:* `SwarmLaneShape` lane-leaf-bounds-missing; `SwarmSettleDuties`/`SwarmStopClose` echo the
missing bound. Runtime `laneBindingSuffix` covers *validated* spawns only; resume messages never
re-carry it, and the template's own fallback ("proceed with the structure written here") leaves a
skill-blind L1 with zero lane-shape knowledge.
*Fix:* extend the One-L1 bullet: "a lane is a leaf — no subagent dispatch, no background jobs;
only the `executor` card may spawn its single `labrat`."

#### AUD-15 — Writer class undefined: "otherwise lanes are read-only" contradicts "every lane writes"
**Severity: blocker-adjacent.** Line 79 mandates that every lane write a report; line 95 calls
non-worktree lanes read-only, and line 93 grants a worktree only to "a lane that writes".
*Evidence:* `SwarmLaneShape` (high), `SwarmWriterIsolation`; live evidence: this mission's reports
split across both roots.
*Fix:* define the writer class as *repo/scope edits*, exempt `reportDir` files explicitly, and
name one collection channel.

#### AUD-16 — The settle / recover / clean-up rail is absent
**Severity: medium.** tower SKILL.md binds: track each worktree to completion; on interruption
preserve branch + worktree including uncommitted changes; inspect with `omp worktree list`;
preview with `clear --dry-run`; retire **one** worktree by its own path; **never**
`omp worktree clear --all`.
*Evidence:* `SwarmSettleDuties` (settle-worktree-never-clear graded high, plus track-handoff and
interrupt-preserve), `SwarmWriterIsolation` (lane trees invisible to `close --apply`), and the
live geometry: 16 sibling missions share the repo.
*Fix:* add a settle bullet; the interruption case matters because `--max-time` (3 h) can kill a
pane mid-round.

#### AUD-17 — Mission completion is never named, and "receipt on screen" is not actionable
**Severity: medium.** The stop section makes the terminal the artifact; the session is capped by
`--max-time`, so only the stateDir receipt survives for `status`.
*Evidence:* `SwarmStopClose` SSC-5 (high) — no rule creates a mission-level receipt and none
requires printing; the wall's completion path captures 0 pane lines. `SwarmReceiptPath` adds that
a stopped pane stays a live L1 against `maxConcurrentL1` (16/16 slots in this fleet); retirement
is the operator's `close --apply`.
*Fix:* "the file, not the screen, is the record: confirm `{{stateDir}}/rounds/{{missionId}}-r<N>.md`
exists; stopping does not deregister you — the operator runs `close --apply`; never remove a
worktree with a repo-wide sweep."

#### AUD-18 — Stop kinds are under-specified
**Severity: medium.** (a) "the round ceiling" names two quantities: `{{roundLaneCeiling}}`=100
per-round members and `{{roundCeiling}}`=2 rounds (tower vocabulary assigns the phrase to the
former only). (b) "a clean round accepts nothing" re-labels a wave where every lane was exhausted
or refused — which line 80 says is *not* saturation. (c) No stop path exists for mutually
contradictory lane findings.
*Evidence:* `SwarmStopClose` SSC-1/2/3, `SwarmWaveSizing` SWS-2, `SwarmPathTraps`
(round-ceiling per-wave mislabel).
*Fix:* rename the table row "round lane budget"; define saturation; add a blocked-with-cause path
for contradictory evidence.

#### AUD-19 — Step 2 states no round-level budget, and no enforcement sums lanes across waves
**Severity: medium.** Sequential waves of one round share `maxLanes`=100; the validator checks
only per wave.
*Evidence:* `SwarmWaveSizing` SWS-3 — 4×32 = 128 in one round passes every wave.
*Fix:* "The round's sequential waves share {{roundLaneCeiling}} lanes; if N exceeds it, reduce N
or carry the remainder into a later round."

#### AUD-20 — Resume-only waves and resume-inclusive sizing are unstated
**Severity: medium.** The band counts spawns **plus** resumes; resume-only waves are exempt from
the floor.
*Evidence:* `SwarmWaveSizing` SWS-4 / `SwarmIdentityTable` SIT-3 (lane-run: resume-only waves of 1
and 5 accepted; 20 spawns + 15 resumes → `wave_too_wide` though the item count reads 20).
*Fix:* "Resumes count toward a wave's size; a resume-only wave is exempt from the floor."

#### AUD-21 — `spec.maxLanes` is undocumented
**Severity: low.** Only-tightens, and never below the floor (`impossible_band`).
*Evidence:* `SwarmWaveSizing` SWS-5 (lane-run: `spec.maxLanes: 12` → `impossible_band`).

#### AUD-22 — The band row is a launch-time snapshot of live authority
**Severity: medium.** The template bakes the band into the pane prompt, while the validator reads
`config/ufo.json` live on every call — contradicting the tower skill's "read live, never
hardcode".
*Evidence:* `SwarmWaveSizing` SWS-6 (live divergence observed: a sibling mission's 35-lane wave
was admitted under `waveMinLanes 32 / waveMaxLanes 100` while its rendered prompt said 16–32; the
same spec is refused now). L1-run: the live authority was clobbered at 01:22Z by a lane's symlink
write and restored by the operator to 16/32/100/16 during this round; while clobbered, an 18-lane
wave was refused `too_few_lanes` ("needs at least 32"). The template says nothing about
re-reading the live band before sizing.
*Fix:* one clause: "re-read the live band before sizing; the table's numbers are the launch-time
snapshot."

#### AUD-23 — Env-var semantics are undocumented, and one omission fails silently
**Severity: medium.** All three vars in the step-3 fence change behavior.
*Evidence:* `SwarmRuntimeProbe` (lane-run, all three → exit 0, band 16–32, `policy.source config`;
drop `UFO_FLEET_ALLOW_EXTERNAL_TOOLS` → typed refusal `EXEC_PATH_OUTSIDE_ROOT`; drop
`UFO_CONFIG_PATH` → **exit 0, silent band swap to 2–100**). `SwarmValidationCmd` adds that
dropping `UFO_PROJECT_ROOT` silently re-bases registry writes. `SwarmRuntimeProbe` SRP-2: the
template unconditionally sets the substrate's documented *test-only* escape hatch
(`UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`), i.e. it disables the outside-root gate on every pane;
`SwarmPathTraps` frames the same as "stateDir is not a project root".
*Fix:* state each var's effect, the silent-degradation hazard, and why the escape hatch is
required here.

#### AUD-24 — Line 94's `<path>` has no supplied value; the table omits what the launcher pins
**Severity: medium.** No `{{worktreeRoot}}` exists in `renderPrompt`'s `values`, and the command
omits the base start-point the launcher's own identical call passes — while the tower skill
forbids guessing a base.
*Evidence:* `SwarmPlaceholderCoverage` (lane-worktree-root-unsupplied), `SwarmWriterIsolation`
(base-omitted / unanchored path), `SwarmIdentityTable` SIT-2/5/6/7 (no row for `--max-time` 3 h,
`--session-dir`, `{{ufoRoot}}`, or the pane's own `--model @<l1Alias>` — and `values.l1Alias` is
supplied but referenced by no placeholder).
*Fix:* add rows (maxTime, session dir, ufoRoot, the pane's alias) and supply a lane-worktree-root
value.

#### AUD-25 — Step 3 omits the spec's own bounds and key vocabulary
**Severity: medium.** `axes` (1–8 distinct names, ≤256 B), `milestone` (≤256 B), lane `name`
(CamelCase 2–32, wave-unique), item ≤4 KiB, prompt/template ≤64 KiB, the fail-closed key
whitelists, and the `template`/`{{item}}`+`hoist` form.
*Evidence:* `SwarmTaxonomyBounds` (all independently confirmed in validator source), plus the
frozen-topology ban (planner/distiller/labrat/Main may never be swarm lanes) which step 3's role
menu never states even though step 1 commands planning work.
*Fix:* add a bounds clause to step 3; add the frozen-seat sentence.

#### AUD-26 — The round's "axis set" is not the object the validator judges
**Severity: medium.** Nothing binds it to `spec.axes` (optional, so a wave can dispatch with zero
bindings); "stable within the round" is unenforced across waves; and the template calls two
different things "axis" (the fixed mission `{{axis}}` and the dynamic set) with no stated relation.
*Evidence:* `SwarmPlanStance` SPS-3 (lane-run: `tf-band-r1.spec.json` planned with 0/16 axes bound
while its receipt declares A1–A5; two chained waves planned clean with disjoint axis names; three
panes in this fleet resolved "axis" three different ways).

#### AUD-27 — Step 1's WWKD chain dropped the verification gate and is unbacked
**Severity: medium.** `skill://wwkd` does not resolve in any tower1 pane, so step 1's "WWKD plan
first" rests on a lossy inline chain that also dropped wwkd's non-negotiables: structural
verification at every step, the Data Walk *artifact*, one capability per milestone, one-file
minimum.
*Evidence:* `SwarmPlanStance` SPS-1/SPS-2/SPS-4, `SwarmLoadOrder` SL-1 (resolution matrix: tower /
godspeed / swarm resolve; **wwkd does not** — observed `Unknown skill: wwkd / Available: godspeed,
omarchy, swarm, tower`; every mission in `spec.json` declares `skills: null`, so `copySkill` never
runs), `SwarmEnvelopeCheck` ENV-2 (the read is conditional and no marker names wwkd).
The canonical UFO compression keeps five items; the template kept four and dropped exactly the
gate. `SwarmPathTraps` observed the same non-shipping and raised no finding (dimension split).
*Fix:* choose one: ship the skill (add `wwkd` to `mission.skills` + a fourth `/skill:wwkd` marker)
or demote item 4 to the optional class and make step 1 self-contained (with the gate restored).

#### AUD-28 — Verification duty and the delegate/verdict boundary
**Severity: medium.** Step 6 judges and integrates but never verifies, while the tower skill binds
verification of the resulting project to the parent; and "delegates … never judge" is unqualified
against lane roles whose product is her judgment input.
*Evidence:* `SwarmJudgeSemantics` SJS-3/SJS-5 ("verif" appears nowhere in the target).

#### AUD-29 — The invocation guard is claimed to be enforced but the hook is project-scoped
**Severity: medium.** tower SKILL.md and swarm SKILL.md both cite
`.omp/hooks/pre/ufo-godspeed-inject.js`; that file exists only in the substrate, not in this repo.
*Evidence:* `SwarmEnvelopeCheck` ENV-1 (plus `SwarmLoadOrder` SL-4: the godspeed body self-describes
the reader as a "Godspeed-enabled subagent" inside a pane whose identity is the single L1, and
SL-2: the tower skill's claim that "the fleet renderer prepends `/skill:godspeed` to a launched
mission prompt" is **false** — `verbLaunch` writes the prompt verbatim; only template line 2
supplies it). The terminal envelope marker is correctly absent (not required on the launch path).
*Fix:* state that the hook is substrate-scoped, so any hand-authored `task` dispatch must be led
with `/skill:godspeed` by the L1.

#### AUD-30 — Wall / visibility negatives are absent
**Severity: low-medium.** No "only `launch` creates a pane", no "task workers do not automatically
appear on the wall", no "do not launch missions just to suggest visibility".
*Evidence:* `SwarmSettleDuties` visibility-wall-authority (the pane has bash + `{{ufoRoot}}`, and
the fleet already consumes all 16 L1 slots).

### C. Values the launcher supplies wrongly or not at all (mission target 3)

**Answer:** of the 17 distinct `{{...}}` tokens, **none is unsupplied** — all are keys of
`renderPrompt`'s `values`, and both `RENDER_UNRESOLVED` arms (unknown key; leftover token) make an
unsubstituted letter-only token impossible to ship (L1-run inventory + `SwarmPlaceholderCoverage`
(a) + `SwarmPathTraps` clean list; verified against the rendered prompt: 0 survivors).

What *is* wrong on the value side:

1. **AUD-05** — `{{reportDir}}` exists but only in a spelling the validator rejects; no relative
   value is supplied, and the lane instruction resolves it against the lane's cwd.
2. **AUD-24** — line 94's `<path>` has no supplied value at all (`values` has no `worktreeRoot`).
3. **Pseudo-placeholders** — `<spec.json>` (line 69), `<lane>`/`<path>` (94), `<paths>` (84),
   `<N>` (85) are not substituted by design. Classification: `<spec.json>` and `<lane>` are
   **executable traps** (AUD-03, AUD-01); `<path>` is an **unsupplied slot** (AUD-24);
   `<paths>` and `<N>` are harmless labels (`<N>` matches the launcher's receipt matcher).
4. **Dead value** — `values.l1Alias` is supplied and referenced by no placeholder
   (`SwarmPlaceholderCoverage` (b)).
5. **Blind spot** — substitution and its post-check share the `[A-Za-z]+` class, so a future
   digit/dash brace token would ship verbatim with no error (`SwarmPlaceholderCoverage`,
   low).

### D. Wording drift / dead weight (low)

- **AUD-31** — "regress none" narrows godspeed's "harm none" to axis regressions only
  (`SwarmJudgeSemantics` SJS-4).
- **AUD-32** — the non-blocking rule is stated twice in lines 26-29
  (`SwarmEnvelopeCheck` ENV-3).
- **AUD-33** — "least-disruption generalization" fuses wwkd's regularization-ordering principle
  into the generalization stage (`SwarmPlanStance` SPS-4).
- **AUD-34** — "move"/"accepted change" is undefined for a findings-only mission whose lanes leave
  nothing in the worktree; `{{scope}}` and `{{reportDir}}` share a basename across two trees
  (`SwarmJudgeSemantics` SJS-2, `SwarmReceiptPath` cross-lane note).
- **AUD-35** — receipt spelling is unpinned; odd names (`-r2-final.md`, `-r5.MD`) collect with sort
  key 0 or are dropped silently (`SwarmReceiptPath`; canonical `-r<N>.md` names register and sort
  correctly, so this is a pinning gap, not a matcher bug).
- **AUD-36** — `{{ufoRoot}}` is used in the fence (line 67) but has no table row
  (`SwarmIdentityTable` SIT-6, `SwarmPlaceholderCoverage`).

## 4. Answering the three mission targets

**Contradictions.** (i) Line 42 vs steps 5/7 (AUD-06). (ii) Line 79 vs line 95 (AUD-15).
(iii) The template's snapshot band vs the validator's live band (AUD-22). (iv) tower SKILL.md's
"the fleet renderer prepends `/skill:godspeed`" vs `verbLaunch` writing verbatim (AUD-29).
(v) The template's mandatory `skill://wwkd` vs the skill's own classification as non-gating
enrichment (AUD-27). (vi) Step 4's "verbatim" vs the `task` tool schema (AUD-10). No contradiction
was found between the role menu, band arithmetic, or routing claims and the validator.

**Missing duties.** Registry/`record` continuity (AUD-09), `taskCall: null` (AUD-11), resume
identity (AUD-12), leaf shape (AUD-14), writer class (AUD-15), settle/recover/cleanup (AUD-16),
mission completion (AUD-17), saturation definition and contradiction stop (AUD-18), round budget
(AUD-19), resume sizing (AUD-20), `spec.maxLanes` (AUD-21), live-band re-read (AUD-22), env
semantics (AUD-23), table rows (AUD-24), spec bounds + frozen seats (AUD-25), axis binding
(AUD-26), the WWKD gate (AUD-27), verification (AUD-28), the substrate-scoped hook (AUD-29), wall
negatives (AUD-30).

**Placeholders the launcher does not supply.** None of the 17 `{{...}}` tokens — but see §3.C for
the value-side and pseudo-placeholder gaps.

## 5. Verified sound (no finding)

Independently checked by at least two lanes or by the L1:

- All 17 `{{...}}` tokens are supplied; the rendered prompt has zero survivors; both
  `RENDER_UNRESOLVED` arms are real (`tower-fleet.mjs:294-298`).
- The ten roles of step 3 match `SWARM_ROLES` exactly (spelling, order, case); the frozen seats are
  correctly *not* in the menu.
- "pairwise-distinct prompts" matches the validator's duplicate-expansion refusal.
- The receipt path's name register matches `roundReceipts()`, and canonical names sort numerically
  (`-r10` before/after `-r2` is handled by the digit parse).
- "There is no per-lane model param" matches the emitted keys (no `model` anywhere).
- `taskCall.context` is always dispatchable (non-empty default skeleton); the spawn/resume split is
  not lossy.
- `agent:<role>` resolves as an agent type with a routing entry (observed at dispatch:
  `agent review…`, `modelRole m_mid`).
- The path-scoped commit is valid on the mission branch; a probe commit landed on that branch and
  touched only named paths.
- All five "UFO essence" claims are genuinely present in the body.
- The terminal godspeed envelope marker is not required on the launch path and is correctly absent.

## 6. Residual uncertainty

- The registry-write re-basing when `UFO_PROJECT_ROOT` is dropped is `[INFERENCE]` from code paths
  (deliberately not executed, to avoid writing under the substrate).
- The lane-report split root's mechanism (lane cwd inheritance) is `[INFERENCE]`; the split itself
  is observed.
- Severity of AUD-03 assumes panes may paste the fence verbatim; a pane that substitutes a real
  path succeeds.
- Whether omp parses `/skill:` lines inside an `@file` argv payload is untestable from a pane
  session; both hedge branches are safe.
- The live band authority was clobbered mid-round (01:22Z, a lane's symlink write) and restored by
  the operator; band-dependent observations above are stated with the value in force at the time.

## 7. Lane index

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

75 lane findings clustered into 36 findings (8 blocker, 20 missing-duty, 8 value/wording);
lane reports hold the full per-dimension evidence and checks-run logs.