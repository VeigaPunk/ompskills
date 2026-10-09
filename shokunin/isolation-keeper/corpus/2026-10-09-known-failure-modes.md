# known-failure-modes — documented failure modes and residual risks

Asked: collect every documented ephemeral failure mode, mark STILL-TRUE/STALE,
and name the residual risks. Source: `docs/{BLOCKED,KNOWN-GAPS,REQUIREMENTS,
BEHAVIOR-MATRIX,ARCHITECTURE,EPHEMERAL-L1-MISSIONS,PATH-GUARDS}.md` +
`prepare-ephemeral-l1.mjs`, `ufo-sighting.mjs`. Lane `KnownFailureModes` (critic).

Key result: `grep -i ephemeral` over the four honesty docs returns only 3 hits,
all in `BEHAVIOR-MATRIX.md` (a pointer, a codex CLI row, a changelog line);
`docs/environment/README.md` does not exist; neither `BLOCKED.md` nor
`KNOWN-GAPS.md` records an ephemeral-sandbox failure mode. **The failure-mode
contract lives only in `docs/EPHEMERAL-L1-MISSIONS.md`.**

| id | mode | verdict | source |
| --- | --- | --- | --- |
| FM1 | missing bwrap | STILL-TRUE (launch-time) | sighting:4201-4206; config sandbox.executable |
| FM2 | no-remote publication gate | STILL-TRUE | prepare:583-605, :655 |
| FM3 | "not a full OS sandbox" caveats | STILL-TRUE but describes the runtime process adapter, **not** the ephemeral bwrap sandbox | REQUIREMENTS:79; ARCHITECTURE:127 |
| FM4 | bounded triage/evidence retention window | **UNENFORCED** — no code carries the bound | doc:101; grep retention/deadline/ttl/window in prepare = 0 hits |
| FM5 | destroy refuses registered/active roots | STILL-TRUE | prepare:806,809,810 |
| FM6 | force cannot bypass a valid-identity marker | STILL-TRUE | prepare:830-843 |
| FM7 | attested shell-free OpenCode argv only | STILL-TRUE | sighting:4196,4199,4210,4236-4288 |
| FM8 | no credential values in the environment file | STILL-TRUE | prepare:714-725 |
| FM9 | clone ops get no host credentials | STILL-TRUE | prepare:178-199 |
| FM10 | OpenCode compat config (no model pin, disables) | STILL-TRUE | prepare:524-533, :504 |

Residual risks:
- **R1 (network):** the bwrap argv has **no `--unshare-net`** — the child shares
  the host network namespace; the resolver snapshot is bound in, implying network
  is intended. The advisory's network-denied drill is unimplemented. "No remote"
  is enforced by remote stripping + credential scrubbing, **not** a network
  boundary.
- **R2 (strand):** a `SIGKILL`ed pane leaves `state=active` with a dead
  `activePids` entry; no liveness check exists and `reconcileLocked` never
  repairs it; ordinary destroy refuses and `--force` refuses too; the CLI has no
  other verb. **No recovery path for the most likely strand.**
- **R3 (accumulation):** failed/stranded roots accumulate unbounded under the
  scratch root; the doc's required deadline is neither enforced nor recorded.
- **R4:** (additional residual carried in the lane report).

## Unknowns

- Whether any consumer enforces the doc's operator-guidance sentences.