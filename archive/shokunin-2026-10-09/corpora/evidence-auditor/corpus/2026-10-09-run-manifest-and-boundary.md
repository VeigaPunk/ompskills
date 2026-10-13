# 2026-10-09 — the run manifest and the dispatch-boundary artifact

**Asked.** What does `test/run-wave-test.mjs` write as its manifest, what does it
record, and what does `dispatch-boundary.txt` prove? (lane `WaveTestManifest`,
scout.)

**Observed.** Source `test/run-wave-test.mjs:1348-1372`. Schema string
**`ufo-sighting-wave-smoke-manifest-v1`** — distinct from the dispatch payload
schema `ufo-swarm-wave-dispatch-v1` and from the *wall* manifest
`<ufoRoot>/.ufo/sighting/manifest.json`. **Two different `manifest.json` artifacts
share the basename**: cite the directory (this is the run manifest).

Top-level keys (21 observed): `schema, stamp, generatedAt, repoRoot, ufoRoot,
bandMode, lanes, wave, reportDir, evidenceDir, scratchProjectRoot, liveWall,
dispatched, node, band, wall, payload, seatAliases, checks, passed, exitCode`.
There is **no key named `runMeta`** — `...runMeta` (`:1364`) spreads
`band{ mode, configPath, expected }`, `wall{ executed, commands[] }`,
`payload{ path, registry, lanes }`, `seatAliases` inline (`:1410-1413`).
`reportDir` is repo-relative posix; `evidenceDir`/`scratchProjectRoot` absolute.
`checks[] = { id, ok: boolean, detail }`, plus an optional `gate: true` added only
by `gate()` failures (`:217-223`). `passed = failed.length === 0`; `exitCode` is
the process code.

`dispatched: false` is a **hardcoded literal** (`:1362`); no code path sets it
true. It asserts the dry half did not dispatch (true by construction — the header
says no flag makes it dispatch); it **cannot** detect out-of-band manual
dispatch, so it is a provenance label on the artifact, never proof of a negative
about the world.

The manifest write sits in `try { … } catch {}` (`:1348,1370-1371`): *“The
manifest is evidence, not a gate: a failure to write it must not mask the verdict
already printed.”* A missing manifest is therefore “no record”, never “no run”
(`die()` and the panic path exit without writing one).

`dispatch-boundary.txt` (`dispatchBoundary()`, `:1264-1334`, written at `:1332`
before `finish()`) is **byte-identical to the block printed to stdout**: the six
numbered hand-run steps. It proves the script reached step 8; it does **not**
prove the manual `task` call was issued. It carries an honesty guard: *“A wall row
with levels.l2 null and levelDetails.l2.status "opaque" means UNKNOWN, not
settled — say so instead of claiming a clean run.”*

Observed precedent: a previously written run
`test/evidence/wave-20261009T033705Z/manifest.json` — 93 checks, `passed: true`,
`exitCode: 0`, no `gate` rows, `node 24.21.0`, `bandMode live`, `wall.executed false`.

**Proves.** The script reached `finish()`; each `checks[]` verdict is what *this
same process* measured, paired with the environment it was measured in.
**Does not prove.** Independent truth (self-attested, unsigned); that a wave ran,
settled, or reported (lane reports are only *instructed*); wall or substrate
state; cross-run continuity.

**Changed.** Nothing — read-only research.

**Unknown.** The script was not executed; observed values come from a pre-existing
run directory. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/WaveTestManifest.md`.