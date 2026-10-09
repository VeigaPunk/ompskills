# Audit — UFO Sighting wall integration (`tf-audit-wall`, round 1)

Mission `tf-audit-wall`, fleet `tower1`, axis `audit-wall`. Scope: the **wall
integration** of the tower fleet — fleet window, per-window pane ceiling,
interactive TTY of launched L1 panes, `peek`/`steer`/`complete`/`remove`, and the
global `maxConcurrentL1` bound. Read-only in both checkouts this mission does not
own; the only file this mission ships is this report.

This is a findings document. **No source was changed** — every defect below is
reported with the evidence that grounds it, not patched (mission scope is
`reports/tf-audit-wall.md`).

Audited carriers:

| carrier | identity |
| --- | --- |
| tower worktree | `/home/vgpnk/Projects/ompskills/.tower/worktrees/tower1/tf-audit-wall` @ `3dee5685` (mirror of repo `main`) |
| substrate | `/home/vgpnk/Projects/ufo-fsd-alpha` @ `5ace2559`; `scripts/ufo-sighting.mjs` sha256 `5e8ea127…d19e` (4714 lines), `ufo-sighting-lib/base.mjs` `64c843ee…` |
| live band authority | `config/ufo.json` sha256 `0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3`, mtime `2026-10-08 22:30:57 -0300` (windowPaneCeiling 16, maxConcurrentL1 16, globalRunnerCeiling 1056, wave 16–32, L1 alias `m_strong`) |
| hermetic harness used by L1 and lanes | `tests/helpers/ufo-sighting-fixture.mjs` (`fixture()`, `pinnedCeilingFixture()`), `tests/ufo-sighting.test.js`, `tests/ufo-sighting-wall-heavy.test.js` |

## Axis set (round 1, dynamic)

`fleet-window` · `pane-ceiling` · `interactive-tty` · `wall-verbs` ·
`l1-bound` · `doc-truth`.

Round 1 ran one validated wave, **`tf-audit-wall-r1` = 32 lanes** (band `16–32`
per wave, 100 per round; roles `scout 5 · reviewer 11 · mutation-tester 4 ·
connector 4 · sentinel 3 · critic 3 · revenger 1 · simplifier 1`). Every lane was
a leaf, read-only in both checkouts, sandboxed to its own tmux socket and `/tmp`
scratch, and wrote one report to
`.tower/fleets/tower1/reports/tf-audit-wall/<Lane>.md`.

Method: WWKD data walk on the real code → one real case end-to-end by the L1
(own fixture launches, fd probes, pinned-ceiling boundary) → generalize into the
32-item wave → judge each lane's claim against its quoted evidence, re-running
the load-bearing ones here (F1, F2, F6-R3 below were reproduced by the L1).

## Verdict by dimension

| dimension | verdict | basis |
| --- | --- | --- |
| fleet window | **sound in the normal case; one injection-class defect** | one lazily-created window per fleet, exact name, marker-bound panes, teardown when the fleet empties (V1) — but an all-digit fleet name mis-targets tmux (F1) and teardown can kill foreign panes in stale-marker states (F3) |
| pane ceiling | **enforced; one fail-open consumer** | 6 comparison sites, all pane-creating paths guarded (lanes 07/09); dispatcher defaults the key instead of failing closed (F7) |
| interactive TTY | **sound** | mission process inherits the pane pty (V2, lane 13) — with a launcher argv-injection hole on `base` (F2) |
| wall verbs | **sound; five honesty/robustness notes** | all four verbs locked, identity-proved, literal-delivery only (lanes 19–24) — F5, F6, F9, F11 below |
| `maxConcurrentL1` | **enforced, with a declaration/runtime gap** | boundary proven at 2 (V3) and at 16 (lane 28); the launcher gates declarations, the wall gates live rows (F4) |
| doc truth | **drifted** | band incident + unasserted mirrors (F8), plus smaller stale claims (F10, F11) |

## First-hand evidence (L1)

### V1 — fleet window: one window per fleet, exact name, lazy, torn down

Two missions launched with `--fleet auditfleet` into a hermetic wall:

