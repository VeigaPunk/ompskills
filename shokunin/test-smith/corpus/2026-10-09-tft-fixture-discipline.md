# 2026-10-09 — tower-fleet.test fixture discipline

**Asked.** How does `test/tower-fleet.test.mjs` build its fixture, read the
band, prove no-write, and exercise symlink escapes? (Lane `TftFixture`, scout.)

**Observed.** Sources: `test/tower-fleet.test.mjs:60-330,1371-1410,1631-1685`;
`sighting/tower-fleet.mjs:204,271-306,537,708-713`.

- Root override: `UFO_FSD_ROOT` (`test/tower-fleet.test.mjs:70`); the launcher
  itself reads no env var for the root — `ufoRoot` comes from the spec field.
- Fixture root: `ROOT = mkdtempSync(tmpdir()/tower-fleet-test-)` (`:106`);
  `UFO_ROOT = ROOT/ufoRoot` (`:107`); `mkdir UFO_ROOT/config` (`:108`);
  `copyFileSync(REAL_CONFIG, UFO_ROOT/config/ufo.json)` (`:109`) — a byte copy,
  never a symlink; `mkdir UFO_ROOT/scripts` (`:110`, "path source only; never
  executed here" — exception: section 33 plants an executable wall stub
  there); `REPO = ROOT/repo` (`:111`); `STATE_DIR = ROOT/state` (`:113`);
  `TREES_DIR = ROOT/trees` (`:114`). A missing substrate config is a `gate()`
  exit 1 (`:103`).
- Band source: parsed from the copied config at `UFO_ROOT/config/ufo.json`
  (`:116-124`) — keys `sighting.dispatch.maxConcurrentL1`,
  `sighting.windowPaneCeiling`,
  `sighting.dispatch.swarm.{waveMinLanes,waveMaxLanes,maxLanes}`,
  `sighting.dispatch.missionFormat.l1Alias`; live values observed
  16/16/16/32/100/`m_strong`. Patched fixtures via `configRoot(mutate)` (`:188`)
  re-read `REAL_CONFIG` into a fresh `mkdtemp('tower-fleet-cfg-')`.
- Console plumbing (plain script, no framework): `say` `:75`, `ok` `:78`,
  `bad` `:81` (increments failures), `check` `:85` (returns a boolean so
  dependents can skip), `gate` `:90` (GATE + FAILURES n + exit 1), `finish`
  `:96` (best-effort `rmSync(ROOT)` then exit `failures ? 1 : 0`).
- Helpers: `baseSpec` `:126` (fleet `tftest`, repo `REPO`, base
  `feat/test-base`, roundCeiling 2, maxTime 90m, missions tf-alpha/tf-beta);
  `writeSpec` `:159`; `writeRawSpec` `:244`; `launcher` `:166` (spawnSync node
  LAUNCHER); `typedError` `:170`; `expectTyped` `:178` (exit 2 + `ok:false` +
  exact code); `configRoot` `:188`; `stubWall` `:200` (bash stub logs `$*` and
  prints `{"status":"present","missions":[]}`); `specAt` `:211`; `missionsOf`
  `:216` (disjoint scopes `src/m-N`); `snapshotTree` `:228`; `expectUsage`
  `:255` (exit 64, empty stdout, typed USAGE line 0 + USAGE_TEXT line 1, stderr
  exactly 2 lines); `readdirSafe` `:319`.
- No-write proof (section 33, `:1371-1408`): per-entry fingerprint = relpath
  TAB `d|f` TAB size (0 for dirs) TAB mtimeMs, rows sorted and joined; roots
  `[ROOT, REPO, UFO_ROOT, dirname(STATE_DIR), dirname(TREES_DIR)]` (`:1383`,
  reduces to `[ROOT, REPO, UFO_ROOT]`); before captured `:1384`; shapes `plan
  --json` / `plan` human / bare / refused (= maxConcurrentL1 + 1) `:1386-1389`
  then `status --json` `:1392`; comparison is string inequality per root
  `:1394`, asserted empty `:1399`. The wall stub log lives in a separate
  mkdtemp outside all snapshotted roots; `plan` never shelled out (STUB_LOG
  absent) `:1390`; `status` did shell out, log exactly `status --lite` `:1402`
  matching `sighting/tower-fleet.mjs:537`.
- Symlink probe (section 37, `:1631-1673`): five `symlinkSync` calls (the only
  ones in the file) at `:1639,1643,1647,1651,1656` — prompt leaf
  `stateDir/<id>.prompt.md → configPath`; sessions parent
  `stateDir/sessions → UFO_ROOT/config`; fleet state leaf
  `stateDir/fleet.json → configPath`; worktree slot
  `worktreeRoot/<id> → UFO_ROOT/config`; skill target parent
  `<worktree>/.omp → UFO_ROOT/config` with `skills: ["probe"]`. Each runs
  `launch --apply --json` on a fresh stateDir/worktreeRoot and must exit 2
  `INVALID_SPEC` (`:1662-1663`; the exact message is not pinned). Leaf cases hit
  `lstatSync().isSymbolicLink()` (`tower-fleet.mjs:271-273`); non-leaf cases hit
  inside-root resolution (`:281`) and `assertSafeWriteRoot(target resolved)`
  (`:284`) over `realpathDeepest` (`:204`). The guards all run in
  `assertLaunchWriteTargets` (`:289/299/304/306`) from `verbLaunch:708` BEFORE
  `wallCli(spec,'open'):713`. The final check
  `readFileSync(configPath).equals(configBefore)` (`:1666-1667`) proves the
  fixture copy's band authority stayed byte-identical.

**Changed.** Nothing — read-only research.

**Unknown.** Global read-only-ness of the real substrate (only the temp copy is
watched); `configRoot` mkdtemp dirs are never removed (no `rmSync`; only ROOT,
`badCfg`, and the stub dirs are cleaned); the "byte-identical" snapshot label
overstates the metadata-only fingerprint [INFERENCE].
