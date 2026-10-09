# tf-audit-routing — routing purity of the tower-fleet feature

| field | value |
| ----- | ----- |
| mission | `tf-audit-routing` (fleet `tower1`, axis `audit-routing`) |
| rounds | r1 — 32-lane audit wave; r2 — 16-lane adversarial verification wave of this report (both below) |
| subject | the tower-fleet feature: `sighting/tower-fleet.mjs`, `sighting/l1-prompt.md`, `.omp/skills/{tower,swarm}/SKILL.md`, `host/{omp-agent.config.yml,ufo-sighting-dispatch.json,apply.mjs}`, `test/*`, plus the cross-repo surfaces the feature drives (ufo-fsd-alpha `config/ufo.json`, `config/mission-nightcall.yml`, `scripts/ufo-sighting[.mjs]`, `scripts/ufo-swarm-wave.mjs`) |
| repos | `ompskills` @ worktree `.tower/worktrees/tower1/tf-audit-routing` (base `main` 3dee568); `ufo-fsd-alpha` read-only |
| deliverable | this file. No file outside `reports/tf-audit-routing.md` was edited by the L1. Lanes were read-only; they wrote only under `.tower/fleets/tower1/reports/tf-audit-routing/` **with two disclosed exceptions** (r1 lane 05's `driver.sh`, r2 lanes VerifyF6F7/VerifySurfaces02 mirror files placed at the worktree root) — both preserved as evidence and removed; the worktree is clean |
| lane evidence | 01:19Z–01:51Z (r1) and 01:40Z–02:12Z (r2) |

## Verdict

**Claim 1 — "no provider/model is pinned anywhere in the tower-fleet feature": PASS (verified).**
An exhaustive token sweep of the ten feature files finds **0 route-pins**. Every provider/model literal in the set lives inside the alias table itself (`host/omp-agent.config.yml`: 176 concrete-selector lines = 19 `modelRoles` values + 145 chain steps + 12 selector-shaped concrete chain keys), or inside the feature's own gemini-ban guard in `host/apply.mjs:413-426,501` (a refusal, never a selection). The only model names in prose are `Kimi-style` (`.omp/skills/swarm/SKILL.md:4`) and `kimi's 5-per-700ms` (`:92`); provider ids also appear in `host/omp-agent.config.yml` comment prose (`:42,54,58-67`), classified prose-name. The launcher emits exactly one route token, read live at run time: `sighting/tower-fleet.mjs:326` → `--model @${authority.l1Alias}`, where `l1Alias` comes from `<ufoRoot>/config/ufo.json` `sighting.dispatch.missionFormat.l1Alias` (`:132`), live value `m_strong`.

**Claim 2 — "every route resolves through the global `m_*` alias table": PASS AT REST, BY LUCK AT RUN TIME.**
`m_strong` is a live `modelRoles` key (`~/.omp/agent/config.yml`, 19 keys — lane 20), and all 14 `task.agentModelOverrides` seats bind to quoted `@m_*` aliases, so today's emitted route resolves through the table. But the rule that makes this true is machine-checked at **zero points on the path the launcher executes** (F1), and the launcher injects a route-capable config overlay it never inspects (F2). Ten findings follow — F1/F5 HIGH, F2 HIGH, four MEDIUM, the rest LOW — each with the evidence that survives round-2 verification.

Lane verdicts (r1, verbatim): **8 CLEAN · 23 CLEAN-WITH-GAP · 1 off-taxonomy `BY-LUCK` (lane 03, whose gap is F2) · 0 VIOLATION**. Round 2 re-derived this tally independently (lane VerifyInventory13); the earlier shorthand "24 CLEAN-WITH-GAP" folded lane 03's `BY-LUCK` label into the gap class without saying so — that normalization is now explicit.

## Audited surfaces

| # | surface | verdict | load-bearing evidence |
| - | ------- | ------- | --------------------- |
| 1 | `sighting/tower-fleet.mjs` | clean, no pin | 0 provider/model tokens; single route emission at `:326`; full omp flag set is exactly `--cwd --session-dir --max-time --model --config --print-thoughts --auto-approve` (no `--smol/--slow/--plan/--advisor/-m`) (lanes 01, 02) |
| 2 | `sighting/l1-prompt.md` | clean, 1 dead value | 0 tokens; `{{l1Alias}}` never referenced although `renderPrompt` supplies it (`:291`) (lanes 08, 02) |
| 3 | `.omp/skills/tower/SKILL.md` | clean | alias names only (`m_strong/m_mid/m_fast` at `:41`), two anti-pin clauses: emission rule `:145-146` and `:44-45` ("Never pin or name a provider/model in a task") (lane 10) |
| 4 | `.omp/skills/swarm/SKILL.md` | clean | 0 tokens; prose hits `Kimi-style` `:4`, `kimi's 5-per-700ms` `:92` (lane 11) |
| 5 | `host/omp-agent.config.yml` | table-conformant **for the candidate** | 19 `modelRoles` (0 `@`-valued), 14 seats all `"@m_*"`, 31 chain keys (19 named + 12 quoted concrete), 145 steps all `provider/model[:effort]`, 0 dead-weight keys, 0 bare-distinctness violations — re-derived twice in r2 under two independent parses (lanes 13, 14; r2 VerifySurfaces02/VerifyCitations14). **This certifies the candidate, not the in-force installed table — see F10** |
| 6 | `host/ufo-sighting-dispatch.json` | clean | 6 leaf scalars: 5 band integers + the sole string `missionFormat.l1Alias="m_strong"`; 0 selector-shaped values (lane 15, r2 VerifySurfaces02). Note: `swarm.minLanes` is merged but never range-checked (r2 V2-06) |
| 7 | `host/apply.mjs` | clean, installer-side gates | `l1Alias ∈ modelRoles` at `:958`; `resolved.seats.get("main").via.alias !== l1Alias` at `:961-964`; the mirror-side equivalent `mirror.seats.main.alias !== l1Alias` at `:541-545`; ≥6 routing predicates in total (lane 15, r2 VerifySurfaces02). The candidate path is pinned at `:231` and `:235` (comment at `:228-230`), a third pin at `:698`; one install-time byte-equality readback of the installed file at `:869-874` |
| 8 | `test/tower-fleet.test.mjs` | clean, blind | see F5 (lanes 07, 02, 19) |
| 9 | `test/run-wave-test.mjs` | clean, name-gated | `"model" in task` predicate at `:550`; assertions on `entry?.via?.alias` exist at `:121-130` but against the candidate config, not the emitted payload (lanes 21, r2 VerifySurfaces03) |
| 10 | rendered `.tower/fleets/tower1/*.prompt.md` (16) | clean | 0 provider/model ids; band lines `16–32`/`100`; no alias value, no `--config` text (lane 28, r2 VerifySurfaces03) |
| 11 | `tower1/spec.json`, `tower1/fleet.json` | clean | only routing identifier is `band.l1Alias="m_strong"` (`fleet.json:17`); `grep -c model fleet.json` = 0; `spec.json` carries only prose (`--model @alias` `:20`, `m_*` `:97`) (lane 27, r2 VerifySurfaces04) |
| 12 | wave payload (`ufo-swarm-wave.mjs`) | clean | `SPEC_KEYS`/`ITEM_KEYS` (`:273-274`) accept no route key — every route-key probe failed closed (12/12 in lane 18, 14/14 in lane 22's re-run); **spawn** lane objects are exactly `{name, agent: <role>, task}` (`:1187`); resume rows are `{name, resume, member, item}` + message (`:1127-1143`), moot here (resume 0) (lanes 18, 22, 09) |
| 13 | wave evidence (`dispatch-32.json`, `plan-32.stdout.json`, `swarm-registry.json`, `ufo-mission-result.json`) | clean | 0 key paths matching `model\|provider\|route\|alias` and 0 selectors. **These four live in the MAIN checkout at `test/evidence/wave-20261008T191554Z/` (pre-apply 32–100-band run), not in the worktree, whose `test/evidence/` holds only `.gitignore`** (lane 22 FOLD-26, r2 VerifySurfaces04) |
| 14 | wall CLI launch path | clean | `bash scripts/ufo-sighting launch … -- <omp argv>` — `model` occurs 0 times in `ufo-sighting.mjs`; no `PI_*_MODEL`, no tmux env injection. The wall does NOT forward byte-verbatim: `parseOmpArgv` canonicalizes `-r/--resume`, `--session-dir`, `--cwd` and refuses `--continue/--no-session/-p/--print/--mode=json|rpc|rpc-ui`; **`--model` and `--config` pass untouched** (lanes 16, 31, r2 VerifySurfaces05) |
| 15 | `mission-nightcall.yml` (injected overlay) | route-free today | exactly `extendedContext`, `advisor.enabled`, `task.maxConcurrency`, 4 `retry.*`; 0 selectors; the substrate gate `check-routing-free-config.mjs` scans it and passes (lane 34, r2 VerifyF2/VerifySurfaces05) |
| 16 | fleet `swarm-registry.json` | clean | every member carries exactly `{kind, agentId, role, item, axes, milestone}`; no route field. **File state changed after r1: it now holds 51 rows (35 r1 + 16 r2) under `wave: tf-audit-routing-r2`** (lane 22, r2 VerifySurfaces05/VerifyInventory13) |

## Findings

Severity is my judgment as the mission's single judge. Every citation was mechanically re-checked in r2: **36/36 resolve to the cited line with the claimed content, 0 off-by-one, 0 dead paths** (lane VerifyCitations14). The four L1-reproduced probes were played back byte-for-byte by three independent r2 lanes (VerifyRecipe16, VerifyCitations14, VerifyF5).

### F1 — the `m_*` alias rule has no machine check on the executed path (HIGH — upheld in r2)
`loadBandAuthority` validates `l1Alias` with a single charset test — `sighting/tower-fleet.mjs:137` `/^[A-Za-z0-9_.:-]+$/` — which admits any provider-less token. The launcher then emits `--model @<token>` verbatim at `:326`.
- **[L1-verified]** my probes (fixture root, `plan --json`): `m_strong` → `--model @m_strong` (live control); `deepseek-v4.1-flash:max` → **exit 0**; `totally_made_up_alias` → **exit 0**; `alibaba-token-plan/deepseek-v4.1-flash:max` and `@m_strong` → exit 2 `CONFIG_UNREADABLE`. Lanes 04/19/35 and r2 VerifyF1/VerifyRecipe16 extend the admitted set to `@default @slow @smol @plan @m_strong_typo @m_strong:high @M_STRONG @_x @LUNA` and a 70-char token; only `/`, `@`, whitespace and empty are refused.
- **Corrected impact (r2, lane VerifyF1).** The admitted class has two distinct consequences, and the second is the sharper one: a **resolvable non-`m_*` role key** (`default`/`slow`/`smol`/`plan`) is taken literally and **silently rebinds the launched session's default model** (omp's own resolver calls `overrideModelRoles({default:…})`), whereas a **ghost token selects no model at all** — no default-role fallback — so the L1 pane comes up route-less. Round 1 said only "reaches omp as a dangling `@token` with no refusal", which understated the first case.
- The install-time gate is real but off the dispatch path: `host/apply.mjs:958` `resolved.modelRoles.has(l1Alias)`; note it also runs inside `test/run-wave-test.mjs:430` as a suite preflight, so "install-time only" would be inaccurate — it is "off the *dispatch* path" (r2 V2-04).
- Off-path checks that do exist, found in r2: `run-omp-native-trial.mjs:714-724` resolves the same `missionFormat.l1Alias` through `resolveAliasRouting` and fails on a ghost, and the substrate's `fleet-dispatcher.mjs:222 → :3667` chain does the same for its own missions. Neither runs for a tower-fleet launch, so "zero checks on the executed path" still stands.
- Proposed move (not applied — out of scope): gate the emitter — require `^m_[A-Za-z0-9_]+$` **and** membership in the live global `modelRoles` inside `loadBandAuthority`, with a typed refusal. VerifyConnector35's composite-gate analysis notes the residual: whether `default/smol/slow/plan` should be admissible is a naming decision the substrate deliberately declines to encode (`build.rs:569` pins only the default alias), so it must be an explicit operator call.

### F2 — the launcher injects a route-capable config overlay it never validates (HIGH — upheld, reframed in r2)
`buildOmpArgv` unconditionally appends `--config <ufoRoot>/config/mission-nightcall.yml` (`sighting/tower-fleet.mjs:327`) with no `existsSync`, stat, or parse. There is exactly one reference to the overlay **in the tracked feature source** (line 327; an untracked r2 evidence tree also names it — r2 VerifyCitations14).
- omp documents `--config` as an extra overlay loaded **after** global and project settings, with `modelRoles`/`retry.fallbackChains`/`task.agentModelOverrides` as live routing keys (omp://settings.md:21,110,117). Lane 03's live probe shows the overlay beating the global table; **[L1-verified]** base `modelRoles.m_strong = alibaba-token-plan/deepseek-v4.1-flash:max` → with a one-line overlay `fake-provider/l1-verify-fixture:high`. Lane 34 confirms the real overlay's live effect (`retry.fallbackRevertPolicy` `cooldown-expiry→never`, `advisor.enabled` `false→true`, `task.maxConcurrency` `32→0`) while the 30-key global `fallbackChains` set survives.
- **Corrected mutant reading (r2, lane VerifyF2).** Lane 05's launcher-plan battery survived 6/6, but only the *pinned-overlay* shape and a redirected `ufoRoot` carry runtime route risk: a missing file, a directory, or invalid YAML is a **hard error at omp startup** (`omp models --config <missing>` → exit 1 `Config overlay not found`; docs :308/:1069), and symlink-to-`/dev/null` is a valid empty mapping. Round 1's INFERENCE on runtime behavior is now OBSERVED (bounded probes, no session launched).
- **New, low (r2 C3).** `:327` hardcodes the overlay *filename* while the launcher already parses `config/ufo.json` and reads `missionFormat` (`:110,:116`) — consuming only `l1Alias` and ignoring the declared `missionFormat.configPath` (`ufo.json:83`), which the substrate does gate elsewhere (`check-hand-authored-sets.mjs:89-91`). A declared-path change would silently leave tower-fleet injecting a stale filename. Today the two agree.
- Proposed move: stat the overlay and refuse (or warn typed) when it declares any routing key — the substrate gate's own `ROUTING_KEYS` (`modelRoles`, `agentModelOverrides`, `fallbackChains`, `modelRoutes`, `modelFallbacks`) — or simply call `check-routing-free-config.mjs`, which I verified flags a pinned overlay (exit 1) and passes the real tree (`ok:true`).
- Severity reframed per r2 C5: it is one defect — "the executed path has no check, and the existing check is not on it" — not many independent holes.

### F3 — ambient env can route the launched pane (MEDIUM → LOW, reframed in r2 as a scope caveat)
The header comment's "nothing pins a provider/model" is true of the argv tower-fleet builds, not of the process it launches: `run()` (`:358-359`) passes no `env` key, so ambient variables are inherited (lane 06, r2 VerifyF3).
- **Corrections.** The `PI_SMOL_MODEL`/`PI_SLOW_MODEL`/`PI_PLAN_MODEL` trio sits in omp's *runtime-override* layer (omp://settings.md:117,:123,:133), not "top"; and it **reroutes no tower-fleet lane** — none of the 14 seats is `smol/slow/plan`, and the L1 pane's model is fixed by `--model @m_strong`. The only emitted route ambient role-env can move is the substrate's own `scripts/ufo-sighting:65` inquiry `--model @slow`. The routing-relevant ambient channel `PI_CONFIG_FILES` is the overlay class F2 already rates HIGH.
- New (r2): the wall reads `env.UFO_SIGHTING_TMUX_SOCKET` (`ufo-sighting.mjs:804-810`), so an ambient socket can force the fresh-server case in which pane env inheritance is live. Live state is clean: 0 `PI_*` names in the pane and tmux server environments.
- Proposed move: scrub `PI_*_MODEL`/`PI_CONFIG_FILES` in the spawn env, or state the residual channel honestly in the launcher header and the tower skill.

### F4 — one unvalidated spec field redirects both route sources (MEDIUM — upheld, sinks undercounted in r1)
`spec.ufoRoot` is checked only as a non-empty string and `path.resolve`d, then drives both the `l1Alias` read and the `--config` path. Lane 06 proved it with a fixture: `plan` exit 0 emitting `--model @deepseek-v4.1-flash:max` plus a fixture overlay with `modelRoles.smol`; r2 VerifyF4F9 reproduced it independently (`base='--force'` also echoed unvalidated).
- **Corrections (r2).** There are **two** validation sites, not one — the duplicate weak check at `:718-721` feeds the l1Alias read — and `ufoRoot` has **six** sinks, not two: it is also interpolated into the prompt's validator string (`:290`), the skill search dir (`:461`), the `fleet.json` record (`:565`), and at launch it **executes `bash <ufoRoot>/scripts/ufo-sighting`** (`:342,:371,:483`). The "exists / contains `config/ufo.json`" half of a proposed check already bites via `CONFIG_UNREADABLE` at `:112`; the missing half is the wall-script path.
- Related duplication (lane 17): the L1 route decision exists in three places — `config/ufo.json:85`, `agentModelOverrides.main`, `host/ufo-sighting-dispatch.json:4` — reconciled only by install-time assertions; and the wall's inquiry alias `@slow` is decided in bash with no authority (not on the tower-fleet launch path).
- Proposed move: validate `ufoRoot` (exists, carries `config/ufo.json` **and** `scripts/ufo-sighting`) and `base` (a ref, not an option-shaped token) before any argv is built.

### F5 — the shipped tests cannot catch the regressions that matter (HIGH — upheld, understated in r1)
- **[L1-verified]** `test/tower-fleet.test.mjs:195` inspects only the first `--model` occurrence. I appended a duplicate trailing `--model …:max` in a sandbox copy: the suite exited **0 with ALL CHECKS PASS** (73 ok / 0 fail) while the emitted argv carried the literal selector. R2 replayed it twice (VerifyF5, VerifyRecipe16, VerifySurfaces03) with the same result, and lane 07 measured the contrast: an in-place literal pin → `FAILURES 2`.
- **Corrections (r2).** (a) The blindness is **position-dependent**: the `at(-1)` check at `:198` would catch a token appended after the prompt reference, so the accurate phrasing is "a duplicate `--model` pair inserted before the prompt reference". (b) It is also **wider than `--model`**: VerifyF5's variant B appended `--smol=<selector>` and the suite still passed all 73 checks, i.e. any route-capable flag the suite does not enumerate is invisible; the forbidden-filter at `:196` covers only `-p/--print/--mode(=)`. (c) Round 1's clause "no assertion exists on `via.alias`" was **wrong as written**: `run-wave-test.mjs:121-130` does assert on `entry?.via?.alias`, but against the **candidate host config**, never the emitted payload — so nothing requires `^m_` shape or live-table membership. (d) No gate or doc ever *runs* the suite.
- The launcher suite is config-relative: it copies the real `config/ufo.json` and compares against `@${BAND.l1Alias}` read from that same file, so a `model:effort` value, a ghost `m_ghost_not_in_table`, and any non-`m_*` alias all pass (lanes 07, 19, 30-fold; r2 VerifyF5).
- Proposed move: assert *every* `--model` occurrence equals `@<alias>`; assert the alias matches `^m_*` **and** is a key of the live table; add a negative case for an appended route-capable flag. Lane 19's oracle variant already demonstrates the discriminating form.

### F6 — band provenance: snapshot and prompt are launch-time only (MEDIUM-LOW — upheld)
`fleet.json`'s band block and the rendered prompts are written once and never re-read (`fleet.json` is write-only — lane 27), while `main()` re-reads the live config per verb (`:713-722`). Today all sources agree (16/32/100/16, `m_strong`), but during the 01:22–01:30Z window the live authority carried `waveMinLanes 32 / waveMaxLanes 100 / minLanes 64`, i.e. all three sources disagreed, which is the drift class a delivered prompt cannot see: a prompt can instruct a wave width the validator then refuses.
- **Stale prose, corrected list (r2 VerifyF6F7).** `host/omp-agent.config.yml:190` says lane width is bounded "32-100 per wave" and `:197` says `waveMinLanes` was "raised from 16 to 32" — both contradicted by the 16–32 delta and the live config; `:195` ("Three separate 32s now coincide") is half-false (two are 32 today). The header's "twenty-nine chains" (`:33`) vs the real 31 is separate (lane 13). `conformance/vectors/native/execution-profile.json:4,8` names `m_daybreak` against the live `m_strong` (lane 09).
- **Withdrawn claim.** Round 1 said the stale prose "follows the same event" as the clobber; artifact history disproves the causal link — both phrases entered together in commit `16bf44d`, ~8 h before the clobber window. The observation stands; the causation does not.
- Proposed move: cite the band read time + config digest in `fleet.json` and on the prompt's band line, or move the band lines out of the frozen prompt into a live read.

### F7 — derived seat-routing mirror is a stale generation (MEDIUM — upheld, narrowed)
`crates/ufo-core-runtime/bundled/omp-seat-routing.json` is a whole prior generation (`seats.main.alias m_daybreak`, and `m_flash`/`m_zfl`/`m_kcode` absent from the live 19-key `modelRoles` — stale across 8 of 14 bundled seats); `build.rs:155-168,555-581` validates it against a stale sibling (`bundled/config.json`, also `m_daybreak`-era) so the compile gate self-passes, and `host/apply.mjs:16-17,92,726` deliberately leaves it stale, reporting an operator-owned WARNING. `sync-global-routing.mjs --check` exits 1 (lanes 32, 17; r2 VerifyF6F7, write-free).
- **Narrowing (r2).** The mirror's `main` primary route still exists in live as a chain step; the truly-dead routes are the `m_flash`/`m_zfl`/`m_kcode` cascades. The tower-fleet **dispatch surface is unaffected** — everything it emits is `@alias` — so claim 2 holds for the feature and not for the compiled judge-continuity layer.

### F8 — no credential screening on the surfaces the launcher prints (MEDIUM, hygiene — upheld, citations corrected)
The launcher has no `screen`/`redact` (lane 23): a credential-shaped `l1Alias` transits `band.l1Alias`, `ompArgv`, `launchArgv`, and the human plan verbatim (fixture-proven, `containsSensitiveShape=true`), and the wall persists `dispatch.argv` in `manifest.json` (mode 0600, dir 0700).
- **Corrections (r2 VerifyF8/VerifyCitations14).** The false unbounded promise is the mid-file comment `host/apply.mjs:940-941`, not the header — `:29-31` scopes its promise to captured subprocess output, which is true. The redact call sites are `:102` (`fail`), `:481` (local audit problems), `:604,:715,:716` (subprocess), `:741` (`warn`): the helpers do not redact their own argument, so `printPlan`'s dry run echoes unredacted — and the **broadest** echo is that dry run dumping every seat route and every effort-variant `modelRoles` value at `:257/:268`. Mode retention has a second site round 1 missed: `mergeDispatch:922` leaves a 0644 `config/ufo.json` at 0644 (and `backupFile:830-831` copies modes onto `.bak` files). A candidate-side input screen does exist (`preflightCandidate:213-221`) but covers neither echoed input.
- The published report itself scans clean for credential shapes under the substrate's own screen plus 11 broader classes (r2 VerifyF8).

### F9 — dead render value and a coarse placeholder regex (LOW — upheld, fix corrected)
`renderPrompt` supplies `l1Alias` (`:291`) but `l1-prompt.md` never uses it, so an L1 cannot report its own route provenance from its prompt (lanes 08, 02, 23).
- **Correction (r2 VerifyF4F9).** Round 1's proposed fix was self-defeating as written: the key name `l1Alias` contains a digit, so under the shipped `/\{\{([A-Za-z]+)\}\}/` class (`:293,:297`) `{{l1Alias}}` could never resolve — it would leak literally. Widen the class (or rename the key) **before** adding the placeholder. `test/tower-fleet.test.mjs:183` replicates the same coarse class, so the suite shares the blind spot. Latent today: the template has 0 digit/underscore placeholders.

### F10 — the audited table is the candidate, not the in-force table (MEDIUM — added in r2)
Rows 5–7 certify `host/omp-agent.config.yml`, but the file in force is the installed `~/.omp/agent/config.yml`. Both bodies have identical key sets (19 `modelRoles`, 14 seats, 31 chains, 145 steps) and differ on exactly one role value: `default`. Digests: candidate `15b40185…`, installed `798b3fb2…`, overlay `64ae2a83…`. Neither the surface table nor claim 2 said so until r2 (lane 14 graded the drift, lane 35 recorded the digest pair; the r1 synthesis dropped it; r2 VerifySurfaces02 caught the omission).
- Why it matters to this audit: `m_strong` — the alias the mission cares about — is identical in both bodies, so no finding changes. But the report's phrase "the alias table" must name its body, and an install of the candidate would change the everyday `default` route.
- Proposed move: have `plan` emit the resolved table digest (installed + overlay) alongside `band.l1Alias`, so a report like this one can bind its claims to a body.

## Round-2 verification (adversarial, 16 lanes)

Declared axes: `claim-accuracy`, `severity-calibration`, `repro-replay`, `quote-fidelity`, `residual-honesty`. Each lane was assigned a slice of the published r1 report and told to **falsify** it. Verdicts: **0 REFUTED · 16 UPHELD-or-UPHELD-WITH-CORRECTION**; 36/36 citations exact; every headline number and all four L1 probes reproduced.

| lane | slice | verdict | what changed |
| ---- | ----- | ------- | ------------ |
| VerifySurfaces01 | rows 1–4 | UPHELD-WITH-CORRECTION | cite both anti-pin clauses; label the two prose hits precisely; add the `configPath` addendum |
| VerifySurfaces02 | rows 5–7 | UPHELD-WITH-CORRECTIONS | **adds F10**; `:541-545` vs `:961-964`; candidate pins at `:231/:235/:698`; "install time only" → off the *dispatch* path; ≥6 predicates; `swarm.minLanes` unrange-checked |
| VerifySurfaces03 | rows 8–10 | UPHELD-WITH-CORRECTION | F5's `via.alias` clause was wrong; V2 blindness is position-dependent |
| VerifySurfaces04 | rows 11–13 | UPHELD-WITH-CORRECTION | evidence lives in the main checkout; spawn-only `{name,agent,task}`; 14/14 probes; registry row grew to 51 |
| VerifySurfaces05 | rows 14–16 | UPHELD-WITH-CORRECTION | the wall canonicalizes some flags (model/config untouched); digest typo; registry now r2 state |
| VerifyF1 | F1 | UPHELD-WITH-CORRECTION | two-consequence impact wording; off-path siblings `run-omp-native-trial.mjs:714-724` + omp's resolver; HIGH retained |
| VerifyF2 | F2 + V1 | UPHELD-WITH-CORRECTION | missing/corrupt overlay hard-errors at omp (mutants diagnostics-only); `configPath` drift; key list widened; severity reframed |
| VerifyF3 | F3 | UPHELD-WITH-CORRECTION | layer label fixed; impact overstated → LOW scope caveat; new ambient socket channel |
| VerifyF4F9 | F4 + F9 | UPHELD-WITH-CORRECTIONS | second validation site; six `ufoRoot` sinks incl. wall execution; F9's fix was self-defeating |
| VerifyF5 | F5 + V2 | UPHELD-WITH-CORRECTION | blindness extends to unenumerated route flags (`--smol=`); no gate runs the suite |
| VerifyF6F7 | F6 + F7 | UPHELD-WITH-CORRECTION | second stale sentence `:190`; causation withdrawn; mirror narrowing |
| VerifyF8 | F8 | UPHELD-WITH-CORRECTION | `:940-941` not the header; redact site set; `mergeDispatch:922`; broadest echo at `:257/:268`; report scans clean |
| VerifyInventory13 | tallies/traceability | UPHELD-WITH-CORRECTION | `BY-LUCK` normalization disclosed; `N/35` in 3 reports only; lane 20 was uncited; 29 named + 24 mirrors |
| VerifyCitations14 | whole-document citation sweep | **UPHELD** | 36/36 exact, 0 off-by-one, 0 misquotes; no missed gate in the citation layer |
| VerifyOverclaim15 | verdict/method/not-claimed | UPHELD-WITH-CORRECTION | 8 header/deviation defects (tally, `N/35`, registry rows, hash holder, evidence window, lane-writing clause, `:9` inconsistency, substrate clause) — all applied above |
| VerifyRecipe16 | re-run recipe | UPHELD-WITH-CORRECTION | all five steps reproduce and nothing hangs/mutates; block was only 2/5 copy-pasteable — recipe rewritten below |

Also round-2-relevant: an r1 lane (RoutingConnector35) self-corrected its own report and issued two corrections to peer lanes (07, 25), one of which withdrew a "stale hop" claim that round 1 had already declined to promote into this report.

## L1-verified probes (independently reproduced, then replayed by r2 lanes)

| # | claim | command shape | observed |
| - | ----- | ------------- | -------- |
| V1 | a CLI overlay outranks the global alias table for a route | `omp config get modelRoles --json` with/without `PI_CONFIG_FILES=<overlay declaring modelRoles.m_strong>` | base `alibaba-token-plan/deepseek-v4.1-flash:max` → overlay `fake-provider/l1-verify-fixture:high` (replayed by VerifyF2, VerifyF3, VerifyRecipe16) |
| V2 | the shipped launcher suite is blind to a duplicate `--model` pin | sandbox copy of `sighting/`+`test/`, append `"--model","…:max"` after `:326`, run `node test/tower-fleet.test.mjs` | exit **0 — ALL CHECKS PASS** (73 ok), emitted argv carries both tokens; in-place pin → `FAILURES 2` (replayed by VerifyF5, VerifyRecipe16, VerifySurfaces03) |
| V3 | the substrate ships a route-free-config gate and the live tree passes it | `node scripts/check-routing-free-config.mjs --root ufo-fsd-alpha` | `ok:true`, `violations: []`, `config/mission-nightcall.yml` in `scanned`; a pinned-overlay fixture root → exit 1 (replayed by VerifyF2, VerifyRecipe16) |
| V4 | the launcher's alias gate admits non-`m_*` tokens and refuses `/` | fixture-root `plan --json` over the poison matrix | see F1 (replayed by VerifyF1, VerifyF4F9, VerifyRecipe16, VerifyCitations14) |

## Method and provenance

- **Round plan (WWKD).** Data walk → skeleton (the audit checklist above) → overfit one real case (V4 + the exact live argv) → generalize into 32 disjoint read-only items. r1 axes: `route-provenance`, `pin-freedom`, `alias-shape`, `alias-liveness`, `overlay-neutrality`, `wave-route-shape`, `evidence-coverage`. r2 re-declared verification-shaped axes (see the r2 section).
- **Waves.** Validator `ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` under `UFO_PROJECT_ROOT=<fleet state dir>` and `UFO_CONFIG_PATH=<live ufo.json>`. r1 spec `tf-audit-routing-r1.folded.spec.json` → plan `ufo-swarm-wave-v1`, policy `waveMinLanes 16 / waveMaxLanes 32 / maxLanes 100`, counts `spawn 32, resume 0`. r2 spec `tf-audit-routing-r2.spec.json` → counts `spawn 16, resume 0`. Each wave was dispatched as one batched `task` call; the wave registry lives at `reports/tf-audit-routing/swarm-registry.json` (now 51 rows = 35 r1 + 16 r2, `wave: tf-audit-routing-r2`). Note, honestly: **no artifact witnesses the call count** — the one-batched-call shape is inferable from the single spawn-kind registry, not provable from it (r2 VerifyOverclaim15).
- **Routes.** No per-lane model param (the validator rejects one). Each lane ran on its taxonomy role's `@m_*` binding from `task.agentModelOverrides` (`scout/scribe → @m_fast`, `reviewer/executor/sentinel/revenger/connector → @m_mid`, `critic/planner → @m_strong`), resolved by omp from the operator's global config; lanes 18/22/25 verify the payload carries roles only, and lane 25 confirms the live seat keys match the candidate with 0 unbound roles.
- **Lane inventory.** r1: 32 lane reports, of which **29 are named lane files and 3 (lanes 04, 09, 16) exist only under their roster/mirror name**; 24 mirror files; plus `lane-05-driver.sh` and the registry. r2: 16 lanes, 2 artifacts each. Total ≥87 files under `.tower/fleets/tower1/reports/tf-audit-routing/`. Lane 20 (live-table keys) is cited explicitly in the Verdict; it was the one r1 artifact round 1 had left uncited (r2 VerifyInventory13).
- **Deviation, disclosed.** The r1 deck was dispatched as **35 lanes** that validated against a substrate band clobbered to `32–100` at 01:22Z (operator notice). After the 01:30Z restore to `16–32` I re-validated the folded **32-lane** spec, **stopped lanes 26, 30, 33** and folded their checks into same-surface siblings: 26→22 (`FOLD-26`), 30→07 (`FOLD-30`), 33→27 (`FOLD-33`), each fold delivered by `agent://` message and answered in the sibling's report. Consequences: the `N/35` deck label survives in exactly **3** reports (13, 16, 19) - 26 of the 29 named reports use a bare `Lane NN`; the registry keeps the 3 stopped members with `agentId: null`; lanes 26/30/33 have no report. The exact 01:22Z clobber moment leaves no backup, so the timeline is consistent but inferred.
- **Scope slips, disclosed.** Two lane artifacts landed inside the read-only worktree: r1 lane 05's `driver.sh` (preserved as `lane-05-driver.sh`) and r2 lanes VerifyF6F7 / VerifySurfaces02's mirror files under a stray `reports/tf-audit-routing/` dir (preserved as `worktree-mirror-*.md`). Both removed; the worktree is clean (`git status --porcelain` empty) and no feature byte changed (`tower-fleet.mjs d8d5b6ae…f72d4`, `l1-prompt.md df499cb4…fa3a7` before == after; the same values appear as lane baselines in lanes 04, 05 and 19).
- **Substrate.** No lane modified tracked content in `ufo-fsd-alpha` (byte hashes unchanged; `config/mission-nightcall.yml` = `64ae2a83fcdf…64fb2f46`). Within the r1 window the validator moved `scripts/ufo-swarm-wave.mjs`'s mtime with bytes equal to HEAD and created gitignored `.ufo/cache/node-compile` entries by being run; `config/ufo.json`'s modified state and its `.bak` files are the operator's own apply/restore (newest stamp 01:30:57Z, matching the restore).
- **Honest limits.** No lane launched omp, created a worktree, or drove the wall (read-only mandate), so: omp's *runtime* behavior on a ghost `@token`, on a missing `--config`, and duplicate-`--model` last-wins precedence are code-read facts (r2 VerifyF1 read the resolver out of the shipped binary; VerifyF2 probed the missing-overlay arm), marked INFERENCE in the lane reports where unrun. `~/.omp/agent/config.yml` was read **keys only**; no credential was printed anywhere (lane 23 audited this; r2 VerifyF8 re-audited the published report itself).

## Re-run recipe (self-contained)

```bash
# all steps: read-only. Never launch an interactive omp session or trigger a provider completion.
WT=/home/vgpnk/Projects/ompskills/.tower/worktrees/tower1/tf-audit-routing
UFO=/home/vgpnk/Projects/ufo-fsd-alpha
STATE=/home/vgpnk/Projects/ompskills/.tower/fleets/tower1
cd "$WT"

# 1. the r1 wave plan (writes nothing; stdout is deterministic and byte-identical to the stored plan)
UFO_PROJECT_ROOT="$STATE" UFO_CONFIG_PATH="$UFO/config/ufo.json" UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 \
  node "$UFO/scripts/ufo-swarm-wave.mjs" plan --spec "$STATE/tf-audit-routing-r1.folded.spec.json"

# 2. F1/V4: build a fixture ufoRoot and run the alias admit/refuse matrix
T=$(mktemp -d); mkdir -p "$T/ufoRoot/config" "$T/repo"
cp "$UFO/config/ufo.json" "$T/ufoRoot/config/ufo.json"
printf '%s' "{\"fleet\":\"probe\",\"repo\":\"$T/repo\",\"base\":\"main\",\"ufoRoot\":\"$T/ufoRoot\",
\"stateDir\":\"$T/state\",\"worktreeRoot\":\"$T/trees\",\"roundCeiling\":1,\"maxTime\":\"30m\",
\"missions\":[{\"id\":\"p1\",\"title\":\"p\",\"axis\":\"a\",\"goal\":\"g\",
\"scope\":[\"sighting/tower-fleet.mjs\"],\"skills\":[]}]}" > "$T/spec.json"
for V in m_strong deepseek-v4.1-flash:max totally_made_up_alias default \
         alibaba-token-plan/deepseek-v4.1-flash:max '@m_strong'; do
  python3 - "$T/ufoRoot/config/ufo.json" "$V" <<'PY'
import json,sys; p,v=sys.argv[1],sys.argv[2]; d=json.load(open(p))
d["sighting"]["dispatch"]["missionFormat"]["l1Alias"]=v; json.dump(d,open(p,"w"),indent=1)
PY
  printf '%-45s ' "$V"
  node sighting/tower-fleet.mjs plan --spec "$T/spec.json" --json 2>/dev/null \
    | python3 -c 'import json,sys; a=json.load(sys.stdin)["missions"][0]["ompArgv"]; print("ADMITTED", a[a.index("--model")+1])' \
    || echo "REFUSED (CONFIG_UNREADABLE)"
done

# 3. F2/V1: a CLI overlay outranks the global table for a route
printf 'modelRoles:\n  m_strong: fake-provider/l1-verify-fixture:high\n' > "$T/overlay.yml"
omp config get modelRoles --json | python3 -c 'import json,sys;print("base   ",json.load(sys.stdin)["value"]["m_strong"])'
PI_CONFIG_FILES="$T/overlay.yml" omp config get modelRoles --json \
  | python3 -c 'import json,sys;print("overlay",json.load(sys.stdin)["value"]["m_strong"])'

# 4. F5/V2: the suite is blind to a duplicate --model pin (sandbox; repo untouched)
S=$(mktemp -d); cp -r sighting test "$S/"; rm -rf "$S/test/evidence"
python3 - "$S/sighting/tower-fleet.mjs" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read(); old='    "--model", `@${authority.l1Alias}`,'
assert s.count(old)==1
open(p,"w").write(s.replace(old, old+'\n    "--model", "alibaba-token-plan/deepseek-v4.1-flash:max",'))
PY
node "$S/test/tower-fleet.test.mjs" | tail -1        # expect: ALL CHECKS PASS  (the blind spot)

# 5. V3: the substrate gate the feature never calls (live tree, then a pinned overlay)
node "$UFO/scripts/check-routing-free-config.mjs" --root "$UFO" | head -3
printf 'modelRoles:\n  main: fake-provider/x:high\n' > "$T/ufoRoot/config/mission-nightcall.yml"
node "$UFO/scripts/check-routing-free-config.mjs" --root "$T/ufoRoot" | head -5   # expect exit 1
```

## Not claimed

No fix was applied: this mission's scope is this report, so F1–F10 are findings plus proposed moves, none implemented or tested (verified again in r2: the gate is still charset-only, the overlay still unstat'd, `test:195` still first-occurrence). The audit is a static-plus-probe review of a read-only surface; it does not certify omp's internal resolver end-to-end, the compiled mirror's runtime behavior (no `cargo build` was run), or any upstream gate beyond the checks cited. Three residual unverifiables are named where they occur: the exact clobber moment, the single-batched-call shape, and omp's live behavior on the two INFERENCE-tagged paths.