# The routing-free gate — no project surface declares a route table

**Asked.** What forbids a project config surface from carrying routes?

**Observed.** `ufo-fsd-alpha/scripts/check-routing-free-config.mjs`.

- `ROUTING_KEYS` (:20-22) = `modelRoles`, `agentModelOverrides`, `fallbackChains`,
  `modelRoutes`, `modelFallbacks`.
- Surfaces: `config/**` recursive (`*.yml|yaml|json`); `.omp/*.yml|yaml`
  non-recursive; `packages/*/.omp/*.yml|yaml` non-recursive. YAML is scanned
  line-wise at **any depth** (plain or quoted key, list items, `#` skipped);
  JSON is parsed and walked at any depth.
- Exit codes: 0 clean, 1 violations, 2 usage/read fault (fails closed).
- Origin (header :5-7): "ONESHOT WO-13d: `config/mission-main-event.yml` sat
  in-tree with 13 agentModelOverrides + modelRoles + fallbackChains because
  nothing looked."
- Wired as `npm run contracts:check` (`package.json:26`) and the `gates.sh`
  battery — **not** invoked by `host/apply.mjs`.

Live run (lane 18): `node scripts/check-routing-free-config.mjs --root
/home/vgpnk/Projects/ufo-fsd-alpha` -> exit 0,
`{"ok":true,"scanned":[9 files incl. config/ufo.json],"violations":[]}`.

Probes (lane 18): a planted scratch violation -> exit 1; `--bogus` -> exit 2; a
bad JSON surface -> exit 2; a 4.2 MiB config -> exit 2 ("exceeds the 4 MiB
config bound").

The gate asserts only the **negative** half (no project surface *declares*
routes); it never reads the global config, so the global table stays the sole
*positive* authority.

**Changed.** None.

**Unknown.** Non-recursive `.omp/` and `packages/*/.omp/` leaves nested subdirs
unscanned; `config/*.bak` backups escape `CONFIG_EXT`; YAML is not parsed so
cross-line keys are invisible.

Evidence: lane RoutingFreeScout18.