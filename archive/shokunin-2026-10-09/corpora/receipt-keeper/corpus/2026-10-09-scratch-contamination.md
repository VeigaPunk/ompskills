# scratch/: the fleet dir's largest unlisted artifact

## Asked

Census every artifact under `.tower/fleets/` that the card's artifact table
did not name (UncataloguedArtifacts lane, r2).

## Observed

`shokunin3/scratch/` dwarfs every other state-dir artifact and was uncatalogued:

- **6124 files, ~505 MB**, created by `comms-keeper` and `nightcall-keeper`
  L1s (their own `mkdir`s; the `drill` subtree was populated by lanes under
  L1 instruction). Contains zero `fleet.json`/`spec.json`/registry files —
  it is working space, not fleet state.
- **Hazard:** 68 copies of `config/ufo.json` inside scratch; at least one
  (`drill-keeper`'s `DrillKeeperSmoke` copy) is **byte-identical to the live
  band authority** (`0e416f0a`). A validator run pointed at a scratch root by
  mistake would read a plausible-but-wrong band; a write through one of them
  (symlink or wrong cwd) lands who-knows-where — see
  `2026-10-09-band-config-clobber.md`.
- 44 `.ufo/scopes/` dirs, 54 `fleet-ledger.jsonl` files, 8 symlinks inside
  scratch (symlink targets not all read; secret content UNCHECKABLE —
  counted, not opened).

Other uncatalogued artifacts (card table now notes these classes):

- `lanes-haiku.yml` — operator overlay file (pre-launch mtime 15:33:48);
  all 10 shokunin3 missions list it in spec `overlays` (dirty launcher).
- `policy/`, `ufo-fixture/`, `specs/`, `tf-audit-docs/`, `.ufo/scopes/`
  directories at fleet roots.
- Fleet-root `wave-r{1,2}-spec.json`, `payload-*.json`, `*.sh`
  (`lane-05-driver.sh` — writer is a name-matched toolCall only),
  `*.registry.snapshot.json` (a hand `cp` by nightcall-keeper).
- `waves/` entries beyond the canonical trio: `.dispatch.json` (5 waves),
  `.plan.json`, `.assignments.json`, `*.taskcall.json`,
  `*.dispatch-result.json`, `*.plan.err`/`*.dispatch.err`.

## Changed

Card artifact table scope noted; `wave-artifact-zoo` corrections logged in
`2026-10-09-r2-corrections-ledger.md`.

## Unknowns

- Exact write toolCall for `tower1/reports/tf-audit-routing/lane-05-driver.sh`
  and root `wave-r{1,2}-spec.json`.
- Who wrote `lanes-haiku.yml` ([INFERENCE] operator: pre-launch mtime,
  header).
- Secret content of scratch config dumps (not read — counts only).
