# tf-audit-band — band-chain audit (round 1)

| field | value |
| ----- | ----- |
| fleet / mission | `tower1` / `tf-audit-band` |
| axis | `audit-band` |
| goal | audit the band chain end to end (delta → apply merge → validator policy → launcher read → prompt render → skill text); name every inconsistency with file and line |
| worktree (repo) | `/home/vgpnk/Projects/ompskills/.tower/worktrees/tower1/tf-audit-band` (ompskills) |
| substrate | `/home/vgpnk/Projects/ufo-fsd-alpha` |
| scope | `reports/tf-audit-band.md` (this file) — nothing else edited |
| method | one 32-lane validated audit wave (`ufo-swarm-wave.mjs`), lanes read-only, reports at `.tower/fleets/tower1/reports/tf-audit-band/<Lane>.md` |
| verdict | the omskills worktree side of the chain is consistent with the live band; the drift lives in the substrate's committed HEAD, three stale prose generations, one installed artifact, and two mirrors |

## 0. Live authority and the clobber/restore event

Band authority read live by every pipeline stage: `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json`
(`sighting.dispatch`). At audit close (`sha256 0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3`, size 11999 B, mtime 2026-10-08 22:30:57 −0300 = 01:30:57Z):

| key | live | delta (`host/ufo-sighting-dispatch.json`) |
| --- | --- | --- |
| `swarm.waveMinLanes` | 16 | 16 |
| `swarm.waveMaxLanes` | 32 | 32 |
| `swarm.minLanes` | 16 | 16 |
| `swarm.maxLanes` | 100 | 100 |
| `dispatch.maxConcurrentL1` | 16 | 16 |
| `swarm.note` band prose | **none** | n/a |

**Enforced wave band: 16–32** (independently reproduced by the L1 with the real CLI: 15 → `too_few_lanes`, 16/24/32 → admitted, 33/100 → `wave_too_wide`, 101 → `too_many_lanes`).

**Mid-mission event.** At 01:22Z the authority file was clobbered (a lane wrote through a symlink) to `waveMinLanes 32 / waveMaxLanes 100 / minLanes 64` — byte-identical to the substrate's *committed* HEAD band — and restored at 01:31Z to 16/32/16. The L1 re-validated the wave against the restored file and broadcast a correction to all 32 lanes. Consequences recorded as findings:

- The restored 16–32 band is **uncommitted**: `git -C /home/vgpnk/Projects/ufo-fsd-alpha status` shows ` M config/ufo.json`; HEAD `5ace2559` ("wave band 32-100") commits `minLanes 64 / waveMinLanes 32 / waveMaxLanes 100`. Any `git checkout`/clone re-clobbers the authority that stages 3–4 read.
- All 9 `config/ufo.json.*.bak` snapshots carry the 64/32/100 band; none carries the live 16-32 state.
- `test/run-wave-test.mjs --band live` (lane `TestRunner`, executed) passes 60/60 against the restored file; the same file's `apply_not_landed` guard is delta-relative and never fires.

**Band generations seen in the tree** (used for classification below):

| generation | waveMin–waveMax | minLanes | maxConcurrentL1 | l1Alias | where it survives |
| --- | --- | --- | --- | --- | --- |
| A (older) | 16–100 | 64 | 32 | m_daybreak | `skills/ufo/SKILL.md` + `references/run-logic.md`, `docs/BEHAVIOR-MATRIX.md`, `crates/ufo-core-runtime/bundled/config.json`, `.omp/skills/ufo/**` |
| B (HEAD/clobber) | 32–100 | 64 | 16 | m_strong | `git HEAD:config/ufo.json`, 8 `.bak`, `host/omp-agent.config.yml:190,197` |
| **live == delta** | **16–32** | **16** | **16** | **m_strong** | `config/ufo.json` on disk, `host/ufo-sighting-dispatch.json`, omskills `.omp/skills/{swarm,tower}` |

## 1. Chain map (stage → artifact → live-band verdict)

