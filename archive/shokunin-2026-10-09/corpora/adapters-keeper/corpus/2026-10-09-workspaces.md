# workspaces — the 4 npm workspaces vs content-only dirs

Asked: npm/package wiring for packages/ — which are real buildable packages.
Source: lane PkgWorkspaces (`reports/adapters-keeper/PkgWorkspaces.md`).

## Observed

- Root `package.json:7-12` workspaces = exactly 4: `packages/ufo-core`,
  `packages/contract-support`, `packages/substrate-lib`, `packages/substrate-runtime`.
  package-lock.json:16-21 mirrors the list.
- **"4 npm workspaces" means** four package.json dirs npm links into
  `node_modules/@ufo` — not four buildable packages:
  - `@ufo/core` — buildable TS (tsconfig).
  - `@ufo/contract-support` — buildable TS (tsconfig).
  - `@ufo/substrate-lib` — JSON content (schemas only, export map `./schemas/*`).
  - `@ufo/substrate-runtime` — untranspiled ESM (`src/*.mjs`, `exports` map, no bin).
- `packages/substrate-omp` = `@ufo/substrate-omp-content`, private, **outside** the
  workspace set — content projection (docs/REPO-LAYOUT.md:105-112).
- Six adapter dirs have no package.json at all — pure content trees.
- No tsconfig project references or `composite` anywhere; ordering is npm script order.
- `ufo-deps.lock` pins `contractRevision` = run-logic.md sha256 (matched live file);
  file-set deps are repo-root rooted; none under packages/.

## Contract

Workspace membership = "npm installs a @ufo/* symlink for src-level consumers".
Adapter packages never need that: their consumers are the sync gate, the Rust readiness
checks, and the hosts' own content loaders — not Node imports.

## Unknowns

- Build/test pass state unverified (no node_modules at the anchor; lane ran none).
- Whether `@ufo/substrate-omp-content` is consumed by name (its `files` list suggests
  publish intent, but it's `private`).
- docs/REPO-LAYOUT.md "four workspaces" count is hand-maintained (no generator).
