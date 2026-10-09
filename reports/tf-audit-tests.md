# tf-audit-tests — test-coverage audit of the tower-fleet feature

- fleet `tower1` · mission `tf-audit-tests` · axis `audit-tests` · round 1 (22 lanes, 0 resumed)
- feature audited: `sighting/tower-fleet.mjs` (741 lines, verbs `plan|launch|status|close`), `sighting/l1-prompt.md`
- suite audited: `test/tower-fleet.test.mjs` (294 lines, 8 sections, 33 `check(...)` + 10 `expectTyped(...)` = 63 assertions)
- worktree: `/home/vgpnk/Projects/ompskills/.tower/worktrees/tower1/tf-audit-tests` · scope of this file: `reports/tf-audit-tests.md`
- lane evidence (22 files, read-only lanes): `/home/vgpnk/Projects/ompskills/.tower/fleets/tower1/reports/tf-audit-tests/r1-*.md`

## 0. Verdict and headline numbers

**Verdict: GAP.** The suite is green (`ALL CHECKS PASS`, exit 0) and pins the `plan` verb's
argument construction plus a handful of spec-validation refusals. It asserts **nothing** about
any state-changing behaviour: `launch --apply`, `status` and `close --apply` are never executed.

| measure | value |
|---|---|
| acceptance criteria extracted from the three defining sources | **74** |
| criteria with discriminating coverage (PASS) | **15** (+2 covered in `test/run-wave-test.mjs`, a different feature) |
| criteria with only weak/coincidental coverage (WEAK) | **24** |
| criteria with no assertion at all (GAP) | **33** |
| distinct typed error codes the launcher can emit | **18** (16 via `typed("…")`, plus `USAGE`, `UNEXPECTED_ERROR`; `LAUNCH_FAILED` is a record code, not thrown) |
| codes with any assertion | **4** (`INVALID_SPEC`, `L1_CEILING_EXCEEDED`, `SCOPE_OVERLAP`, `MUTATION_REQUIRES_APPLY`); `USAGE` is asserted only as `exit 64` |
| launcher symbols / branches inventoried | **30 symbols** (11 never entered, 2 entered but unasserted) · **104 branch rows** (~17 covered, 8 dead, ~79 gap) |
| lanes' independent mutation probe (42 mutants of the suite's targets) | **25 killed / 17 survived** |

## 1. Method, provenance, and independent verification

No acceptance-criteria document exists in the repo (`grep -rn "acceptance"` → no matches), so
criteria were taken from the three sources that define the feature:

| tag | source | declares |
|---|---|---|
| **A** | `sighting/tower-fleet.mjs:4-47` (module doc comment) | verbs, default verb, exit codes 0/2/64, typed-error shape, safety contract, fleet-spec schema + defaults |
| **B** | `.omp/skills/tower/SKILL.md` §"Sighting fleet (tower mode)" | verbs + `--apply`, worktree/branch/prompt per mission, pane ceilings, `SCOPE_OVERLAP` gate, writer isolation, close rules |
| **C** | `.tower/fleets/tower1/spec.json` | `tf-launcher` gaps a–d, `tf-tests` test-depth list, `tf-prompt`, `tf-band`, `tf-wavetest` |

Evidence is read-only: 22 lanes ran as leaf agents, each with a unique `/tmp` scratch, none
touching the real wall, tmux, or the substrate. Verified at integration: 22/22 lane reports exist;
the audit worktree holds only this mission's `reports/` (`git status --porcelain` → `?? reports/`).

L1-reproduced facts (my own runs, not delegated):

```
$ node test/tower-fleet.test.mjs                      → ALL CHECKS PASS, exit 0
$ node sighting/tower-fleet.mjs plan --spec <16-mission fixture> --json
                                                      → exit 0, 16 missions planned
$ node sighting/tower-fleet.mjs plan --spec <17-mission fixture> --json
                                                      → exit 2 {"code":"L1_CEILING_EXCEEDED"}
$ grep -c 'copySkill|paneId|fleet\.json|sessions|launchResult' test/tower-fleet.test.mjs  → 0 each
```