| # | stage | artifact | verdict |
| - | ----- | -------- | ------- |
| 1 | delta | `host/ufo-sighting-dispatch.json` | **consistent** — all 6 keys == live |
| 2 | apply merge | `host/apply.mjs` | gates consistent; **comments + merge guard defective** (F2, F3, F19) |
| 2 | installed artifact | `host/omp-agent.config.yml` | **stale prose** (F4) |
| 3 | validator policy | `scripts/ufo-swarm-wave.mjs`, `scripts/ufo-mission-result.mjs` | band math consistent & config-read; **header/echo prose stale** (F8, F14) |
| 4 | launcher read | `sighting/tower-fleet.mjs` | **consistent** — reads live, renders correctly; two hardening gaps (F14, F17) |
| 5 | prompt render | `sighting/l1-prompt.md` | numbers consistent; **dangling `skill://wwkd`** (F15), below-floor prose nuance (F16) |
| 6 | skill text | omskills `.omp/skills/{swarm,tower}` | **consistent** with live |
| 6 | skill text | substrate `skills/ufo/**`, `.omp/skills/{ufo,swarm}` | **stale, 2 dead generations** (F6, F7) |
| — | substrate docs/tests | `AGENTS.md`, `docs/**`, `scripts/fleet-dispatcher.mjs`, mirrors, tests | **stale** (F5, F9–F12) |

## 2. Findings (deduped, judged)

Format: `SEV | path:line | claim | contradiction | evidence`. SEV ∈ {BUG, DRIFT, IMPROVE, NOTE}. Lanes that independently reported each row are bracketed.

### Substrate / authority

**F1 · BUG · HEAD ≠ disk band authority** — `git HEAD:config/ufo.json:89,93,94` vs working tree
*Claim:* committed HEAD asserts `minLanes 64 / waveMinLanes 32 / waveMaxLanes 100` (commit `5ace2559`, "wave band 32-100"); *Contradiction:* the live file (the only thing stages 3–4 read) is `16/16/32` and is uncommitted (` M config/ufo.json`); *Evidence:* `git show HEAD:config/ufo.json`, `git diff -U0` = exactly `-64/+16, -32/+16, -100/+32`, 9 `.bak` all 64/32/100. Any checkout/profile re-clobbers the authority.
[DeltaMerge, ChainTrace, LauncherAuthority, SkillTowerOmskills, SyncContracts, ConfigNote, ValidatorPolicy, HubPolicyLoader, PromptTemplate, SmokeDoc, TestRunner, WallCli, EvidenceArchiveUfo]

**F2 · BUG · apply merge is downgrade-blind and unguarded on the clobbered write path** — `host/apply.mjs:287-322, 897-922, 851-855`
*Claim:* "the merge is a surgical per-line value rewrite … the result re-parses to exactly the expected object"; *Contradiction:* `dispatchGate` never compares live dispatch to a recorded snapshot — `expected = live⊕delta` is direction-blind and certifies a downgrade; and `config/ufo.json` is written by `writeAtomic` (`:920-922`) guarded only by `existsSync`, while the *install target* has an explicit symlink refusal (`:851-855`). This is exactly the 01:22Z silnk-write clobber class, unblocked on the one file with a demonstrated clobber; *Evidence:* code read; no `--apply` run (read-only lane). [ApplyDispatchGate]

**F3 · BUG · `planNoteRewrite` is dead code** — `host/apply.mjs:333-335` vs `config/ufo.json:92`
*Claim:* "The wave band is restated in prose in `sighting.dispatch.swarm.note`"; *Contradiction:* the live note contains **zero digits** (628 chars; regex digit scan → none) and no band string exists in any of the 9 backups; the function returns `[]` and the script's own step 8 prints "no band wording found"; *Evidence:* digit scan of `config/ufo.json:92` + `.bak`. [ApplyHeader, ApplyDispatchGate, ConfigNote, DeltaMerge]

**F4 · DRIFT · installed artifact asserts a dead band** — `host/omp-agent.config.yml:190,197`
*Claim:* "bounds lane width itself (32-100 per wave, 100 members per L1)" / "`waveMinLanes` (ufo's per-wave floor, raised from 16 to 32)"; *Contradiction:* the co-shipped delta and live config say 16–32 (the floor was lowered 32→16, not raised); *Evidence:* file bytes vs `host/ufo-sighting-dispatch.json:9-10` vs `config/ufo.json:93-94`. Two artifacts installed by the same `--apply` disagree. [ApplyBandGate, SkillSwarmOmskills, ChainTrace, ValidatorPolicy, ApplyHeader, SkillSwarmUfo]

