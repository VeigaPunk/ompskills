# state-governor-surface — census, retention, and the mission display trio

Asked: the state governor scripts — verbs, state paths, observer-vs-mutator, the declared `.ufo` layout.
Source: lane StateGovernorScripts report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- Verdict: `ufo-state-census.mjs` is a **pure observer** (header `:12`; imports only `lstatSync`,
  `readdirSync`; exports `CENSUS_SCHEMA` `:22`, `censusState` `:28`; flags `--state-dir/--top/--max-entries`).
  `ufo-mission-lifecycle.mjs`, `-activity.mjs`, `-observation.mjs` are pure projections with **no
  `.ufo` state access** — they read only caller JSON through bounded filesystem helpers
  (`mission-lifecycle.mjs:2` "Display evidence only. The wall/dispatcher still own every lifecycle
  mutation"; `mission-activity.mjs:9` "Inputs are not mutated"; `mission-observation.mjs:4` "Pure
  projection only"). **Retention is the only state-governor mutator: `cap` and `sweep` mutate only
  when invoked with `--apply`, under the state-root retention lock; `watch` has no `--apply` flag,
  acquires a per-session lock, and internally runs `capSession` with `apply: true`** (`:4-27`,
  `:2015-2027`; exports `CAP_BYTES 100 MiB` `:80`, `RUN_BASH_LOG_CAP_BYTES 1 GiB` `:81`,
  `sweepSessions` `:1410`, `parseArgs` `:1956`, `runCli` `:2029`).
- Tests: census 3; retention 26; activity 5; observation 4; lifecycle has **no sibling** — its CLI is
  pinned by `tests/mission-adaptations.test.js:724-902`.
- State tree authorities: root `$UFO_STATE_DIR` || `$UFO_PROJECT_ROOT/.ufo` (`fleet-dispatcher.mjs:34-35`);
  `pending-work.json` `config/ufo.json:77`; `scopes/<fleet>/` (`AGENTS.md:16,195`); `sessions/<runId>/`
  (`AGENTS.md:326`, run-logic `:1443,1784`, id shape `/^gq[a-f0-9]{16}$/`); `sighting/manifest.json`
  (`ufo-state-retention.mjs:174`); `sighting/observations.json` (run-logic `:1540`, written by the
  dispatcher); `fleet-ledger.jsonl` (run-logic `:2392-2395`); `rounds/<runId>/r<NN>-digest.json`
  (`ufo-round-digest-v1`, run-logic `:127-128`); `results/` round reports (`THE-TICK.md:54-56`);
  `reclaim/` manifests (`ufo-runtime-reclaim-v1`, retention `:182`); `stale-watchdog-state.json` /
  `night-watchdog-repends.json`; `drills/<id>/` (`config/ufo.json:10-12` establishes the drill-evidence
  path; `drills/summary.json` is not established by that cited source).
- Layout doctrine: run artifacts (sessions, scopes, results, dispatch snapshots) are gitignored and
  pruned at completion — "No artifact piles; stale run output is laggard, not evidence"
  (`AGENTS.md:343-345`). The debloat audit measured ~175 GB in gitignored `.ufo/`
  (`.ufo/sessions/` 163 GB, `.ufo/scopes/` 13 GB) — the root cause the census/retention pair bounds.

## Contract

| script | verbs | state paths read | mutates? | tests |
| --- | --- | --- | --- | --- |
| `ufo-state-census.mjs` | none (flags only) | whole state-root walk (`$UFO_STATE_DIR` \|\| `<repo>/.ufo`) | **NO** | 3 |
| `ufo-state-retention.mjs` | `cap`, `sweep`, `watch` | `.ufo/sessions/`, `sighting/manifest.json`, `pending-work.json`, `fleet-ledger.jsonl`, `stale-watchdog-state.json`, `reclaim/` manifests | **YES** (apply-only, locked) | 26 |
| `ufo-mission-lifecycle.mjs` | none (single `[file\|-]`) | none — caller JSON | NO | (in `tests/mission-adaptations.test.js`) |
| `ufo-mission-activity.mjs` | positional `json\|text` + `[file\|-]` | none — caller JSON | NO | 5 |
| `ufo-mission-observation.mjs` | none (single `[file\|-]`) | none — caller JSON (dispatcher persists `observations.json`) | NO | 4 |

## Not carried by the source

- **`.ufo/reports/` does not exist** — the report-bearing dirs are `.ufo/results/` (committed round
  reports) and per-scope `.ufo/scopes/<scope>/{rNN-plan,rNN-verdict}.md` + `fleet-state.md`. The
  "reports" slot is named `results` in the substrate.
- No mutation path in census; `capSession`/`watchRun` are not exported; retention carries no live
  100 MiB writer bound — live open-writer generations are reported `defer_open_writer` (`:29-33`).

## Unknowns

- `BEHAVIOR-MATRIX.md:349` says the retention suite was "21/21" at 2026-09-21 while the file has 26
  `test(` declarations — gate restatement or added pins not traced **[INFERENCE: suite grew]**.
- Whether `gates.sh` runs `tests/mission-adaptations.test.js` in a named suite was not confirmed
  (`package.json:17 node --test tests/*.test.js` covers it).
- Whether census's `UFO_STATE_DIR || <scripts>/../.ufo` default is identical to the dispatcher's
  `UFO_PROJECT_ROOT` anchor under an externally set `UFO_PROJECT_ROOT` was not probed.