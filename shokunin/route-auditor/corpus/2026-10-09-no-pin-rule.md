# The no-pin rule — written convention vs executed-path gate

**Asked.** What is the rule, where is it written, and is it machine-checked on
the executed dispatch path?

**Observed.** The rule in one sentence: no task, lane, or dispatch payload —
nor the L1 pane itself — may name a provider, a model, or a per-lane model
parameter; routing resolves solely through the operator's global
`~/.omp/agent/config.yml` `m_*` alias table.

Written in four places (verbatim):

- `.omp/skills/swarm/SKILL.md:57` "there is no per-lane model key"; `:152-154`
  "The global config is the sole routing/auth authority. Never hardcode a
  provider/model, credentials, or a per-lane model param — there is no per-lane
  model knob."; `:154-158` opt-in preflight + "never edit or override global
  routing from this skill".
- `.omp/skills/tower/SKILL.md:39-45` "the operator's global config is the sole
  routing authority"; approved three buckets + named lanes; "Never pin or name a
  provider/model in a task, change routing configuration, or expose credentials."
- `sighting/l1-prompt.md:108-111` "There is no per-lane model param and no alias
  you may pin: this pane's own route and every lane's come from the operator's
  global `m_*` alias table, never from a provider or model name you write."
- `ufo-fsd-alpha/config/ufo.json:92` swarm.note "no per-lane model param — the
  global OMP `m_*` alias table supplies routing and the generated
  `omp-seat-routing` mirror binds judge parity."

**Executed-path machine-check status: FALSIFIED as enforced.** Lane 22 falsified
"the `m_*`/alias rule is machine-checked on the executed dispatch path":

- The wave lane payload is exactly `{name, agent, task}` (`ufo-swarm-wave.mjs:1187`);
  the spec item key space is **closed** (`ITEM_KEYS` :274), so `items[0].model`
  is refused `invalid_spec`. The only route surface is the taxonomy role string.
- The only executed-path predicate on that role is `SWARM_ROLES` membership
  (:937-938). A repo-wide grep found **no `m_` prefix predicate** anywhere in
  `crates/` or `scripts/`.
- A scratch global config with `critic: "@zeta"` (no `m_` prefix) plans clean at
  exit 0, `routePreflight.families[0].alias = "zeta"`.
- Table-membership predicates exist on other paths (`fleet-dispatcher.mjs:3694`
  "route … is absent from the global OMP alias table"; `run-omp-native-trial.mjs:716`)
  but they check membership/legality, never the `m_` naming rule — and the live
  table carries four non-`m_` aliases (`smol`, `slow`, `plan`, `default`), so a
  prefix gate would refuse the live authority.

**Changed.** None. **Correction to carry:** the `m_*` rule is an operator
convention with no executed-path machine gate; say so.

**Unknown.** OMP harness-side resolution of role -> seat alias (outside both
trees); the `route_unreachable` arm not exercised (spends a completion per hop).

Evidence: lanes NoPinCorpusReviewer19, ExecutedPathCritic22.