# harness-scout corpus — index

Append-only: read the rows relevant to an assignment before starting; after finishing, write
one dated entry `shokunin/harness-scout/corpus/<YYYY-MM-DD>-<slug>.md` and append exactly one
row below. Never rewrite, reorder, or delete an entry or a row; the corpus only grows.

Pair-and-tail rule: an entry file and its index row land in the same commit; rows append at
the tail only; a late-discovered gap is repaired by appending the missing row with a
disclosure line, never by reordering. Falsification is carried by a new correction-ledger
entry; originals stay untouched.

Provenance: seeded 2026-10-09 from the mission worktree
`/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin2/harness-scout` (branch
`tower/shokunin2/harness-scout`, base `main` @ `87c351a`). Domain sources: the `omp://`
harness doc set (134 files), the live global config `/home/vgpnk/.omp/agent/config.yml`,
the project skills and cards under `.omp/`, and observed dispatch behavior. Every entry is a
distilled finding from one r1-research lane (26 lanes, one entry per item); each carries its
own Unverified section. The `omp` implementation source is not on this machine — claims rest
on the live docs plus the compiled bundle `/home/vgpnk/.local/bin/omp` (`18.8.6`), read-only.

| entry | topic | added |
| ----- | ----- | ----- |
| 2026-10-09-agent-discovery-roots.md | task-agent discovery roots and first-wins precedence | 2026-10-09 |
| 2026-10-09-agent-card-schema.md | task-agent card frontmatter schema | 2026-10-09 |
| 2026-10-09-task-tool-contract.md | the `task` tool contract (call shapes, keys, caps) | 2026-10-09 |
| 2026-10-09-discovery-surface-observed.md | the live discovery surface on this machine | 2026-10-09 |
| 2026-10-09-agent-availability-gates.md | guardrails that make a discovered agent unusable | 2026-10-09 |
| 2026-10-09-skill-anatomy.md | skill shape, layout, frontmatter, load pipeline | 2026-10-09 |
| 2026-10-09-skill-resolve-order.md | skill name resolution, collisions, `skill://` | 2026-10-09 |
| 2026-10-09-manage-skill-tool.md | the `manage_skill` tool and managed skills | 2026-10-09 |
| 2026-10-09-skill-roots-observed.md | the observed skill surface of this session | 2026-10-09 |
| 2026-10-09-hooks-subsystem.md | the hook subsystem (current vs legacy) | 2026-10-09 |
| 2026-10-09-hook-event-contract.md | hook factory, event catalogue, blocking/rewrite | 2026-10-09 |
| 2026-10-09-hook-install-scope.md | hook install roots and this repo's state | 2026-10-09 |
| 2026-10-09-settings-scopes.md | settings scopes and precedence | 2026-10-09 |
| 2026-10-09-config-discovery.md | config discovery and resolution | 2026-10-09 |
| 2026-10-09-live-global-config.md | the live global config anatomy | 2026-10-09 |
| 2026-10-09-env-and-roots.md | environment variables shaping the harness | 2026-10-09 |
| 2026-10-09-context-and-rules.md | context files and the rulebook pipeline | 2026-10-09 |
| 2026-10-09-session-storage.md | session JSONL format, entry model, persistence | 2026-10-09 |
| 2026-10-09-session-operations.md | export, dump, share, fresh, clear, fork, resume | 2026-10-09 |
| 2026-10-09-session-listing-tree.md | listing, switching, and the session tree | 2026-10-09 |
| 2026-10-09-transcript-uris.md | `history://`, `agent://`, `artifact://`, `local://` | 2026-10-09 |
| 2026-10-09-doc-set-map.md | the `omp://` doc set: membership and lookup | 2026-10-09 |
| 2026-10-09-extensions-surface.md | the extension surface | 2026-10-09 |
| 2026-10-09-approval-and-commands.md | approval, slash commands, magic keywords | 2026-10-09 |
| 2026-10-09-card-contract.md | the shokunin card contract and tranche convention | 2026-10-09 |
| 2026-10-09-corpus-convention.md | the corpus convention across the 8 corpora | 2026-10-09 |
| 2026-10-09-verify-card-dispatch.md | verification: card dispatch + hook-install-scope claim | 2026-10-09 |
| 2026-10-09-r2-verification-corrections.md | r2 verification corrections (append-only ledger) | 2026-10-09 |
| 2026-10-09-verify-card-r2.md | verification: round-2 card fixes (five claims, all CONFIRMED) | 2026-10-09 |
| 2026-10-09-project-user-agent-precedence.md | project/user agent collision precedence verification | 2026-10-09 |