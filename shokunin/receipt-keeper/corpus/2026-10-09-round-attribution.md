# Round attribution: why the registry alone cannot split r1 from r2

## Asked

Reconstruct which lanes belonged to which round for a mission whose single
`swarm-registry.json` accumulated two rounds (trial: `tower1` /
`tf-audit-launcher`, 32 r1 + 16 r2 lanes).

## Observed

The registry cannot split rounds:

- It holds **45 keys for 48 real lanes**: three r1 names
  (`SwarmCritic10`, `SwarmSentinel11`, `SwarmCritic14`) were overwritten by
  r2 rows. `wave`, `createdAt` and `milestone` on those rows are
  last-writer (r2) values.
- The writer (`ufo-swarm-wave.mjs` :1108-1112) emits lane names as
  `Swarm<camelRole><NN>`; `-2` suffixes never come from the writer — they
  appear first in the harness `tool.task` result ([INFERENCE] the harness
  suffixes reused labels). `SwarmScout01-2` is a wake of the completed r1
  lane, not a 33rd lane.
- Working procedure (verified 48/48, zero mismatches):
  1. Enumerate `sessions/tf-audit-launcher/<L1-stem>/Swarm*.jsonl` — do not
     attribute from the registry.
  2. Round = the single `Milestone:` string in each transcript's first user
     message (32 `round-1-invariant-audit`, 16 `round-2-refutation`).
  3. Strip a trailing `-2` from the label, match
     `Swarm<camelRole><index+1>` against `wave-r1-spec.json` /
     `wave-r2-spec.json` items; check the item milestone agrees.
  4. Per-round count = the step-2 group sizes. Registry member count (45) is
     only a cross-check.
- Writer guard :1484-1522 is **inert when all agentIds are null**, so
  collisions are silent — the overwrite produced no warning.
- tf-audit-launcher's wave artifacts sit at the **fleet root**
  (`wave-r1-spec.json`, `wave-r2-spec.json`), not `waves/`, and no
  `.payload.json` exists for it; payloads can also live under
  `reports/<dir>/` (tower1-safety-r2).

Related receipt errors found on the same fleet: its r2 receipt claims 6
partial refutations while its own table has 7; its r1 VIOLATED row lists 9
lanes but only 5 transcripts carry the token; its receipt says base
`d3267d` (real: `df3267d`); launch-idempotency "5/5" should be 6/6.

## Changed

Card step 5 now states the accumulation/overwrite semantics and the
all-null-agentId caveat; this entry carries the full procedure.

## Unknowns

- The harness `-2` suffix mechanism is not reproduced (source unlocated).
- Only surviving copies of r2 `Critic10`/`Critic14`/`Sentinel11` reports are
  L1-hand-archived `*-2.md` files; the r2 worktree was `rm -rf`'d.
