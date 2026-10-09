# 2026-10-09 — the typed refusal envelope in both suites

**Asked.** What is the typed refusal envelope as each suite asserts it, and how
do the launcher's exit-2 refusals differ from the validator's exit-1 refusals?
(Lane `RefusalEnvelope`, reviewer.)

**Observed.** Sources: `test/tower-fleet.test.mjs:69,166-266,945-952,1147-1148`;
`test/run-wave-test.mjs:70-71,92,104,160-224,240-262,273,306-357,631-672,911-982,1337-1422`;
`sighting/tower-fleet.mjs:89-90,98-115,1239-1267,1293,1300-1305`;
substrate `scripts/ufo-swarm-wave.mjs:144,305-316,1349-1352,1434-1455,1902-1906`;
`scripts/ufo-mission-result.mjs:2031-2033`.

- Two envelopes. Launcher (`sighting/tower-fleet.mjs:89-90,1300-1305`): one
  stderr line `{ok:false, code, message}`, exit 2, UPPER_SNAKE codes
  (`L1_CEILING_EXCEEDED`, `SCOPE_OVERLAP`, `INVALID_SPEC`,
  `MUTATION_REQUIRES_APPLY`, `PANE_CEILING_EXCEEDED`, `CONFIG_UNREADABLE`,
  `UNKNOWN_MISSION`, `UNEXPECTED_ERROR`). Wave validator
  (`ufo-swarm-wave.mjs:144,1434-1455`): stderr
  `{schema: "ufo-swarm-wave-error-v1", code, message[, details]}`, exit 1 via
  `process.exitCode`, lower_snake codes.
- Usage paths. Launcher `usageExit` (`tower-fleet.mjs:109-115`): exactly two
  stderr lines (typed `USAGE` JSON + static banner) + exit 64, stdout empty;
  asserted by `expectUsage` (`tower-fleet.test.mjs:254-266`) against
  `USAGE_TEXT` (`:252`). Validator `emitUsageError` (`ufo-swarm-wave.mjs:1349-1352`):
  code `usage`, exit 64 — unasserted by `run-wave-test.mjs` (gap).
  `run-wave-test.mjs`'s own exit 64 is human text via `die()`
  (`:210-215`, `USAGE` `:160-175`, sites `:240/:256/:259/:262/:1397`) on
  stdout, no envelope; `gate()` (`:217-224`) and `finish()` (`:1337-1375`) exit
  1; the header contract is 0/1/64 (`:70-71`).
- Assertion style. `expectTyped` (`tower-fleet.test.mjs:178-183`) checks exit 2
  + `payload.ok === false` + message-is-string + exact code via `typedError()`
  last-stderr-line parse (`:170-176`); messages are pinned at call sites with
  exact equality (e.g. `:353,:519,:601,:629`) or substrings
  (`startsWith`/`includes` — ENOENT `:827-828`, EISDIR `:840-841`, configPath
  `:1315`); usage outranks the apply guard and `typedError` cannot read it
  (`:1147-1148`). `run-wave-test.mjs` `refusal()` (`:657-663`) is one
  conjunction: exit 1 + exact code + `schema === WAVE_ERROR_SCHEMA` (`:104`);
  the message is only echoed into evidence detail (`:661`), not asserted;
  expected codes are derived from the band via `bandVerdict()` (`:631-636`) and
  a pinned id-as-code vocabulary (`:911-978`, applied `:981`); `admission()`
  (`:665-672`) is the positive twin.
- Exit-2 vs exit-1 difference: the same "typed refusal on stderr with exact
  code + message" contract, but a different exit convention, marker leg
  (`ok:false` vs `schema`), and code casing. `waveCli` parses the refusal JSON
  from stderr via a stdout-empty fallback (`run-wave-test.mjs:344-357`).

**Changed.** Nothing — read-only research.

**Unknown.** Neither suite was run (read-only anatomy); the substrate's own
`ufo-swarm-wave.test.mjs` coverage of the validator usage/64 path was not
checked; the full validator fallback-code mapping
(`ufo-swarm-wave.mjs:1444-1454`) beyond what the suite asserts was not read.
