# Credentials and redaction on the routing surfaces

**Asked.** Do the routing surfaces carry a credential, and where is redaction?

**Observed.** No credential/API-key/token/secret/bearer/password **value** on any
assigned surface.

- `~/.omp/agent/config.yml` (mode 0600): 221 lines, 0 flagged by
  `containsSensitiveShape`; values are route selectors only. No
  `key`/`token`/`secret` field exists by design — the operator's three
  alibaba-token-plan credentials live as omp **accounts** behind the
  `alibaba-token-plan` provider id, not in this file.
- `host/omp-agent.config.yml`: 492 lines, 0 flagged.
- `ufo-fsd-alpha/config/ufo.json`: 380 lines, 0 flagged (`surfaceDigest` is a
  public sha256, not a credential).
- `host/ufo-sighting-dispatch.json`: 13 lines, 0 flagged.
- The applier's dry run re-screened 123 output lines through the repo's own
  `containsSensitiveShape` -> 0 flagged.

Redaction seam:

- `containsSensitiveShape` — `ufo-fsd-alpha/scripts/ufo-credential-screen.mjs:62-68`
  (`containsCredentialShape` + `SENSITIVE_LITERAL_RE`, re-tested after stripping
  `\p{Cf}` format chars).
- `safeLine` / `safeKey` — `omp-global-config.mjs:206-209` / `:213-215`, guard
  every error message that echoes a raw config line or key.
- `host/apply.mjs` installs a redactor from the repo screen (fail-fast :956-965)
  and wraps its subprocess-echo sites.

**Low findings (lane 25).**

- Colon-form YAML secret labels (`api_key:` / `secret:` / `token:` + an
  unlabeled random value) return `containsSensitiveShape = false` — the screen is
  shape/prefix-based. Zero such strings exist on surfaces today; a future pasted
  colon-form secret in a candidate comment could pass apply gate 1/8.
- `say()` writes raw; screening depends on each echo site manually wrapping
  `redact`, so a future file-derived `say()` would bypass it.

**Changed.** None.

**Unknown.** `surfaceDigest` preimage; the credential store (deliberately out of
scope — no key value read or printed).

Evidence: lane CredentialSentinel25.