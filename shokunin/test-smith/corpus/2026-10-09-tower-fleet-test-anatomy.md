# 2026-10-09 — tower-fleet.test.mjs anatomy

**Asked.** What is the anatomy of `test/tower-fleet.test.mjs` — harness style,
section map, fixture entry points, exit codes, run command, and current state?
(Lane `TftAnatomy`, scout.)

**Observed.** Source: `test/tower-fleet.test.mjs` (1685 lines); run executed by
the lane.

- Harness style: a plain top-level Node ESM script, no test framework — five
  builtin imports only; plumbing `say`/`ok`/`bad`/`check`/`gate`/`finish` at
  `:74-101`; sections are bare `{ }` blocks headed by `// ── N.` + `say()`;
  terminal `say(failures === 0 ? "ALL CHECKS PASS" : "FAILURES n")` then
  `finish(0|1)` at `:1683-1685`. `check()` prints its detail on passing checks
  too.
- Header vs body: the header (`:2-48`) lists 14 numbered "Covered:" topics; the
  body has 37 numbered sections (`:268-1631`) — a coarse summary, not a 1:1
  index.
- Coverage map (section marker lines): 1 `:268` plan 2-mission spec + argv;
  2 `:313` no writes; 3 `:323` default verb; 4 `:331` L1 ceiling; 5 `:370` /
  6 `:389` / 11 `:507` / 12 `:558` / 13 `:594` scope taxonomy + normalization;
  7 `:427` identity; 8 `:446` mutation guard; 9 `:455` usage 64; 10 `:463` omp
  argv exact list; 14 `:635` fleet pattern; 15 `:660` mission-id pattern + dup
  gate; 16 `:704` mission shape; 17 `:733` skills; 18 `:773` maxTime;
  19 `:796` roundCeiling; 20 `:821` spec shape; 21 `:886` pane ceiling live +
  L1-before-pane; 22 `:923` `--help`; 23 `:942` typed USAGE; 24 `:964` /
  25 `:982` / 26 `:995` render fidelity; 27 `:1030` wall argv tokens;
  28 `:1099` guard ordering on stub wall; 29 `:1171` / 30 `:1260` / 31 `:1295` /
  34 `:1410` band authority; 32 `:1333` template ledger; 33 `:1371` snapshot
  no-write; 35 `:1479` interactive guard; 36 `:1559` wall isolation stub;
  37 `:1631` symlink confinement.
- Fixture entry points: `SUBSTRATE`/`REAL_CONFIG` `:70-71` (`UFO_FSD_ROOT` or
  the default substrate path); `ROOT`/`UFO_ROOT`/`REPO`/`STATE_DIR`/`TREES_DIR`
  `:106-114`; `BAND` `:117-122`; helpers `baseSpec:126`, `writeSpec:159`,
  `launcher:166`, `typedError:170`, `expectTyped:178`, `configRoot:188`,
  `stubWall:200`, `specAt:211`, `missionsOf:216`, `snapshotTree:228`,
  `writeRawSpec:244`, `USAGE_TEXT:252`, `expectUsage:255`, `readdirSafe:319`.
- Subprocess vs import: all 37 sections spawn the launcher as a subprocess via
  `launcher()` → `spawnSync(process.execPath, [LAUNCHER, ...args])` `:166-168`.
  Zero imports of `sighting/tower-fleet.mjs` (no static or dynamic import); the
  only cross-file read is §32 reading `sighting/l1-prompt.md` (`:1340`).
  Stub-wall sections: §28, §33, §36.
- Exit codes: the script itself emits 0 (`failures === 0`) or 1 (a failing
  check, or `GATE fixture:` + `FAILURES 1`). 64 is never emitted by the script
  (no argv parsing) — it is only asserted about the launcher (`expectUsage`
  `:257`, §9, §22, §28).
- Command: `node test/tower-fleet.test.mjs` (cwd-independent; `UFO_FSD_ROOT`
  only if the substrate is elsewhere).
- Observed run (this lane): exit 0; 1013 stdout lines with 967 `  ok ` lines,
  0 FAIL, 0 GATE; stderr 0 bytes; final line `ALL CHECKS PASS`; no repo writes;
  ~3.5s.
- Staleness flag: prior audits describe an older 294-line / 8-section /
  ≈73-check revision (`reports/tf-audit-tests.md:5,8`; unlanded rewrite at
  `:149`) — the current file is 1685 lines / 37 sections / 967 passing checks.

**Changed.** Nothing — read-only research.

**Unknown.** Assertion count vs ok-line count was not separated (967 is the
exact `  ok ` line count); no LSP device was used (no server for `.mjs`); the
suite's behavioral quality was not judged (out of lane scope).
