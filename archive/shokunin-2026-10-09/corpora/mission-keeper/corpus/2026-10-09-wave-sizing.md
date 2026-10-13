# wave-sizing — Band math and probed wave-size edges

Item: step 2 (`sighting/l1-prompt.md:67-77`) + `skill://swarm` Validate, then probe the validator.

Observed rules: N same-shape items = one wave of N when waveMin ≤ N ≤ waveMax; N>waveMax → `ceil(N/waveMax)` sequential waves sized as evenly as possible, every wave inside the band; a short tail is NEVER folded into a full previous wave; over waveMax → `wave_too_wide`, a tail under waveMin → `too_few_lanes`; N<waveMin executed directly; padding forbidden; round lanes ≤ roundLaneCeiling (100), overflow carries.
Probe (env `UFO_PROJECT_ROOT=/tmp/mk-probe`, live config): 15 → exit 1 `too_few_lanes`; 16 → exit 0; 32 → exit 0; 33 → exit 1 `wave_too_wide`. Validator refusals exit 1 (distinct from the launcher's exit 2). The validator NEVER computes the split — the ceil/even sizing is L1 discipline only.
Tension found: `.omp/skills/swarm/SKILL.md:36-37` reads "(fold a short tail into the previous wave)" — literally what the prompt forbids; the prompt's no-fold rule is validator-true (a fold onto a full wave trips `wave_too_wide`).
Evidence: `WaveSizingMath.md`; corroborated by `tf-band-r1.md` (15/16/32/33/101 edges).
Unknowns: `run`/`record` exit codes and `--route-families` not exercised by this lane.
