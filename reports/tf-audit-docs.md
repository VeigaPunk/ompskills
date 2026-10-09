# tf-audit-docs — band-number and interface consistency audit

Mission `tf-audit-docs` · fleet `tower1` · axis `audit-docs` · base `main` @ `3dee568`
Deliverable scope: this file only. Round 1 wave: **32 lanes** (band `16–32` per wave, round ceiling 100),
dispatched as **one** batched `task` call; registry `.tower/fleets/tower1/reports/tf-audit-docs/swarm-registry.json`.
Lane reports: `.tower/fleets/tower1/reports/tf-audit-docs/<Lane>.md`.

Feature under audit (in-repo): `.omp/skills/tower/SKILL.md`, `.omp/skills/swarm/SKILL.md`,
`sighting/l1-prompt.md`, `sighting/tower-fleet.mjs`, `host/apply.mjs`, `host/omp-agent.config.yml`,
`host/ufo-sighting-dispatch.json`, `test/sighting-wave-smoke.md`, `test/run-wave-test.mjs`,
`test/tower-fleet.test.mjs`, `test/evidence/.gitignore`.

---

## 1. Method and authorities

Claims are checked against an **authority**, never against another doc.

| Authority | Path | Decides |
| --- | --- | --- |
| band/ceiling | `<ufoRoot>/config/ufo.json` | `sighting.dispatch.swarm.{maxLanes,minLanes,waveMinLanes,waveMaxLanes}`, `sighting.windowPaneCeiling`, `sighting.dispatch.{maxConcurrentL1,globalRunnerCeiling}`, `missionFormat.{l1Alias,configPath}` |
| real planner | `<ufoRoot>/scripts/ufo-swarm-wave.mjs` | band gates, refusal codes, payload, registry |
| policy loader | `<ufoRoot>/scripts/ufo-mission-result.mjs` | `MAX_SWARM_LANES=100`, `MIN_SWARM_LANES=2`, band fallbacks |
| wall CLI | `bash <ufoRoot>/scripts/ufo-sighting surface --json` | verbs, flags, exit codes, caps, error codes |
| live routing | `~/.omp/agent/config.yml` | `task.agentModelOverrides`, `task.{maxConcurrency,maxRecursionDepth}`, `modelRoles` |
| live behaviour | executed commands | every probe recorded below and in the lane reports |

Verdicts: **MATCH** / **DRIFT** / **STALE** / **UNVERIFIABLE** (one raised: `TowerRevengerParity` 14, the
hook-discovery roots — see "Contested / not reproduced"). Provenance: `main` = reproduced by the L1 itself; otherwise the named lane's report is the
evidence (32/32 lanes returned; all 32 reports on disk).
No lane wrote inside this worktree (`git status --porcelain` empty modulo the untracked `reports/`).

---

## 2. Environment event — the band authority flipped mid-mission

Not a doc defect, but the frame for every band claim.

| Time (−03) | `config/ufo.json` swarm block | Meaning |
| --- | --- | --- |
| 22:19 (fleet launch) | `100 / minLanes 16 / waveMin 16 / waveMax 32` | post-apply band 16–32 |
| 22:22:15 (mtime) | `100 / 64 / 32 / 100` | **clobbered** to the pre-apply state (operator note: a lane wrote through a symlink into the substrate) |
| 22:29 (probe) | floor 32 | a 29-lane spec was refused `too_few_lanes` ("needs at least 32 lanes") → this wave was sized to **32**, the only width inside both the mission's declared 16–32 band and the live 32–100 band |
| 22:30:57 (mtime) | `100 / 16 / 16 / 32` | **restored**; the 32-lane wave re-validated (`plan` exit 0) and dispatched |
| HEAD (`git show HEAD:config/ufo.json`) | `100 / 64 / 32 / 100` | **the post-apply band exists only as an uncommitted working-tree state**; `git diff` changes exactly those three values |

Consequences the docs must be read against:

1. Every "post-apply 16–32" statement is conditional on that uncommitted merge. `test/run-wave-test.mjs`
   guards it correctly (`--band live` → `apply_not_landed` while `waveMinLanes !== delta`, `:458-462`),
   but `sighting/l1-prompt.md:43` and both SKILLs state the band as a rendered fact with no guard — a
   fleet launched against the pre-apply substrate is handed a prompt asserting a band its own validator
   refuses (exactly what happened to this mission at 22:29).
2. The docs that require "read live, never hardcoded" (tower SKILL:143-144) are themselves the
   hardcoded restatements (§3 M2, M3, M10).

---

## 3. Findings

Severity is the integrator's: **HIGH** = following the text this round hits a refusal or a wrong action;
**MEDIUM** = wrong semantics/interface, recovery obvious; **LOW** = wording, completeness, test signal.

### HIGH

