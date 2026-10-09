# write-site-inventory — every filesystem write and its guard

Asked: every write call, its target, and its guard; is any removal primitive imported?
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `WriteSites`.

Six filesystem write sites, all in `copySkill`/`verbLaunch`:
1. `mkdirSync(path.dirname(target), recursive)` :698 (`copySkill`) — guard
   `assertSafeWriteTarget(target, worktree, ...)` :697.
2. `cpSync(source, target, recursive)` :699 — same guard :697.
3. `mkdirSync(spec.stateDir, recursive)` :728 — guard :727, inside a try whose catch throws
   `STATE_DIR_UNAVAILABLE` (:729-731).
4. `mkdirSync(sessionsDir, recursive)` :836 — guard :835.
5. `writeFileSync(row.promptPath, row.prompt)` :842 — guard :837; written only when the existing
   bytes differ (:838-841, else `promptReused`).
6. `writeFileSync(fleetPath, JSON+"\n")` :907 — guard :906.

The fs import list (:71-80) is exactly `cpSync, existsSync, lstatSync, mkdirSync, readFileSync,
readdirSync, realpathSync, writeFileSync` — **no delete/remove primitive is imported**, so
in-process removal is structurally impossible. `assertLaunchWriteTargets` (:708) validates the
worktree, skill, session, prompt, and fleet-state destinations up front, before the wall opens
(:714) and before the first fs write (:728): an up-front refusal means zero writes and zero wall
calls.

Precision note: the `mkdirSync` at :728 targets `spec.stateDir` itself (not in
`assertLaunchWriteTargets`); its guard is inside the same try, so a bad `stateDir` surfaces there
as `STATE_DIR_UNAVAILABLE`, not `INVALID_SPEC`.

Evidence: lane `WriteSites`.
