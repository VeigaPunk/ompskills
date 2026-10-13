# tower skill claims -> carriers, with four flagged divergences

**Asked:** map every load-bearing claim in `.omp/skills/tower/SKILL.md` (174 lines) to its carrier.
**Carriers:** `sighting/tower-fleet.mjs` (TF), `host/apply.mjs` (AP), `host/omp-agent.config.yml`
(CFG), `test/tower-fleet.test.mjs` (TT), `<ufoRoot>/config/ufo.json` (UFJ), plus substrate extras
(`scripts/ufo-sighting.mjs` US, `.omp/hooks/pre/ufo-godspeed-inject.js` HSK, `sighting/l1-prompt.md` LP,
`scripts/fleet-dispatcher.mjs` FD, `scripts/ufo-swarm-wave.mjs` SW, `scripts/ufo-sighting-lib/base.mjs` BAS).

## Observed

- ~40 claim rows mapped across the five sections; the large majority SUPPORTED with an exact
  carrier symbol (e.g. P1 `omp worktree add -C REPO -b UNIQUE_BRANCH PATH [COMMIT]` -> TF L806-812;
  T4 spec defaults -> TF `loadSpec` L387-394; T20 `spawnSync` argv-not-shell-string -> TF L507-508).

## Flagged divergences (highest corpus value)

- **T9 CONTRADICTED:** SKILL L151-153 says a failed `omp worktree add` "aborts the run outright";
  TF L815 `recordMissionFailure(...,"WORKTREE_ADD_FAILED",...)` then `continue`, and the run ends
  `typed("LAUNCH_PARTIAL", …)` L946. TF header L31-34: "a failed mission never aborts the run".
- **T10 PARTIAL:** SKILL L153-154 (and the TF code comment L794) promise an existing worktree path
  is reused "with a warning"; TF L798-800 sets `record.worktreeReused = true` with **no** `warn()`
  (the only warn L803 is the *missing*-worktree branch).
- **M8 OVERSTATED:** SKILL L75 "Only `launch` creates a pane" is false for the CLI as a whole —
  `scripts/ufo-sighting.mjs` `twin` (L3960) mints a pane and `register` (L4036) registers the
  current one.
- **G1 carrier-location gap:** the hook path `.omp/hooks/pre/ufo-godspeed-inject.js` (SKILL L50-53)
  resolves against `ufoRoot`, not the omp repo — `ompskills` has `.omp/skills/` only.
- **T18 loose:** SKILL L169-170 "a failing wall `complete` aborts first" — TF records each
  per-mission failure (L1202-1207) and emits `COMPLETE_FAILED` **at the end** (L1227).
- **Cross-source numeric drift (adjacent):** CFG comment L194 says `waveMinLanes` was "raised from
  16 to 32", while `host/ufo-sighting-dispatch.json` and UFJ both hold 16. The SKILL text is immune
  (it names keys, not numbers).

## Claims with no in-scope source

P3 "OMP `task` agents are not worktree-isolated by default" (L32-33); the verbatim phrase "approved
table is three" (L40; the three buckets are config-carried, the wording is not); the
`omp worktree list` / `clear --dry-run` spellings (L110-112, external CLI); `omp worktree --help`
(L120). Tooling note: no `lsp` device is mounted in this session, so all symbol locations are
literal grep/read, not semantic proof.

## Corpus facts

- Mutations are refused at the parse stage (`MUTATION_REQUIRES_APPLY`, TF L1266) **before** the spec
  is read — a tested contract (TT L1100).
- `WORKTREE_ADD_FAILED` is a per-mission failure folding into `LAUNCH_PARTIAL` (exit 2), not an abort.
- Branch naming is exactly `tower/<fleet>/<id>` cut from `base` (default repo HEAD branch)
  (TF L610 / L387).
- Every band number and the L1 alias come from `<ufoRoot>/config/ufo.json` at runtime; nothing is
  hardcoded and no provider/model is pinned (TF `loadBandAuthority` L139-156, `buildOmpArgv` L475).
