# verification-dispatch — the card's first dispatch, and the gaps it found

Asked: dispatch the card `.omp/agents/isolation-keeper.md` on a bounded test task
and record the observed result (the mission's verification duty). Source: the
installed card + corpus in this worktree. Assignment: `IsolationKeeperCheck`
(agent `isolation-keeper`), 2026-10-09, read-only, 1m24s.

Task shape: three questions the card and corpus already answer, each to be
reconfirmed against the substrate source with exact anchors, plus a required
corpus read first (the card's own protocol) and a `card_gaps` list.

Observed result — the card is **reachable and correct** (3/3):

| q | answer | anchors |
| --- | --- | --- |
| Q1 destroy-admissible states | `prepared`/`finished` with empty `activePids`; `active` refused by name; any nonempty pids gets the active refusal regardless of state; `registered` refused by name; anything else → `destroy marker state is unknown` | `prepare-ephemeral-l1.mjs:803-810` |
| Q2 env exact keys | on disk exactly `{schema, ephemeralRoot, environment}`; the loader injects `envFile` and validates the stored four-key shape; the inner map is exactly pathVariables ∪ flagVariables | `ufo-sighting.mjs:31-46,110-112` |
| Q3 missing bwrap | typed `SANDBOX_UNAVAILABLE`, message `bwrap is required for ephemeral missions`, resolved through `EPHEMERAL_POLICY.childEnvironment.PATH` (not `process.env.PATH`) | `ufo-sighting.mjs:4201-4206`; `config/ephemeral-l1.machine.json:31`; `base.mjs:247-249` |

Corpus entries read by the dispatch (8): `index.md`, `destroy-refusals`,
`sighting-env-load`, `bwrap-argv`, `sandbox-unavailable`, `environment-map`,
`marker-schema-states`, `destroy-force-recovery` — the protocol is followed.

**Gaps the dispatch found (both real, both fixed in this round):**

1. The card explained the 3-key disk file and the injected `envFile` but did not
   name the resulting **stored four-key shape**; the card now states it
   explicitly.
2. The corpus index listed this very entry before it existed — the index must not
   run ahead of the corpus. This entry closes the gap; the append-only rule means
   the row stays and the file now exists.

Not carried by the source: the dispatch could not exercise `create`/`destroy`
against a live root (read-only by design), so its evidence is source-anchored
reconfirmation, not a runtime mission.

## Unknowns

- The card's behavior under a *write*-capable assignment (this dispatch was
  read-only by design).