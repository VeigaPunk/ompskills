# scope-resolution — how a ledger store path resolves

Asked: `PRIMEAGENT_SCOPE_PATTERN`, `scopedLedgerPath`, `defaultLedgerPath`, the no-default rule,
CLI precedence, and the hook's parallel rule. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `ScopeResolution`.

Observed:
- `PRIMEAGENT_SCOPE_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/u` (:119); `scopedLedgerPath` (:120-125) throws on bad scope
  and returns `<module>/../.ufo/scopes/<scope>/ledger/ledger.json` — **anchored to `import.meta.url`, not `UFO_PROJECT_ROOT`**.
- `defaultLedgerPath(env)` (:126-131): unset **or empty** `UFO_PRIMEAGENT_SCOPE` → `null`; malformed → throw.
  `DEFAULT_LEDGER_PATH` (:132-137) is the load-time try/catch constant.
- ONESHOT SUB-7 item 6 (:115-118; doc :107-111): **no** fleet-specific default store; no scope and no `--ledger`
  ⇒ every known verb refuses `no ledger bound: pass --ledger or set UFO_PRIMEAGENT_SCOPE` (exit 2); the historical
  `.ufo/scopes/nc5-primeagent/…` is gone (pinned tests :195-202, hook test :270-271).
- `resolveLedgerPath` (:1449-1452): `--ledger` wins over scope; relative resolved against `process.cwd()`; `null` → refuse in `runCli` :1466-1469.
- Hook: `SCOPES_ROOT=<repo>/.ufo/scopes`, mirror pattern (:69), `containedScopePath` (:72-76) requires a strict child;
  `resolveHookPaths` (:82-89) is tri-state (`undefined` → API derives; contained path; `null` = refused override, **never fallback**).
- Typed API (:326-333): only `opts.ledgerPath===undefined` derives scope; no scope → `no-ledger-state`; throwing scope → `options-invalid`.

Changed: nothing (one stray scratch file removed). Unknowns: whether any production env sets the hook overrides.

Report: `reports/ledger-keeper/ScopeResolution.md`.
