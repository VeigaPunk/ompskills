# 2026-10-09 — provenance pins: identity is a hash or a revision

**Asked.** What does `docs/PROVENANCE.md` pin, and how does it label itself? (lane
`ProvenancePins`, scout.)

**Observed.** `/home/vgpnk/Projects/ufo-fsd-alpha/docs/PROVENANCE.md` (365 lines;
lines 1-123 read, plus 171-195).

- **Status self-declaration first** (`:3`): *“Historical snapshot (as of
  2026-08-25/26; currency notes through 2026-09-21): point-in-time record; paths
  and statuses may be stale. See README.md for current state.”* Dated currency
  notes (`:14-26`) mark host-era paths deleted and state the remote SHA evidence
  is dated, not re-probed.
- **Identity = hash or revision, never a name.** Paper bytes: SHA-256
  `cfa8b49a62a0cf01eebab68fec2b41b1c0a39314717ec5b15ceb55c3fe6b22b6`
  (`:80`; the seven `uploads/` copies shared it, all deleted `fbfd8767`, the
  pinned bytes surviving at `research/UFO_arxiv_style_paper.pdf`). Repos: one
  **inspected commit revision** each (17 in the “Named repositories” table,
  `:90-139`) — e.g. `godspeed-core` `8b07f048…`, `charter-ufo-fsd` `2311fb75…`.
- **Godspeed byte pins** (`:134-146`): `directive.md` SHA-256
  `db88963cbdf5a0db22b460b284bf6f1d1f4abac9eaadb28bdb5e9bffe27be3bb` (repo
  revision `8b07f048…`); siblings `filter.md` `09957d08…`, `velocity.md`
  `349243f6…`. The doc distinguishes vendored bytes from the mirrored authored
  `ssot/godspeed-core/directive.md` — **hash identity is per-copy, not global**.
- **Pin drift is recorded, not hidden**: the charter tip moved `1fcdffb…`
  → `0dea104…` (2026-09-21 authenticated recheck); deleted paths (`crates/xbreed`
  `96a4b6b4`, `vendor/last-known-good/` `e47ab329`, the seven `uploads/` copies
  `fbfd8767`) are retained as history while their current absence is stated.
- **Unavailable or deliberately unverified inputs** (`:171-179`), three bullets:
  the charter-named `ufo-gdsd-fknpft` 404’d (the available `xbrd-gdsp-fknpft` was
  used; *“No behavior was invented from that unavailable name”*); full private
  clones of `ufo-kimi`/`ufo-cursor`/`ufo-codex` were not treated as a second core;
  CLI argv contracts are source-backed but **live authenticated provider calls are
  not claimed executed** — *“The local process fixture is mechanism evidence, not
  provider-quality evidence.”*
- **Conflict resolution** (`:181-193`), five ordered rules; rule 5: disputed
  L1-crown / Cursor `--mode ask` / OpenCode width claims are recorded in
  `KNOWN-GAPS.md` *“and not silently flattened.”* Closing (`:195`): *“No external
  benchmark claim or model pin was generalized into a performance claim.”*
- **The verdict sentence** (`:45-47`): *“This tracked contract is not a fresh
  native verdict or proof of entitlement, capacity, price, or the model actually
  served.”*

**Distilled discipline.** Status self-declaration first; identity = hash/revision,
never a name; pin drift recorded not hidden; unverified inputs enumerated and
evidence *type*-labelled (mechanism vs provider-quality; internal validation vs
external performance); conflicts adjudicated by ordered rules with disputes pushed
to a gap ledger; **a tracked contract is not a verdict**.

**Changed.** Nothing — read-only research.

**Unknown.** The paper’s bytes were not re-hashed and the listed revisions were not
resolved (read-only, no commands run against the substrate). `[INFERENCE]`: the
repeated “not current … proof” clauses function as a standing evidence-discipline
norm. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/ProvenancePins.md`.