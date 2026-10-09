# isolation-keeper corpus — index

Append-only. One row per entry `| entry | topic | added |`. Read this first,
then the entries relevant to the assignment.

Domain anchors (substrate `/home/vgpnk/Projects/ufo-fsd-alpha`):
`scripts/prepare-ephemeral-l1.mjs` sha256 `d91907da202b19235cde179ba1cec9be3da181157dd07b359ba83f9d5b23bbfb`
(963 lines), `config/ephemeral-l1.machine.json` sha256
`9d0184a479ffda4ef3c4a4004de0c0652ba95e6ab7369ae0094c9817486d9e01` (1373 bytes),
`scripts/ufo-sighting.mjs` sha256
`5e8ea127e5244b1edec4d35b40a201d4fb4057dc316506582a8e5e9e2f09d19e` (4714 lines).
Seeded from the mission's round-1 research wave (32 lanes,
`reports/isolation-keeper/`); re-hash before trusting a line number.

| entry | topic | added |
| --- | --- | --- |
| 2026-10-09-policy-validation.md | `readPolicy`: exact-key set, byte bounds, `PATH_VARIABLES` exact-set rule, sandbox/opencode sub-keys, refusal strings | 2026-10-09 |
| 2026-10-09-source-git-config-safety.md | `assertSourceGitConfigSafe`, `DANGEROUS_SOURCE_GIT_CONFIG`, `scrubbedGitEnvironment`, `git` wrapper bounds | 2026-10-09 |
| 2026-10-09-clone-and-overlay.md | `validateSource` + `snapshotCheckout`: clone argv, detach, clean, pinned-HEAD binary overlay, final equality | 2026-10-09 |
| 2026-10-09-untracked-copy-bounds.md | `copyUntrackedEntry`/`assertCopiedUntracked`: population, symlink confinement, byte bounds, mode fidelity | 2026-10-09 |
| 2026-10-09-remote-removal.md | `removeCloneRemotes`: remote/branch config sweeps, survivor throws, clone-env scrubbing, residual namespaces | 2026-10-09 |
| 2026-10-09-snapshot-digest.md | `snapshotDigest` feed order, label, emitted create fields, custody, what is not hashed | 2026-10-09 |
| 2026-10-09-create-layout-perms.md | `createEphemeralL1` layout map, 0700/0600 discipline, marker write, isolation contents | 2026-10-09 |
| 2026-10-09-environment-map.md | `environmentPaths` + emitted record: 8 path keys + 3 flags, no credentials, consumer exact-key mirror | 2026-10-09 |
| 2026-10-09-resolver-snapshot.md | resolver snapshot write/bind lifecycle, byte bound, mount-target rule, live-host symlink case | 2026-10-09 |
| 2026-10-09-opencode-config-synthesis.md | `prepareOpenCode`/`synthesizeAgent`/`stripFrontmatter`: emitted config, no model key, no global fallback | 2026-10-09 |
| 2026-10-09-auth-file-copy.md | `--auth-file`: six ordered checks, destination, bound, owner-only copy, no-auth default | 2026-10-09 |
| 2026-10-09-cli-verbs-argv.md | `parseOptions`/`main`: verbs, flags, strict argv, exit codes, create JSON fields | 2026-10-09 |
| 2026-10-09-destroy-refusals.md | `readValidatedMarker` check order, ~40 messages, tie-breakers, zero mutation before return | 2026-10-09 |
| 2026-10-09-destroy-force-recovery.md | `--force`: identity gate, heuristic layout recovery, what relaxes vs still enforced, doc reconcile | 2026-10-09 |
| 2026-10-09-marker-schema-states.md | marker field set, writer/reader field reconciliation, state set, unread-by-consumer fields | 2026-10-09 |
| 2026-10-09-path-confinement-guards.md | `isBeneath` (lexical) / `safeRelative` / `assertRealParents` / `ensurePrivateDirectory` / `assertOwnerPrivate` | 2026-10-09 |
| 2026-10-09-machine-config-keys.md | every `config/ephemeral-l1.machine.json` key → live value → consumer line; read-but-unused list | 2026-10-09 |
| 2026-10-09-sighting-env-load.md | `validateStoredEnvironment`/`loadMissionEnvironment`: exact keys, containment, marker gate, `INVALID_ENVIRONMENT` | 2026-10-09 |
| 2026-10-09-sighting-marker-load.md | marker match fields at load vs pane start, transition ownership refusal, expected-state map | 2026-10-09 |
| 2026-10-09-bwrap-argv.md | full sandbox argv order, writable/readonly sets, cleared child env, `SANDBOX_UNAVAILABLE` | 2026-10-09 |
| 2026-10-09-marker-transition-states.md | complete marker state machine with writers and admitting readers; orphan `active` | 2026-10-09 |
| 2026-10-09-launch-env-guards.md | `launch --env-file` guards: substrate/argv/cwd, registration↔start byte-identity, rollbacks | 2026-10-09 |
| 2026-10-09-sandbox-unavailable.md | `resolveExecutablePath` + policy PATH resolution, `SANDBOX_UNAVAILABLE` surfacing, no-prepend verdict | 2026-10-09 |
| 2026-10-09-docs-reconcile.md | each normative `docs/EPHEMERAL-L1-MISSIONS.md` sentence vs source: MATCHES/DIVERGES/UNVERIFIABLE | 2026-10-09 |
| 2026-10-09-prepare-test-pins.md | `tests/prepare-ephemeral-l1.test.js`: 41 tests, pinned groups, run transcript, not-pinned list | 2026-10-09 |
| 2026-10-09-sighting-test-pins.md | `tests/ufo-sighting.test.js` ephemeral arms (1290-1582), pinned bwrap/marker/env behavior, gaps | 2026-10-09 |
| 2026-10-09-refusal-taxonomy.md | typed `SightingError` surface vs bare prepare surface; ephemeral codes; comment-vs-code discrepancies | 2026-10-09 |
| 2026-10-09-consumer-map.md | producer→consumer graph for env/marker/policy/resolver; tower-fleet never touches the ephemeral surface | 2026-10-09 |
| 2026-10-09-known-failure-modes.md | documented ephemeral failure modes F1-F10, STILL-TRUE/STALE/UNENFORCED, residual risks R1-R4 | 2026-10-09 |
| 2026-10-09-history-intent.md | commit timeline for the prepare script/config/doc and the comment→enforcing-hunk map | 2026-10-09 |
| 2026-10-09-evidence-digest.md | the wave's gate report: suite transcript, sibling census, axis pins, not-established list | 2026-10-09 |
| 2026-10-09-card-corpus-convention.md | the card frontmatter/body-section and corpus index/entry convention to match | 2026-10-09 |
| 2026-10-09-verification-dispatch.md | the card's first dispatch on a bounded task, and the observed result | 2026-10-09 |