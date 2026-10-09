# record-semantics — the post-spawn assignment half of ownership

Asked: `mainRecord` — its CLI shape, check order, and refusal behavior.
Source: `scripts/ufo-swarm-wave.mjs:1628-1799, 483-506, 342-349`. Lane: `RecordSemantics`.

CLI: `record --registry <path> --assignments '<json>'` — no flags, exactly two value
options (`:1634`), values walked by the hub's `parseDeclaredArgv` + `rejectFlagLikeValues`.
Two usage faults (exit 64): the first arg fault, or `"record requires --registry <path>
and --assignments <json>"`.

Check order — the **shape and path checks (1-2) run before the lock**; everything from
step 3 on is under the registry lock, and every failure unwinds before the single write:

1. `--registry` shape → `invalid_spec` (empty / >512 B) or `invalid_registry_path`
   (absolute / backslash / bad segment).
2. Path gate → `EXEC_PATH_OUTSIDE_ROOT` (skipped with the escape flag).
3. Lock → `registry_lock_timeout` | `registry_lock_unsafe`.
4. Registry exists and loads clean → `invalid_registry`.
5. `--assignments` bound (1 MiB — CLI-unreachable on Linux) and JSON parse →
   `invalid_assignments`; must be a plain object.
6. In-payload duplicate id → `conflicting_assignment`.
7. Declared priors load; cross-prior claim replay → `invalid_registry`.
8. At-rest duplicate (id held by a different member) → `conflicting_assignment`.
9. Cross-file attestation vs priors → `conflicting_assignment`, with a same-name
   exemption and a same-`(member,item)` exemption.
10. Name is a member → `unknown_member`; then `agentId` shape → `invalid_agent_id`.
11. Re-point of a live handle → `conflicting_assignment`; same-id re-record is idempotent.

Consequences observed: conflicts mask later name/id faults (fixing the reported one may
uncover another); a handle **swap** is inexpressible in one call (the at-rest index is
built pre-mutation); `null` is not a legal assignment — `record` cannot clear a handle
(only `run` does, naming it in `handlesReset`); idempotent re-record still rewrites the
file and bumps `updatedAt` (ownership-neutral, not a no-op write). Zero mutation verified
on every refusal arm (`cmp` byte-identical).

Success surface: `emitJson({path, ...registryDoc})` on stdout, exit 0; faults emit the
one-line `ufo-swarm-wave-error-v1` envelope on stderr, exit 1 (64 for usage).

Recovery: after `conflicting_assignment`, **re-run the wave** (spawn rows reset to
`agentId: null`, named in `handlesReset`), then record the fresh handle. The swarm skill
never names this step — it lives only in the validator's message (`:1779`) and header
comment.

## Not carried by the source

- No wave-identity or provenance check; no liveness check; no removal/rename path.
- No stdin or `--assignments-file` surface and no `--registry -`.

## Unknowns

- The 1 MiB `--assignments` bound is defensive (the shell's `MAX_ARG_STRLEN` refuses
  first); `mainRecord` is module-private.
- Real OMP agent-id shapes were not sampled against a live `task` result; the pattern
  accepts far more than the harness mints.
