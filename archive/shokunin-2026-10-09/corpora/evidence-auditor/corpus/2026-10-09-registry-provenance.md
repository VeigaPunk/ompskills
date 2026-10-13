# 2026-10-09 — the registry as membership provenance

**Asked.** What does the wave registry record, and why can a later wave resume
only a member whose handle is recorded? (lane `RegistryRecordProvenance`,
reviewer.)

**Observed.** Source
`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (read-only) and the
live `.tower/fleets/shokunin/reports/test-smith/swarm-registry.json`.

- **Schema `ufo-swarm-registry-v1`** (`:146`); one canonical document shape via
  `buildRegistryDoc` (`:640-654`, single-sourced because both writers had drifted
  once): `schema`, `wave` (always; `null` when never recorded), `createdAt`
  (carried across merges — the registry file’s creation, not the last wave),
  `updatedAt`, `reportDir` (only when a string), `priorRegistries` (only when an
  array), `members { "<name>": row }`. Member keys must satisfy
  `TASK_NAME_PATTERN = /^[A-Z][A-Za-z0-9]{1,31}$/u` (`:271`). Path:
  `${reportDir ?? ".ufo/scopes/<wave>"}/swarm-registry.json` (`:420-426`).
- **Spawn row** (`:1145-1151`): `{ kind:"spawn", agentId:null, role, item }` plus
  optional `axes`/`milestone`. `agentId` stays `null` until `record` fills it.
- **Resume row** (`:1115-1126`): `{ kind:"resume", agentId:null, member, item }`
  plus inherited `axes`/`milestone`. `agentId` is **deliberately null** — one
  handle, one member: the resume row is provenance, not a second owner. `member`
  keeps the **original spawn name** across a chained resume (provenance must not
  decay one hop per wave); `axes`/`milestone` are re-validated by
  `inheritedJudgment` (`:596-621`) so the contract does not decay either.
- **`record --registry <path> --assignments '{"<Name>":"<agentId>"}'`**
  (`:1621-1628`) is the post-spawn half of the ownership ledger. All read-only
  checks (dedupe, at-rest holder, prior replay, cross-file attestation) run
  **before any row mutates**, so a refused `record` publishes nothing
  (`:1675-1763`). On success it prints `{path, schema, wave, createdAt, updatedAt,
  reportDir?, priorRegistries?, members}` to stdout (exit 0).
- **Envelope.** `reportError` emits
  `{"schema":"ufo-swarm-wave-error-v1","code":<code>,"message":<text>}` as
  single-line JSON on **stderr**; typed refusals exit 1, usage 64 (`:1432-1438`,
  `:1351`). No code carries `details` (`fail()` never attaches them). Codes
  reachable from `record`: `usage` (exit 64), `invalid_registry_path`,
  `EXEC_PATH_OUTSIDE_ROOT`, `invalid_registry`, `invalid_assignments`,
  `conflicting_assignment` (**four arms**: duplicate id in one payload; id already
  held at rest; id attested by a declared prior under a different member/item
  claim; re-pointing a member to a different live handle), `unknown_member`,
  `invalid_agent_id` (`/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/u`),
  `registry_lock_timeout`/`registry_lock_unsafe`, residual `invalid_spec`/`internal`.
  `resume_unknown_member` fires at plan admission (`:1063-1066`) **and** at the
  locked re-validation before publish (`:1613-1616`, closing the TOCTOU on the
  lock-free admission read).
- **Why a resume needs a recorded handle.** The resolver indexes only entries with
  a **string** `agentId`, own-wins over priors (`:1031-1059`). A pre-`record`
  spawn row and every resume row carry `null`, so both are invisible: ownership
  always terminates at the one recorded spawn row. No registry names the id →
  `resume_unknown_member`, before any lane spawns.

**Live registry observed.** `test-smith` registry: 50 members, **all
`kind:"spawn"`**, every `agentId === name` (substrate-specific: the dispatch
returned the lane name as the job id; `assignments.json` maps name→name), `item`
null throughout, `axes`/`milestone` per row, roles ⊆ `SWARM_ROLES`, no
`priorRegistries`. Reconciled r1(26) + r2(24) disjoint-name cumulative merge: the
cross-wave collision refusal (`:1484-1506`) did not fire because no overlapping
name displaced a handle; `createdAt` carried from r1; two `updatedAt` epochs.

**Changed.** Nothing — read-only research.

**Unknown.** No fleet registry anywhere contains a `resume` row — the resume-row
shape is **code-evidence only** (verified absence). `swarm-registry-r1.json` is
not a script-producible path (an operator snapshot; writer unidentified). Lane
report: `.tower/fleets/shokunin2/reports/evidence-auditor/RegistryRecordProvenance.md`.