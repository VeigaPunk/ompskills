# seat-mirrors-and-ports — the seven seat surfaces and the ports residual

Asked: the seat packages, `substrates/<seat>` adapters, the shared verb contract, and `ports/`.
Source: lane PackagesSeatMirrors report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

| seat | package root | substrates entry | `skills/ufo` clone byte-identical? | `ufo-skill-scope.json`? | `substrate.json` keys |
| --- | --- | --- | --- | --- | --- |
| omp | `packages/substrate-omp` (`@ufo/substrate-omp-content`, no bin) | `substrates/omp/bin/cli.mjs` → `ufo-omp` | yes | **yes** (`package_scope: omp`) | 9 keys |
| opencode | `packages/opencode` (no package.json) | `substrates/opencode/bin/cli.mjs` → `ufo-opencode` | yes | **yes** | 9 keys |
| codex | `packages/codex` (no package.json) | `substrates/codex/bin/cli.mjs` → `ufo-codex` | yes | **yes** | 9 keys |
| grok | `packages/grok` (no package.json) | `substrates/grok/bin/cli.mjs` → `ufo-grok` | yes | **yes** | 9 keys |
| kimi | `packages/kimi` (no package.json) | `substrates/kimi/bin/cli.mjs` → `ufo-kimi` | yes | **yes** | 9 keys |
| cursor | `packages/cursor` (no package.json) | `substrates/cursor/bin/cli.mjs` → `ufo-cursor` | yes | no | 9 keys |
| devin | `packages/devin` (no package.json) | `substrates/devin/bin/cli.mjs` → `ufo-devin` | yes (`skills/ufo`); declared `.devin/skills/ufo` **absent** | no | 9 keys |

- `substrate.json` keys (identical 9 in all seven): `name, role, hostCli, judgeId, skills,
  mustNotJudge, status, lkg, note` — `role=native-surface`, `judgeId=ufo`, `mustNotJudge=true`,
  `status=local`; `hostCli` = omp/opencode/codex/grok/kimi/cursor-agent/devin.
- Shared verb contract (one contract, seven identical adapters): universal verbs `doctor`,
  `capabilities`, `selfcheck`, `version`, `self-iter`
  (`packages/substrate-lib/schemas/substrate-capabilities.json`, the array at lines 5-11; exit
  contract `:12-17`); exits 0/1/2/5; `help` implemented but **extra** (`package-verbs.mjs:16-23`);
  `self-iter` delegates `ufo self-iter --substrate <seat>` (`lane-cli.mjs:194`,
  `self-iter-delegate.mjs:300`).
- The five-of-seven scope-tag claim is **VERIFIED TRUE**: exactly 5 tags
  (`packages/{codex,grok,kimi,opencode,substrate-omp}/ufo-skill-scope.json` =
  `{schema_version:1, skill:"ufo", package_scope:<seat>}`); cursor+devin untagged; matches
  `README.md:34-36`, `docs/ufo-fsd-charterlist.json` `assigned_slots` (5), `sync-ufo-contracts.mjs:178-198`.
- OMP seat: `substrates/omp` + `packages/substrate-omp`; shims `.omp/skills/{swarm,tower}/SKILL.md`
  (metadata `substrate: omp`, `axis_family: orchestration`) — observed **untracked** in git
  (`??`, empty `git ls-files`, no installer in the repo, mtime 2026-10-07).
- Ports: `ports/` holds only `ufo-core-runtime/SRC-PARTIAL.json`; a port = vendored upstream-repo
  tree (trees purged 2026-09-08); `provenance.rs:22 TIP_VENDORED_PORT='ports/ufo-core-runtime'`.
  The JSON declares tip `05297518…`, 6 published `.rs`, 12 `paperParityFill`, `tipByteClosed 0` /
  `tipByteStillOpen 12`, and `workspaceCompileReady` for `crates/ufo-core-runtime`
  (`cargo test -p ufo-core-runtime --lib` → "119 passed, 0 failed" as recorded there). The port
  carries **no source bytes** — only the provenance/closure record.

## Contract

| rule | anchor |
| --- | --- |
| Bins live only on `substrates/<seat>/package.json` as `ufo-<seat>` → `./bin/cli.mjs` (identical md5 across all 7) | report |
| All seven `skills/ufo` clones are byte-identical to canonical; extra mirrors `.cursor/skills/ufo` and `.omp/skills/ufo` too | report |
| Scope tags are 5-of-7 by design, cross-checked against the charterlist and `cliFamilyScopes`; a stray tag is refused | `sync-ufo-contracts.mjs:178-199,389-402` |
| `ports/<repo>/` = vendored upstream placeholder; the sole survivor is a provenance declaration, not source | `SRC-PARTIAL.json`; `provenance.rs:22` |
| `packages/devin/.devin/skills/ufo` is a generated-only mirror under a gitignored root — `contracts:sync` must run before `contracts:check` can pass | `AGENTS.md:88-96`; `.gitignore:33` |

## Not carried by the source

- No `package.json` (hence no npm `name`/`bin`) inside any of the six seat content dirs;
  `packages/substrate-omp` has a manifest but no `bin`.
- `packages/devin/.devin/skills/ufo` does not exist on disk (generated-only, gitignored).
- No scope tag for cursor or devin (intended split, not drift). No installer/reference for
  `.omp/skills/{swarm,tower}` anywhere in `scripts/`, `config/`, or `.omp/`.

## Unknowns

- Provenance of `.omp/skills/{swarm,tower}` (present on disk, untracked, unignored, absent from HEAD
  and from the sync target map, no repo installer found).
- Whether `substrates/devin doctor` reports a missing seat skill in this checkout (gates not run);
  the declared `.devin/skills/ufo` path is absent here, which AGENTS.md describes as `missing`-only,
  not drift **[INFERENCE]**.