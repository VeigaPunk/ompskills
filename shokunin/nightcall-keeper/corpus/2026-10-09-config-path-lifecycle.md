# config-path-lifecycle — `missionFormat.configPath` end to end

Lanes `QueueConfigPath`, `TowerFleetFormatRead` (scouts). L1 re-read the cited lines.

Dispatcher (`scripts/fleet-dispatcher.mjs`):
1. Policy load :3569: containment only.
2. Enqueue: a fleet spec may omit `configPath` (resolves to the canonical one,
   :5762) or set exactly that path after normalization. Any other value fails
   with `fleet queue config path must be config/mission-nightcall.yml` (:5767).
   A non-fleet spec MUST supply one (`queue config path is required`,
   :5756-5759). At enqueue `mustExist: true` and a 4 MiB bound apply, and
   `configSha256` is frozen into the row.
3. Stored rows (`validateQueueTask` :4492): lexical containment only. Frozen
   rows are never retrofitted (test `nightcall_frozen_row_untouched`).
   Successors copy the parent's `configPath` + `configSha256` (:5409-5472).
4. Dispatch: argv `--config task.configPath` (:8497). The body is re-read and
   compared to `configSha256`, failing with `config_drift` on mismatch
   (:8556-8582). Then the argv value is **replaced** by the session snapshot
   `.ufo/sessions/<runId>/dispatch-snapshot-<n>/config.json` (:8719-8720). The
   child never sees `config/mission-nightcall.yml` itself.

Tower launcher (`sighting/tower-fleet.mjs`, this repo): it never reads
`missionFormat.configPath`, `id`, or `defaultIterateRounds`. `loadBandAuthority`
reads only `l1Alias` (:140,:156), and argv hardcodes
`path.join(spec.ufoRoot,"config","mission-nightcall.yml")` (:476 HEAD). If
`configPath` were ever changed, the two launchers would silently diverge.

`check-hand-authored-sets.mjs:89-99`: `configPath` must match
`^config/mission-[^/]+\.yml$`, and the set of `config/mission-*.yml` on disk must
equal exactly `[configPath]`. This is a lint, not a runtime gate.