The 16/17 pair reproduces the ceiling boundary independently: the strict `>` at
`tower-fleet.mjs:199/202` is correct today, and **no test would catch a `>` → `>=` flip** even
though the live fleet spec declares exactly 16 missions.

Band authority read live at dispatch (`.../ufo-fsd-alpha/config/ufo.json`):
`waveMinLanes 16, waveMaxLanes 32, minLanes 16, maxLanes 100, windowPaneCeiling 16,
maxConcurrentL1 16, l1Alias m_strong`. A sibling lane clobbered this file mid-mission
(32/100 band, symlink write); the operator restored it at 01:31Z and the wave was re-validated
against the restored values. Every lane re-read it and reported the same numbers.

## 2. Acceptance-criteria traceability (spine)

Full 74-row matrix with per-criterion evidence: `r1-trace-matrix.md` §1. Condensed:

| source | rows | PASS | PASS(elsewhere) | WEAK | GAP |
|---|---|---|---|---|---|
| A module doc comment | 42 | 8 | 0 | 12 | 22 |
| B tower SKILL §fleet | 19 | 4 | 0 | 9 | 6 |
| C fleet spec missions | 13 | 3 | 2 | 3 | 5 |
| **total** | **74** | **15** | **2** | **24** | **33** |

15 of the 33 GAPs hang off the three verbs that only ever reach the `--apply` guard
(A34, A37–A42, B7, B9, B16–B19, C1–C4). C11/C12 (band and wave-test criteria) are covered in
`test/run-wave-test.mjs` — a sibling mission's scope, marked PASS(elsewhere), not duplicated here.

### 2.1 Criteria with no implementation (not merely no test)

Three acceptance criteria can never be satisfied by any test because the behaviour does not exist
in the audited revision — a distinct finding from "untested":

| criterion | source | state |
|---|---|---|
| relaunch idempotent for **pane and prompt** (reuse existing pane) | C:15 (tf-launcher b) | worktree is reused (`impl:507-509`); the prompt is rewritten unconditionally (`impl:548`); there is **no pane-reuse branch** |
| `status` reconciles the wall against `fleet.json` **vice versa** | C:15 (tf-launcher c) | `fleet.json` is only ever written (`impl:560`); nothing reads it (`grep fleet.json` → that one site). `verbStatus` derives rows only from the wall + `spec.missions` |
| `close` refuses a live pane unless `--force` | C:15 (tf-launcher d) | no `--force` token exists; it would hit `usageExit` → exit 64 |

## 3. Untested behaviours — complete inventory

Grouped by surface; each item is a reachable branch/typed code/observable effect with its code
site and the absence proof (test-file grep, quoted in the lane report). Lane reports give the
verbatim probe output per item. Items marked **[dead]** are unreachable (see §5) — reported so
they are not mistaken for coverage.

### 3.1 plan verb, CLI parsing, human renderers
1. Human (non-`--json`) renderers for all four verbs — `printPlanHuman`/`quoteArg` (`impl:406-426`), launch (`impl:587-591`), status table (`impl:631-638`), close text (`impl:660-665`). Only `T:253` runs human mode, and it asserts exit status alone; `quoteArg`'s single-quote escape sub-branch (`impl:407`) is never reached.
2. `--help`/`-h` exit 0 + its stdout (`impl:692-695`); `--spec` with no value (`impl:683`); `--mission` with no id (`impl:690`); `--mission` on a non-close verb (`impl:700`); `--apply` accepted-and-ignored on plan (`impl:685`); a positional in flag position / extra positional (`impl:697`); relative `--spec` resolution (`impl:682`); `main()`'s `default:` usageExit **[dead]** (`impl:728`).
3. plan `--json` top-level echoes never asserted: `ok/repo/base/stateDir/worktreeRoot/roundCeiling/maxTime` (`impl:433-439`); per-row `goal/scope/skills` echoes (`impl:386-390`).

