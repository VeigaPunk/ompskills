# step5-record-and-l1alias-probe — Step 5 record argv + the dead `l1Alias` supply

Item: bounded re-verification of two card claims — step 5's reportDir/settle
contract and exact `record` argv (`sighting/l1-prompt.md:115-125`), and the
supplied-but-unused placeholder (`renderPrompt`, `sighting/tower-fleet.mjs`).

## Observed

**Step 5 (`sighting/l1-prompt.md:115-125`)** requires, in order:
1. `:115-116` declare `reportDir` RELATIVE to `{{stateDir}}` and state its
   absolute form `{{reportDir}}` in the spec's shared `context` before dispatch;
2. `:117-119` because the payload's `Report: write your scoped findings to
   <reportDir>/<Name>.md` is relative and a lane resolves it against its own cwd
   (the mission worktree); create `{{reportDir}}` before dispatch (`:119`);
3. `:119-120` settle = every dispatched lane has a recorded terminal outcome;
4. `:120-121` count reports against the payload's `counts.total`;
5. `:121-122` a lane's exhaustion or a missing report is telemetry, never
   saturation;
6. `:122-125` `record` the returned ids so a later wave can resume the member.

**Record line as written** (`:123-124`) — NO env prefix, ambiguous token:
`node {{validator}} record --registry <reportDir>/swarm-registry.json --assignments '{"<Name>": "<agentId>", …}'`.
Both readings of `<reportDir>` fail: absolute → `invalid_registry_path`
(`ufo-swarm-wave.mjs`), relative without env re-basing → resolves against the
validator's own root (registry tree under the substrate). Canonical form:
`UFO_PROJECT_ROOT=<stateDir> node <validator> record --registry <relative registry.path> --assignments '{"<Name>":"<agentId>"}'`.
Matches card bullet "Validation / dispatch / collect (steps 3–5)".

**Dead supply** — `sighting/tower-fleet.mjs:440` supplies `l1Alias:
authority.l1Alias` in the 18-key value map; the template has ZERO `{{l1Alias}}`
(grep `\{\{[^}]*\}\}` over `sighting/l1-prompt.md` = 17 distinct, all
letters-only: fleet, missionId, title, axis, goal, scope, repo, worktree, base,
ufoRoot, waveMin, waveMax, roundLaneCeiling, roundCeiling, stateDir, reportDir,
validator). It can NEVER be rendered: the replace regex `:442`
`/\{\{([A-Za-z]+)\}\}/g` and the residual check `:446` `/\{\{[A-Za-z]+\}\}/` are
letters-only, while `l1Alias` contains a digit, matching neither — so
`{{l1Alias}}` would ship verbatim at exit 0 (no `RENDER_UNRESOLVED`). The alias
actually reaches the pane argv via `--model @${authority.l1Alias}` `:475`, and
its safe-token guard is `loadBandAuthority:161`.

Changed: nothing (read-only probe). Unknowns: none material; `invalid_registry_path`
not re-executed live this probe (carried from collect-settle entry).

Paths read: `.omp/agents/mission-keeper.md`,
`shokunin/mission-keeper/corpus/index.md` + 3 entries (collect-settle,
render-prompt-map, placeholder-inventory, report-dir-two-roots),
`sighting/l1-prompt.md`, `sighting/tower-fleet.mjs`.