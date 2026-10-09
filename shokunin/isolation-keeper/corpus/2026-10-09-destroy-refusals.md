# destroy-refusals — `readValidatedMarker` check order and messages

Asked: enumerate every destroy refusal and its order. Source:
`scripts/prepare-ephemeral-l1.mjs:756-812`; `tests/prepare-ephemeral-l1.test.js:
946-1272`. Lane `DestroyRefusals` (sentinel).

`destroyEphemeralL1` → `readValidatedMarker` (756-812) is a straight-line chain;
**no write happens before the return** (mutation starts at :891). Order:

1. configured root realpath + owner-private (:757-758);
2. target is exactly one direct child (:760);
3. target not a symlink, owner-private, canonical (:762-764);
4. marker `lstat` (:766) — missing → **raw ENOENT**, not a contract message;
5. marker not a symlink, owner-private, ≤ byte bound (:767-772);
6. `JSON.parse` + `plainObject` (:773);
7. `exactKeys` — the 10-field set (:774-777);
8. schema + root → `destroy marker does not own this root` (:778);
9. `beneath` on clone/isolationRoot/envFile → `destroy marker contains an
   escaping path` (:779-781);
10. layout equality → `destroy marker paths do not match the prepared layout`
    (:784-787);
11. clone + isolation root not symlink, owner-private, canonical (:789-793);
12. envFile not symlink, owner-private (:795-797);
13. provenance hex (`sourceHead ^[a-f0-9]{40,64}$`, `snapshotDigest
    ^[a-f0-9]{64}$`) (:798-800);
14. clone `.git` is a **directory, not a symlink** (:801-802) — kills a
    worktree-style `.git` file;
15. `activePids` array of positive safe integers (:803-804);
16. state `active` **or** any non-empty pids → `refusing to destroy an active
    ephemeral root` (:806);
17. state `registered` → `refusing to destroy a registered ephemeral root`
    (:809);
18. any other state outside `prepared|finished` → `destroy marker state is
    unknown` (:810).

Tie-breakers proven by probe: pid-list validity fires before the state refusal
(803 < 806); non-empty `activePids` fires the "active" message even when state
is `registered` (806 < 809); root identity shadows escaping-path shadows layout
equality; all layout/ownership checks precede any lifecycle verdict.

Only `{prepared, finished}` with empty `activePids` returns. `readValidatedMarker`
is module-private; `destroyEphemeralL1` is entered via the CLI `destroy`
passthrough or a library import. `ufo-sighting.mjs` has **zero** references to
destroy — it only transitions the marker.

## Unknowns

- Raw error text for a nonexistent configured root; real trigger for the
  `is not canonical` checks (TOCTOU-only given the direct-child check).