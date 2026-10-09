# `host/apply.mjs` — the gates and what they enforce

**Asked.** What does the applier enforce, and where does its authority stop?

**Observed.** Default (no flags) is a **dry run that writes nothing** (`apply:false`
default at :157; `main` exits before any candidate read).

With `--apply` it writes **exactly two files**:

1. `~/.omp/agent/config.yml` (install target; `--install-target` overrides) —
   the candidate bytes, atomic tmp+`wx`+rename, read-back byte-verified.
2. `<ufo-root>/config/ufo.json` — a **surgical** `sighting.dispatch` per-line
   rewrite (no re-serialization), after JSON re-parse and strict outside-dispatch
   deep-equal checks.

Backups are sibling `<target>.<ISO-stamp>.bak`, fail-closed on collision, mode
preserved; a symlinked authority is refused.

The 8 dry-run steps (:181/:225/:274/:400/:506/:549/:702/:762):

1. candidate preflight — regular file, size bound, exactly one column-0
   `modelRoles:`/`task:`/`retry:` header each, no credential shape.
2. resolver gate — `readGlobalSeatRouting`: parses clean; all 14 seats present.
3. dispatch delta — band inverts cleanly; `l1Alias` bare and nonempty.
4. route gate — `splitRoute` over every seat chain, then whole-table
   splitRoute-legal + bare-distinct.
5. compile gate — replicates `build.rs` `validate_chain` /
   `validate_generated_graph`.
6. wave gate — `ufo-swarm-wave.mjs plan` against the 16-32 band (lane counts,
   no route flag on that argv).
7. bundled-mirror status — `sync-global-routing.mjs --check`, **reported, never
   enforced**.
8. apply plan.

**Enforces:** `l1Alias ∈ modelRoles` (:974-976) and
`task.agentModelOverrides.main` resolves to `@<l1Alias>` (:977-980), plus
whole-table route legality.

**Does NOT enforce:** routing-free purity of the *project* surface. `grep` for
`check-routing-free` / `ROUTING_KEYS` in `apply.mjs` returns nothing; the only
project surface it reads is `<ufo-root>/config/ufo.json`. Counterexample
(lane 10): a scratch tree with a `config/mission-main-event.yml` carrying
`modelRoles` + `agentModelOverrides` makes `check-routing-free-config.mjs` exit 1
while `apply.mjs` dry run exits 0 "DRY RUN PASSED".

**DEFERRED_ARTIFACTS** (:91-96, reported-not-enforced): the bundled seat-routing
mirror, `bundled/config.json`, the AGENTS.md band mentions (still 16-100), and
the AGENTS.md generated seat table.

**Changed.** Present state: `apply.mjs` dry run PASSED on the candidate
(19 modelRoles, 31 fallbackChains, 14 seats; 164 routes across 19 aliases + 31
chains). `--apply` was **not** run (would write the live global config).

**Unknown.** The negative branches of (:974-980) were not executed (require
editing host files).

Evidence: lanes ApplyOverviewReviewer08, ApplyRouteGateScout09,
ApplyAuthorityCritic10.