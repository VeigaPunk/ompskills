# pkg-opencode — packages/opencode

Asked: inventory + role of packages/opencode.
Source: lane OpencodePkg (`reports/adapters-keeper/OpencodePkg.md`).

## Observed

- 10 tracked files, zero authored: skills/ufo (6) + skills/wwkd (2) + ssot directive +
  ufo-skill-scope.json. Byte-identical to canonical.
- Sync wiring: skillTargets.opencode (:97), cliFamilyScopes.opencode (:178-183),
  dep-closure (:806-824), copy loop (:1899-1909), sweep (:286-298). No "opencode"
  string in root package.json.
- Runtime reads: opencode ephemeral launch reads **canonical** skills/ufo + agents/
  via config/ephemeral-l1.machine.json + scripts/prepare-ephemeral-l1.mjs:467-535 —
  **not** the packaged tree. The packaged tree is read only by
  crates/ufo-cli/src/main.rs:689 (contract readiness) and seat-skills digest check.
- Matrix role: substrates[] + targets entries (ufo.json:333-337,366-369);
  native surface is substrates/opencode. `opencode-go` is a fallback hop only;
  L3 rejects opencode routes (l3_swarm.rs:464-470).

## Reported wrinkles

- ssot filter.md/velocity.md differ from skills/ufo/references/godspeed-core copies;
  packaged copies match the skill-tree versions, not ssot — the authoritative copy is
  undetermined (directive.md is the only pinned ssot mirror).
- `docs/charter-named-clis.json:59-61` names `packages/substrate-opencode` — stale,
  doesn't exist.

## Contract

The packaged opencode tree is a readiness/contract artifact; live opencode seats get
posture from canonical sources at ephemeral-prep time.

## Unknowns

- `sync --check` not re-run by the lane (bash fnm wrapper failed, exit 127) —
  SyncMirror lane covered it at the same anchor.
