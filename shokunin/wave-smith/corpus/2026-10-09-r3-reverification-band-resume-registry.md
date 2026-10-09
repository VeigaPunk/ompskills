# r3 re-verification — the corrected card on the band / resume-only / registry-path task

Asked (shokunin re-dispatch `WaveSmithRecheck`, 2026-10-09, read-only on the substrate):
re-verify the corrected card on the same bounded three-question task as the first
verification dispatch — (1) 15 spawn lanes under the live config, (2) 40 resume-only
lanes naming a declared prior's `agentId` handles, (3) `reportDir:"reports/x"` registry
location and a resume row's `agentId`. Corpus first, then source + `plan` probes.

Revision anchor re-hashed before use: `ufo-swarm-wave.mjs` sha256
`cd8247af7e7a9dc3e9dcff08d902e05ece72479f402ac754a89c5767cc304c00` (`:1` declaration
surface unchanged), `config/ufo.json` sha256
`0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3` — corpus anchor holds,
`ufo-fsd-alpha@5ace2559`.

Probes: scratch `/tmp/ws-probe` holding a byte-identical copy of `config/ufo.json`
(sha256 matches) plus `prior/swarm-registry.json` (40 spawn rows, `agentId`
`agent-001`…`agent-040`, keys `PriorLane01`…`PriorLane40`). Every probe ran
`UFO_PROJECT_ROOT=/tmp/ws-probe UFO_CONFIG_PATH=/tmp/ws-probe/config/ufo.json
UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 node …/ufo-swarm-wave.mjs plan --spec-json '<json>'`.
`run`/`record` were NOT exercised (forbidden in the default environment; the assignment
forbids them).

## Answers (3/3 reconfirmed; no claim changed)

| q | answer | anchors | probe |
| --- | --- | --- | --- |
| 1 — 15 spawn lanes, distinct prompts | **refused** `too_few_lanes` | `ufo-swarm-wave.mjs:982-983` (`laneFloor=policyFloor`, `laneCeiling=min(policyCeiling,cap)`), `:794-805` (mapping), `:989` (`impossible_band`), `:995-996` (`too_many_lanes`), `:998-1002` (`too_few_lanes`); `config/ufo.json:88-89,93-94` | exit 1 `too_few_lanes` |
| 2 — 40 resume-only lanes, declared prior | **admitted** | `:989`, `:998`, `:1004` (spawn-gated), `:995-996` (the one NOT spawn-gated), `:978` (`empty_wave`), `:1050,1054-1056` (admission keys `entry.agentId`) | exit 0 `counts {spawn:0,resume:40,total:40}`; control 101 → exit 1 `too_many_lanes` |
| 3 — `reportDir:"reports/x"` | `reports/x/swarm-registry.json`; resume row `agentId:null` | `:420-425` (`registryRelPath`, called `:846`), `:1123-1126` (resume mint), `:1285` (`plan.registry.members`), `:1145` (spawn mint null) | exit 0 `registry.path = reports/x/swarm-registry.json`, member `{"kind":"resume","agentId":null,"member":"PriorLane01","item":"src/prior/1"}` |

Q1 arithmetic: `policyMaxLanes = min(100, MAX_SWARM_LANES 100) = 100`,
`cap = min(policyMaxLanes, spec.maxLanes) = 100`, `laneFloor = policyFloor = 16`,
`laneCeiling = min(policyCeiling 32, cap 100) = 32`. `total 15 < 16` → `too_few_lanes`;
preceding: `impossible_band` needs `laneCeiling < laneFloor` (32 < 16 false),
`too_many_lanes` needs `total > cap` (15 > 100 false). Distinctness (`rejectDuplicate`
on expanded prompts, `:1008+`) runs after the band gates, so it cannot change the answer.

Q2 gate split: spawn-gated = `impossible_band` `:989`, `too_few_lanes` `:998`,
`wave_too_wide` `:1004` (all `spawns.length > 0`-guarded). Not spawn-gated band gate =
`too_many_lanes` `:995` (bare `total > cap`). `empty_wave` `:978` is a zero-lane guard
(`total === 0`) — not spawn-gated, but not a band gate either. Resume-only 40: floor and
ceiling skipped, `40 ≤ 100` → admitted; 101-resume control dies `too_many_lanes` before
resume admission, so it needs no prior.

Q3: `registryRelPath` `:423` `dir = reportDir ?? ".ufo/scopes/<wave ?? wave>"`, so
`reports/x/swarm-registry.json`. Resume row `:1123` is provenance-only
(`{kind:"resume",agentId:null,member,item}`) — `agentId` stays **null** by design (I6:
one handle one member; the spawn row keeps sole ownership, `record` fills only assigned
names, `:1769-1782`). `plan` is pure: the probe left `/tmp/ws-probe` with no `reports/`
and no `.ufo/` tree — only `run` persists via `persistWaveRegistry` (`:1877`).

## What changed / corpus repair

- **Index gap repaired (append-only, disclosed).** `bounded-verification-band-resume-registry.md`
  existed on disk but had **no row** in `index.md` (the first dispatch's entry was written
  without its row). This run appended the missing row plus its own; no existing entry or
  row was rewritten, reordered, or deleted.
- **Minor correction carried by the corrected card's own entry:** the prior bounded-verification
  entry cites `empty_wave` at `:977`; the source has it at **`:978`** (`if (total === 0)`),
  and it lists `empty_wave` under "the other three are spawn-gated" (a four-item list) —
  `empty_wave` is a zero-lane guard, not a band gate and not spawn-gated. Net claim
  (three band gates spawn-gated, `too_many_lanes` not) is correct.

## Not carried by the source

- `globalRunnerCeiling` (live 1056) is echoed in `plan.policy` (`:1245` neighborhood) but
  has no arithmetic coupling to the wave band — band is 100/16/16/32.
- No idle/liveness check on a resumed handle; admission proves registry membership only.

## Unknowns

- `run`/`record` unexercised; the on-disk resume row with `agentId:null` rests on
  `plan.registry.members` plus the documented persist merge, not a post-`run` file.
- The skill's "fold a short tail into the previous wave" vs the validator's "split … into
  waves of 16-32" disagreement is card-level and tracked by `skill-reconcile`; not re-probed.
