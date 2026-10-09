# refusal-taxonomy-record-lock — the post-plan refusals and the three-way surface split

Asked: every code reachable only after `plan` returns — `record`, persist, and the lock.
Source: `scripts/ufo-swarm-wave.mjs:1460-1620, 1628-1799, 670-697, 483-506`. Lane: `RefusalsRecord`.

| code | verb | trigger | before/after spawn |
| --- | --- | --- | --- |
| `wave_registry_collision` | `run` (persist) | a *different* wave identity shares the registry path and an overlapping member name would displace an assigned handle not claimed by a planned resume | before the write; after ids exist |
| `registry_lock_timeout` | `run`/`record` | `<registry>.lock` held past the 30 s deadline | before any mutation |
| `registry_lock_unsafe` | `run`/`record` | the lock path is a symlink / not a directory | before any mutation |
| `resume_unknown_member` (lock arm) | `run` (persist) | a planned resume handle lost ownership between plan admission and publish | before the write |
| `conflicting_assignment` | `record` | in-payload duplicate id, at-rest id collision, cross-file prior attestation, or a re-point of a live handle | after ids return |
| `unknown_member` | `record` | assigned name is not a member row | after ids return |
| `invalid_agent_id` | `record` | value fails `RESUME_ID_PATTERN` (including `null` — `record` cannot clear a handle) | after ids return |
| `invalid_assignments` | `record` | not JSON, not a plain object, or over 1 MiB | after ids return |
| `invalid_registry` | `run`/`record` | registry missing (required read), corrupt, contradictory priors | varies |
| `invalid_registry_path` | `record` | `--registry` absolute / backslash / bad segment | before the lock |
| `EXEC_PATH_OUTSIDE_ROOT` | all | gated path resolves outside ROOT without the escape flag | before the lock |

Three-way split the module's own docs draw: **plan/run admission** (all before any
lane spawns), **record** (after the batched task call returns ids), and **the registry
lock** (which also carries the run-side collision and the lock arm of
`resume_unknown_member`).

Ordering facts observed by probes:

- `conflicting_assignment` (conflict loops) precedes `unknown_member` (member
  existence) and `invalid_agent_id` — a bad name whose id is already held reports the
  conflict first.
- `record`'s path checks run **before** the lock, so `invalid_registry_path` /
  `EXEC_PATH_OUTSIDE_ROOT` are never lock-surfaced.
- The declared `invalid_registry` owner-reader seam (`:681`) is swallowed by
  `withDirLock`'s own try/catch in both the stale-break and release arms — declared,
  not observable as an envelope.

## Not carried by the source

- No wave-identity check on `record`: it never verifies the ids came from the wave
  whose registry is named, and there is no liveness check on a handle.
- No removal path: only `run` clears rows (and names them in `handlesReset`).

## Unknowns

- The malformed-lock-owner arm cannot surface as a CLI refusal (analysis + source),
  so it stays unprobed by design.
