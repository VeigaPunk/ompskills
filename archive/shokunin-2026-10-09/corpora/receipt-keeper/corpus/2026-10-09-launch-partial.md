# launch-partial — LAUNCH_PARTIAL ordering, ok semantics, post-mutation exits

Source: r1 lane `LaunchPartialExit` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: lines 105-107, 945-947, 1295-1306 read at HEAD.

## Asked

Where LAUNCH_PARTIAL fires and what is on disk when it does.

## Observed

- Raised :945-947 `if (failures.length>0) typed("LAUNCH_PARTIAL", "<n> of <plan.length> missions failed to launch (<ids>); the panes that did launch are live and fleet state is at <path>")`.
- `typed()` :105-107 throws `TypedError`; top-level catch :1300-1302 writes one `{ok:false,code,message}` JSON line to **stderr**, `process.exit(2)`.
- Order: per-mission warn (stderr) → fleet.json write :907 → stdout FAILED/launched/`fleet state:` lines or `--json` doc :930-944 → LAUNCH_PARTIAL envelope, exit 2.
- `ok:true` cannot coexist with a record `failure` from the same launch; `secondaryFailure` never affects `ok`.
- Other post-mutation exits: :906 `assertSafeWriteTarget(fleetPath)` → `INVALID_SPEC` and :907 fs error → `UNEXPECTED_ERROR` — both leave panes/worktrees/prompts with **no** fleet.json. `close` `COMPLETE_FAILED` :1227 also exits 2 after mutations.
- Doc drift: `.omp/skills/swarm/SKILL.md` names LAUNCH_PARTIAL as *the* post-mutation exception; COMPLETE_FAILED is a second.

## Unknowns

- :906/:907 failure paths not exercised.
- Launch exit codes are persisted nowhere (not in fleet.json, not in receipts).
