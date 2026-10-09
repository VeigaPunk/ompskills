# Safe verification recipe

**Asked.** Run the dry run and record the observable signals; state what is safe
and what is forbidden.

**Observed.** `cd <worktree> && node host/apply.mjs` → exit 0. All eight gates
green; titles anchored at `host/apply.mjs:186,227,352,491,512,598,725,764`.
Signals per gate:

| gate | expected signal |
| ---- | --------------- |
| 1/8 | `regular file, 25425 bytes (limit 1048576)`; exactly one column-0 section each; `no credential shape anywhere` |
| 2/8 | `parsed clean — 19 modelRoles, 31 fallbackChains, 14 seats`; `sha256 15b40185…b5c9`; all 14 seats declared |
| 3/8 | `band inverts cleanly: waveMinLanes 16 <= waveMaxLanes 32 <= MAX_SWARM_LANES 100`; `l1Alias "m_strong" is bare and nonempty` |
| 4/8 | `whole-table audit: all 164 routes across 19 aliases and 31 chains are splitRoute-legal` |
| 5/8 | `all 14 seat chains non-empty, 107 primary+hop routes, pairwise-distinct bare models`; `seats.main.alias === l1Alias === "m_strong"` |
| 6/8 | `real CLI: a 32-lane spawn wave plans clean (band … 16-32)`; post-apply 16/32 admitted, 15 `too_few_lanes`, 33 `wave_too_wide`, 101 `too_many_lanes` |
| 7/8 | mirror drift printed as expected note block — **exit unchanged** |
| 8/8 | `DRY RUN — nothing will be written`; all six `sighting.dispatch` keys `already correct, line untouched`; verdict `DRY RUN PASSED … Nothing was written.` (L1003–1012) |

**No-write proof.** sha256 + mtime of `~/.omp/agent/config.yml` (`ed164f81…`,
7457 B) and `ufo-fsd-alpha/config/ufo.json` (`0e416f0a…`, 11999 B) byte-identical
before/after a re-run; printed `.bak` names never created; the green run's
`mkdtemp hostcfg-wave-*` dir removed by `finally rmSync` (L693–694).

**Exit-code matrix.** 0 = green dry run and bare `--help`; 64 = unexpected
argument / missing flag value (L171/176); 1 = validation failure, e.g.
`--ufo-root /nonexistent` → `error: --ufo-root does not exist…` (L951).

**Safe commands.** `node host/apply.mjs`; `--help`/`-h`; boundary probes
`--bogus` / `--ufo-root` (no value) / `--ufo-root /nonexistent` (stop pre-gate,
pre-write); the read-only children it spawns (`ufo-swarm-wave.mjs plan --spec`,
`sync-global-routing.mjs --check`).

**Forbidden here.** `node host/apply.mjs --apply` (writes the two files);
any write under `/home/vgpnk/Projects/ufo-fsd-alpha` (incl. `contracts:sync`,
`render-seat-tables.mjs`, `cargo build`); direct writes to
`~/.omp/agent/config.yml`; a scratch-redirected `--apply`.

**Footnote.** `fail()` → `process.exit(1)` skips the `finally rmSync`, so
**refused/aborted** runs leak a `/tmp/hostcfg-wave-*` dir (green runs clean);
harmless scratch, cleanup left to the operator.

**Added.** 2026-10-09 · lane `VerifyRecipe` (executor)