# docs-reconcile — `docs/EPHEMERAL-L1-MISSIONS.md` vs the source

Asked: mark each normative doc sentence MATCHES / DIVERGES / UNVERIFIABLE
against the source. Source: `docs/EPHEMERAL-L1-MISSIONS.md` (51 normative rows) vs
`prepare-ephemeral-l1.mjs`, `config/ephemeral-l1.machine.json`, `ufo-sighting.mjs`.
Lane `DocsReconcile` (critic).

Verdicts: 43/51 MATCHES, **1 DIVERGES**, 8 UNVERIFIABLE. The single divergence
(round-2 correction): the doc's "prints deterministic JSON fields" wording is
contradicted by the source — `id` defaults to `mission-${randomUUID()}` (:659),
so the field *set* is deterministic but the values are not. Targeted claims all
verified verbatim: root config:3; `--no-local`+detached+`clean -ffdX`+binary
overlay+`ls-files --others --exclude-standard` (prepare:617-634); auth copy
(:686-700); env map `{...paths,...flagVariables}` (:706-709); `SANDBOX_UNAVAILABLE`
(sighting:4206); OpenCode config (:524-533); launch example
(sighting:4560-4576/2393-2398/4195); destroy/force rules (prepare:756-888). So
the doc is a faithful abridgment — but it is still a paraphrase; the source wins.

UNVERIFIABLE rows are product/runtime behaviors the doc asserts without a
source line (mostly OpenCode-side).

Over-claim risks for a card (so it does **not** inherit a claim the source
lacks):

- "no global-agent fallback" — shown only for the **synthesis** (prepare reads
  just `skills/ufo/SKILL.md` and `agents/`, refuses xbgst/xbreed :497/:504); the
  product's runtime behavior is UNVERIFIABLE.
- "disables external skills / default plugins" — these are policy **env flags**
  (config:27-28), not config-file keys; product-side honoring UNVERIFIABLE.
- "mission has no canonical write permission" — an INFERENCE from the bwrap mount
  set, not an explicit check.
- "exact file-state capture, not a staging-state capture" — `apply --index` does
  stage into the **clone** (:632); only the *source's* own index split is
  uncaptured.
- "prints deterministic JSON fields" — the field set is deterministic, but `id`
  defaults to `mission-${randomUUID()}` (:659).

Smallest safe correction: attribute each OpenCode disable to its carrier
(config file vs policy env flag), scope "no global fallback" to the synthesis,
mark canonical-write-denial as derived from the mount set, and keep tier-flow /
retention / push sentences out of the sourced contract.

## Unknowns

- Whether any consumer enforces the doc's operator-guidance sentences (retention
  window, human-authorization gate, no-automated-push).