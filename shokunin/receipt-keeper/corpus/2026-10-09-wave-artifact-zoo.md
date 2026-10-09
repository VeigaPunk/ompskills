# wave-artifact-zoo — Every waves/ filename pattern and the minimal reconstruction set

Source: r1 lane `WaveArtifactZoo` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Catalogue wave artifacts and which are needed to reconstruct a wave.

## Observed

- 165 files (shokunin 49, shokunin2 69, shokunin3 37 live, tower1/waves 9, tower1-safety-r2 1).
- Validator writes only to stdout: `plan` → `ufo-swarm-wave-v1`; `run` → `ufo-swarm-wave-dispatch-v1` (and persists `<reportDir>/swarm-registry.json`); `record` → registry. Filenames are L1 redirect choices.
- Suffixes: `.spec.json` (L1, 41), `.payload.json` (run, 35), `.dispatch.json` (run, older name, 5), `.plan.json` (19), `.plan.err`/`.dispatch.err`/`.run.err` (all 0 bytes in waves/), `.assignments.json` (L1 record input, 10, all identity maps), `.dispatch-result.json`/`.txt` (task return; `.txt` is Python repr), `.ids.json` (2), `.record.json` (3), `.taskcall.json` (1), `-draft.md` (1).
- Minimal set: spec + payload (sufficient alone) + record/registry for ids; dispatch-result optional proof of spawn. 40/40 payloads: `taskCall.context` sha1 = spec context sha1, task count = item count.
- Key on the spec's `wave` field, not the filename (wall-watcher specs carry `ww-r1-w1`). Exit codes are never persisted.

## Unknowns

- Refusal `.err` format never observed.
- Resume-only wave reconstruction unverified.
