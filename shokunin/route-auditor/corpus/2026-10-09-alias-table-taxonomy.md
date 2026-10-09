# The `m_*` alias taxonomy

**Asked.** What is the alias table's shape, and is the "approved table is three
buckets" claim exact?

**Observed.** Live `modelRoles` has 19 keys, classifiable into four groups:

- **Approved buckets (exactly 3):** `m_strong` (l.7 `alibaba-token-plan/deepseek-v4.1-flash:max`),
  `m_mid` (l.9 `alibaba-token-plan/qwen3.8-flash:high`), `m_fast` (l.10
  `alibaba-token-plan/deepseek-v4.1-flash:max`). Note `m_strong` and `m_fast`
  share the same primary selector — they differ only in their chain.
- **Effort variants of a bucket (3):** `m_mid_med` (l.11), `m_mid_low` (l.12),
  `m_fast_high` (l.13) — chains byte-identical to their parent bucket.
- **Named lanes (9):** `m_qwen38max` (l.8), `m_luna` (l.14), `m_antigravity`
  (l.15), `m_composer` (l.16), `m_swe` (l.17), `m_k3` (l.18), `m_sol` (l.19),
  `m_glm53` (l.20), `m_grok` (l.21).
- **omp roles (4):** `smol` (l.4), `slow` (l.5), `plan` (l.6), `default` (l.22).

The claim "the approved table is three (`m_strong`, `m_mid`, `m_fast`), with
other `m_*` aliases declared as named lanes" appears verbatim in
`.omp/skills/tower/SKILL.md:40-42` and `.omp/skills/swarm/SKILL.md:147-150`;
`sighting/l1-prompt.md` carries the rule but **not** the count.

**Reading.** "Three" is the closed set of approved bucket *grades*, not a floor
and not the whole table. All 14 seats bind only inside the three; the live
table's own comments carve a nuance the docs flatten — 3 of the 12 extra `m_*`
are effort variants of a bucket, not free-standing named lanes.

**Changed.** None.

**Unknown.** Whether route preflight treats an effort variant as a family
distinct from its parent bucket (not resolved).

Evidence: lane ThreeBucketsReviewer05, LiveAliasScout01; candidate comment
`host/omp-agent.config.yml:142-144`.