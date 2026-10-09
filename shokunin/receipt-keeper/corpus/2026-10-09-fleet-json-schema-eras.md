# fleet-json-schema-eras — Three record schemas across real fleet.json files

Source: r1 lane `FleetJsonWriter + DocsDrift + SpecSchema` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: jq key-length histograms on tower1, shokunin, shokunin3; `git -C <repo> diff --stat` showed the dirty launcher.

## Asked

Do real fleet.json files match the HEAD writer?

## Observed

- `jq '[.missions[]|keys|length]|group_by(.)'`: tower1 → 15×10 keys + 1×16 (`tf-safety-r2`); shokunin → 8×16; shokunin3 → 10×18 (adds `l1Alias`, `overlays`).
- tower1's 10-key originals match the early record literal (commit `3dee568` era); reuse keys came in `a9c5f02`/`b8a639b`/`803f1ad`.
- shokunin3 was launched from the main checkout's **uncommitted** `sighting/tower-fleet.mjs` (+24/-2: per-mission `l1Alias`/`overlays`, loadSpec :371-377 in the dirty copy). HEAD writes 16 keys.
- Rule: pin the writer revision (git log of the launcher vs `launchedAt`, or dirty-tree diff) before treating a missing key as meaningful.

## Unknowns

- No per-file writer stamp exists; era attribution is by key shape and timestamps.
