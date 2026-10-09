# swarm skill claims: 53/53 mapped, two host-scope caveats

**Asked:** map every load-bearing claim in `.omp/skills/swarm/SKILL.md` (lines 44-211) to its source.
**Sources:** `scripts/ufo-swarm-wave.mjs` (V), `scripts/ufo-mission-result.mjs` (M),
`.omp/hooks/pre/ufo-godspeed-inject.js` (H), `config/ufo.json` (C), plus route-preflight (P),
`sighting/tower-fleet.mjs` (R), `.omp/agents/executor.md` (E), `run-logic.md` (U),
`scripts/ufo-sighting.mjs` (W), `host/omp-agent.config.yml` (G), `host/ufo-sighting-dispatch.json` (J).

## Observed

- 53/53 claims mapped: **53 supported** (2 with host-scope caveats), **0 contradicted**, 0 wholly
  unverified. The file declares **no** environment variables (no `$VAR`, no `process.env` contract).
- Verified surface facts: lane task entries are exactly `{name, agent, task}` (V L1187); the
  dispatch payload rule `taskCall = spawns ? {context, tasks} : null` (V L1322-1336); resume sends are
  `hub send --to <entry.resume> --message <entry.message>` with `entry.name` bookkeeping only
  (V L1324-1336 note); `axes` 1-8 names <= 256 bytes, spec-level default / item-level wins
  (V L302-303, L943-945); resume lanes inherit the spawn binding (V L901-906); the ten
  `SWARM_ROLES` and the frozen-topology exclusion (V L258-269 + C L106-117).

## Nuances (partial / host-scoped, not contradictions)

- **N1:** "host's `task.maxConcurrency` (32)" (L120) holds only for the swarm host overlay
  `G:203`; the substrate `ufo-fsd-alpha/.omp/config.yml:3` pins `maxConcurrency: 0`, and
  `docs/BEHAVIOR-MATRIX.md:178` calls 32 the native `concurrencyCeiling`, not a host-worker cap.
  A reader on the substrate finds 0.
- **N2:** `route_unreachable` requires `--route-probe` (V L1871); the only flag the skill names,
  `--route-families`, runs with `probe:null` and **never refuses** — it only reports
  `concentration`/`unpinned` (P L163-165). The `singleFamily` wording itself is supported.
- **N3:** the refusal list is explicitly "not their full set" (L76) — the validator also raises
  `spawn_message_forbidden` (V L930), `prompt_with_template` (V L949), `item_required`,
  `prompt_required`, `invalid_resume_id` (V L701), and preflight `route_config_unavailable` (P L150).
- **N4:** the "round budget that sequential waves of one round share" framing for `maxLanes` is an
  inference — the cap applies per single wave and nothing in config names a shared per-round pool.
- Host overlay inconsistency: `G:197` comment says `waveMinLanes` was "raised from 16 to 32", but
  `J:9` and `C:93` both hold 16; `waveMaxLanes` 32 / `maxLanes` 100 agree.

## Remaining unknown

L200's "the default wall never reads `windowPaneCeiling`" was not checked (it owns
`scripts/ufo-sighting` internals); the `~/.omp/agent/config.yml` install path is inferred from the
worktree copy.
