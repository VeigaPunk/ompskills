# template-expansion — the `{{item}}` template and its refusals

Asked: `spec.template` expansion semantics.
Source: `scripts/ufo-swarm-wave.mjs:254, 824-830, 946-971, 1011-1018`. Lane: `TemplateExpansion`.

- Placeholder: `ITEM_PLACEHOLDER = "{{item}}"` (`:254`). A template lacking it dies
  `invalid_spec` ("spec.template must contain the {{item}} placeholder", `:828-830`)
  **before any lane parses** — the documented reason is that it would degenerate into a
  wave of identical lanes.
- Replacement (`:956`): `template.replaceAll(ITEM_PLACEHOLDER, () => item)` — a **function**
  replacer because a string replacement would reinterpret `$&`, `$'`, `` $` ``, `$$`, `$n`
  inside item text and silently corrupt prompts. Single pass; item content is never
  rescanned. Observed: `$&`, `$'`, `` $` ``, `$$`, `$1` and a nested `{{item}}` survive
  verbatim.
- Refusals: `prompt_with_template` (key **presence**, so `prompt: null` also refuses),
  `item_required`, expansion `> 64 KiB` → `invalid_spec`, `duplicate_expansion` (first
  colliding pair, after the band checks).
- No-template fallback: `text = prompt ?? item`; `prompt` wins and `item` persists as the
  registry partition label. Neither present → `prompt_required`.
- Bounds: `MAX_ITEM_BYTES` 4096; `MAX_PROMPT_BYTES` 65536 (bounds the template, the
  expansion, and the composed task).

Observed: 17 distinct template lanes → exit 0 with `compaction.template_hoist applied`;
duplicate item → `duplicate_expansion`; no placeholder → `invalid_spec`; a 65 537-byte
expansion → `invalid_spec`; a 4 097-byte item → `invalid_spec`; a 1-lane template wave →
`too_few_lanes`, which witnesses the order loop → band → dedupe.

## Not carried by the source

- Per-item `prompt` is **not** legal alongside a template (key presence refuses), so a
  template wave cannot customize per-lane prose — only the item text varies.
- No dedupe of items: identical items are refused, never collapsed.

## Unknowns

- The expansion bound (`:956-959`) is reachable but its detection is subsumed by the
  composed bound; the message text is not pinned by any test (see `dead-arms`).
