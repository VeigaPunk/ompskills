# Band config clobber: a live L1 can overwrite the substrate authority

## Asked

During r2 validation of this fleet, `config/ufo.json` in the substrate
(`/home/vgpnk/Projects/ufo-fsd-alpha`) was observed clobbered — validator
`plan` fell back to default band 2-100 instead of the real 16-32/100. Trace
who did it and whether the fleet record shows it.

## Observed

- `ceiling-keeper`'s L1 session
  (`shokunin3/sessions/ceiling-keeper/2026-10-09T18-35-…_5e756b90-….eval.log`,
  command at `19:27:12.742Z`) ran a heredoc script whose `cd` failed
  mid-script; a `printf … > config/ufo.json` then truncated-and-rewrote the
  **substrate** `config/ufo.json` (`{"drills":{}}`) instead of a scratch copy.
- The substrate file's mtime read `19:27:12.85Z`; validator `plan` at that
  moment returned band `{waveMinLanes:2, waveMaxLanes:100, maxLanes:100}` —
  `source:"config"` but degraded (config parse failure fallback inside the
  validator).
- Restored at `19:30:50Z` (sha `0e416f0a…`, band 16/32/100) by an
  unidentified writer — not this mission, which never writes the substrate;
  likely the operator. `tower-fleet status` during the window read
  `ok:false, CONFIG_UNREADABLE`-style failure (fleet state itself was fine —
  the hazard is band authority only).
- **Receipt-keeper lesson:** `fleet.json.band` is a *launch-time snapshot*.
  The live band can be clobbered and restored between reads with zero trace
  in any fleet artifact; only session transcripts carry the write. When a
  validator run shows a degenerate band, check substrate `config/ufo.json`
  mtime/sha against the fleet's `launchedAt` window — divergence means
  out-of-band mutation, and session logs are the only evidence.
- Mitigation used this round: `UFO_CONFIG_PATH` pointed at a scratch root
  with a real copy (`/tmp/rk-band-8yEBVT/config/ufo.json`, sha `0e416f0a…`),
  never a symlink — `Bun.write`/`writeFileSync` through a symlink clobbers
  the target.

## Changed

Card step 1 already flags out-of-band keys; this entry generalizes it to the
band authority. No fleet artifact needed editing — the event left no trace
there.

## Unknowns

- Who restored the config at 19:30:50Z (no fleet/session writer found in my
  scope; [INFERENCE] operator hand-edit).
- Whether the ceiling-keeper L1 ever noticed its own write landed wrong.
