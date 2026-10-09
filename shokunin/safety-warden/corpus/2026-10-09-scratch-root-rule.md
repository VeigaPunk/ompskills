# scratch-root-rule — scratch-root-rule — why a real config copy, and which surfaces are gated

Asked: why must a scratch root hold a real `config/ufo.json`, and what does the wave CLI gate?
Source: `ufo-swarm-wave.mjs:122-124` ROOT, `:136`/`:431-448` consumers, `:1412` `--spec` read, `:675` lock mkdir; `ufo-mission-result.mjs:2143-2149`/`:2145` fallback arm. Lane: `ScratchRootRule` (critic).

- `ROOT = resolve(UFO_PROJECT_ROOT || dirname(script)/..)`. Location-tracking proof: the same script with `config/ufo.json` present → `policy.source=config` (band 16/32), config moved away → `source=default` (`waveMinLanes=2`).
- With `UFO_PROJECT_ROOT` unset, the real substrate script yields `source=config` and **ROOT-relative registry writes land in `<substrate>/.ufo/scopes/<wave>/swarm-registry.json`** — so `run`/`record` default a write into the read-only substrate (`plan` is write-free).
- Gated (typed exit 1 `EXEC_PATH_OUTSIDE_ROOT`): `UFO_CONFIG_PATH`, `spec.priorRegistry`, the wave's own registry, `record --registry`, `--prior-refinement`, `--route-probe`.
- **Ungated**: `--spec <file>` (bare `resolve`, any path/root, readable outside ROOT), `--spec -`, `--spec-json`, `UFO_PROJECT_ROOT` itself, and the config **fallback** arm (returns before any `beneath()`).
- **Symlinked-ROOT asymmetry**: the fallback config silently reads *through* the link, while the gated `UFO_CONFIG_PATH` and the own-registry write refuse — that asymmetry is exactly why the scratch root must hold a **real copy**, never a symlink.
- A scratch root must copy the whole `config/` dir, not just `ufo.json` (`--prior-refinement` reads a module-anchored `primeagent-assimilation.json`).
- Correctness note: `ufo-swarm-wave.mjs` has **no** `--json` flag (`usage`, exit 64); `plan` always emits JSON.

## Unknowns
- The unset-env `run` against the real substrate script is a stated chain, not executed; `beneath` check-then-write TOCTOU not re-tested.
