# ufo skill: load order, required paths, membrane

**Asked:** the load order and required files of the substrate ufo skill.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/.omp/skills/ufo/SKILL.md` (600 lines).

## Observed

- Frontmatter: `name: ufo`, folded `description`, and `metadata{axis_family: orchestration,
  language: match-repo, substrate: all}` — exactly three metadata keys, no version/triggers.
- Load order (L21-56), verbatim intent: (1) the authored `ssot/godspeed-core/directive.md`
  once, digest-bound, fail-closed on drift — generated mirrors are checked copies, not
  additional authorities; (2) `references/run-logic.md` (skill-relative); (3) skill `wwkd`
  as planner stance — enrichment only, never a gate, drift resolves to run-logic §5 (I9).
- All named required paths exist: `ssot/godspeed-core/directive.md` OK (429 B),
  `.omp/skills/ufo/references/run-logic.md` OK, `skills/wwkd/` OK (absent at
  `~/.agents/skills/wwkd`), plus the runtime scripts and config files. No required path absent.
- Consistency finding: `directive.md` is byte-identical everywhere (`db88963c…`), but
  repo-root `godspeed-core/` and `.omp/skills/ufo/references/godspeed-core/` `filter.md` /
  `velocity.md` hash `09957d08…`/`349243f6…` while ssot + the bundled crate match
  `ssot/godspeed-core/SHA256SUMS` (`ddfabdcb…`/`dbd37a12…`) — the declared "checked generated
  mirrors" contract diverges for filter/velocity.
- Membrane: concrete values single-sourced in `config/ufo.json` (`membrane.paths`, 11 globs,
  `action: authority_boundary`); unsealing is operator-only and TTY-only
  (`ufo charter sign <runId>`, stdin+stdout terminals, `crates/ufo-cli/src/main.rs:991-995`)
  plus a full Phase 0 re-pass; screening classes `directive_bytes`, `terminal_marker`,
  `judge_imperative`, `assignment_header`, `directive_task_data` (version 2026-09-17) are
  evidence flags, never auto-rejection.
- Refusal vocabulary named: `MISSION_AMBIGUOUS`, `MISSION_NOT_LIVE`; swarm
  `too_few_lanes`, `wave_too_wide`, `impossible_band`, `resume_unknown_member`,
  `conflicting_assignment`; lane events `lane_failure`, `lane_timeout`, `effort_unverifiable`;
  stops `saturated`, `blocked`, `budget_halt`/`round_cap`, `honesty_brake`, `interrupted`,
  `authority_boundary`; monitoring `protocol_error`, `error`, `usage` (exit 64).

## Remaining unknown

The exact byte set the sync gate compares; whether the filter/velocity divergence is
intentional annotation or drift.
