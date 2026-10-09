# top-level-layout — the repository root and what each entry owns

Asked: every entry at the root of /home/vgpnk/Projects/ufo-fsd-alpha and its owner.
Source: lane TopLevelLayout report (fleet shokunin2, mission substrate-keeper).
Anchor: ufo-fsd-alpha@5ace2559, `config/ufo.json` sha256 `0e416f0abc559e9a…` (worktree; HEAD blob `7efc813b…`).

## Observed

- Root has exactly **39 entries** (24 dirs + 15 regular files), no symlinks; the 15 tracked root
  files are `.gitignore .ignore AGENTS.md CODEOWNERS Cargo.lock Cargo.toml LICENSE README.md
  k28asia-plan.md package-lock.json package.json rust-toolchain.toml tsconfig.base.json
  tsconfig.json ufo-deps.lock`.
- Tracked-file counts per directory (`git ls-files <dir> | wc -l`): `.omp 28, agents 13, config 7,
  conformance 68, crates 109, docs 398, drills 68, evidence 535, fixtures 2, godspeed-core 4,
  packages 195, ports 1, reports 69, research 3, scripts 101, skills 16, src 10, ssot 5,
  substrates 22, tests 35, .cursor 12, .godspeed 1, .ufo 0`.
- AGENTS.md opening contract (`:3-5`): "`skills/ufo/SKILL.md`, `skills/ufo/references/run-logic.md`,
  and `agents/*.md` are the guidance source of truth. `crates/ufo-core-runtime` is the only
  self-iteration runtime and the only judge." Section headings at `:1, :98, :185, :222, :329`
  (repository contract / Routing authority / NC2 fleet dispatch protocol / L0 monitor duty /
  Commit-trail doctrine).
- README.md headings in order: `# UFO-FSD`(1), What is implemented(17), Canonical contracts(32),
  Install(44), Native substrate checks(54), Run locally without credentials(74), Verify(88),
  Authority boundary(126).
- `package.json`: 4 workspaces (`packages/ufo-core`, `contract-support`, `substrate-lib`,
  `substrate-runtime`) and 16 scripts including `build, build:portable, check, test, run:portable,
  gates, dev-verify, smoke, doctor, self-iter, ufo, loop, contracts:check, contracts:sync,
  the-tick:handler, the-tick:ping`.
- `Cargo.toml`: members `crates/ufo-core-runtime`, `crates/ufo-cli`; lints `unsafe_code = "forbid"`,
  clippy `all`/`pedantic` = warn. `rust-toolchain.toml`: channel stable, min-version 1.85.

## Contract

| root entry | kind | owner / authority | purpose |
| --- | --- | --- | --- |
| `AGENTS.md` | file | CODEOWNERS `/AGENTS.md` @jpveigao10 | repository contract |
| `agents/` | dir 13 | CODEOWNERS; guidance SoT | 13 role cards |
| `config/` | dir 7 | `config/ufo.json` = executable authority + membrane sense | contract + overlays + machine configs |
| `crates/` | dir 109 | CODEOWNERS per crate | the only runtime/judge + the CLI |
| `skills/`, `ssot/`, `godspeed-core/` | dirs | CODEOWNERS | canonical skills + pinned posture |
| `src/` | dir 10 | `src/README.md` — "portable TypeScript contract fixture (not a judge)" | portable fixture |
| `substrates/`, `packages/` | dirs 22 / 195 | CODEOWNERS | 7 seat adapters; 4 workspaces + 7 asset trees |
| `scripts/` | dir 101 | executable authority (README §Authority boundary) | gates, dispatcher, fleet, self-iter |
| `conformance/`, `drills/`, `fixtures/`, `tests/` | dirs | **UNSTATED** by CODEOWNERS | test data / drill matrix / fixture / Node suites |
| `docs/`, `evidence/`, `reports/`, `research/`, `ports/` | dirs | retained provenance, each fenced by its own README | dumps |
| `README.md, LICENSE, Cargo.*, package*.json, tsconfig*.json, rust-toolchain.toml, ufo-deps.lock, k28asia-plan.md` | files | **UNSTATED** | readme / license / build / lock / retained plan |
| `.omp/` | dir 28 | CODEOWNERS `/.omp/skills|hooks|agents|ssot/` | OMP host projection (generated `config.yml`) |
| `.ufo/` | dir 0 tracked | generated run state (gitignored) | ephemeral state |
| `.cursor/`, `.godspeed/` | dirs | UNSTATED | generated host mirror / deep-review logs |

Rules: guidance authority is AGENTS.md:3-5; executable behavior additionally comes from
`config/ufo.json`, the canonical Rust crates, `scripts/`, and `substrates/<seat>` — checked mirrors
and generated host projections are **not** independent authorities (README:126-131); `CODEOWNERS`
is partial (no `*` fallback line); Cargo = 2 crates and npm = 4 workspaces, and the 7
`packages/<seat>` content trees are **not** workspace members.

## Not carried by the source

- No owner for the UNSTATED entries; no CODEOWNERS fallback.
- No root `Makefile`/`Justfile`/`.editorconfig`/`CHANGELOG.md`/`CONTRIBUTING.md`; `k28asia-plan.md`'s
  purpose exists only in its own header.
- LICENSE mismatch unreconciled: `LICENSE:1` reads "MIT License" while `package.json` and
  `Cargo.toml` both declare `Apache-2.0`.

## Unknowns

- Which license is authoritative; whether `config/*.bak` or `.ufo/` ever get committed.