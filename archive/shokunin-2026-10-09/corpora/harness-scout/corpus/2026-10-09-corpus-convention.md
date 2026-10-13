# 2026-10-09 — the corpus convention across the 8 existing corpora

Lane `CorpusConvention` (connector) · milestone r1-research · axes card-contract, legibility.
Question: what the corpus convention is, and where the existing corpora deviate.

## Observed

Populations: fleet-warden 26, host-smith 29, mission-keeper 25, route-auditor 13,
skill-scribe 26, test-smith 29, wall-watcher 25, wave-smith 32 — **205 entries, 205 index
rows**. Method: full indexes, a mechanical census over every entry, 17 sample reads, git
archaeology on one index, and the normative `.omp/skills/shokunin/SKILL.md`.

- **Index table**: the header is exactly `| entry | topic | added |` in **8/8**. Everything
  else varies: separator `| --- |` (4) vs `| ----- |` (4); entry cell plain filename (4),
  link without `.md` (2), link with `.md` (2); index H1 title in 3 styles. The `added` column
  equals the entry file's date prefix in 205/205 rows (all entries dated 2026-10-09 by design).
  Each index carries an append-only preamble; fleet-warden and wave-smith add a provenance
  paragraph (anchor source + sha256); host-smith adds post-table Seed method / Round 2 sections.
- **Filenames**: `<YYYY-MM-DD>-<slug>.md` in 205/205; slugs **205/205 kebab-case**, 0
  CamelCase/underscores. Same-day same-slug across different corpora is routine and tolerated
  (`2026-10-09-shokunin-card-contract.md` exists in 3 corpora). No intra-corpus duplicates.
- **Entry anatomy**: `SKILL.md:75-77` requires asked / observed (exact paths, symbols,
  commands, refusal codes) / changed / unknown as **content**, with no prescribed label
  vocabulary. Observed: one H1 205/205, zero frontmatter; three title families, consistent per
  corpus. Label prevalence: asked 180/205 (mission-keeper renames it `Item:` 25/25);
  observed-or-evidence 204/205; changed **69/205** (the weakest; absent corpus-wide in
  fleet-warden, host-smith, wave-smith — wave-smith substitutes `## Not carried by the source`
  31/32); unknown 158/205. The full quartet is followed corpus-wide only in route-auditor
  13/13, test-smith 29/29, wall-watcher 24/25. host-smith adds a unique
  `**Added.** <date> · lane <Name>` footer 29/29.
- **Sizes**: 1,030 – 18,422 B; per-corpus medians 1,477–3,994 B; the upper tail is entirely
  round-2 correction ledgers (wall-watcher `errata-r2.md` 18,422 is the max); research entries
  cluster 1–6 KB.
- **Append-only, as observed**: 0 entry files without rows, 0 rows without files, 0 duplicate
  rows, 0 detectable deletions across all 205. Two real deviations and one disclosed repair:
  1. **wall-watcher — provable mid-list insertion.** Seed commit `c78ca86` shipped 23 rows
     ending with `verification-smoke.md`; commit `cf1e83c` inserted the `errata-r2.md` row at
     position 23 **above** that tail. The final row order contradicts the corpus's own
     "rows in the order entries were added" rule — invisible to any snapshot check.
  2. **wave-smith — disclosed-and-repaired gap.** A bounded-verification entry existed on disk
     with no index row; the r3 run appended the missing row with a disclosure entry referencing
     it (the reference repair pattern).
  3. **Ledger-as-correction-channel** (convention, not violation): append-only survives
     falsification through appended correction ledgers; originals are never rewritten —
     observed in host-smith, test-smith, skill-scribe, wall-watcher, wave-smith.
- **Citation drift**: test-smith cites `SKILL.md` at 113 lines and skill-scribe at 115 (the
  live file is 115) — the contract itself drifted between round-1 reads.

## The convention a new corpus follows

Norm floor + strictest observed practice: kebab `<YYYY-MM-DD>-<slug>.md` entries, one per
item; header exactly `| entry | topic | added |`, one fixed cell style for the corpus's life,
`added` == the file date; one H1, no frontmatter, one title family; record
asked/observed(exact anchors)/changed/unknown with lane attribution, distilled 1–6 KB;
**entry file and index row land in the same commit; rows append at the tail only; a discovered
gap is repaired by an appended row plus a disclosure entry**; falsification by an appended
ledger, originals untouched.

## Unverified

Intra-commit row order is undecidable from git, so it is stated as undecidable, not clean.
Whether wall-watcher's insertion was deliberate is unproven (only the diff is). Label-based
compliance counts are style, not content compliance.