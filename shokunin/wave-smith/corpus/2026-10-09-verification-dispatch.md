# verification-dispatch — the card's first assignment, and the corpus gap it found

Asked: dispatch the card `.omp/agents/wave-smith.md` on a bounded test task and record the
observed result (the mission's verification duty). Source: the installed card plus the
validator. Assignment: `WaveSmithCheck` (agent `wave-smith`), 2026-10-09.

Anchors: the card at `<worktree>/.omp/agents/wave-smith.md`, the installed host mirror at
`~/.omp/agent/agents/wave-smith.md`, the corpus mirror at
`~/.omp/agent/shokunin/wave-smith/corpus/`, the validator
`scripts/ufo-swarm-wave.mjs` sha256 `cd8247af7e7a9dc3…`; the dispatch's own report is not on
disk (the task forbade writes) — its returned JSON is the evidence.

Task shape: three questions from the corpus (15 spawn lanes under the live band; 40
resume-only lanes against a declared prior; where the registry lands with `reportDir` and
what happens to a resume row's `agentId`), each to be answered from the corpus first and
then confirmed against the source, with anchors and a probe.

Observed result — the card is **reachable and correct** (3/3):

| q | answer | anchors | probe |
| --- | --- | --- | --- |
| 15 spawn lanes | refused, `too_few_lanes` (`total 15 < laneFloor 16`; `impossible_band` and `too_many_lanes` both false) | `:982-983, 989, 995, 998-1002`; `config/ufo.json:88-94` | `plan --spec-json` → exit 1 `too_few_lanes` |
| 40 resume-only | **admitted** — the three band gates are `spawns.length > 0`-guarded, `too_many_lanes` is not (`40 < 100`) | `:989, 995, 998, 1004, 1072-1074` | `plan` → exit 0 `counts {spawn: 0, resume: 40, total: 40}`; control 101 → `too_many_lanes` |
| `reportDir: "reports/x"` | registry at `reports/x/swarm-registry.json`; the resume row is `{kind:"resume", agentId:null, member, item}` | `:420-425, 1123-1126, 1285` | `plan` → `registry.path` as stated, member row null-handled |

Corpus entries used: `index.md`, `band-arithmetic`, `resume-admission`, `registry-schema`,
`registry-persist-merge`.

**Gap the dispatch found (a real corpus defect, now fixed):** no entry stated explicitly
that a resume lane's `resume` value must equal the owner row's **`agentId` string** — the
row key / member name is not an acceptable target (`resume: "PriorLane01"` dies
`resume_unknown_member`, because admission maps `entry.agentId`, `:1045-1047, 1053-1057`).
`resume-admission` said "known handle" and "member = row key" without making the two
distinct. Fixed in that entry by the round-2 correction pass.

Not carried by the source — the dispatch could not exercise `run`/`record` (the task
forbade writing outside `/tmp`, and the default environment resolves the registry into the
read-only substrate), so its `agentId: null` evidence comes from `plan.registry.members`
plus the documented merge, not from a post-`run` registry file.

## Unknowns

- Whether the harness accepts every legal swarm role string at live dispatch (unchanged).
- The card's behavior under a *write*-capable assignment (this dispatch was read-only by
  design: the mission's verification task is bounded and non-mutating).
