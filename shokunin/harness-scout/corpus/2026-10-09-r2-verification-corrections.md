# 2026-10-09 — r2 verification corrections (append-only ledger)

Lane: L1 integration of the `harness-scout-r2-w1` verification wave (30 lanes, all reported).
Originals are **not** rewritten — this ledger carries every refuted or partial claim with the
evidence that decided it, plus the card fixes made in the same round. Read it alongside the
entry it corrects.

## Refuted claims

| entry | claim | verdict | evidence |
| --- | --- | --- | --- |
| agent-discovery-roots | "the doc's 'lexicographic' is `localeCompare` (ASCII-equivalent)" | REFUTED | `localeCompare` is **not** ASCII-equivalent for mixed-case names; the divergence is real and wider than stated (VAgentDiscoveryRoots). |
| skill-anatomy | "native 100, claude 80, github 30, omp-managed 5 rest on the doc" | REFUTED | read-only `strings` of `omp/18.8.6` exposes all four constants/registrations in embedded source text (VSkillAnatomy). |
| skill-resolve-order | "the substrate has no `packages/coding-agent` tree, so code-level checks were impossible" | REFUTED | the compiled bundle embeds the minified source with `// packages/coding-agent/src/<file>` comments; `extensibility/skills.ts` and `internal-urls/skill-protocol.ts` are readable (VSkillResolveOrder). |
| skill-resolve-order | "(no dedicated traversal message)" | REFUTED | `Path traversal (..) is not allowed in <scheme>:// URLs` exists and is reachable **unencoded** (`skill://godspeed/...`); the neutralization observation holds only for WHATWG-normalized dot segments (VSkillResolveOrder). |
| skill-roots-observed | "`InvalidInput` rc 2" as the `skill://` index refusal | DRIFTED | the current wording is `skill:// URL requires a skill name: skill://<name>`; the shell wildcard probe still returns rc 2 (VSkillRootsObserved). |
| config-discovery | "no source is available to settle it" (the `getConfigDirs` conflict) | REFUTED | the bundle settles it: `config.ts` `getConfigDirs` pushes user entries before project entries → `config-usage.md` §2 matches the implementation; `slash-command-internals.md:83` misstates the helper, though its net-effect claim still holds via the native provider's project-first enumeration plus name-keyed first-wins dedup (VConfigDiscovery). |
| config-discovery | "zero hits for its keys across the whole `omp://` doc set" | REFUTED as worded | `orchestrator` and `budgets` occur as prose in several docs; **key-position** hits are zero. The ufo.json distinction itself holds (VConfigDiscovery). |
| session-operations | "`--continue <full-UUID>` → `--resume <UUID>` normalization is doc-stated, not source-located" | REFUTED | `normalizeContinueSessionArgs` is present in the bundle and exported from `main.ts`, gated by a full-UUID regex (VSessionOperations). |
| card-contract | "no YAML parser and no source available" for the wave-smith `": "` scalar and the `ufo:` key | REFUTED | the bundle answers both: the frontmatter fallback quotes single-line `key: value` values containing `": "`, and `parseAgentFields` never reads `ufo` (unknown keys dropped, no rejection) (VCardContractEntry). |
| verify-card-dispatch | "commands/results verbatim" as a form claim | REFUTED (form) | the entry is a prose digest, not complete transcripts; the four filesystem claims themselves are independently CONFIRMED (VVerifyCardDispatchEntry). |

## Partial claims and omissions

**agent-discovery-roots** — extension-array replacement and `explicit-only` semantics omitted;
alias→symbol mappings unverifiable from the minified binary.

**task-tool-contract** — `solutionSpace`'s "sole input" wording omits the blank/missing fallback
and the `effort` override; `async.maxJobs=100` is carried by `omp://settings.md`, not by the two
docs the lane was scoped to; the `. Searched: <dirs>` suffix is uncited in those two docs (it
comes from the availability-gates binary probe); "all defaults from global-config absence"
overlooks project/session/overlay settings.

**discovery-surface-observed** — the worktree project card count is **stale: 9 live**, not 8
(`harness-scout.md` was added by commit `01f8d7c`); the bundled-collision claim is partial;
runtime precedence remains unverifiable without a dispatch.

**agent-availability-gates** — "all 8 are leaf specialists" is stale (9 cards; the no-`spawns`/
no-`task` conclusion still holds for all 9); "returns one resolved policy object reused by
launch" is imprecise (`SQ` is called twice — preflight and launch); the refusal-shape list is
not exhaustive (also `Eval-defined tools are unavailable in plan mode.`, `Subagent isolation,
apply, and merge controls are unavailable in plan mode.`, `Invalid <source> output schema:
<err>`, `Subagent spawn blocked by extension.`); and the quoted `Task <Name> failed preflight:
<message>` template is **batch-mode-specific** — with `task.batch` off the same refusals read
`Task execution failed: <message>`, the sync multi-item path emits `Task <Name> failed:
<message>`, and post-policy `preflight` errors surface through the async path with
`isError: true`. A live session JSONL (`-Projects-ompskills/2026-10-08T19-20-47-433Z_….jsonl`,
msg `745cbbe9`) is stronger evidence than the two archived substrate transcripts the entry cites.