| # | Claim (quoted) | Location | Authority / evidence | Fix | Lane |
| --- | --- | --- | --- | --- | --- |
| **H1** | `\| lane reports \| {{reportDir}} \|` and "Every lane writes its scoped report under `{{reportDir}}`" — rendered **absolute** (`/home/…/fleets/tower1/reports/tf-audit-docs`) | `sighting/l1-prompt.md:47`, `:79`; value from `sighting/tower-fleet.mjs:289` (`path.join(absolute stateDir,"reports",id)`) | the planner refuses an absolute spec `reportDir`: **`invalid_report_dir` "reportDir must be a relative path"** — hit by `main` while building this wave's spec; the live registry stores `reportDir:"reports/tf-audit-docs"`; lane `.md` files split between the fleet dir and per-worktree `reports/` because no lane's cwd made the doc's path writable | "lane reports: `reports/{{missionId}}` — **relative**; an absolute `reportDir` is refused `invalid_report_dir`; lanes resolve it against their cwd" | `TowerCriticStateLayout` R4; reproduced `main` |
| **H2** | "Before any cleanup, inspect with `omp worktree list` (`--json` for machine reading)" | `.omp/skills/tower/SKILL.md:110-111` | `omp worktree list --json` → `[]`; human form → "No agent-managed worktrees found under /home/vgpnk/.omp/wt." while `git -C …/ompskills worktree list` shows **23** trees incl. every `.tower/worktrees/tower1/tf-*`; the CLI enumerates only `OMP_WORKTREE_DIR ?? worktree.dir ?? <omp-data>/wt` | "inspect with `git -C REPO worktree list`; `omp worktree list` sees only agent-managed trees under `worktree.dir` (default `~/.omp/wt`)" | `TowerCriticWorktree` W2; reproduced `main` |
| **H3** | Load order: "read them explicitly, **in this order**: … 4. `skill://wwkd`" (mandatory list); "`skill://ufo` is optional … only when your repo is the UFO substrate" | `sighting/l1-prompt.md:17-25` | from the mission worktree `read skill://wwkd` → **"Unknown skill: wwkd / Available: godspeed, omarchy, swarm, tower"** (`main`); `wwkd`/`ufo` live only under `<ufoRoot>/.omp/skills/` and `<ufoRoot>/skills/`, neither a resolver root for a worktree cwd; the fleet spec installs no skills (`fleet.json missions[].skills` absent → `[]`, `copySkill` copies nothing); the UFO authority itself calls external wwkd "enrichment … its absence never blocks activation" (`<ufoRoot>/skills/ufo/SKILL.md:53`) | mark entry 4 optional with the concrete `<ufoRoot>/skills/wwkd/SKILL.md` fallback, replace `skill://ufo` with a real path, or declare `skills:["tower","godspeed","swarm","wwkd"]` in the fleet spec | `TowerMutationLoadOrder` 4/5/7; reproduced `main` |
| **H4** | "**The Godspeed hook** … enforces it for every `task` dispatch, batched or flat" (swarm SKILL:113-114); "prepends the leading `/skill:godspeed` line to each dispatch — … shapes alike" (tower SKILL:51-53); "the fleet renderer prepends it to a launched mission prompt" (tower SKILL:53-54) | as quoted | hook `ufo-fsd-alpha/.omp/hooks/pre/ufo-godspeed-inject.js:17-20`: it loads **only for OMP sessions rooted in `ufo-fsd-alpha`**; tower L1 sessions run `omp --cwd <worktree>` rooted in `ompskills`, so the hook never loads there; `tower-fleet.mjs` contains **no** godspeed string — the line ships as `l1-prompt.md:2` (as the **second** line, after `/skill:tower`), and the smoke doc says this correctly ("The Godspeed hook is project-scoped", `smoke:50-53`) | append the scope clause to both SKILLs, and correct "renderer prepends" → "the L1 prompt template leads with it"; add the idempotence qualifier ("…that does not already open with it") | `GodspeedHookProvenance` 6/7/8; `TowerConnectorWall` 3 |
| **H5** | placeholder guard `/\{\{([A-Za-z]+)\}\}/g` + fail-closed re-check + the test assertion all use `[A-Za-z]+` | `sighting/tower-fleet.mjs:293`, `:297`; `test/tower-fleet.test.mjs:183` | the values map's one unused key is `l1Alias` (`:291`); `{{l1Alias}}` contains a digit → the regex cannot match it → it would render **literally**, pass the guard, and pass the test. All 17 current tokens resolve (no `RENDER_UNRESOLVED` reachable) | delete the unused `l1Alias` value or widen template/guard/test regexes together to `[A-Za-z][A-Za-z0-9]*` | `TowerExecutorTemplates` 2; pattern read by `main` |
| **H6** | Step 7 asserts `reportSummary.present == 16` under its own example env `UFO_PROJECT_ROOT=<stamp>/ufo-root` | `test/sighting-wave-smoke.md:328`, `:341-342` | collector stats `join(ROOT, reportDir, <Name>.md)` (`ufo-swarm-collect.mjs:619`) while the reports land under `$REPO/test/evidence/<stamp>/lane-reports/` (the doc says so at `:279-282`) → the example yields `present:0, missing:16` on a clean wave | copy the landed reports under the scratch root before `collect`, or re-root `collect` at `$REPO` | `SmokeReviewerCollect` F1 (deterministic path arithmetic) |

### MEDIUM

