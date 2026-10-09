# 2026-10-09 — ephemeral `.ufo/` versus published proof

**Asked.** Why is a gitignored local artifact not published proof, and how does the
isolation root change what counts as fleet proof? (lane `EphemeralVsPublished`,
critic.)

**Observed.**

- **The two-class artifact rule.** `.gitignore:2-4` — *“Run state is ephemeral at
  ANY depth: the root-anchored `/.ufo/` alone let a nested clone's
  `ufo-fsd-alpha/.ufo/` and `.ufo/wt-*/.ufo/` scopes be committed.”* → the active
  pattern is `**/.ufo/`. `AGENTS.md:343-345` — *“Run artifacts are ephemeral:
  `.ufo/` sessions, scopes, results, and dispatch snapshots are gitignored and
  pruned at completion. No artifact piles; stale run output is laggard, not
  evidence.”* `AGENTS.md:335-336` — *“The pushed history is the auditable trail by
  itself; code in the tree is ephemeral.”* `docs/EVIDENCE-INDEX.md:11-13,47` — *“A
  local artifact path is not published proof.”* / *“All `.ufo/` paths are
  gitignored local artifacts, not published proof.”*
- **Consequence both ways**: publication status is a property of *where bytes
  live*, not of what they describe. Presence in `.ufo/` proves nothing durable
  (never published); absence disproves nothing about the run (pruning is the
  documented end state).
- **What `.ufo/` holds** (`config/the-tick.machine.json:32-39,52-54`):
  `handoffs`, `results`, `scopes` under `${REPO_ROOT}/.ufo/`, plus
  `sighting/heartbeat`. `docs/REPO-LAYOUT.md:98-99`: L0 tooling reads
  `.ufo/pending-work.json` and `.ufo/sighting/` from the **current repo**.
  Observed snapshot (host checkout, 2026-10-09): `sighting/` (manifest 52.4 KB),
  `scopes/{wave,tf-probe-band-r1}`, statusline stamps, `cache/` — with
  `pending-work.json`/`results/` absent, normal for a pruned tree.
- **Proof is location-bound.** Magga-2 isolation = a fresh clone with isolated
  `$HOME` and a dedicated tmux socket, local bare `origin` under the isolation
  root (`docs/REPO-LAYOUT.md:74-79,96-102`; isolated `$HOME`
  `/home/vgpnk/Projects/ephemeral/nc5/home`, `L2-L3-ROUTING.md:31-37`). Fleet proof
  family: `docs/SOURCES.md:11` *“fleet proof uses the isolated clone and
  `scripts/gates.sh`, not Phase-1 port trees”*; `docs/adr/001-gates-serial-parallel-boundary.md:9`
  *“the honest bar is `bash scripts/gates.sh` in the isolated clone with OMP-only
  nine-L1 fleet on tmux socket `nc5`.”* **Quote correction**: the item’s literal
  phrase “fleet proof uses the isolated clone and `bash scripts/gates.sh`, not this
  tree” does **not** occur verbatim in the substrate; cite the two real lines above.
- **Kinds do not collapse**: `docs/BEHAVIOR-MATRIX.md:208` is the third axis — a
  mock reported as “live” remains mock evidence.
- **Retention/recovery rule** (four clauses): an absent path ≠ a withdrawn claim
  (the row stays as **record**, never struck); recovery is by **pinned commit**
  (`5f52e03a`); tracked evidence trees are fenced against deletion without an
  explicit archive decision (partial fragments preserved); a file that reappears
  after loss is **provenance of the recovery event**, not fresh run evidence —
  recovered ≠ re-executed.
- **Honesty lives next to the claim**: every stale table carries a dated,
  revision-tagged footnote saying what it is *not*, instead of silently rewriting
  history.

**Changed.** Nothing — read-only research.

**Unknown.** No gate/script was run; the `.ufo/` listing is of the host checkout,
not the nc5 isolated clone (not read). Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/EphemeralVsPublished.md`.