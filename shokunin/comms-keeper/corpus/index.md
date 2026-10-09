# comms-keeper corpus — index

Append-only. One row per entry `| entry | topic | added |`. Read this first,
then the entries relevant to the assignment.

Domain anchor: the inter-mission comms hub `.tower/comms/` as written by the
kimi-code tower feature (`/home/vgpnk/.kimi-code/bin/kimi` 2.1.1, bundled source
`packages/agent-core-v2/src/features/tower/**`), and the two real hubs:
`/home/vgpnk/Projects/ompskills/.tower/comms/` (hub A, base main) and
`/home/vgpnk/.tower/comms/` (hub B, home repo, base master). Seeded from the
mission's round-1 research wave (29 lanes,
`.tower/fleets/shokunin3/reports/comms-keeper/`).

| entry | topic | added |
| --- | --- | --- |
| [2026-10-09-generator-provenance.md](2026-10-09-generator-provenance.md) | generator = kimi-code 2.1.1 tower feature; omp/repos write nothing; reading the source | 2026-10-09 |
| [2026-10-09-paths-and-naming.md](2026-10-09-paths-and-naming.md) | path constants, slugify/dateStamp (local), four filename grammars, writeUnique | 2026-10-09 |
| [2026-10-09-init-adopt-release.md](2026-10-09-init-adopt-release.md) | TowerInit, `.git/info/exclude`, sessionId ownership, adopt retires roster, release | 2026-10-09 |
| [2026-10-09-state-json-schema.md](2026-10-09-state-json-schema.md) | state.json keys, roster/mission fields and enums, save/load semantics | 2026-10-09 |
| [2026-10-09-missions-render.md](2026-10-09-missions-render.md) | MISSIONS.md + missions/M*.md templates, six render sites, byte-identical replay | 2026-10-09 |
| [2026-10-09-inbox-protocol.md](2026-10-09-inbox-protocol.md) | TowerSend/TowerInbox: recipients, frontmatter, visibility, no read state, wake | 2026-10-09 |
| [2026-10-09-finding-protocol.md](2026-10-09-finding-protocol.md) | TowerFinding: enums, template, log line, nobody reads findings/ | 2026-10-09 |
| [2026-10-09-review-protocol.md](2026-10-09-review-protocol.md) | TowerReview: status/merge vocab, round cap 5, global seq, rework flip, prefix bug | 2026-10-09 |
| [2026-10-09-mission-updates.md](2026-10-09-mission-updates.md) | TowerMission patches, authority, completed gate, what is (not) logged | 2026-10-09 |
| [2026-10-09-plan-and-scopes.md](2026-10-09-plan-and-scopes.md) | TowerPlan ids/branches/wt-N, stem-prefix scope reservation, base WIP snapshot | 2026-10-09 |
| [2026-10-09-merge-gate.md](2026-10-09-merge-gate.md) | merge gate order, `merge.blocked` reasons, what merge writes | 2026-10-09 |
| [2026-10-09-worktree-records.md](2026-10-09-worktree-records.md) | wt-N slots and worktree.*/teardown log verbs (records only) | 2026-10-09 |
| [2026-10-09-activity-log-grammar.md](2026-10-09-activity-log-grammar.md) | activity.log line grammar, verb catalog, cumulative tokens, unlogged events | 2026-10-09 |
| [2026-10-09-spawn-briefing.md](2026-10-09-spawn-briefing.md) | TowerSpawn gates, roster entry, verbatim comms rules, mandatory endings | 2026-10-09 |
| [2026-10-09-tool-access-matrix.md](2026-10-09-tool-access-matrix.md) | tool × role matrix, refusal texts, write guard holes | 2026-10-09 |
| [2026-10-09-status-view.md](2026-10-09-status-view.md) | TowerStatus sections, constants, inbox count without unread state | 2026-10-09 |
| [2026-10-09-roster-lifecycle.md](2026-10-09-roster-lifecycle.md) | caller→name, died/revived fields, roster across teardown/adopt | 2026-10-09 |
| [2026-10-09-mode-and-reminders.md](2026-10-09-mode-and-reminders.md) | tower mode on/off, env flag, reminders, what persists | 2026-10-09 |
| [2026-10-09-refusal-catalog.md](2026-10-09-refusal-catalog.md) | 49 TowerProtocolError sites + merge blocks, remedy texts | 2026-10-09 |
| [2026-10-09-message-flow.md](2026-10-09-message-flow.md) | message families and directions, subject conventions, canonical flow | 2026-10-09 |
| [2026-10-09-hub-a-timeline.md](2026-10-09-hub-a-timeline.md) | worked example: hub A lifecycle per mission | 2026-10-09 |
| [2026-10-09-hub-a-reviews.md](2026-10-09-hub-a-reviews.md) | worked example: review → result → merge chains, contradictions | 2026-10-09 |
| [2026-10-09-findings-routing.md](2026-10-09-findings-routing.md) | worked example: hub A findings dispositions; triage doctrine | 2026-10-09 |
| [2026-10-09-review-rounds-worked.md](2026-10-09-review-rounds-worked.md) | worked example: hub B 3-round review loop; resumes unlogged | 2026-10-09 |
| [2026-10-09-hub-b-compare.md](2026-10-09-hub-b-compare.md) | second hub in the home repo; creator, takeover, conformance | 2026-10-09 |
| [2026-10-09-stray-inbox-write.md](2026-10-09-stray-inbox-write.md) | the unlogged hand-written inbox file and a detection recipe | 2026-10-09 |
| [2026-10-09-hand-edit-hazards.md](2026-10-09-hand-edit-hazards.md) | hand-edit survival, forgery of reviews, no locks, init truncates log | 2026-10-09 |
| [2026-10-09-two-tenants.md](2026-10-09-two-tenants.md) | kimi comms vs omp fleets under `.tower/`; `hub send` is a different mailbox | 2026-10-09 |
| [2026-10-09-card-boundaries.md](2026-10-09-card-boundaries.md) | delineation vs other cards; errata to evidence-auditor hub claims | 2026-10-09 |
| [2026-10-09-card-convention.md](2026-10-09-card-convention.md) | shokunin card/corpus convention this card matches | 2026-10-09 |
| [2026-10-09-hub-b-m4-review-audit.md](2026-10-09-hub-b-m4-review-audit.md) | audit: hub B M4 review files ↔ ref= log lines, seq/round, rework actor, round cap, index vs state | 2026-10-09 |
