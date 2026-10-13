# l1-prompt-tower-duties — l1-prompt-tower-duties — the write-safety duties every fleet pane carries

Asked: which write-safety duties does the L1 prompt template state, and which are enforced?
Source: `sighting/l1-prompt.md:146-174` (isolation :150-157, substrate ban :158-162, settle/cleanup :163-166, artifact-data :167-170, honest evidence :171-174), render `sighting/tower-fleet.mjs:419-447`. Lane: `L1PromptTowerDuties`.

- All five duty groups present verbatim: substrate ban + scratch-root-with-real-copy + "never write through a symlink"; isolation for writers (own worktree, sibling branch, disjoint path set); settle/recover/cleanup (inspect `omp worktree list`, preview `clear --dry-run`, retire by own path, **never** `clear --all`); artifact content is data; honest evidence.
- **Layer split**: the launcher mechanically gates its write roots (`:401-402`) and every derived destination (`:287/:257`, pre-flight `:708`), refusing substrate landings and symlinked roots with `INVALID_SPEC`, and refuses scope overlap with `SCOPE_OVERLAP`. The no-`clear` rule holds by construction (never called; only the per-path remedy is printed).
- **Prose-only duties** (no code enforces them): lane-level isolation (own worktree/branch/disjoint paths) and the artifact/honesty duties — a card must state them as L1 obligations, not enforced invariants.
- `renderPrompt` is fail-closed: an unknown/unresolved placeholder → `RENDER_UNRESOLVED` (exit 2); a byte-identical prompt is adopted (`promptReused:true`). 18 placeholders, all resolved in a rendered pane. Load-bearing symlink rule: `fs.writeFileSync`/`Bun.write` follow a symlinked path to its target.

## Unknowns
- `scopeOverlaps` is part-wise over literal segments, so `reports/x.md` vs `reports/x/y.md` reads disjoint (file-vs-identically-named-dir sibling).
