# prior doc/prompt/band audits: what still holds

**Asked:** distill the three prior compound audits so the corpus does not re-derive them.
**Sources:** `reports/tf-audit-docs.md`, `reports/tf-audit-prompt.md`, `reports/tf-audit-band.md`.

## Observed

- Revision frame: the audits ran at omskills `3dee568` / substrate HEAD `5ace2559`; current
  omskills HEAD `b251c5a` adds `.omp/skills/shokunin`, and the substrate `config/ufo.json` sha256
  is unchanged, so band drifts compare 1:1.
- **Band drift still holds exactly:** the disk `config/ufo.json` is *uncommitted-modified*
  (`M config/ufo.json`) — working tree 16/16/32 vs HEAD `5ace2559` commits 64/32/100. The swarm
  validator reads the working-tree file, so the live observed band is 16-32 (confirmed by this
  mission's own `plan` run: `policy.source: "config"`, `waveMinLanes` 16, `waveMaxLanes` 32).
- Still-live drifts re-verified 2026-10-09: `host/omp-agent.config.yml:190,197` stale band prose;
  `bundled/config.json:79,85,89,94` frozen generation; `fleet-dispatcher.mjs:5387` "16-100";
  `ufo-swarm-wave.mjs:11` header; `AGENTS.md:151-155,165-166,204`; `docs/BEHAVIOR-MATRIX.md:12,27,35,180,185`.
- Prompt/skill drift still live: `tower/SKILL.md:51-53` (substrate-scoped hook described as
  universal); `:75` "only launch creates a pane"; `:110` `omp worktree list` sees nothing (JSON `[]`
  vs 29 git worktrees); `:115` repo-wide `clear` wording; `swarm/SKILL.md:68-71` minLanes-vs-gate;
  the `[A-Za-z]+` token regex blind spot (`tower-fleet.mjs:442,446`); `reportDir` rendered absolute
  (`:438`); `roundCeiling` from spec (`:436`); `hub send` named while no hub CLI exists;
  `l1-prompt.md:137` failing `git commit` form.
- Fixed since the audits in this repo: `l1-prompt` branch form (AUD-01); relative `reportDir` +
  `invalid_report_dir` (AUD-03/05); `taskCall: null` branch; reportDir creation; live-band snapshot
  clause; wwkd-item qualifier; refusal-list disclaimer in swarm SKILL; tower spec defaults
  (base/stateDir/worktreeRoot/roundCeiling/maxTime). Partial: mission-config path still hardcoded at
  `tower-fleet.mjs:476`; the leaf-spelling remark (M11); steer flags in swarm's sighting paragraph.

## Remaining unknown

Most `P-AUD-*` prompt findings and the substrate `skills/ufo` drift were not re-executed today —
they carry prior-audit provenance only. Hook discovery roots for `omp --cwd <worktree>` sessions
remain unverifiable from here.
