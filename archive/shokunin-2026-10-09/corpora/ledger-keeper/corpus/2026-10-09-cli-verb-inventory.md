# cli-verb-inventory — the nine verbs, flags, and exit contract

Asked: a complete verb inventory with flags, payloads, and exit codes. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `CliVerbInventory` (scribe).

Observed:
- Dispatch is an if-chain in `runCli` (:1455); **9 verbs**: append, read-successor, validate, prune, successor-reset,
  reap-tmp, list-archives, read-archives, status.
- Globals `--ledger`/`--config`/`--json`; boolean `include-bodies`/`include-archives`/`json`; no positionals
  (`unexpected argument` :1434).
- Exit codes: **0 success / 2 every refusal** (`fail()` :1297-1300; unknown verb :1666). **There is NO exit 64 in this
  module** — the docs' exit-64 usage text belongs to `scripts/primeagent-recovery-assess.mjs` (EXIT_USAGE=64 :87/:533).
- Payload keys per verb: append `{appended,sha256,bytes}`; read-successor `{schema,parentRunId,entryCount,bytes,[omitted],entries,[parentSessionId with --include-bodies],[archives with --include-archives]}`;
  validate `{ok,empty}`|`{ok,entries,bytes}`; prune `{pruned,remaining}`; successor-reset `{archived,entries,retention}`;
  reap-tmp `{reaped,refused}`; list-archives `{schema,scope,snapshot,slots,validCount,refusedCount,legacy}`;
  read-archives `{…,algorithm,order,slots,rollupSha256}`; status `{schema,summary,store,archives,successor}`.
- No `--help`/usage() emitted; closest text is the unknown-verb diagnostic (:1666); the synopsis lives in the source comment :28-88.
- All verbs exercised under a scratch root (exits captured).

Changed: nothing. Unknowns: non-exiting io.err embedding path document-only.

Report: `reports/ledger-keeper/CliVerbInventory.md`.
