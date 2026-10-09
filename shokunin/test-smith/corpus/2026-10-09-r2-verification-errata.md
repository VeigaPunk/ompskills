# 2026-10-09 — round-2 verification errata

**Asked.** The round-2 verification wave (24 lanes) re-derived the card and all
27 corpus entries against the sources. This entry records every correction the
wave found. The corpus is append-only, so the corrected entries stand as
written and this entry is the authoritative correction; read it alongside any
entry it names.

**Observed.** Corrections, by entry (claim as written → corrected; evidence =
the verifying lane's report at `reports/test-smith/<Name>.md`):

- `shokunin-card-contract` — "SKILL.md (whole, 113 lines)" → **115 lines**
  (`wc -l`). (VfyCardContractEntry)
- `tower-fleet-test-anatomy` — "all 37 sections spawn the launcher" → **36 of
  37** (section 2, `:313-321`, calls no launcher); "BAND `:117-122`" →
  **`:117-124`**. (VfySuiteAnatomy)
- `run-wave-test-anatomy` — step ranges: spec **`:526-545`**, plan
  **`:547-569`**, run **`:571-621`** (as written they land one step late);
  "`--help` prints the 12-line USAGE block" → **14 lines**; "Evidence: 60
  files" → **78 files** under `--out`. (VfySuiteAnatomy)
- `smoke-doc-anatomy` — the `UFO_CONFIG_PATH` fallback sentence is at
  **`:393-396`**, not `:386-389`. (VfySmokeDoc)
- `tft-fixture-discipline` — guard attribution: `tower-fleet.mjs:284` is
  unreachable for every planted case; the correct split is **3 cases hit
  `:271`** (prompt leaf, fleet state leaf, worktree slot) and **2 hit `:281`**
  (sessions parent, skill target parent); call sites are
  **`:289/:291/:298/:304/:306`**; section-37 tail cites: launch+`INVALID_SPEC`
  check **`:1676-1677`**, byte-equality **`:1680-1681`**, section spans
  **`:1631-1682`**, `wallCli` open **`:714`**. (VfyFixtures)
- `rwt-fixture-containment` — `waveCli` def is **`:345-357`**, not `:341-352`.
  (VfyFixtures)
- `wall-isolation` — "close `--apply --force` yields 3 blocks ending `complete
  --mission tf-alpha`" → **cumulative `allBlocks.length === 3`**; close itself
  spawns 2 (registry read + complete), the third is the standalone status at
  `:1598`, and the launcher appends `--note tower-fleet close`; the section-28
  stub prints **`{"ok":true,"missions":[]}`**, not `{"status":"present",…}`;
  the `UFO_FSD_ROOT` cite is **`test/tower-fleet.test.mjs:70,71,109,193`** (not
  run-wave-test `:70`); "byte-identical" is a metadata fingerprint; the
  bash-vs-node note is understated — the substrate `scripts/ufo-sighting` is a
  bash wrapper and `node --check` fails, so `--live-wall` verbs would fail at
  parse. (VfyWallIsolation)
- `refusal-envelope` — "`gate()` and `finish()` exit 1" → `finish(code)` is the
  generic 0-or-1 exit; `die(1)` `apply_not_landed` is an omitted exit-1 path.
  (VfyRefusals)
- `tft-refusal-coverage` — "zero-mutation proofs on every refusal family" →
  **not for `CONFIG_UNREADABLE` (§29/§31/§34) or `PANE_CEILING` (§21)**; "§21
  both-trip at pane 2 / L1 12" → **pane 2 / L1 2** (the 12 belongs to the
  separate `PATCHED=12` fixture); "`UNEXPECTED_ERROR` structurally dead" →
  **statically reachable** by any non-`TypedError` throw (true as
  never-fired/unasserted). (VfyTftRefusals)
- `band-authority-chain` — "all six fields via fail-closed `need()`+`intOf()`"
  → **five of six**; `l1Alias` is `String(need())` + token regex; "both legs
  bind `UFO_PROJECT_ROOT`/`UFO_CONFIG_PATH` to `--ufo-root`" → **only the CLI
  subprocess leg** (leg (b) is in-process injected policy); "diff vs HEAD =
  exactly the delta's six values" → **6 lines = 3 keys**
  (`minLanes`/`waveMinLanes`/`waveMaxLanes`); the other three already equal
  HEAD. (VfyBand)
- `audit-verdict-numbers` — PASS; precision notes only: the F1 hedge (§3-item
  `[+]` marks alone = 22), `WORKTREE_ADD_FAILED` left `typed()` at HEAD,
  `expectUsage` range `:945-952`, alias-neutralisation `:1548-1554`.
  (VfyAudit)
- `incidental-repinning` — "worktree HEAD is b251c5a (suite 1686 lines)" →
  **1685 lines**. (VfyAudit)
- `pin-rendered-content` — "the sole whole-value pins are §32's `row.prompt ===`
  and §26's plan-JSON `===` fields" → **false suite-wide** (§30 `:1285-1286`
  pins whole prompt lines with `===`; also `:286`, `:566/:577`, `:960`); true
  only when scoped to §24-26+§32. (VfyPinRendered)
- `evidence-gitignore` — the artifact enumeration lists **8 stale names the
  current runner never writes** (`spec-15/33/101.json`, `spec-ceiling-32.json`,
  `spec-single-family-16.json`, `refusal-15/33/101.json`,
  `plan-route-families.json`) — inherited from the smoke doc's stale table;
  actual: `spec-band-{15,16,17,32,33,100,101}.json`, `band-*.json`,
  `spec-route-single-family-32.json`, `plan-route-families-{mixed,single}.json`;
  "manifest emitted on every run regardless of verdict" → **true for verdict
  0/1 and `gate()` stops, not `die(64)` usage paths or `main().catch`**.
  (VfyEvidence)
- `evidence-layout` — "`--out` path.resolve `:237-238`" → **`:251`**;
  "REPORT_DIR does not follow `--out`" → **the basename DOES follow**; only the
  `test/evidence` prefix stays fixed; "Always written" overstated
  (`ufo-root/config/ufo.json` is fixture-band-only; `gate()` truncates later
  artifacts). (VfyEvidence)
- `lane-report-convention` — "re-checks before writing the spec" → **the
  re-check gates the planner, not the spec write**; "a cross-wave overwrite is
  refused `wave_registry_collision`" → **conditional** (identity change AND
  displaced assigned handles); this fleet's own r2 wave overwrote the registry
  cross-wave without refusal (disjoint names); "22 of 23 settled reports" →
  **mid-wave snapshot** (final pre-relocation: 25 of 26). (VfyLaneReports)
- `tower-fleet-contract` — "13 codes with zero occurrences" → **16 of 24 module
  codes unasserted** (add `WORKTREE_ADD_FAILED`, `MISSION_FAILED`,
  `UNEXPECTED_ERROR`); "section 36 is the sole close coverage" → **sections 8,
  28, 36**; boundary-imprecise ranges (loadSpec `:319-415`, renderPrompt/argv
  `:419-503`, buildPlan `:597-617`, `usageExit` closes `:115`); the repo-root
  refusal is equality ("resolves to the repo root itself"), not "inside".
  (VfyTfContract)
- `apply-gate` — citation-only: `DEFERRED_ARTIFACTS` **`:91-96`**, rationale
  comment **`:441-444`**, routing-authority quote **`:20-21`**; the regex uses
  `[ \t]` not `\s`; `wholeTableAudit` is apply's own replica; `--ufo-root`
  default is `UFO_ROOT`-env-overridable; backups occur only when the target
  exists. (VfyApplyGate)
- `prior-audit-evidence` — "16-row HOLDS matrix" → **17 rows**
  (`tf-safety-r2.md:130-146`). (VfyPriorAudits)
- `wave-validator-cli` — registry member shape: **resume rows carry no `role`**
  (spawn-only) — the listed shape is a valid union, not a per-row guarantee;
  exit 1 covers **every typed refusal**, not just invalid spec/plan.
  (VfyValidatorCli)
- `suite-run-commands` — "`--band live` passes `UFO_CONFIG_PATH`" → **both
  modes pass it** (`band.env` on every wave-CLI call); precondition
  attribution: `host/apply.mjs`, `host/omp-agent.config.yml`,
  `host/ufo-sighting-dispatch.json` resolve **under the repo checkout**, not
  the substrate. (VfyRunCommands)
- `mutation-probe` — "lines 178-193 = mutant rows" → **mutant rows span
  `:168-203`**; the "§3 + §5" attribution is mis-stated (shape/baseline/band
  are preamble `:1-13`; 18-of-32 is §1; category (a) is §2; killers-retained is
  §4; covered-means-touched is §6-§7); "T:259 killed 0 of 43" → **0 unique
  kills**. (VfyMutation)
- `l1-prompt-template` — the load-order heading is at **`:14`**, not `:13`; the
  content-based doctrine sentence lives in **§26 (`:1012-1013`)**, not §32.
  (VfyPromptTemplate)
- `verify-suite-green` — **PASS, no corrections** (every run number reproduced:
  exit 0, 967 ok, 1013 stdout, `ALL CHECKS PASS`). (VfySuiteGreen)
- `seat-routing` — PASS; notes: "per-wave effort granularity" understates "per
  mission/round/wave"; "live table" means candidate-at-runtime. (VfySeatRouting)
- `band-gate-edges` — PASS; cosmetic range drift (2-4 lines). (VfyBand)
- `wave-refusal-vocabulary` — PASS; notes: `impossible_band` is also asserted
  in 6e; the parenthetical UPPER_SNAKE list. (VfyRefusals)

**Changed.** The card `.omp/agents/test-smith.md` was amended in place (it is
the agent definition, not a corpus entry): "the real `config/ufo.json`" →
"the substrate's `config/ufo.json`"; the bounds now also forbid running the
launcher or the wall CLI directly (they mutate fleet/wall state), name the
gitignored `test/evidence/` exemption for hermetic suite runs, and state that
findings are advisory (never judge, integrate, or widen scope). Evidence:
VfyCardContract (27/27 contract claims PASS, one wording observation) and
VfyCardBounds (12/12 PASS; gaps G-1/G-2/M-1).

**Unknown.** The verification lanes were static re-derivations except where
noted (suite runs, the apply dry run, mutant staging in `/tmp`); the audit's
30-symbol/104-branch census and the 43-mutant battery split were not
independently re-derived; `collect` was never executed, so the
`present == 16` contradiction remains a labeled inference.
