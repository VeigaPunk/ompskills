# 2026-10-09 — fleet state-directory artifacts (never repo edits)

**Asked.** What does the launcher write under `<stateDir>`/`<worktreeRoot>`, and
what is the rule about committing it? (lane `FleetStateArtifacts`, scout.)

**Observed.** Sources `.omp/skills/tower/SKILL.md:139-174` and
`sighting/tower-fleet.mjs` (read; not executed).

- **Defaults**: `stateDir = <repo>/.tower/fleets/<fleet>`;
  `worktreeRoot = <repo>/.tower/worktrees/<fleet>` (`tower-fleet.mjs:393-394`).
- **Launcher writes under `stateDir`**: `fleet.json` (`:904-935`);
  `<id>.prompt.md` (rendered from `sighting/l1-prompt.md`, `:600,836-841`);
  `sessions/<id>/` (`:473,834-836`).
- **Launcher writes under `worktreeRoot`**: `<worktreeRoot>/<id>` — the mission
  worktree on branch `tower/<fleet>/<id>` cut from `base`, with its `skills`
  copied in (`:289,797-798`).
- **Not launcher-written** (the L1 pane writes these into the same `stateDir`):
  `reports/<id>/`, `rounds/<id>-r<N>.md`, `waves/<id>-r<N>-w<k>.spec.json`. The
  launcher only **reads** `rounds/` for `status` (`:951-956`).
- **Write safety** (`:25-29,254-307,401-402`): both roots are refused
  `INVALID_SPEC` when `realpath` lands inside the substrate, on the repo root, or
  inside `.git`; symlink leaves are refused with resolved-destination containment;
  every shell-out is `spawnSync` with an explicit argv array.
- **`fleet.json` keys** (observed, `shokunin/fleet.json`): `band, base, fleet,
  launchedAt, maxTime, missions, ok, repo, roundCeiling, stateDir, ufoRoot,
  warnings, worktreeRoot` (`:907-935`). `band` is read **live** from
  `<ufoRoot>/config/ufo.json`. `spec.json` carries only `fleet, repo, base,
  ufoRoot, roundCeiling, maxTime, missions[]` — everything else is
  launcher-derived.
- **Per-mission record** (`:737-754`): `id, title, axis, base, branch, worktree,
  promptPath, paneId, panePhase, paneReused, promptReused, worktreeReused,
  worktreeRecreated, retired, skills[], launchResult`, plus optional
  `failure:{code,detail}`, `secondaryFailure:{code,detail}`,
  `launchResultFrom:'prior-state'`.

**Rule.** State-directory artifacts are state, **never repo edits or commits** —
the mission’s scope names only the repo paths (card + corpus), and the wave spec,
payload, registry, lane reports, and round receipts live under the state dir.

**Changed.** Nothing — read-only research.

**Unknown.** Whether `MISSIONS.md`/`state.json`-style regeneration is atomic is
out of this item’s scope. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/FleetStateArtifacts.md`.