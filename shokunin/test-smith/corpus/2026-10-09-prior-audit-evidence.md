# 2026-10-09 — the prior audit reports as evidence

**Asked.** What do `reports/tf-probe-band.md`, `reports/tf-safety-r2.md`, and
`reports/tf-audit-band.md` prove, what evidence do they carry, what limits do
they state, and which findings are still live at HEAD? (Lane
`PriorAuditEvidence`, reviewer.)

**Observed.** Sources: the three reports; current source for the fixes; the
suites re-run by the lane.

- `tf-probe-band` (§1-3, §5-6): proves the 16-point band chain coherence
  (16-32 / cap 100 / minLanes 16) and the mid-mission live-authority flap —
  three substrate writes in 17 min (apply 01:14:17Z; rollback 01:22:15Z sha
  `7efc813b…`/size 12000; re-apply 01:30:57Z sha `0e416f0a…`/11999), with the
  rollback forensically attributed to the sibling `tf-band` symlinked scratch
  root (`Bun.write` following `config/ufo.json` into the live file). Evidence:
  a 10-artifact sha256 pin table at `97e22a4`, wave receipt counts/policy, the
  five-edge re-probe 01:35:20Z, a reproduce block. Limits it states: the
  re-apply is unattributed; no live-authority claim is stable without sha +
  window; `maxLanes` 100 is enforced per-wave, not per-round.
- `tf-safety-r2` (whole): proves safety-F1 HIGH symlink write-through (4
  derived write targets escaped to `<ufoRoot>`, exit 0 `ok:true`, including a
  prompt clobbering the band authority; full reproduction script; root cause
  "`realpathDeepest` not applied below the roots"), F2 scope-dot gate slip, F3
  cosmetic close mislabel, plus a 16-row HOLDS matrix. Self-stated limits:
  stubbed wall, planted-symlink vectors only, the TTY refusal leg unreachable,
  bind-mount/TOCTOU not exercised; the parent remediation closes F1-F3 with a
  residual "static symlink containment, not race-free capability confinement".
- `tf-audit-band` (headings + verdict): the omskills side is consistent; the
  drift is substrate-side — HEAD commits a dead band (audit-F1) while disk
  carries the uncommitted 16-32; three stale prose generations (A/B/live); a
  chain map; 20 findings in claim/contradiction/evidence format with
  `[INFERENCE]` labeling. F19 matters to the evidence discipline:
  `test/evidence` manifests pin stale band tuples and 16-hex truncated config
  shas — recorded evidence is era-bound, never present-tense.
- Live at HEAD — fixed: safety-F1 (`assertSafeWriteTarget`
  `sighting/tower-fleet.mjs:257` refuses dangling/symlink-leaf/resolved-outside-root;
  preflight `assertLaunchWriteTargets:708` before wall open `:714`; write-site
  rechecks `:697/:727/:797/:835/:837/:906`); safety-F2 (`normalizeScopePath:179-180`
  refuses `.` and embedded dot segments); safety-F3 (`wallRowDisposition:571-572`
  + disposition tags `:975-976` used at close `:1203/:1206`); the probe-band
  `plan.floorBoundary` tautology removed (cap/floor literals now cross-checked
  by `negative.authorityConstants`, `test/run-wave-test.mjs:723`).
- Regression verified by the lane: `node test/tower-fleet.test.mjs` → exit 0
  `ALL CHECKS PASS` (five symlink probes §37 `:1631-1682`, refusal before the
  wall stub); `node test/run-wave-test.mjs --band live` → exit 0, 93 checks
  (the report-era count was 60/61 — counts drift, band values stable).
- Residual: no `O_NOFOLLOW`/`openSync` in the launcher — the check-then-write
  TOCTOU remains exactly as the remediation states; the safety claim is static
  symlink containment only.
- Still live: probe-band point-1 gap — `host/apply.mjs:377-381` `positiveInt`
  gates `maxConcurrentL1`/`waveMinLanes`/`waveMaxLanes`/`maxLanes` but NOT
  `swarm.minLanes` (audit-F14); audit-F1 (substrate) — `config/ufo.json` disk
  16/32/16 vs HEAD `5ace2559` 64/32/100, `git status ' M'`, sha `0e416f0a…`
  unchanged since 01:30:57Z, 9 stale `.bak` files, so any checkout re-clobbers;
  audit-F4/point-14 incidental prose — `host/omp-agent.config.yml:190` "32-100
  per wave", `:197` "raised from 16 to 32" (direction inverted); audit-F13 —
  `run-wave-test.mjs:23-24` "floor is still 32" still present (usage text
  `:167` corrected); audit-F8 — substrate `ufo-swarm-wave.mjs:11` "At most 100
  lanes per wave" live by text; audit-F12 — `ufo-stale-watchdog.test.mjs:317-318`
  asserts `/16-100 lanes per wave/` (live by text, not executed); probe-band §5
  round-ceiling gap — no cross-wave accounting found; always-pass printouts
  remain (`run-wave-test.mjs:468` `band.live`, `:485/:510` `band.authority`,
  `:511` `band.fixture`).

**Changed.** Nothing — read-only research; the substrate was read-only held
(config sha unchanged).

**Unknown.** Substrate prose findings F5/F6/F7/F9/F10/F11 were not re-checked at
substrate HEAD; validator internals were not re-derived; `--live-wall` and the
stale-watchdog test were not executed; no LSP device was used (direct source
reads/tests are the fallback basis).
