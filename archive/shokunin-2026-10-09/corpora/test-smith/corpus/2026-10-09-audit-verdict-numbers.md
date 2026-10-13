# 2026-10-09 — the tf-audit-tests verdict and headline numbers

**Asked.** What is the verdict and headline numbers of `reports/tf-audit-tests.md`
§0-§2, do they reproduce, and how stale are they against HEAD? (Lane
`AuditVerdict`, reviewer.)

**Observed.** Source: `reports/tf-audit-tests.md` §0-§2 (lines 1-90), cross-read
with §5/§6/§8/§9; revision pins reproduced via `git show 8e48b75:<path>`.

- Verdict: **GAP** (`:12-14`) — the suite was green (`ALL CHECKS PASS`, exit 0)
  and pinned the `plan` verb's argument construction plus a handful of
  spec-validation refusals, but asserted nothing about state-changing
  behaviour: `launch --apply`, `close --apply`, and `status` never executed.
- Acceptance criteria: 74 total — 15 PASS, 2 PASS-elsewhere, 24 WEAK, 33 GAP
  (`:18-21`, matrix `:65-70`). Row sums 42+19+13=74, columns 8+4+3=15,
  0+0+2=2, 12+9+3=24, 22+6+5=33 all hold.
- Typed codes: 18 emittable (16 via `typed("…")` + `USAGE` + `UNEXPECTED_ERROR`;
  `LAUNCH_FAILED` is a record code, never thrown, `impl:546`), 4 asserted
  (`INVALID_SPEC`, `L1_CEILING_EXCEEDED`, `SCOPE_OVERLAP`,
  `MUTATION_REQUIRES_APPLY`); `USAGE` asserted only as exit 64 (`T:287-289`).
- Inventory: 30 symbols (11 never entered, 2 entered but unasserted); 104
  branch rows (17 covered, 8 dead, 79 gap; 17+8+79=104).
- Mutation probe: 43 mutants + 1 test-refactor → 17 killed / 26 survived
  (`:25`; §6:201 records the round-2 correction "43/17/26, not 42/25/17").
- Round-2 lanes: 18 total — 3 PASS, 9 FAIL, 6 GAP; all 9 FAILs are
  citation/receipt defects, no behavioural claim falsified; "22 additions"
  claimed (`:26`) — **not derivable**: §9's per-lane annotations sum to 43,
  the spine's `[+]` marks total 24 (finding F1).
- Suite shape at pin: 294 lines, 8 sections, 30 standalone `check(` sites + 9
  `expectTyped(` sites, ≈73 assertions (the audit's own estimate, not
  reproduced).
- Three criteria with no implementation at the pinned revision: relaunch
  idempotent for pane and prompt (worktree reused `impl:507-509`, prompt
  rewritten unconditionally `impl:533`, no pane-reuse branch — `paneId` sites
  502/554/555/588/619/625/631/632, none pre-launch); `status` reconciles the
  wall against `fleet.json` vice versa (`"fleet.json"` built only at
  `impl:560`; no `readFileSync`/`JSON.parse` site reads it); `close` refuses a
  live pane unless `--force` (`grep -c '\bforce\b'` → 0; `close --apply
  --force` → exit 64 `USAGE "unknown argument --force"`).
- Revision pins (`:8`): launcher md5 `d365090b3df0db67beb4d25da31b8c70`, suite
  md5 `d6b8c8fe7ed298bf8320ba36ae502c82`, round-2 re-derivation at HEAD
  `8e48b75`. Both digests reproduce via `git show 8e48b75:<path> | md5sum`.
- Growth caveat: every §0-§2 number is pinned to `8e48b75` and is stale against
  HEAD `b251c5a`. Measured now: suite 294 → **1685 lines, 8 → 37 numbered
  sections** (249 `check(` lines, 58 `expectTyped(` lines); launcher 741 →
  **1306 lines** with 18 distinct `typed("…")` literals (added `PANE_LIVE`,
  `STATE_DIR_UNAVAILABLE`, `WALL_ABSENT`); asserted-code census now includes
  `CONFIG_UNREADABLE`, `PANE_CEILING_EXCEEDED`, `UNKNOWN_MISSION`, `USAGE` (not
  4). **All three "no implementation" criteria are implemented at HEAD** (pane
  reuse `:764`/`:776`; `fleet.json` read + both-direction reconciliation
  `:1103/:1113/:1131`; `close` `PANE_LIVE` unless `--force` `:1169-1173`,
  `grep -c '\bforce\b'` → 13). The sibling branch `tower/tower1/tf-tests` @
  `24a47c5` is now in HEAD's ancestry (`git log 8e48b75..HEAD`).
- Handling rules (§1): the lane corpus is not frozen — cite anchor text, not
  line numbers; where a lane report and the audit disagree on a line number,
  the audit is the round-2-verified value; `.tower/fleets/tower1/spec.json`
  was reordered after round 1.

**Changed.** Nothing — read-only research.

**Unknown.** §3's per-item census, §4's incidental-pin list, §5's dead-claim
enumeration, §7's recommendations, and the 40-lane corpus were not re-verified;
whether the 74 criteria are the right extraction rests on the A/B/C
decomposition (no acceptance document exists); the non-execution claim is
static (absence-of-citation receipts), not runtime fact.
