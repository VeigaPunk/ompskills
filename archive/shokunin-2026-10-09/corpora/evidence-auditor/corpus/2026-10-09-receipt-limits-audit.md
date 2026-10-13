# 2026-10-09 — honest-limits audit of the 31 shokunin round receipts

**Asked.** Audit every round receipt under `.tower/fleets/shokunin*/rounds` for
honesty: flag any receipt whose 'not verified' / 'honest limits' content is
missing, or that claims verification without naming limits. Cite receipt paths.

**Observed.** All **31 receipts read in full** (15 in `.tower/fleets/shokunin/rounds/`,
16 in `.tower/fleets/shokunin2/rounds/`; 3,501 lines total per `wc -l`).
Screening note: `grep` over the rounds dirs returns nothing until `gitignore` is
disabled — `.tower/` is gitignored, so the keyword map only appeared with
`gitignore:false` (and `case:true` hides capitalized "Honest"/"Not" headings).

**Rule applied (consistent across all 31).** PASS if the receipt names at least
one specific residual limit — an unverified / unknown / untested / unverifiable /
not-yet-discharged surface of its own claims or deliverable guarantees — in any
wording, any section (content slots bind, headings do not;
`2026-10-09-round-receipt-convention.md`). FLAG if the only limit-adjacent
content is (i) a future-work plan ("round 2 will verify/falsify"), (ii) a proposal
for another artifact, (iii) a disclosed process incident/deviation, or (iv) a
drift finding presented as fact. This is a **convention-only check** — nothing
machine-reads receipt claims (`2026-10-09-receipt-honesty-enforcement.md`); claim
*accuracy* was out of scope (second-order drifts already live in
`2026-10-09-honesty-claims-audit.md`).

**Verdict: 28/31 carry the slot; 3 are missing it.**

- **FLAG — `.tower/fleets/shokunin/rounds/mission-keeper-r1.md`.** Sections only:
  Axis set:8 · WWKD plan:20 · Wave plan:33 · Lane outcomes:56 · Accepted moves:77 ·
  Rejected moves:97 · Evidence (observed, not claimed):110 · Decision:123. The
  Evidence section is positive-only; the Decision:125-127 ("the natural round-2
  axes are the verification of what just landed") is a plan, not a limit. The
  AUD-10 payload deviation (:51) and the self-removed substrate write (:119) are
  disclosures, not limits on its own claims. No statement anywhere names what this
  round did not verify.
- **FLAG — `.tower/fleets/shokunin/rounds/test-smith-r1.md`.** "Verification
  (dispatch-behavior)":83 claims positives only (discovery, suite re-run
  CONFIRMED, containment). Continue decision:120-124 has one general sentence —
  "nothing has yet adversarially checked the distilled entries or the card against
  the sources at the deliverable level" — but names no specific unverified claim;
  the two "recorded but not integrated" items (:101-108) are proposals for other
  artifacts (wave-context phrasing, a test-file sentinel).
- **FLAG — `.tower/fleets/shokunin2/rounds/godspeed-keeper-r1.md`.** "Verification
  duty":70 is bounded to one dispatch ("entry holds, not falsified"). Continue
  decision:89-94 ("saturated nothing … ~40 precise numeric/hash/anchor claims
  that are exactly the class of claim that drifts … Round 2 will falsify the
  card's claims claim-by-claim") names drift-proneness and future work; the
  recorded D1–D5 divergences (:63-67) are facts about other artifacts. No specific
  unverified surface of round 1 is named.

**The 28 that pass** — 15 with a dedicated section, 13 carrying the slot inline:

- Dedicated: `fleet-warden-r1.md:72` (`## Honest status`) · `fleet-warden-r2.md:100`
  (`## Honest status`) · `host-smith-r1.md:93` (`## Not verified`) ·
  `host-smith-r2.md:93` (`## Disclosures (ambient, honest)`) + `:102` (`## Not
  verified`) · `route-auditor-r1.md:128` (`## What was NOT verified`) ·
  `wave-smith-r1.md:70` + `wave-smith-r2.md:61` (`## Not verified (honest
  limits)`) · `evidence-auditor-r1.md:137` + `evidence-auditor-r2.md:105`
  (`## Honest limits (not verified)`) · `harness-scout-r1.md:115` +
  `harness-scout-r2.md:112` (`## Honest limits`) · `ledger-keeper-r1.md:75` +
  `ledger-keeper-r2.md:86` (`## Not verified (honest limits)`) ·
  `substrate-keeper-r1.md:72` + `substrate-keeper-r2.md:69` (`## Not verified
  (honest limits)`).
- Inline: `mission-keeper-r2.md:61` (`**Residual, unverified.**` ×2) ·
  `skill-scribe-r1.md:126-129` ("Scope of the claim … was not observed … recorded
  as remaining unknowns") · `skill-scribe-r2.md:113-114` (Honest assessment:
  "not fully accurate … two unobservable facts") · `test-smith-r2.md:81-83`
  (G-3/G-4/G-5 "inherent limits of a card contract" — the weakest pass: named
  limits of the deliverable's own guarantees, plus the concurrent-modification
  caveat at :104-105) · `wall-watcher-r1.md:112-116` ("What was **not**
  verified:") · `wall-watcher-r2.md:113` + `:118` (`## Residual risks left for
  the operator`) · `isolation-keeper-r1.md:86,95,97` (UNVERIFIABLE runtime
  behavior; untested force arm :48; "R4 is not claimed") · `isolation-keeper-r2.md:98-100`
  (remaining unknowns named) · `safety-warden-r1.md:108-110` (five named unknowns
  + undischarged verify-by-dispatch) · `safety-warden-r2.md:126-132` (hardlink
  leaf, swap race, bind mounts) · `godspeed-keeper-r2.md:82-84` (three recorded
  unknowns) · `worktree-keeper-r1.md:126-127` (step-4 duty "not yet discharged";
  lane self-assessment is "telemetry, not an accept" :100-102) ·
  `worktree-keeper-r2.md` final § ("What remains unverified is named in the
  corpus: …").

**Pattern.** All 3 flags are **round-1 research receipts** whose missions later
grew the slot (mission-keeper-r2 :61, test-smith-r2 :81-83, godspeed-keeper-r2
:82-84). Receipts that discharge step-4 dispatch in round 1 without also naming
their unverified surface are exactly the ones that skip the slot; every round-2
receipt in the corpus carries it. Prior-entry delta: `2026-10-09-honesty-claims-audit.md`
said "Honest limits — all 15 disclose them" for the 15 shokunin receipts; at slot
strictness (a specific named surface, not a forward-looking plan) two of those 15
(mission-keeper-r1, test-smith-r1) do not — recorded here as a stricter
re-reading, not a contradiction of its claim-backing findings.

**Changed.** Nothing — read-only audit. This entry + one index row.

**Unknown.** Receipt intent is judged from the written text only; no L1 was asked
whether the omissions were deliberate. The three flagged missions' round-2
receipts were read but their r1 receipts' slots were not re-checked against lane
reports. The `.tower/` gitignore behavior of `grep` was observed, not its cause
in tool internals.
