# Titanium machine map — a runtime check, not route parity

Asked: what `ufo titanium` validates and whether it overlaps the build.rs
seat-routing parity. Substrate `5ace2559` (lane TitaniumSeatMap).

## Observed

- `ufo titanium` validates the tracked snapshot
  `docs/titanium-cli-machine-map.json` (MAP_PATH, titanium.rs:13) against an
  embedded JSON Schema — `include_bytes!` at titanium.rs:15-18 reading
  `packages/substrate-lib/...` (the one include escaping a package root;
  ufo-cli has no `include` key) — plus semantic rules, then prints the whole
  map or `--seat <id>`'s `Record` (titanium.rs:404-428 via main.rs:180-190).
- It is a runtime, CWD-rooted check. It does NOT touch build.rs, bundled/*,
  `seats.*`, or `l1Alias`.
- The two namespaces do not intersect: map record ids are SUBSTRATES
  (`omp kimi codex cursor opencode grok devin qwen bailian`); mirror seats
  are the 14 ROLES (connector critic distiller executor labrat main
  mutation-tester planner revenger reviewer scout scribe sentinel
  simplifier). Empty intersection, verified.
- `Record` (titanium.rs:52-63, deny_unknown_fields): id, display_name,
  admission (native|candidate), client_class, host_cli, versions,
  capabilities (headless, cloud_auth, resume, same_identity_reroute,
  saturation), `ufo {descriptor_path, adapter_path, judge_id,
  must_not_judge, execution_evidence}`, evidence[], caveats[]. Id pattern
  `^[a-z0-9][a-z0-9-]*$` max 64.
- Runtime-vs-embedded byte compare of the schema at titanium.rs:381-387 —
  the binary drift-checks its own embedded schema against the on-disk file.
- Tests: 21 `#[test]` in titanium_tests.rs + 10 `titanium_*` integration
  tests in cli_contract.rs:354-717 (determinism, seat record shape,
  typed envelopes, symlink/io traps, schema drift, no-host-spawn PATH trap).

## The distinction to keep

Compile-time route chains (build.rs over bundled mirrors) answer "which
models may a role seat reach". The titanium map answers "which substrate
CLIs are admitted and what evidence level their seats claim". Same word
"seat", different tables, different gates, no shared keys.
