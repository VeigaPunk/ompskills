# spec-key-surface — the spec's accepted keys, their bounds, and the default context

Asked: the spec-level key surface of the wave validator.
Source: `scripts/ufo-swarm-wave.mjs:273-274, 153-155, 247-253, 295, 302-303, 770-772, 883-887, 280-289`
(ufo-fsd-alpha@5ace2559, sha256 `cd8247af7e7a9dc3…`). Lane: `SpecKeys`.

| key | level | type | bound | refusal when violated |
| --- | --- | --- | --- | --- |
| `wave` | spec | nonempty string | 128 B | `invalid_spec` |
| `context` | spec | nonempty string | 64 KiB | `invalid_spec` |
| `template` | spec | nonempty string | 64 KiB; must contain `{{item}}` | `invalid_spec` |
| `reportDir` | spec | relative path | ≤512 B, no absolute/backslash/empty/`.`/`..` segment | `invalid_spec` (type/empty), `invalid_report_dir` (shape) |
| `maxLanes` | spec | positive integer | tightens the cap, never widens | `invalid_spec` |
| `items` | spec | array | ≥1 lane after classification | `invalid_spec` / `empty_wave` |
| `priorRegistry` | spec | relative path or array ≤16 | each ≤512 B, deduped first-wins | `invalid_spec` (>16 / non-string / empty string), `invalid_registry_path` (JSON `null` entry / shape) |
| `axes` | spec | array of 1..8 distinct names | ≤256 B each | `invalid_spec` |
| `milestone` | spec | nonempty string | ≤256 B | `invalid_spec` |
| `hoist` | spec | boolean | undefined defaults `true` | `invalid_spec` |
| `item`, `prompt`, `role`, `resume`, `message`, `name`, `axes`, `milestone` | item | — | per-kind legality, see `item-kind-spawn-vs-resume` | `invalid_spec` (`items[N] has unknown key …`) |

Bound constants: `MAX_SPEC_BYTES` 1 MiB (transport only: `--spec-json`, `--spec -`,
`--spec <file>`), `MAX_ITEM_BYTES` 4 KiB, `MAX_PROMPT_BYTES` 64 KiB,
`MAX_CONTEXT_BYTES` 64 KiB, `MAX_WAVE_BYTES` 128, `MAX_REGISTRY_BYTES` 1 MiB,
`MAX_PRIOR_REGISTRIES` 16, `MAX_LANE_AXES` 8, `MAX_LANE_META_BYTES` 256,
`MIN_HOIST_SAVINGS` 512.

- Both key sets are **closed**: unknown key → `invalid_spec`, at the spec walk
  (`:770-772`) and the item walk (`:883-887`). Observed:
  `unknown spec key "bogusKey"`, `items[0] has unknown key "bogus"`, exit 1.
- The spec walk precedes policy load (`:773`), so an unknown key wins over a bad
  `maxLanes` in the same spec.
- Omitted `spec.context` defaults to `DEFAULT_WAVE_CONTEXT` (`:280-289`): a
  transport-shaped `# Goal / # Constraints / # Contract` skeleton, because the
  `task` transport requires a string context. An explicit context stays
  byte-identical at the head; only hoist/prior-refinement may append after it.
- Header drift: the header's spec-shape block (`:64-90`) documents 8 keys, all
  enforced; the reverse gap is `spec.axes`/`spec.milestone`, accepted and consumed
  (`:851`) but undocumented there.

## Not carried by the source

- No `model`, `provider`, or routing key at either level — the whitelist rejects
  them, which is the no-pin rule at the spec boundary.
- No per-key `required` marker beyond the rules above; `items[].name` is optional
  (minted by default, see `role-set-and-names`).

## Unknowns

- The `--spec-json` >1 MiB arm was source-anchored, not probed (the shell refuses
  the argv first); the same bound was proven via `--spec <file>`.
- `--spec -` stdin and the `--assignments` reuse of `MAX_SPEC_BYTES` read from
  source only.
