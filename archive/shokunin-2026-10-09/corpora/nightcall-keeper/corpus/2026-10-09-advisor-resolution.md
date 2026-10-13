# advisor-resolution — what `advisor.enabled: true` does on a fleet L1

Lanes `AdvisorResolutionProbe` (revenger), `AuditOverlayKeys`.

- The enable flip was observed: `omp config get advisor.enabled --json` returns
  false with no overlay and true with `PI_CONFIG_FILES=config/mission-nightcall.yml`.
- Model [INFERENCE: static binary trace, no live advisor spawn]: the `advisor`
  role falls back to the built-in `slow` role, which is the global
  `modelRoles.slow` (`~/.omp/agent/config.yml:5`).
- Rule scope: `skills/ufo/references/run-logic.md:1055-1057` ("advisor stays
  DISABLED — absent from omp-native-v1") governs the native profile. The native
  trial never loads the overlay (no `--config` in `run-omp-native-trial.mjs`).
  Dispatched fleet L1s do load it (`fleet-dispatcher.mjs:8497`,
  `tower-fleet.mjs:476`).
- So the conflict is real for fleet L1 panes only. Version `a23b93c5` removed
  the advisor block, but it never reached `main` (see `overlay-history`).
  Substrate code reads the advisor key only on native-profile paths
  (`sync-ufo-contracts.mjs:1490`, `lib.rs:1041`), never from the overlay.
- Open: whether the advisor actually runs at request time; operator intent.
