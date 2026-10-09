# safety-warden corpus — index

Write-safety: where a write may land and what stops it — the tower-fleet launcher's write-root and
symlink confinement, the substrate-write ban, TOCTOU and residual limits, and the per-path removal
rules. Append-only: one row per entry, in the order entries were added; never reorder or delete a row.

| entry | topic | added |
| ----- | ----- | ----- |
| [2026-10-09-realpath-deepest.md](2026-10-09-realpath-deepest.md) | deepest-existing-ancestor resolution and its bare catches | 2026-10-09 |
| [2026-10-09-write-root-zones.md](2026-10-09-write-root-zones.md) | the four-condition denylist on stateDir/worktreeRoot | 2026-10-09 |
| [2026-10-09-write-target-symlink-leaf.md](2026-10-09-write-target-symlink-leaf.md) | assertSafeWriteTarget refusal arms | 2026-10-09 |
| [2026-10-09-write-target-inventory.md](2026-10-09-write-target-inventory.md) | every write site mapped to its guard | 2026-10-09 |
| [2026-10-09-derived-target-escape-hardlink.md](2026-10-09-derived-target-escape-hardlink.md) | F1 symlink escapes closed; hardlink leaf OPEN (HIGH) | 2026-10-09 |
| [2026-10-09-substrate-ban-source.md](2026-10-09-substrate-ban-source.md) | the ban as the source carries it, and its spec-relativity | 2026-10-09 |
| [2026-10-09-scope-normalization.md](2026-10-09-scope-normalization.md) | the scope-entry refusal taxonomy, six messages one code | 2026-10-09 |
| [2026-10-09-scope-overlap-semantics.md](2026-10-09-scope-overlap-semantics.md) | component-prefix overlap, and F2 closure | 2026-10-09 |
| [2026-10-09-substrate-beneath.md](2026-10-09-substrate-beneath.md) | the substrate's containment guard, inverse symlink semantics | 2026-10-09 |
| [2026-10-09-substrate-write-primitives.md](2026-10-09-substrate-write-primitives.md) | atomic publish, dir lock, bounded reads | 2026-10-09 |
| [2026-10-09-scratch-root-rule.md](2026-10-09-scratch-root-rule.md) | why a real config copy, and which surfaces are gated | 2026-10-09 |
| [2026-10-09-l1-prompt-tower-duties.md](2026-10-09-l1-prompt-tower-duties.md) | the write-safety duties every fleet pane carries | 2026-10-09 |
| [2026-10-09-tower-skill-drift.md](2026-10-09-tower-skill-drift.md) | tower/SKILL.md vs the launcher source | 2026-10-09 |
| [2026-10-09-removal-rules.md](2026-10-09-removal-rules.md) | never an automated sweep; per-path remedy only | 2026-10-09 |
| [2026-10-09-omp-worktree-verbs.md](2026-10-09-omp-worktree-verbs.md) | the real CLI surface behind the removal contract | 2026-10-09 |
| [2026-10-09-toctou-window.md](2026-10-09-toctou-window.md) | the check→write race landed a write; residual limit confirmed | 2026-10-09 |
| [2026-10-09-prior-audit-remediation.md](2026-10-09-prior-audit-remediation.md) | F1/F2/F3 closed at the tip; residual still holds | 2026-10-09 |
| [2026-10-09-symlink-test-probes.md](2026-10-09-symlink-test-probes.md) | suite §37 and the full-suite result | 2026-10-09 |
| [2026-10-09-scope-test-pins.md](2026-10-09-scope-test-pins.md) | the suite's scope-gate pins | 2026-10-09 |
| [2026-10-09-card-convention.md](2026-10-09-card-convention.md) | the first-tranche shokunin card shape | 2026-10-09 |
| [2026-10-09-corpus-convention.md](2026-10-09-corpus-convention.md) | index + entry shape, append-only | 2026-10-09 |
| [2026-10-09-host-apply-dry-run.md](2026-10-09-host-apply-dry-run.md) | the third write surface's gate and its gaps | 2026-10-09 |
| [2026-10-09-cross-surface-guard-pattern.md](2026-10-09-cross-surface-guard-pattern.md) | one invariant, three parameters | 2026-10-09 |
| [2026-10-09-r2-verify-confinement-model.md](2026-10-09-r2-verify-confinement-model.md) | card overclaim found and corrected | 2026-10-09 |
| [2026-10-09-r2-verify-write-target-table.md](2026-10-09-r2-verify-write-target-table.md) | six rows re-derived and re-run | 2026-10-09 |
| [2026-10-09-r2-verify-zone-denylist.md](2026-10-09-r2-verify-zone-denylist.md) | denylist confirmed; lexical-parent nuance | 2026-10-09 |
| [2026-10-09-r2-verify-target-arms.md](2026-10-09-r2-verify-target-arms.md) | arms confirmed; in-root link refusal mutation-tested | 2026-10-09 |
| [2026-10-09-r2-verify-substrate-ban.md](2026-10-09-r2-verify-substrate-ban.md) | honest path byte-identical; zone spec-relative | 2026-10-09 |
| [2026-10-09-r2-verify-scope-gate.md](2026-10-09-r2-verify-scope-gate.md) | six messages, ordering, F2, no derived path | 2026-10-09 |
| [2026-10-09-r2-falsify-hardlink.md](2026-10-09-r2-falsify-hardlink.md) | hardlink escape independently reproduced | 2026-10-09 |
| [2026-10-09-r2-falsify-toctou.md](2026-10-09-r2-falsify-toctou.md) | swap race reproduced 3/3; no fd primitive in source | 2026-10-09 |
| [2026-10-09-r2-verify-removal.md](2026-10-09-r2-verify-removal.md) | removal rules confirmed against CLI and close output | 2026-10-09 |
| [2026-10-09-r2-verify-siblings.md](2026-10-09-r2-verify-siblings.md) | substrate and host claims confirmed; spawn-gate caveat | 2026-10-09 |
| [2026-10-09-r2-verify-card-shape.md](2026-10-09-r2-verify-card-shape.md) | card conforms; H3 subsections are precedented | 2026-10-09 |
| [2026-10-09-r2-verify-corpus-shape.md](2026-10-09-r2-verify-corpus-shape.md) | 1:1 index↔file mapping; one heading omission | 2026-10-09 |
| [2026-10-09-r2-gap-bind-mount.md](2026-10-09-r2-gap-bind-mount.md) | bind mount escapes; residual now observed | 2026-10-09 |
| [2026-10-09-r2-gap-enotdir-roots.md](2026-10-09-r2-gap-enotdir-roots.md) | ENOTDIR typed on launch; missing repo accepted lexically | 2026-10-09 |
| [2026-10-09-r2-gap-close-write-sites.md](2026-10-09-r2-gap-close-write-sites.md) | close writes nothing; :906 shape confirmed | 2026-10-09 |
| [2026-10-09-r2-gap-scope-edges.md](2026-10-09-r2-gap-scope-edges.md) | lexical gate confirmed; no length ceiling | 2026-10-09 |
| [2026-10-09-r2-gap-host-ufo-json-write.md](2026-10-09-r2-gap-host-ufo-json-write.md) | rename replaces a symlink, does not follow it | 2026-10-09 |
| [2026-10-09-r2-connector-provenance.md](2026-10-09-r2-connector-provenance.md) | claim→entry→report table; two over-broad phrases | 2026-10-09 |