**F5 · BUG · L1-prompt doctrine sizes waves the planner refuses** — `scripts/fleet-dispatcher.mjs:5386-5396`
*Claim:* "a WAVE carries 16-100 L2 lanes … one wave of N when 16 <= N <= 100, and sequential waves of at most 100 when N > 100"; *Contradiction:* live `waveMaxLanes` 32 — a 40-lane wave is refused `wave_too_wide`; the prose reaches every L1 prompt via `buildDispatchBindingBlock`; *Evidence:* bytes read; validator refusal observed. [FleetDispatcher, PromptTemplate, ValidatorMessages]

**F6 · DRIFT · substrate ufo skill states generation A** — `skills/ufo/SKILL.md:338-349, 385-387` (+ `.omp/skills/ufo/**`, `.cursor` twins) and `references/run-logic.md:738, 776, 781-782, 2282, 2285, 2308-2310, 2329`
*Claim:* "at most 32 live L1s … sequential 16–100 lane waves … `minLanes` 64 … default `missionFormat.l1Alias` = `m_daybreak`"; *Contradiction:* live is 16 L1s / 16–32 / minLanes 16 / `m_strong`; *Evidence:* bytes vs `config/ufo.json:79,85,89,93,94`; 11 byte-identical copies carry the same stale prose. Dated CHANGELOG entries are historical and excluded. [SkillUfoOmp, SkillsDirUfo, SkillSwarmUfo, LauncherAuthority, ValidatorPolicy]

**F7 · DRIFT · substrate swarm-skill copy is a chimera** — `/home/vgpnk/Projects/ufo-fsd-alpha/.omp/skills/swarm/SKILL.md:51-53`
*Claim:* "16–100 total members … `minLanes`: 64"; *Contradiction:* the omskills canonical `.omp/skills/swarm/SKILL.md:61-66` (16–32 / 16) matches live and wins; no sync/gate keeps the two copies equal (the contract-sync mirror covers only `skills/ufo/**`), so the substrate copy is untracked (`??`) and ungated; *Evidence:* both files read; `sync-ufo-contracts.mjs:89-103,912` scope read. [SkillSwarmUfo, SkillsDirUfo, SkillSwarmOmskills]

**F8 · DRIFT · validator header restates a wrong per-wave bound** — `scripts/ufo-swarm-wave.mjs:11, 148-152` (+ `ufo-mission-result.mjs:2412-2414`)
*Claim:* "At most 100 lanes per wave"; *Contradiction:* the per-wave bound is `waveMaxLanes` (32 today); 100 is the *member* ceiling enforced by a different check (`too_many_lanes` at 101 only); the same header duplicates 100/128/"minimum 2" three lines above its own "never restated here (one authority, one name)" rule; *Evidence:* observed `wave_too_wide` at 40 vs `too_many_lanes` at 101. [ValidatorMessages, ValidatorPolicy]

**F9 · DRIFT · bundled runtime mirror is a frozen generation** — `crates/ufo-core-runtime/bundled/config.json:79, 85, 89, 93, 94`
*Claim:* mirror of `config/ufo.json`; *Contradiction:* carries `maxConcurrentL1 32`, `l1Alias m_daybreak`, `minLanes 64`, `waveMaxLanes 100` vs live `16 / m_strong / 16 / 32`; `node scripts/sync-ufo-contracts.mjs --check` exits 1 with `drifted:[bundled/omp-seat-routing.json, bundled/config.json]`; the contract is a **whole-file byte mirror**, yet `host/apply.mjs:93` defers it as merely "mirrors `maxConcurrentL1`" (under-report — 4 keys drift); *Evidence:* key diff + `--check`. [BundledMirror, SyncContracts, ApplyMirrorGate, SkillSwarmOmskills]

**F10 · DRIFT · AGENTS.md states generation A** — `AGENTS.md:151-152, 154, 155-156, 162-166, 204-205`
*Claim:* "a ROUND fields a swarm of 64-100 lanes … (repo: 16-100) … one wave of N when 16 <= N <= 100 … `too_many_lanes` fires before `wave_too_wide` … at most 32 live L1s"; *Contradiction:* live minLanes 16 / wave 16–32 / cap 100 ≠ wave ceiling 32 (so `too_many_lanes` cannot precede `wave_too_wide`) / maxConcurrentL1 16; *Evidence:* quoting bytes vs `config/ufo.json:79,89,93,94`. [BundledMirror, ApplyHeader, ChainTrace]

