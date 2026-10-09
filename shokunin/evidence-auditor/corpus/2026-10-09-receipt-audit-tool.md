# 2026-10-09 — the receipt-audit instrument

**Asked.** What does the canonical receipt audit check, and what can it not
catch? (lane `ReceiptAuditTool`, sentinel.)

**Observed.**
`/home/vgpnk/Projects/ufo-fsd-alpha/evidence/nightcall-integration/r01-receipt-audit.mjs`
(~2.3 KB; sha256 `ab06b78d4dd32f12d8f0aeece2500dbbdd2d4d5c833fc966a452b07f37e1f5f6`).
It audits a cwd-relative `.ufo/results/*.receipt.json` tree on four gates:

1. JSON parse with short-circuit;
2. an **exact top-level key bag** — `REQUIRED=[schema, taskKey, runId, sessionId,
   promptSha256, configSha256, reportSha256, producerId, createdAt]` +
   `OPTIONAL=[iteration]` (`:9-22`);
3. schema string check `r.schema === 'ufo-task-receipt-v1'` (`:23`);
4. sibling report existence by stripping `.receipt.json` (`:25-26`) plus
   **`reportSha256` recompute** — `sha256(report bytes)` vs the receipt’s own claim
   (`:27-29`).

`sessionId !== 'omp-' + runId` is **note-only** (`:24`) and never fails a receipt.
Output envelope: `{summary:{total, parse, schemaOk, keysExact, reportExists,
hashMatch, hashMismatch, fullyValid}, failures:[rows not fullyValid]}` — no
`schema` field of its own, no `observedAt`.

**Results.** `r01-receipt-audit.json` (sha256 `27019cd9…`): 155 receipts, 150
fullyValid, 5 `hashMismatch`. `r04-receipt-audit.json` (sha256 `34a72341…`): 157
receipts, 152 fullyValid, the **same 5** mutations. Mutated receipts (identical in
both): `n3-autonomy`, `nc2-ops`, `nx-dispatch`, `nx-docs`, `nx-tick`.

**Attribution caveat.** The audit detects a *mismatch*, not its *timing* — the
“post-receipt” label comes from separate mtime probes
(`nc2-verify-w2-r2/ProbeReceiptsNew.md:112-116`: the receipt body was not
rewritten while the report bytes changed 2.6–5.1 h after mint).

**Adversarial limit — a class it cannot catch: co-consistent re-forgery
(self-anchored digests).** Rewriting a report **and** updating its receipt’s
`reportSha256` passes `fullyValid`, because there is no external anchor — no
signature, no expected-hash manifest, no queue cross-check, no mtime stat.
Amplified by `promptSha256`/`configSha256` being presence-checked but **never
recomputed** (later reviewer lanes recomputed them by hand) and by receipt
**deletion being invisible** (no expected count pins the census).

**Reproducibility.** The audit cannot be re-run against its original inputs:
`/home/vgpnk/Projects/ufo-fsd-alpha/.ufo/results/` is **absent** (all `.ufo/`
content is gitignored and pruned). `[INFERENCE]`: r04 was produced by the same r01
script (shape-identical; no r04 `.mjs` exists).

**Changed.** Nothing — read-only research.

**Unknown.** The audit was not executed (input tree deleted; substrate read-only).
Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/ReceiptAuditTool.md`.