# membrane-and-screening — the contract's own senses

Asked: `config/ufo.json`'s `membrane` block — paths, action, screening classes, and who reads them.
Source: lane MembraneAndScreening report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- `membrane.paths` (11 entries, verbatim): `crates/ufo-core-runtime/**`, `crates/ufo-cli/**`,
  `scripts/collect-omp-native-handoff*`, `scripts/sync-ufo-contracts.mjs`,
  `scripts/run-omp-native-trial.mjs`, `scripts/ufo-sighting*`, `config/ufo.json`,
  `config/the-tick.machine.json`, `skills/ufo/SKILL.md`, `skills/ufo/references/**`,
  `ssot/godspeed-core/directive.md`. All 11 exist in the tree (`ls -ld`, exit 0); the collector and
  sighting globs resolve to the `.mjs` file plus `-lib/` dirs; the block is mirrored verbatim in
  `crates/ufo-core-runtime/bundled/config.json`.
- `membrane.action` = `authority_boundary` — the only admitted spelling (`config.rs:225-238`,
  `lib.rs:869-873` refuse anything else; `config_tests.rs:382-386` pins `"notify"` ⇒ refused).
- Matcher: `proposal.rs#membrane_path_matches:348-359` — literal-stem prefix before the first `*`,
  exact equality when no glob, **never consults the filesystem**.
- Hit semantics: an admitted proposal whose `touched_paths`/`candidate_writes` intersect the membrane
  keeps the round Sound, the work lands locally, and `loop_stop` overrides to `AuthorityBoundary`
  (`loop_driver_dry.rs:460-465`; `native.rs:311-345`), writing an atomic seal
  `.ufo/membrane-seal.json` (kind `ufo-membrane-seal-v1`, `loop_driver_publish.rs:23-45,94-125`).
  While the seal stands, the driver refuses the next round and the launcher refuses fresh dispatch
  (`loop_driver_dry.rs:85-86`, `loop_driver_resume.rs:557`, `run-omp-native-trial.mjs:3331-3341`);
  an unreadable/malformed seal is still a seal (fail closed).
- Unseal: operator-only `ufo charter sign <runId>` (`crates/ufo-cli/src/main.rs:977-1105`) — stdin
  AND stdout must be TTYs (refused before any state read, `:990-996`), the seal must decode and name
  the run, and a full Phase 0 re-pass must succeed; any stage failure leaves the seal standing; the
  release binary refuses the test fixture seam (`:908-910`).
- Two surfaces: the native judge reads `config/ufo.json`'s membrane
  (`lib.rs#validate_native_membrane:840-908` — closed keys, non-empty repo-relative paths, action
  pinned, screening shape-checked; only `paths` is stored); the fixture loop reads
  `membrane{paths,action}` from `config/orchestration.json` (`loop_driver.rs:506-516`) — that file is
  **absent** in this tree, so the fixture-loop membrane surface is inert. Absent block anywhere =
  no enforcement, never a silent default.
- Screening: `{version: "2026-09-17", classes: [directive_bytes, terminal_marker, judge_imperative,
  assignment_header, directive_task_data]}`; consumer `scripts/collect-omp-native-handoff-lib/screening.mjs`
  (`DEFAULT_SCREENING_CLASSES:25-31`, `screenArtifactTexts:649`) + `collect-omp-native-handoff.mjs:413-470`
  (config classes override defaults; unknown class dies), `:1088` attaches, `:1281-1291` emits
  `screening_flags` as an optional sibling on the proposal wrapper, omitted under frozen `omp-native-v1`.
- Live seal state: `test -e .ufo/membrane-seal.json` → **no standing seal**; `.ufo/` holds `cache/`,
  `scopes/`, `sighting/`, `statusline-cache.json`, `statusline-full.stamp`.

## Contract

| element | rule | anchor |
| --- | --- | --- |
| `paths` | 11 repo-relative patterns = "the contract's own senses" | `config/ufo.json`; bundled mirror |
| `action` | exactly `authority_boundary` | `config.rs:225-238`; `lib.rs:869-873` |
| match | literal-stem prefix / exact; string-only | `proposal.rs:348-359` |
| hit | work lands, round Sound, `loop_stop = AuthorityBoundary`, seal written | `loop_driver_dry.rs:460-465`; `native.rs:311-345` |
| seal | atomic, names the run; blocks fresh dispatch; malformed still seals | `loop_driver_publish.rs:23-45,94-125`; `run-omp-native-trial.mjs:3331-3341` |
| unseal | TTY-only `ufo charter sign` + full Phase 0 re-pass; failure keeps the seal | `main.rs:977-1105` |
| screening | evidence flags on the proposal wrapper; never an admission input; credential-shaped finds die (separate screen) | `screening.mjs:11-33`; `native.rs:601-603`; `lib.rs:575-578` |

Why some paths are outside a mission's write authority: an accepted change touching the system's own
senses is allowed to land but stops the loop at a boundary the model cannot cross — only a human at a
real terminal, after a full Phase 0 re-pass, unseals it. Screening classes then flag override-shaped
text for the operator's eye without rejecting anything automatically.

## Not carried by the source

- No per-path owner metadata in the block; no filesystem verification in the matcher (it trusts
  declared `touched_paths` + `candidate_writes`, guarded by `validate_repo_relative_path`
  `proposal.rs:79`); no alternative actions; no screening version-comparison logic;
  `config/orchestration.json` itself is absent; no `.ufo/charter/` artifacts.

## Unknowns

- Whether any operator has ever signed a seal on this working copy; why `config/orchestration.json`
  is absent while its loader and docs remain; whether sighting-family changes have ever produced a seal.