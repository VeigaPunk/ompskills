# probe-and-drill-surface — probes, drills, charter-scribe, lean-cargo, local-helper

Asked: the probe/drill surface — families, what each reads/writes, and which must never be run.
Source: lane ProbeAndDrillScripts report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- Families: route-health probes (`probe-ufo-route-health.mjs` 1195 ln, `probe-redact.mjs` 116,
  `probe-token-plan-shared.mjs` 159, `-kimi.mjs` 147, `-models.mjs` 244 + committed
  `probe-token-plan-models.verdict.json`); swarm preflight (`ufo-route-preflight.mjs` 176);
  credential screening (`ufo-credential-screen.mjs` 68, library); ephemeral L1
  (`prepare-ephemeral-l1.mjs` 962 + `config/ephemeral-l1.machine.json`; the bwrap argv is built and
  executed by `ufo-sighting.mjs:4194-4290`); drill harness (`ufo-drills.mjs` 1726 + 67
  `drills/*.drill.json` + `config/ufo.json#drills`); charter-scribe (`sync.mjs` 844, `config.json`,
  `prompts/kimi-update.prompt.txt`, `systemd/{service,timer}`); lean-cargo (`bin/cargo-shim.sh` 344,
  `install-shim.sh` 69, `measure.sh` 98, README); `local-helper.mjs` 360.
- Route-health probe contract: `--route provider/model:effort`; exit 0 healthy+clean / 3
  clean-unhealthy / 2 cleanup-fail / 1 fatal; payload `{ok,healthy,checkedAt,timeoutMs,results[]}`;
  state confined to `<ROOT>/.ufo`, 0600 fsync+rename, schema `ufo-route-health-state-v1`. It **must
  stay standalone** (no sibling imports) because `tests/route-probes.test.js` copies the single file
  into a fixture scripts dir; `probe-redact.mjs`'s table is mirrored by hand under a `PARITY:` comment.
- Token-plan pair: OMP is the only credential authority; the catalog comes from
  `omp models alibaba-token-plan --json --no-extensions`; the kimi probe prints only, the models
  probe persists a fail-closed `<self>.verdict.json` before printing; every verdict carries
  `checkedAt`; `assertNoSecrets` refuses credential-shaped payloads.
- `ufo-route-preflight.mjs`: `ROUTE_PREFLIGHT_SCHEMA=ufo-route-preflight-v1`; exports
  `routeFamilies/commandProbe/probeFamilies/routePreflight` + `RoutePreflightError('usage'|'route_unreachable'|'route_config_unavailable')`;
  report `{schema, config{path,sha256}, concentration{families,largestFamilyLanes,pinnedLanes,singleFamily}, unpinned[], status, pings, families[]}`;
  `singleFamily = families.length===1 && largest>1` (`:161`); no project-local route fallback;
  callers `ufo-swarm-wave.mjs:116,1331,1390`, `prepare-ephemeral-fleet.mjs:59,202`.
- `prepare-ephemeral-l1.mjs` **authors** (does not execute) the bwrap-isolated compatibility L1:
  policy `config/ephemeral-l1.machine.json` (schema `ufo-ephemeral-l1-policy-v1`, root
  `/scratch/tmp/vgpnk/ufo/ufo-ephemeral-l1`, `sandbox.executable=bwrap`); writes
  `<root>/<id>/{checkout,isolation/**,.ufo-ephemeral-l1.json,environment.json,config/sandbox-resolv.conf}`;
  every planted file `O_CREAT|O_EXCL|O_NOFOLLOW` 0600 flush; `auth.json` copied only when explicitly
  named; CLI `create|destroy`.
- `ufo-drills.mjs`: a drill is code + expectation on deterministic fixture routes (no OMP/OAuth/
  network, I10); schema `ufo-drill-v1`; statuses wired 51 / pending-mechanism 11 / referenced 5 = 67;
  executors cargo-test 25, self-iter 9, sync-check 8, node-test 7, judge-handoff 1, shell 1; evidence
  `.ufo/drills/<id>/{stdout.txt,stderr.txt,result.json}` + `summary.json`; a coverage-ratio ratchet
  fails a placeholder majority; closed vocabularies fail closed at load. The real runner is
  `ufo charter` Phase 0 stage 3 (`crates/ufo-cli/src/main.rs:965-973`), **not** `gates.sh`.

## Contract

| rule | anchor |
| --- | --- |
| The route-health probe is the only sanctioned route prober and is standalone (hand-mirrored redaction table) | `probe-ufo-route-health.mjs:60-63`; `tests/route-probes.test.js` |
| Verdicts are secret-proofed before emission; `ok` (cleanup) ≠ `healthy` (verdict); exit 0 needs both | `:1078-1185` |
| A probe that persists evidence fails closed (previous file removed first; exit 2 if the durable write did not complete) | `probe-token-plan-models.mjs:182-184` |
| Preflight never falls back to a project-local route; unreachable family ⇒ typed `route_unreachable` before the registry is written | `ufo-route-preflight.mjs:143-172` |
| Isolation is authored, not executed, by `prepare-ephemeral-l1.mjs`; bwrap runs only inside `ufo-sighting` | `ufo-sighting.mjs:4194-4290` |
| A drill never touches live providers; pending/referenced rows never run; unknown keys fail closed | `ufo-drills.mjs:1-33`, `:588-630` |
| The drills runner is `ufo charter` Phase 0; `config/ufo.json#drills` survives only as a membrane drift check | `main.rs:965-973`; `sync-ufo-contracts.mjs:1377-1397` |
| charter-scribe is a reporter with exactly one push target and never touches the substrate's remote | `charter-scribe/sync.mjs:1-31` |

**Must not be run** (network/credentials/writes): `probe-ufo-route-health.mjs`,
`probe-token-plan-{models,kimi,shared}.mjs`, `charter-scribe/sync.mjs` (also commits and pushes),
`lean-cargo/install-shim.sh` (installs into `~/.cargo/bin`).

## Not carried by the source

- No `probe-*` script targets a "credential screen" — `ufo-credential-screen.mjs` is a plain module
  with no CLI, exit code, or verdict. No probe reads API keys or constructs `Authorization`.
- No `drills/` evidence exists at HEAD (`.ufo/drills/` absent); evidence is produced only by a run.
- No test file for `probe-redact.mjs`, `probe-token-plan-shared.mjs`, `ufo-credential-screen.mjs`,
  `ufo-drills.mjs`, or `lean-cargo/*`; `gates.sh` runs only `tests/prepare-ephemeral-l1.test.js`
  (`:756`) and `scripts/ufo-route-preflight.test.mjs` (`:845`) from this family.

## Unknowns

- `config/ufo.json#drills.note` claims a `gates.sh` drills stage that does not exist (stripped in
  `91cc18fe` per `sync-ufo-contracts.mjs:1371-1375`) — tolerated staleness or unlanded intent is not
  determinable from the tree. The token-plan probes' target set is derived from the ambient global
  OMP config, so it is not a repo fact. `local-helper.mjs`'s loopback backend
  (`127.0.0.1:34113`) has no in-repo launcher.