```
windows:  1  fleet       1 pane      # default wall window (index 1)
          2  auditfleet   2 panes     # fleet window: %1 and %2, both __pane-run-marked
default window panes: %0 (idle keeper)
after completing both:  1 fleet       # the fleet window is gone
```

`ensureFleetWindow` (`scripts/ufo-sighting.mjs:1129-1160`) creates it with
`new-window -d -t ufo_sighting: -n <fleet> node <MODULE> __idle`; the first
mission adopts the keeper's pane with `respawn-pane -k`, later ones `split-window`
inside the same window (`:2263-2272`). Lane `FleetWindowReviewer02` and
`FleetWindowMutator03` reproduced this independently, including a mutant arm
(`split-window` → `new-window`) that the same detector killed, so the observation
is not vacuous.

### V2 — the mission process in a pane really has a TTY

A mission whose command ran fd probes (reported through fd 3, so no
command-substitution artifacts) recorded:

```
isatty_stdin=yes  isatty_stdout=yes  isatty_stderr=yes
fd0=/dev/pts/32   tty=/dev/pts/32    fd2=/dev/pts/32
tmux=/tmp/tmux-1000/ufo-sighting-test-…, mission=m_3054ee16…, pwd=<wall ROOT>
```

`runPane` spawns the mission command with `stdio: "inherit"` (`:4336-4372`).
Lane `InteractiveTtyScout13` corroborated with `node` `isTTY` (all three fds on
the pane pts), `capture-pane`, a `/dev/null` control, and pane `tpgid`/`pgid`.
`pwd` was the wall ROOT only because my probe omitted `--cwd`; the fleet launcher
always passes `--cwd <worktree>`.

### V3 — the L1 bound is enforced before pane creation

Wall copied to `/tmp` with `maxConcurrentL1` pinned to 2 (`pinnedCeilingFixture`):

```
launch 1 → exit 0, l1=1        launch 2 → exit 0, l1=2
launch 3 → exit 2 {"code":"L1_CEILING_EXCEEDED","message":"global L1 mission ceiling is 2",
                   "details":{"ceiling":2,"active":2,"headroom":0,"fleet":null}}
complete --mission <id> → l1=1 ;  launch 4 → exit 0, l1=2
```

Lane `L1BoundReviewer28` drove the same boundary at the live value 16 across two
fleets (16 admitted, 17th refused with `ceiling 16/active 16/headroom 0`, zero
manifest mutation). Completed/stopped rows consume zero.

### V4 — reproduced `FAIL` mechanisms (L1-executed)

- **F1 (digit fleet name):** with an isolated tmux server holding windows
  `1:"1"`, `2:alpha`, `3:"2"`, `4:beta`, `tmux -t 'ufo_sighting:=2'` resolved to
  **window index 2 (`alpha`)**, not to the window *named* `2` (`:=beta` resolved
  correctly, `:=1` to index 1). tmux resolves `:=<digits>` by index.
- **F2 (`base` injection):** `omp worktree add -C /tmp/vg-l1/repA -b tower/probe
  /tmp/vg-l1/wt --cwd=/tmp/vg-l1/repB` exited **0** and created the worktree and
  branch `tower/probe` in **repB** — the `--cwd=` token overrode `-C`.
- **F6-R3 (dead unlocked branch):** `paneOptionValue` has exactly one occurrence
  in the substrate (`scripts/ufo-sighting.mjs:4487`, a call) and no definition
  anywhere, so the overview self-mark branch throws `ReferenceError` into a
  `catch { /* display-only */ }` — never executed.

## Findings, ordered by severity

### F1 — HIGH — an all-digit fleet name mis-targets every fleet-scoped tmux command (lane `FleetWindowSentinel04`, FAIL; mechanism reproduced by L1)

`windowTargetFor` builds `ufo_sighting:=<fleet>` (`base.mjs:287-289`) and tmux
resolves `:=<digits>` **by window index**. The admitted grammar
`^[a-z0-9][a-z0-9_-]{0,47}$` (`base.mjs:31`, launcher `tower-fleet.mjs:68`)
accepts `2`, `12`, `1`. Consequences named by the lane and traced in code:
`split-window` for mission panes (`:2275/:2280`), `listPanes` judgement
(`:1160/:1803/:2229`) and `kill-window -t windowTargetFor(fleet)` (`:1179`) all
inherit the mis-target, so a fleet named `2` can place panes in and **tear down a
different window**, and a fleet named `1` addresses the default wall window.
Remediation: refuse all-digit names in both grammar copies, or address fleet
windows by `window_id` (`@N`) after `findWindowByName`.

