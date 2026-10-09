# Runtime directive load order and the mirror-drift bail

**Asked:** how `godspeed.rs` resolves the directive and what pins it.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/crates/ufo-core-runtime/src/godspeed.rs`;
`godspeed_tests.rs`; `native_contract.rs`.

## Observed

- **Root resolution:** `UFO_ROOT` env (must be a directory, else bail — :11,54-64,400-403) → passed root
  (used only if some candidate stats — :404-408) → bundled `CARGO_MANIFEST_DIR/bundled` (:362-364,409-412).
- **Candidate order within a root** (:64-71): `ssot/godspeed-core/directive.md` →
  `skills/ufo/references/godspeed-core/directive.md` → `godspeed-core/directive.md`.
  `load_from_root` (:247-262): first present wins; every later present candidate must have equal decoded
  text, else bail **`godspeed directive mirror drift`**. Judge path `load_from_trusted` (:450-467)
  bypasses `UFO_ROOT` and the bundled copy (memoized `TRUSTED_GODSPEED_CACHE`).
- **Pin:** no compile-time/Rust digest literal for the directive exists
  anywhere in `crates/` (the bundled `godspeed-core/SHA256SUMS:1` does contain
  the hash as manifest data). `verify_sums_manifest` (:153-219) reads the
  sibling `SHA256SUMS`: absent → Ok; present → fail-closed on
  unreadable/oversized/malformed/duplicate/non-hex/non-UTF8/missing entries,
  recomputing vs declared at :213-218. Ceilings: `MAX_DIRECTIVE_BYTES = 1<<20`
  (:15), `MAX_SUMS_BYTES = 64*1024` (:75).
  Effective digest in this tree: `db88963c…` (ssot, bundled, skills/ufo/references, `.omp` mirror, and the
  host `directive.md` all identical; manifest line `ssot/godspeed-core/SHA256SUMS:1`). The manifest also
  declares `filter.md` `ddfabdcb…` and `velocity.md` `dbd37a12…` — the runtime looks up only the loaded
  file's own name.
- **filter/velocity never loaded by the runtime** (`load_from_root` reads only `directive.md`;
  comment :366 "judge trilogy stays judge-only"). `native_contract.rs:48-51` hashes the ssot directive +
  `skills/ufo/references/godspeed-core/{directive,filter,velocity}.md`; `PROJECT_OMP_MIRRORS`
  (:118-131) byte-compares skills↔`.omp` copies.
- **Drift gap:** ssot `filter.md` `ddfabdcb…` ≠ mirror `09957d08…`; ssot `velocity.md` `dbd37a12…` ≠
  mirror `349243f6…`; the sums check covers neither and `PROJECT_OMP_MIRRORS` only compares skills↔`.omp`
  (which agree) — so ssot↔skills drift is unflagged.
- Tests pin: `mirror_drift_is_refused` (`godspeed_tests.rs:18-35`), `sums_manifest_wrong_digest_is_refused`
  (:123-135), positive symlink-to-regular verifies (:237-252), fail-closed manifest arms (:137-230,279-295),
  root precedence + bundled fallback (:103-111,45-52,303-314).

## Unknown

Whether fleet L1s seat on this host at all (the `~/.agents/godspeed-core/` gap is reported elsewhere).