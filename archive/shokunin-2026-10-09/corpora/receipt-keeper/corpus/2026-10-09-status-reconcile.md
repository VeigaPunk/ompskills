# status-reconcile — verbStatus reconciliation and its observed output

Source: r1 lane `StatusReconcile` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: line 1106 `ok: true` literal read at HEAD.

## Asked

How status combines wall, fleet.json and spec, and what it shows for a finished fleet.

## Observed

- Inputs: wall `status --lite` (live `missions[]` + retired `completed[]`/`stopped[]`), `readFleetState` (:1008), `spec.missions`. Row key `wallRowId = runId ?? missionId` (:544-546).
- `source`: `wall` (live) | `wall-retired` | `state` (fleet.json only) | `spec` (spec only). Row fields: `id missionId title source status live paneId fleet foreignFleet inFleetState inSpec rounds` (+`failure` on state and wall-retired rows).
- Not-on-wall rows: `status: "not-on-wall"`, `live:false`, **`paneId:null` even when fleet.json recorded one** (:1095).
- `reconciliation{fleetStatePresent, onWallNotInState, inStateNotOnWall, foreignFleetRows, retiredRows, staleMissionCount}`; JSON `ok:true` is a literal (:1106) — status never fails on divergence.
- Observed: `node sighting/tower-fleet.mjs status --spec .tower/fleets/towerprobe/spec.json --json` → exit 0, `inStateNotOnWall:["tf-probe-band"]`, row `source:"state"`, `paneId:null`, `rounds:["tf-probe-band-r1.md"]` while fleet.json recorded `%5`.

## Unknowns

- Why tf-probe-band left the wall manifest (likely removed row) [INFERENCE].
