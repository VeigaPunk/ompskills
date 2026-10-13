# recursion-depth — task.maxRecursionDepth

Asked: every copy of the depth cap and what checks that they agree.
Lanes `RecursionDepth` and `OmpHarnessConcurrency`.

Every copy is 2: `config/ufo.json:127` `probe.depth` (the source) → `.omp/config.yml:4` (rendered by `sync-ufo-contracts.mjs:1475` and `lib.rs:1010`);
`.omp/ufo-l1.yml:8` (a separate literal); `host/omp-agent.config.yml:206`; `~/.omp/agent/config.yml:25`.

omp semantics (bundle `/home/vgpnk/.local/bin/omp` v18.8.7, minified, cited by string extraction):
- Predicate `allowed = max < 0 || depth < max`. Main is depth 0 and each child is parent + 1.
- Main(0) → executor(1) → labrat(2). labrat cannot spawn: "Cannot spawn another agent at task depth 2; maximum depth is 2."
- A negative value disables the cap (`omp://tools/task.md:166`). 0 forbids every spawn (from code; the docs say nothing) [INFERENCE].

Checks:
- JS `sync-ufo-contracts.mjs:1426` pins `probe.depth === 2`, and `:1451-1453` requires a positive int.
- Rust `lib.rs:1000-1003` uses `as_u64` only, so it admits 0 and 3. `profile_shape_refusal_tests.rs:11,54` asserts that depth 3 renders `maxRecursionDepth 3`.
- `run-omp-native-trial.mjs` `assertProjectionAgrees` checks `maxConcurrency` but **not** the depth line.
- Byte equality of the generated `.omp/config.yml` is the only agreement check. The host candidate and the global are never compared to the source.
- The leaf gate is card-level: `agents/executor.md` is the only card with `spawns` (labrat), enforced by `check-hand-authored-sets.mjs:163-173`.
