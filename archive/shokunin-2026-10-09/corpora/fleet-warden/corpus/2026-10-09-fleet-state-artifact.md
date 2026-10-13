# fleet-state-artifact — the `<stateDir>/fleet.json` artifact

Asked: every top-level key and mission-record field the launcher writes.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lanes: `FleetState`, `LaunchPartial` (correction).

Write site: `verbLaunch` (:904-928) — `fleetPath = <stateDir>/fleet.json` (:905), guarded (:906),
`writeFileSync` (:907). Top-level keys: `ok` (`failures.length === 0` :908), `fleet`, `repo`,
`ufoRoot`, `base`, `stateDir`, `worktreeRoot`, `roundCeiling`, `maxTime`,
`band{waveMin,waveMax,roundLaneCeiling,maxConcurrentL1,windowPaneCeiling,l1Alias}`, `launchedAt`,
`warnings[]`, `missions[]`.

Mission record literal (:737-754): `id, title, axis, worktree, branch, base, promptPath,
skills[], paneId, paneReused, panePhase, retired, promptReused, worktreeReused,
worktreeRecreated, launchResult`. Conditional: `failure` (:629), `secondaryFailure` (:633),
`worktreeMissing` (:814), `launchResultFrom` (:773).

Live artifact `/home/vgpnk/Projects/ompskills/.tower/fleets/shokunin/fleet.json`: 13 top-level
keys, 8 mission records, all 16 base fields, `ok:true`, band exactly
`{waveMin:16,waveMax:32,roundLaneCeiling:100,maxConcurrentL1:16,windowPaneCeiling:16,l1Alias:"m_strong"}`
— no drift vs the code.

**Corrected claim (critic lane `LaunchPartial` falsified an earlier draft).** `failures.length > 0`
writes `ok:false` and then throws `LAUNCH_PARTIAL` (exit 2) **after** the file is written — so for
every *recorded per-mission failure* the file exists before the throw. But the write at :907 is in
**no try**: if it fails (reproduced: the wall stub `chmod 0555`s the stateDir), the fs error escapes
to the top-level catch as `UNEXPECTED_ERROR` and **no fleet.json is written** — the header's
"fleet.json is written either way" (:33-35) holds only for recorded per-mission failures, not
absolutely. Fix: type the write failure (`FLEET_STATE_WRITE_FAILED`) or write-temp-then-rename.
State artifacts live under `<repo>/.tower/` (git-ignored) and never enter a repo commit.

Evidence: lanes `FleetState`, `LaunchPartial`.
