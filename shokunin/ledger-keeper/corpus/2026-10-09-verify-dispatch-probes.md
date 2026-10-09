# verify-dispatch-probes — card self-start + the four CLI probes

Asked (creation-verification dispatch, `skill://shokunin` step 4): prove the
`ledger-keeper` card self-starts from its card, reads its corpus first, obeys its
bounds (substrate read-only; only a real-copy scratch root for CLI probes), and
returns grounded findings. Four probes against the ledger CLI + the exit-code
contract.

Anchor: `ufo-fsd-alpha@5ace2559` (HEAD, re-hashed this run).
`scripts/primeagent-refinement-ledger.mjs` sha256
`ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096` (matches the
seeded corpus anchor); `config/primeagent-assimilation.json` sha256
`d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674` (matches).
All line numbers below re-verified against that hash this run.

## Method / bounds

Scratch root: `S=$(mktemp -d /tmp/lk-verify-XXXXXX)` = `/tmp/lk-verify-AOYqP1`,
with a **real copy** (not a symlink; `file` → `JSON text data`, 3131 bytes) of the
canonical config at `$S/config/primeagent-assimilation.json`. Every invocation
passed an explicit `--ledger $S/ledger.json` and `--config $S/config/…json`, so
nothing touched the read-only substrate and no store resolved into it. Card
corpus (`index.md` + `cli-machine-contract`, `cli-verb-inventory`,
`successor-projection`, `append-semantics`) was read before probing. Leaf member —
no subagent dispatch.

## Q1 — `append` one entry (exit 0)

```
node /home/vgpnk/Projects/ufo-fsd-alpha/scripts/primeagent-refinement-ledger.mjs \
  --ledger "$S/ledger.json" --config "$S/config/primeagent-assimilation.json" \
  append --run run-verify-1 --kind memory --title "probe title" --body "probe body"
```
exit `0`; stdout (default mode, compact JSON — append is not a pretty read verb):
`{"appended":1,"sha256":"02e7e0c71c87d718bfb709c668e71487b45cbb5e5a940cd22e1457abcc2d8f40","bytes":238}`
stderr empty. Matches `append` CLI mapping (`runCli` :1472-1491;
payload `{appended,sha256,bytes}`). Genesis founded `parentRunId=run-verify-1`
from `--run`.

## Q2 — `read-successor --expect-parent-run <WRONG>` (refusal, exit 2)

```
read-successor --expect-parent-run run-wrong-999   # same --ledger/--config
```
exit `2`; **stdout strictly empty** (`wc -c` = 0 bytes); stderr verbatim:
`refused: identity binding refused: ledger parent is run-verify-1, successor expected run-wrong-999`
Single `refused: …` stderr line, empty stdout — the documented exit-2 contract
(`fail()` :1297-1300 → `process.exit(2)`; io.err + `return 2`, no log).

## Q3 — `read-successor --expect-parent-run <right>` (exit 0)

```
read-successor --expect-parent-run run-verify-1    # same --ledger/--config
```
exit `0`; stderr empty; default-mode stdout is **pretty** JSON (read verb →
`prettyDefault`), verbatim:
```json
{
  "schema": "ufo-refinement-ledger-v1",
  "parentRunId": "run-verify-1",
  "entryCount": 1,
  "bytes": 238,
  "entries": [
    {
      "seq": 1,
      "kind": "memory",
      "title": "probe title",
      "createdAt": "2026-10-09T11:55:34.445Z",
      "sha256": "02e7e0c71c87d718bfb709c668e71487b45cbb5e5a940cd22e1457abcc2d8f40"
    }
  ]
}
```
Exact default projection key set — top-level
`["schema","parentRunId","entryCount","bytes","entries"]`; per-entry
`["seq","kind","title","createdAt","sha256"]`. `omitted` is **absent** here
(conditional: emitted only when `entryCount > SUCCESSOR_MAX_ENTRIES` 16;
source :746,:752). Source-confirms the S1 allowlist: bodies/axis/evidence and the
top-level `parentSessionId` never leave the store on the default read (:741).

## Q4 — `validate --json` (exit 0)

```
validate --json    # same --ledger/--config
```
exit `0`; line count **1**; stderr empty; stdout verbatim (one compact LF-terminated
line):
`{"contract":"primeagent-refinement-ledger-cli-v1","verb":"validate","data":{"ok":true,"entries":1,"bytes":238}}`
Envelope keys exactly `["contract","verb","data"]`; carries the contract string
`"primeagent-refinement-ledger-cli-v1"` (`CLI_CONTRACT` :1310, `emitSuccess`
:1325-1331, `jsonLine` :1312-1316). `data` nested, never spread.

## (a) exit code on a refusal — source-grounded

**Exit 2, every refusal.** `fail(reason)` (:1297-1300) prints
`refused: ${reason}` to stderr and calls `process.exit(2)`. Each refusal branch in
`runCli` (:1455) does `io.err(...); return 2;` (append :1489, read-successor
:1498): with the default `io.err = fail` the process exits before the return;
with a non-exiting io.err the return value is still 2 and stdout stays empty.
Entrypoint (:1671-1675) `process.exit(runCli(process.argv.slice(2)))`; unknown
verb (:1666-1667) returns 2 via the same `io.err`. Observed exit 2 in Q2.

## (b) exit-64 usage code — source-grounded

**No.** The ledger CLI has no exit-64 / `EXIT_USAGE`. A whole-file scan found only
`process.exit(2)` (:1299) and `process.exit(runCli(...))` (:1672); no `64`, no
`EXIT_USAGE`. Exit 64 is the **recovery consumer** CLI's usage code
(`scripts/primeagent-recovery-assess.mjs`: `EXIT_USAGE = 64` :87, returned at
:535) — a different binary. The card's trap ("exit 64 is the recovery consumer
CLI's usage code") is confirmed.

## Changed

Nothing in the substrate (read-only). Added this entry + its `index.md` row.

## Confidence / remaining unknowns

Confidence: **high** for all four probes (verbatim verbatim bytes + exit codes
captured) and high for (a)/(b) (source lines re-verified against the re-hashed
`ae69c40c…`). Remaining unknowns: none material here. Not exercised this run (out
of scope): the `omitted` key path (>16 entries), the `--include-bodies` /
`--include-archives` projections, and other verbs' default-mode bytes. Note: `xxd`
absent on the host — stdout emptiness for Q2 proven by `wc -c` = 0.