# directive.md — drift, and what is not drift

**Asked:** falsify "directive.md is identical everywhere".
**Source:** hash sweep + `sha256sum -c` on the four manifests + `node scripts/sync-ufo-contracts.mjs --check`.

## Observed

- Assumption falsified narrowly: 34 of 35 located copies are `db88963c…`. Exactly one diverges —
  `docs/artifacts/public-lkg/godspeed-core/directive.md` (`dedefb146331c4999f1fda337ca69a6b0b08da8edb0240b4cc6ddbca49d86474`)
  inserts lines 2–8: a 6-line dated provenance blockquote + one blank; all rule bytes identical.
  It is git-tracked, **not** a sync mirror, **not** a runtime candidate (`godspeed.rs:64-70` checks
  only `ssot/`, `skills/ufo/references/`, `godspeed-core/`), not manifest-pinned → zero runtime reach.
- Manifests: `ssot/godspeed-core` `sha256sum -c` exit 0; `skills/SHA256SUMS` exit 0 (15/15, pins both
  `directive.md` copies at `db88963c`); root `godspeed-core/SHA256SUMS` exit 0 (differs from ssot only on
  filter/velocity lines — documented vendored-vs-annotated lineage); bundled `SHA256SUMS` byte-identical
  to ssot's. `sync --check` exit 1 with `changed: []`: 18 missing `.devin` paths, drifted
  `bundled/omp-seat-routing.json` + `bundled/config.json` — none in the directive channel; `skillsSums` ok.
- `filter.md`/`velocity.md` intentionally diverge between annotated ssot lineage (`ddfabdcb…`/`dbd37a12…`)
  and bare vendored lineage (`09957d08…`/`349243f6…`), per `ssot/godspeed-core/README.md:70-72`. Keep them
  distinct; do not "fix" one into the other.
- Structural divergence (MEDIUM): host `~/.agents/skills/godspeed/SKILL.md` = `1d61672…`, not repo-pinned
  `c0d2232…`; hand-placed (mtime 2026-10-06, no installer in `scripts/`), outside every mirror channel.
- `~/.agents/godspeed-core/` does not exist, though `ssot README:72` calls it the operative fleet-L1 judge
  load path and `fleet-dispatcher.mjs:5377` tells seated L1s to load from it — the judge must fall back to
  repo `ssot/` bytes on this host.

## Changed: nothing (read-only lane).

## Unknown

Whether the `.devin` mirrors exist only after a write pass; whether fleet L1s ever seat on this host.