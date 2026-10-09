# round-2 verification corrections

**Asked:** round 2 dispatched 25 read-only verification lanes over the integrated card and corpus
(card-conformance, corpus-integrity, fidelity, legibility). This entry records every correction those
lanes re-derived from source, plus the card edits made in the same round. Sources: the round-2 lane
reports at `/home/vgpnk/Projects/ompskills/.tower/fleets/shokunin/reports/skill-scribe/` and the
sources each re-checked. Read-only; nothing in the repo was edited by a lane.

## Corrections (UNSUPPORTED -> corrected fact)

1. `2026-10-09-swarm-refusal-codes.md:1,9` "32 distinct typed codes": there are **33** typed codes in
   `ufo-swarm-wave.mjs` — 32 literal `fail("…")` strings plus `invalid_report_dir`, raised through
   `validateRelativePath`'s `fail(code, …)` at `:401/:404/:407` (bound at `:413`); the CLI-reachable
   surface including `usage`, `internal`, `EXEC_PATH_OUTSIDE_ROOT` and the 4 pass-through codes is 40.
   The entry's own "24 named + 16 omitted" mixes universes: relative to the 32 `fail()` codes the skill
   omits 9.
2. `swarm-refusal-codes.md:11-12` the claimed `usage` exit-1 duality does **not** exist:
   `commandProbe("usage")` throws at construction (`ufo-route-preflight.mjs:92`), which happens at wave
   `:1868` **outside** the `:1391-1392` try, so it maps through `reportError` to code `internal` (exit 1);
   every usage-coded CLI emission is `emitUsageError`, exit 64.
3. `swarm-refusal-codes.md:29-30` attribution error #3 (resume_unknown_member "purely pre-spawn") is
   **not** an error: `:1613` fires in `persistWaveRegistry`, still before payload emit; #1
   (`invalid_registry`) is also not an error (the skill dual-lists it, both filings true). Only the
   route-clause nit (#2) stands: preflight also refuses `route_config_unavailable`
   (`ufo-route-preflight.mjs:148`) and probe `usage` (`:92`).
4. `2026-10-09-swarm-band-authority.md:24-27` "stdout verbatim, stderr empty" — **streams inverted**:
   re-running both probes gives exit 1 with the byte-identical error JSON on **stderr** and empty stdout
   (`emitErrorJson` = `process.stderr.write`, `ufo-mission-result.mjs:2031`). The band values and the
   16/32 inference were correct.
5. `2026-10-09-swarm-validator-surface.md:35-44` refusal list is 28 of the file's 33 typed codes — it
   omits `invalid_resume_id` (`:701`), `invalid_name` (`:709`), `prompt_with_template` (`:947`),
   `item_required` (`:951`), `prompt_required` (`:971`); the pass-through set names 2 of 4 (misses
   `route_config_unavailable`, `prior_refinement_overflow`).
6. `2026-10-09-godspeed-skill-frontmatter.md:16-17` "byte-identical across every observed copy (30
   under the substrate)" is false: **29** of the 30 `directive.md` copies hash `db88963c…`;
   `docs/artifacts/public-lkg/godspeed-core/directive.md` =
   `dedefb146331c4999f1fda337ca69a6b0b08da8edb0240b4cc6ddbca49d86474` diverges.
7. `2026-10-09-corpus-protocol-prior.md:9-11` "zero committed `.omp/agents/` cards … or the substrate"
   is false: the substrate commits 13 `.omp/agents/*.md` taxonomy cards. What is true (and what the
   entry meant) is zero committed **shokunin** artifacts and zero committed `corpus/index.md`. The
   headline "no committed precedent exists" is date-bounded: sibling fleet missions committed shokunin
   cards at 05:31-05:44Z, after the 05:25Z observation.
8. `corpus-protocol-prior.md:16-18` the test-smith "20 entries, no index.md" snapshot was transient and
   is not reproducible; the committed snapshot ~6 min later shows 27 entries and `corpus/index.md`.
9. `2026-10-09-skill-frontmatter-schema.md:13-15` "OMP consumes only `name` + `description`" is
   imprecise: `omp://skills.md` also consumes `enabled` (a disabled skill is skipped) and `hide`, and
   supports `globs` / `alwaysApply` / `disableModelInvocation`. Corrected: `name` + `description` are
   the prompt-exposure and native-discovery contract; the `metadata` triple has no consumer. The field
   census is 7 of 10 files carrying the triple (orchestration x6, `all` x2), not 6/5/1.
10. `2026-10-09-agent-card-schema.md:9` "the only validator of card frontmatter" is imprecise:
    `scripts/project-devin-subagents.mjs:258,270` also parses and throws at projection time
    (`prepare-ephemeral-l1.mjs:421-425` consumes it). `check-hand-authored-sets.mjs` is the only card
    **linter**.
11. `agent-card-schema.md:25-26` "no host gate lints `.omp/agents/`" holds as the conclusion, but the
    premise over-reaches: `sync-ufo-contracts.mjs` does **mirror**-gate the substrate `.omp/agents` tree
    (`agentTargets:171`, `--check` fails on a non-mirror file) — mirror-gated, not lint-gated. The
    delivered card is unlinted anywhere.
12. `2026-10-09-host-apply-surface.md:38` "buckets differ only by cascade depth" — they also differ in
    cascade **composition** (`m_strong` 9 hops at `yml:302-310`, `m_fast` 6 hops at `:333-338`).
13. `host-apply-surface.md:25-26` "Eight gates (:185-696)" — the cited range spans gates 1-6;
    `mirrorStatusReport` is `:702-760` and the post-apply re-verify `:1018-1036`.