### 3.2 spec validation
4. `FLEET_PATTERN` boundaries: 48 chars ok / 49 refused, and **any violation after index 0** (length tail, `$` anchor, mid-string) — `T:259/260` both fail at position 0 (`impl:68/189`).
5. `MISSION_ID_PATTERN` 64 ok / 65 refused (`impl:69/211`).
6. Empty/whitespace `title|axis|goal` (`impl:218-222`); non-object mission (`impl:210`); `missions` absent/`[]`/non-array (`impl:197`); `scope: []` and non-array scope (`impl:219-221`); `stateDir`/`worktreeRoot` non-string (`impl:146-147`); missing `repo` (`impl:194`); missing `ufoRoot` (`impl:718-720`); absent/unreadable spec file (`impl:714-716`).
7. `roundCeiling` 0/-1/1.5/`"2"` (`impl:250-251`); `maxTime` `""`/`"-3h"`/`"3 h"` (`impl:252-253`) — and `MAXTIME_PATTERN` wrongly **accepts** `"h"`, `"3h "`; its `|| maxTime.startsWith("-")` disjunct is **[dead]** (the regex already requires an alphanumeric first char).
8. `normalizeScopePath` (`impl:151-163`): `./` strip, trailing `/`, whitespace trim, leading `~`, `..` segment, `//` empty segment, non-string entry, empty/whitespace entry, post-strip-empty (`./`, `/`), `.` segment accepted, interior `~` accepted, and intra-mission duplicate scope entries not deduped.
9. `scopeOverlaps` (`impl:165-170`): identical scopes, equal-length deep-identical prefixes, 3-mission chains (`a`, `a/b`, `a/b/c`), component boundary `src` vs `srcfoo`; its second clause `&& short.every(...)` (`impl:169`) is **[dead]** surplus.
10. `skills`: non-array refusal (`impl:230-232`), unsafe name (`impl:227`), 64/65 boundary, `null` → `[]` (`impl:223-225`); `copySkill` precedence repo→ufoRoot→`~/.agents` (`impl:467`), recursive `cpSync` (`impl:470-472`), `null` return (`impl:475`), missing-skill `warn` (`impl:524-527`), `record.skills` (`impl:501,527`) — all unexecuted. Hazard: the `~/.agents/skills` tier reads the developer's real home (`impl:462`).

### 3.3 band authority
11. The whole `CONFIG_UNREADABLE` family (`impl:110-139`): config absent, invalid JSON, missing `sighting/dispatch/swarm/missionFormat/l1Alias`, `intOf` rejects (0 / negative / float / string), impossible band (`waveMin>waveMax`), unsafe `l1Alias` token, and the non-string `l1Alias` coercion (`impl:132`). The fixture copies the real config once (`T:84`) and never perturbs it.

### 3.4 ceilings
12. `PANE_CEILING_EXCEEDED` (`impl:202-204`) — unasserted **and dead under the live 16/16 authority**. The L1-before-pane check order is unpinned (the only ceiling test runs where both bounds are equal). Exact-ceiling acceptance is untested (§1 probe).

### 3.5 prompt rendering
13. `RENDER_UNRESOLVED`: unknown-key arm (`impl:294`) **[dead]** from the shipped template (all 17 template placeholders are in the values map); leftover arm (`impl:298`) reachable **from spec content** — a mission `goal` containing `{{nope}}` refuses, but the guard's `[A-Za-z]+` class lets `{{evil1}}` / `{{ evil }}` through verbatim into the rendered prompt. Spec values are interpolated unescaped into a markdown table, so a `goal` containing a newline forges a fake band row (`exit 0`).
14. Rendered values never asserted: `reportDir`, `stateDir`, `validator`, `base`, `scope`, `repo`, `ufoRoot` — only 6 of 17 substitutions are asserted. Values-map key `l1Alias` is unused by the template (never detected).