### F2 — HIGH — `spec.base` is an option-injection hole into `omp worktree add` (lane `InteractiveTtySentinel16`, FAIL; reproduced by L1)

`loadSpec` only does `String(raw.base).trim()` (`tower-fleet.mjs:249`), and
`verbLaunch` passes it as the last positional of
`omp worktree add -C <repo> -b <branch> <worktree> <base>` (`:511-517`). A spec
`base: "--cwd=/other/repo"` is consumed as omp's own flag (last-wins): the
worktree **and** the new branch are created in an arbitrary git repo — including
`ufoRoot`, which the launcher's own header claims it never edits. Lane runs
against omp/18.8.6 observed exit 0 with `Cloned from … via reflink`; `--detach`
silently drops the declared base. Remediation: pattern-gate `base` like
`maxTime`, verify with `git rev-parse --verify '<base>^{commit}'`, and pass
`["--", base]`.

### F3 — MEDIUM — `killFleetWindowIfEmpty` can destroy panes that are not wall-owned (lane `FleetWindowReviewer06`, FAIL; observed)

With the guard chain enumerated (`:1156-1178`), two stale-marker states defeat the
"safe-every" predicate: (B) a live foreign pane wearing a mission marker whose
row was pruned by `pruneStoppedMissions` (`MAX_STOPPED_MISSIONS=100`, runs
immediately before settle-kill), and (C) a live foreign pane on a legacy stopped
row with no `panePid` (allowed by `validateMission:195-197`). In both, the window
was destroyed and foreign pids died; two control scenarios (live unmarked foreign
pane; stopped row with mismatched panePid) correctly blocked teardown. The same
stale-marker rule is shared by `applyLayout`, `settleWallGeometry` and spawn
adoption, so this is consistent-by-design rather than unique to teardown. Residual:
no re-enumeration between the `listPanes` snapshot (`:1160`) and `kill-window`
(`:1179`) — a TOCTOU window for raw tmux clients.

### F4 — MEDIUM — the launcher's gate is declaration-time, and one abort path loses the record (lane `L1BoundCritic29`)

`sighting/tower-fleet.mjs` refuses `declared > maxConcurrentL1` (`:199-201`) but
never consults the **live** count; the wall refuses the k-th launch when
`A + k > C`. The L1-refusal path is recorded honestly (panes kept, per-mission
`{code:"LAUNCH_FAILED"}` rows, `fleet.json` with `ok:false`, exit 2
`LAUNCH_PARTIAL`, `:479-600`). But `typed("WORKTREE_ADD_FAILED")` (`:518-520`)
and `COMMAND_MISSING` throw **before** the only `fleet.json` write (`:559`):
demonstrated with the real tool — exit 2, one pane live, `fleet.json` absent, so
that pane and its prompt are unrecorded. Fan-out drops the wall's structured
`details{ceiling,active,headroom}` too.

### F5 — MEDIUM — `remove` by run-id can destroy a *newer* mission (lane `WallVerbsReviewer21`)

Run-ids are unique only while a row exists (`:2215`) and ids are fresh UUIDs
(`:2068`), while `remove` accepts a run-id identifier. Demonstrated: remove W, the
same run-id is relaunched as a new mission id, then the retried
`remove --mission W` silently killed the new mission (exit 0, `removed:true`).
`surface.mjs:119` advertises `idempotent: true`, which overstates the guarantee
across a remove→relaunch boundary. `remove`'s envelope also names nothing
(`:4624`) and there is no typed refusal for an unknown id (exit 0,
`removed:false`) — confirmed by L1 (V4/V5) and lane 24.

### F6 — MEDIUM — three lock/identity gaps, one of them dead code (lane `WallVerbsCritic25`, FAIL)

- **R1**: the ephemeral-marker rollback writes mission state **outside** the lock
  (`:2429`, `:2443`) because `withOperationLock` releases in its own catch
  (`:798-800`) before the caller's catch runs; `runPane` does the same
  transitions with no lock at all (`:4361/:4367/:4391`).
