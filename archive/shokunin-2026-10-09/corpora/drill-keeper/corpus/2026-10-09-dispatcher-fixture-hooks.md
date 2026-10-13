# dispatcher-fixture-hooks — fixture hooks in `scripts/fleet-dispatcher.mjs`

Asked: every `UFO_*` env read, the exec-path gate, the classifier fixture, and which verbs mutate.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `DispatcherFixtureHooks` (grep/read; 9829-line file).

## Env surface (17 reads)
| var | default | gate |
| --- | --- | --- |
| `UFO_PROJECT_ROOT` | `<module>/..` | none (it defines ROOT) |
| `UFO_STATE_DIR` | `ROOT/.ufo` | none; children `beneath` it |
| `UFO_CONFIG_PATH`, `UFO_SIGHTING_PATH`, `UFO_GODSPEED_DIRECTIVE_PATH` | under ROOT | `gatedExecPath` at module load (`:58-93`) |
| `UFO_FLEET_ALLOW_EXTERNAL_TOOLS` | off | the escape: only `=== "1"` |
| `UFO_FLEET_LEDGER_PATH`, `UFO_PENDING_WORK_PATH` | under `UFO_STATE` | `beneath(UFO_STATE)` → usage error |
| `UFO_CLASSIFIER_FIXTURE_PATH` | unset | raw `beneath(ROOT)`; **silent null** on refusal; no escape |
| `UFO_OMP_BIN` | `omp` | path form gated per call |
| `UFO_OMP_GLOBAL_CONFIG_PATH` | discovery | **no containment** (`omp-global-config.mjs:556-558`) |
| `UFO_MODELS_DB_PATH`, `UFO_OMP_SESSIONS_ROOT`, `UFO_XBRD_SPARK_ROOT`, `UFO_FLEET_POLL_SEC`, `UFO_FLEET_DISABLE_LEDGER_MODULES`, `HOME` | various | none |

`gatedExecPath`: `resolve(env || fallback)`; when an env value is set and the escape is off, it must sit `beneath(ROOT)` (realpath-anchored, symlink components refused) or the process throws `EXEC_PATH_OUTSIDE_ROOT` at import. Sibling copies of this gate live in `ufo-mission-result.mjs`, `ufo-swarm-collect.mjs`, and `ufo-swarm-wave.mjs` (the reason the wave validator needs `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` under a scratch project root).

## Classifier fixture (`:1276-1340`)
Read on **every** `classifyFailure` call (no memo), bounded to 64 KiB (`CLASSIFIER_FIXTURE_BYTES`), `O_NOFOLLOW`; only `byCode` is used. If any value is not in `FAILURE_CLASSES`, the whole fixture is discarded. A valid mapping wins over timeout/signal/HTTP status. **Validation is membership-only**, so `authentication → usage_limit` (auth reclassified as capacity, which then hops routes) is accepted. That contradicts the comment at `:196-198`/`:1321-1324`.

## Verbs (`main` `:9536-9673`)
Pre-verb effects (mkdir of ledger/queue parents, stale-tmp sweep) run for **every** verb, including `view`, `status`, and unknown verbs. `enqueue --dry-run` still takes the queue lock and writes `owner.json`. `repend`, `archive-completed`, `compact`, `once`, and the default daemon mutate. There is no `--help`; an unknown verb exits 1.
