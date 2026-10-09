# identity-bounds — Identity and bounds table → sources; live band wins

Item: source every row of the `## Identity and bounds` table (`sighting/l1-prompt.md:39-51`)
and the trailing live-band paragraph (`:53-56`).

Observed (exact sources):
- fleet/mission(title)/axis/goal/scope/repo/base/roundCeiling ← fleet-spec fields (`renderPrompt` `tower-fleet.mjs:423-436`; `loadSpec` base fallback `gitHeadBranch` `:387`).
- worktree ← `path.join(worktreeRoot, mission.id)` `:421`; validator ← `path.join(ufoRoot,'scripts','ufo-swarm-wave.mjs')` `:439`; lane reports ← `path.join(stateDir,'reports',mission.id)` `:438`.
- wave band ← live `authority.waveMin/waveMax` `:433-434` ← `loadBandAuthority` `:153-154`; roundLaneCeiling ← `authority.roundLaneCeiling` `:435` ← `config.sighting.dispatch.swarm.maxLanes` `:155`.
- `{{roundCeiling}}` is the ONE exception: spec-owned (`raw.roundCeiling`, default 1, `:388`), not re-read from config.

Nuance: line 53's "band and ceiling rows" is precise for waveMin/waveMax/roundLaneCeiling but NOT for `{{roundCeiling}}`. `loadBandAuthority` runs once per launcher invocation before any verb (`:1286`); the prompt file is written once, so the rendered numbers are a snapshot.

Evidence: lane report `IdentityBounds.md`; live band read 16/32/100/16, alias m_strong.
Unknowns: the mission-keeper fleet-spec JSON values were not inspected by this lane.
