# band-authority-live-read — loadBandAuthority keys, refusals, and precedence

Item: `loadBandAuthority` + the prompt's snapshot/re-read paragraphs.

Observed live keys: `dispatch.maxConcurrentL1`→maxConcurrentL1 (16); `sighting.windowPaneCeiling`→windowPaneCeiling (16); `dispatch.swarm.waveMinLanes`→waveMin (16); `waveMaxLanes`→waveMax (32); `maxLanes`→roundLaneCeiling (100); `dispatch.missionFormat.l1Alias`→l1Alias (m_strong, String-coerced). `swarm.minLanes` is NOT read by the launcher.
`CONFIG_UNREADABLE` (exit 2, TypedError): unreadable/bad JSON; missing key; non-positive int; impossible band (`waveMin > waveMax`); unsafe alias token. All five observed verbatim in /tmp probe runs, each refusing before spec validation with zero mutation.
Precedence: the prompt's band/ceiling rows are the launcher's snapshot; the live `<ufoRoot>/config/ufo.json` wins at dispatch; re-read before every wave. `{{roundCeiling}}` is spec-owned.
Enforcement split: the launcher enforces only `L1_CEILING_EXCEEDED` and `PANE_CEILING_EXCEEDED`; the wave band and roundLaneCeiling are snapshot/rendered — enforcement is the validator's.
Defect: `l1Alias` is supplied but digit-bearing, so it can never render into the prompt; the card must not claim the alias renders.

Evidence: `BandAuthorityLiveRead.md`.
Unknowns: end-to-end plan/launch against the real substrate with a full valid fleet spec not run.
