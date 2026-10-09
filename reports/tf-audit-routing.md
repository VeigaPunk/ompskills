# tf-audit-routing — routing purity of the tower-fleet feature

| field | value |
| ----- | ----- |
| mission | `tf-audit-routing` (fleet `tower1`, axis `audit-routing`) |
| round | 1 — one validated wave of 32 read-only lanes (see *Method*) |
| subject | the tower-fleet feature: `sighting/tower-fleet.mjs`, `sighting/l1-prompt.md`, `.omp/skills/{tower,swarm}/SKILL.md`, `host/{omp-agent.config.yml,ufo-sighting-dispatch.json,apply.mjs}`, `test/*`, plus the cross-repo surfaces the feature drives (ufo-fsd-alpha `config/ufo.json`, `config/mission-nightcall.yml`, `scripts/ufo-sighting[.mjs]`, `scripts/ufo-swarm-wave.mjs`) |
| repos | `ompskills` @ worktree `.tower/worktrees/tower1/tf-audit-routing` (base `main` 3dee568); `ufo-fsd-alpha` read-only |
| deliverable | this file. No file outside `reports/tf-audit-routing.md` was edited by the L1; all 32 lanes were read-only and wrote only under `.tower/fleets/tower1/reports/tf-audit-routing/` |
| date | 2026-10-09 (lane evidence 01:19–01:36Z) |

## Verdict

