# swarm-skill-contract — The swarm skill as the norm behind steps 3-5; what the prompt points at

Item: `.omp/skills/swarm/SKILL.md` in full vs the validator.

Observed: the prompt restates the CLI verbs + spec sources + env triple, the rendered band numbers + live-config-wins, three refusal codes, the ten roles + four frozen seats, and record-fills-ids. It POINTS AT (via `skill://swarm`, load-order item 3) the result schemas, route/refinement flags, exit codes, the remaining ~20-code refusal taxonomy, the axes 1-8/≤256 bounds, no-merge precedence, and the route-bucket linkage.
Largest silently-pointed-at contract: LANE-LEAF discipline — steps 3-5 never mention `spawns`, leaf bounds, or the executor exception; `spawns: []` is a footgun (empty list → wildcard when `task` is in the lane's tools); the validator composes "Lane bounds: leaf member — no subagent dispatch." into every lane (`:740-750`; executor arm adds "except your single labrat").
Band nuance: `swarm.minLanes` 16 = declared round floor, policy not a planner gate; fallback chain `waveMinLanes → minLanes → 2`; wave-band gates fire only on spawn-bearing waves (resume-only exempt); `too_many_lanes` caps total incl. resumes.
Registry/resume: `run` writes spawn rows `agentId:null`; `record` fills them; a resume row has `agentId:null` (the spawn row keeps sole ownership), inherits axes/milestone; extras not in SKILL: `wave_registry_collision`, `handlesReset`, default resume message, `prompt`/`name` resume aliases.
Operational defect (step 5): record needs the full env triple and a relative `<reportDir>`; the template line 123 has neither.

Evidence: `SwarmSkillContract.md`.
Unknowns: host-side facts kept SKILL-asserted (spawns:[] wildcard, recursionDepth 2, maxConcurrency 32, hook runtime firing, hub send).
