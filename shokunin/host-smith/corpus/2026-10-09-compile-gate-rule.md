# Gate 5 — replicated compile rule

**Asked.** What `compileGateRule` replicates of `build.rs`, why it is replicated
rather than run, and where it diverges.

**Observed.** Real gate: `cargo build -p ufo-core-runtime` →
`crates/ufo-core-runtime/build.rs` `generate()` L146–181 reads
`bundled/config.json` + `bundled/omp-seat-routing.json`, calls
`extract_omp_chains` L171 → `validate_chain` L493 + `validate_generated_graph`
L519, writes `$OUT_DIR/omp_role_chains.rs`.

- **Requested list — faithful.** `apply.mjs:523` `[row.requested,
  ...row.fallbackChain.map(s=>s.requested)]` mirrors `build.rs:245-260`;
  `MIRROR_SEATS` (L79–83, 14) == `ROLE_TAXONOMY` json keys.
- **Bare-distinctness — faithful.** `build.rs bare_model:511`/`bare_route:515`
  + BTreeSet L496–503 vs `apply.mjs bareRoute:145-152` + Set L527–535; both
  reject a chain wrapping its own primary.
- **Alias equality — shape faithful, tautological as invoked.** `apply.mjs:541-544`
  compares `seats.main.alias` against the delta `l1Alias`, but the mirror was
  rendered *with* that same alias (L495) and the same value is passed at
  L982–983, so it cannot fail. The real gate compares against
  `bundled/config.json`'s `l1Alias` — a cross-file staleness tripwire between
  the bundled mirrors (both still `m_daybreak` today, real gate rc=0) while
  live `config/ufo.json` and the delta say `m_strong`. The substantive check
  sits outside `compileGateRule` at `apply.mjs:971-980`.

**Why replicated** (L506–510): the real gate reads only the deferred/stale
bundled mirrors and is a cargo build the script must not trigger; its contract is
"writes exactly two files".

**Divergences found.**

- **Over-rejection (medium).** `apply.mjs:524-526` rejects a seat with
  `requested.length < 2`, but `build.rs:494` tests `steps.is_empty()` on a list
  that always contains the primary (`build.rs:38`: "Empty terminal fallback
  arrays are legitimate"). Proven: the real gate accepts
  `seats.main.fallbackChain=[]`; `compileGateRule` FAILs it.
- **Step label over-claims** (L512): only the main-alias arm of
  `validate_generated_graph` is replicated; `extendedContext`/`minimumTokens`/
  retry/`validate_local_omp` have no JS twin (a `SubstrateCompileGate` lane
  confirms the full set).

**Added.** 2026-10-09 · lane `CompileGateRule` (critic)