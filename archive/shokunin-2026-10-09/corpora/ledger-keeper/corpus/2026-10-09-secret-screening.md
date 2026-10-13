# secret-screening — credential screening, adversarially probed

Asked: the canonical pattern list, `firstSecretHit`, the format-char strip, what is screened where,
the floor union, and echo behaviour. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `SecretScreening` (sentinel).

Observed:
- Canonical `secretPatterns` **= 11** (config:14): sk-, sk-ant-, ghp_, gho_, github_pat_, AKIA,
  `Bearer `, `-----BEGIN … PRIVATE KEY-----`, xox[baprs]-, glpat-, npm_. ("12" is the test union+1 number.)
- `firstSecretHit` (:260-267): strip `\p{Cf}` (:261), then **pattern-major** — first pattern in policy order matching
  any value wins; returns the pattern string, so refusals quote the config, never the value.
- Screened at write: body/title/`${title}${body}`/axis(non-null)/each evidence ref/createdByRun/createdAt (:345-351),
  `--session` (:623-631), `--mission` (:639-646). Read-only: top-level lineage minus `parentRunId` (:444-450), plus per-entry re-screen (:397).
- Floor union proven with a hostile config (`secretPatterns: []`) → 11 patterns retained.
- Adversarial findings (no contract change): (MED) case-sensitive patterns accept `GHP_…`;
  non-`Cf` interstitials (U+FE00, C0) evade the join; no AWS secret-key shape; (MED) four non-screening
  refusals echo **raw store bytes** before any screen (kind-mismatch :312, writer-coherence :432,
  session/mission-bound :668/:648) — and `fail()`→`console.error` passes ESC through unsanitized;
  (LOW) evidence refs are never joined; (INFO) the `createdAt` screen element is unreachable by construction.

Changed: nothing. Unknowns: whether non-AKIA AWS shapes are deliberately out of catalog scope.

Report: `reports/ledger-keeper/SecretScreening.md`.