### 3.6 argv construction and shell-outs
15. omp argv: `--session-dir` (`impl:324`), the `--max-time` value (`impl:325`), `--config` (`impl:327`, which hardcodes `mission-nightcall.yml` instead of reading `missionFormat.configPath`) — never asserted. The `argv[2] !== worktree` equality check (`impl:334`) is a **[dead]** tautology (both operands are the same const). `INTERACTIVE_GUARD` (`impl:310-315`) is unreachable **[dead]** and untested: every flag-injection attempt through the only bare-token spec field (`maxTime`) is refused earlier by `loadSpec`.
16. `run()` `ENOENT` → `COMMAND_MISSING` (`impl:360-362`) reachable but unprobed; `status ?? 127` and `?? ""` fallbacks unprobed; a non-ENOENT spawn error would be misreported as exit 127. `run()` spreads caller options after its fixed object (`impl:359`), so a future `{shell:true}` call site would void the argv-only rule undetected. `quoteArg` untested.
17. **close's printed removal command** (`impl:664`) interpolates `spec.repo` and the worktree path unquoted: a spec path containing `;` or `$()` yields a shell-shaped line for the operator to paste. The launcher never executes it itself (that is why this is MEDIUM, not HIGH).

### 3.7 launch (`verbLaunch`, `impl:479-596`) — never executed
18. wall open + `WALL_OPEN_FAILED` (`impl:483-486`), `stateDir` mkdir (`impl:487`), `omp worktree add` argv (`impl:511-517`) + `WORKTREE_ADD_FAILED` (`impl:519`) with its mid-loop abort that skips the `fleet.json` write while earlier panes stay live, worktree reuse + warn + `worktreeReused` (`impl:507-509`), skill copy (`impl:524-528`), prompt write (`impl:548`), sessions dir (`impl:531-533`), the `launchArgv.slice(2)` reconstruction (`impl:536`), `launchResult` capture + `paneId` match + null-pane warn (`impl:551-555`), `LAUNCH_FAILED` continue + verbatim detail fallback (`impl:536-549`), `fleet.json` schema and `warnings` accumulation (`impl:560-582`), `LAUNCH_PARTIAL` + exit 2 (`impl:592-593`), the clean-run half (`ok:true`, `failures:[]`), the JSON view stripping `launchResult` into `launchResultRecorded` (`impl:585`), human launch output (`impl:587-591`).

### 3.8 status (`impl:607-637`) — never executed
19. Fleet filter `(mission.fleet ?? null) === spec.fleet` (`impl:613`), `runId ?? missionId` (`impl:615`), `status ?? phase ?? "unknown"` (`impl:618`), the `not-on-wall` synthesis (`impl:622-626`) **and its count heuristic** (`rows.length < spec.missions.length` silently drops a missing mission when an extra wall row compensates), `roundReceipts` (`impl:598-605`: absent dir, name filter, numeric `r10` vs `r2` sort, `?? 0` fallback), `WALL_STATUS_FAILED` (`impl:610`), `WALL_OUTPUT` (`impl:612`), `wallStatus ?? "present"` (`impl:629`), the human table (`impl:631-638`).

### 3.9 close (`impl:642-668`) — never executed with `--apply`
20. `--mission` filtering (`impl:645`), `UNKNOWN_MISSION` (`impl:646`) + refusal-before-wall, `complete --mission <id> --note "tower-fleet close"` as single tokens (`impl:651`), `COMPLETE_FAILED` (`impl:652-653`) **and the partial-completion hole** (the throw is inside the loop, so earlier missions are already completed on the wall and stdout carries no receipt and no worktree guidance), JSON shape + `worktreeRemoval:"manual-only"` (`impl:655-658`), all human lines (`impl:660-665`), guard precedence (`impl:701-703` fires before `:646`, so `close --mission <unknown>` without `--apply` reports `MUTATION_REQUIRES_APPLY`).

