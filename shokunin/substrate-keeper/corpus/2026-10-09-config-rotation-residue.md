# config-rotation-residue — how config/ufo.json is written, and the .bak residue

Asked: the `config/ufo.json.<stamp>.bak` residue, the writer code, the gate's blind spot, and the
membrane implication. Source: lane ConfigAuthorityAndBackups report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- 9 files `config/ufo.json.<UTC-stamp>.bak`, stamps 2026-10-08T19:15:32Z … 2026-10-09T01:30:57Z
  (each stamp equals its own mtime to the millisecond). All untracked (`??`), **not gitignored**,
  never committed. Whole-tree `find` shows these 9 are the only `*.bak` residue at the root level.
- Content: backup #1 sha256 `1f6b2115…` == git blob `72ab84a8:config/ufo.json`; #2-#9 all
  `7efc813b…` == HEAD `5ace2559` blob; live `ufo.json` `0e416f0a…`, uncommitted. Newest backup's
  mtime equals the live file's mtime to the nanosecond.
- `diff -u newest.bak ufo.json` → one hunk `@@ -86,12 +86,12 @@`, 3 ins/3 del: `minLanes 64→16`
  (`:89`), `waveMinLanes 32→16` (`:93`), `waveMaxLanes 100→32` (`:94`). Oldest-vs-rest diff:
  `maxConcurrentL1 32→16` (`:79`), `l1Alias m_daybreak→m_strong` (`:85`), `waveMinLanes 16→32` —
  exactly commit `5ace2559` ("sighting.dispatch: maxConcurrentL1 16, wave band 32-100, l1Alias
  m_strong (operator: ompskills tower apply)"), committed 59 s after backup #1.
- **Writer code: ABSENT** — no script/crate/bin (`*.mjs,*.js,*.sh,*.rs,*.ts,*.py`) writes the
  rotation or the `ufo.json` bytes; only test fixtures mention `config/ufo.json.bak`
  (`native_tests.rs:9367`, `proposal_tests.rs:329`) and `fleet-selfheal-verify.mjs:370,904,907`
  police stray `.bak` inside **ledger** rotation families (a different surface). No source emits the
  ISO-with-dashes stamp format. No doc describes the habit.
- Gate blind spot: `check-hand-authored-sets.mjs` reads `ufo.json` as authority but `ufo.json` is in
  no enumerated set, and `.bak` residue matches no set filter (`:90,:95`) — so the gate cannot see it
  (gate-passes claim = inference, not run).
- Membrane: `config/ufo.json` is literally in `membrane.paths` (`:32`; block `:23-49`, action
  `authority_boundary` `:38`), and the matcher is exact for wildcardless patterns
  (`proposal.rs:348-359`) — so `config/ufo.json.<stamp>.bak` does **not** intersect the membrane and
  rotation residue escapes the membrane surface entirely.

## Contract

| rule | content | anchor |
| --- | --- | --- |
| `config/ufo.json` is THE machine authority | mission configPath, targets, packages, hooks-extension, budgets, membrane list all derive from it | `check-hand-authored-sets.mjs:89,108-113,118-122`; `docs/ACCESS.md:19` |
| The gate guards sets, not the authority | `ufo.json` is in no enumerated set; `.bak` matches no filter | `:90,:95` |
| Rotation-before-write habit | every `ufo.json` write leaves a stamped `.bak` beside it | backup table (direction = inference) |
| No in-repo writer | exhaustive source search found none | report §4 |
| Band changes carry commit messages as provenance | 19:15Z edit == `5ace2559`; 01:30Z edit uncommitted | report §3 |
| `ufo.json` is an operator-owned sense | touching it ⇒ `authority_boundary`; unseal only via TTY `ufo charter sign` + Phase 0 re-pass | `config/ufo.json:24,32,38`; `AGENTS.md:66-71` |
| Stray `.bak` is policed — but only in ledger rotation families | `rotation_no_stray_segments` asserts zero extras | `fleet-selfheal-verify.mjs:370,904,907` |
| Band values are read-time validated, not pinned | shape/positivity checks with defaults; no test pins repo band values | `ufo-swarm-wave.mjs:781-803` |

Divergence observed: `scripts/ufo-stale-watchdog.test.mjs:306` comments "The repo declares
waveMinLanes 16 / waveMaxLanes 100" — true of neither HEAD (32/100) nor live (16/32).

## Not carried by the source

- No code, script, hook, or documented convention writes `config/ufo.json` or performs the stamped
  rotation — the mechanism lives outside the substrate (writer identity unobserved).
- No retention/cleanup/gate for the residue; no authority test pins the band values themselves;
  `config/orchestration.json` (the fixture membrane surface named in the note) is absent from the tree.
- No commit, charter-sign, or Phase 0 record for the 01:30:57Z live edit — it exists only as
  uncommitted bytes plus the newest backup.

## Unknowns

- Identity of the writing process (editor backup-on-save, external CLI, or agent tool).
- Whether the seven same-content rotations (19:59Z–01:14Z) were idempotent rewrites or no-op saves
  (byte-identical backups cannot distinguish them).
- Whether an `authority_boundary` seal was raised/signed for the 01:30Z edit; whether the untracked,
  un-ignored residue is deliberate operator tolerance or unnoticed litter.