# config-flag-equivalence — how `--config` layers on a launched pane

Lane `ConfigFlagRuntimeProbe` (revenger). This closes r1 unknown U1 for routing.

- Method: launch `omp --mode rpc --no-session --model @m_strong` with overlays
  that set `modelRoles.m_strong` to two distinguishable routes, then read the
  RPC `get_state` model without spending a model turn.
- Observed:
  - `--config A` behaves the same as `PI_CONFIG_FILES=A`
  - `PI_CONFIG_FILES=A` plus `--config B` gives B, and the reverse gives A
  - `--config A --config B` gives B
  - A `disabledProviders` refusal is identical under both channels
  - A missing overlay file is a hard error on both channels
- Conclusion: `--config` is the same overlay layer as a `PI_CONFIG_FILES`
  entry. Env entries load first, then argv entries in order, and later wins.
  This matches `omp://settings.md` precedence.
- So both fleet launchers' `--config <mission-nightcall.yml>` (dispatcher via
  the snapshot path, tower directly), plus any fleet overlay after it, layer
  exactly like the `PI_CONFIG_FILES` probes in `overlay-keys` and
  `overlay-layering`.
- Still open: `task.maxConcurrency` is not exposed in `get_state`, so its
  launch-time value is the same loader [INFERENCE], not directly observed.
- Hygiene: the lane left two 1-line probe overlays in the mission worktree
  root. The L1 removed them. Probe overlays belong under
  `.tower/fleets/<fleet>/scratch/`.
