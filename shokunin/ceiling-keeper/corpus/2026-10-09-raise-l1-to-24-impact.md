# raise-l1-to-24-impact — what moving maxConcurrentL1 16 → 24 alone does

Asked: an operator raises only `sighting.dispatch.maxConcurrentL1` from 16 to 24, then launches a 20-mission tower fleet.
(1) Which launcher gate refuses at plan time? (2) A 16-mission fleet runs alongside 10 other live default-wall missions: what does the wall do on the 15th fleet launch? (3) What else would need to change, or would trip?
Anchors re-hashed: `config/ufo.json` `0e416f0a…` (unchanged), `tower-fleet.mjs` `80f0814e…`, `ufo-sighting.mjs` `5e8ea127…`, substrate HEAD `5ace2559`.

## (1) Plan time: `PANE_CEILING_EXCEEDED`, observed

Setup: a scratch ufoRoot `/tmp/ck-l1-24/ufoRoot` holding a byte copy of the working-tree config, with a one-line edit.
`diff` shows only `:79 "maxConcurrentL1": 24`, and the copy's sha is `afe3ae10…`. Ran `node sighting/tower-fleet.mjs plan --spec <n> --json`:
| missions | result |
| --- | --- |
| 16 | exit 0, band `maxConcurrentL1 24, windowPaneCeiling 16` |
| 17 / 20 / 24 | exit 2 `PANE_CEILING_EXCEEDED` "fleet declares N panes; sighting.windowPaneCeiling is 16" |
| 25 | exit 2 `L1_CEILING_EXCEEDED` "…maxConcurrentL1 is 24" |
Control (an unedited copy, 20 missions): `L1_CEILING_EXCEEDED` "…is 16".
Why: `tower-fleet.mjs:337` (`> maxConcurrentL1`) now passes 20, so `:340` (`missions.length > windowPaneCeiling`, still 16) fires.
The raise only unmasks the pane gate, which was dead while both values were 16. The ceiling for one fleet stays min(24, 16) = 16.

## (2) The wall: `L1_CEILING_EXCEEDED` on the 15th, derived from source and not executed

Plan passes: 16 is not > 24 and not > 16. Each launch runs `launchMissionLocked`: `ufo-sighting.mjs:2351` `assertL1Capacity`, then `:2352` `assertCapacity`, then `:2354` runner.
- `l1MissionCapacity` `:2144-2158`: active = `liveMissions(state).length`, meaning starting|running rows across all fleets and the default wall (`base.mjs:432-433`).
- At the 15th fleet launch, active = 10 + 14 = 24. `:2167` `active >= ceiling` (24 >= 24) → `L1_CEILING_EXCEEDED` "global L1 mission ceiling is 24", details `{ceiling:24, active:24, headroom:0, fleet:<fleet>}`, exit 2.
- `assertCapacity` is never reached. It would pass anyway: fleet live count 14 is not >= `windowPaneCeiling` 16 (`:2179`, fleet branch `:2141`). The 10 default-wall rows count against the 16:9 cap of 15 or the 21:9 cap of 18 (fleet = null), not against the fleet window.
- Runner: `--runner-reservation 1` (`tower-fleet.mjs:500`), so 25 reserved is far below 1056, and that gate is not binding.
- The launcher continues past a failed launch: it records `LAUNCH_FAILED` with detail "L1_CEILING_EXCEEDED: …" (`tower-fleet.mjs:855-868, 879-886`). The 16th mission is refused the same way. `fleet.json` gets `ok:false` (`:907-908`), and the run ends with `LAUNCH_PARTIAL` "2 of 16 missions failed…" (`:946`), exit 2, with 14 panes live.
- Under the dispatcher instead: claim-side defer `mission_headroom` (`fleet-dispatcher.mjs:8162-8163`), with no refusal.
[INFERENCE] The boundary semantics match the observed pinned-2 run in `reports/tf-audit-wall.md:90-96` (3rd launch: active 2, ceiling 2, refused).

