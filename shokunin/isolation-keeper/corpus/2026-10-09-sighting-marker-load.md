# sighting-marker-load — the marker gate at load vs pane start

Asked: quote the marker revalidation at load and the transition ownership refusal.
Source: `scripts/ufo-sighting.mjs:84-133,4306-4334`;
`scripts/prepare-ephemeral-l1.mjs:756-812`. Lane `SightingMarkerLoad` (scout).

Match fields at load (:127-133): `marker.schema` vs `markerSchema` (:127),
`marker.root` vs `stored.ephemeralRoot` (:128), `marker.envFile` vs the env file
path (:129), `Array.isArray(marker.activePids)` (:130), `activePids.length === 0`
(:131), `allowedMarkerStates.includes(marker.state)` (:132) → one refusal
`ephemeral marker does not attest the required inactive root state` (:133).
Default states `["prepared"]` (:84); `runPane` requires `["registered"]` (:4353).
Load does **not** apply `assertExactKeys` to the marker.

Transition ownership refusal (``transitionEphemeralMarker`` :4306-4308): `marker
?.schema !== markerSchema || marker.root !== environment.ephemeralRoot` →
`ephemeral marker ownership changed before pane start` — **schema+root only;
`envFile` is not re-checked** in the transition. The expected-state map
(:4309-4314):

```
{ registered:"prepared", prepared:"registered", active:"registered",
  finished:"active" }
```

A mismatch (`!expected || marker.state !== expected || !Array.isArray
(activePids)`) → `ephemeral marker cannot transition from <state> to <state>`
(:4315). Writes: `state = requested`; `activePids = state === "active" ?
[process.pid] : []` (:4325-4328); atomic tmp + `rename`, mode 0600 (:4329-4333).
`state === "finished"` additionally requires the current pid in `activePids`
(:4318); `state !== "finished"` requires empty pids (:4322).

Edges with call sites: `prepared→registered` (:2415, launch, under the operation
lock); `registered→prepared` rollbacks (:2429, :2443, :4361); `registered→active`
(:4367, runPane); `active→finished` (:4391, runPane finally). Two-process
handshake: the launch CLI stamps `prepared→registered`; the pane process demands
`registered` at load, then `active`, then `finished`.

Destroy consumer side (`prepare-ephemeral-l1.mjs:806-810`): refuses `active` /
any non-empty pids (:806), refuses `registered` by name (:809), accepts only
`prepared|finished` (:810).

## Unknowns

- No test directly asserts the :133 load-side marker-match refusal; the destroy
  refusals are tested (`tests/prepare-ephemeral-l1.test.js:959-991`).