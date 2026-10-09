# match-semantics — membrane_path_matches and the shared path shape

Asked: the matcher's grammar verbatim; the shared shape validator; the
touched_paths vs candidate_writes relation.

Observed (wave r1-w1 lane MatchSemantics):

- `crates/ufo-core-runtime/src/proposal.rs:354-359`:
  `match pattern.find('*') { Some(glob) => path.starts_with(&pattern[..glob]),
  None => pattern == path }`.
  - Only `*` is special; `**` == `*` (first-star split); text after the first
    `*` is ignored — `a*b/c` behaves like `a*`.
  - Left-anchored string prefix only; not boundary-aware — the trailing slash
    or `/**` in the stem is what prevents `crates/ufo-core-runtimeX` matching.
  - Case-sensitive (observed `Config/ufo.json` ≠ `config/ufo.json`; untested
    pin); the filesystem is never consulted.
  - Doc at proposal.rs:71-78 (on `validate_repo_relative_path`): non-canonical
    spellings would pass a naive check yet never byte-match a canonical
    pattern → under-match; canonicalizing the shape is the fix.
  - Callers: loop_driver_judge.rs:435 (fixture screen) and native.rs:328
    (native screen). proposal.rs:348-353 comment says `*` or `**` — code
    treats them identically (comment over-states).
- `validate_repo_relative_path` (proposal.rs:79-103): rejects empty, leading
  `/`, `\`, `//` or trailing `/`, `.` segment, `..` segment (whole-segment
  only). Shared by `touched_paths`, `candidate_writes[].path`, and
  `membrane.paths`. Observed gap (untested): `C:/x` and NUL bytes pass.
- `validate_touched_paths` (proposal.rs:108-120): shape + BTreeSet duplicate
  refusal. `validate_candidate_writes` (proposal.rs:131-175): count ≤ 64,
  shape, duplicate path, base64 guard, decoded ≤ 256 KiB.
- Relation: separate `Option` fields (proposal.rs:29-35, 44-48); both
  shape-validated at intake; the membrane screen runs on the **union**
  (BTreeSet at loop_driver_judge.rs:424-437; `.chain` at native.rs:320-329);
  `MembraneAccept.touched_paths` serializes the sorted union (state.rs:63-64).
- v1 freeze: `first_nonempty_additive_field` (proposal.rs:232-249) rejects
  non-empty touched_paths/candidate_writes under omp-native-v1.
- Tests pinning the grammar: proposal_tests.rs:303-331 (glob stem prefix),
  native_tests.rs:9334-9369 (shared-rule parity), loop_driver_tests.rs:4594-4618
  (union includes candidate_writes).

Confidence: high (direct reads). Gaps: case sensitivity and `a..b` acceptance
untested; refusal reasons are free-form strings, not typed codes.
