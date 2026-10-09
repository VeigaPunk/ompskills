# charter-sign-verb — ufo charter sign <runId>

Asked: the full verb — TTY gate, dispatch site, Phase 0 stages, seal checks,
artifact, success/failure behavior, typed refusals.

Observed (wave r1-w1 lane CharterSignVerb, crates/ufo-cli/src/main.rs):

- Dispatch at main.rs:219-221 (NOT :212 as spec 06 cites — :212 is the
  SelfIter arm). Function `charter_sign` at :989-1109.
- TTY gate is FIRST (:990-995): `stdin().is_terminal() && stdout().is_terminal()`
  else `{ok:false, kind:"non_interactive"}` exit 2 — before any file read.
  A lane, steer, or scripted invocation sees pipes and is refused. **The only
  auth is isatty** — a pty allocated by a lane could pass [inference, not run].
- Seal checks in order: absent → `no_seal`; read error / decode failure /
  foreign `kind` → `seal_unreadable` (:1025,1044,1053); `run_id` mismatch →
  `seal_mismatch` (:1064). All exit 2 typed envelopes. The seal decode skips
  the depth and duplicate-key guards used elsewhere.
- Phase 0 stages: `CHARTER_PHASE0_STAGES = ["contracts", "build", "drills"]`
  (:850) — the single authority iterated by the test seam, pass rule, and
  failure report. Stage timeouts: 60 s contracts / 900 s build+drills
  (`CHARTER_PHASE0_TIMEOUT_SECS_DEFAULT` :843, env
  `UFO_CHARTER_PHASE0_TIMEOUT_SECS` <1 or unparsable → default). A stage that
  cannot spawn, times out, or produces oversized output records `ok:false`
  — failed, never skipped (:871-896).
- Artifact `.ufo/charter/<runId>.json` (kind `ufo-charter-sign-v1`, fields
  `run_id, sealed_accepts, operator_ts, phase0, membrane_signoff`) is written
  BEFORE the pass check (:1071-1084) — a failed run still leaves its record.
- On failure: `phase0_failed`, **exit 1**, seal stands (:1085-1096). On pass:
  `remove_file` on the seal (:1099-1104) and the artifact is printed.
- Divergences: exit-code help (:15) lists `phase0_failed` under exit 2 —
  code emits 1; spec 06's six-stage Phase 0 narrowed to three without an
  annotation; landed has six typed kinds (also `invalid`,
  `invalid_seam_on_release` :924-928), spec lists three; a debug-only
  `UFO_TEST_CHARTER_PHASE0` seam substitutes stage results (:902-950) —
  release refuses it.
- Residual: `remove_file` failure after a passing artifact leaves
  `membrane_signoff: true` with the seal standing.

Test coverage: see 2026-10-09-sign-test-contract.md.
