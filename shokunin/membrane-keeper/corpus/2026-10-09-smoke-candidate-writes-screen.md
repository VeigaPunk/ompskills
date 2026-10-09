# smoke-candidate-writes-screen — a screen fired by candidate_writes alone

Asked (verification dispatch, bounded smoke of this card): an admitted
proposal declares `touched_paths: ["scripts/ufo-swarm-wave.mjs"]` and
`candidate_writes: [{path: "scripts/sync-ufo-contracts.mjs", ...}]` — does
the membrane screen fire, for which field, and why; what follows; which
config each producer reads.

Observed (substrate /home/vgpnk/Projects/ufo-fsd-alpha, read-only):

- Screen fires on `candidate_writes`, NOT `touched_paths`. Canonical list
  `config/ufo.json:25-37` (sha256 `0e416f0a…` re-confirmed):
  - `scripts/ufo-swarm-wave.mjs` matches nothing — `scripts/ufo-sighting*`
    (:31) prefix `scripts/ufo-sighting` is not a prefix of it, and no other
    pattern's stem covers `scripts/ufo-…`.
  - `scripts/sync-ufo-contracts.mjs` hits pattern :29 EXACTLY — a `*`-free
    pattern takes the `None => pattern == path` arm of
    `membrane_path_matches` (proposal.rs:354-359, first-`*` split →
    `starts_with` prefix; exact otherwise).
- Both producers screen the union `touched_paths ∪ write_paths`:
  native.rs:320-329 (`.chain(...)` over survivor seats only, gated on
  `GateDecision::Admit` :317); fixture loop_driver_judge.rs:424-437
  (BTreeSet union). The config note (:24) and spec 06 say `touched_paths`
  only — under-stated; candidate_writes alone triggers.
- Consequence (native): `loop_stop` overridden to
  `LoopOutcome::AuthorityBoundary` at native.rs:343-345; verdict field
  `NativeHandoffVerdict.loop_stop` lib.rs:630 + `membrane_accepts`
  Vec<String> of bare artifact digests (:642-643, pushed native.rs:338).
- Seal: native emits no seal inside crates/. The JS launcher writes
  `.ufo/membrane-seal.json` (`MEMBRANE_SEAL_PATH` :1788) via
  `writeMembraneSeal` :1831-1863, fired by the verdict arm :4151-4160
  (`loop_stop === "authority_boundary"` → `membrane_accepts` →
  `accept_digests`). Rust fixture twin at loop_driver_dry.rs:703-705 →
  publish.rs:94-108. Standing seal refuses fresh dispatch at :3336-3341.
- Unseal verb: `ufo charter sign <runId>` — `charter_sign` main.rs:989-1109,
  TTY gate first (:990-995, `non_interactive` exit 2), Phase 0
  `contracts, build, drills`, seal removed at :1099-1104.
- Config split: native judge reads `config/ufo.json` —
  `validate_native_membrane(&root_json)` called at lib.rs:979, validator
  :840-908 (admits {note,paths,action,screening} :851). Fixture loop reads
  `config/orchestration.json` via `load_config` loop_driver.rs:506-516;
  `is_file` gate :508 → absent file = `OrchestrationConfig::default()`,
  membrane `None`. `test -e` on the substrate exits 1 — file absent, so the
  fixture membrane is inert there today.

Changed: nothing on the substrate; this entry + index row only.

Confidence: high — every anchor re-read this session, not restated from
memory. Remaining unknowns: none new for this question.
