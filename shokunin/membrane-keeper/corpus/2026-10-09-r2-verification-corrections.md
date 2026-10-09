# r2-verification-corrections — round-2 fact-check of the seeded corpus

Asked: verify every load-bearing claim in the card and the 20 seeded corpus
entries against the substrate; correct what fails. This entry corrects earlier
entries per the append-only rule — the originals stand; the truth is here.

Observed (wave r2-w1, 16 lanes; substrate HEAD 5ace2559, working tree dirty):

## Substantive corrections (claim wrong, not just the anchor)

- `seal-mechanics.md` "absent or dangling symlink reads as unsealed" — WRONG for
  JS: `membraneSealState` returns `{kind:"unreadable"}` on a non-file or
  symlinked seal (run-omp-native-trial.mjs:1803-1806), i.e. fail-closed. Only
  the **Rust** reader (`loop_driver_publish.rs:115` `is_file()`) is fail-open on
  dangling symlink/directory — probe-proven in /tmp by SealPairEntry.
- `fixture-seal-rust.md` "JS handles seal-write failure fail-closed" — true only
  for the **current** process (`finalExit=2`); the next launch gates on the seal
  file alone, so the failure is fail-open across launches in both producers.
- `charter-sign-verb.md` `invalid_seam_on_release` — no such kind exists; the
  release seam refusal kind is `invalid` (main.rs:924-928). Correct typed-kinds
  set: `non_interactive, invalid, no_seal, seal_unreadable, seal_mismatch,
  phase0_failed` (six, but not the six listed). Also `seal_unreadable` third
  site is main.rs:1054, not :1053.
- `charter-sign-verb.md` / card: `UFO_CHARTER_PHASE0_TIMEOUT_SECS` binds the
  **build/drills** stages only (main.rs:972-973); contracts uses
  `UFO_CONTRACT_SYNC_TIMEOUT_SECS` (:838, :858-860, :971).
- `charter-sign-verb.md` "CHARTER_PHASE0_STAGES is the single authority" — the
  test seam hard-codes stage keys (main.rs:937-953); only the pass rule (:1068)
  and failure report (:1086) iterate it. The source comment at :845-849
  overstates.
- `t33-stop-reasons.md` "loop_driver.rs:561-617 boundary_stop is an emission
  site" — it is not; `BoundaryStop` produces only Interrupted/HonestyBrake
  (:305-308). Emitters are native.rs:343-345 and loop_driver_dry.rs:463-465.
  Also "no T33 drill exists" is wrong —
  `mission_wall_clock_budget_brakes_before_next_round`
  (loop_driver_tests.rs:3554-3589) is exactly that drill.
- `collector-screening.md` "classes:[] silently disables all screening" — true
  for the collector in isolation (:470); the **judge rejects** an empty list
  (lib.rs:888-895), so in a launched trial it never survives.
- `collector-screening.md` "lone surrogate is the only content-reachable hard
  refusal" — overbroad; parseJson (base.mjs:390-401) and readBoundedFile's size
  die (base.mjs:356, bound :280) are also reachable.
- `collector-screening.md` `screening:null` "throws unhandled" — caught by
  base.mjs:317-321 uncaughtException → exit 2; also preempted by the judge
  (lib.rs:875-878).
- `config-validation.md` "native validator admits {note,paths,action,
  screening}" — `screening` is **required**: object (:875-878), non-empty
  version (:880-887), non-empty classes (:888-906). `note` is admitted but
  never read.
- `fixture-orchestration-surface.md` "orchestration.json was removed" —
  corrected: commits 0c190b66/b2696a13 are NOT ancestors of HEAD; the file
  never existed on main.
- `canonical-block.md` "unchanged vs HEAD" — the **membrane block** is
  unchanged; the file is not (working tree carries an uncommitted
  sighting.dispatch.swarm edit; HEAD 7efc813b…).

## Anchor corrections (claim holds, path/line wrong)

- `dry.rs`, `resume.rs`, `publish.rs`, `judge.rs` do not exist — all are
  `loop_driver_*.rs`. Affected: card :38; corpus fixture-seal-rust,
  authority-boundary-emission, flags-propagation, spec-06-distilled. Line
  numbers under the wrong names check out.
- `cli_contract.rs:2353-2589` → `:2353-2651` (the D-sign-auth block).
- `sync-ufo-contracts.mjs:1950-1995` compare loop → tighter `:1966-1995`;
  `skillTargets` decl :89-103 + copy loop :1900-1909 (entry's :52-65/:1862-1880
  wrong); `godspeedDirectiveMirrors` decl :104-114 (entry's :88-99 wrong).
- `config-validation.md` "resume.rs:253-254" → `loop_driver_resume.rs:254`.
- `main.rs:440-441` — :441 is provenance, not current_dir; anchors :440,:482.
- `run_orchestration_case` range is conformance.rs:1552-1582.
- `launcher exec anchors` for ufo-sighting: real exec is
  tower-fleet.mjs:508 via wallCli:520 (:709 only builds the path string).
- Screening regexes: not :168-186 blanket — directive_bytes check at
  screening.mjs:579-584 (needles :189-201), terminal_marker regex :179,
  check :586.
- Card "whole-file copy" for bundled/config.json: holds at HEAD-to-bundled
  modulo the sighting.dispatch drift; the working tree adds a third baseline.
  live `--check` drifted list also includes `bundled/omp-seat-routing.json`.

## Nuance corrections

- `touched-paths-validation.md` "populated at native_scores.rs:377-383" — that
  is a projection (read), not population; native bodies arrive via serde.
- `MembraneAccept.touched_paths` sorted union is fixture-only; native
  `membrane_accepts` is digest-only `Vec<String>`.
- v1 freeze also rejects `screening_flags` and `subjective_axes`, not only
  touched_paths/candidate_writes.
- spec-06-distilled "9 anchors" → spec line 9 carries ~11 anchor tokens.
- run-logic `:281` `seal_if_membrane_accepts` and `:287` are pseudocode, not
  call sites.
- `spec 06 :117-122` is silent on candidate_writes rather than asserting
  "touched_paths only" — overstatement corrected.
- "membrane_signoff has no reader" — true at runtime; two cli_contract tests
  assert the artifact (:2421, :2463).
- Seal-write JS detail omitted: stale-tmp EEXIST retry at :1856-1861; verdict
  written with exit 0 before the seal arm (:4140-4145).

## Substrate event (honesty note)

`config/ufo.json` was observed as a 13-byte stub `{"drills":{}}` at ~16:27 and
restored (11999 B, sha256 `0e416f0a…`) by ~16:30 — an external live process,
not a lane. Membrane block intact throughout; band 16–32 unchanged.
MirrorsEntry's `--check` run wrote `NODE_COMPILE_CACHE` files into the
substrate's `.ufo/cache/` (gitignored, regenerable) — disclosed in its report;
no tracked file changed.
