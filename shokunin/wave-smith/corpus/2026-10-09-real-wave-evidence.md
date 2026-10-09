# real-wave-evidence — conventions observed in dispatched fleet waves

Asked: what the real wave artifacts prove that reading the source does not.
Source: `.tower/fleets/tower1/**` and `.tower/fleets/towerprobe/**` — 24 specs, 5 plans, 7
dispatch payloads, 23 registries (counts verified for those two fleets only); plus
towerprobe's band-point reports.
Anchors: JSON artifacts and directory walks, not validator source lines — there are no
`:line` anchors here by design; the exact per-artifact paths live in the lane's round-1
report under `reports/wave-smith/`. Lane: `RealWaveEvidence`.

| artifact | observed convention |
| --- | --- |
| `reportDir` | `reports/<missionId>` **relative to `UFO_PROJECT_ROOT` (= the fleet state dir)**; the registry lands at `<reportDir>/swarm-registry.json`; no `reportDir` → `.ufo/scopes/<wave>/swarm-registry.json` |
| shared across rounds | one registry file accumulates rows across a mission's rounds (48/51/54 rows); exceptions: a per-round `reportDir`, and wall-scoped `reportDir`s |
| `wave` id | `tf-<missionId>-r<N>`, single-segment; a few exceptions without the prefix |
| handles in practice | `record` wrote handle == member name in some missions (34/34, and the band probes); several missions recorded **all-null** handles because "the batched call returned job names, not ids" — nobody resumable; synthetic probe handles look like `agent-r1prior0000000000NN` |
| resume rows | **zero** `kind:"resume"` rows exist in any fleet registry — resume-row shape is only visible in plan JSON quoted in reports |

Band arithmetic proven from the artifacts (towerprobe points + tower1 laps):
floor/ceiling are inclusive (`strict >`), `too_many_lanes` (cap 100) precedes the band
checks, a mixed wave counts resumes toward the band total (1 spawn + 31 resume = 32
admitted), resume-only is exempt from floor **and** ceiling but not the cap
(1/15/33/100 admitted, 101 refused `too_many_lanes`), a per-spec `maxLanes` tightens only
and binds resume-only too, and 100 spawn lanes under a 16–32 band is `wave_too_wide`, not
`too_many_lanes`.

Notable observed history: the **live band flapped** during the probe window (a 32..100 band
was in force for ~8 minutes, then the 16..32 band — sha `0e416f0a`, the current one — was
restored). Under the wide band, `tf-audit-routing-r1` ran a real **35-lane** wave, which is
over this mission's 32 ceiling; it was folded to 32 after the band was restored (folded
spec/plan/dispatch on disk). Also observed: no `wave_registry_collision` or `handlesReset`
**event** anywhere — those codes appear only in documentation/audit listings, and all 7 real
dispatch payloads omit the `handlesReset` key.

## Not carried by the source

- The artifacts show no round-level lane accounting anywhere, and no applied hoist (every
  real plan carries the inert compaction block).
- Registries are shared across rounds, so a real registry alone never proves which wave
  wrote a row.

## Unknowns

- Whether the null-handle missions were ever resumed (their agents were parked under job
  names, so `resume` by name would have been needed).
- The prior registry's row count (101 rows) exceeds its spec's 32-item "never dispatched"
  text — unreconciled.
