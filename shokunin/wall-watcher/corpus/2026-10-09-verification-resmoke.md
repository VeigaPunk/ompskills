# 2026-10-09 — verification re-smoke: raw-text verbs, `--run-id` form, fleet capacity keys, corpus presence

**Asked:** four bounded checks against the wall CLI after the round-2 card edits, each answered with
`file:line` evidence actually read: (1) which wall verbs print raw text (not a JSON envelope) on success;
(2) does `--run-id` accept an `m_<32hex>` mission id, or is it run-form only; (3) which config key
enforces a fleet window's mission capacity and which its display grid; (4) do the card's corpus paths
resolve from this repo's root — `index.md` plus at least three named entries — and what is the index row
count.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`, read-only)**

- `ufo/scripts/ufo-sighting.mjs:4399-4678` — `main()` and the whole verb dispatch (read in full).
- `ufo/scripts/ufo-sighting.mjs:1485, 1490` — `runOverviewWatch` repaint / fault line; `:1466` — the fn.
- `ufo/scripts/ufo-sighting.mjs:4369-4373, 4386-4389` — `runPane` child spawn (`stdio:"inherit"`) + its
  only own write (a `console.error` of the spawn error).
- `ufo/scripts/ufo-sighting-lib/surface.mjs:310-312` — `output()` = `JSON.stringify(value, null, 2)`.
- `ufo/scripts/ufo-sighting.mjs:4672, 4503, 4404, 4441, 4676` — the raw-text writes (see below).
- `ufo/scripts/ufo-sighting.mjs:3151-3156` — `matchMissionByIdentifier` (`row.id === id || row.runId === id`).
- `ufo/scripts/ufo-sighting-lib/base.mjs:33, 389-396` — `RUN_ID_PATTERN` + `validateRunId`;
  `:406-410` — `validateMissionId` (`/^m_[a-f0-9]{32}$/`).
- `ufo/scripts/ufo-sighting.mjs:2067-2071` — `newMission` (`validateRunId(spec.runId, {native})`);
  `:3986` — twin's `validateRunId(options["run-id"] || defaultRunId, {native})`;
  `:4066` — register's `validateRunId(options["run-id"])`; `:3643-3656` — `resolveExactMission`
  (resume's `--run-id` is a literal identity assertion → `IDENTITY_MISMATCH`, not a lookup);
  `:4680-4691` — the native-direct fallback (`validateRunId(nativeRunId, {native:true})`).
- `ufo/scripts/ufo-sighting-lib/surface.mjs:64, 99, 118, 124, 153, 183-184, 207, 223, 233-238` — the
  `missionId` flag type, `--mission` sites, `--run-id` declarations, and the manifest `missionId` block.
- `ufo/scripts/ufo-sighting.mjs:2139-2142, 2177-2187` — `windowPaneCapacity` + `assertCapacity`.
- `ufo/scripts/ufo-sighting.mjs:1778-1780` — `profileContract`; `ufo/scripts/ufo-sighting-lib/base.mjs:295-299`
  — `fleetLayoutContract`; `ufo/scripts/ufo-sighting-lib/base.mjs:159-162, 200` — the boot read/validation.
- `ufo/config/ufo.json:60-69, 71` — `layouts` (16:9 3×5, 21:9 3×6) and `windowPaneCeiling: 16`.
- Repo root = `/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin/wall-watcher`; corpus reads via
  `read shokunin/wall-watcher/corpus/…` and `grep -c '^| \[2026' shokunin/wall-watcher/corpus/index.md`.
- Probe: `node -e 'const p=/^[A-Za-z][A-Za-z0-9_-]{0,63}$/u; const s="m_"+"a".repeat(32); console.log(s,s.length,p.test(s))'`
  → `m_aaaa… 34 true`.

**Observed**

### 1. Raw-text-on-success verbs (not the `output()` JSON envelope)

Every verb that reports a value routes through `output()` — `surface.mjs:310-312`
(`JSON.stringify(value, null, 2)`): `open`, `surface`, `status`, `reconcile`, `respawn-terminal`,
`inquiry`, `launch`, `register`, `twin`, `remove`, `resume`, `complete`, `steer`, and the native-direct
fallback. The raw-text success paths are:

| verb | write | site |
| --- | --- | --- |
| `peek` | `process.stdout.write(peekMission(...))` — raw captured pane text | `ufo-sighting.mjs:4672` |
| `overview` (one-shot) | `process.stdout.write(\`${renderFleetOverview(...)}\n\`)` | `ufo-sighting.mjs:4503` |
| `overview --watch` | in-place repaint `\x1b[H\x1b[J${view}\x1b[J` (no newline); fault line also raw | `ufo-sighting.mjs:1485`, `:1490` (in `runOverviewWatch`, `:1466`) |
| `help` / `--help` / `-h` | `process.stdout.write(\`${usage()}\n\`)` | `ufo-sighting.mjs:4676` |
| `<verb> --help` (scoped) | `process.stdout.write(\`${usageForVerb(command)}\n\`)` | `ufo-sighting.mjs:4441` |
| `__idle` (hidden) | `process.stdout.write("UFO Sighting\nNo active missions. The hatch is open.\n")` | `ufo-sighting.mjs:4404` |

- `__pane-run` (hidden) prints no envelope of its own: the child is spawned with `stdio:"inherit"`
  (`:4369-4373`), so the mission's own stdout/stderr reaches the terminal verbatim; its only direct write is
  `console.error(result.error.message)` on a spawn fault (`:4389`, `SPAWN_FAILED` recorded at `:4386-4388`).
- Card scope check: the card's refusals row ("`peek` and `overview` print raw text on success (not JSON)")
  is **accurate as far as it names them** — these are the two public *render* verbs — but the raw-text set is
  larger: `help`/`--help`, the scoped `<verb> --help` path, and the hidden `__idle` are raw too. All three
  extra paths are declared/help surfaces, not status envelopes, so no `{ok:…}` JSON is expected from them.
- Shim note (not a verb): the bash shim's internal `--ufo-sighting-inquiry-direct` route writes an OSC title
  escape with `printf '\033]0;…\007'` before exec'ing omp (`ufo/scripts/ufo-sighting:<inquiry-direct block>`);
  the `--inquiry` route itself execs the `inquiry` verb, which is JSON.

### 2. `--run-id`: run-form only (never a mission-id lookup); the `m_<hex>` shape is *not* regex-excluded

- `--mission` is the resolving flag: `matchMissionByIdentifier` matches `row.id === identifier ||
  row.runId === identifier` (`:3151-3156`), so `--mission` accepts a run id **or** an `m_<32hex>` mission id
  (`MISSION_AMBIGUOUS` when >1 row, `:3154`). Declared: flag type `missionId` (`surface.mjs:64`) used by
  `complete`/`remove`/`steer`/`peek`/`resume` (`:99, :118, :124, :153, :183`), and the manifest block
  `missionId: { forms: ["runId", "m_<hex>"], pattern: RUN_ID_PATTERN.source, ambiguous: "MISSION_AMBIGUOUS" }`
  (`surface.mjs:233-238`).
- `--run-id` is a **run-id value**, never a resolver:
  - `launch` — declared `{type:"string", required:true, pattern: RUN_ID_PATTERN.source}` (`surface.mjs:81`);
    the value becomes the new row's `runId` and is validated by `validateRunId` inside `newMission`
    (`ufo-sighting.mjs:2070`).
  - `register` — `validateRunId(options["run-id"])` (`:4066`); `twin` — `validateRunId(options["run-id"] ||
    defaultRunId, {native})` (`:3986`); native-direct fallback — `validateRunId(nativeRunId, {native:true})`
    (`:4691`).
  - `resume` — declared with `pattern: RUN_ID_PATTERN.source` (`surface.mjs:184`) but implemented as a
    **literal identity assertion**: `resolveExactMission` fails `IDENTITY_MISMATCH` unless
    `row.runId === runId` (`:3650-3656`). It identifies nothing; `--mission` does the resolution (`:3644-3648`).
- Validator: `validateRunId` → `RUN_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/u` (`base.mjs:33, 389-396`);
  `validateMissionId` → `/^m_[a-f0-9]{32}$/u` (`base.mjs:406-410`).
- **Caveat (measured, `[INFERENCE]`-free):** an `m_<32hex>` string *satisfies* `RUN_ID_PATTERN` — it starts
  with the letter `m`, uses only `[A-Za-z0-9_-]`, and is 34 chars ≤ 64 (probe: `p.test("m_"+"a"*32) === true`).
  So "run-form only" is a **role** claim (the flag is a run id / identity assertion, never a lookup), not a
  regex exclusion: passing `m_<hex>` as `--run-id` is accepted as a run id (on `resume` it then fails
  `IDENTITY_MISMATCH` against the real runId). The card's mission-id row states this correctly; the older
  `identity-validation.md` phrasing "`--mission`/`--run-id` accept either form" is over-general and this entry
  corrects it — only `--mission` accepts either *form as a lookup*.

### 3. Fleet window capacity vs display grid

- **Capacity key:** `sighting.windowPaneCeiling` (`config/ufo.json:71` = 16). Selected by
  `windowPaneCapacity(fleet, geometry)` → `return fleet ? SIGHTING_CONFIG.windowPaneCeiling : geometry.cap;`
  (`ufo-sighting.mjs:2140-2142`) and enforced by `assertCapacity` → `fail("CAP_EXCEEDED", "fleet <f> window
  capacity is <cap> missions", …)` (`:2177-2187`). Boot-read and validated on every invocation
  (`base.mjs:159-162`, stored `:200`).
- **Display grid of the fleet window:** *derived from the same key* — `fleetLayoutContract()`
  (`base.mjs:295-299`): `cap = SIGHTING_CONFIG.windowPaneCeiling`, `rows: 3`,
  `maxColumns = Math.max(1, Math.ceil(cap / 3))` (= 6 for cap 16 → 18 grid cells for a 16-mission cap).
- Contrast (default window): capacity **and** grid both come from `sighting.layouts[profile]`
  (`config/ufo.json:60-69`) via `profileContract` → `cap = rows * columns` (`ufo-sighting.mjs:1778-1780`),
  enforced by the same `assertCapacity` (`fleet === null` arm). So the correct split is: **fleet window =
  `windowPaneCeiling` (cap) with its grid derived from that key; default window = `layouts[profile]`
  (cap and grid)**. `windowPaneCeiling` is never display-only.

### 4. Corpus resolution and index row count

- `shokunin/wall-watcher/corpus/index.md` — **exists** (read at path `shokunin/wall-watcher/corpus/index.md`,
  header `# wall-watcher corpus — index`), so the card's corpus paths resolve from this repo's root
  (`/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin/wall-watcher`).
- Entry files — all 24 named entries exist; the ones read in full for this assignment:
  `2026-10-09-peek-verb.md`, `2026-10-09-overview-verb.md`, `2026-10-09-identity-validation.md`,
  `2026-10-09-ceilings.md`, `2026-10-09-verification-smoke.md`, `2026-10-09-errata-r2.md` (read); the
  remaining 18 are present per `glob shokunin/wall-watcher/corpus/*` (24 `.md` besides `index.md`).
- **Index row count:** 23 rows at first read (this session's opening read), and **24 rows** after the
  concurrently-landing `2026-10-09-errata-r2.md` row was appended by a sibling lane
  (`grep -c '^| \[2026' …/index.md` → 24; `ls -1 *.md | wc -l` → 25 = index + 24 entries). The index grows
  while lanes run; the count is a moving target and 24 is the value observed at write time.

**Changed:** wrote this entry; appended its row to `index.md`. Nothing else in the corpus, the card, the
substrate, or the live wall was touched.

**Unknown:** (a) the exact per-verb stdout destination when `peek`/`overview` output is piped vs a tty
(no tty-dependent branch found in the two write sites — read sites only); (b) whether any consumer parses
`help`/`__idle` output (no in-repo reader found, not searched exhaustively); (c) the tmux `-S -N` scrollback
semantics behind `peek` remain as recorded in `peek-verb.md`. Index row count is inherently racy under
concurrent lanes — see §4.