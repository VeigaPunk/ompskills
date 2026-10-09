# ssot-godspeed-core — the byte-pinned Godspeed source of truth

Asked: the pinned Godspeed files, their audiences, the canonical-vs-mirror verdict, and a
reproducibility check. Source: lane SsotGodspeedCore report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

| file | lines | sha256 | audience | loader |
| --- | --- | --- | --- | --- |
| `ssot/godspeed-core/directive.md` | 8 | `db88963cbdf5a0db22b460b284bf6f1d1f4abac9eaadb28bdb5e9bffe27be3bb` | every seat; delegates inherit only this | `fleet-dispatcher.mjs:91,5066,8708`; `run-omp-native-trial.mjs:64-66,1021`; `godspeed.rs:66-68`; `policy.mjs:872-874` |
| `ssot/godspeed-core/filter.md` | 62 | `ddfabdcb5ca44a8367fc997cd499f35b0f6f4d57ec96cfa8e686e3ad60f2e87d` | judge-seat only | `fleet-dispatcher.mjs:5377` (L1 told to load `~/.agents/godspeed-core/filter.md`); mirror `sync-ufo-contracts.mjs:123` |
| `ssot/godspeed-core/velocity.md` | 42 | `dbd37a12a3cb6910b071d52e2b2002dc5e471bf98e089428034512efbb980d96` | judge-seat only | `fleet-dispatcher.mjs:5377`; mirror `sync-ufo-contracts.mjs:124` |

- Headings: `directive.md` has none (line 1 = "You are a Godspeed-enabled subagent.");
  `filter.md` "# Filter Half — Antimetabole as Pareto Constraint"; `velocity.md` "# Velocity Half —
  Iteration at Speed".
- Canonical vs mirror: authored source = `ssot/godspeed-core/` (carries 2026-09-18 A-08 bridge notes
  on `filter.md:62` + `velocity.md:42`); declared contract-sync mirror =
  `crates/ufo-core-runtime/bundled/godspeed-core/` (byte-identical, all 4 files); vendored upstream
  origin = root `godspeed-core/`, `skills/godspeed-core/`, `skills/ufo/references/godspeed-core/`
  pinned to `godspeed-core@8b07f048` (`docs/provenance.json:88-95`, `docs/PROVENANCE.md:137-148`).
  `directive.md` + `README.md` are byte-identical everywhere; `filter`/`velocity` differ **only** by
  the annotations (`09957d…`/`349243…` vendored vs `ddfabd…`/`dbd37a…` ssot).
- Reproducibility: `sha256sum -c ssot/godspeed-core/SHA256SUMS` → all OK, exit 0;
  `sha256sum -c godspeed-core/SHA256SUMS` → all OK, exit 0. **No drift.**
- The leading `/skill:godspeed` line is the *load* act; the trailing `| godspeed` is an envelope
  marker that loads nothing (`ufo-swarm-wave.mjs:161-166`, `ufo-godspeed-inject.js` header,
  `omp-wave-context.mjs:59`).

## Contract

- The authored source of truth is `ssot/godspeed-core/`; `directive.md` there is the single canonical
  source (`sync-ufo-contracts.mjs:76`), and `filter.md`/`velocity.md`/`SHA256SUMS` are canonical
  sources only for their bundled mirror (`bundledAssetMirrors` `:123-125`).
- `directive.md` is the only Godspeed file every seat may load; it is byte-identical at all sites and
  is the load item enforced by the Rust judge (`godspeed.rs:66-68` trusted-root order:
  `ssot/godspeed-core/…`, `skills/ufo/references/godspeed-core/…`, `godspeed-core/…`), the collector
  (`policy.mjs:872-874` + mirror-drift check `:894`), and the dispatcher envelope
  (`DIRECTIVE_PATH` `:91`, `godspeedDirective()` `:5066`, `splitGodspeedEnvelope` requires the body
  to `startsWith(directive)` `:5124`).
- `filter.md` + `velocity.md` are judge-only (`README.md:49,67-69`); the L1 judge loads all three
  from the host always-on install `~/.agents/godspeed-core/` (`fleet-dispatcher.mjs:5377`), which
  "tracks the vendored lineage … not the annotated ssot bytes" (`README.md:72`).
- Mirror channel: `godspeedDirectiveMirrors` (`sync:104-112`) syncs only `directive.md`;
  `filter.md`/`velocity.md`/`SHA256SUMS` ride only `bundledAssetMirrors`.

## Not carried by the source

- No `ssot/SHA256SUMS` and no `ssot/README.md` at the `ssot/` root (the brief's paths resolve only
  inside `ssot/godspeed-core/`).
- `ssot/godspeed-core/SHA256SUMS` is not itself hash-bound by any gate (its own `4c5aebe2…` digest
  is unpinned).
- `filter.md`/`velocity.md` are not in the `godspeedDirectiveMirrors` channel and not in
  `skills/SHA256SUMS`; `README.md` is an undeclared twin pair; `always-on.md` appears nowhere in
  `ssot/`, `godspeed-core/`, or `skills/ufo/references/`.

## Unknowns

- `~/.agents/godspeed-core/{directive,filter,velocity}.md` (the operative fleet-L1 load path) is
  outside the repo — its bytes were UNOBSERVED.
- `.cursor/skills/godspeed/directive.md` and per-package `references/godspeed-core/directive.md`
  sites were not individually hash-checked. Whether `sync-ufo-contracts.mjs --check` currently passes
  was not run (gate batteries are forbidden for a read-only lane).