- **R2**: `stopMission` re-proves only the row id (`:3587`), never `panePid`, so
  a late stop from a dead attempt can stamp a resumed row.
- **R3**: the overview verb's self-mark block (`:4486-4496`) is an unlocked
  display mutation **and** dead — `paneOptionValue` is undefined (L1 verified),
  the `ReferenceError` is swallowed, and `surface.mjs` mis-declares the verb as
  render-only.

All other mutating paths were found fully covered (launch/resume/complete/remove/
steer/peek/reconcile/twin/register and every `writeManifest` site inside
`withOperationLock`).

### F7 — MEDIUM — `fleet-dispatcher` fails **open** on a missing `windowPaneCeiling` (lane `PaneCeilingConnector11`, FAIL)

`loadDispatchPolicy` (`fleet-dispatcher.mjs:3738-3745`) defaults
`resolvedWindowPaneCeiling = 16` when the key is absent, while `base.mjs:159-162`,
`sync-ufo-contracts.mjs:1151-1153` and `tower-fleet.mjs:128` all fail closed on
the same absence. With the key dropped the wall refuses to boot yet the
dispatcher still grants 16 panes of fleet headroom (`:8048`) — exactly the hazard
its own S-10 comment names for `maxConcurrentL1`.

### F8 — MEDIUM — doc/config drift around the bounds (lanes `L1BoundConnector30` + `L1BoundScout27` + `DocTruthRevenger31`, FAIL)

- `crates/ufo-core-runtime/bundled/config.json` still says `maxConcurrentL1: 32`
  against the live 16, and `node scripts/sync-ufo-contracts.mjs --check` is
  **RED** (`cmp` differs at line 79; `apply.mjs:93` defers the mirror by design).
  The stale bundled file also feeds `build.rs`/`lib.rs`, which compile L1 alias
  `m_daybreak` while live routes `m_strong`.
- `AGENTS.md:204` and normative `run-logic.md:2285` (+ packaged mirrors) still say
  "at most 32 live L1s" with **no** assertion; `host/omp-agent.config.yml:203`
  `maxConcurrency: 32` is a *different subject* (concurrent L2 lanes per host
  session), not the L1 bound.
- The band incident: between 01:22Z and 01:30Z the live file carried the
  substrate **git HEAD** band `minLanes 64 / waveMinLanes 32 / waveMaxLanes 100`
  (restored byte-exactly with no backup); at `22:30:57 -0300` an apply re-set
  `16/16/32/100`. A pane launched inside that window is told a band that makes
  the validator refuse its 16-lane wave (`too_few_lanes`), and padding to that
  foreign floor is forbidden by the same prompt. This mission's own wave was
  dispatched in that window at 32 lanes — legal under both readings — and was
  re-validated after the restore (`plan` exit 0, 32 spawn lanes, policy
  `source: config`, `waveMinLanes 16`, `waveMaxLanes 32`).
- `test/run-wave-test.mjs:458-463` is the only delta↔live "apply landed"
  assertion and it keys on `waveMinLanes`, which was 16 both before and after the
  apply — a vacuous gate that never touches `maxConcurrentL1`.

### F9 — LOW-MEDIUM — `--text`/`--note` accept line separators and bidi controls despite the documented `singleLine`/`printable` contract (lane `WallVerbsSentinel26`, FAIL)

Bounds are exact (steer `--text` 4096/4097 pass/refuse; `--text-file` 65536 cap
with no partial read; `--note` 4096; `peek --lines` clamp 1–400; inquiry 1 MiB),
all C0/C1 refused, NUL impossible. But `validateSteerLine` (`:3467-3477`) and
`validateCompletionNote` (`:3192-3201`) cover only `\x00-\x1f\x7f-\x9f` plus
`\n\r`, so U+2028/U+2029/U+202A-E/U+2066-9 are **accepted** and persisted raw
(pane input observed; `finalNote` in the manifest observed), contradicting
`surface.mjs:106,131` (`singleLine: true`, `printable: true`),
`sighting-wave-smoke.md:296`, and the house doctrine in `assertSafeText`
(`base.mjs:315-325`). Invalid UTF-8 in `--text-file` is silently U+FFFD-replaced.
Impact: display-layer spoofing and doctrine drift, not injection.