### 3.10 safety contract (S1:22-30) as *tested* properties
21. **No** assertion exists for the never-`omp worktree clear` claim (`grep 'worktree clear' test/tower-fleet.test.mjs` → 0). A lane mutant that re-adds `omp worktree clear --all` plus `worktreeRemoval:"automatic"` leaves the whole suite at `ALL CHECKS PASS` (25 of 42 mutants survived overall).
22. The `<ufoRoot>`-never-written claim is **unenforced and unasserted**: `resolveRepoPath` (`impl:145-149`) has no containment check, and a fixture spec with `stateDir=<ufoRoot>/config` (directly or through a symlink) exits 0 and lands `fleet.json` + `<id>.prompt.md` inside `ufoRoot`. Same class as the operator's 01:22Z symlink clobber.
23. plan's no-write guarantee is asserted only for the two tmp dirs (`T:208-209`), not for the substrate.

### 3.11 harness fidelity (the test file itself)
24. The band assertion is self-referential: `BAND` is parsed from the same fixture copy (`T:84`) the launcher reads (`T:170-172`), so **hardcoding today's live numbers passes**, and the four fields that all equal 16 can be cross-wired silently.
25. The suite is not self-contained: it GATEs with `exit 1` — the same code as a real failure — when the substrate config is missing, and its default substrate path is machine-specific (`T:45,78`).
26. Mission identities are never pinned: `tf-alpha`/`tf-beta`/axis strings appear only as inputs, so a launcher that mangles ids still passes every check.
27. Cleanup runs on the happy path only: an uncaught `JSON.parse` (`T:166`, `T:91`) kills the process before `rmSync`, leaking temp dirs (demonstrated).
28. `launcher()` (`T:141-143`) has no timeout or env isolation — a hanging child hangs the suite; one check spawns twice (`T:287`), ~17 node processes per run, ~7% of runtime for zero discrimination.

## 4. Tests that only re-pin incidental behaviour

Each entry: the verbatim assertion, why it is incidental, and the evidence. Two lanes produced
mutation/wording receipts, so these are measured, not argued.

