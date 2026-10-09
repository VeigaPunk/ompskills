# test-coverage-map — what the suite pins, and the gaps

Asked: block→surface map, fixture discipline, and the proven gaps.
Source: `test/tower-fleet.test.mjs` (1685 lines, 37 numbered blocks). Lane: `TestCoverage`.

- Fixture discipline: a temp ufoRoot with the real `config/ufo.json` **copied** in (:108-109),
  patched via `configRoot` (:188-197); the launcher is spawned as a fresh process (:167); no-write
  is proven by a recursive `snapshotTree` fingerprint (:228-241); wall isolation by a planted
  `bash` stub that logs `SCRIPT=$0` + argv tokens (:1572-1582). Nothing is put on PATH — the stub
  wall lives at `<spec ufoRoot>/scripts/ufo-sighting`, reached because the launcher always spawns
  `bash <path>` (:520). There is no fake `omp`: `launch --apply` never runs its omp body.
- Pinned: plan (happy + every refusal class), usage/help, default verb, `status --lite` control
  argv, close success + `UNKNOWN_MISSION` + `MUTATION_REQUIRES_APPLY`, launch refusals; the L1 and
  pane ceilings incl. gate order; the full SCOPE_OVERLAP taxonomy; the INVALID_SPEC battery; the
  CONFIG_UNREADABLE battery; render fidelity and the placeholder ledger; both argv shapes
  token-exact; the band live-read; the symlink refusal class; wall isolation + no-write.
- Gaps (proven by empty `grep -c` against the suite): `RUN_ID_RESERVED`, `RUN_ID_CONFLICT`,
  `LAUNCH_FAILED`, `WORKTREE_ADD_FAILED`, `LAUNCH_PARTIAL`, `WALL_OPEN_FAILED`,
  `STATE_DIR_UNAVAILABLE`, `PANE_LIVE`, `WALL_ABSENT`, `COMPLETE_FAILED`, `WALL_STATUS_FAILED`,
  `WALL_OUTPUT`, `COMMAND_MISSING`, `INTERACTIVE_GUARD`, `RENDER_UNRESOLVED`, `UNEXPECTED_ERROR`;
  `--force` has no pinned effect (only the `--mission` twin usage is pinned); all four
  `assertSafeWriteRoot` messages are unpinned (block 37 pins only exit 2 + INVALID_SPEC); the
  status reconciliation prose is unpinned.
- Root cause: no test ever executes a successful `launch --apply`, so the whole `verbLaunch`
  mutation/adoption/partial-failure surface (:706-948) and close's refusal modes (:1164-1170) are
  structurally untested.

Evidence: lane `TestCoverage`.