### F10 — LOW — the launcher's interactivity guard is unwitnessed, and two test-coverage holes (lanes `InteractiveTtyMutator15`, `InteractiveTtyReviewer14`, `DocTruthSimplifier32`)

`interactiveGuard` (`:305-317`) scans argv for `-p`/`--print`/`--mode[=…]`, but no
spec field can reach an omp token position, so the guard's reject branch is
**unreachable by construction** — a mutant that disables it survives both the
shipped suite (73/73 PASS) and a crafted probe. Likewise the `maxTime` guard has
no suite case (a mutant survives the suite, and is killed only by a crafted
probe). The `--cwd` equality assertion at `:334` compares the same variable
assigned at `:323` (tautological). All three are defense-in-depth, not live
holes.

### F11 — LOW — verb and doc-truth nits worth a sweep

- `complete --mission <unknown>` against an empty wall reports
  `MISSION_NOT_FOUND` ("no active manifest"), while `remove` reports
  `removed:false` exit 0 — two different honesty levels for the same failure (L1,
  lanes 24/21).
- A 4096-byte `steer` into a **canonical-mode** pane child loses its final byte in
  the tty (kernel canonical-input limit) while the CLI returns `ok` and records
  `lastSteerBytes=4096`; raw-mode TUI panes are unaffected. `steerSendText`
  (`:3481-3487`) also over-escapes text ending in a backslash-run + `;` (fidelity
  only, never a command) (lane `WallVerbsReviewer23`).
- Dispatcher-side divergences from the launcher (lane `InteractiveTtyConnector18`):
  `--max-time` hardcoded `3h` (`fleet-dispatcher.mjs:8495`); the resume argv has no
  `--cwd`, so every `nativeSessionId` dispatch is wall-refused; the inline-prompt
  bound (120 KiB) exceeds the wall's per-arg cap (65,536 chars).
- Stale prose/lines: `tower/SKILL.md:51-54` claims the *fleet renderer* prepends
  `/skill:godspeed` (the launcher has no such logic — it is template text in
  `l1-prompt.md`); `.omp/hooks/pre/ufo-l0-monitor.js:46-47` cites
  `ufo-sighting.mjs:39` for `FLEET_NAME_PATTERN`, which now lives at
  `base.mjs:31` (lane `FleetWindowConnector05`); `sync-ufo-contracts.mjs:1195-1196`
  cites `ufo-sighting.mjs:167`/`fleet-dispatcher.mjs:3028` where the real requires
  are `base.mjs:166-168`/`fleet-dispatcher.mjs:3749-3751`.

## Round-1 lane ledger

32 lanes, one falsifiable claim each. `PASS` = the claim survived the evidence
gathered; `FAIL` = refuted (a defect above). Reports live at
`.tower/fleets/tower1/reports/tf-audit-wall/<Lane>.md`.

