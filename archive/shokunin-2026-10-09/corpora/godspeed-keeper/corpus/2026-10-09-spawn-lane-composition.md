# Spawn-lane composition order in the wave renderer

**Asked:** the exact bytes a spawn lane receives and in what order.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` sha256
`cd8247af7e7a9dc3e9dcff08d902e05ece72479f402ac754a89c5767cc304c00`.

## Observed

- Per-spawn-lane order (legacy site):
  1. `lane.text` (base) — L1155
  2. `laneBindingSuffix(lane)` via `appendReportSuffix` — L1156
  3. `reportInstruction(reportDir, name)` via `appendReportSuffix`, if `reportDir` — L1158
  4. single leading prepend `` `${GODSPEED_INVOCATION}\n\n${text}` `` only when
     `!opensWithGodspeedInvocation(text)` — L1167
  5. `checkComposedText(..., "after reportDir append and godspeed invocation")` — L1171
- `checkComposedText` (L240-245): byte bound (`MAX_PROMPT_BYTES` = `64 * 1024`, L155) **first**, then
  `checkEnvelopeMarker`.
- `laneBindingSuffix` (L749-753): executor → `Lane bounds: leaf member — no subagent dispatch except your
  single labrat.`; every other role → `Lane bounds: leaf member — no subagent dispatch.`; then optional
  `Judged on: <axes>` and `Milestone: <milestone>`.
- Compact (template-hoist) emission mirrors the order at L1178 (binding), L1180 (report), L1182
  (invocation), L1183 (check). Resume arm: report only, no binding suffix, **no invocation prepend**
  (L1128-1141).
- Load-bearing comment: the Godspeed posture "must be *invoked*, not assumed" (L156-159; site L1160-1165:
  "a lane is a fresh session … only a leading skill line loads the skill").
- Hook parity: same regex (:174) and same prefix shape (hook L34-35, L47).

## Unknown

None within scope.