**F11 · DRIFT · docs tables stale** — `docs/BEHAVIOR-MATRIX.md:12, 27, 35, 178-185, 333, 335`; `docs/L2-L3-ROUTING.md:63, 71, 148-155, 177, 485`
*Claim:* canonical JSON and prose per-state "maxConcurrentL1 32", "swarm 64-100 / wave 16-100", "32 L1s"; *Contradiction:* live 16 / wave 16-32 / minLanes 16; *Evidence:* per-line table in lane report. `EVIDENCE-INDEX.md` is self-declared historical — no live claim. [DocsBand]

**F12 · BUG · a test pins a band that no longer exists** — `scripts/ufo-stale-watchdog.test.mjs:306, 317-318`
*Claim:* comment "repo declares `waveMinLanes` 16 / `waveMaxLanes` 100" and `assert.match(steer, /16-100 lanes per wave/)`; *Contradiction:* the default path loads the live config, whose steer text renders "16-32 lanes per wave" → regex false; matches neither live (16-32) nor HEAD (32-100); *Evidence:* loader output + rendered template (`ufo-stale-watchdog.mjs:864`); test not executed (would write substrate temp dirs) — failure is [INFERENCE] from its exact inputs. [ValidatorMessages, PromptTemplate, StaleWatchdog, BundledMirror]

### omskills worktree (this repo)

**F13 · DRIFT · test prose records a band that never existed on disk** — `test/run-wave-test.mjs:23-24, 32-33, 89-90, 152`; `test/sighting-wave-smoke.md:57-58`
*Claim:* "(still 32)", "--band live refuses with `apply_not_landed` while the floor is still 32", "the live config still enforces the pre-apply 32-100 band"; *Contradiction:* live floor is 16; the `apply_not_landed` guard (:458) is delta-relative and observed never to fire (`--band live` exits 0, 60 checks); "32-100" describes only the transient clobber/HEAD state; *Evidence:* `node test/run-wave-test.mjs --band live` → EXIT 0; `git show` of parent blob shows `waveMinLanes 16`. [TestRunner, SmokeDoc]

**F14 · IMPROVE · band hardening gaps in the validator echo and launcher gate**
`scripts/ufo-swarm-wave.mjs:1242-1243` emits raw `policy.waveMinLanes/waveMaxLanes` rather than the *enforced* `laneFloor/laneCeiling` (an injected `waveMaxLanes 150` admits 40 but reports 150); `sighting/tower-fleet.mjs:131-136` has no `roundLaneCeiling`↔`waveMaxLanes` cross-check and renders unclamped numbers; `host/apply.mjs:377` bounds `maxConcurrentL1` only as positive (no upper bound anywhere); `host/apply.mjs:378-381` merges `swarm.minLanes` without the `positiveInt` gate it claims. [ValidatorPolicy, LauncherAuthority, ApplyDispatchGate, ApplyMirrorGate]

**F15 · DRIFT · dangling skill reference in the L1 prompt** — `sighting/l1-prompt.md:22`
*Claim:* load-order step 4 mandates reading `skill://wwkd`; *Contradiction:* `read skill://wwkd` → `Unknown skill: wwkd. Available: godspeed, omarchy, swarm, tower`; the stance is inlined at `:51-53` (fail-soft) and the substrate CHANGELOG admits it is "absent on fleet hosts"; `fleet-dispatcher.mjs:5379` repeats the instruction; *Evidence:* the resolution error observed in this session. [PromptTemplate]

**F16 · NOTE · below-floor / resume prose imprecision**
`sighting/l1-prompt.md:57-59` says "N < `{{waveMin}}` is executed directly" without naming the `too_few_lanes` refusal or the resume-only exemption; `.omp/skills/swarm/SKILL.md:68-69` says resume-only waves are exempt from *the floor* while the validator exempts them from the *whole band* (`ufo-swarm-wave.mjs:989/998/1004` are spawn-gated; only the cap at `:995` applies) — observed: 40 resume-only lanes pass all band gates. Also `SKILL.md:36-37` "fold a short tail into the previous wave" is inadmissible at a 32-packed predecessor (N=36 has no fold-legal split). [PromptTemplate, SkillSwarmOmskills, ValidatorPolicy]

