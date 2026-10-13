# 2026-10-09 — band-authority chain (delta → apply → live config → consumers)

**Asked.** What is the band-authority chain, how does apply merge the delta, what
are the live values, and what does the flap history prove? (Lane
`BandAuthorityChain`, connector.)

**Observed.** Sources: `host/ufo-sighting-dispatch.json` (whole);
`host/apply.mjs:60,287-320,333-349,351-398,549-696,842-863,894-941,1018-1035`;
`reports/tf-probe-band.md` §1-§3; read-only probe of the substrate
`config/ufo.json` (live + `git show HEAD:`) and its `.bak` files.

- Two files, distinct roles: the **declared/desired** band is
  `host/ufo-sighting-dispatch.json` — a 12-line delta (`maxConcurrentL1: 16`,
  `missionFormat.l1Alias: "m_strong"`, `swarm {maxLanes: 100, minLanes: 16,
  waveMinLanes: 16, waveMaxLanes: 32}`), load-bearing via `DELTA_PATH`
  (`apply.mjs:60`) and validated by `dispatchGate` (`:351-398`). The
  **enforced** band the runtime reads is `<ufoRoot>/config/ufo.json` under
  `sighting.*` after `--apply` merges the delta in; `windowPaneCeiling` lives
  only there, never in the delta. Consumers read it live: `loadBandAuthority`
  (`sighting/tower-fleet.mjs:151-156`) pulls all six fields via fail-closed
  `need()`+`intOf()` reads (rejects negatives/floats/strings; refuses
  `CONFIG_UNREADABLE` before any mutation) and renders
  `{{waveMin}}–{{waveMax}}`/`{{roundLaneCeiling}}` from those values — no
  hardcoded digits. Prose is downstream and rewritten to track the numbers
  (`planNoteRewrite` `:333-349`).
- Apply merge: dry run by default (no flags ⇒ validate, print, exit 0,
  "Nothing was written"); `--apply` writes exactly two files
  (`~/.omp/agent/config.yml`, `<ufoRoot>/config/ufo.json`); derived artifacts
  deliberately left stale as an operator-owned WARNING. The merge is a surgical
  per-line value rewrite (`planDispatchEdits:287-320`) — each delta leaf must
  match exactly one line file-wide or it fails closed ("refusing to guess");
  `mergeDispatch:894-941` re-parses and refuses to write if the result differs
  outside `sighting.dispatch`. `backupFile:842-849` copies to
  `<target>.<ISO-stamp>.bak` and refuses to clobber; `writeAtomic` writes
  `.pid.time.tmp` with `wx` and renames ("a torn write must never land").
  `dispatchGate:375-390` runs `positiveInt` on `maxConcurrentL1`,
  `waveMinLanes`, `waveMaxLanes`, `maxLanes`, refuses an inverted band, bounds
  both lane ceilings by `MAX_SWARM_LANES = 100`; `l1Alias` must be bare,
  nonempty, not `@`-prefixed, exist in the candidate's `modelRoles`, and seat
  `main` must resolve through it. **Latent hole** (probe finding 1): delta
  `swarm.minLanes` is present and numeric but NOT gated by `dispatchGate`'s
  `positiveInt` calls.
- Dry run proves edges not yet on disk (step 6 `:549-696`): leg (a) a real CLI
  subprocess at `WAVE_CLI_PROBE_LANES = 32` — a width inside both the pre-apply
  (32-100) and post-apply (16-32) bands, so the dry run is green before and
  after the merge; leg (b) exported `planSwarmWave` with the post-apply policy
  injected from the delta: 16 admitted, 15 `too_few_lanes`, 32 admitted, 33
  `wave_too_wide`, 101 `too_many_lanes`. Both legs bind
  `UFO_PROJECT_ROOT`/`UFO_CONFIG_PATH` to `--ufo-root` (`plannerEnv:581-595`).
  After apply, `apply C` re-runs the wave gate against disk and reports
  observed-vs-delta floor (`:1018-1035`).
- Live values measured this session: live `config/ufo.json` sha256 prefix
  `0e416f0abc559e9a` — `waveMinLanes 16`, `waveMaxLanes 32`, `maxLanes 100`,
  `minLanes 16`, `maxConcurrentL1 16`, `l1Alias m_strong`,
  `windowPaneCeiling 16` (live-only). Distinct limits: `windowPaneCeiling` is
  per-fleet-window display capacity, `maxConcurrentL1` the live L1 mission
  ceiling, neither interchangeable with `globalRunnerCeiling` (1056 live, never
  a band field).
- Pre-apply band: `git show HEAD:config/ufo.json` still carries
  `waveMinLanes 32, waveMaxLanes 100, minLanes 64, maxLanes 100` — `minLanes 64`
  is a forensic tell the delta never writes (its presence means the file is
  pre-apply/committed, not merged).
- Flap history (`tf-probe-band.md` §2): three live writes in 17 minutes —
  01:14:17Z first `apply --apply` (backup holds pre-merge 32-100/minLanes 64);
  01:19-01:21Z live 16-32, planner `policy {source: config, …}`, 16-lane wave
  admitted 01:20:49Z; **01:22:15Z rollback** to the committed 32-100 bytes
  (sha `7efc813b…`, clean `git status`, no `.bak`); 01:22-01:30Z four probe
  points red; 01:30:57Z second `apply --apply` restored 16-32 (sha
  `0e416f0a…`, diff vs HEAD = exactly the delta's six values); 01:35:20Z
  five-edge re-probe green; 01:36Z `run-wave-test.mjs --band live` exit 0,
  60 checks. Cause: a sibling mission (`tf-band`) symlinked its scratch root's
  `config/` entries to the live substrate and `Bun.write` followed the symlink,
  writing the committed 32-100 bytes into the live file (not a git operation —
  hence byte-identical to HEAD, clean status, no backup; size 12000 committed
  vs 11999 merged corroborates).
- The rule: **measure the band from the merged config — never from prose, never
  from a hardcoded table.** "The live config carries the merged band" is false
  as a steady-state claim; any live-authority claim is only meaningful with a
  sha256 AND a time window. Test discipline mirrors it:
  `test/tower-fleet.test.mjs` §21 patches a temp copy of the config to a
  distinctive value ("a baked-in constant cannot pass") and asserts the plan
  echoes it while the real config stays untouched.

**Changed.** Nothing — read-only research.

**Unknown.** The substrate's git history beyond `git show HEAD`; `apply.mjs`
steps 4/5 (mirror/compile gates) internals; nothing was run with `--apply` and
nothing in the substrate was written.
