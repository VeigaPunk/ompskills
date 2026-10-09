# l1-max-context — the other L1 overlay

Lane `L1MaxContextOverlay` (scout).

- `config/l1-max-context.yml` holds one key: `extendedContext: true` (line 20). Its
  header (:4-5) says it is passed as `--config` on every L1 wall mission.
- **No live argv builder passes it.** The only builder, `fleet-dispatcher.mjs`
  `ompChildArgv` `:8497`, forwards `task.configPath`, which is pinned to
  `mission-nightcall.yml` for fleet specs. The tower launcher hardcodes
  nightcall too. Each argv has one `--config`, so the two overlays never share
  an argv.
- Gate: `sync-ufo-contracts.mjs:1766-1775` requires exactly one non-blank,
  non-`#` line equal to `extendedContext: true`. Otherwise it fails with
  "config/l1-max-context.yml must contain exactly `extendedContext: true`". The
  result lands in `--check` JSON as `l1Overlay: {ok:true}` (observed).
- Tests use it as the non-fleet default configPath
  (`tests/fleet-dispatcher.test.js:515`).
- Both overlays set `extendedContext: true`, so a nightcall L1 gets max context
  anyway. The header claim is satisfied by nightcall, not by this file.
