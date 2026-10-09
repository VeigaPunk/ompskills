# 2026-10-09 — verification smoke: peek clamp, remove-on-unknown, capacity keys

**Asked:** three bounded questions, each answered with `file:line` evidence actually read:
(1) `peek --mission X --lines 99999` — refused or clamped and by what code path;
(2) `remove --mission <unknown>` on a live wall — typed refusal or exit 0, and with what field;
(3) which config key enforces the default window's mission capacity vs a fleet window's.

`ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha` (read-only). No mutating verb was run; evidence is source
reads + the pinned tests.

## 1. `peek --lines 99999` — **clamped, not refused** (exit 0)

- Path: `peek` dispatch reads the flag and calls the parser inline —
  `ufo/scripts/ufo-sighting.mjs:4666-4673`, the call is
  `process.stdout.write(peekMission(options.mission, parsePeekLines(options.lines), env))` at `:4672`.
- `parsePeekLines` — `ufo/scripts/ufo-sighting.mjs:3560-3570`: `Number(99999)` is a safe integer, so it
  passes `:3568`, and `:3569` returns `Math.min(MAX_PEEK_LINES, Math.max(1, n))` = `Math.min(400, 99999)` = **400**.
- Bounds are code-only constants: `DEFAULT_PEEK_LINES = 80` at
  `ufo/scripts/ufo-sighting-lib/surface.mjs:20`, `MAX_PEEK_LINES = 400` at `:22`; descriptor
  `"--lines": { type:"int", default:80, min:1, max:400, clamp:true }` at `surface.mjs:154`, and the bounds
  block `peekLines: { default, min:1, max:400 }` at `surface.mjs:243`. No config key.
- The clamped value feeds `capture-pane -p -t <paneId> -S -<lines>` inside `peekMission`
  (`ufo-sighting.mjs:3544-3558`), so 99999 becomes `-S -400`.
- Only a blank or non-safe-integer value is refused: `fail("INVALID_ARGUMENT", "--lines must be an integer")`
  at `:3566-3568` (empty/whitespace explicitly guarded, comment `:3562-3563`).
- Test pin: `ufo/tests/ufo-sighting.test.js:3027-3037` — "peek --lines rejects empty values and clamps
  oversize"; `runWall(["peek","--mission","PeekLines1","--lines","99999"], fx.env)` asserted
  `clamped.status === 0` (`:3036-3037`), while `""`/`"   "` are `INVALID_ARGUMENT` exit 2 (`:3031-3033`).

**Answer: silently clamped to 400 lines, exit 0; no refusal code.** Refusal would require a non-integer
(e.g. `1.5`, `nope`, blank) → `INVALID_ARGUMENT`, exit 2.

## 2. `remove --mission <unknown>` on a live wall — **exit 0, no typed refusal; field `removed:false`**

- Dispatch — `ufo/scripts/ufo-sighting.mjs:4616-4626`: `output({ removed: removeMission(options.mission, env), ...getStatus({ env }) })`.
  The only pre-`removeMission` failures are `INVALID_ARGUMENT` (missing `--mission`, `--` junk, unknown flag);
  a valid `--mission` value reaches `removeMission` unfiltered.
- `removeMission` — `ufo/scripts/ufo-sighting.mjs:3158-3178`: `loadManifest({create:false})`; if no state or
  no session → `return false` (`:3161`); `matchMissionByIdentifier` (`:3151-3156`) returns `null` when the
  identifier matches no `row.id`/`row.runId`; `if (!mission) return false` (`:3164`). No `fail(...)` on the
  absent path — the only typed error reachable is `MISSION_AMBIGUOUS` when the identifier matches >1 row
  (`:3155`).
- Envelope field: `removed` (`false` for the absent row). Declared in the surface: `remove` is
  `idempotent: true` with `states.absent = "exit 0, removed:false"` —
  `ufo/scripts/ufo-sighting-lib/surface.mjs:117-121`.
