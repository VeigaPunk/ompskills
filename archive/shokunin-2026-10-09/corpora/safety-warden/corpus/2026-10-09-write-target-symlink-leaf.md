# write-target-symlink-leaf — write-target-symlink-leaf — assertSafeWriteTarget refusal arms

Asked: what exactly does `assertSafeWriteTarget` refuse at a derived destination?
Source: `sighting/tower-fleet.mjs:257-285` (root recheck :264, realpath :265-266, dangling :267-269, leaf symlink :270-273, missing-leaf tolerance :274-279, ENOTDIR re-type :276-277, beneath-root :280-283, zone recheck :284). Lane: `WriteTargetSymlinkLeaf`.

- Nine probes (a–i) each `exit 2 INVALID_SPEC` and **zero wall calls**; the fixture `config/ufo.json` stayed `0e416f0a…` after every run.
- Three message families, one code: `… is a symlink — refusing a write through it` (symlink leaf); `… resolves through a dangling symlink`; `… resolves outside its write root <root>` (symlinked parent into an existing dir).
- The leaf refusal is **unconditional**: a symlink pointing *inside* the same root is still refused (probe i) — it is not escape-only.
- A symlink-free hostile root (`stateDir: <state>/../ufo/config`) is caught by the zone check (`assertSafeWriteRoot`), message "the substrate is never written".
- Two-hop symlink chains are refused like one hop (sibling `derived-target-escape-hardlink`).

## Not carried by the source
- The "resolves outside its write root" branch is unreachable without a symlinked **ancestor** (all derived targets are `path.join(<validated root>, <validated name>)`), reached in probes b/e.

## Unknowns
- `close --apply`/`status` write paths not driven; symlink swap between check and write is owned by `toctou-window`.