| lane | role | item | verdict | what it established |
| --- | --- | --- | --- | --- |
| `FleetWindowScout01` | scout | fw-01 code map | PASS | hop map `launch --fleet` → pane with verbatim tmux argv; keeper is `node … __idle` until adopted by `respawn-pane -k`; hatch attaches `ufo_sighting:1` (the default window), never the fleet window |
| `FleetWindowReviewer02` | reviewer | fw-02 invariants | PASS | lazy creation, exact naming, index-1 collision refusal (`--fleet fleet` → `INVALID_ARGUMENT`), reuse, `FLEET_WINDOW_AMBIGUOUS` — all run |
| `FleetWindowMutator03` | mutation-tester | fw-03 one window, two panes | PASS | two panes in one window; teardown after the last completion; a `split-window`→`new-window` mutant was killed by the same detector (non-vacuous) |
| `FleetWindowSentinel04` | sentinel | fw-04 fleet-name surface | **FAIL** | 44 invocations: option/format/path injection all held, but `:=<digits>` index resolution makes digit-only fleet names mis-target → **F1** |
| `FleetWindowConnector05` | connector | fw-05 carrier parity | PASS | five fleet-name grammar copies are `.source`-identical, 0 divergence over 22 adversarial inputs; validation precedes tmux; hook comment cites a stale line |
| `FleetWindowReviewer06` | reviewer | fw-06 teardown guards | **FAIL** | two stale-marker states let `kill-window` destroy foreign panes (pids observed dead); controls blocked → **F3** |
| `PaneCeilingScout07` | scout | pc-07 enforcement map | PASS | exactly 6 ceiling comparisons in the wall, 0 in the lib; 12 guard invocations; `PANE_CEILING_EXCEEDED` shadowed by the L1 gate when `maxConcurrentL1 ≤ windowPaneCeiling` |
| `PaneCeilingReviewer08` | reviewer | pc-08 grid vs cap | PASS | real runs: caps 15/18/16, grid 3×6=18; a full fleet layout has no 17th/18th cell; the 17th launch is refused |
| `PaneCeilingCritic09` | critic | pc-09 uncapped paths | PASS | all four guard sites (launch/resume/twin/register) exercised for real; fleet charged `windowPaneCeiling`, default charged the geometry cap; only unguarded pane creator is the non-mission overview strip |
| `PaneCeilingMutator10` | mutation-tester | pc-10 boundary probe | PASS | cap-2 mutant: 3rd launch `CAP_EXCEEDED` with the window/rows unchanged; at live 16 the L1 gate masks `CAP_EXCEEDED`; the wall has **no** config-path override (only `spec.ufoRoot` at the launcher layer) |
| `PaneCeilingConnector11` | connector | pc-11 consumer parity | **FAIL** | 15 consumers read the right key; the dispatcher alone defaults it instead of failing closed → **F7** |
| `PaneCeilingReviewer12` | reviewer | pc-12 fleet accounting | PASS | reported fleet occupancy counts pane-attested live rows only; ghost/remain-on-exit/foreign-pane states make reporting diverge from physical panes (with `FOREIGN_PANES` refusals); enforcement itself is not bypassable because launch reconciles first |
| `InteractiveTtyScout13` | scout | it-13 pane TTY path | PASS | `stdio: "inherit"` child has all three fds on the pane pts (`node` `isTTY`, `tpgid==pgid`, capture-pane, `/dev/null` control) despite `-d` and zero clients |
| `InteractiveTtyReviewer14` | reviewer | it-14 guard | PASS | 6 hostile specs refused, 2 adversarial specs emit template-exact argv; real `parseOmpArgv` accepts it and rejects `-p`/`--print[=x]`/`--mode[=v]`; `--cwd` assertion is a self-comparison (F10) |
| `InteractiveTtyMutator15` | mutation-tester | it-15 test witness | PASS | suite 73/73; guard and `maxTime` mutants survive the suite (F10); refusal table reproduced |
| `InteractiveTtySentinel16` | sentinel | it-16 spec-field injection | **FAIL** | `base` is ungated → `omp worktree add` option injection (L1-reproduced); spec paths are emitted unquoted into the rendered prompt and `close` advice; `title`/`axis`/`goal` are ungated prose → **F2** |
| `InteractiveTtyReviewer17` | reviewer | it-17 relay / no-open | PASS | `--relay` is provenance/display-only with zero behavioral consumers; `--no-open` only skips the attach after the pane exists; sandbox showed a live pty with zero clients and bidirectional keys |
| `InteractiveTtyConnector18` | connector | it-18 argv parity | PASS | three producers join token-for-token apart from named divergences; prompt is an `@file` argument (live pane transcript confirms) → dispatcher notes in **F11** |
| `WallVerbsScout19` | scout | wv-19 surface map | PASS | usage lines == `rejectUnknownOptions` sets for all four verbs; no advertised verb is unimplemented |
| `WallVerbsReviewer20` | reviewer | wv-20 complete semantics | PASS | dry-run writes nothing (manifest sha identical); idempotent; capture always null so a dead pane never blocks; 51-cycle run evicts the oldest beyond 50; completion releases one L1/runner/pane slot and consumes none |
| `WallVerbsReviewer21` | reviewer | wv-21 remove semantics | PASS | row deleted with zero history vs `complete`'s frozen history; idempotent `removed:false`; capacity released; stale run-id retry destroys the relaunched mission → **F5** |
| `WallVerbsReviewer22` | reviewer | wv-22 peek binding | PASS | capture only after live-ownership proof; `--lines` 0/negative→1, 401+/1e9→400, unset→80, hex/float refused; `DEAD_PANE`/`MISSION_NOT_LIVE` refusals with zero captures |
| `WallVerbsReviewer23` | reviewer | wv-23 steer delivery | PASS | literal-only delivery proven (`-l --`, one argv token, pane echoed `; `/`C-c`/`M-x` literally with the pane alive); 4096/4097 boundary; `PANE_IN_MODE`/`DEAD_PANE` refusals; canonical-mode final-byte and over-escape notes in **F11** |
| `WallVerbsMutator24` | mutation-tester | wv-24 refusal census | PASS | 16-case refusal census (typed JSON, no raw stacks) plus live success paths and post-completion `MISSION_NOT_LIVE` |
| `WallVerbsCritic25` | critic | wv-25 lock/identity | **FAIL** | three counterexamples (unlocked rollback, weak stop identity, dead unlocked overview self-mark) → **F6** |
| `WallVerbsSentinel26` | sentinel | wv-26 text bounds | **FAIL** | bounds exact, but U+2028/bidi accepted and persisted where the schema claims `singleLine`/`printable` → **F9** |
| `L1BoundScout27` | scout | l1-27 consumer map | PASS | 39 consumer rows with provenance classes; bundled mirror differs (`cmp` line 79); plan 17 → `L1_CEILING_EXCEEDED`, 16 → ok |
| `L1BoundReviewer28` | reviewer | l1-28 live-count rule | PASS | counted set `{starting, running}`, fleet-agnostic; 17th launch refused with zero mutation; global across fleets; a stopped row frees headroom at the next verb |
| `L1BoundCritic29` | critic | l1-29 declaration vs runtime | PASS | the gap is real but the L1-refusal path records partial state; `WORKTREE_ADD_FAILED` does not → **F4** |
| `L1BoundConnector30` | connector | l1-30 mirror drift | **FAIL** | bundled config / `AGENTS.md` / `run-logic.md` drift, vacuous apply gate, `maxConcurrency` ≠ `maxConcurrentL1` → **F8** |
| `DocTruthRevenger31` | revenger | doc-31 band drift | PASS | provenance reconstruction of the clobber/restore timeline plus validator edge probes (16 admit, 33 refuse; 16 refused under the HEAD band) → **F8** |
| `DocTruthSimplifier32` | simplifier | doc-32 dead weight | PASS | candidates only (A1-A6 unreachable, B1-B2 prose contradictions, C1-C7 unasserted duplicates); none ratified as deletions |