**manage-skill-tool** — the Outputs section omits `delete`'s `details={action:"delete",name}`;
the refusal strings are abbreviated rather than exact.

**skill-roots-observed** — "no `skills:` config key" is true of the **config file** but the live
`omp config list` exposes 13 `skills.*` schema keys; say which surface you mean. All five
resolutions, hashes, and substrate line counts re-verified exactly.

**hooks-subsystem** — "the factory may legally take either `HookAPI` or `ExtensionAPI`"
overstates: the loader only checks that the default export is callable, while the current
runtime supplies `ExtensionAPI`/`ExtensionContext` and shims no legacy context name. "The whole
implementation is legacy-marked" is partial — the legacy APIs remain documented and exported on
the hooks subpath.

**hook-event-contract** — the extension-only event list is presented as closed; the docs hedge
with "such as" and `omp://extensions.md` names ≥15 more events (`before_provider_request`,
`after_provider_response`, `session_stop`, `cache_warming_decision`, `assistant_message`,
`message_start|update|end`, `tool_approval_requested|resolved`, `before_subagent_spawn`,
`retry_fallback_applied|succeeded`, `goal_updated`, `credential_disabled`, `mcp_notification`,
`resources_discover`). `additionalContext` omits batch-level dedupe, delivery ordering, and
discard conditions. The `tool_result` chaining difference (legacy handlers each see the original
event; extension handlers are middleware-style) is not named. Action methods
(`pi.sendMessage`/`pi.appendEntry`) throw `ExtensionRuntimeNotInitializedError` during load,
while `pi.exec()` is available then.

**hook-install-scope** — the 32-invocation evidence wording is over-broad: each dispatch file
carries 32 task payloads with one leading invocation each, while the whole-file recursive count
is 224. The inert conclusion is correctly conditional on a session rooted in this worktree.

