# r2-corrections — the round-2 falsification ledger and the changes it forced

Asked: verify the card and the 27 seeded entries by adversarial falsification, then record
every correction. Sources: the round-2 wave `reports/wave-smith-r2/` (30 lanes, one verifier
per entry + three whole-artifact lanes). Date: 2026-10-09.

Anchors: per-lane reports under `.tower/fleets/shokunin/reports/wave-smith-r2/<Name>.md`;
the validator `scripts/ufo-swarm-wave.mjs` sha256 `cd8247af7e7a9dc3…`; `config/ufo.json`
sha256 `0e416f0abc559e9a…` — both re-hashed by the card-contract lane and unchanged.

**Protocol note (this mission only).** The 27 entries below were authored inside this same
mission and had not yet been published, so the corrections are applied **in place** and this
entry is their audit trail. From the first published revision onward the corpus is
append-only as its protocol states: a later assignment corrects a claim by appending an
entry, never by rewriting one.

| entry | finding (verifier) | correction applied |
| --- | --- | --- |
| `role-set-and-names` | `role_required` anchor off by three lines; **"no model resolved or emitted anywhere" UNSUPPORTED** — the opt-in route preflight emits resolved hop strings (`plan.routePreflight.families[].hops`, e.g. `alibaba-token-plan/deepseek-v4.1-flash:max`) | anchors `:934-935` / `:937-939`; the no-pin fact restated (validator resolves no model; a default plan carries none; the preflight *reports* routing from the operator's config) |
| `item-kind-spawn-vs-resume` | `role: null` on a resume **refuses** (guard is `!== undefined`), unlike `item`/`axes`/`milestone`; source range and the `message ?? prompt` line were off | table cell corrected; source range `699-737`; `:919` |
| `band-arithmetic` | 28/28 MATCHES, 0 corrections | none |
| `refusal-taxonomy-plan` | range closed at `:1296`; "26 codes" had no source basis (the table lists 31 reachable); row-label typo | range `:768-1296`; "31 distinct codes (27 in-file + 4 sibling-mapped)"; typo fixed |
| `refusal-taxonomy-record-lock` | all MATCHES | none |
| `dispatch-payload` | `compaction` is an **unconditional** key of the plan object (present on plain `plan`); the payload's top-level `note` has **no** suite assertion (only `dispatch.note` is string-pinned) | both stated |
| `plan-schema` | a hoist **appends** after the explicit head (never rewrites it); `policy.source` anchor `:1239`; **"an injected policy reports default" UNSUPPORTED** (an injected `{source:"config"}` reports `config`) | all three corrected |
| `registry-schema` | spawn mint is a single `null` (a handle appears only after `record`); **"all fleet registries are all-null" refuted** — 35 files/1115 rows: 0 resume rows, 11 all-null files, 24 with handles (e.g. `tf-audit-routing` 51 rows/48 handles) | both corrected; "quote a specific file, never the fleet" |
| `registry-lock` | all MATCHES | none |
| `registry-persist-merge` | the quoted merge is not literal — `existing.members` is a **Map**, rebuilt via `Object.fromEntries` before the spread | literal quote + the Map note; semantics unchanged |
| `resume-admission` | **"a resume row can never be the owner handle" UNSUPPORTED** — admission reads `agentId` only, and `record` sets `agentId` on any member **by name** with no `kind` guard | corrected |
| `record-semantics` | the shape/path checks (1-2) run **before** the lock, not under it | header corrected |
| `toctou-revalidation` | "zero disk mutation" too strong — `withRegistryLock` `mkdirSync(dirname(registry))` runs before the callback; only the **registry bytes** are unmutated | corrected |
| `prompt-envelope` | the report-instruction step is guarded by `reportDir !== null` (the default is no report line) | table corrected |
| `lane-binding-axes-milestone` | 15/15 MATCHES | none |
| `template-expansion` | all MATCHES | none |
| `hoist-compaction` | the compact text is composed **only when `hoistEligibleTemplate`**; the hoisted frame also carries an instruction sentence; **"compaction is never a new refusal" DRIFTS** — the compact path's own `checkComposedText` can refuse `invalid_spec` (nonterminal marker) where `hoist:false` ships | all three corrected |
| `route-preflight` | the fd-bound snapshot lives in `omp-global-config.mjs` (uncited); the "14 unpinned roles" example is lane/role confusion and synthetic-only (live config pins all ten roles) | anchors + example corrected |
| `prior-refinement` | the block rides `taskCall.context` **only on spawn-bearing waves** (resume-only emits `taskCall: null`) | corrected |
| `cli-and-errors` | the dash-leading refusal is `--`-leading only (`rejectFlagLikeValues` tests `startsWith("--")`), so `--spec -x` consumes `-x` | corrected |
| `path-gates` | a **spawn-only** `plan` **admits** a symlinked `reportDir` (gate is inside `if (resumes.length > 0)`); `--spec` is the ungated *operator-declared* read; redaction rationale restated; a missing config is not refused at all | all four corrected |
| `policy-load` | JSON-`null` blocks and a bare `null` root are **accepted** (guards are `!== null`-aware), only non-object non-null refuses; injected `globalRunnerCeiling: null` is accepted while config `null` is refused; injected `source` is echoed unvalidated | all three corrected |
| `test-pins` | `wave_too_wide_rejected` is the baseline, not a precedence pin (harness declaration `:94`) | corrected |
| `skill-reconcile` | the skill lists `invalid_registry` at *both* surfaces; the two band messages quoted verbatim; the "every claim MATCHES" quantifier scoped to the enumerated claims | all three corrected |
| `real-wave-evidence` | counts verify for `tower1`+`towerprobe` only (this mission's own `shokunin` dir was never scanned); the entry carried no anchors line | source line scoped; an `Anchors:` line added |
| `dead-arms` | **"the composed bound subsumes the expansion arm" UNSUPPORTED** — `appendReportSuffix` trims whitespace, so a whitespace-overage expansion fails `:956-959` while its composed text passes `:1171`; the arm is the only detector there. Plus: the "no composition-site comparison" wording overreached; the retention anchor was wrong (`:834-835`, not `:1085-1090`); `usedNames` is shape not bytes; the `else-if` risk drops only the `resumeSends` copy | all corrected |
| `spec-key-surface` | `priorRegistry` "empty" attribution: an empty **string** → `invalid_spec`; a JSON **null** entry → `invalid_registry_path` | cell split in the round-1 entry's table |
| card | `singleFamily` is not an exported symbol (it is `routePreflight(...).concentration.singleFamily`); fold-tension wording; mission framing wording | card corrected (3 edits) + a **Coverage** bullet added so the card tells a reader to enumerate refusals from the source, not from the skill's partial list |

Fleet-wide result: **24 claims corrected, 4 entries clean, 0 entries rejected.** Nothing in
the card or corpus was found to claim a contract the source does not carry beyond the
items above, all now fixed.

## Not carried by the source

- The verifiers' theme grouping of the suite's 98 cases is their own filing, not a
  source-stated taxonomy (verified as a complete partition, not as source fact).
- No lane found an invented flag, verb, or code — the corrections are precision of anchors,
  quantifiers, and gate placement.

## Unknowns

- The frozen-whitespace edge in `dead-arms` is proven by two probes, not by a suite pin
  (no test asserts the expansion-bound message).
- `run`/`record` behavior was verified under scratch roots only; the live fleet registries
  were read, never written.
