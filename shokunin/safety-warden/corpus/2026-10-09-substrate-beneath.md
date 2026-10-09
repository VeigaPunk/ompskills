# substrate-beneath — substrate-beneath — the substrate's containment guard, inverse symlink semantics

Asked: how does the substrate's own `beneath` guard differ from the launcher's confinement?
Source: `ufo-fsd-alpha/scripts/ufo-mission-result.mjs:1114-1139` (`beneath`), `:2126` `ALLOW_EXTERNAL_TOOLS`, `:2143-2159` `gatedConfigPath`; `ufo-swarm-wave.mjs:431-448` `gatedRegistryPath`, `:122-124` ROOT. Lane: `SubstrateBeneath`.

- `beneath(root, candidate)`: realpath the root (ENOENT-only lexical fallback), then `lstat`-**walk every relative component** including the leaf, returning **false on any** symlink component; ENOENT tail skipped; ENOTDIR throws → gates catch → fail-closed.
- Gates refuse outside-root paths with typed `EXEC_PATH_OUTSIDE_ROOT` (exit 1) unless `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` (`:2126`). Observed: a symlinked `UFO_CONFIG_PATH` and a symlinked `priorRegistry` both refused; a spawn-only `plan` with a symlinked `reportDir` **admitted** (exit 0, emits `registry.path`) because that gate sits inside `if (resumes.length > 0)`; a resume lane refused.
- Predicate = **containment beneath the single ROOT** with no zone concept — the *inverse* symlink semantics from the launcher (launcher resolves/permitted an in-root symlink component; `beneath` refuses it, proven on the same planted layout).
- Hint (not a gate): an unset `UFO_PROJECT_ROOT` resolves ROOT to the substrate script dir, so `run`/`record` default their registry into `<substrate>/.ufo/scopes/…` — hence the real-copy scratch root (sibling `scratch-root-rule`).

## Unknowns
- `run`/`persistWaveRegistry` write refusal cited from source, not observed; TOCTOU between the `beneath` walk and the later open/write is not closed by this point-in-time predicate.
