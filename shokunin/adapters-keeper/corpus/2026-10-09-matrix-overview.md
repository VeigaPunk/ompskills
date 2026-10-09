# matrix-overview — the 11 packages in two classes

Asked: the package-level adapter matrix under `/home/vgpnk/Projects/ufo-fsd-alpha/packages/`.
Sources: lanes MirrorShape, PkgWorkspaces, LanesTargets (`reports/adapters-keeper/`).

## Observed

- 11 dirs split in two classes. **Adapter content trees (7)**: `codex, cursor, devin, grok,
  kimi, opencode` (content-only, no package.json, git-tracked) plus `substrate-omp`
  (`@ufo/substrate-omp-content` 0.1.0, `"private": true`, authored package.json with
  `"files": ["agents","skills","ssot","ufo-skill-scope.json"]` — NOT an npm workspace
  member; docs/REPO-LAYOUT.md:105-112 says deliberate).
- **npm workspaces (4)**: root `package.json:7-12` = `packages/ufo-core`,
  `packages/contract-support`, `packages/substrate-lib`, `packages/substrate-runtime`.
  package-lock.json:12-15 mirrors the list. No project references / composite tsconfigs;
  cross-package order is by npm script order.
- Subtree matrix (files per package): skills = 8 files where present (ufo 6 + wwkd 2);
  ssot = 1 (directive.md only); agents = 13 where present.

| package | skills | ssot | agents | scope json | native dir | package.json |
| --- | --- | --- | --- | --- | --- | --- |
| codex | 8 | 1 | — | yes | — | — |
| cursor | 8 | 1 | 13 | — | .cursor/ (9) | — |
| devin | 8 | 1 | 13 | — | .devin/ (gitignored, absent) | — |
| grok | 8 | 1 | — | yes | — | — |
| kimi | 8 | 1 | 13 | yes | — | — |
| opencode | 8 | 1 | — | yes | — | — |
| substrate-omp | 8 | 1 | 13 | yes | — | authored |
| contract-support | — | — | — | — | assets/ufo/ (9 mirrors) | authored + tsconfig |
| substrate-lib | — | — | — | — | schemas/ (2) | authored |
| substrate-runtime | — | — | — | — | src/ (15) + test/ (6) | authored |
| ufo-core | — | — | — | — | src/ (18) | authored + tsconfig |

- Mirror parity walk (lane MirrorShape): 29 compared pairs / 133 mirror files / 0 differ;
  `skills/SHA256SUMS` 15/15 OK, `ssot/godspeed-core/SHA256SUMS` 3/3 OK at the anchor.

## Contract

`packages/<seat>` is projected content; `substrates/<seat>` is the executable seat. The
two never merge: packages have no bin, seats have no mirrored content.

## Unknowns

- Whether substrate-omp *should* join the workspaces is recorded as an operator decision,
  not a defect (docs/REPO-LAYOUT.md:105-112).
