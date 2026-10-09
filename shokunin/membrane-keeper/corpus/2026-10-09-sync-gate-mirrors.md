# sync-gate-mirrors — who checks the membrane block's copies

Asked: is `bundled/config.json` a declared drift-checked mirror; what does
check-hand-authored-sets' "non-membrane half" mean; does any test pin the
canonical set.

Observed (wave r1-w1 lane SyncGateMirrors):

- `bundled/config.json` IS a declared drift-checked mirror:
  `sync-ufo-contracts.mjs` bundledConfigPath channel (:73), copy pair
  (:1921-1925), full-byte compare (:1950-2000). **Currently drifted** —
  observed `--check` → exit 1, `ok:false`, drifted includes
  `crates/ufo-core-runtime/bundled/config.json` (sighting.dispatch only;
  membrane parsed-equal). `build.rs:14-16`'s "byte-for-byte copy" claim is
  stale — canonical commit 5ace2559 changed sighting.dispatch without a
  mirror update.
- `skills/ufo/**` is a canonical source with `skillTargets` mirrors (:52-65,
  :1862-1880); `ssot/godspeed-core/directive.md` mirrored via
  `godspeedDirectiveMirrors` (:88-99); filter/velocity/SHA256SUMS only into
  crates bundled/ via `bundledAssetMirrors` (:122-127).
- `check-hand-authored-sets.mjs` header :2-3 "non-membrane half" means the
  SUB-5 items that don't edit `sync-ufo-contracts.mjs` (a membrane-listed
  path) — deferred to M5; the gate itself never reads membrane (1 grep hit,
  the comment). There is **no membrane set gate** — sync-ufo-contracts has
  zero membrane references.
- No exact-set equality test for `membrane.paths`; only presence checks at
  native_tests.rs:9340-9341 (`crates/ufo-core-runtime/**`,
  `scripts/ufo-sighting*`).
- Notable asymmetry: bundled ssot copies (`crates/ufo-core-runtime/bundled/
  godspeed-core/*`) are membrane-covered by `crates/ufo-core-runtime/**`
  while their canonical `ssot/` sources are not all membrane-listed — a
  bundled edit is membrane-restricted, a canonical edit is not.
- Working-tree `config/ufo.json` carries an uncommitted non-membrane swarm
  edit (operator state — not ours to touch).

Confidence: high for channel mapping/drift/gate scope; medium for
export-artifact caveat. Unknowns: live `--check` on working tree not run;
`.bak` files' contents not diffed (another lane confirmed JSON-identical).