## (3) Blast radius of moving only maxConcurrentL1

Live readers (all read the file, none caches the value): `base.mjs:166-169,201` (wall), `fleet-dispatcher.mjs:3749-3751,4401`, `tower-fleet.mjs:151`, `surface.mjs:248` (caps).
Positive-int gates that accept 24: `sync-ufo-contracts.mjs:1198`, `host/apply.mjs:377`.

The coupled knob (no code links them; both values coincide at 16): `sighting.windowPaneCeiling` 16.
Admitting 17–24 in **one** fleet also needs that knob raised, or the launcher (`:340`, `>`) and the wall (`:2179`, `>=` → `CAP_EXCEEDED`) refuse.
Splitting across fleets of 16 or fewer reaches 24 globally without raising it.

Would revert it: `host/ufo-sighting-dispatch.json:2` `"maxConcurrentL1": 16`. A later `host/apply.mjs` run merges the delta (`:922`) back to 16.

Mirrors and digests:
- `crates/ufo-core-runtime/bundled/config.json:79` says 32. It was already drifted and stays drifted. `apply.mjs:93` defers it.
- `sighting.surfaceDigest` (`config/ufo.json:59`, mirror `:59`) hashes the whole surface manifest including `caps.maxConcurrentL1.value` (`surface.mjs:60,248`; `sync-ufo-contracts.mjs:482-483,561-564`).
  In-memory recomputation: live 16 → `8884924f…`, 24 → `066840da…`, declared `666cd0a1…`. The digest was already mismatched, and the move changes the computed value again. `sync --check` stays exit 1. Re-charter needed.

Test pins:
- `test/tower-fleet.test.mjs` with `UFO_FSD_ROOT=<edited copy>` gave **FAILURES 2**: `:334` "fixture pane ceiling admits the L1 ceiling (pane 16, L1 24)" and `:338` "at-ceiling plan exit 0" (24 missions → `PANE_CEILING_EXCEEDED`).
  The unedited control copy gave ALL CHECKS PASS. The suite reads the substrate config live (`:70-71,109,118`), so this trips the moment the substrate moves.
- `tests/ufo-sighting.test.js:3704-3706` pins `caps.maxConcurrentL1` 32 against the live wall surface. Red at 16, still red at 24 (not run).
- Hermetic, so unaffected: `ufo-sighting.test.js:1948` (pinned 16) and `:2000` (pinned 2); wall-heavy `:23,62,106,218,320,379` (64/32); fleet-dispatcher fixtures (16).
  `:1800`/`:1878` inherit the live L1 but launch at most 3 [INFERENCE: unaffected].

Prose that would be stale (already wrong at 32, or right at 16 today and wrong after):
- Says 32: `AGENTS.md:204`, `skills/ufo/SKILL.md:338`, `skills/ufo/references/run-logic.md:20-21,2285`, `docs/BEHAVIOR-MATRIX.md:12,27,180`, `docs/L2-L3-ROUTING.md:63,150,177`, and `packages/cursor/.cursor/skills/ufo/references/run-logic.md:2285`.
- Says 16: `host/omp-agent.config.yml:201-202` ("moves independently to 16"), `.omp/agents/godspeed-keeper.md:194`, `.omp/agents/substrate-keeper.md:40`, and this corpus's `live-value-ledger` row (a correction must be a new entry).
- CHANGELOG entries and `reports/tf-*` are historical, not live claims.
- `globalRunnerCeiling` 1056 prose ("32 L1s + 1024 lanes", BEHAVIOR-MATRIX:179) is coincident arithmetic with no comparator.

Changed: nothing in the substrate. Scratch `/tmp/ck-l1-24` was used and then removed.
Unknown: whether the fleet window's tmux tiling handles more than 16 panes if `windowPaneCeiling` were also raised (fleet-warden/wall-watcher territory). Q2 was not executed against a real wall.
