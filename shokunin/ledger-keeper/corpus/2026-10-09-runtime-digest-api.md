# runtime-digest-api — `primeagentRefinementDigest` and the sync seams

Asked: options, success shape, refusals, sync seams, caps, containment, and the read-only guarantee.
Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `RuntimeDigestApi`. Package sha256 `725cfc537c421474ad4d9151cba7c8be98dce4b9d4c3f5dd71cdec607b671428`.

Observed (`packages/substrate-runtime/src/primeagent-refinement.mjs`):
- `primeagentRefinementDigest(options)` (:314). Required `missionId`/`runId`; optional `expectedParentRun` (present ⇒ `binding:caller-parent`),
  `ledgerPath`/`configPath`/`checkoutRoot`/`ledgerModuleUrl`, `digestMaxEntries`/`digestMaxBytes` (integer, tighter-only).
- Success `{ok:true, role:writer|child, binding:caller-parent|mission-only, digest}`; digest `{entryCount, bytes, omitted, entries:[{seq,title}], display}`.
  `bytes` is the **store total** (not digest size); `omitted` counts entry-cap drops only, so it can disagree with `display`'s `…+N` byte-budget drops.
  `display` always ends `[untrusted data]`. Caller-parent skips the mission guards; chain validation runs in both modes.
- Refusals (each reproduced): `unavailable`, `options-invalid`, `no-ledger-state`, `chain-invalid`, `unbound`, `foreign-mission`, `parent-mismatch`. Never throws.
- Sync seams: `sanitizeDigestText` (:77), `formatRefinementDigestStatus` (:103, whole-line byte budget, oldest-dropped-first), `classifyRefinementSession` (:90),
  `loadDigestCaps` (:131, min vs `canonicalDigestCaps()`); `DIGEST_CAPS_DEFAULTS = {16,1024}`.
- Containment (:211-241): an explicit `ledgerModuleUrl` is validated **before import** — `file:` only, realpath must equal `<root>/scripts/primeagent-refinement-ledger.mjs`.
- Read-only: store bytes identical before/after 15 calls; explicitly-passed missing store not created; no residue.

Changed: nothing. Unknowns: `expectedParentRun`/`missionId`/`runId` are unbounded-non-empty (interpolated into the `parent-mismatch` reason).

Report: `reports/ledger-keeper/RuntimeDigestApi.md`.
