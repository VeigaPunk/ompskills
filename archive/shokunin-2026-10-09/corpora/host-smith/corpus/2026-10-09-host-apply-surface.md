# host/apply.mjs entry surface

**Asked.** What is the installer's entry contract — header, flags, defaults,
exit codes, and the numbered gate titles?

**Observed.** `host/apply.mjs`, 1041 lines.

- Dry run by default (L4–L7). `--apply` writes **exactly two files** (L9–L11):
  `~/.omp/agent/config.yml` (timestamped backup, install) and
  `<ufo-root>/config/ufo.json` (timestamped backup, merge). It regenerates no
  derived artifact (L12–L17); the bundled mirrors and `AGENTS.md` stay stale by
  operator decision, reported as an intentional WARNING.
- `parseArgs` (L157–L178, called L944): `--apply` L167; `--help`/`-h` → `usage()`
  with no message → exit 0 (L168); `--ufo-root`/`--install-target`/`--ufo-json`
  each require a non-empty value and are `path.resolve`d (L169–L175); any
  unexpected argument → `usage(msg)` → exit 64 (L176).
- Defaults: `apply:false` L159; `ufoRoot: process.env.UFO_ROOT || DEFAULT_UFO_ROOT`
  L160, `DEFAULT_UFO_ROOT` L61; `ufoJson:null` L164 → resolved to
  `<ufo-root>/config/ufo.json` L361; `installTarget: ~/.omp/agent/config.yml`
  L165.
- Exit codes: `fail()` L101–L104 → exit 1; `usage()` L107–L118 → exit
  `message ? 64 : 0`; success exits 0 (dry L1011, apply L1041).
- Gate titles: `1/8 candidate preflight` L186, `2/8 resolver gate` L227,
  `3/8 dispatch delta` L352, `4/8 route gate` L491, `5/8 compile gate` L512,
  `6/8 wave gate` L598, `7/8 bundled-mirror status` L725, `8/8 apply plan`
  L764; then `apply A` L866, `apply B` L895, `apply C` L1021, `verdict`
  L1004/L1038.

**Verified.** `node host/apply.mjs` → exit 0 (nothing written); `--bogus` →
exit 64; `--help` → exit 0.

**Unknowns.** The write path (`--apply`) is statically verified only; it was
never executed (forbidden in this repo).

**Added.** 2026-10-09 · lane `HostApplySurface` (scout)