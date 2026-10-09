# gates-battery — scripts/gates.sh, gates-plan.mjs, dev-verify.sh, smoke.sh

Asked: the gate battery, its ordered stages, the plan helper, and the package.json → file
resolution. Source: lane GatesAndVerify report. Anchor: ufo-fsd-alpha@5ace2559.
sha256: `gates.sh` `aa5fcad6…` (1002 lines), `gates-plan.mjs` `594ab249…` (201), `dev-verify.sh`
`f4022711…` (28), `smoke.sh` `625fd8ce…` (83).

## Observed

- `gates.sh` bootstrap: source resolution `:8-19` (exit 2), scratch TMPDIR `:97-110`, evidence-redirect
  guard `:559-581`, flag parse `:587-604`, `UFO_GATES` validation `:609-616`, fast plan via
  `node scripts/gates-plan.mjs` `:621-632`, then stamps: `GATES-RUNNER-SHA1` `:639` + a battery SHA1
  over 45 files `:641-679`.
- Stage order: wall probe (tmux / sighting session / tick handoffs) `:547-549`, **canonical contract
  mirrors** = `npm run contracts:check` `:734` (always), fleet group `:749-787`, retention + census
  suites `:806-809`, l0 group `:825-829`, swarm group `:843-846`, hooks group `:860-864`,
  portable compatibility `:878-879`, post-run contract mirrors `:887` (always), L3/sekhmet dry-run
  block `:894-998` (`--with-l3-compat` only, advisory), census/index emit `:1000-1002`.
- Index vocabulary is closed: 3 wall + 31 always + 5 conditional = **39** labels; floors `wall≥3`,
  `always≥30` (`:38-75`, `:304-377`); every stage records `label|PASS|FAIL|SKIP`; `--wall-probe-only`
  records SKIP for all later stages and exits 0 after the census (`:690-727`).
- `gates-plan.mjs` selects the fast-tier groups (`fleet, retention, l0, swarm, hooks, portable`) from
  `--root`/`--touched-file`/`UFO_GATES_TOUCHED`; it **executes no gate** (only git via `execFileSync`
  `:105-113`), is fail-safe to all groups on any uncertainty (`:116-158`), and emits
  `touched=/basis=/group=/note=` stdout lines (notes capped at 20, `:187`); exit 2 missing value, 64
  unexpected arg.
- `dev-verify.sh` is a pure exec alias: source-resolution refusal `:21-24` then
  `exec bash scripts/gates.sh "$@"` `:28` — no stages of its own.
- `smoke.sh` stages S1 source `:8-19`, S2 arm receipt `.ufo/smoke-last-receipt.json` `:27-30`,
  S3 `contracts:check` `:32`, S4 `build -w @ufo/contract-support` `:33`, S5
  `self-iter.sh --task "UFO-FSD smoke" --rounds 2 --concurrency 6` `:42`, S6 receipt assert `:50-82`,
  S7 green `:83`. No tier/flags/index/env knobs.
- package.json resolution: `gates`→`scripts/gates.sh`, `dev-verify`→`scripts/dev-verify.sh`,
  `smoke`→`scripts/smoke.sh`, all exist; every transitive target exists (gates-plan.mjs, the five
  contracts:check scripts, tsconfig.json, `tests/orchestrator.test.js`, the 45 battery files,
  `self-iter.sh`, contract-support build). **No dead links.**

## Contract

| rule | evidence |
| --- | --- |
| `npm run gates/dev-verify/smoke` map to the three scripts | `package.json:19-21` |
| Tier `UFO_GATES=fast|full` (fast default); fast keeps wall + contract mirrors and selects groups | `gates.sh:77-84`, `:621-632` |
| An unselected stage records SKIP under its full label, never silently absent | `:262-302` |
| A failed run emits the index (with FAIL) before `FAIL:`; a crash emits no `GATES-CHECKS-END` | `:155-193` |
| `gates-plan.mjs` is fail-safe and executes nothing | `gates-plan.mjs:1-16`, `:116-190` |
| L3/sekhmet is advisory: `--with-l3-compat` only, failure ⇒ SKIP and exit 0 | `gates.sh:411-421`, `:894-998` |
| AGENTS.md directs `bash scripts/gates.sh` after runtime/guidance/substrate changes | `AGENTS.md:85-86` |

## Not carried by the source

- No `drill`/`ufo-drills.mjs` stage in `gates.sh` (3 mentions, none an invocation); no git-gated stage
  (git only stamps, absence degrades to `unknown`); no tmux-gated stage in `gates.sh` itself (the wall
  probe fails without tmux; the night-watchdog tmux skip is inside the suite).
- `smoke.sh` has no tier/flags/index/census; `dev-verify.sh` has no stages; no workspace package.json
  carries `gates`/`dev-verify`/`smoke`.

## Unknowns

- Whether all 45 battery-stamped files are actually executed is a source comment claim (`:641-647`),
  not verified here — several are modules no stage names directly, exercised transitively [INFERENCE].
- Runtime outcomes / `GATES-PLAN` output for a given diff were UNOBSERVED (no gate run).