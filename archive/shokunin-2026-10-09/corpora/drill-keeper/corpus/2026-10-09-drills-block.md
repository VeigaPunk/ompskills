# drills-block — `config/ufo.json#drills`

Asked: the block's shape, who validates it, whether anything branches on `enabled`, and which note claims are stale.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `DrillsBlock`.

## Observed
- Block (`config/ufo.json:10-13`, byte-identical at HEAD and in `crates/ufo-core-runtime/bundled/config.json:10-13`):
  `{"enabled": true, "note": "Spec 09 drill matrix (P8): the gates.sh drills: stage runs after the mutation battery; drill evidence lands under .ufo/drills/<id>/; fixture routes only, never live providers."}`
- Validator `assertDrillsContract` (`scripts/sync-ufo-contracts.mjs:1379-1397`), sole caller `loadNativeProfile` (`:1436`) ← `syncOmpProjection` (`:1629`) ← `runSync` (`:1694`). Runs in **every** sync mode (write, `--check`, `--review`); failure → `ok:false`, exit 1, no projection write (`:2220-2273`). Not advisory under `--review`.
- Closed vocabulary `{enabled, note}`. Error strings: `drills is required and must be an object` (`:1382`), `drills.enabled must be a boolean (gates.sh tri-state consumer)` (`:1385`), `drills.note must be a string when present` (`:1388`), `drills.<key> is not a known key (known: enabled, note)` (`:1394`).
- **`drills.enabled` has zero code consumers.** Not `gates.sh` (stage stripped in `91cc18fe`), not `ufo charter` Phase 0 (`crates/ufo-cli/src/main.rs:967` spawns `ufo-drills.mjs` unconditionally), not `ufo-drills.mjs` (reads `config/ufo.json` only for a digest). The validator comment `:1372-1378` admits this and keeps the check as drift protection.
- Tests (`tests/sync-ufo-contracts.test.js:1050-1077`) cover only the `enabled` type arm and the extra-key arm; missing-block and non-string-note arms are untested.

## Stale note claims
| claim | truth |
| --- | --- |
| "the gates.sh drills: stage" | false — no stage since `91cc18fe`; runner is charter Phase 0 |
| "runs after the mutation battery" | false — no such ordering exists anywhere |
| "evidence lands under .ufo/drills/<id>/" | true — `scripts/ufo-drills.mjs:64` |
| "fixture routes only, never live providers" | prose; see `fixture-route-rule` for enforcement gaps |

The error string `(gates.sh tri-state consumer)` at `:1385` names the removed consumer too.

## Unknowns
- Whether the stale note is tolerated or unlanded intent — not determinable from the tree.
