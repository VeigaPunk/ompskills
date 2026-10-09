# cli-parser — argv parsing and flag allowlists

Asked: `BOOLEAN_FLAGS`/`GLOBAL_FLAGS`/`VERB_FLAGS`, the r24 global pre-pass, F1 allowlists, and refusal messages.
Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `CliParser` (reviewer).

Observed:
- `BOOLEAN_FLAGS` (:1337) = include-bodies, include-archives, json; `GLOBAL_FLAGS` (:1346) = ledger, config, json;
  `VERB_FLAGS` (:1347-1357) per verb (append kind/title/body/axis/evidence/run/created-at/mission/session;
  read-successor expect-parent-run/include-bodies/include-archives; prune keep/expect-parent-run;
  successor-reset expect-parent-run/archive; validate/status/reap-tmp/list-archives/read-archives = ∅).
- `parseGlobalFlags` (:1402-1426) extracts globals before OR after the verb with the same rules: valued boolean refuses
  (`refused: boolean flag --json takes no value`); empty operand refuses; space-form `--`-leading value refuses; duplicates last-wins.
- F1 verb loop (:1432-1445): positional check → allowlist → boolean → `takeFlagValue`; unknown flag / missing value refuse exit 2.
  Ordering: allowlist check **before** `takeFlagValue` (discriminating probes: `append --bogus=` → unknown-flag fault; `frobnicate --bogus=` → operand fault).
- `--name=value` is the only spelling for `--`-leading values; first `=` splits, later `=` kept; `--name=` empty inline refuses.
- Unknown verb skips F1 so the dispatcher refusal (:1666) names the verb + nine-verb set; empty argv → `unknown verb undefined`.
- Parse-layer refusals hard-exit(2) even under an embedded non-exiting `io.err`; only dispatcher refusals honor `io.err`.

Changed: nothing. Unknowns: the "193-record probe matrix" (comment :1377) is an executed-probe claim, not a committed artifact.

Report: `reports/ledger-keeper/CliParser.md`.
