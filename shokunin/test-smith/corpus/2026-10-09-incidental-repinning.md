# 2026-10-09 — incidental re-pinning: the anti-patterns and their HEAD status

**Asked.** What anti-patterns does `reports/tf-audit-tests.md` §4 name, what
rule do they imply, and do the claims still hold at HEAD? (Lane
`IncidentalRepinning`, critic.)

**Observed.** Source: `reports/tf-audit-tests.md` §4 (lines 151-193) plus the
cited test sites; mutants staged as copies under `/tmp` (read-only on the
worktree).

- Citation provenance: the audit baseline is `8e48b75` (suite 294 lines, 34
  `check(` text sites); the worktree HEAD is `b251c5a` (suite 1686 lines) and
  `24a47c5` — which §3.12-32 called "unlanded" — IS landed; the launcher drifted
  741 → 1306 lines, so every audit `impl:<n>` cite is stale too. The report
  supplies the audit `T:` → HEAD line mapping for every row (P1 181→289 … P19
  195→303).
- Anti-patterns (audit id → what it pins): P1 markdown prose "lanes per wave",
  cell syntax, en-dash, expected value from the same copied config; P2 literal
  "2 rounds" bypassing `spec.roundCeiling`; P3 a copy of the implementation's
  own placeholder regex (same `[A-Za-z]` class gap); P4 the `bash` invoker
  token (partly incidental) vs the genuine path+verb; P5 presence-only
  membership of six wall flags, no values/position; P6 display-only flags
  (0 hits in the substrate preflight) and a forbidden-token filter that
  replicates the `interactiveGuard` predicate, missing `-p=x`/`--print=x`; P7
  `ompArgv.at(-1)` argv order; P8 tool self-echoes with no in-tree consumer;
  P9 one fleet-pattern branch, two spellings (audit: 0/2 unique kills); P10 one
  arm of a disjunction (two independent checks refuse the same input); P11 one
  `||` condition for launch+close; P12 a second process spawned to print an
  already-known status; P13 `!existsSync(STATE_DIR)` as a no-wall-touch proxy
  (partly incidental, not zero-power); P14 three bare exit-64 checks with the
  payload unpinned at baseline; P15 `plan.band` compared to the same fixture
  copy (coincidence pin); P16 a `readdirSafe` length conjunct dead once
  `!existsSync` holds; P17 "hermetic" header prose; P18 backticked id/axis —
  audit-judged NOT incidental, upheld; P19 the model alias compared to the same
  copied config.
- The implied rule: an assertion earns its place only if it can fail for at
  least one plausible defect and its expected value comes from an authority the
  implementation under test does not itself supply. Must not pin:
  presentation/prose/layout; coincidence values copied from the same input; the
  implementation's own predicate; implementation-detail tokens with no consumer
  (invoker token, display flags, argv order, presence-only); self-echoes;
  duplicate pins sharing one branch and one observable; one arm of a
  disjunction; work with no detection power (double spawn, dead conjunct); a
  proxy that is not the claimed behaviour.
- Adversarial re-check at HEAD (P19 and the P1/P15 family): baseline
  `node test/tower-fleet.test.mjs` → `ALL CHECKS PASS`, exit 0, 967 `ok` lines.
  An alias mutant (all four live alias reads replaced with the current live
  constant `m_strong`) → **`FAILURES 6`, exit 1** (killers: §30 `live-band plan
  mirrors every patched band field`, both missions' `omp model alias`, plus the
  alias-neutralisation checks at `:1526-1556`). A band mutant (hardcoding
  today's live cells `waveMin:"16"`, `waveMax:"32"`, `roundLaneCeiling:"100"`)
  → **`FAILURES 7`, exit 1**, all in §30.
- Verdict: the audit's §4 sentence is correct only about the *local* assertion
  site (HEAD `:303` still compares against `BAND.l1Alias` parsed from the same
  copy; `:289`/`:290` are still self-referential for the default fixture). Its
  suite-level conclusion no longer holds at HEAD: §30 (HEAD `:1260-1293`,
  introduced by `24a47c5`) patches the authority to distinctive values —
  `waveMinLanes 21`, `waveMaxLanes 29`, `maxLanes 47`, `roundCeiling 5`,
  `l1Alias "m_probe"` — and asserts them in both the plan summary and the
  rendered prompt ("a launcher carrying a hardcoded band cannot satisfy this
  block"). Every constant hardcode is now killed; P1/P2/P15/P19 are superseded
  for the default fixture but still locally self-referential. Two further §4
  rows are stale for the same reason: P14 (typed `USAGE` payload now pinned by
  `expectUsage`, `:255-266` + `:941-950`) and P9 (an exact message pin now
  exists at `:881`, so the 0-unique-kill tally needs re-derivation).

**Changed.** Nothing — read-only research; mutants were staged as copies under
`/tmp`.

**Unknown.** The audit's mutant tallies (43 mutants, "0 unique kills",
`abs-scope-site-removed`, `guard-message-loses-verb`, `usage-no-typed-payload`)
were not re-derived — the claims were checked only for whether the named
assertion still exists and still has the stated shape at HEAD; §5 dead-code and
§3.11/§3.12 items are out of this lane's bound.