Judge's disposition: **25 PASS accepted as evidence, 7 FAIL accepted as findings**
(F1-F9 above carry their evidence). Lane `DocTruthSimplifier32`'s A/B/C candidate
lists are recorded as *candidates*, not ratified deletions; lane
`PaneCeilingConnector11`'s and `WallVerbsCritic25`'s secondary notes are recorded
only where they name a concrete site (F7, F6-R3).

## Residual uncertainty (unrun, named)

- End-to-end pane displacement from a digit-only fleet name (F1) is
  code-traced from the reproduced tmux resolution, not driven through a real
  `--fleet 2` launch.
- F2 was reproduced against `omp worktree add` directly; the same argv through
  the **real launcher** (`launch --apply`) was not run.
- F3's TOCTOU gap (no re-enumeration between `listPanes` and `kill-window`) is
  code-read, not forced.
- Dispatcher claim loop, `resume`/`register`/`twin` at the ceiling per verb, and
  an `omp`-as-mission-child TTY run are code-cited only.
- No LSP server answers these `.mjs` paths in this harness; semantic checks used
  shipped exports and exact code paths, with `grep` as the recorded fallback.

## Housekeeping

Some lanes wrote duplicate reports into `<worktree>/.ufo/scopes/tf-audit-wall-r1/`
(the harness's relative `reportDir` resolved inside the worktree, which lanes are
forbidden to write). Those duplicates and two stray scratch files (`err.txt`,
`out.json`) were removed from this worktree before the commit; the canonical
lane reports remain under `.tower/fleets/tower1/reports/tf-audit-wall/`.