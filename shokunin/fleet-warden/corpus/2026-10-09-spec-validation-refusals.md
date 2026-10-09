# spec-validation-refusals — the INVALID_SPEC census

Asked: every `INVALID_SPEC` refusal reachable from `loadSpec`, and which lines the CLI can reach.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `SpecValidation` (31 live runs).

Patterns (:92-94): `FLEET_PATTERN` `^[a-z0-9][a-z0-9_-]{0,47}$`, `MISSION_ID_PATTERN`
`^[A-Za-z][A-Za-z0-9_-]{0,63}$`, `MAXTIME_PATTERN` `^[A-Za-z0-9][A-Za-z0-9._:+-]*$`. Every
`INVALID_SPEC` exits 2.

Direct `loadSpec` sites: :324 unreadable spec; :326 non-object root; :327-328 `fleet`;
:330 `repo`; :331 `ufoRoot`; :336 `missions`; :347 mission non-object; :349 `id`; :350 duplicate id;
:354 `title`/`axis`/`goal`; :358 `scope` array; :366 skill-name pattern (inline regex at :365);
:370 `skills` not array; :389 `roundCeiling`; :391 `maxTime`.
`normalizeScopePath` sites: :176 non-string/blank; :178 empty after trim/strip; :180 dot segment;
:183 absolute/`~`; :187 `..`/empty segment.
Helper sites reached via `loadSpec`: `resolveRepoPath` :170 (`stateDir`/`worktreeRoot`
non-string/empty), `gitHeadBranch` :314 (base default on a non-git repo), `assertSafeWriteRoot`
:240/:244/:247/:250 (dangling symlink / inside `ufoRoot` / repo root / inside `.git`).
Non-`INVALID_SPEC` in `loadSpec`: `L1_CEILING_EXCEEDED` :338, `PANE_CEILING_EXCEEDED` :341,
`SCOPE_OVERLAP` :380.

Reachability (run-verified): the launcher reads the spec twice — `main()` at :1279 then `loadSpec`
at :322 — so a missing/unreadable file yields the :1281 message and a missing `ufoRoot` the :1284
message, shadowing the identically-worded :324/:331; a non-object root is CLI-unreachable because
:1283 refuses first (a top-level `[]` reports the `ufoRoot` message). `assertSafeWriteTarget`
(:268/:272/:277/:282) is launch-path only, not reachable from `loadSpec`.

Ordering: checks fire in source-line order; the ceilings (:337/:340) precede all per-mission
defects; duplicate id (:350) precedes scope overlap (:375); arrays pass the object check (:347)
and die at the id check.

Quirks (live): `maxTime` is a token check only — `null` → `"null"` and `3600` → `"3600"` are
**accepted** (:390 String-coercion); the `startsWith("-")` clause (:391) is redundant with the
pattern. `skills: undefined`/`null` silently normalize to `[]` (:361-362). Scope `"./src/"` →
`"src"`, `" a/b "` → `"a/b"`; `"/"` dies at :178 (empty-after-strip), not :183.

UNKNOWN: the :314 detached-HEAD disjunct (needs a detached checkout) was not exercised.

Evidence: lane `SpecValidation` (31 live `plan` runs with exact stderr/exit).
