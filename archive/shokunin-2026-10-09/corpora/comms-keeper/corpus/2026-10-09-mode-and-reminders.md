# 2026-10-09 — tower mode on/off, env flag, injected reminders

**Asked.** How tower mode toggles and what persists.
**Sources.** `flag.ts.js`, `towerFeature.ts.js`, `tui__commands__tower.ts.js`, `towerOps.ts.js`, `injection__*.js`, `towerService.ts.js:164-257`.
**Observed.**
- Feature flag `KIMI_CODE_EXPERIMENTAL_TOWER` (`1|true|yes|on` / `0|false|no|off`); precedence env → `[experimental] tower` config → `KIMI_CODE_EXPERIMENTAL_FLAG` → off. Assembled at construction (restart to enable).
- `/tower on` | `/tower <base>` → durable `tower_mode.enter` + adopt; `/tower off` → `tower_mode.exit` + `release`. `/tower teardown` and `/tower status` are just prompts asking the model to call the tool.
- Mode changes delete nothing: `state.json`, `MISSIONS.md`, `missions/`, `inbox/`, `findings/`, `reviews/`, `log/activity.log` all persist; only `sessionId` is cleared.
- Reminders: full / sparse / exit `<system-reminder>` user messages; `TOWER_MODE_DEDUP_MIN_TURNS=2`, `TOWER_MODE_FULL_REFRESH_TURNS=5`. Only the full text names inbox, findings, reviews, MISSIONS.md and activity.log; it also carries the "two consecutive identical rounds" stop doctrine.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Live behavior of the 5-turn refresh (looks unreachable on the per-step path).

**Lane.** ModeInjection (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/ModeInjection.md`.
