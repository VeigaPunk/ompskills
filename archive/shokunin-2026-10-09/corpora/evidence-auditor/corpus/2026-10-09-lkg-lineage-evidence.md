# 2026-10-09 — last-known-good lineage is provenance, not a verdict

**Asked.** What does an LKG tag record, and what is the authorization rule? (lane
`LkgLineageEvidence`, scout.)

**Observed.** `docs/LKG-SOURCES.md` (whole, 115 lines) and
`docs/EVIDENCE-INDEX.md` (block at `:188-197`, recovery rule `:199-229`;
**line-range correction**: the item placed the block at `:100-170`; in current
bytes it is at `:188-197`).

**LKG row** (`EVIDENCE-INDEX.md:190-192`, verbatim): *“`lkg-lineage.json`: tags
`kimi-validated-local-landing`→`3fe03f5a`, `lkg`→`ec6d85bf`, lineage to
`5f52e03a`; source/tag provenance only, not a fresh runtime verdict.”* It records a
tag→commit map plus an ancestry link — and **no runtime result**. Full SHAs one
document over (`docs/PROVENANCE.md:48-51`): `3fe03f5a340f177009ecb1b0b95cf35ffa7f4b7b`
and `ec6d85bfa5578f35971588cfcd73523335a2163b`, both *“historical baseline
evidence, not current green or runtime proof.”*

**Lineage chain** (`:190-191`): `kimi-validated-local-landing → 3fe03f5a`;
`lkg → ec6d85bf`; `lineage → 5f52e03a`. The terminal link is separately hedged
(`:199-205`): `5f52e03a` (`5f52e03a9f765476b63d2f2f54e29b72f22b6359`) is the
ten-deletion comparison commit — *“This commit is a comparison base, **not an
independently verified last-known-good**.”* The same commit is the recovery read
path (`:44-45`) — retrieval capability, not verification.

Adjacent rows draw the same line: `kimi-launch-contract.json` “config validated,
**`observed_native_execution: false`**”; `pre-hold-*` “superseded”; runtime status
snapshots “historical, not current”.

**The authorization rule** (`EVIDENCE-INDEX.md:226-229`, verbatim): *“Historical
blockers and old route names are retained as history. Current eligibility,
dispatch permission, and judgment come only from the canonical contract and actual
run evidence; local helper availability is not authorization to launch a model,
worker, or mission.”* Two moves: retained history is history, not a permission
surface; authority flows only from the canonical contract **plus actual run
evidence** — a helper being on `PATH` confers no dispatch right.

**Observed artifact absence.** `find /home/vgpnk/Projects -name lkg-lineage.json`
→ no result; never referenced in the local git index. `git tag` in the substrate
lists only `frontier_push`, `current_art`; `git cat-file -t` on `3fe03f5a`,
`ec6d85bf`, `5f52e03a`, `96a4b6b4`, `e47ab329` → all “Not a valid object name”.
The doc row is the only in-tree description of the tags.

**Every distinct “provenance, not proof” phrasing** across the two files (31
lines; 14 in LKG-SOURCES, 18+ in EVIDENCE-INDEX) classes into seven: provenance-only
(“source/tag provenance only”, “dated port provenance”, “historical baseline
evidence”); not-proof (“not published proof”, “not verification evidence”, “not
standing guarantees”, “not native execution proof”, “not current green or runtime
proof”); unverified/unfresh (“not a fresh runtime verdict”, “not re-verified”,
“not independently re-exercised”); not-current (“historical, not current”,
“superseded”, “may be stale”); not-authorization (“local helper availability is
not authorization”); not-a-verdict (“handwritten policy projection, not a
verdict”); artifact-class stays itself (“a mock reported as ‘live’ remains mock
evidence”, “No tip-byte invention”).

**Changed.** Nothing — read-only research.

**Unknown.** Upstream tag existence (network forbidden); `lkg-lineage.json`
contents (absent). `[INFERENCE]`: the tags live in the host/OMP reference repo,
not this worktree. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/LkgLineageEvidence.md`.