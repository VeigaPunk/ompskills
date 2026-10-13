# evidence-digest — round-1 objective gates

Asked: re-run the objective gates and census the wave's evidence.
Source: launcher + suite @ b251c5a. Lane: `EvidenceDigest`.

- Gate A `node --check sighting/tower-fleet.mjs` — exit 0, no output (valid ESM).
- Gate B `node test/tower-fleet.test.mjs` — exit 0, **967** `ok` lines, **0** `FAIL`, top-level
  stderr 0 bytes; last line `ALL CHECKS PASS`.
- The suite is hermetic: `ROOT = mkdtempSync(path.join(tmpdir(), "tower-fleet-test-"))` (:106); the
  real substrate config is `copyFileSync`-read into a temp ufoRoot (:109; :110 is the scripts-dir mkdir); no check opens the
  real wall or writes into either checkout (suite header :6-8).
- Cosmetic artifact: the last check prints the literal detail `"fixture config changed"` on a check
  whose pass condition is that the config is **unchanged** (:1680-1681) — wording only.
- At the digest lane's census time the report dir held zero sibling `.md` reports; it made no
  cross-lane claim.

Evidence: lane `EvidenceDigest`.
