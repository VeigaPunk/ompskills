# mission-format-validator — the dispatcher's gate on `missionFormat`

Lane `ValidateMissionFormat` (scout). L1 re-read
`scripts/fleet-dispatcher.mjs:3562-3585` and `:222`.

Order: object → id → configPath → defaultIterateRounds → l1Alias. The first
failing check throws.

| check | line | refusal (exact) |
| --- | --- | --- |
| block is a plain object | :3563 | `config/ufo.json is missing sighting.dispatch.missionFormat` |
| `id === "nightcall"` (required) | :3566 | `sighting.dispatch.missionFormat.id must be nightcall` |
| `configPath` via `queueArtifactPath` (no opts): `safeText` ≤1024 no control chars, `beneath(ROOT)` | :3569 | `…configPath is invalid` / `…traverses a symlink under ${ROOT}` / `…escapes ${ROOT}` |
| `defaultIterateRounds` safe int 1..1024 (required) | :3570 | `sighting.dispatch.missionFormat.defaultIterateRounds is invalid` |
| `l1Alias` string, non-empty, no `@`, `L1_ALIAS_PATTERN /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/u` | :3575 | `sighting.dispatch.missionFormat.l1Alias is invalid` |

- Unknown keys are silently dropped by the return literal (:3579-3584). There is
  no closed-key rule.
- `configPath` is NOT checked at policy load for existence, file type, or size.
- Sole call: `loadDispatchPolicy` :3753, then `resolveFleetAliasRouting(l1Alias)`
  :3754 (does the alias resolve in the global table). Errors are wrapped by
  `asUsageError` (:3767).
- Live values (`config/ufo.json:81-86`): `nightcall`,
  `config/mission-nightcall.yml`, `1024`, `m_strong`.
