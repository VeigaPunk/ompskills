# validation-command — The validation/dispatch/record command shape, run live

Item: step 3's validation block + smoke steps 3-7, executed.

Observed command shape: `UFO_PROJECT_ROOT=<stateDir> UFO_CONFIG_PATH=<ufoRoot>/config/ufo.json UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 node <ufoRoot>/scripts/ufo-swarm-wave.mjs plan --spec <spec-file>`. `run` (same env) emits the `ufo-swarm-wave-dispatch-v1` payload and persists the registry at `ROOT/<reportDir>/swarm-registry.json`. `record --registry <relative> --assignments …` with `UFO_PROJECT_ROOT` set.
Live probe (16-lane scratch): plan exit 0, run exit 0, record exit 0; counts {spawn 16}; policy.source `config` (16/32/100/16); schemas wave-v1/dispatch-v1/registry-v1; every task leads `/skill:godspeed` exactly once, keys `{agent,name,task}`, no model key, Report tail relative.
Refusal arms observed: literal `<spec.json>` → bash exit 2 (syntax error); quoted → exit 1 `invalid_spec` ENOENT; `--spec -`/`--spec-json` → exit 0; both/none sources → exit 64; drop `UFO_CONFIG_PATH` → exit 0 but band swaps to default 2-100; config floor 32 → exit 1 `too_few_lanes`; drop `UFO_FLEET_ALLOW_EXTERNAL_TOOLS` → exit 1 `EXEC_PATH_OUTSIDE_ROOT`; record two-members-one-id → `conflicting_assignment`; unknown name → `unknown_member`; absolute `--registry` → `invalid_registry_path`.
DEFECT: the template's record line (123) has NO env prefix; a bare `record` against the default ROOT creates the `<reportDir>` tree INSIDE the read-only substrate before exiting 1 `invalid_registry`. (Lane created `/home/vgpnk/Projects/ufo-fsd-alpha/lane-reports/`, verified empty, `rmdir`'d it.)

Evidence: `ValidationCommand.md`.
Unknowns: no wave dispatched end-to-end; record ran with synthetic ids.
