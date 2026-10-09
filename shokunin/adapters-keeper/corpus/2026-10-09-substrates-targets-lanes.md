# substrates-targets-lanes — the three config arrays vs packages/

Asked: cross-check lanes[], substrates[], targets{} against packages/.
Source: lane LanesTargets (`reports/adapters-keeper/LanesTargets.md`).

## Observed

- `lanes[]` (ufo.json:260-311): 10 lanes — scout:264, reviewer:269, labrat:274,
  critic:279, connector:284, executor:289, mutation-tester:294, revenger:299,
  simplifier:304, scribe:309 — every one `"substrate": "omp"`. Zero duplicate ids.
- `substrates[]` (:312-348): 7 ids — omp:314, kimi:319, codex:324, cursor:329,
  opencode:334, grok:339, devin:344; all `protocol:"local"`,
  `route:"local/fixture-primary"`.
- `targets{}` (:349-378): 7 keys, one per substrate id; each `targets[k].substrate == k`.
- Cross-checks: every lanes[].substrate ∈ substrates[]; every targets key ∈ substrates[];
  every substrate id has a targets key.

## The package mapping

6/7 substrate ids map to same-named package dirs; the exception:

| substrate id | package dir | same name? |
| --- | --- | --- |
| omp | `packages/substrate-omp` | **no** — `TARGET_PACKAGE={omp:'substrate-omp'}` (check-hand-authored-sets.mjs:36) |
| kimi | `packages/kimi` | yes |
| codex | `packages/codex` | yes |
| cursor | `packages/cursor` | yes |
| opencode | `packages/opencode` | yes |
| grok | `packages/grok` | yes |
| devin | `packages/devin` | yes |

## Contract

The declared packages set is computed: `[targets→TARGET_PACKAGE-mapped names] +
workspaces` — the set gate derives packages/* membership from config, not a literal list.

## Unknowns

- Six non-omp package dirs have no package.json — intent unverified (consistent with
  content-only projection role).
- `substrate.json` contents of non-omp seats only key-level inspected at this anchor.
