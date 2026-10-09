# 2026-10-09 — corpus conventions (index + entry shape)

**Asked.** Extract corpus conventions from `shokunin/*/corpus/`.
**Sources.** all 8 `shokunin/*/corpus/index.md`; a marker census over all 170 entry files (8 read in full); `.omp/skills/shokunin/SKILL.md:31-36,60-79,83-101`.
**Observed.**
- Index table columns are universal: `| entry | topic | added |` (8/8); `added` is always `YYYY-MM-DD`.
- Index title: modal `# <name> corpus — index` (6/8); drift: mission-keeper omits ` — index`, route-auditor uses `# route-auditor — corpus index`.
- Ordering: append order = research/round order in 8/8 (never alphabetical/topic-sorted); all indexes state append-only, never reorder/delete. Row cell is a bare filename (4/8) or a markdown link (4/8) — both accepted.
- Entry filename: rigid `<YYYY-MM-DD>-<slug>.md` — 170/170 conform, 0 exceptions (SKILL.md:34).
- Entry shape is a family, not one schema: an asked-statement is universal, an unknowns section near-universal, and an evidence/source anchor universal in intent. Modal family (A): `# YYYY-MM-DD — <title>` then **Asked.** / **Sources.** / **Observed.** / **Changed.** / **Unknown.** (test-smith, wall-watcher, host-smith, route-auditor, skill-scribe). Family (B, fleet-warden/wave-smith): `Asked: / Source: /` bullets `/ Evidence: <lane>`. Family (C, mission-keeper): `Item/Observed/Evidence/Unknowns`.
- No corpus carries a README, template file, subdir, or gitignore — do not create one.
**Changed.** Seed entry; the worktree-keeper corpus uses family A.
**Unknown.** Same-day slug-collision rule (none observed; every entry shares 2026-10-09); whether `added` is local or UTC; whether entries must be committed at seed time or appended later.

**Lane.** CorpusConvention (scout). Report: `reports/worktree-keeper/CorpusConvention.md`.
