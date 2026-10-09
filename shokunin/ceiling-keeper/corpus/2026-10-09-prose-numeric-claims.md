# prose-numeric-claims — prose vs live numbers

Asked: every literal ceiling, band, or rate number in prose, checked against live values.
Lane `SkillNumericClaims` (reviewer), plus `NeighbourCorpora`, `ThreeThirtyTwos`, `ApplyNumericGates`.

Stale (pinned to an older band):
- Substrate `skills/ufo/SKILL.md`, `references/run-logic.md`, `AGENTS.md:151-167`, `docs/BEHAVIOR-MATRIX.md:27,178-180,335`, and `L2-L3-ROUTING.md:148-150` say 16–100, minLanes 64, maxConcurrentL1 32, or l1Alias m_daybreak (`skills/ufo/SKILL.md:341`).
- `host/omp-agent.config.yml:190-198` says 32–100 and "waveMinLanes raised to 32" (see three-thirty-twos).
- `fleet-dispatcher.mjs:5387-5393` help text says 16–100. `ufo-stale-watchdog.mjs` header says 16-100 with a 64 round.
- The untracked substrate copy of `.omp/skills/swarm/SKILL.md` carries 16–100 and minLanes 64. The repo copy reads 16–32.

Ambiguous, and highest-consequence:
- "100 lanes per round / per L1" (`sighting/l1-prompt.md:48,74,179`; tower and swarm skills). The code enforces 100 **per wave** (`ufo-swarm-wave.mjs:995`). No cross-wave accumulator exists, so the round budget is an instructed duty, not a gate.
- `.omp/skills/tower/SKILL.md` calls `windowPaneCeiling` display capacity. It is an enforced refusal for fleet windows (`CAP_EXCEEDED` / `PANE_CEILING_EXCEEDED`).
- `.omp/skills/swarm/SKILL.md` calls `minLanes` "not a planner gate". It is the fallback floor (see minlanes-semantics).

True: the repo swarm skill's 16–32 band, 100 member cap, `task.maxConcurrency` 32, `maxRecursionDepth` 2, and the ramp "declared pacing policy only".