**settings-scopes** — the final Unverified section should distinguish doc-confirmed details from
unavailable source-tree verification; the live `task.*` count is 26 (the entry's "23+" holds).

**config-discovery** — `findConfigFileWithMeta` is absent from the compiled `config.ts` (only
`findConfigFile` is present) — doc-declared only, possibly tree-shaken; the doc's provider table
omits `skillshare` at priority 95; overlay strictness is narrower than copied (a `null`/empty
root is accepted as `{}`; only array/scalar roots hard-error); model roles have explicit
project-write APIs (`setProjectModelRole`, `modelRoleStorage: project`). The overlay
path-resolution equivalence is **verified**, not inference.

**live-global-config** — metadata drift: the entry says 221 lines, current `wc -l` is 220 (same
7457 bytes). The companion-file list is partial (`predict/`, `last-changelog-version` also
present). All structural counts re-verified (6 top-level keys, 19 roles 3/12/4, 14 seats 3/5/6,
31 chains 19/12, 7 backups).

**env-and-roots** — project-dotenv filtering is overstated (credentials are filtered;
launcher-owned variables are preserved); `PI_NATIVES_DIR` and `OMP_WORKTREE_DIR` are conflated
in the table; "a later `--session-dir` wins" and the `config.yml` placement are not directly
evidenced.

**context-and-rules** — the subagent `AGENTS.md` claim is partial: the assigned docs omit it,
while the bundle confirms only the case-insensitive basename filter; `CLAUDE.md`/`GEMINI.md`
inheritance and the imported-text exception remain unverified.

**session-storage** — live artifact-directory count is **13**, drifting from the entry's 22
(mutable state); the entry omits the live doc's Snowflake-ID collision fallback, so fixed-width
id assumptions are incompletely warned against.

**session-operations** — the `/fork` Tern-pane path is "undocumented" only in that one doc (the
binary's changelog carries it), and there is a fourth branch: `Tern did not confirm the fork:
…` errors and does **not** fork in place. The "exact refusal strings" heading lists three
separate literals, not one pipe form. A custom share handler cannot share an in-memory session
(`Cannot export in-memory session to HTML`). The entry literal is `Invalid entry ID for
forking: ${e}`.

**session-listing-tree** — the picker "fork marker" → `parentSession` linkage should be
downgraded to inference (the docs define them separately); omissions: the
`ExtensionCommandContext`/`HookCommandContext` `branch`/`navigateTree` actions and adjacent
branch hooks, picker controls/edge behavior, `/tree` ask re-answer and custom-message cases,
stale subagent breadcrumb recovery, and the Zellij session-name augmentation.

**transcript-uris** — "no `.md` outputs existed" is now stale (many published outputs exist);
published JSON extraction remains PARTIAL/unverified (a selected path returned null).

**doc-set-map** — overstatement: generic missing-file diagnostics do not always include
nearest-match suggestions (`omp://does-not-exist.md` returns only `Use omp:// to list available
files.`); directory and near-match paths do show `Did you mean`.

**extensions-surface** — the native-only wording is correct only when scoped to **ambient
extension-module** discovery; root-selection coverage understates `PI_CONFIG_DIR`/profile
nuances; the exact `ExtensionToolWrapper` class name is not stated in the three assigned docs
(the behavior is confirmed); `--no-extensions` omits the documented sibling-capability nuance.

**approval-and-commands** — security-relevant partials: the entry omits that a **bare** bash
critical override is ignored in yolo (an explicit tool/user `prompt` or `deny` still applies);
ACP fail-closed coverage omits pending provider safety checks and the
unsupported/rejected/cancelled prompt behavior; the compound-command summary omits the
POSIX-shell/syntax qualification and the unmatched-segment legacy fallback. The generic
non-recursive file-scan statement is too broad (the Claude provider scans recursively), and the
magic-keyword matching summary omits several documented non-matching forms (backslashes, file
extensions, symbol references, call syntax, element contents).

**card-contract** — wave-smith has 3 subsections in the specialization and 1 in the bounds (not
4 in the specialization); the "1764 chars vs ~600 median" figure is the whole bounds section
(the trailing subsection is 860 chars; the other bounds sections' median is 609); "wave-smith
dates its live config values" is wrong — wave-smith **hash-anchors**, mission-keeper dates. The
checklist's "`tools` includes `write` and `edit`" should read "`write` (or `edit`)", and the
revision-anchor item is a recommendation, not contract. The host-gate claim is CONFIRMED with
the nuance that the substrate's own `.omp/agents` mirror is gated by
`sync-ufo-contracts --check` while the ompskills repo has no such gate.

**corpus-convention** — the 205-entry / 8-corpus denominators are stale for the now 9-corpus,
232-entry population (this corpus included); the wall-watcher insertion, the wave-smith
disclosed gap, and the citation drift all re-confirmed.

**verify-card-dispatch** — the four filesystem claims are independently CONFIRMED; the entry's
"verbatim" form claim is refuted (it is a prose digest); card discoverability remains
UNVERIFIABLE from that lane (no dispatch was run there — the L1's own dispatch is the evidence).

**corpus-integrity** — all checks confirmed with zero convention breaks; the append-order check
is partial only because the corpus first appears in `HEAD` and `HEAD~1` has no index path.

## Card fixes applied in this round

`.omp/agents/harness-scout.md` (the card is not append-only; the corpus is):

1. "The six surfaces it knows" → **seven** (the list has seven bullets).
2. `$UFO_ROOT` — "default `/home/vgpnk/Projects/ufo-fsd-alpha`" → "on this workstation:
   `/home/vgpnk/Projects/ufo-fsd-alpha`" (no default declaration was found).
3. The "not the UFO substrate" clause now names the sibling cards (`host-smith`, `wall-watcher`)
   instead of an unnamed "other shokunin".
4. The bundle version is dated: "observed `18.8.6` on 2026-10-09".
5. The hooks bullet now **answers** the Godspeed question it advertises: the
   `.omp/hooks/pre/ufo-godspeed-inject.js` hook is absent from this repo and the user root, and
   native hook discovery is cwd-scoped with no ancestor walk, so a `task` dispatch from this
   repo inherits Godspeed from the **wave renderer's leading line only** (the renderer lives in
   the substrate at `scripts/ufo-swarm-wave.mjs`).
6. The bundle is named as a first-class evidence source for code-level checks (it embeds the
   minified source under `// packages/coding-agent/src/<file>` comments), replacing the
   impression that only docs are available.

## Not integrated (recorded, outside this mission's scope)

- The `CardContract` proposal to add a fourth clause to `.omp/skills/shokunin/SKILL.md` and
  backfill the four failing first-tranche cards — a skill-file change plus other missions' card
  paths. Route as errata to the owning missions.
- The `CorpusConvention` proposal was **accepted** in round 1 and is already this corpus's
  index preamble.
- Index-row topic under-descriptions flagged by `Legibility` (rows for `hook-install-scope` and
  `session-storage`): the row text is append-only, so the fix is carried here and in the card
  rather than by rewriting a row.

## Unverified after round 2

- No lane dispatched a subagent (leaf bounds), so runtime collision/refusal behavior is still
  inferred from code+doc; the L1's own card dispatch is the only runtime observation.
- `reloadFromDisk()` atomicity; the child-env writer of `PI_BLOCKED_AGENT`; the
  `findConfigFileWithMeta` existence in the original TS; profile/XDG-specific root actuals;
  extension-runner timeout/cancellation numbers; hook runtime execution.
- Mutable-state counts (artifact dirs, `.md` outputs, config line count) drift by design; each
  entry's count is a snapshot, not a contract.
