# Gate order end-to-end trace, per-gate failure modes, apply footprint

**Asked.** Trace `host/apply.mjs`'s gate order end to end; name the exact
failure mode each gate is designed to catch; name the two files `--apply`
writes and what it deliberately leaves stale. All anchors re-derived from the
current source with `grep -n` / ranged reads.

**Observed.** `host/apply.mjs`, 1041 lines. Dry run is the default (L4–L7);
`--apply` is the only writing mode (L1003–1016). `fail()` → exit 1 (L101–104),
`usage()` → exit 64/0 (L107–118), success exits 0 (dry L1011, apply L1041).
Preamble before any gate: banner (L946–948), `--ufo-root` exists (L951) and
`scripts/omp-global-config.mjs` present (L952–954), credential screen loaded
and `redact` wired (L957–965).

Gate order in `main()` — call sites L967, L968, L969, L982, L983, L991, L992,
L994–L1001 — and the failure mode each gate catches:

1. **candidate preflight** — `preflightCandidate` (fn L185–223, called L967;
   title L186). File-level rules the resolver enforces before parsing, checked
   here so a failure names the cause instead of an opaque resolver error
   (comment L183–184). Catches: candidate missing (L188); symlink — resolver
   refuses outright (L189–191); not a regular file (L192); >1 MiB, the
   resolver's `readBoundedFile` bound (L194); UTF-8 BOM (L197); any tab —
   resolver fails closed on tab indentation (L198); no top-level
   `modelRoles:`/`task:`/`retry:` header or more than one, scanned over raw
   bytes with `^(?:s|"s"|'s')\s*:\s*$` gm because a column-0 header inside a
   comment block still counts (L203–209); a credential shape on any line,
   comments included (L215–220).
