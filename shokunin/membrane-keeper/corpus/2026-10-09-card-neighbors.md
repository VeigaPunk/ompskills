# card-neighbors — membrane-keeper's boundary vs sibling shokunin

Asked: domain split vs safety-warden, godspeed-keeper, substrate-keeper,
host-smith, wave-smith; card frontmatter + corpus conventions.

Observed (wave r1-w1 lane CardNeighbors, ompskills worktree):

- Verdict: the membrane domain (policy list, enforcement chain, seal,
  charter sign, screening) is **disjoint by domain** from all five neighbors;
  path-level overlaps exist and are named, not shared.
- `safety-warden` — owns launcher write-root/symlink confinement +
  substrate-write ban. Path-level: membrane lists `scripts/ufo-sighting*`
  which the launcher execs (tower-fleet.mjs:491,520,709 — 0 membrane refs);
  the seal `.ufo/membrane-seal.json` is written by substrate binaries outside
  launcher guards. Split: theirs = where a write may land; ours = which paths
  are senses and what a touch triggers.
- `host-smith` — GENUINE overlap: `apply.mjs:938` `writeAtomic(ufoJsonPath)`
  rewrites membrane-listed `config/ufo.json` with 0 membrane refs and 0
  realpath calls — a host `--apply` changes a sense with no seal/charter.
  Also `host-smith.md:43` claims the target carries `sighting.wall`; source
  has 0 wall refs (asserts only `sighting.dispatch` :922-936).
- `godspeed-keeper` — membrane lists `ssot/godspeed-core/directive.md`;
  screening classes `directive_bytes`/`terminal_marker` live in
  screening.mjs:26-30,168-186. Split: theirs = posture bytes + injection;
  ours = what happens when a touch lands.
- `substrate-keeper` — ownership only: their card (:96-98) names
  `config/ufo.json` as a membrane sense; they own where the block lives in
  the layout, we own the enforcement chain. Their corpus entry
  `shokunin/substrate-keeper/corpus/2026-10-09-membrane-and-screening.md`
  predates this corpus.
- `wave-smith` — none on the write side; read-only overlap: the band is read
  from `config/ufo.json` (a membrane-listed file — fittingly, the band
  authority is itself a sense).
- Card conventions (16 cards): `name`, `description`, `tools` always present;
  `model`/`spawns`/`ufo` never present in ompskills cards; tools comma-listed
  in 15/16. Corpus: `shokunin/<name>/corpus/index.md` with
  `| entry | topic | added |` rows; entries `# <slug> — <title>`, Asked:/
  Observed/Unknowns sections, `<YYYY-MM-DD>-<slug>.md` filenames; row style
  (linked vs unlinked) is not normalized.
- Live state: `.ufo/membrane-seal.json` absent on the substrate.