- Test pin: `ufo/tests/ufo-sighting.test.js:2995-3003` — replaying `remove` on the absent row asserts
  `again.removed === false` (`:3001`) and an unchanged `registryRevision` / byte-identical manifest
  (`:3002-3003`). Ambiguity pin: `ufo/tests/ufo-sighting.test.js:2952-2967` (typed, exit 2).

**Answer: exit 0 (idempotent no-op), not a typed refusal; the distinguishing field is `removed:false`.**
(The corpus `remove-verb` entry already recorded this; re-verified here.)

## 3. Default-window capacity vs fleet-window capacity — **`sighting.layouts[profile]` vs `sighting.windowPaneCeiling`**

The enforced quantity is a **mission count**, and the two windows read different keys via
`windowPaneCapacity(fleet, geometry)` at `ufo/scripts/ufo-sighting.mjs:2140-2142`:
`return fleet ? SIGHTING_CONFIG.windowPaneCeiling : geometry.cap;`

| window | enforcing key | `cap` derivation | refusal |
| --- | --- | --- | --- |
| **default window (1, `fleet`)** | `sighting.layouts[profile]` (`config/ufo.json:63-70`: 16:9 = 3×5, 21:9 = 3×6) | `geometry.cap = rows*columns` from `classifyGeometry` (`ufo-sighting.mjs:1206-1213`, `contract = SIGHTING_CONFIG.layouts[profile]`, `cap: contract.rows*contract.columns`) / `profileContract` (`:1778-1781`); = **15** at 16:9, **18** at 21:9 | `CAP_EXCEEDED` |
| **fleet window (`--fleet NAME`)** | `sighting.windowPaneCeiling` (`config/ufo.json:71` = **16**) | `SIGHTING_CONFIG.windowPaneCeiling` directly (`:2141`); `fleetLayoutContract` (`ufo-sighting-lib/base.mjs:295-299`) also derives that window's grid from it (`rows:3, maxColumns: ceil(cap/3)`) | `CAP_EXCEEDED` |

- Enforcement site: `assertCapacity` — `ufo/scripts/ufo-sighting.mjs:2177-2187`: `const cap = windowPaneCapacity(fleet, geometry)`;
  `liveMissionsForFleet(state, fleet).length >= cap` → `fail("CAP_EXCEEDED", fleet ? "fleet <f> window capacity is <cap> missions" : "<profile> wall capacity is <cap> missions", …)`.
- Config validation: `windowPaneCeiling` is boot-read and validated non-empty on every invocation —
  `ufo/scripts/ufo-sighting-lib/base.mjs:159-162` (throws "config/ufo.json is missing sighting.windowPaneCeiling").
- Declared caps block: `windowPaneCeiling: { provenance:"config", key:"sighting.windowPaneCeiling" }` —
  `ufo/scripts/ufo-sighting-lib/surface.mjs:246`.
- Live values: `config/ufo.json:63-71` (`layouts` 16:9 3×5 / 21:9 3×6; `windowPaneCeiling 16`).

**Answer:** the **default window's** mission capacity is enforced by `sighting.layouts[<profile>]`
(rows×columns → `CAP_EXCEEDED`); a **fleet window's** by `sighting.windowPaneCeiling` (→ `CAP_EXCEEDED`).
Note the global arms (`sighting.dispatch.maxConcurrentL1` → `L1_CEILING_EXCEEDED`, run first) and
`sighting.dispatch.globalRunnerCeiling` → `RUNNER_CEILING_EXCEEDED` sit above these. See
`2026-10-09-ceilings.md` for the ordering/shadowing detail.

**Changed:** nothing (read-only).

**Unknown:** none material for these three items. Unverified tmux `-S -N` scrollback semantics (history vs
visible) remain as recorded in `peek-verb.md` — the clamp value (400) is proven; what tmux returns for that
range is not.