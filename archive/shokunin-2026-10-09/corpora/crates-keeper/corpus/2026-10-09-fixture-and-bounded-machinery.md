# Fixture and bounded-IO machinery

Asked: bounded_fixture, fixture_spawn, bounded_fs, fs_durability contracts.
Substrate `5ace2559` (lane FixtureMachinery).

## Contracts

- `bounded_fixture::run_fixture_with_stdin` (bounded_fixture.rs:94, the
  only pub runner): clamps timeout ≥1s, feeds stdin via UnixStream pair
  with a detached bounded writer (:110-131,202-240), caps stdout/stderr at
  4 MiB (process_group.rs:18), kills the process group on timeout/exit
  (process_group.rs:177-215). **Silent stdin truncation at deadline**
  (:218-221,236) — the main unanchored-by-test risk. Callers: main.rs:653
  (self-iter contract mirror), main.rs:872 (charter Phase 0),
  local_ship.rs:2255 (verifier), fixture_spawn.rs:685 (loop fixture).
- `bounded_fs` is READ-only: classify → non-blocking open → fstat →
  optional (dev,ino) identity → `take(max+1)` with GrewPast check
  (:112-139). O_NOFOLLOW deliberately absent (:11-13). **Path containment
  is NOT here** — it lives in native_evidence.rs:89-122 (beneath-root
  canonicalize+starts_with) and local_ship.rs:1800-1840 (component walk,
  symlink refusal). The IdentityMismatch text (:52) names a beneath-root
  check bounded_fs never performs.
- `fixture_spawn` is private to loop_driver: spawns `python3
  fixtures/loop_specialist.py <role>` (:275-297; resolution env → seated
  root → bail), `env_clear` + allowlist (:299-328), stdin one JSON request
  (:606-675), stdout one JSON object discriminated by `kind` (:483-530),
  timeout → `LaneTimeout pid=0` (:688-693).
- `fs_durability`: `fsync_dir`, `TmpGuard`, `create_0600_tmp`,
  `hard_link_tmp`, clocks (:14-107). Used by lease.rs; `local_ship.rs`
  `atomic_write` (:2161) INLINES its own sequence (:2179-2224) and a second
  copy exists at :862-866 — contradicting the module header claim (:1-6).

## Script reliance

- `sync-ufo-contracts.mjs --check` child must emit `{ok:…}` JSON — Rust
  drives `allContractsReady` from it (main.rs:678-679,:445); child
  inherits ambient env unsanitized (:621-630).
- `fixtures/loop_specialist.py`: reads one JSON request (:47), exits 3 on
  undeclared route (:63-65), reads only `UFO_LOOP_LANE_LOG` /
  `UFO_LOOP_FIXTURE_STALL_SECS` — both on the sanitizer allowlist.
