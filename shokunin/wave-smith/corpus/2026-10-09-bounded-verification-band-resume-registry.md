# bounded-verification (band / resume-only / registry path) — three-question pass

Asked (read-only verification, shokunin dispatch WaveSmithCheck): (1) is a 15-spawn
wave admitted under the live config, and which code fires; (2) is a 40-resume-only
wave naming declared-prior handles admitted, and which gates are spawn-gated; (3)
with `reportDir: "reports/x"`, where does the registry land and what is a resume
row's `agentId`. All three confirmed against source + `plan` probes.

Revision anchor re-hashed before use: `ufo-swarm-wave.mjs`
sha256 `cd8247af7e7a9dc3e9dcff08d902e05ece72479f402ac754a89c5767cc304c00`,
`config/ufo.json` sha256 `0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3`,
`ufo-fsd-alpha@5ace2559` — corpus anchor holds.

Scratch root `/tmp/wave-smith-probe` with a real copy of `config/ufo.json`;
`UFO_PROJECT_ROOT=/tmp/wave-smith-probe UFO_CONFIG_PATH=/tmp/wave-smith-probe/config/ufo.json
UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 node .../ufo-swarm-wave.mjs plan --spec-json '<json>'`
(the ROOT-relative config gate is `defaultConfigPath` `:136`, `ROOT` `:123`).

## Q1 — 15 spawn lanes, distinct prompts

`exit=1`, `{"code":"too_few_lanes","message":"a wave with spawn lanes needs at least
16 lanes (got 15); split the round's scope into waves of 16-32 same-shape lanes"}`.
Arithmetic: `cap = policyMaxLanes = 100` (`:853-863`), `laneFloor = policyFloor = 16`,
`laneCeiling = min(policyCeiling, cap) = min(32, 100) = 32` (`:982-983`). 15 < 16 →
`too_few_lanes` at `:998-1002`. Preceding gates pass: `impossible_band` needs
`laneCeiling < laneFloor` (`:989`, false), `too_many_lanes` needs `total > cap` (`:995`,
false). The pairwise-distinct-prompt dedupe (`rejectDuplicate`) runs AFTER the band
gates (`:1010+`), so distinctness never changes this answer.

## Q2 — 40 resume-only lanes

`exit=0`, `counts {spawn:0,resume:40,total:40}`, `policy.source="config"`.
`too_many_lanes` is the ONE band gate that is NOT spawn-gated: `if (total > cap)`
(`:995`), no `spawns.length > 0` guard. The other three band gates are spawn-gated:
`impossible_band` (`:989`), `too_few_lanes` (`:998`), `wave_too_wide` (`:1004`).
`empty_wave` (`:978`) is a zero-lane guard, not spawn-gated and not a band gate.
So a resume-only wave is exempt from floor (16) and ceiling
(32) but not the 100-cap. Confirmed with a 101-resume-only probe: `exit=1`,
`too_many_lanes` — and it fires before resume admission, so no prior registry needed.

**Handle semantics correction (the one trap):** `items[].resume` names the *agentId
handle*, not the member key. A first probe using `resume:"PriorLane01"` (the row key,
prior rows carrying `agentId:"agent-001"…`) returned `resume_unknown_member` — the
admission map keys `entry.agentId` (`:1045-1047,1053-1057`). With `resume:"agent-001"…`
it admitted, resolving `member` to the owner row key (`PriorLane01`) and `item` to the
owner row's `item` (`:1072-1074`). Only rows with a **string** `agentId` attest, so a
prior row with `agentId:null` can never satisfy a resume.

## Q3 — reportDir "reports/x"

`registryRelPath(reportDir, wave)` `:420-425` (called `:846`): `dir = reportDir ??
\`.ufo/scopes/${wave ?? "wave"}\``, so the path is `reports/x/swarm-registry.json`
— plan echoed `registry.path` exactly. A resume row lands
`{kind:"resume", agentId:null, member, item[, axes][, milestone]}` (`:1123-1126`),
surfaced in `plan.registry.members` (`:1285`); probe row
`["Resume01",{"kind":"resume","agentId":null,"member":"PriorLane01","item":"src/prior/1"}]`.
`agentId` stays **null** (provenance-only, I6: one handle one member); the spawn row
keeps sole ownership and `record` fills only assigned names (`:1764-1782`). `plan` is
pure — it writes nothing; `run` persists the doc at `plan.registry.path` via
`persistWaveRegistry` (`:1877`), merge `{...existing.members, ...plan.registry.members}`
(`:1527-1530`).

## Not carried by the source

- `globalRunnerCeiling` (live 1056) is echoed in `plan.policy` but has no arithmetic
  coupling to the wave band — confirmed, band is 100/16/16/32 only.
- `plan` computes the registry doc but never writes it; only `run`/`record` persist.

## Unknowns

- `run`/`record` were not exercised (forbidden in the default environment); the on-disk
  resume row with `agentId:null` is established from `plan.registry.members` plus the
  persist merge `{...existing, ...plan.registry.members}`, not from a post-`run` file.
- The skill's "fold a short tail into the previous wave" diverges from the validator's
  message ("split … into waves of 16-32"): folding a tail into a FULL 32-lane wave is
  `wave_too_wide`; folding into a non-full wave is admitted. Not probed here; card-level
  observation, already tracked by `2026-10-09-skill-reconcile.md`.
