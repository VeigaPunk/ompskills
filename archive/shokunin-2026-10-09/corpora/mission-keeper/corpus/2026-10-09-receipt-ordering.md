# receipt-ordering — launcher receipt matcher, sort, and join; pieces order the rounds list

Item: `roundReceipts` + `verbStatus` in `sighting/tower-fleet.mjs` — the launcher side of step 7.

Observed: `roundReceipts` (`:951-958`) filters basenames by `startsWith('<missionId>-r') && endsWith('.md')` and sorts by `Number(/r(\d+)\.md$/ ?? 0)` — numeric, so r2 precedes r10; ties (`r01` vs `r1`) keep readdir order (stable sort); non-numeric names are admitted at key 0 and front the list. `verbStatus` (`:1006-1127`) joins receipts to every emitted row by `id = wallRowId = runId ?? missionId` (the launcher registers `--run-id mission.id`, so runId ≡ mission id), at three call sites (wall live, wall retired, state/spec), exposing ordered basenames in JSON `missions[].rounds` and the text `rounds` column (`row.rounds.join(',') || '-'`).
The launcher never computes `<N>`, never counts for the agent, and never writes `rounds/`: `verbLaunch` mkdirs only `stateDir` (`:728`) and `sessions/<id>` (`:836`). Provenance of `<stateDir>/rounds`: no launcher code creates it; the agent's write tool auto-creates parents (dir birth 22:21:04, 101 s after fleet.json, attribution [INFERENCE]); r2 falsified the "blocker" grade on the write-tool counter-evidence. Step 7 therefore relies on (a) the write tool auto-creating parents, (b) `roundReceipts`' silent `existsSync → []` guard (`:953`) — a lost first receipt reads as "zero rounds" and N restarts at 1 without error, (c) the agent's file count coinciding with the launcher's loose list only when names are exactly `<missionId>-r<N>.md`.
Latent hazard: a missionId that is a proper prefix of a sibling whose continuation starts with `r` (`tf-audit` vs `tf-audit-routing`) inherits that sibling's receipts; no such mission exists in tower1's fleet.json, so nothing misreports today.
Accepted-but-unapplied fix: prepend `mkdir -p` to step 7 is NOT in the current `l1-prompt.md`.

Evidence: `ReceiptOrderingLauncher.md`, `ReceiptNamingRule.md`.
Unknowns: stable-sort tie order on live ext4 [INFERENCE]; wall runId ≠ mission id (adoption) unverified.