**F17 · NOTE · render internals** — `sighting/tower-fleet.mjs:291, 293, 297`
Placeholder regex `/\{\{([A-Za-z]+)\}\}/` cannot match digit-bearing names; `values.l1Alias` is provided but has no `{{l1Alias}}` consumer (current render clean; a future `{{maxConcurrentL1}}` line would ship literal braces past both substitution and the leftover guard); `status --json`/`launch --json` omit the band block, so no launcher verb surfaces live-vs-launch drift after the clobber (the wall CLI's only band leaf is `surface.mjs:249` → `caps.swarmMaxLanes`). [LauncherRender, WallCli]

**F18 · NOTE · the apply wave-band gate is live-band-blind** — `host/apply.mjs:540-620, 67-74, 553-556`
Dry run passes (EXIT 0, nothing written) and probes 16/32 correctly against the *injected* post-apply policy; but the real-CLI leg probes one hardcoded width (32), which is admitted under both live 16–32 **and** clobbered 32–100 — so the gate produced identical PASS verdicts across the clobber, and its comment "(live band 32-100 pre-apply)" no longer matches disk. The operator directive it cites ("dispatched in swarms of 16-32, up to 100 per round") is absent from the substrate directive. [ApplyBandGate, ApplyHeader, TestRunner, ApplyMirrorGate]

**F19 · NOTE · recorded evidence is era-consistent but mis-stamped**
ompskills `test/evidence/wave-*/manifest.json` bind stale band tuples and a 16-hex truncated config sha (`wave-20261008T191554Z` prefix does not match live); top-level `swarm-registry.json` copies are pre-record snapshots (0/32 agentIds) vs the authoritative lane-report copy. Substrate `evidence/` is git-clean and historically fenced; its only present-tense stale band claim is `nightcall-integration/nc2-verify-v4-r5/ReplayIdempotencyScoutR5.md:13` ("the live value is 100… `waveMaxLanes`"). [EvidenceRecords, EvidenceArchiveUfo]

## 3. What is consistent (falsifiable)

- Delta `host/ufo-sighting-dispatch.json` == live config on all 6 band keys; the merge is presently a no-op (all edits classify "unchanged").
- `sighting/tower-fleet.mjs` reads all six authority fields via `need`+`intOf` (rejects negatives/floats/strings), refuses an inverted band, and renders `{{waveMin}}–{{waveMax}}`/`{{roundLaneCeiling}}` from live values — no hardcoded band digits; the fleet launch record (`fleet.json`) band == live.
- Launcher ceilings wired to the right keys: `L1_CEILING_EXCEEDED` ← `dispatch.maxConcurrentL1` (16), panes ← `sighting.windowPaneCeiling` (16); live 16 missions == both ceilings.
- `.omp/skills/tower/SKILL.md` and `.omp/skills/swarm/SKILL.md` (this repo) carry **no** hardcoded band numbers / carry 16–32–100–16 that match live; the tower skill's "approved table is three (`m_strong`, `m_mid`, `m_fast`)" is accurate for all 14 seats.
- Validator: `MAX_SWARM_LANES 100` == live `maxLanes`; `MIN_SWARM_LANES 2` is an omit-fallback only; check order `impossible_band > too_many_lanes > too_few_lanes > wave_too_wide`; all refusal messages interpolate the enforced floor/ceiling (only the header prose at `:11` is stale).
- `ufo-swarm-wave.test.mjs` passes 98/98 under both band states (12 band fixtures are injected, none asserts the live file) — i.e. it cannot detect F1.
- `test/tower-fleet.test.mjs` passes and is fully config-relational; `test/run-wave-test.mjs --band live` passes 60/60.
- The wall CLI carries no lane band; `scripts/omp-wave-context.mjs` and `config/l1-max-context.yml` carry none; `config/mission-nightcall.yml:3` "# sequential 16-32 lane waves" matches live.

## 4. Verification gaps (honest)

- `ApplyClosing` (apply.mjs:620-1025 closing/probe leg) did not publish before integration; its surface is covered by `ApplyBandGate`'s verbatim gate output and `ApplyHeader`/`ApplyDispatchGate`. Lane exhaustion, not saturation.
- `ufo-stale-watchdog.test.mjs` (F12) and the 32-100 CLI leg of `run-wave-test.mjs` were **not executed** (they write substrate temp dirs / the state no longer exists); F12 is derived from the assertion's exact inputs.
- Lanes had no LSP device; semantic claims rest on exhaustive grep + targeted reads.
- No lane ran `--apply` or any write to the substrate (read-only constraint held).

## 5. Round-1 disposition

Accepted as findings only (audit mission): the report is the deliverable; no code is changed. The single highest-value chain break is **F1** (authority state lives uncommitted while HEAD commits a dead band) — closing it is a substrate commit, outside this mission's `reports/tf-audit-band.md` scope. F2–F12 are the actionable prose/guard fixes, each already named with file:line.