2. **resolver gate** — `resolverGate` (fn L226–272, called L968; title L227).
   Sets `UFO_OMP_GLOBAL_CONFIG_PATH = CANDIDATE` (L231) so every downstream
   code path audits the candidate, then runs the real
   `scripts/omp-global-config.mjs readGlobalSeatRouting` (L232–237). Catches:
   a candidate that is valid YAML but violates the hand-rolled dialect
   (`fail("resolver refused the candidate…")` L237 — refusal codes include the
   resolver's `ambiguous`); any of the fourteen `MIRROR_SEATS` (L79–83) absent
   from `task.agentModelOverrides` (L243–244), which would otherwise fail the
   compile gate later with a worse message.
3. **dispatch delta** — `dispatchGate` (fn L351–399, called L969; title L352).
   Catches: delta missing (L353) or invalid JSON (L358); `config/ufo.json`
   missing / invalid / lacking a `sighting.dispatch` object (L361–378); a
   non-positive-integer `maxConcurrentL1`, `swarm.waveMinLanes`,
   `swarm.waveMaxLanes`, or `swarm.maxLanes` (`positiveInt` L275–278, calls
   L377–381); an inverted band `waveMaxLanes < waveMinLanes` (L382–385), which
   the runtime would otherwise only refuse mid-wave with `policyFail`; lane
   bounds above `MAX_SWARM_LANES` 100 (L386–387); an `l1Alias` that is not a
   bare nonempty alias — empty or `@`-prefixed (L393–397). Failure mode: an
   out-of-bounds delta reaching dispatch time. (Known hole F2: `swarm.minLanes`
   is unbounded here.)
4. **inter-gate coupling** (in `main`, not a numbered rule): `l1Alias` must be
   a `modelRoles` alias in the candidate (L974–976) and
   `task.agentModelOverrides.main` must resolve through it (L977–980) —
   `build.rs` requires them equal and its compile-time failure is easy to
   misread as a mirror problem (comment L971–973).
5. **route/mirror gate** — `mirrorGate` (fn L490–504, called L982; title L491)
   runs the real `scripts/sync-global-routing.mjs renderSeatRoutingMirror` at
   the **delta's** `l1Alias` (L494–497), i.e. the post-apply state; refusal
   message L497. Then `wholeTableAudit` (L448–488, fail L483) applies
   `auditRoute` (grammar, effort whitelist `low|medium|high|xhigh|max`, gemini
   ban; L411–445) to every `modelRoles` route and every `fallbackChains` step
   — 164 routes — plus per-chain bare-distinctness against the chain's own
   primary. Catches: splitRoute violations, and typos in routes no seat pins
   to (omp roles, effort variants, pool members) that every ufo gate would
   otherwise pass; a chain wrapping its own primary or repeating a bare model
   at another effort.
6. **compile gate (replicated)** — `compileGateRule` (fn L511–546, called
   L983; title L512) replicates `build.rs extract_omp_chains`/`validate_chain`
   because the real gate is a cargo build this script must not trigger
   (comment L509–510). Catches per seat: absent from the mirror (L518), empty
   chain — primary with no fallback step (L523–524), duplicate/wrapped bare
   model (L527–532); then `seats.main.alias !== l1Alias` (L541–543). Failure
   mode: installing a table the next `cargo build -p ufo-core-runtime` would
   refuse. (Latent over-rejection per ledger: 0/14 seats carry an empty chain
   today.)
7. **wave band** — `waveGate` (fn L597–697, called L991; title L598) drives
   the real planner both ways. CLI leg: 32 lanes (`WAVE_CLI_PROBE_LANES`
   L52–55) through `scripts/ufo-swarm-wave.mjs plan` in a temp-dir spec
   (L609–617) — a width inside both the live band (32–100) and the post-apply
   band (16–32); fails on nonzero exit (L621), unparseable JSON (L627), or a
   count mismatch (L630–632). Injected-policy leg via the preloaded ESM
   `planSwarmWave` with the post-apply band (L643–650): 16 admitted at the
   floor (L678), 15 refused `too_few_lanes` (L681), 32 admitted at the wave
   ceiling (L684), 33 refused `wave_too_wide` (L686), 101 refused
   `too_many_lanes` (L689). Failure mode: a delta band whose edges do not
   actually bite in the real planner. `plannerEnv` (L585–595) binds
   `UFO_PROJECT_ROOT`/`UFO_CONFIG_PATH` to `--ufo-root` so each leg proves the
   file it reports. (Per ledger: the wave CLI leg does not read
   `UFO_OMP_GLOBAL_CONFIG_PATH`; only the `--check` leg does.)
8. **bundled-mirror status** — `mirrorStatusReport(false)` (fn L724–761, called
   L992; title L725) runs the real `sync-global-routing.mjs --check`
   (`runRealCheck` L707–721) and classifies via the drift regex (L734) and
   stale-alias regex (L735). Reported, never enforced: `ok`/`note`/`warn`
   only, no `fail` — pre-apply drift and the known stale l1Alias are EXPECTED
   (L739–748), anything else is a WARN pointing back to steps 2–5 as the
   authoritative gates (L753–758).
9. **plan** — `planDispatchEdits` (L287–330) asserts each changed leaf matches
   exactly one line file-wide, else `fail("…refusing to guess")` (L303–306);
   `planNoteRewrite` (L336–349); `printPlan` (L763–812) prints the two-file
   write plan, per-key `sighting.dispatch` edits, and the deferred-artifact
   notice. (Per ledger: all six delta leaves are unchanged today, so the
   exactly-once matcher and the note rewrite are unexercised — the no-note
   branch at L796–801 is what a dry run prints.)

Dry-run verdict at L1003–1012, exit 0 at L1011. Apply path: `installConfig`
(L1015; fn L865–891 — symlink refusal L868–870, backup L873–876 via
`backupFile` L842–849 with clobber refusal L844, `writeAtomic` L853–862 with
`wx` tmp + chmod + rename, read-back byte equality L886–889) and
`mergeDispatch` (L1016; fn L894–941 — surgical per-line rewrite, invalid-JSON
refusal L906–907, expected-object deep equality with
`fail("…changed something outside sighting.dispatch; refusing to write")`
L929–930, byte-diff count L932–934, backup L936, atomic write L938). Then
**apply C** re-verifies the post-apply state (L1021–1036): `waveGate` again
(L1022), observed-floor check with a `--ufo-json` redirection caveat
(L1026–1034), `mirrorStatusReport(true)` (L1036). Verdict L1038–1041.

**The two files `--apply` writes** (header contract L9–11; verdict string
L1039): (1) `~/.omp/agent/config.yml` — the install target, default at
`path.join(homedir(), ".omp", "agent", "config.yml")` (L163), overridable with
`--install-target`; written byte-for-byte from `host/omp-agent.config.yml`.
(2) `<ufo-root>/config/ufo.json` — default resolved at L361, overridable with
`--ufo-json`; rewritten only inside `sighting.dispatch` by
`host/ufo-sighting-dispatch.json`. Ledger caveat: "exactly two files" is the
net-new-file framing — each target also gets a timestamped `.bak`
(`backupFile` L842–849) and a transient `.tmp` (`writeAtomic` L853–862,
removed in `finally`).

**Deliberately left stale** (`DEFERRED_ARTIFACTS` L91–96, closing notice
`printClosingNotice` L814–839): (a)
`crates/ufo-core-runtime/bundled/omp-seat-routing.json` — the seat-table
mirror; (b) `crates/ufo-core-runtime/bundled/config.json` — mirrors
`sighting.dispatch.maxConcurrentL1`; (c) the AGENTS.md routing-authority band
mentions (~L154–170) still saying 16–100; (d) the AGENTS.md generated seat
table between the BEGIN/END GENERATED markers. Never invoked/written (header
L12–17): `npm run contracts:sync`, `scripts/render-seat-tables.mjs`, AGENTS.md
— by operator decision, so ufo-fsd-alpha accumulates no churn. Stated
consequences (L831–839): `contracts:check` / `--check` report drift;
`cargo build -p ufo-core-runtime` compiles against the stale bundled mirror
while live routing follows the installed table immediately; AGENTS.md and the
config disagree on the band. Gate 7's post-apply WARN (L739–743) is the
operator-owned flag for exactly this.

**Verified.** All line anchors above re-checked by ranged raw reads and
`grep -n` against the current `host/apply.mjs` (1041 lines) and
`host/ufo-sighting-dispatch.json`; consistent with the round-2 ledger's
corrected anchors (parseArgs L155–179, planNoteRewrite L336–349,
`admittedAt(16)` L678, drift regexes L734–735, steps 2–5 naming L753–758).

**Unknowns.** The `--apply` write path remains statically verified only —
never executed here (running it is forbidden in this repo); the wave CLI leg's
behavior was not re-run for this trace (prior rounds verified it).

**Added.** 2026-10-09 · lane `GrowHostSmith` (round 3, gate-order trace)
