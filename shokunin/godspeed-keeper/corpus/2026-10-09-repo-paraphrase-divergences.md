# The repo-tracked paraphrases' Godspeed claims vs the sources

**Asked:** where the repo skills diverge from the real injection sources.
**Source:** `/home/vgpnk/Projects/ompskills/.omp/skills/{swarm,tower}/SKILL.md`; substrate sources.

## Observed

- **D1 (medium, unanchored label):** `tower/SKILL.md:53-54` "the fleet renderer prepends it to a launched
  mission prompt". No source says "fleet renderer": `sighting/l1-prompt.md:2` **authors** the bytes in the
  template; `sighting/tower-fleet.mjs:419-449` is pure `{{placeholder}}` substitution with **0** godspeed
  hits; the only genuine prepend is `scripts/fleet-dispatcher.mjs:8708`
  (`snapshotPromptBody = /skill:ufo\n${GODSPEED_INVOCATION}\n\n…`); run-logic:2321-2322 names the
  dispatcher. The sentence conflates L1-template author, L1 dispatcher, and L2 renderer.
- **D2 (high, missing qualifier):** `tower/SKILL.md:49-54` states the `task` hook prepends
  unconditionally; the sibling `swarm/SKILL.md:130-133` carries the correct qualifier ("project-scoped
  `<cwd>/.omp/hooks/pre/`"). The repo shipping the skill has **no** `.omp/hooks/pre/` (`.omp` holds only
  `skills/` and `agents/`), so tower's reading is false in situ. Import swarm's qualifier.
- **D3 (medium, paraphrase drops rule 4):** both skills' "posture in one line" paraphrases, not quotes.
  The 4th clause given is the stop-asking **tail**, and directive **rule 4** (`Don't aim — let the frontier
  walk itself.`, `directive.md:6`) is dropped entirely; rule 2 is lightly reworded. Quote the four rules
  verbatim when representing the source.
- **D4 (low, naming):** `swarm/SKILL.md:129-130` "the wave renderer" vs canonical "swarm-wave renderer"
  (BEHAVIOR-MATRIX:293, `always-on.md:24`).
- **D5 (low, context):** both skills cite substrate-side artifacts absent from `ompskills`; swarm hedges,
  tower does not (reinforces D2).
- **Faithful claims verified:** hook prepends flat+batched (hook:22-23,42-77); resume/`hub send` never
  re-carries (run-logic:734-735); eval-kernel `agent()`/`workpool()` must self-prepend (hook:23-25); the
  validator injects `GODSPEED_INVOCATION` into every fresh spawn lane (`ufo-swarm-wave.mjs:1161-1167`);
  hook idempotence; the posture does not widen/judge/spawn (leaf shape).

## Changed

Nothing — this lane is read-only and applied no patch; the divergences are reported for the L1 (the repo
skills are outside this mission's scope).