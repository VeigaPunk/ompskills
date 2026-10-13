# 2026-10-09 — revision pins and how a report goes stale

**Asked.** What do the audit reports pin, and how does a pin become stale?
(lane `AuditPinStaleness`, critic. Overlaps `ProvenancePins` only in method — the
sources differ: this item covers the two tower1 audit reports.)

**Observed.** Pins:

- `tf-audit-docs.md`: base `main @ 3dee568` (`:3`) — a commit pin for its 11-file
  feature set, **no content hash of its own audited files**; truncated sha256
  prefixes `dc31bdb2…`/`798b3fb2…` (`:79`, 32-bit, not uniquely resolvable); a
  bare `HEAD` with `git show HEAD:config/ufo.json` (`:45,122,154`) — **unpinned**
  and a *different repo* (the substrate).
- `tf-audit-tests.md`: md5 content pins + revision — `sighting/tower-fleet.mjs`
  `d365090b…`, `test/tower-fleet.test.mjs` `d6b8c8fe…`, re-derived at HEAD
  `8e48b75` (`:8`); `3dee568` merge-base and `24a47c5` sibling tip (`:149,:242`).

**Reachability (this lane, in the worktree).** `git cat-file -t` → all three of
`3dee568`, `8e48b75`, `24a47c5` are commits and all are ancestors of HEAD
(`87c351a`). The byte pins reproduce exactly:
`git show 8e48b75:sighting/tower-fleet.mjs | md5sum` → `d365090b3df0db67beb4d25da31b8c70`;
`git show 8e48b75:test/tower-fleet.test.mjs | md5sum` → `d6b8c8fe7ed298bf8320ba36ae502c82`.
Drift since the pins: 94 commits past `8e48b75`, 95 past `3dee568`; the launcher
grew 741→1306 lines, the suite 294→1685 lines.

**Adversarial counterexamples.**

1. `tf-audit-tests.md:149` (and `:242`): “sibling `tower/tower1/tf-tests @
   24a47c5` is an **unlanded** 1617-line rewrite, *neither ancestor nor descendant
   of `8e48b75`*.” **Holds at the pin, falsified at HEAD**:
   `git merge-base --is-ancestor 24a47c5 HEAD` → true (exit 0); merge commit
   `1b9d8b2` “Merge tower/tower1/tf-launcher”; `git log --oneline --reverse
   8e48b75..HEAD -- test/tower-fleet.test.mjs` first entry is `24a47c5` (so it was
   not an ancestor of `8e48b75`, matching the pin-time claim). The 1617-line
   rewrite was merged and has since grown to 1685.
2. `tf-audit-tests.md:147` (item 30): “the doc has 0 references to
   `tower-fleet`.” `grep -c` on `test/sighting-wave-smoke.md` = 0 at `3dee568`
   and `8e48b75`, but **20 at HEAD** (7 to `tower-fleet.test`). True at the pin,
   false now.

**Rule implied.** A report is evidence about **its pinned revision, not HEAD**.
A pin is `(repo, immutable object id, path set)`; content-addressed md5/commit
pins stay reconstructible via `git cat-file -t` / `git show <pin>:<path>` while
line-number citations rot. Keep three verdicts distinct: **stale citation**
(the anchor moved), **false claim** (never true at the pin), **stale claim** (true
at the pin, superseded since). Staleness is **per claim, not per report** — e.g.
`host/omp-agent.config.yml` `28e3152a` and `test/evidence/.gitignore` `216dea4f`
are byte-identical at HEAD.

**Changed.** Nothing — read-only research.

**Unknown.** The truncated sha256 pins and the `sync-global-routing --check`
exit-1 claim were not re-run (substrate); individual lane reports were not opened
(counts only: 32 for tf-audit-docs, 40 for tf-audit-tests). Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/AuditPinStaleness.md`.