| # | assertion (verbatim, trimmed) | why incidental | evidence |
|---|---|---|---|
| P1 | `T:181` ``row.prompt.includes(`\| wave band \| ${BAND.waveMin}–${BAND.waveMax} lanes per wave \|`)`` | pins the template's prose + markdown cell + en-dash; fails on `per wave`→`each wave` or `–`→`-` with behaviour unchanged; and passes when the numbers are hardcoded in the template | wording-only edit on a `/tmp` copy → `FAILURES 4`/`FAILURES 2`, exit 1; hardcoded cells → `ALL CHECKS PASS` |
| P2 | `T:182` ``row.prompt.includes(`\| round ceiling \| ${BAND.maxLanes} lanes per round; 2 rounds \|`)`` | same class, plus the literal `2 rounds` bypasses `baseSpec().roundCeiling` | same receipt |
| P3 | `T:183` `!/\{\{[A-Za-z]+\}\}/.test(row.prompt)` | a copy of the implementation's own guard (`impl:297`) — tautological with it, so it cannot see the guard's blind spot (`{{evil1}}` renders fine) | lane probe: `{{evil1}}` goal → exit 0 with the token in the prompt |
| P4 | `T:187` `argv[0] === "bash" && argv[1] === path.join(UFO_ROOT,"scripts","ufo-sighting") && argv[2] === "launch"` | pins *how* the wall is invoked (a `bash` wrapper around that exact path); an equivalent `execFile`-style dispatch would fail while being correct | lane reasoning + `impl:536` slice |
| P5 | `T:190` `["--run-id","--session-id","--title","--no-open","--relay","--runner-reservation"].every(f => argv.includes(f))` | presence-only: passes if the flags move after `--` into the omp region, and never checks their **values** (`--run-id`/`--session-id`/`--title`/`--runner-reservation`) though status/close key on them | lane probe: argv values unpinned |
| P6 | `T:193` `ompArgv[0]==="omp" && ompArgv.includes("--print-thoughts") && ompArgv.includes("--auto-approve")`, and `T:196`'s forbidden-token filter | `--print-thoughts` is display-only (zero hits in the wall preflight) and neither token relates to the "interactive" property claimed; the filter is a character-for-character copy of `interactiveGuard`'s predicate applied to the plan preview, so it cannot distinguish "guard ran" from "guard deleted" | lane grep of the wall CLI |
| P7 | `T:196` `ompArgv.at(-1) === "@" + promptPath` | pins argv ordering (prompt-last); the wall passes positionals through in place, so emitting the prompt first is equally correct | lane reasoning |
| P8 | `T:167` `plan.verb === "plan"` and `T:169` `plan.writes === false` | echoes of the tool's own report with no consumer outside the tests (`writes:false` is also proven behaviourally at `T:204-207`) | `grep` in-tree: only test references |
| P9 | `T:259`/`T:260` "bad fleet" + "uppercase fleet" | the same branch (`impl:189-190`) with one observable; across 42 mutants `T:259` produced **0 unique kills** (`T:260` produced 2) | mutation table in `r1-pin-refusals.md` |
| P10 | `T:270` "absolute scope" | pins a disjunction (`impl:155-157` **or** `impl:159-161`): deleting either site alone survives | mutant `abs-scope-site-removed` SURVIVES |
| P11 | `T:279`/`T:280` launch/close without `--apply` | one `\|\|` condition (`impl:701-703`), one observable; `guard-message-loses-verb` survives | mutation table |
| P12 | `T:287` `check("missing --spec", launcher(["plan"]).status === 64, String(launcher(["plan"]).status))` | re-spawns a second, different process to print a status the condition already knows: 2 of 16 spawns, ~7% runtime, zero discrimination | baseline 239ms vs 222ms single-call copy |
| P13 | `T:281` `check("guard refused before any wall touch", !existsSync(STATE_DIR))` | vacuously true for `close` (which never touches `stateDir`), and it would pass even if the refusal had touched the wall | lane reasoning |
| P14 | `T:288-290` usage trio | three branches, one observable (`status === 64`); the `{"ok":false,"code":"USAGE"}` payload (`impl:87`) is unpinned, and 4 sibling usage branches are never invoked | mutation `usage-no-typed-payload` SURVIVES |
| P15 | `T:170-173` `check("plan reads band live", …)` | compares plan output to the same config copy the fixture read, so it passes with the numbers hardcoded — it pins a coincidence | `r1-fixture-infra.md` HIGH-1 |
| P16 | `T:208` `readdirSafe(STATE_DIR).length === 0` (conjunct) | dead once `!existsSync` holds — zero detection power | lane reasoning |
| P17 | `T:5-9` header claim "hermetic checks" | prose stronger than the behaviour (external substrate dependency) | `r1-fixture-infra.md` |
| P18 | `T:184` `row.prompt.includes(\`\` \`${row.id}\` \`\`\`)` id/axis presence | *judged not incidental* (the backticked id occurs only at the 3 substitution sites, so it does discriminate substitution) — recorded here because `r1-trace-matrix.md` listed it as weak | lane probe |

## 5. Dead / unreachable code — reported so it is not counted as "untested"

`INTERACTIVE_GUARD` arms (`impl:310-315`); the `argv[2] !== worktree` equality check
(`impl:334`, tautology); `main()`'s `default:` usageExit (`impl:728`, gated by `VERBS`);
`loadSpec`'s "spec must be a JSON object" (`impl:188`, `main():718` fires first for array/null);
`loadSpec`'s duplicate file/repo/ufoRoot guards (`impl:184-187,193`, shadowed by `main()`);
`maxTime.startsWith("-")` (`impl:253`); `scopeOverlaps`'s second clause (`impl:169`);
the `(typed(...), [])` non-array fallback (`impl:230-232`); `close`'s `status: completed.status`
(`impl:655`, always 0 because a nonzero throws at `:653`); and `PANE_CEILING_EXCEEDED` **under the
live 16/16 authority** (`impl:202-204`).

