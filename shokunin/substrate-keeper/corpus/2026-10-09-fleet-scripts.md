# fleet-scripts — the fleet lifecycle scripts and the ledger artifact

Asked: `fleet-dispatcher.mjs`, `fleet-ledger-read.mjs`, `fleet-ledger-rotate.mjs`,
`fleet-selfheal-verify.mjs`, `land-fleet-run.mjs`, `prepare-ephemeral-fleet.mjs` — purpose, verbs,
reads, writes, tests; the ledger contract; the wall/tower relation.
Source: lane FleetLifecycleScripts report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- `fleet-dispatcher.mjs` verbs: `daemon` (default) `:9675`, `view` `:9544`, `enqueue` `:9553`,
  `repend` `:9573`, `archive-completed` `:9583`, `status` `:9608`, `compact` `:9646`, `once` `:9651`;
  unknown → usage error `:9673`. Exports exactly `redact` `:345` and `resultReceiptValid` `:6564`.
- Dispatcher shells out only to `node` + `scripts/ufo-sighting.mjs` (`spawnSync` `:1188` status,
  `:8764-8788` launch/resume with `--no-open --relay --runner-reservation`, `:8790` reconcile, `:9101`
  complete) and to `spawnSync(ompBin,["models","refresh"])` `:1652`. **No `git` call** and **no `tower`
  token** anywhere in it.
- Ledger contract: live `<UFO_STATE>/fleet-ledger.jsonl` (default `.ufo/fleet-ledger.jsonl`; env
  `UFO_FLEET_LEDGER_PATH` first); hot segments `.1…5` (`MAX_LEDGER_SEGMENTS = 5`); cold archives
  `<segment>.<uuid>.cold` (eviction) and `<segment>.<sha256>.cold` (compaction pre-image); rotation
  sidecar `fleet-ledger-rotation.jsonl`; record schema `ufo-process-lifecycle-v1`, rotation record
  `ufo-ledger-rotation-v1`, compaction header `sb-ledger-compaction-v1`; rotation threshold
  `MAX_LEDGER_BYTES = 10 MiB` (`fleet-dispatcher.mjs:99`, `fleet-ledger-rotate.mjs:105`).
- Ownership: append = dispatcher (`appendLines` `:1043` → rotates); read = `fleet-ledger-read.mjs`
  (`loadLifecycleLedger` `:381`; dispatcher prefers the sibling at `:1995` with an inline fallback
  `:1862`); rotate = `fleet-ledger-rotate.mjs` (`rotateLedgerIfNeeded` `:887`); land =
  `land-fleet-run.mjs` (`landFleetRun` `:50`) — run publication, not ledger.
- Tests: `fleet-dispatcher.test.mjs`, `fleet-ledger-read.test.mjs` (dual-reader: legacy must fail,
  streaming must pass), `fleet-ledger-rotate.test.mjs`, `prepare-ephemeral-fleet.test.mjs` (also
  covers `land-fleet-run`); `fleet-selfheal-verify.mjs` has **no** test and no exports — it *is* the
  e2e harness run by `scripts/gates.sh:764-767` (fleet group).

## Contract

| script | purpose | reads | writes |
| --- | --- | --- | --- |
| `fleet-dispatcher.mjs` | drains the task-backed pending-work queue; empty queue = idle | `config/ufo.json` policy, queue (`UFO_PENDING_WORK_PATH` ?? `sighting.dispatch.queuePath`), sighting manifest, ledger, `ssot/godspeed-core/directive.md`, `$HOME/.omp/agent/sessions/**` | ledger appends + rotation, queue + `pending-work-archive.jsonl`, `.ufo/archive/`, `sessions/<runId>/dispatch-snapshot-*/`, `sighting/observations.json` |
| `fleet-ledger-read.mjs` | streaming reader | ledger live + `.1…5` | nothing durable |
| `fleet-ledger-rotate.mjs` | rotation, compaction, cold preservation | live + hot + cold + lock | compacted segments, `.cold` archives, `fleet-ledger-rotation.jsonl`, `<ledger>.rotate.lock` |
| `fleet-selfheal-verify.mjs` | e2e proof harness for the 2026-09-16 overflow | dispatcher bytes, fixtures | `.ufo/scopes/selfheal-prove/fixtures/**`, `--report` JSON |
| `land-fleet-run.mjs` | operator-authorized publication of a finished ephemeral run | run manifest, `config/ephemeral-fleet.machine.json`, `<runRoot>/origin.git`, closure receipt | `stateRoot` (0700) + `landing.lock`; on `--authorize` the remote `refs/heads/main` |
| `prepare-ephemeral-fleet.mjs` | per-run isolation with an auditable local bare origin | `ephemeral-fleet.machine.json` policy, source repo, `$HOME`, route probe | `<root>/<runId>/{repo,origin.git,home,runtime,archives,manifest.json}`, `<root>/archives/<runId>.tar` + receipt |

## Not carried by the source

- No dispatcher verb named `reconcile` (it runs in-cycle and as a failing-launch recovery spawn
  `:8790`). No `git` in the dispatcher. No `tower` token in any of the six scripts — the tower
  launcher is an OMP skill whose only substrate coupling is `scripts/ufo-sighting.mjs` and
  `omp worktree`. No `land-fleet-run.test.mjs` (coverage in `prepare-ephemeral-fleet.test.mjs`).
  Documented dispatcher names `maybeEnqueueIterationSuccessor`/`auto-reap` (`docs/AUTO-SHIP.md:9`)
  are **absent** from the file.

## Unknowns

- Test case counts / pass state not exercised (gate batteries write). Whether `land-fleet-run.mjs`
  is an executed `gates.sh` stage vs only a SHA-stamp list entry at `:672` (the executed stage is
  `prepare-ephemeral-fleet.test.mjs` at `:755`).