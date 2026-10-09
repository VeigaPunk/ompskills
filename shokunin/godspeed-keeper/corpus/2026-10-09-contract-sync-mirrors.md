# sync-ufo-contracts.mjs — authored source and mirror map

**Asked:** which godspeed-core files are authored vs mirrors, so drift can be told apart.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/sync-ufo-contracts.mjs`.

## Observed

- **Authored source:** `const godspeedDirectiveSource = "ssot/godspeed-core/directive.md";` (:76; also in
  `canonicalSources` :133).
- **Directive mirrors:** `godspeedDirectiveMirrors` (:104-113) — 6 explicit literals
  (`skills/ufo/references/godspeed-core/directive.md`, `skills/godspeed-core/directive.md`,
  `skills/godspeed/directive.md`, `godspeed-core/directive.md`,
  `crates/ufo-core-runtime/bundled/godspeed-core/directive.md`, `.cursor/skills/godspeed/directive.md`)
  plus a derived pattern `<skillTarget>/references/godspeed-core/directive.md` for each of 13
  `skillTargets` (:89-103), plus `packagedDependencyMirrors()` (:807-819) emitting
  `<pkgroot>/ssot/godspeed-core/directive.md`. Two declared `.devin` references are absent from the tree.
- **filter/velocity:** no dedicated channel. `bundledAssetMirrors` (:122-127) mirrors them (and a
  `SHA256SUMS`) into the crate bundle only; the general skill pass (:1900-1907) copies
  `skills/ufo/references/godspeed-core/{filter,velocity}.md` to each `<target>/references/godspeed-core/`
  (directive rel excluded :1902).
- **Two lineages, both "synced":** ssot annotated (`filter` `ddfabdcb…`, `velocity` `dbd37a12…`) vs
  vendored bare (`09957d08…` / `349243f6…`). The bundled crate gets annotated ssot bytes; package targets
  get bare vendored bytes; `--check` passes because each mirror matches its own declared source.
- **Re-derivation predicate:** a path is a declared mirror iff it is a dest in the copies list
  (`runSync` :1892-1949) whose source is in `canonicalSources` (:129-137). Channels: general skill pass
  (:1900-1907), agent pass (:1908-1919), bundled-config (:1920-1924), godspeed-directive-mirror
  (:1926-1932), bundled-asset-mirror (:1933-1939), dep-closure (:1940-1947). Gate:
  `node scripts/sync-ufo-contracts.mjs --check` (read-only, exits 1 on drift).
- **Not mirrors:** root `godspeed-core/**`, `skills/godspeed-core/**`, `skills/godspeed/**`,
  `docs/artifacts/public-lkg/godspeed-core/**` (dated artifact; directive hash `dedefb14…` ≠ ssot).
- **`--check` run (read-only, observed):** exit 1, `missing` 18 — all from two undeclared-on-disk `.devin`
  targets; `drifted`: `bundled/omp-seat-routing.json`, `bundled/config.json`; extras 0; validationErrors 0;
  **no godspeed-mirror drift**; `skillsSums` ok. Non-godspeed failures (surface digest drift, seat
  mismatches) are out of scope.

## Unknown

Whether the `.devin` mirrors exist only after a write pass (forbidden read-only).