| # | Claim | Location | Authority / evidence | Fix | Lane |
| --- | --- | --- | --- | --- | --- |
| **M1** | "kept byte-for-byte with the seat-routing table so regenerating the mirror is a no-op" | `host/omp-agent.config.yml:73-74` | `crates/ufo-core-runtime/bundled/omp-seat-routing.json` records `source.sha256: dc31bdb2…` and binds foreign aliases (`m_antigravity/m_luna/m_flash/m_zfl/m_daybreak/m_kcode`); `sha256sum ~/.omp/agent/config.yml` = `798b3fb2…`; `sync-global-routing.mjs --check` → exit 1 | "the bundled mirror is stale — regenerate with `node scripts/sync-global-routing.mjs`; `--check` fails until then" | `HostRevengerDelta` 12 |
| **M2** | "bounds lane width itself (**32-100 per wave**, 100 members per L1)"; "sighting.dispatch.swarm's `waveMinLanes` (ufo's per-wave floor, **raised from 16 to 32**)"; "Three separate 32s now coincide" | `host/omp-agent.config.yml:190-191`, `:195-197` | live `waveMinLanes 16 / waveMaxLanes 32`; the 32 is the **ceiling** key; only **two** 32s coincide (`task.maxConcurrency`, `nativeProfiles.omp-native-v1.concurrencyCeiling`) | "(16-32 per wave, 100 members per L1 round ceiling)"; "`waveMaxLanes` (per-wave ceiling, 32)"; "Two separate 32s" | `HostRevengerDelta` 7/8; `XdocSimplifierPreapply` 15/16; `SmokeMutationBandEdge` 16 |
| **M3** | `apply.mjs` deferred-artifact list names only the AGENTS.md wave band | `host/apply.mjs:94`, `:814-816` → `<ufoRoot>/AGENTS.md` | AGENTS.md also carries, unlisted: "a ROUND fields a swarm of **64-100** lanes — the **64-lane** round floor" (`:151-152`; live `minLanes 16`), "`task.maxConcurrency: 0` everywhere means no host secondary cap" (`:165`; live `32`), "at most **32** live L1s globally" (`:205`; live `16`, `surface caps`), "16 <= N <= 100" sizing (`:161-163`), "repo: 16-100" (`:154`,`:166`; true of no live state); the claimed range "~lines 154-170" misses `:151-152`, `:161-163`, `:165`; the "bundled/config.json mirrors maxConcurrentL1" item understates a 4-field drift incl. the compile-gate-validated `l1Alias` (`m_daybreak→m_strong`) | extend the deferred list to all of them (they are deferred by operator decision, not to be fixed here) | `ApplyExecutorDrift` (4 highs), `ApplyMutationBandGate` 8, `XdocSimplifierPreapply` 10-14 |
| **M4** | "Refusals are typed — `empty_wave`, `too_few_lanes`, `wave_too_wide`, `too_many_lanes`, `impossible_band`, `duplicate_expansion`, `unknown_role`, `resume_unknown_member`, `conflicting_assignment`, and (with route preflight enabled) `route_unreachable`" | `.omp/skills/swarm/SKILL.md:71-76` | all listed codes are real (8 reproduced by probe), but the enumeration reads as *the* vocabulary and omits codes a spec can hit — `role_required`, `resume_role_forbidden`, `invalid_spec`, `invalid_policy`, `duplicate_name`, `duplicate_resume_id`, `prompt_required`, `item_required`, `prompt_with_template`, `spawn_message_forbidden`, `resume_item_forbidden`, `resume_meta_forbidden`, `invalid_name`, `invalid_resume_id`, `invalid_agent_id`, `invalid_registry(_path)`, `invalid_assignments`, `unknown_member`, `wave_registry_collision`, `registry_lock_*`, `usage`; route preflight also emits `route_config_unavailable` (`ufo-route-preflight.mjs:148,173`) | mark the list non-exhaustive (or complete it); add `route_config_unavailable` | `SwarmScoutRefusals` (14 probes), `SwarmReviewerRoles` R5/R6 |
| **M5** | "`swarm.minLanes` 16 is the declared swarm-round floor — policy, **not a planner gate**" | `.omp/skills/swarm/SKILL.md:66`; repeated `AGENTS.md:151-152` | **`main` probe**: band-less policy with `minLanes: 8` → a 4-lane spawn wave is refused `too_few_lanes` "needs at least 8 lanes" (8 admitted); with neither key → 1 lane refused, 2 admitted. `ufo-swarm-wave.mjs:796-800` sets `policyFloor = waveMinLanes ?? minLanes ?? 2`, so `minLanes` **is** the gate whenever `waveMinLanes` is absent | "…is declared policy; the planner gates the wave band, falling back to `minLanes` — then the built-in 2 — only when no wave band is declared" | `main`; note `SwarmSimplifierBand` judged this row MATCH — the probe overturns that reading |
| **M6** | "The wave band is restated in prose in `sighting.dispatch.swarm.note`. Rewriting it keeps the note from contradicting the numbers beside it" | `host/apply.mjs:332-334` (fn `:336-349`, call `:981-984`) | no note snapshot contains a band string, and the needle is built as `${preWaveMin}${sep}${delta.waveMaxLanes}` = `"32-32"`, which matches nothing → `noteRewrites` is always empty and the "swarm.note band wording" plan section always prints "no band wording found" | delete the `planNoteRewrite` plumbing or search the real pre-apply band (`"32-100"`) | `XdocSimplifierPreapply` 4 |
| **M7** | "Only `launch` creates a pane" | `.omp/skills/tower/SKILL.md:75` | `surface --json`: `inquiry` → `bounded_mission_launched`, `resume` → `resume+spawn`, `twin` spawns, `overview --watch` spawns a watcher pane (`ufo-sighting.mjs:1691`); `register` **adopts** a pane (`:4036`) | "`launch` is the only verb that mints a mission pane from an operator command; `inquiry`, `resume`, `twin` also spawn/respawn panes and `register` adopts an existing one" | `TowerConnectorWall` 1, `SwarmExecutorSightingParity` 11 |
| **M8** | `run-wave-test.mjs` header: "No invocation writes into the `ufo-fsd-alpha` checkout"; "no invocation reads or writes the operator's live tmux session unless `--live-wall` is passed"; "in order" 8-step list; "proves every claim … about the wave planner" | `test/run-wave-test.mjs:3-4`, `:12-43`, `:51-53` | preflight runs `tmux has-session` unconditionally (`:420`, admitted by the header's own step 7); `--live-wall` runs the wall verbs with `cwd=$UFO` and `open` writes `.ufo/sighting/manifest.json` (`:818-819`, `:859`); the step list omits 25 checks (incl. `crosscheck.*`, `routeCli`, `authority.*`); the exit-code line under-describes `0/1/64` | qualify containment; reconcile the step list and exit-code line with the check inventory | `WaveTestCriticSelfClaims` R5/R6/R11/R12/R13/R15 |
| **M9** | `--config <ufoRoot>/config/mission-nightcall.yml` hardcoded, in a module whose header promises "every band number, ceiling, and role alias is read live"; no test pins it | `sighting/tower-fleet.mjs:326-327`; `ufo.json missionFormat.configPath` | the key exists and is authoritative; a config move yields a stale mission config path and zero test signal | read `authority.configPath` (add it to `loadBandAuthority`) and assert it in `tower-fleet.test.mjs` | `FleetTestConnectorFixture` |
| **M10** | "up to `maxLanes` lanes **per round**" / "`{{roundLaneCeiling}}` lanes per round" | `.omp/skills/tower/SKILL.md:141-143`; `sighting/l1-prompt.md:44` | the validator enforces `maxLanes` **per wave**, tightening-only (`ufo-swarm-wave.mjs:11-14,996,1001`); a round may hold several ≤32 waves. Counter-argument recorded: the operator directive says "up to 100 per round" and `tower-fleet.mjs:131` names the key `roundLaneCeiling`, and the hub comment sides with "round" (`ufo-mission-result.mjs:2499-2500`) — the authority is internally split, the number is right | "…and up to `maxLanes` lanes per L1 round (enforced per wave as a tightening cap)" | `TowerSentinelSpec` 7, `TowerExecutorTemplates` 4, `TowerRevengerParity` 11 |
| **M11** | "Omit the `spawns:` key entirely for a leaf; `spawns: []` is a footgun, not the leaf spelling" (and its restatement in `ufo.json` `sighting.dispatch.swarm.note`) | `.omp/skills/swarm/SKILL.md:99-102` | the asymmetry is unfounded: the card parser collapses **both** `[]` and an omitted key to the same undefined value, and the wildcard then depends on `task` being in the card's `tools`; the repo's own checker already encodes the real discriminator — `check-hand-authored-sets.mjs:173`: "if `!keys.has("spawns")` and `tools` includes `task` → *a leaf card must not list task*" | "omit `spawns:` **and** keep `task` out of the card's `tools:`; `spawns: []` is not the leaf spelling, and neither is omission alone" | `SwarmCriticLeaf` R2/R3 (binary-level detail is lane evidence; the in-repo checker corroborates the correction) |
| **M12** | "Every band number, ceiling, and role alias is read live from `<ufoRoot>/config/ufo.json`" | `sighting/tower-fleet.mjs:6-7` | one rendered ceiling is **spec**-sourced, not config-sourced: `{{roundCeiling}}` ← `spec.roundCeiling` (`loadSpec:250`, default 1; live fleet `roundCeiling: 2`), and `missionFormat.defaultIterateRounds: 1024` is never read | carve out: "band, ceilings and alias come from config; the round **count** comes from the fleet spec" | `TowerRevengerParity` 4 |

### LOW

| # | Claim | Location | Evidence | Fix | Lane |
| --- | --- | --- | --- | --- | --- |
| **L1** | "`omp worktree clear` is a **repo-wide** orphan sweep" | `tower/SKILL.md:115-116`; duplicated `sighting/tower-fleet.mjs:22`, `:662` | `clear` takes no PATH and `-C` is `(add)`-only; it sweeps the single global agent-managed root shared by all repos — the safety conclusion holds, the scope word does not | "sweeps the whole agent-managed worktree root across every repo" | `TowerCriticWorktree` W4 |
| **L2** | receipt path `{{stateDir}}/rounds/{{missionId}}-r<N>.md` | `l1-prompt.md:85` vs `tower-fleet.mjs:602` | the status filter `startsWith(id + "-r")` also matches `-report.md`/`-rX.md` while the doc and the sort regex (`:603`) require digits; nothing ever creates `rounds/`, so `status` shows `-` | tighten to `^<id>-r\d+\.md$`; have the prompt create the dir | `TowerCriticStateLayout` R2/R3 |
| **L3** | fleet-spec field list | `tower/SKILL.md:132-134` | `loadSpec` also honours `stateDir`, `worktreeRoot`, `roundCeiling` (1), `maxTime` (`3h`), and defaults `base` to HEAD | append the optionals with defaults | `TowerScoutBand` D2, `TowerSentinelSpec` 1, `TowerReviewerCli` |
| **L4** | ufoRoot-relative paths written un-prefixed (`.omp/hooks/pre/ufo-godspeed-inject.js`; "mirror … `config/ufo.json`, `scripts/ufo-sighting`") | `tower/SKILL.md:51`, `:122-124` (line `:144` prefixes correctly) | those files exist only under `<ufoRoot>` | prefix with `<ufoRoot>/` | `TowerScoutBand` D1 |
| **L5** | "the `ufo_sighting` wall's fleet window (`launch --fleet <fleet>`)" | `tower/SKILL.md:138-139` | window 1's own title is `DEFAULT_WINDOW_NAME="fleet"` (`base.mjs:29`) and `--fleet fleet` is rejected (`ufo-sighting.mjs:1133-1135`) — term clash | "the tmux window titled `<fleet>`" | `TowerConnectorWall` 2 |
| **L6** | `steer --mission <id> --text "<one line>"` … "to a registered mission" (no `--text-file`); swarm's sighting paragraph omits `maxConcurrentL1`, `status --lite`, `overview --width` | `swarm/SKILL.md:139-140` | `surface` mutex `--text | --text-file`; stopped/completed rows refuse `MISSION_NOT_LIVE` ("registered" overbroad) | add the flag/mutex, say "live registered mission", add the missing keys | `SwarmExecutorSightingParity` 7 |
| **L7** | smoke evidence table: "`ufo-root/config/ufo.json` — the band authority used"; "every spec the run judged" | `smoke.md:99`, `:100` | under `--band live` no copy is written (path+sha in `manifest.json` only); the in-process crosscheck specs are never written | conditional wording | `SmokeRevengerEvidence` 1/2 |
| **L8** | exact family counts in the smoke negative table | `smoke.md:393-394` | the harness asserts only `singleFamily` and `families>=2`; the counts themselves are correct (recomputed on both configs) | assert the exact counts, or mark them as illustrative | `SmokeMutationBandEdge` |
| **L9** | status vocabulary `completed|failed|timeout|cancelled|aborted` | `test/run-wave-test.mjs:941` | the collector's `STATUS_OUTCOME` has six keys including `canceled`; `smoke.md:324` lists all six | insert `canceled` | `SmokeReviewerCollect` |
| **L10** | `missing_agent_id` listed without qualification | `smoke.md:336-337` | it fires only for resume members; spawn rows legitimately carry `agentId:null` | add "(resume lanes)" | `SmokeReviewerCollect` |
| **L11** | shared usage string advertises `[--apply] [--mission <id>]` for all four verbs | `tower-fleet.mjs:88`, `:693` | `parseArgs` makes `--mission` close-only (`:700`), `--apply` launch/close (`:701-702`) | reword the usage line | `TowerReviewerCli` |
| **L12** | `verbLaunch` step comments `1 … 2 … 3 … 5. launch the pane` | `tower-fleet.mjs:511-593` | no step 4 | renumber | `main` |
| **L13** | template/values coverage: `l1Alias` is a values key with no template token; only 6 of 17 placeholders are asserted by name | `tower-fleet.mjs:291`; `test/tower-fleet.test.mjs:181-184` | an unused value plus a mostly generic test | drop the unused value; assert the identity-table lines | `TowerExecutorTemplates` 2/7 |
| **L14** | "`--apply` writes EXACTLY TWO files and nothing else" | `host/apply.mjs:8-11` | each run also leaves a timestamped `.bak` beside each target (6 config + 1 config.yml `.bak` on disk) — but the header's own numbered list discloses "(timestamped backup, install\|merge)", so this is precision, not deception | "EXACTLY TWO files — plus a timestamped backup beside each — and nothing else" | `ApplyExecutorDrift` (INFO) |
| **L15** | `modelRoles.default` differs host↔live | `host/omp-agent.config.yml:111` vs live `:4` | seat-neutral: no ufo seat pins `@default` | record only | `HostRevengerDelta` 14 |
| **L16** | swarm SKILL caches the authoritative numerals as bold literals while the same file says "defer to the config values … rather than to any number … restated here" | `swarm/SKILL.md:61-68` vs `:150-154` | a second authority structurally able to drift (this audit found exactly that class of drift in M2/M3/maxLanes labels) | simplification candidate: keep key names + relations, drop bold numerals | `SwarmSimplifierBand` (not applied) |
| **L17** | header exit-code legend: "2 typed error" | `sighting/tower-fleet.mjs:18` vs `:739-740` | a non-`TypedError` throw also exits 2, as `UNEXPECTED_ERROR`, with the same `{ok:false,code,message}` shape | "2 typed or unexpected error" | `CodeSentinelComments` |
| **L18** | header safety bullet "the omp argv stays interactive (no `-p`/`--print`, no `--mode`)" beside an argv that carries `--print-thoughts` | `sighting/tower-fleet.mjs:29` vs `:328` | the guard is exact-token-true (`:305-317`), but `--print-thoughts` is documented as a print-mode-only modifier — inert in the interactive pane, misleading next to the bullet | qualify the bullet and/or drop the no-op flag from `buildOmpArgv` | `CodeSentinelComments` |

### Authority-side gaps (substrate — reported, not fixed here)

| # | Gap | Evidence |
| --- | --- | --- |
| **A1** | `surface --json` under-reports its own contract: `verbs` omits `register`/`twin`/`surface` (present only in `extras[]`), `extras[].register` carries **no `states` map**, and `verbs.complete.flags` omits `--dry-run` although `USAGE_LINES` and the handler implement it (`--dry-run` probe returns `MISSION_NOT_FOUND` from the handler, not `INVALID_ARGUMENT`) | `main` (surface dump + probe); `SmokeScribeRegex` F2/F3; `SmokeReviewerCollect`; `SwarmExecutorSightingParity` |
| **A2** | stale comment inside the planner: `ufo-swarm-wave.mjs:1459-1460` says resume lanes "carry the handle they claim", but resume registry rows land `agentId:null` and the handle rides the dispatch entry's `resume` field | `SwarmSentinelRegistry` F-1 |
| **A3** | substrate docs carry stale bands beyond the audited feature: `AGENTS.md:153-155`, `:165`, `:205`; `docs/BEHAVIOR-MATRIX.md:12` (`maxConcurrentL1 32`, wave `16-100`, `minLanes 64`) | `TowerConnectorWall`, `ApplyExecutorDrift` |
| **A4** | the post-apply band exists only as an uncommitted working-tree diff; HEAD is `64/32/100` | §2, `git show HEAD:config/ufo.json` |
| **A5** | stale prompt-convention comment in the planner: `ufo-swarm-wave.mjs:158-159` names "the fleet prompt convention (`/skill:ufo` for L1 assignments)" while `l1-prompt.md:1-3` leads `/skill:tower`, `/skill:godspeed`, `/skill:swarm` and calls `skill://ufo` optional (`:24-25`) | `TowerRevengerParity` 13 |

### Contested / not reproduced

| Item | Lane claim | L1 finding | Treatment |
| --- | --- | --- | --- |
| `host/omp-agent.config.yml:33-34` "all **twenty-nine** chains" | `SwarmConnectorRouting` row 9: 31 `fallbackChains` keys parsed from the same file → DRIFT | the L1's own indentation scan of the same file counts **19** top-level keys under `retry.fallbackChains` (nested per-model steps and the `-2`/`-3` twin blocks are not top-level) — the count depends on the parse model | **not asserted**: recorded as lane-reported and unreproduced; a YAML-aware count by the file's owner should settle it |
| hook discovery roots for `omp --cwd <worktree>` sessions | `TowerRevengerParity` row 14: UNVERIFIABLE (no audited file states whether the hook loads outside `ufo-fsd-alpha`) | consistent with H4: the SKILLs' unscoped "enforces it for every `task` dispatch" cannot be supported from any audited artifact, while the smoke doc's *project-scoped* statement can | H4 stands as a scoping defect; the discovery mechanism itself stays unverified here |

---

## 4. MATCH — verified consistent

| Claim family | Authority | Evidence |
| --- | --- | --- |
| Band numbers `waveMinLanes 16 / waveMaxLanes 32 / maxLanes 100 / minLanes 16` across both SKILLs, l1-prompt, smoke doc, the delta and `apply.mjs` | `config/ufo.json`, `ufo-mission-result.mjs:2415-2416` | `SwarmScribeCaps` 8/8; `SmokeMutationBandEdge` 16/16; `SwarmSimplifierBand` 8/8; `TowerScoutBand` 14/16; `ApplyMutationBandGate` 9/9; `HostRevengerDelta` 6/6 delta keys |
| Band-edge behaviour 15/16/32/33/101 → `too_few_lanes` / admitted / admitted / `wave_too_wide` / `too_many_lanes` (cap checked before the wave ceiling) | real planner | **`main`** live probe at the restored band; `SmokeMutationBandEdge` replayed every code under the injected post-apply policy |
| Ceilings `maxConcurrentL1 16`, `windowPaneCeiling 16`, `globalRunnerCeiling 1056`, ramp `5/700`, `task.maxConcurrency 32`, `task.maxRecursionDepth 2` | config + `surface caps` + live global config | `TowerScoutBand`, `SwarmScribeCaps`, `FleetTestConnectorFixture`; `main` |
| Pane ceilings are display capacity, not the runner/L1 ceiling | `surface caps`, `ufo-sighting.mjs:2140-2195` | `SmokeSimplifierWall` 8/8 |
| Wall CLI: exit codes `0/2` (no 64), geometry `3×5=15`/`3×6=18`, `complete` kills the pane, `MISSION_NOT_FOUND`, `peek`/`steer` codes and ≤4096-byte single-line text, `runId`/`sessionId` patterns, `register` `WALL_ABSENT`/`INVALID_PANE`, `open` `ATTACH_TIMEOUT`/`DUPLICATE_CLIENTS`/`TERMINAL_LAUNCHER_MISSING`, `l2 "opaque"` = unknown, `reconcile` standalone, verbs/flags exist as named | `surface --json`, `ufo-sighting.mjs`, `base.mjs`, `observe.mjs` | `SmokeScribeRegex` 6/6; `SmokeSimplifierWall` 8/8; `TowerConnectorWall` 18/21; `main` (`register`, `complete --dry-run`) |
| Route families `scout/scribe→@m_fast`, `reviewer/executor→@m_mid`; mixed 16-lane = 2 families (`8/8`); all-`m_fast` = `singleFamily:true`; `--route-families` on `plan`/`run`, `singleFamily`, `route_unreachable` | candidate + live seat tables, computed `waveRoutePreflight`, `ufo-route-preflight.mjs` | `SmokeScoutFamilies` 6/6 (recomputed), `SmokeMutationBandEdge`; `SwarmConnectorRouting` (route-preflight claims MATCH) |
| The three buckets `m_strong/m_mid/m_fast` exist in **both** the candidate and the live config, all 14 seats resolve in both with byte-identical bindings (3 strong / 5 mid / 6 fast, zero empty chains, no alias naming another `@alias`); no per-lane `model` param; no provider/model pinned anywhere | `host/omp-agent.config.yml`, live config, `omp-global-config.mjs readGlobalSeatRouting`, `ufo-swarm-wave.mjs` `ITEM_KEYS` | `SwarmConnectorRouting` 7/11 (provenance caveat noted: "approved table is three" has no approver — `AGENTS.md:147-148` declares no allowlist, so the claim survives by self-deferral to the live table) |
| Taxonomy: the ten swarm roles; frozen seats (planner/distiller/labrat/Main) are not swarm lanes; item-level `role` required (`role_required`, `unknown_role`) | `SWARM_ROLES`, `ufo.json proposalRoles` | `SwarmReviewerRoles` 7/9 |
| Leaf shape: within the project card set `agents/executor.md` is the only card declaring `spawns: labrat` (and it scopes the permit to the frozen `probeParent` seat); `task.maxRecursionDepth: 2` and `task.maxConcurrency: 32` values and bound semantics match | `<ufoRoot>/agents/*.md` (13 cards), live config, lane session init records | `SwarmCriticLeaf` 4/6 MATCH (caveat: OMP's bundled `task.md` card carries `spawns: "*"`, so "the one card" holds for the project set only; the leaf-*spelling* claim is M11) |
| Registry/continuity: `run` persists `ufo-swarm-registry-v1` at `<reportDir>/swarm-registry.json`; `{name→{agentId,item,role}}` with `agentId` null until `record --registry --assignments`; `resumeSends` → `hub send --to/--message`; `entry.name` bookkeeping; resume-only waves floor-exempt and never carrying `/skill:godspeed`; fail-closed rejection before any write | `ufo-swarm-wave.mjs` | `SwarmSentinelRegistry` 8/8; `SwarmScribeCliSurface` 17/17 (incl. `plan --spec -`, `--spec-json`, and "plan writes nothing" proved by three no-write probes) |
| Dispatch payload: distinct CamelCase names, one taxonomy role per lane, no `model` key, exactly one `/skill:godspeed` line | real `run` | **`main`** (this wave: 32 lanes, keys exactly `name|agent|task`); `run-wave-test.mjs` assertions |
| Host delta: all six keys equal live config; all 14 seats declared with aliases that resolve and are byte-identical to live | `config/ufo.json`, live global config | `HostRevengerDelta`; `FleetTestConnectorFixture` |
| Launcher: `plan` writes nothing; `MUTATION_REQUIRES_APPLY`; `close` never removes a worktree (prints the per-path `git … worktree remove`); worktree/branch layout; `--model @m_strong`; `SCOPE_OVERLAP` pairwise gate | `tower-fleet.mjs` + hermetic test | `TowerReviewerCli` 7/9 + 8 runtime probes; `TowerSentinelSpec` 13/15; `FleetTestConnectorFixture` ran `node test/tower-fleet.test.mjs` → **ALL CHECKS PASS, exit 0** |
| Template integrity: all 17 `{{token}}`s resolve; no `RENDER_UNRESOLVED` reachable | `renderPrompt` + test | `TowerExecutorTemplates` 1/3; **`main`** (rendered prompt) |
| Smoke evidence inventory: every promised artifact maps to a real write site and vice versa (13/13) | `run-wave-test.mjs` write sites | `SmokeRevengerEvidence`; `main` (`test/evidence/.gitignore`) |
| Collect/close contract: `collect --wave/--results/--out`, exit `0/1/64`, six-value status vocabulary, fail-closed join codes, `reportSummary` presence-only, `complete --dry-run/--mission/--note` effects | `ufo-swarm-collect.mjs`, `ufo-sighting.mjs` | `SmokeReviewerCollect` 12/15 (3 drifts above) |
| Pre-apply story: "live band 32–100 pre-apply", "`apply_not_landed` while the floor is still 32" | backups, HEAD, delta | `XdocSimplifierPreapply` 1-9; `ApplyMutationBandGate` 3; **`main`** (§2). Nuance: the oldest backup (`19-15-32`) held `16-100`, so "old floor 32" is scoped to the immediately-pre-apply snapshot |
| Godspeed hook: exact path, project scoping, batched/flat arms, idempotence, renderer injection for lanes | hook source + its test + `ufo-swarm-wave.mjs` | `GodspeedHookProvenance` 1-5 MATCH (6-8 are H4) |
| `apply.mjs` dry run is genuinely dry, and its own band gate holds | executed | **`main`**: exit 0, "DRY RUN PASSED … 16-32 wave-band gate … Nothing was written" |

---

## 5. Reproduction

```bash
# band authority + edges (read-only)
node -e 'console.log(require("/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json").sighting.dispatch.swarm)'
# live band probe: 15→too_few_lanes, 16→ok, 32→ok, 33→wave_too_wide, 101→too_many_lanes
UFO_PROJECT_ROOT=/tmp/<scratch> UFO_CONFIG_PATH=/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json \
UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 node <ufoRoot>/scripts/ufo-swarm-wave.mjs plan --spec <spec.json>

# H1  absolute reportDir → {"code":"invalid_report_dir","message":"reportDir must be a relative path"}
# H2  omp worktree list --json → []   |  git -C /home/vgpnk/Projects/ompskills worktree list | wc -l → 23
# H3  read skill://wwkd → Unknown skill: wwkd / Available: godspeed, omarchy, swarm, tower
# H5  grep -n 'A-Za-z]' sighting/tower-fleet.mjs  (regex :293, guard :297, test :183)
# M5  band-less policy {minLanes:8}: 4 lanes → too_few_lanes "needs at least 8 lanes"; {no minLanes}: 1 → refused, 2 → ok
# A1  bash <ufoRoot>/scripts/ufo-sighting surface --json  → verbs/extras/flags as quoted
# MATCH evidence
node test/tower-fleet.test.mjs     # ALL CHECKS PASS
node host/apply.mjs                # DRY RUN PASSED, writes nothing
```

---

## 6. Lane provenance

Wave `tf-audit-docs-r1`: 32 spawn lanes in one batched `task` call; registry
`reports/tf-audit-docs/swarm-registry.json` (32 members, ids recorded via `record`).
Roles: scout 3, reviewer 3, critic 4, connector 3, sentinel 3, executor 3, mutation-tester 3,
revenger 3, simplifier 4, scribe 3 — spread over `@m_fast`, `@m_mid`, `@m_strong`.

| Lane | Role | Slice | Verdicts |
| --- | --- | --- | --- |
| `TowerScoutBand` | scout | tower SKILL band/ceiling keys | 14 M / 2 D |
| `TowerReviewerCli` | reviewer | tower SKILL ↔ `tower-fleet.mjs` CLI | 7 M / 0 D (1 LOW note) |
| `TowerCriticWorktree` | critic | tower SKILL ↔ real `omp worktree` | 5 M / 2 D |
| `TowerConnectorWall` | connector | tower SKILL ↔ wall CLI | 18 M / 3 D |
| `TowerSentinelSpec` | sentinel | spec fields, scope gate, close safety | 13 M / 2 D |
| `TowerExecutorTemplates` | executor | placeholders ↔ `renderPrompt` | 3 M / 3 D |
| `TowerMutationLoadOrder` | mutation-tester | load order ↔ resolvable skills | 3 M / 3 D (1 high) |
| `TowerRevengerParity` | revenger | l1-prompt ↔ tower SKILL parity | 12 M / 4 D / 1 S / 1 U |
| `TowerCriticStateLayout` | critic | state-dir/report/receipt paths | 7 M / 2 D (1 high) |
| `SwarmSimplifierBand` | simplifier | swarm wave-band paragraph ↔ gates | 8 M / 0 D |
| `SwarmScribeCaps` | scribe | swarm numbers ↔ config/live caps | 8 M / 0 D |
| `SwarmScoutRefusals` | scout | refusal vocabulary ↔ real codes | 13 M / 1 D + 1 sub-drift |
| `SwarmReviewerRoles` | reviewer | taxonomy ↔ `SWARM_ROLES` | 7 M / 2 D |
| `SwarmCriticLeaf` | critic | leaf/`spawns`/recursion | 4 M / 2 D |
| `SwarmConnectorRouting` | connector | buckets/seat table ↔ configs | 7 M / 3 D / 1 S |
| `SwarmSentinelRegistry` | sentinel | registry/resume continuity | 8 M / 0 D (+A2) |
| `SwarmExecutorSightingParity` | executor | sighting paragraphs in both SKILLs | 16 M / 2 D |
| `SwarmScribeCliSurface` | scribe | validator-CLI claims | 17 M / 0 D |
| `SmokeMutationBandEdge` | mutation-tester | smoke band-edge/negative tables | 16 M / 0 D |
| `SmokeRevengerEvidence` | revenger | evidence inventory ↔ write sites | 13 M / 2 D |
| `SmokeSimplifierWall` | simplifier | smoke wall claims | 8 M / 0 D |
| `SmokeScribeRegex` | scribe | id patterns/flags/exit codes | 6 M / 0 D (+A1) |
| `SmokeScoutFamilies` | scout | route-family claims ↔ seat tables | 6 M / 0 D |
| `SmokeReviewerCollect` | reviewer | collect/close contract | 12 M / 3 D (1 high) |
| `WaveTestCriticSelfClaims` | critic | run-wave-test header ↔ its code | 6 M / 9 D |
| `FleetTestConnectorFixture` | connector | tower-fleet.test ↔ launcher + config | 10 M / 0 D (1 gap) |
| `CodeSentinelComments` | sentinel | tower-fleet.mjs header/step comments | 12 M / 4 D |
| `ApplyExecutorDrift` | executor | apply.mjs header/deferred list | 9 M / 2 D / 5 omitted-stale |
| `ApplyMutationBandGate` | mutation-tester | apply.mjs band gate ↔ planner + backups | 9 M / 0 D |
| `HostRevengerDelta` | revenger | host delta/candidate ↔ live config | 6 M / 2 D / 2 stale |
| `XdocSimplifierPreapply` | simplifier | cross-doc pre-apply story | 13 M / 3 D / 4 stale |
| `GodspeedHookProvenance` | connector | hook path/behaviour ↔ hook source | 5 M / 3 D |

---

## 7. Not audited / residual

- No live mutation: no lane and no L1 dispatched a lane, opened the wall, or ran `launch/close --apply`.
  `launch`/`close` were verified through argv builders, the hermetic test and `plan` runs.
- `resumeSends` proven by source + the dry-run synthetic-id path, not a live `hub send`.
- **All 32 lanes returned** (the last, `TowerRevengerParity`, added §3 M12, A5 and the "Contested" rows; it
  found no new HIGH row and contradicted none). Its one UNVERIFIABLE row (hook discovery roots for
  `omp --cwd <worktree>` sessions) is recorded rather than resolved, and the SKILL statements it targets are
  already carried by H4.
- Substrate-internal behaviour (tmux geometry at runtime, cargo compile gate against the stale bundled
  mirror) was read from source, not executed.