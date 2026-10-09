# 2026-10-09 — identity validation (run/session/mission/fleet ids)

**Asked:** verify the identity-validation contract for run ids, session ids, mission ids, and fleet
names: patterns, bounds, callers, refusal codes.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting-lib/base.mjs:31, 33, 35, 37, 276-281, 377-411` — `FLEET_NAME_PATTERN`,
  `RUN_ID_PATTERN`, `NATIVE_RUN_ID_PATTERN`, `SESSION_ID_PATTERN`, `validateFleetName`, `sanitizeTitle`,
  `validateRunId`, `validateSessionId`, `validateMissionId`.
- `ufo/scripts/ufo-sighting.mjs:2067-2104` — `newMission` (validators wired on every row); `:4569, :4586-4602, :4066-4095` — launch/register gates.
- `ufo/scripts/ufo-sighting-lib/surface.mjs:233-238` — the manifest's `missionId` contract.
- Tests: `ufo/tests/ufo-sighting.test.js:3933-3958` (malformed ids → typed refusal, **zero** registration
  and **zero** reservation).

**Observed**

| identity | pattern | bound | validator | refusal |
| --- | --- | --- | --- | --- |
| run id | `^[A-Za-z][A-Za-z0-9_-]{0,63}$` | 1–64 | `validateRunId` | `INVALID_RUN_ID` |
| native run id | `^[A-Za-z][A-Za-z0-9_-]{0,15}$` | 1–16 | `validateRunId(..., {native:true})` | `INVALID_RUN_ID` |
| session id | `^[A-Za-z][A-Za-z0-9_.-]{0,127}$` (dot allowed) | 1–128 | `validateSessionId` | `INVALID_SESSION_ID` |
| mission id | `^m_[a-f0-9]{32}$` (inline, no constant) | exactly 34 | `validateMissionId` | `MALFORMED_MANIFEST` "mission id is invalid" (no dedicated code) |
| fleet name | `^[a-z0-9][a-z0-9_-]{0,47}$` (lowercase only) | 1–48 | `validateFleetName` | `INVALID_ARGUMENT "--fleet must match …"` with `details:{fleet}` |
| title | not rejected — `sanitizeTitle` strips control/bidi, collapses whitespace, slices to 64 | ≤64 | `sanitizeTitle` then `assertSafeText(...,64)` | n/a |

- Mission ids are minted `m_${randomUUID().replaceAll("-","")}`; `--mission`/`--run-id` accept either form,
  and a collision across two rows is `MISSION_AMBIGUOUS` (see the `missionId` entries below).
- The contract is two-layered: a CLI gate at the verb and a full manifest re-validation on **every** load —
  so a hand-edited manifest that violates a pattern fails `MALFORMED_MANIFEST` typed on the next read.
- Callers: `launch` (fleet at the verb gate, then all four inside the lock), `register`
  (`RUN_ID`/`SESSION_ID`, `REGISTRATION_CONFLICT` on runId/sessionId/live-paneId duplication — an exact
  live triple re-register is an idempotent status echo), `inquiry` (mints ids), `twin` (`validateMissionId`
  on the origin, `TWIN_EXISTS`/`TWIN_RECURSION`).
- A malformed run/session id is refused **before** any registration or reservation — the test pins
  zero side effects.

**Changed:** nothing.

**Unknown:** nothing material.