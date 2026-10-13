# fleet-spec-schema — the fleet spec fields and defaults

Asked: every spec field, required vs optional, and each default.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `SpecSchema`.

Top level (`loadSpec` :319):
- `fleet` — required, `FLEET_PATTERN` `^[a-z0-9][a-z0-9_-]{0,47}$` (:92, :327-329).
- `repo` — required non-empty string (:330).
- `ufoRoot` — required non-empty string; checked twice (pre-flight :1283-1285, then :331).
- `missions` — required non-empty array (:335 reads it; the guard is :336).
- `base` — optional; default = repo HEAD via `git -C <repo> rev-parse --abbrev-ref HEAD`
  (`gitHeadBranch` :310), else `String(raw.base).trim()` (:387). Trimmed only — no dash guard.
- `stateDir` — optional; default `.tower/fleets/<fleet>` resolved under `repo` (:393).
- `worktreeRoot` — optional; default `.tower/worktrees/<fleet>` (:394).
- `roundCeiling` — optional; default `1`; positive safe integer (:388-389).
- `maxTime` — optional; default `"3h"`; `MAXTIME_PATTERN` and not leading `-` (:390-391, :94).

Per mission (normalized :371): `id` (`MISSION_ID_PATTERN` `^[A-Za-z][A-Za-z0-9_-]{0,63}$` :93),
`title`/`axis`/`goal` non-empty strings, `scope` non-empty repo-relative prefix array, `skills`
optional (`undefined`/`null` → `[]`). No mission-level model field.

`plan --json` echoes `ok, verb, writes, fleet, repo, base, stateDir, worktreeRoot, roundCeiling,
maxTime, band, missions` — `ufoRoot` is NOT echoed (the `emitJson({...})` spans :657-677).

Live fleet `/home/vgpnk/Projects/ompskills/.tower/fleets/shokunin/spec.json`: 8 missions, base
`main`, roundCeiling `2`, maxTime `4h`.

Evidence: lane `SpecSchema` (defaults proven on scratch repos; refusal battery).
