# status-verb — the r25 single-call health scrape

Asked: the `status` envelope, composed sections, section-vs-fatal degradation, both modes, and caller guarantees.
Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `StatusVerb`.

Observed (`runCli` :1552-1664; `VERB_FLAGS.status = new Set()` — globals only):
- Envelope `{contract:"primeagent-refinement-ledger-cli-v1", verb:"status", data:{schema:"ufo-refinement-status-v1",
  summary:{state,ok}, store, archives:{ok,list,read}, successor}}`; frozen data key order (:1648-1658).
- `summary.state ∈ ok|degraded|empty`, `summary.ok === (state==="ok")` (so `empty` is not ok); state machine :1641-1643
  `degraded > empty > ok`.
- **Fatal** (exit 2, stdout strictly empty), evaluated before any section: archive-path eligibility (:959/:1564),
  store read refusal, store validation refusal. **Section refusal degrades** (exit 0, `summary.state:"degraded"`):
  any archive section refusal, a refused slot visible, or cross-scan slot drift (`managed slot set changed between
  inventory and digest; re-run`).
- successor section is metadata-only `binding:"store-observed-unattested"` (`sha256(parentRunId)`); titles/bodies never leave the store.
- `--json` = one compact line; **default mode carries the whole envelope pretty** — status is the one verb whose default is the envelope.
- Scratch probes: missing store → `state:"empty"` exit 0; corrupt store → exit 2 empty stdout; extensionless path → exit 2;
  `--json=x` → `boolean flag --json takes no value`; `--keep 1` → `unknown flag --keep for verb status`.

Changed: nothing. Unknowns: the doc's "99 in the ledger suite" is stale (105 at this anchor).

Report: `reports/ledger-keeper/StatusVerb.md`.
