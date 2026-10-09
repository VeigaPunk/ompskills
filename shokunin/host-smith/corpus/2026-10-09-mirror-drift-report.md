# Gate 7 — bundled-mirror status (reported, never enforced)

**Asked.** The `--check` probe, the drift/staleAlias regexes, and the
note/WARN/ok selection.

**Observed.** `host/apply.mjs`.

- `runRealCheck` L707–722 spawns `process.execPath
  ['scripts/sync-global-routing.mjs','--check']` with `cwd = opts.ufoRoot` and
  `env = plannerEnv({UFO_OMP_GLOBAL_CONFIG_PATH: CANDIDATE})`. Only
  `UFO_OMP_GLOBAL_CONFIG_PATH` is consumed by the child (`sync-global-routing.mjs
  :328-331`); the child's `l1Alias` source is hard-coded
  `<scriptRoot>/config/ufo.json` (L220–233), so `--ufo-json` does **not**
  redirect gate 7's alias source.
- Drift regex `/drifts from the live global OMP config/` L734 targets
  `sync-global-routing.mjs:359` (exit 1). Stale regex `/modelRoles has no
  alias/` L735 targets `omp-global-config.mjs:478`, surfaced via
  `sync-global-routing.mjs:332-335`.
- Selection L725–759: script absent → skip-note; else echo stdout+stderr through
  `redact`; status 0 → ok; `applied` → unconditional two-line operator-owned
  WARN; pre-apply drift → 3 notes; pre-apply staleAlias → 3 notes; anything else
  → 2 WARNs. Called pre-apply L992, post-apply L1036.
- **Reported, never enforced:** no gate-7 branch calls `fail`; dry run exits 0
  and the apply path prints `APPLIED … nothing else touched` regardless of WARN.
  Steps 1–6 are the authoritative gates.

**Verified.** Dry run exit 0 with the drift branch firing (`error:
crates/ufo-core-runtime/bundled/omp-seat-routing.json drifts from the live global
OMP config…` + 3 notes). Bare `--check` against the installed config also exits 1
with the same line.

**Defects found.**

- **Unreachable branch.** The pre-apply `staleAlias` expectation (L404–406/
  749–752) cannot fire on the default `--ufo-root`: live `config/ufo.json:85`
  already declares `m_strong`, which the candidate defines. Drift fires instead.
- **F5 (medium).** `mirrorStatusReport(true)` returns the "EXPECTED … stale"
  WARN for **any** non-zero `--check` status — a hard `--check` crash post-apply
  is whitewashed as operator-owned drift; `drift`/`staleAlias` are computed but
  unused when `applied === true`.

**Added.** 2026-10-09 · lane `MirrorDriftReport` (connector)