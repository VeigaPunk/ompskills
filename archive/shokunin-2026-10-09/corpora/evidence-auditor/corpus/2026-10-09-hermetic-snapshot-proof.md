# 2026-10-09 — hermetic proof in `test/tower-fleet.test.mjs`

**Asked.** What does the hermetic mechanism in `test/tower-fleet.test.mjs` prove,
and what can it not cover? (lane `HermeticSnapshotProof`, reviewer.)

**Observed.** Source `test/tower-fleet.test.mjs`.

- **Substrate override**: `UFO_FSD_ROOT` (`:70`), default
  `/home/vgpnk/Projects/ufo-fsd-alpha`; a missing config gates exit 1 (`:103`).
- **Temp fixture root**: `mkdtemp 'tower-fleet-test-'`; the real
  `config/ufo.json` is **copied** in via `copyFileSync` (`:109`) — never
  symlinked; `scripts/` pre-created empty as “path source only” (`:110`);
  `stateDir`/`worktreeRoot` deliberately not created (`:113-114`); `BAND` reads
  six authority numbers from the copy (`:116-124`); `configRoot(mutate)`
  (`:188-197`) builds patched-copy roots for band-authority probes.
- **No-write snapshot** (§33, `:1371-1408`): `snapshotTree` (`:227-241`)
  fingerprints `{relPath, kind, size, mtimeMs}` rows, sorted; roots are the dedup
  set of ROOT, REPO, UFO_ROOT, `dirname(stateDir)`, `dirname(trees)`; before/after
  compared by full-string equality across `plan --json`/human/bare/refused-L1 and
  `status`. Proves nothing was created/deleted/renamed/resized/rewritten under any
  fixture root (including the planted stub itself); `stateDir`/`worktreeRoot`
  never appear; `plan` never shelled out (stub `argv.log` absent, `:1390`);
  `status`’s only external effect is argv `status --lite` (`:1402-1404`).
- **Stub wall** (`:199-208`): writes `ufoRoot/scripts/ufo-sighting` — a bash script
  appending `"$*"` to a log *outside* the snapshotted roots and printing fixed
  JSON `{"status":"present","missions":[]}`. Sole call site `:1377`.
- **Symlink escape** (§37, `:1631-1682`): five derived write targets (prompt leaf,
  sessions parent, `fleet.json` leaf, worktree slot, skill-target parent `.omp`)
  symlinked into the band-authority config; `launch --apply --json` must refuse
  **exit 2 `INVALID_SPEC`** per case; then `readFileSync(configPath).equals(configBefore)`
  (`:1680-1681`) proves nothing was written through a symlink.
- Helpers: `baseSpec` (explicit base `feat/test-base` = no git), `writeSpec`/
  `writeRawSpec`, `launcher = spawnSync` real node on the real
  `sighting/tower-fleet.mjs`, `typedError`/`expectTyped`, `expectUsage` (exit 64),
  `missionsOf`, `readdirSafe`, `gate`, `finish` (rmSync ROOT; exit 0/1).

**Covers that a live run cannot.** Negative write-guarantees; exact wall-contract
strings without a wall; destructive paths (`--apply` argv, symlink-hostile plants,
ceiling refusals) as pure data; refusal-before-side-effect ordering; deterministic
patched authorities. **Does not cover.** Real wall/tmux/pane behaviour (the stub
prints fabricated JSON); a legitimate `--apply`’s git/worktree/prompt/skill writes;
the snapshot is name/size/mtime, **not** a content hash (a same-mtime same-size
overwrite would pass) ([INFERENCE]); only the five listed roots and the window
from `:1384` onward.

**Changed.** Nothing — read-only research.

**Unknown.** The suite was not executed (the item did not ask); launcher internals
were not read — the findings are what the test pins. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/HermeticSnapshotProof.md`.