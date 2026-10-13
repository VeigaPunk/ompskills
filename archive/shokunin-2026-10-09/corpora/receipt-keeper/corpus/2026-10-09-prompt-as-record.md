# prompt-as-record — The rendered prompt as a render-time record

Source: r1 lane `PromptAsRecord` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

What a `<id>.prompt.md` proves about the launch.

## Observed

- Re-rendering reproduces both sampled prompts byte-for-byte: `towerprobe/tf-probe-band.prompt.md` matches template commit `b15066e` only; `shokunin/mission-keeper.prompt.md` matches `a842b2f` (HEAD template). Method: render the spec through each template commit, `cmp`.
- Recoverable: fleet, missionId, title, axis, goal, scope, repo, worktree, base, ufoRoot, band snapshot, roundCeiling, stateDir, reportDir, validator. Not recoverable: `l1Alias` (never rendered), skills, overlays, launch outcome, launchedAt.
- `promptReused` true only when bytes equal the fresh render (:838-840); otherwise overwritten (:842) — a hand-edit is silently replaced and leaves no trace. No fleet.json records `promptReused: true`.

## Unknowns

- Relaunch overwrite path unexercised in real data.
