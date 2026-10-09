# band-round-receipts — tf-band evidence: band integrity and the drift rule

Item: `tf-band-r1.md` and `tf-audit-band-r1.md`.

Observed: band-integrity axes A1 delta-fidelity, A2 merge-fidelity, A3 wave-gate-edges, A4 gate-hermeticity, A5 pre/post-green. Delta keys (host/ufo-sighting-dispatch.json): maxConcurrentL1 16, missionFormat.l1Alias m_strong, swarm.maxLanes 100, minLanes 16, waveMinLanes 16, waveMaxLanes 32. Edge matrix: 15 refused `too_few_lanes`; 16 admitted; 32 admitted; 33 refused `wave_too_wide`; 101 refused `too_many_lanes` (100-spawn → `wave_too_wide`, 100 resume-only admitted).
Accepted move: commit `ba946bb` (+18/-2) — a `plannerEnv` helper binds `UFO_PROJECT_ROOT`/`UFO_CONFIG_PATH` at both child spawn sites, so the wave gate proves exactly the file it reports (A4/A5 improved, none regressed).
Consumer cross-check: `sighting/tower-fleet.mjs` reads the band live with zero 16/32/100 literals.
Drift incident: the authority was clobbered 01:22Z to 32-100 by a sibling lane's symlink write, restored by the operator to 16-32/100/16; the L1 re-read, re-validated and dispatched. Rule produced: re-read the live band before every wave; never write the substrate or through a symlink.

Evidence: `BandRoundReceipts.md`.
Unknowns: planner edge probes / hermetic runs / counterfactual probes not re-executed (quoted from receipts).
