# marker-transition-states — the complete state machine

Asked: produce the complete marker state machine with an owner per edge. Source:
`scripts/ufo-sighting.mjs:2415,2429,2443,4291-4334,4361,4367,4391`;
`scripts/prepare-ephemeral-l1.mjs:726,806-810`. Lane `MarkerTransition` (scout).

Transition map (`transitionEphemeralMarker` :4310-4314):
`{ registered:"prepared", prepared:"registered", active:"registered",
finished:"active" }` — every write is keyed by the *requested* state.

| edge | writer | admitting reader |
| --- | --- | --- |
| create → `prepared` | prepare :726 (write :736) | load default `["prepared"]` (:84+132); destroy :810 |
| `prepared` → `registered` | ufo-sighting :2415 (launch, under the op lock) | load `["registered"]` (:4353) |
| `registered` → `prepared` (rollback ×3) | :2429, :2443 (:4361 pane build throw) | load default; destroy |
| `registered` → `active` (`activePids:[pid]`) | :4367 | **no** `allowedMarkerStates` set |
| `active` → `finished` | :4391 | destroy :810 |

`prepared` is the only state with both an inbound create edge and rollback
inbound edges. `active` is written but admitted by no reader — intentionally
never loadable/destroyable; destroy refuses it by name (:806). `finished` has no
outgoing edge. Every admitted state has a writer; there is no reader gate without
a writer.

`activePids` invariant: written `[process.pid]` at :4327; `finished` requires the
pid present (:4318); loaders require empty (:131); destroy refuses non-empty
(:806). No reconcile path writes a marker state — `reconcileLocked`/pane
classification touch tmux markers only (stated as absent, not inferred).

## Residual (strand)

A `SIGKILL`ed pane leaves the marker `active` with a **dead** pid and nothing
repairs it: ordinary destroy refuses, `--force` refuses too (identity gate), and
the CLI has no other verb. That strand has **no recovery path**.

## Unknowns

- No source statement of whether the transition set is intentionally minimal.