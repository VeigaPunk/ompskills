# default-iterate-rounds — what 1024 actually does

Lanes `DefaultIterateRounds`, `L0WatchConsumers` (scouts).

- One runtime reader: `fleet-dispatcher.mjs:5833-5834`
  `parseIterateRounds(spec.iterate) ?? (missionFormat && !("iterate" in spec) ?
  missionFormat.defaultIterateRounds : null)`. It applies only to fleet specs that
  omit the `iterate` key. `iterate: null` or `{rounds:0}` gives no iteration.
- Explicit `iterate.rounds` is bounded by the hardcoded 1024 (:5211, :5249), not
  by the config value. So the config value is a **default**, not a ceiling on
  explicit specs. The docs' "a ceiling, not a target" means the chain may stop
  early: `budget_halt` at `round >= iterate.rounds` (:5551) and any non-continue
  receipt ends it (:5555).
- Validators: dispatcher 1..1024 required (:3570). `sync-ufo-contracts.mjs:1212`
  is 1..1024 but **optional**.
- `ufo-l0-watch.mjs` / `ufo-l0-monitor.mjs` never read it. The watch has its own
  `ROUNDS = 8` (:152, CLI `--rounds` :1644), used only as a fallback, and
  successors inherit the parent's remaining budget.
- Fixtures use 8 (`fleet-dispatcher.test.mjs:173-178`, `fleet-selfheal-verify.mjs:436`).
  No Rust reader exists; `bundled/config.json:84` is data only.
