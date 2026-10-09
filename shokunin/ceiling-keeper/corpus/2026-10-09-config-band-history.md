# config-band-history — how the band got here

Asked: reconstruct the history of the numeric band.
Lanes `ConfigDrift` (revenger) and `FleetBandEvidence`. The 5ace2559 diff was re-read by the L1 with `git show`.

| when (−03) | event | maxConcurrentL1 / minLanes / wave band / maxLanes |
| --- | --- | --- |
| 2026-09-20 | `4f10fbff` | maxLanes 128, minLanes 2 |
| 2026-09-20 | `7dcde370` → `7fe921af` | 100 / 12 → minLanes 64, wave 16–32 |
| 2026-09-21 | `91cc18fe` | waveMaxLanes 100, globalRunnerCeiling 1056 |
| 2026-09-25 | `72ab84a8` | 32 / 64 / 16–100 / 100, l1Alias m_daybreak |
| 10-08 16:15 | apply run (`…19-15-32-811Z.bak` = 72ab84a8 bytes) | → 16 / 64 / 32–100 |
| 10-08 16:16 | commit `5ace2559` (HEAD) "maxConcurrentL1 16, wave band 32-100, l1Alias m_strong" | 16 / 64 / 32–100 / 100 |
| 10-08 22:13 | ompskills `4bb0b23` retargets the delta to 16–32 | (delta only) |
| 10-08 22:14 | apply run (`…01-14-17-257Z.bak`) | → 16 / 16 / 16–32 / 100 |
| ~22:22 | clobber back to HEAD bytes, no `.bak` (reported by tf-audits as a write through a symlink; not reproduced) | 16 / 64 / 32–100 |
| 22:30:57 | apply restore (`…01-30-57-403Z.bak`); file mtime equals the backup's | 16 / 16 / 16–32 / 100 (**live**) |

- Every `config/ufo.json.<UTC-ISO>.bak` is written by `host/apply.mjs` `backupFile(stamp())`. 8 of 9 hold HEAD bytes, and **none** holds the live band, so the backups cannot restore the live state.
- Every fleet wave artifact under `.tower/fleets/*/waves` (56 policy blocks, 41 waves, 2026-10-08 22:32 → 2026-10-09) reads 16/32/100/16, which is the working tree.
  The spawn range observed is 16–32, with zero refusals (all 33 `.err` files are 0 bytes). [INFERENCE] Under HEAD's floor of 32, 39 of the 41 would refuse with `too_few_lanes`.
- `evidence/nightcall-integration/*wave-dispatch.json` show `hardCeiling 128` and `globalRunnerCeiling 1024`, an older emitter. The 128 source was not located (shallow clone).

Lesson: a band change is a live-file edit plus an apply backup. The commit message can lag the file. Always diff the working tree against HEAD.
