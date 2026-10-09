# tower1-root-artifacts — tower1's non-standard root artifacts

Source: r1 lane `Tower1RootArtifacts` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Classify wave-family files at tower1's state-dir root.

## Observed

- 28 wave-family files at root: 16 specs, 4 plans, 6 dispatch payloads, 1 empty `.err`, 1 agent-name list. Attribution: routing 9, wavetest 7 (incl. `priors-r0` fixture), smokedoc 3, wall 2, audit-launcher 2, tf-launcher 2, towerdoc 2, band 1.
- Other placements: `specs/`, `tf-audit-docs/` (spec + identity assignments), `policy/` (overlay), `ufo-fixture/config/ufo.json` (band fixture), `.ufo/scopes/` (registries + lane reports when no `reportDir` was declared).
- **Not** a time-ordered migration: root and `waves/` were written concurrently from 22:23 local; the `waves/` rule (`sighting/l1-prompt.md:79`, commit `10bea64` 22:51) came later and 8 of 28 root files postdate it. Placement is per-L1 choice.
- routing-r1: 35 lanes dispatched, published record is the folded 32-lane set (lanes 26/30/33 null `agentId`).

## Unknowns

- Dispatch status of unreferenced payloads [INFERENCE].