**Claim 1 — "no provider/model is pinned anywhere in the tower-fleet feature": PASS (verified).**
An exhaustive token sweep of the ten feature files finds **0 route-pins**. Every provider/model literal in the set lives inside the alias table itself (`host/omp-agent.config.yml`: 176 concrete-selector lines = `modelRoles` values + chain steps + concrete chain keys) or inside the substrate's gemini-ban guard, and the only model names in prose are `Kimi-style` / `kimi's 5-per-700ms` in `.omp/skills/swarm/SKILL.md:4,92`. The launcher emits exactly one route token, read live at run time: `sighting/tower-fleet.mjs:326` → `--model @${authority.l1Alias}`, where `l1Alias` comes from `<ufoRoot>/config/ufo.json` `sighting.dispatch.missionFormat.l1Alias` (`:132`), live value `m_strong`.

**Claim 2 — "every route resolves through the global `m_*` alias table": PASS AT REST, BY LUCK AT RUN TIME.**
`m_strong` is a live `modelRoles` key (`~/.omp/agent/config.yml`, 19 keys) and all 14 `task.agentModelOverrides` seats bind to quoted `@m_*` aliases, so today's emitted route resolves through the table. But the rule that makes this true is machine-checked at **zero points on the path the launcher executes** (F1), and the launcher injects a route-capable config overlay it never inspects (F2). Two gaps, both cheap to close, plus seven lower-severity findings.

Lane verdicts: **8 CLEAN · 24 CLEAN-WITH-GAP · 0 VIOLATION** (32 lanes; report files under `.tower/fleets/tower1/reports/tf-audit-routing/`).

## Audited surfaces

| # | surface | verdict | load-bearing evidence |
| - | ------- | ------- | --------------------- |
| 1 | `sighting/tower-fleet.mjs` | clean, no pin | 0 provider/model tokens; single route emission at `:326`; full omp flag set is `--cwd --session-dir --max-time --model --config --print-thoughts --auto-approve` (no `--smol/--slow/--plan/--advisor/-m`) (lanes 01, 02) |
| 2 | `sighting/l1-prompt.md` | clean, 1 dead value | 0 tokens; `{{l1Alias}}` never referenced although `renderPrompt` supplies it (`:291`) (lanes 08, 02) |
| 3 | `.omp/skills/tower/SKILL.md` | clean | alias names only (`m_strong/m_mid/m_fast`), explicit anti-pin rule at `:145-146` (lane 10) |
| 4 | `.omp/skills/swarm/SKILL.md` | clean | 0 tokens; 2 prose hits (`Kimi-style`) (lane 11) |
| 5 | `host/omp-agent.config.yml` | table-conformant | 19 `modelRoles` (0 `@`-valued), 14 seats all `"@m_*"`, 31 chain keys / 145 steps all `provider/model[:effort]`, 0 dead-weight keys, 0 bare-distinctness violations (lanes 13, 14) |
| 6 | `host/ufo-sighting-dispatch.json` | clean | 6 keys: 5 band integers + `missionFormat.l1Alias="m_strong"`; no selector (lane 15) |
| 7 | `host/apply.mjs` | clean, installer-only gate | enforces `l1Alias ∈ modelRoles` (`:958`) and `seats.main.alias === l1Alias` (`:961-964`) — at install time only (lanes 15, 35) |
| 8 | `test/tower-fleet.test.mjs` | clean, blind | see F5 (lanes 07, 02, 19) |
| 9 | `test/run-wave-test.mjs` | clean, name-gated | `"model" in task` predicate at `:550`; a `selector` key passes all 61 checks (lane 21) |
| 10 | rendered `.tower/fleets/tower1/*.prompt.md` (16) | clean | 0 provider/model ids; band lines `16–32`/`100`; no alias value, no `--config` text (lane 28) |
| 11 | `tower1/spec.json`, `tower1/fleet.json` | clean | only routing identifier is `band.l1Alias="m_strong"`; 2 exhaustive jq scalar sweeps → 0 literal hits (lane 27) |
| 12 | wave payload (`ufo-swarm-wave.mjs`) | clean | `SPEC_KEYS`/`ITEM_KEYS` (`:273-274`) accept no route key — 12/12 rejection probes typed `invalid_spec`; emitted lane objects are exactly `{name, agent: <role>, task}` (`:1187`) (lanes 18, 22, 09) |
| 13 | wave evidence (`test/evidence/wave-*`) | clean | `dispatch-32.json` / `plan-32.stdout.json` / `swarm-registry.json` / `ufo-mission-result.json`: 0 model/provider/route/alias fields anywhere (lane 22 FOLD-26) |
| 14 | wall CLI launch path | clean | `bash scripts/ufo-sighting launch … -- <omp argv>` forwards verbatim; `model` occurs 0 times in `ufo-sighting.mjs`; no `PI_*_MODEL` or tmux env injection (lanes 16, 31) |
| 15 | `mission-nightcall.yml` (injected overlay) | route-free today | keys: `extendedContext`, `advisor.enabled`, `task.maxConcurrency`, 4 `retry.*`; 0 selectors (lane 34) |
| 16 | local `reports/tf-audit-routing/swarm-registry.json` | clean | members carry `{kind, agentId, role, item, axes, milestone}` — no route field (lane 22) |

## Findings

Severity is my judgment as the mission's single judge; every claim below cites lane evidence I re-read, and the four claims I reproduced myself are marked **[L1-verified]**.

### F1 — the `m_*` alias rule has no machine check on the executed path (HIGH)
`loadBandAuthority` validates `l1Alias` with a single charset test — `sighting/tower-fleet.mjs:137` `/^[A-Za-z0-9_.:-]+$/` — which admits any provider-less token. The launcher then emits `--model @<token>` verbatim at `:326`.
- **[L1-verified]** my overfit probes (fixture root, `plan --json`): `m_strong` → `--model @m_strong` (live control); `deepseek-v4.1-flash:max` → **exit 0**, `--model @deepseek-v4.1-flash:max`; `totally_made_up_alias` → **exit 0**, `--model @totally_made_up_alias`; `alibaba-token-plan/deepseek-v4.1-flash:max` and `@m_strong` → exit 2 `CONFIG_UNREADABLE` (only `/` and `@` are refused).
- Lane 04 (mutants a–e) and lane 19 (M2/M3) reproduce the same admission set; lane 35 adds `@slow @default @plan @smol @LUNA @_x @m_strong_typo @m_strong:high @qwen3.8-flash:high` — all **accepted**, and notes the substrate's own dispatcher has a stricter 4-layer chain (`fleet-dispatcher.mjs:222 L1_ALIAS_PATTERN` → `:3667 resolveAliasRouting` against the *live* table) that the tower-fleet path never runs.
- The install-time gate is real but off-path: `host/apply.mjs:958` `resolved.modelRoles.has(l1Alias)` (lane 15, and `:230/:235` reads the **candidate** file, not the installed one — lane 35). Built-in roles `default/smol/slow/plan` are `modelRoles` keys, so even that check does not imply `m_*`.
- Impact: the invariant the tower skill states (`bare m_* aliases; never a pinned provider/model`) and the mission's claim 2 hold only because today's `config/ufo.json` says `m_strong`. A drifted/edited `ufoRoot` (F4) or a typo'd alias reaches omp as a dangling `@token` with no refusal.
- Proposed move (not applied — out of scope): gate the emitter, not just the installer — require `^m_[A-Za-z0-9_]+$` **and** membership in the live global `modelRoles` inside `loadBandAuthority`, with a typed refusal.

### F2 — the launcher injects a route-capable config overlay it never validates (HIGH)
`buildOmpArgv` unconditionally appends `--config <ufoRoot>/config/mission-nightcall.yml` (`sighting/tower-fleet.mjs:327`) with no `existsSync`, stat, or parse; `grep` finds exactly one reference to the overlay in the whole worktree (line 327).
- omp documents `--config` as an extra overlay loaded **after** global and project settings, and documents `modelRoles` / `retry.fallbackChains` / `task.agentModelOverrides` as live routing keys (omp://settings.md:21,110,117). Lane 03's live probe via the same CLI-overlay layer (`PI_CONFIG_FILES`) shows the overlay beating the global table; **[L1-verified]** I reproduced it: base `modelRoles.m_strong = alibaba-token-plan/deepseek-v4.1-flash:max` → with a one-line overlay `fake-provider/l1-verify-fixture:high`. Lane 34 confirms the live effect of the real overlay (`retry.fallbackRevertPolicy` `cooldown-expiry→never`, `advisor.enabled` `false→true`, `task.maxConcurrency` `32→0`) while the 30-key global `fallbackChains` set survives.
- Lane 05's mutant battery: pinned overlay, missing overlay, directory, corrupt YAML, symlink-to-`/dev/null`, and a second `ufoRoot` — **6/6 survived**, all exit 0 with the same argv; `plan` output is overlay-content-blind.
- The substrate already ships the exact compensating gate — `ufo-fsd-alpha/scripts/check-routing-free-config.mjs` — which flags a pinned overlay (lane 05: exit 1, keys `modelRoles`+`agentModelOverrides`) and **[L1-verified]** passes the real tree (`--root ufo-fsd-alpha` → `ok:true`, scanning `config/mission-nightcall.yml`), but it is wired only into `package.json contracts:check` / `gates.sh`, never into the feature.
- Proposed move: stat the overlay in `loadBandAuthority`/`buildOmpArgv` and refuse (or warn typed) if it declares `modelRoles`, `retry.fallbackChains`, `task.agentModelOverrides`, or a preset/agent model key.

### F3 — the process the launcher starts is not route-pinned (MEDIUM, provenance honesty)
The header comment's "nothing pins a provider/model" is true of the argv tower-fleet builds, not of the process it launches. `run()` (`:359`) passes no `env` key, so ambient variables are inherited.
- Lane 06 (fixture + live probes): `PI_SMOL_MODEL`/`PI_SLOW_MODEL`/`PI_PLAN_MODEL` override `modelRoles.{smol,slow,plan}` at omp's *top* precedence layer, and `PI_CONFIG_FILES` injects extra overlays before `--config`; a parent-set `PI_SMOL_MODEL` reached the child. tmux socket probes show pane inheritance is conditional — severed when an existing tmux server is reused, live when the launcher's `wallCli(spec,"open")` starts a fresh one. Live state today is clean: 0 `PI_*` names in the pane and tmux server environments.
- Proposed move: either scrub `PI_*_MODEL`/`PI_CONFIG_FILES` in the spawn env, or state the residual channel in the launcher header comment and the tower skill.

### F4 — one unvalidated spec field redirects both route sources (MEDIUM)
`spec.ufoRoot` is only checked as a non-empty string and `path.resolve`d (`sighting/tower-fleet.mjs:193-195`), then drives **both** the `l1Alias` read (`:107-132`) and the `--config` path (`:327`). Lane 06 proved it with a fixture: `plan` exit 0 emitting `--model @deepseek-v4.1-flash:max` plus a fixture overlay carrying `modelRoles.smol`. Lane 29 additionally shows `spec.base` is unvalidated and becomes a positional to `omp worktree add` at launch (INFERENCE — `launch --apply` not run).
- Related duplication (lane 17): the L1 route decision exists in three places — `config/ufo.json:85`, `agentModelOverrides.main`, `host/ufo-sighting-dispatch.json:4` — reconciled only by install-time assertions; and the wall's *inquiry* path hardcodes `--model @slow` in bash (`scripts/ufo-sighting:65`, a role alias, not `m_*`), decided with no authority. Not on the tower-fleet launch path (lanes 16, 31).
- Proposed move: validate `ufoRoot` (exists, contains `config/ufo.json` and `scripts/ufo-sighting`) and `base` (a ref, not an option-shaped token) before an argv is built.

### F5 — the shipped tests cannot catch the regressions that matter (HIGH, evidence quality)
- **[L1-verified]** `test/tower-fleet.test.mjs:195` inspects only the **first** `--model` occurrence. I appended a duplicate trailing `--model alibaba-token-plan/deepseek-v4.1-flash:max` in a sandbox copy: the suite exited **0 with ALL CHECKS PASS** while the emitted argv carried the literal selector. Lane 07 measured the same in-place: a direct literal pin → `FAILURES 2`; the duplicate trailing pin → `ALL CHECKS PASS`; and omp resolves duplicate `--model` last-wins (`fake-omp.mjs:114-116`, per lanes 07/02/31).
- The suite is config-relative: it copies the real `config/ufo.json` and compares against `@${BAND.l1Alias}` read from the same file, so a `model:effort` value, a ghost `m_ghost_not_in_table`, or any non-`m_*` alias passes (lanes 07, 19, 30-fold).
- `test/run-wave-test.mjs:550` gates only a key literally named `model`; a per-lane concrete selector under key `selector` passes all 61 checks (lane 21, q1b), and no assertion exists on `via.alias` (lane 21, q3b).
- Proposed move: assert *every* `--model` occurrence equals `@<alias>`; assert the alias matches `^m_*` **and** is a key of the live table; give the wave suite a via-alias predicate. (Lane 19's "oracle" variant already demonstrates the discriminating form.)

### F6 — band provenance: snapshot and prompt are launch-time only (MEDIUM-LOW)
`fleet.json`'s band block and the rendered prompts are written once and never re-read (`fleet.json` is write-only — lane 27), while `main()` re-reads the live config per verb (`:713-722`). Today all sources agree (16/32/100/16, `m_strong`), but during the 01:22–01:30Z window all three sources disagreed (the live authority carried `waveMinLanes 32 / waveMaxLanes 100 / minLanes 64`), which is exactly the class of drift a delivered prompt cannot detect: a prompt can instruct a wave width the validator then refuses. Stale prose follows the same event: `host/omp-agent.config.yml:196-205` still says "raised from 16 to 32" against a 16–32 delta (lanes 12, 22), the same file's header says "twenty-nine chains" where the table has 31 (lane 13), and `conformance/vectors/native/execution-profile.json` names `m_daybreak` against the live `m_strong` (lane 09).
- Proposed move: cite the band read time + config hash in `fleet.json` and on the prompt's band line, or move the band lines out of the frozen prompt into a live read.

### F7 — derived seat-routing mirror is a stale generation (MEDIUM, cross-repo)
`crates/ufo-core-runtime/bundled/omp-seat-routing.json` is a whole prior generation (`main.alias m_daybreak`, `m_flash`/`m_zfl`/`m_kcode` absent from the live table); `build.rs` validates it against a stale sibling so the compile gate self-passes, and `host/apply.mjs` deliberately leaves it stale, reporting it as an operator-owned WARNING (lane 32; `sync-global-routing.mjs --check` exits 1 — lane 17). **The tower-fleet dispatch surface is unaffected** (everything it emits is `@alias`), but the compiled judge-continuity layer can step lanes through routes the live table no longer has.
- Report-only: it is operator-owned derived state; the honest statement is that claim 2 holds for the feature's dispatch surface and not for the compiled mirror.

### F8 — no credential screening on the surfaces the launcher prints (MEDIUM, hygiene)
The launcher has no `screen`/`redact` (lane 23): a credential-shaped `l1Alias` transits `band.l1Alias`, `ompArgv`, `launchArgv`, and the human plan verbatim (fixture-proven, `containsSensitiveShape=true`), and the wall persists `dispatch.argv` in `manifest.json`. `host/apply.mjs`'s dry run printed the live `config/ufo.json` `l1Alias` value **unredacted** despite its header claim (`say()/ok()/note()` skip `redact`, which wraps only `fail()` and subprocess lines), and `installConfig:856` preserves an existing file's mode instead of clamping `0600`. Live state is clean (config 0600, 0 flagged lines, 14/14 seat values alias-shaped); no credential was found on any audited surface.
- Proposed move: screen `l1Alias` with the substrate's `containsSensitiveShape` at load, route all launcher/applier output through the same redact, clamp installed modes.

### F9 — dead render value and a coarse placeholder regex (LOW)
`renderPrompt` supplies `l1Alias` (`:291`) but `l1-prompt.md` never uses it, so an L1 cannot report its own route provenance from its prompt (lanes 08, 02, 23). The substitution/residual regex `/\{\{([A-Za-z]+)\}\}/` (`:293,297`) would leave a placeholder containing `_`/digits silently unresolved (lane 08, source-read INFERENCE).
- Proposed move: either render the alias into the prompt's identity table or delete the value; widen the placeholder class.

## L1-verified probes (independently reproduced, not relayed)

| # | claim | command shape | observed |
| - | ----- | ------------- | -------- |
| V1 | a CLI overlay outranks the global alias table for a route | `omp config get modelRoles --json` with and without `PI_CONFIG_FILES=<overlay declaring modelRoles.m_strong>` | base `alibaba-token-plan/deepseek-v4.1-flash:max` → overlay `fake-provider/l1-verify-fixture:high` |
| V2 | the shipped launcher suite is blind to a duplicate trailing `--model` pin | sandbox copy of `sighting/`+`test/`, append `"--model","alibaba-token-plan/deepseek-v4.1-flash:max"` after `:326`, run `node test/tower-fleet.test.mjs` | suite exit **0 — ALL CHECKS PASS**; emitted argv carries `['@m_strong','alibaba-token-plan/deepseek-v4.1-flash:max']` |
| V3 | the substrate ships a route-free-config gate and the live tree passes it | `node scripts/check-routing-free-config.mjs --root ufo-fsd-alpha` | `ok:true`, `violations: []`, `config/mission-nightcall.yml` in `scanned` |
| V4 | the launcher's alias gate admits non-`m_*` tokens and refuses `/` | fixture-root `plan --json` with 5 poisoned `l1Alias` values | see F1 (2 admitted dangling, 2 refused, 1 admitted live control) |

## Method and provenance

- **Round plan (WWKD).** Data walk → skeleton (the audit checklist above) → overfit one real case (V4 + the exact live argv) → generalize into 32 disjoint read-only items, each one file-or-probe with one taxonomy role and 1–2 axes. Round-1 axis set (dynamic, per round): `route-provenance`, `pin-freedom`, `alias-shape`, `alias-liveness`, `overlay-neutrality`, `wave-route-shape`, `evidence-coverage`.
- **Wave.** Validator `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` under `UFO_PROJECT_ROOT=<fleet state dir>` and `UFO_CONFIG_PATH=<live ufo.json>`; spec `.tower/fleets/tower1/tf-audit-routing-r1.folded.spec.json`; `plan` → `ufo-swarm-wave-v1`, policy `waveMinLanes 16 / waveMaxLanes 32 / maxLanes 100`; counts `spawn 32, resume 0`. Dispatched as **exactly one** batched `task` call; registry recorded at `reports/tf-audit-routing/swarm-registry.json`.
- **Routes.** No per-lane model param (validator rejects one). Each lane ran on its taxonomy role's `@m_*` binding from `task.agentModelOverrides` (`scout/scribe → @m_fast`, `reviewer/executor/sentinel/revenger/connector → @m_mid`, `critic/planner → @m_strong`), resolved by omp from the operator's global config; lanes 18/22/25 independently confirm the payload carries roles only, and lane 25 confirms `~/.omp/agent/config.yml` seat keys match the candidate with 0 unbound roles.
- **Lane inventory.** 32 reports + mirrors + `lane-05-driver.sh` + `swarm-registry.json` (55 files) under `.tower/fleets/tower1/reports/tf-audit-routing/`.
- **Deviation, disclosed.** The wave was dispatched as a 35-lane deck that validated against a substrate band that had been clobbered to `32–100` at 01:22Z (operator notice). On the 01:30Z restore to `16–32`, I re-validated against the restored band, **stopped 3 lanes** (26, 30, 33) and folded their checks into same-surface siblings (22, 07, 27 — each fold message is in those lanes' transcripts and reports), giving the compliant 32-lane wave above. Consequences: lane labels inside the reports read `N/35` (pre-fold deck size), the registry keeps 35 member rows of which the 3 folded members carry `agentId: null`, and lanes 26/30/33 have no report. Their content is covered by lanes 22 (FOLD-26), 07 (FOLD-30) and 27 (FOLD-33).
- **Scope slip, disclosed.** Lane 05 left a throwaway bash driver at the worktree root (`driver.sh`). I preserved it as evidence at `reports/tf-audit-routing/lane-05-driver.sh` and removed it; the worktree is clean (`git status --porcelain` empty) and no feature byte changed (hashes: `tower-fleet.mjs d8d5b6ae…f72d4` and `l1-prompt.md df499cb4…fa3a7` before == after; the same values appear as lane baselines in lanes 05/19/24).
- **Substrate untouched.** No lane wrote into `ufo-fsd-alpha`; `config/ufo.json` carries the operator's own restore (mtime 01:30:57Z) and `config/mission-nightcall.yml` is byte-identical to the pre-audit hash `64ae2a83…f2f46`.
- **Honest limits.** No lane launched omp, created a worktree, or drove the wall (read-only mandate), so: omp's *runtime* resolution of a dangling `@token`, omp's behavior on a missing/corrupt `--config` overlay, duplicate-`--model` last-wins precedence, and the last hop wall→pane→spawn are code-read or pure-function facts, marked INFERENCE in the lane reports. `~/.omp/agent/config.yml` was read **keys only**; no credential was printed anywhere (lane 23 audited this).

## Re-run recipe

```bash
# the wave itself (read-only, writes nothing)
UFO_PROJECT_ROOT=/home/vgpnk/Projects/ompskills/.tower/fleets/tower1 \
UFO_CONFIG_PATH=/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json \
UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 \
  node /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs plan \
  --spec /home/vgpnk/Projects/ompskills/.tower/fleets/tower1/tf-audit-routing-r1.folded.spec.json

# F1: admit/refuse matrix for the alias gate
node sighting/tower-fleet.mjs plan --json --spec <fixture spec with a poisoned ufoRoot>

# F2/V1: overlay precedence over the global table
omp config get modelRoles --json                      # base
PI_CONFIG_FILES=<overlay with modelRoles.m_strong> omp config get modelRoles --json

# F5/V2: the suite's blindness to a duplicate trailing --model
#   copy sighting/ + test/ to a sandbox, append the duplicate pin after :326,
#   node test/tower-fleet.test.mjs   -> expects ALL CHECKS PASS (the bug)

# V3: the substrate gate the feature does not call
node /home/vgpnk/Projects/ufo-fsd-alpha/scripts/check-routing-free-config.mjs \
  --root /home/vgpnk/Projects/ufo-fsd-alpha
```

## Not claimed

No fix was applied: this mission's scope is this report, so F1–F9 are findings plus proposed moves, none of them implemented or tested. The audit is a static+probe review of a read-only surface; it does not certify omp's internal alias resolution, the compiled mirror's behavior, or any upstream repo's own gates beyond the checks cited above.