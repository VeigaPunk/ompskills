# tower-fleet tests: what the suite pins, and two live doc drifts

**Asked:** which documented behaviors the suite actually pins, and which documented behaviors it does not.
**Sources:** `test/tower-fleet.test.mjs` (1685 lines), `sighting/tower-fleet.mjs` (1306),
`.omp/skills/tower/SKILL.md`, `sighting/l1-prompt.md`. Suite not executed (read-only lane).

## Observed — pinned

- Verb/default selection, `--spec` requirement, exit-64 `USAGE` envelope, `--help` positional.
- `MUTATION_REQUIRES_APPLY` precedence (guard outranks every spec verdict, precedes the spec read
  and any wall call; usage outranks the guard).
- `plan`/`status` zero-write proof by recursive name/size/mtime snapshots; L1-vs-pane ceiling
  live-reads and gate order; `SCOPE_OVERLAP` taxonomy; scope normalization refusals.
- Identity alphabets at 48/49 and 64/65 boundaries; required fields; `skills`/`maxTime`/
  `roundCeiling` defaults; band-authority fail-closed battery; launch argv token-by-token (wall
  half incl. the `--` separator; OMP half incl. `--model @<live alias>` and cwd equality); render
  fidelity over a 17-name placeholder ledger; wall isolation (all spawns spec-derived,
  `spawnSync` argv not shell string); close JSON path.

## Observed — NOT pinned

- `launch --apply` success end-to-end (worktree add, skill copy search order, prompt write,
  sessions dir, `fleet.json`, wall launch): every `launch --apply` in the suite is a refusal; the
  real launch lives only in the manual smoke checklist `test/sighting-wave-smoke.md:255-275`.
- Idempotent relaunch/adoption; `LAUNCH_PARTIAL` and `WORKTREE_ADD_FAILED` coverage (zero);
  close guards `PANE_LIVE`/`WALL_ABSENT`/`COMPLETE_FAILED`/`--force`; `base` default
  (`gitHeadBranch` never runs) and `stateDir`/`worktreeRoot` defaults; status reconciliation
  content and `roundReceipts` numeric ordering; direct write-root refusals; several guard codes;
  human renderings.
- The godspeed claim that a renderer prepends `/skill:godspeed` is **not** asserted — the
  byte-equality ledger reads the same template on both sides. `l1-prompt.md` carries the
  `/skill:godspeed` lines in the template file itself.

## Consistency findings (skill drift the suite cannot catch)

- **HIGH:** `.omp/skills/tower/SKILL.md:152-153` says "a failed worktree add aborts the run
  outright"; the launcher (794-796, 812-817) records the failure per mission and continues to
  `LAUNCH_PARTIAL`. The launcher docstring (33-35) and `sighting-wave-smoke.md:112` side with the
  code — SKILL.md is stale.
- **HIGH:** `SKILL.md:170-171` "a failing wall `complete` aborts first" misdescribes
  launcher 1197-1207 / 1226-1228 (record-per-mission, then post-loop `COMPLETE_FAILED`).

## Corpus facts

- `tower-fleet.mjs` never aborts mid-fleet: `WORKTREE_ADD_FAILED` and complete failures are
  recorded per mission; the run ends `LAUNCH_PARTIAL`/`COMPLETE_FAILED` exit 2 with `fleet.json`
  written anyway.
- The suite's launch coverage is plan-time echo only; wall `launch` is never spawned by a test.

## Remaining unknown

The doc drifts above are in `.omp/skills/tower/SKILL.md`, outside this mission's scope — recorded
here as evidence, not fixed.
