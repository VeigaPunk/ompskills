# wall-watcher corpus — index

Append-only. One row per entry, in the order entries were added. Never reorder or delete a row.

| entry | topic | added |
| ----- | ----- | ----- |
| [2026-10-09-steer-verb.md](2026-10-09-steer-verb.md) | wall CLI `steer` verb: flags, bounds, refusals, the steer log | 2026-10-09 |
| [2026-10-09-open-verb.md](2026-10-09-open-verb.md) | `open`: flags, trigger resolution, geometry, mutations | 2026-10-09 |
| [2026-10-09-status-and-reconcile.md](2026-10-09-status-and-reconcile.md) | `status`/`--lite` envelope, liveness, ghost rows, the `reconcile` repair delta | 2026-10-09 |
| [2026-10-09-overview-verb.md](2026-10-09-overview-verb.md) | `overview`, the dashboard strip, and the display-grid capacity split | 2026-10-09 |
| [2026-10-09-peek-verb.md](2026-10-09-peek-verb.md) | `peek`: clamp rule, lock boundary, refusals, raw-text output | 2026-10-09 |
| [2026-10-09-launch-verb.md](2026-10-09-launch-verb.md) | `launch`: required flags, `--` rule, fleet window, capacity order | 2026-10-09 |
| [2026-10-09-complete-verb.md](2026-10-09-complete-verb.md) | `complete`: note/dry-run/idempotence, retention (rows + session artifacts), envelope caveat | 2026-10-09 |
| [2026-10-09-fleet-window-model.md](2026-10-09-fleet-window-model.md) | sessions, default vs fleet windows, one pane per mission, ephemeral windows | 2026-10-09 |
| [2026-10-09-remove-verb.md](2026-10-09-remove-verb.md) | `remove`: idempotent absent-row no-op, no live guard, side effects | 2026-10-09 |
| [2026-10-09-inquiry-verb.md](2026-10-09-inquiry-verb.md) | `inquiry` + shim routes: id derivation, double byte cap, snapshot | 2026-10-09 |
| [2026-10-09-wall-state-and-locks.md](2026-10-09-wall-state-and-locks.md) | state dir, manifest schema/modes, steer store, operation lock, prune | 2026-10-09 |
| [2026-10-09-observation-pipeline.md](2026-10-09-observation-pipeline.md) | transcripts/sparks/observations → `levels`, `phaseCounts` | 2026-10-09 |
| [2026-10-09-identity-validation.md](2026-10-09-identity-validation.md) | run/session/mission/fleet id patterns, bounds, validators, refusals | 2026-10-09 |
| [2026-10-09-resume-register-twin.md](2026-10-09-resume-register-twin.md) | `resume`/`register`/`twin` and the effective twin depth | 2026-10-09 |
| [2026-10-09-refusals-and-surface.md](2026-10-09-refusals-and-surface.md) | typed refusal codes, exit-code rule, `surface --json`, the digest | 2026-10-09 |
| [2026-10-09-live-wall-and-tests.md](2026-10-09-live-wall-and-tests.md) | live wall ground truth + the wall test suites and fixture | 2026-10-09 |
| [2026-10-09-terminal-respawn-and-attach.md](2026-10-09-terminal-respawn-and-attach.md) | trigger → attach → respawn chain | 2026-10-09 |
| [2026-10-09-verb-surface.md](2026-10-09-verb-surface.md) | every public/extra/hidden verb and shim route | 2026-10-09 |
| [2026-10-09-ceilings.md](2026-10-09-ceilings.md) | ceilings: keys, readers, enforcement, geometry-vs-cap corrections | 2026-10-09 |
| [2026-10-09-launcher-integration.md](2026-10-09-launcher-integration.md) | the launcher's `wallCli`/`launchResult`/`close` contract | 2026-10-09 |
| [2026-10-09-steering-provenance.md](2026-10-09-steering-provenance.md) | the steer store and the unauthenticated `source:"l0"` label | 2026-10-09 |
| [2026-10-09-skill-prose-crosscheck.md](2026-10-09-skill-prose-crosscheck.md) | tower/swarm skill wall prose vs the CLI and launcher | 2026-10-09 |
| [2026-10-09-errata-r2.md](2026-10-09-errata-r2.md) | round-2 audit corrections for the corpus entries and the card | 2026-10-09 |
| [2026-10-09-verification-smoke.md](2026-10-09-verification-smoke.md) | three-question smoke: `peek --lines` clamp, `remove` absent-row exit 0, default-vs-fleet capacity keys | 2026-10-09 |