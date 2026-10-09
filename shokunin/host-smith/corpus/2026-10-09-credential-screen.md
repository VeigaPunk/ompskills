# Credential screening and redaction

**Asked.** How `apply.mjs` screens and redacts credential-shaped text.

**Observed.** `host/apply.mjs`.

- Dynamic import of `<ufo-root>/scripts/ufo-credential-screen.mjs` L956–965,
  binding `screen.containsSensitiveShape` L961. This runs **before**
  `preflightCandidate` (L967) and every gate, so nothing file- or
  subprocess-derived is printed unredacted. Only `parseArgs`, four static banner
  `say()` lines (L946–949) and two root-existence fails (L951–954) run earlier.
- `redact` L98 starts as identity; L962 reassigns it to
  `(text) => sensitiveShape(text) ? "<redacted>" : String(text)` — whole-value
  replacement with one module-level binding shared by all sinks.
- **Fail-closed load path** L963–965: a load failure → `fail()` → exit 1 before
  any gate; no degraded unredacted mode. Demonstrated against a fake `--ufo-root`.
- `redact` call sites: L102 (every failure message), L481 (route-audit problems),
  L620 (wave-probe stderr), L731/L732 (`--check` stdout/stderr), L757
  (unexpected-refusal blob).
- Preflight line scan L213–221 uses the same predicate; refusal names only line
  numbers, never content.

**Substrate predicate** (`ufo-credential-screen.mjs`): `containsCredentialShape`
(L18–41, byte-exact mirror of `native.rs`) plus `SENSITIVE_LITERAL_RE` L51
(`api_key=`, `token=`, `xoxb-`, `AIza`, `PRIVATE KEY`, JWT `eyJ..eyJ`) and a
`\p{Cf}`-stripped second pass L61–67.

**Note (defect surface).** Redaction is call-site discipline, not a
`say`/stderr chokepoint — a future bare `say()` of untrusted text would silently
opt out; `usage()` L108 echoes an argv token raw, pre-wiring. (The substrate
resolver separately leaks a credential-shaped **quoted config key** verbatim in
its `resolveSeatFromMaps` error interpolation — see the parser-dialect entry.)

**Verified.** Dry run exit 0 with the preflight credential ok line; fake-root
load-failure demo exit 1; substrate predicate probes 5/5; candidate rescan 0
flagged lines.

**Added.** 2026-10-09 · lane `CredentialScreen` (sentinel)