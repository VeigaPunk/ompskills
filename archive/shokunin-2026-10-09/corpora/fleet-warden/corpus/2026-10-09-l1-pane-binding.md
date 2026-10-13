# l1-pane-binding — the omp argv a fleet pane receives

Asked: the exact omp argv, the alias provenance, and the config files bound.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `PaneBinding`.

`buildOmpArgv` (:468-485) returns, in order: `omp`, `--cwd <worktree>`, `--session-dir
<stateDir>/sessions/<id>`, `--max-time <spec.maxTime>`, `--model @<l1Alias>`, `--config
<ufoRoot>/config/mission-nightcall.yml`, `--print-thoughts`, `--auto-approve`,
`@<stateDir>/<id>.prompt.md` (positional, last). Then `interactiveGuard(argv.slice(1), mission.id)` (:482) and
`argv[2] !== worktree` (:483).

`buildLaunchArgv` (:487-503) is the outer wall envelope: `bash <ufoRoot>/scripts/ufo-sighting
launch --run-id <id> --session-id <id> --title <title> --fleet <fleet> --cwd <worktree> --no-open
--relay --runner-reservation 1 --`, then the omp argv (assembled :613, dispatched
`wallCli(spec, ...row.launchArgv.slice(2))` :852).

- Routing is a bucket, never a provider/model: `--model @<l1Alias>`, alias shape gated at :161
  (`/^[A-Za-z0-9_.:-]+$/`, so a `/` provider name cannot pass); live alias `m_strong` from
  `ufo.json` `sighting.dispatch.missionFormat.l1Alias` (:156). The bucket expands in the
  operator's global `~/.omp/agent/config.yml` — no launcher token names it.
- The pane binds two configs: the nightcall overlay via explicit `--config` (:476, declared
  canonical at `ufo.json:83`) and the global alias table implicitly.
- Both the wall `--cwd` (:497) and the omp `--cwd` (:472) are the mission worktree.

Evidence: lane `PaneBinding` (live `plan --json` argv extraction).