14. `2026-10-09-mission-format-config.md:41-42` "HEAD subject says 32-100 but the file has 16/32" is
    inverted: the **HEAD blob** carries `32/100` and agrees with its subject; the mismatch is
    subject-vs-uncommitted-worktree.
15. `2026-10-09-role-card-conventions.md:20` cites `docs/SUPPORTED-SUBSTRATES.md:150-153`; the
    no-tools-allowlist norm is at `:156-159`. `:21`'s "(8 cards)" counts only the artifact-is-data
    clause; the never-judge fence is in 11-13 cards.
16. `2026-10-09-docs-audit-priors.md:19-20` "JSON [] vs 29 git worktrees" — the audit recorded 23 and
    the live count is 30; the `[]` blind spot itself reproduces. `:32` names "P-AUD-*" ids that exist
    nowhere; the prompt audit ids are `AUD-*`.
17. `2026-10-09-skill-code-consistency-norms.md:38` **N7 is UNSUPPORTED as stated**: the filter/velocity
    divergence is **not** caught by any gate (`skills/SHA256SUMS` and `ssot/godspeed-core/SHA256SUMS`
    both verify OK against their own copies), so "byte drift fails closed" is over-claimed; the
    "canonical named / mirrors are not authorities" half holds. N1's "every OMP-tree skill" is
    self-falsified by its own shokunin carve-out (and by `SUB/.omp/skills/wwkd`); N12's tree dichotomy is
    wrong — the discriminator is skill class (`SUB/.omp/skills/wwkd` has no triple, `SUB/skills/ufo`
    does). N3's phase attribution is wrong for `resume_unknown_member` (`:1613`).
18. `2026-10-09-skill-claim-falsification.md` F3's corrected fact is wrong in its last clause:
    `twin` also registers its own new mission (`ufo-sighting.mjs:4015+2327-2329`); only `resume` re-panes
    an existing row.
19. `2026-10-09-skill-frontmatter-schema.md` substrate `.omp/skills/{tower,swarm}` are 37/87 lines and
    differ from the repo copies (`diff -q`); "variants of the omskills canonical" over-reads — only
    "untracked" is supported.
20. `2026-10-09-swarm-skill-claims.md:11-12` "53/53 supported, 0 contradicted" conflicts with
    `skill-claim-falsification.md:22-33`, which marks two claims inside that entry's declared range
    (`swarm/SKILL.md:69-71` UNSUPPORTED as stated, `:198-200` over-stated) as failing source. The
    falsification verdicts are the corrected ones.
21. Structural protocol gap: `## Changed` is absent from 24 of 25 entries (protocol requires it,
    `.omp/skills/shokunin/SKILL.md:77`); only `card-dispatch-verification.md` carries it.

## Citation slips (facts supported, line references wrong)

`tower-skill-claims.md:30` `host/omp-agent.config.yml` L194 -> L197; `omp worktree --help` L120 -> L122;
TF header L31-34 -> L33-35; TF L1266 -> L1267. `skill-claim-falsification.md:23` `2507-2508` -> `2503`;
`:12` `:816` -> `:817`; `:36` `:1212-1221` -> `:1222-1224`; `:35,131` -> `swarm/SKILL.md:44,208`.
`swarm-validator-surface.md` `:116` -> `:112`; `:1183` -> `:1187`; `:1653` -> `:1652`; `:1875` -> `:1877`;
`:1301` -> `:1296`. `validator-env-contract.md:29-31` `MAX_LANE_AXES`/`MAX_LANE_META_BYTES` are at wave
`:302/:303`. `tower-fleet-verbs.md` `loadSpec L323-401` -> `L319-415`; `run L506-512` -> `L507-517`;
`-h` omitted from the flag list; `:29-30` span off by ~4 lines. `ufo-skill-load-order.md:10` load-order
heading L21 -> L24. `swarm-skill-claims.md:24` `:930` -> `:932`, `:949` -> `:947`; preflight `:150` ->
`:148`. `mission-format-config.md:37` `SKILL.md:339` -> `:338`. The tower "complete aborts first" clause
is at `.omp/skills/tower/SKILL.md:171-172` (the two entries cite `:170-171` and `:169-170` and disagree
with each other). `card-dispatch-verification.md:32` cites `git show HEAD:config/ufo.json:89,93,94`,
which is not executable git syntax.

## Third stale site beyond the corpus

`test/sighting-wave-smoke.md:118-119` repeats the same stale close claim ("aborts the loop on the first
failure") that `.omp/skills/tower/SKILL.md` carries — a third site the corpus does not flag.

## Legibility (recorded, not applied)

Round-2 lanes named duplication clusters (band-drift, host-overlay stale prose, the three tower
partial-state drifts, the round-budget inference, the swarm floor chain, the godspeed mirror hashes,
card-roster facts) and proposed "one owner per claim plus `See <entry>:<line>` pointers". **Rejected as
an edit**: the corpus is append-only, so no existing entry may be rewritten or deleted; the proposal is
recorded for a future round that can add pointer entries.

## Card edits applied this round

- Corpus-protocol section now states the index columns verbatim (`| entry | topic | added |`) and the
  never-reorder/never-delete-row rule (was absent; `CorpusProtocolConformance`).
- Sources of truth: the three glob patterns (`reports/tf-audit-*.md`, `agents/*.md`,
  `skills/godspeed-core/*`) replaced with exact path lists; the "skills this repo owns" claim corrected
  (tower/swarm also exist in the substrate with different bytes; only `shokunin` is repo-exclusive);
  `config/ufo.json` now says to state working-tree vs `HEAD`; `host/ufo-sighting-dispatch.json` added.

## Remaining unknown

Whether the live OMP dispatcher (as opposed to a bounded `task` call) resolves this card, and whether
OMP itself validates any `.omp/agents` key — both unobservable from these two repos.
