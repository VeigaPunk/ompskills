# 2026-10-09 — tower-fleet refusal coverage

**Asked.** Enumerate every typed code `sighting/tower-fleet.mjs` can emit, which
the suite asserts, the gate order it pins, and which codes are dead under the
live band. (Lane `TftRefusalCoverage`, reviewer.)

**Observed.** Sources: `sighting/tower-fleet.mjs` (live source, 1306 lines);
`test/tower-fleet.test.mjs` (1685 lines); `reports/tf-audit-tests.md` §0/§3 for
cross-check; live `config/ufo.json` read this session.

- Code inventory: 20 stderr codes re-derived from live source — 18 via
  `typed()` + `USAGE` (`usageExit`, exit 64) + `UNEXPECTED_ERROR` (top-level
  catch, exit 2); the record-only codes `LAUNCH_FAILED`/`MISSION_FAILED` (and
  the `WALL_OUTPUT`/`COMPLETE_FAILED` record twins) never reach stderr as
  refusals. `INVALID_SPEC` has 32 `typed()` sites; `CONFIG_UNREADABLE` 5 arms;
  `INTERACTIVE_GUARD` 3 arms (one a tautology at `:483`).
- Coverage: **8 of 20 codes asserted** — `INVALID_SPEC`, `CONFIG_UNREADABLE`,
  `SCOPE_OVERLAP`, `L1_CEILING_EXCEEDED`, `PANE_CEILING_EXCEEDED`,
  `MUTATION_REQUIRES_APPLY`, `UNKNOWN_MISSION`, `USAGE`. **12 unasserted** —
  `UNEXPECTED_ERROR`, `RENDER_UNRESOLVED`, `INTERACTIVE_GUARD`,
  `COMMAND_MISSING`, `WALL_OUTPUT`, `WALL_STATUS_FAILED`, `WALL_OPEN_FAILED`,
  `STATE_DIR_UNAVAILABLE`, `LAUNCH_PARTIAL`, `WALL_ABSENT`, `PANE_LIVE`,
  `COMPLETE_FAILED`. Arm-level gaps inside asserted codes: unpinned `USAGE`
  "--force only applies to close" (`:1265`) and "unhandled verb" (`:1293`);
  unfired `INVALID_SPEC` arms `:170`, `:240-:250`, `:277`, `:314`; `:326`
  pinned as never-firing.
- Gate order the suite pins: `USAGE` (64) > `MUTATION_REQUIRES_APPLY` >
  raw-spec-read/ufoRoot gate > `CONFIG_UNREADABLE` authority > `loadSpec` shape
  (§§20/28/29/31/34); L1 ceiling before pane ceiling (§21 both-trip at
  pane 2 / L1 12 → L1 code, plus a discriminating pane 12 < L1 16 fixture; §4
  pins `windowPaneCeiling >= maxConcurrentL1`); `UNKNOWN_MISSION` before the
  wall registry read (§28); derived-write-target `INVALID_SPEC` before wall
  open (§37); zero-mutation proofs on every refusal family. Unpinned:
  ceiling-vs-mission-shape and `SCOPE_OVERLAP`-vs-ceiling ordering inside
  `loadSpec`.
- Dead under the live band (16/16: `maxConcurrentL1` = `windowPaneCeiling` =
  16): `PANE_CEILING_EXCEEDED` is band-dead, reached only via patched fixtures
  (§21). Structurally dead regardless of band: `INTERACTIVE_GUARD` all three
  arms (argv fully derived; §35 pins the complement — every injection surface
  refuses upstream as `INVALID_SPEC`/`CONFIG_UNREADABLE` or neutralizes via the
  `@`-prefix), the `RENDER_UNRESOLVED` `:443` arm (template ledger §32 guards
  it; the `:447` arm is spec-reachable but unasserted), `USAGE` "unhandled
  verb", `INVALID_SPEC` "must be a JSON object", `UNEXPECTED_ERROR`. Nine
  wall-path codes are production-reachable but unreachable in the suite's
  always-succeeding stub regime: no `launch --apply` ever reaches wall open,
  and `close` always stub-succeeds with `--force`.
- Audit cross-check: `tf-audit-tests.md` §0/§3 audited an older pair (741-line
  launcher, 294-line/8-section suite) — stale (current 1306/1685 lines, 37
  sections). Its "4 asserted codes" is now 8; its "0 PANE assertions / order
  pin is coincidence" (§3.4-12) is superseded by §21's discriminating fixture,
  though the band-dead claim still holds; §3.3 (`CONFIG_UNREADABLE` family
  untested) is superseded — all five arms are now asserted with exact messages;
  §3.7-§3.9 "verbs never executed" is partially superseded (`status`/`close`
  run against stubs in §28/§33/§36; `close` completes successfully in §36;
  `launch` runs to a pre-wall refusal in §37), still never executed: a
  successful wall launch, `close` without `--force`, an absent wall, any
  failing stub; §3.10-23's ufoRoot-clobber is now enforced in the launcher
  (`:244`) but still unasserted by the suite.

**Changed.** Nothing — read-only research; no files modified in the worktree or
substrate.

**Unknown.** Static analysis only — the suite was not executed; §37's specific
`assertSafeWriteTarget` arm per plant was not observed; the old revision is
absent, so the 18-vs-20 code delta is reasoned from audit §2.1, not diffed.
