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
- Gaps (proven by empty `grep -c` against the suite): `RUN_ID_RESERVED`, `LAUNCH_FAILED`,
  `WORKTREE_ADD_FAILED`, `LAUNCH_PARTIAL`, `WALL_OPEN_FAILED`, `STATE_DIR_UNAVAILABLE`, `PANE_LIVE`,
  `WALL_ABSENT`, `COMPLETE_FAILED`, `WALL_STATUS_FAILED`, `WALL_OUTPUT`, `COMMAND_MISSING`,
  `MISSION_FAILED`, `INTERACTIVE_GUARD`, `RENDER_UNRESOLVED`, `UNEXPECTED_ERROR`.
  (Corrected in round 2: `RUN_ID_CONFLICT` was mislisted — it is **not** an emitted launcher code;
  it is the wall CLI's code, consumed at :864 `if (parsed?.code === "RUN_ID_CONFLICT" ...)`. And
  `MISSION_FAILED` (:896, the per-mission catch-all) had been omitted.)
  `--force` has no pinned effect (only the `--mission` twin usage is pinned); all four
  `assertSafeWriteRoot` messages are unpinned (block 37 pins only exit 2 + INVALID_SPEC); the
  status reconciliation prose is unpinned.
- Root cause: no test ever executes a successful `launch --apply`, so the whole `verbLaunch`
  mutation/adoption/partial-failure surface (:706-948) and close's refusal modes (:1164-1170) are
  structurally untested.

Evidence: lane `TestCoverage`.

## Block → surface map (37 numbered blocks)

| block | surface pinned |
| --- | --- |
| 1 | plan: valid 2-mission spec |
| 2 | plan writes nothing |
| 3 | default verb is plan |
| 4 | L1 ceiling boundary + refusal |
| 5 | scope overlap |
| 6 | nested scopes refuse, both orders |
| 7 | identity validation |
| 8 | mutation guard |
| 9 | usage |
| 10 | omp argv shape: exact token list |
| 11 | identical scope entries, component-disjoint siblings |
| 12 | scope normalization + refusal forms |
| 13 | per-entry scope refusal taxonomy + empty-scope gate |
| 14 | fleet-name pattern boundaries |
| 15 | mission-id pattern + duplicate gate |
| 16 | mission container shape + required fields |
| 17 | skills field validation |
| 18 | maxTime default/tokens/refusals |
| 19 | roundCeiling default/validation/echo |
| 20 | spec shape + unreadable spec files |
| 21 | panes: windowPaneCeiling live + two-ceiling gate order |
| 22 | help — exit 0, stdout only |
| 23 | usage — exit 64, typed USAGE JSON + banner |
| 24 | render fidelity — identity group |
| 25 | render fidelity — goal unescaped |
| 26 | render fidelity — every path placeholder |
| 27 | launch argv shape: wall half token by token |
| 28 | mutation-guard ordering (precedes spec load + every wall call) |
| 29 | band authority fail-closed on corrupt config |
| 30 | band numbers read live |
| 31 | config/ufo.json missing/broken |
| 32 | template placeholder ledger |
| 33 | no-write proof (recursive snapshot) |
| 34 | l1Alias + windowPaneCeiling parse gates |
| 35 | interactive guard |
| 36 | wall isolation (no real wall/tmux) |
| 37 | derived write paths cannot escape via symlink |