## 6. Adjudications and corrections (judge log)

- **Contradiction resolved, in favour of the mutation evidence.** `r1-spec-identity.md:31` first called the fleet-name pair "covered"; `r1-pin-refusals.md` showed `T:259` yields 0 unique kills. `r1-spec-identity` was re-run, verified the peer's probe independently (`fleet 48-char exit 0`, `49 exit 2`, `illegal char at index 47 exit 2`, `tower-1 exit 0`), and amended its report to "site touched but tail not exercised (NOT fully covered)". Accepted.
- **My brief was wrong in two places, and lanes corrected it:** the suite *does* run `plan` without `--json` (`T:253`) — the human renderer is smoke-executed but unasserted; and absolute scope (`/etc/passwd`) *is* covered (`T:270-272`).
- **Line drift:** the fixture's `scripts/` mkdir is `T:85` in this worktree (peers cited `T:88/91`); all citations here use the file as read at 22:39Z.
- **Rejected moves:** none. Every lane was read-only, wrote only its own report path, and returned findings; no lane regressed an axis. Nothing was integrated into source because this mission's scope is the report alone.

## 7. Cheapest tests that would close the largest gaps (ranked)

1. **Exact-ceiling acceptance** — a spec with exactly `maxConcurrentL1` missions must exit 0 (kills the `>` → `>=` flip that would reject the live fleet). 3 lines.
2. **`PANE_CEILING_EXCEEDED`** — fixture config with `windowPaneCeiling 3 / maxConcurrentL1 16` + a 4-mission spec; assert exit 2 + code.
3. **`launch --apply` partial failure** — stub `ufoRoot/scripts/ufo-sighting` (fail mission 2) + PATH-shimmed `omp`; assert exit 2, `LAUNCH_PARTIAL`, and `fleet.json` with `ok:false` (the newest commit's behaviour, currently untested).
4. **Replace the fixture config** with an inline synthetic config carrying sentinel band numbers, and pin `plan.missions.map(r => r.id)` — kills the self-referential band pin (§3.11) and the coincidental pins P1/P2/P15 at once.
5. **`status` against a stub wall** — canned `status --lite` with a foreign-fleet row, a missing fleet mission, and rounds `r1/r2/r10`; assert the filter, the `not-on-wall` row, and numeric ordering.
6. **`close --apply` against a stub wall** — assert the `complete` argv, the manual per-path `git -C … worktree remove` line, and (strongest) that no `omp worktree clear/remove` invocation appears in a recorded argv log.
7. **`CONFIG_UNREADABLE` set** — four mutants (absent, non-JSON, missing `l1Alias`, `waveMin>waveMax`).
8. **Spec-refusal set** — bad `maxTime`, `roundCeiling: 0`, empty `title/axis/goal`, `scope: []`, `skills` non-array + unsafe name, scope `..`/`~`/`//`.
9. **Source-injection receipt** — a `title` containing `;` must arrive as one argv token with no shell side-effect; and route `close`'s printed removal line through `quoteArg`.
10. **Harness hardening** — give `launcher()` a timeout, drop the double spawn (`T:287`), and make cleanup unconditional.

## 8. What this audit does not prove

- Nothing about the wall's own semantics (tmux pane teardown on `complete`, `status --lite` truthfulness) — out of scope; no mutating wall verb was executed by any lane or by me.
- Nothing about the band/wave-validator chain itself (tf-band / tf-wavetest axes; `test/run-wave-test.mjs` marked PASS(elsewhere)).
- No source change was made anywhere: this mission's scope is this report. Every recommended test is unapplied.
- `launch --apply` was never run against the real wall, so "the launcher works end to end in production" remains unverified by this audit — only its *plan-time* argv and its *stub-wall* behaviour were exercised.