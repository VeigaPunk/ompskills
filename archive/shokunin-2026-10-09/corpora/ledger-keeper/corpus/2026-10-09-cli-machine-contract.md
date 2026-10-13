# cli-machine-contract — the `--json` envelope v1

Asked: `CLI_CONTRACT`, the one-line envelope, `jsonLine` escaping, `emitSuccess`, and the io.err seam.
Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `CliMachineContract`.

Observed:
- `CLI_CONTRACT = "primeagent-refinement-ledger-cli-v1"` (:1310); frozen envelope key order contract,verb,data (:1327);
  `data` is the same payload default mode prints, **nested never spread** (:1325-1331).
- `jsonLine` (:1312-1316) escapes U+2028/U+2029 (`\u2028`/`\u2029`) — parse-preserving, so a Unicode-aware line splitter
  cannot break the one-line contract; default mode keeps raw bytes.
- `emitSuccess`: one success-emission point per branch; refusal branches are exclusive (`io.err` + return 2, no log) —
  the A1 fix stops a soft `io.err` falling through to `JSON.stringify(undefined)`→0.
- `prettyDefault`: pretty for the three read verbs (read-successor/list-archives/read-archives) and `status`'s whole envelope;
  compact elsewhere.
- `runCli(argv, io={log,err})` :1455; default `fail` prints `refused: <reason>` and `process.exit(2)` (:1297-1300);
  parse-time refusals call `fail` directly and ignore a soft `io.err`.
- Verbatim: `validate` (missing) → `{"contract":"primeagent-refinement-ledger-cli-v1","verb":"validate","data":{"ok":true,"empty":true}}` exit 0.

Changed: nothing. Unknowns: none material.

Report: `reports/ledger-keeper/CliMachineContract.md`.
