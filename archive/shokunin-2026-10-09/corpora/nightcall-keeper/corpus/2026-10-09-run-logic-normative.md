# run-logic-normative — normative rules vs enforcement

Lane `RunLogicNormative` (scout).

| rule (skills/ufo/references/run-logic.md) | enforcement |
| --- | --- |
| one L1 per mission (L20, L2285) | **none**. `ufo-sighting.mjs:2928-2930` only renders `l1: 1` |
| at most 32 live L1s (L20, L2286) | the literal 32 is unenforced; `maxConcurrentL1` from config is enforced (`fleet-dispatcher.mjs:3749`, `l1Headroom` :7712-7726); live is 16 |
| `requestedRunners: 1` (L2295) | default only (:5814); never forced == 1 |
| enqueue default = nightcall overlay (L2269) | :5762, :5767 |
| `defaultIterateRounds` iteration (L2270) | :5834 default; :5551 budget halt; :5555 receipt stop |
| overlay passed to OMP | not stated in run-logic; code only: :8497, snapshot :8719-8720 |
| leading `/skill:ufo` + `/skill:godspeed` (L2320) | :8708 |
| bare alias resolves in global config (L1036) | :3658-3680 → `omp-global-config.mjs:489` |
| spec selects alias, never route (L1042) | :5738-5744 (a matching `route` is tolerated) |
| no overlay declares an L1 route (L1042) | `check-routing-free-config.mjs` (name list, `config/**` only) |
| `no_alias` skip, unsealed (L1384) | `ufo-l0-watch.mjs:1225-1279` |

The parity rule (build.rs) is not stated in run-logic prose at all; only the
build.rs header carries it.
