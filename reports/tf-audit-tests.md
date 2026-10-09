# tf-audit-tests — test-coverage audit of the tower-fleet feature

- fleet `tower1` · mission `tf-audit-tests` · axis `audit-tests` · rounds 1–2 (22 + 18 lanes, 0 resumed)
- feature audited: `sighting/tower-fleet.mjs` (741 lines, verbs `plan|launch|status|close`), `sighting/l1-prompt.md`
- suite audited: `test/tower-fleet.test.mjs` (294 lines, 8 sections; 30 standalone `check(...)` sites + 9 `expectTyped(...)` sites, ≈73 assertions executed on a green run)
- worktree: `/home/vgpnk/Projects/ompskills/.tower/worktrees/tower1/tf-audit-tests` · scope of this file: `reports/tf-audit-tests.md`
- lane evidence (40 lane reports, all read-only): `/home/vgpnk/Projects/ompskills/.tower/fleets/tower1/reports/tf-audit-tests/r1-*.md`, `r2-*.md`
- revision audited: `sighting/tower-fleet.mjs` md5 `d365090b…`, `test/tower-fleet.test.mjs` md5 `d6b8c8fe…`; round-2 re-derived every claim at HEAD `8e48b75`

## 0. Verdict and headline numbers

**Verdict: GAP.** The suite is green (`ALL CHECKS PASS`, exit 0) and pins the `plan` verb's
argument construction plus a handful of spec-validation refusals. It asserts **nothing** about
any state-changing behaviour: `launch --apply`, `close --apply` and `status` never execute.

| measure | value | verified in |
|---|---|---|
| acceptance criteria extracted from the three defining sources | **74** | round 2 re-added every row/column sum |
| criteria with discriminating coverage (PASS) | **15** (+2 covered in `test/run-wave-test.mjs`, a different feature) | round 2 |
| criteria with only weak/coincidental coverage (WEAK) | **24** | round 2 |
| criteria with no assertion at all (GAP) | **33** | round 2 |
| distinct typed error codes the launcher can emit | **18** (16 via `typed("…")`, plus `USAGE` and `UNEXPECTED_ERROR`; `LAUNCH_FAILED` is a record code, never thrown) | round 2 recounted |
| codes with any assertion | **4** (`INVALID_SPEC`, `L1_CEILING_EXCEEDED`, `SCOPE_OVERLAP`, `MUTATION_REQUIRES_APPLY`); `USAGE` asserted only as `exit 64` | round 2 |
| launcher symbols / branches inventoried | **30 symbols** (11 never entered, 2 entered but unasserted) · **104 branch rows** (~17 covered, 8 dead, ~79 gap) | round 2 recounted (8 dead rows, 17+8+79=104) |
| suite mutation probe | **43 mutants** (launcher) + 1 test-refactor → **17 killed / 26 survived** | `r1-pin-refusals.md` §5, corrected in round 2 |
| round-2 verification lanes | **18** — 3 PASS, 9 FAIL, 6 GAP; **all 9 FAILs are citation/receipt defects, no behavioural claim was falsified**; **22 additions** | §9 |

## 1. Method, provenance, and independent verification

No acceptance-criteria document exists in the repo (`grep -rn "acceptance"` → no matches), so
criteria were taken from the three sources that define the feature:

| tag | source | declares |
|---|---|---|
| **A** | `sighting/tower-fleet.mjs:4-47` (module doc comment) | verbs, default verb, exit codes 0/2/64, typed-error shape, safety contract, fleet-spec schema + defaults |
| **B** | `.omp/skills/tower/SKILL.md` §"Sighting fleet (tower mode)" | verbs + `--apply`, worktree/branch/prompt per mission, pane ceilings, `SCOPE_OVERLAP` gate, writer isolation, close rules |
| **C** | `.tower/fleets/tower1/spec.json` | `tf-launcher` gaps a–d (goal at `spec.json:13`), `tf-tests` list (`spec.json:20`), `tf-prompt` (`spec.json:38`), `tf-band`, `tf-wavetest` — **the file was reordered after round 1**, so line cites here are the round-2 ones |

Two round-1 lane reports were amended mid-wave (`r1-pin-refusals.md`, `r1-spec-identity.md`) after
cross-lane IRC; where a lane report and this document disagree on a *line number*, this document is
the round-2-verified value. The lane corpus is not frozen — cite its anchor text, not its lines.

L1-reproduced facts (my own runs):

```
$ node test/tower-fleet.test.mjs                      → ALL CHECKS PASS, exit 0
$ node sighting/tower-fleet.mjs plan --spec <16-mission fixture> --json
                                                      → exit 0, 16 missions planned
$ node sighting/tower-fleet.mjs plan --spec <17-mission fixture> --json
                                                      → exit 2 {"code":"L1_CEILING_EXCEEDED"}
$ grep -c 'copySkill|paneId|fleet\.json|sessions|launchResult' test/tower-fleet.test.mjs  → 0 each
```

Band authority read live at both dispatches (`.../ufo-fsd-alpha/config/ufo.json`):
`waveMinLanes 16, waveMaxLanes 32, minLanes 16, maxLanes 100, windowPaneCeiling 16,
maxConcurrentL1 16, l1Alias m_strong`. A sibling lane clobbered this file mid-mission (32/100 via a
symlink write); the operator restored it at 01:31Z and the wave was re-validated against the restored
values. All 40 lanes re-read it independently and reported the same numbers.

## 2. Acceptance-criteria traceability (spine)

Full 74-row matrix with per-criterion evidence: `r1-trace-matrix.md` §1 (verdict cells re-sampled and
re-derived in round 2 — 12/12 hold). Condensed:

| source | rows | PASS | PASS(elsewhere) | WEAK | GAP |
|---|---|---|---|---|---|
| A module doc comment | 42 | 8 | 0 | 12 | 22 |
| B tower SKILL §fleet | 19 | 4 | 0 | 9 | 6 |
| C fleet spec missions | 13 | 3 | 2 | 3 | 5 |
| **total** | **74** | **15** | **2** | **24** | **33** |

15 of the 33 GAPs hang off the three verbs that only ever reach the `--apply` guard
(A34, A37–A42, B7, B9, B16–B19, C1–C4). C11/C12 (band and wave-test criteria) are covered in
`test/run-wave-test.mjs` — a sibling mission's scope, PASS(elsewhere). Note `r1-trace-matrix.md:64`
(A34) overstates its own case: it claims every invocation passes `--json`, but `T:253` runs plan
without it (round-2 correction); the human renderer is *executed once, unasserted*, not never-run.

### 2.1 Criteria with no implementation (not merely no test)

Three acceptance criteria can never be satisfied by any test because the behaviour does not exist in
the audited revision — proven by enumeration, not by argument (round 2 re-proved all three):

| criterion | source | state |
|---|---|---|
| relaunch idempotent for **pane and prompt** (reuse existing pane) | spec.json:13 (tf-launcher b) | worktree is reused (`impl:507-509`); the prompt is rewritten unconditionally (`impl:533`, `writeFileSync(row.promptPath, row.prompt)`); **no pane-reuse branch exists** (`paneId` is assigned at `:554` and rendered, never consulted before the launch at `:536`) |
| `status` reconciles the wall against `fleet.json` **vice versa** | spec.json:13 (tf-launcher c) | `fleet.json` is only ever written (quoted literal `"fleet.json"` → `impl:560` only); every `readFileSync`/`JSON.parse` site enumerated (`110/184/271/376/540/714`) and none is `fleet.json`. A `fleet.json` naming an extra mission changes nothing in `status` output |
| `close` refuses a live pane unless `--force` | spec.json:13 (tf-launcher d) | no `\bforce\b` token in the source; `close --apply --force` → exit 64 `USAGE "unknown argument --force"` |

## 3. Untested behaviours — complete inventory

Grouped by surface; each item is a reachable branch/typed code/observable effect with its code site
and an absence proof (test-file grep, quoted in the lane reports). Items marked **[dead]** are
unreachable (§5) — listed so they are not mistaken for coverage. Round-2 additions are marked **[+]**.

### 3.1 plan verb, CLI parsing, human renderers
1. Human (non-`--json`) renderers for all four verbs — `printPlanHuman`/`quoteArg` (`impl:406-426`), launch (`impl:587-591`), status table (`impl:631-638`), close text (`impl:660-665`). Only `T:253` runs human mode and it asserts `status === 0` alone; `quoteArg` has a single call site (`impl:421`) and its single-quote escape branch (`impl:407`) is never reached by the suite — though it **is** reachable from spec content (probe printed `'O'\''Brien says hi'`). **[+]** No test asserts JSON-vs-human agreement for the same plan data: a mutant that drops a mission from the human render leaves the suite green.
2. `--help`/`-h` exit 0 + stdout (`impl:692-695`); `--spec` with no value (`impl:683`); `--mission` with no id (`impl:690`); `--mission` on a non-close verb (`impl:700`); `--apply` accepted-and-ignored on plan (`impl:685`, and the status variant is the same branch); positional in flag position (`impl:696`); relative `--spec` (`impl:684`); `main()`'s `default:` usageExit **[dead]** (`impl:728`). **[+]** flags consumed as flag-values: `--spec --json` resolves the cwd-relative path `./--json` (ENOENT) instead of a usage error (`impl:683-684`), and `--mission --json` reports `UNKNOWN_MISSION "--mission --json"` (`impl:689-690`). **[+]** repeated flags are silently last-wins: `plan --spec /nope --spec good` → exit 0, the typo'd first path discarded (`impl:684`).
3. plan `--json` top-level echoes never asserted: `ok` (`impl:432`) and `repo/base/stateDir/worktreeRoot/roundCeiling/maxTime` (`impl:436-441`); per-row `goal/scope/skills` echoes (`impl:393-395`); **[+]** per-row `title` (`impl:391`) and `ompArgv` (`impl:399`) — the tests reconstruct the omp tokens from `launchArgv` after `--`, so a divergence between the `ompArgv` field and the `launchArgv` tail passes. **[+]** `emitJson`'s byte shape (2-space indent + trailing newline, `impl:93-95`) is invisible to a `JSON.parse`-only suite.

### 3.2 spec validation
4. `FLEET_PATTERN` boundaries: 48 chars ok / 49 refused, and any violation after index 0 (length tail, `$` anchor, mid-string) — `T:259/260` both fail at position 0 (`impl:68/189`). **[+]** first-class boundaries unmentioned: a digit-leading fleet (`1tftest`) is **accepted** and internal-underscore mission ids (`tf_alpha-1`) are accepted. **[+]** the fleet name is validated **untrimmed** (`impl:189`) while every other string scalar is trimmed, and `raw.fleet` feeds the default `stateDir`/`worktreeRoot` (`impl:262-263`) — a trim-adding mutant survives.
5. `MISSION_ID_PATTERN` 64 ok / 65 refused (`impl:69/211`). **[+]** whitespace-padded mission ids are silently normalized (`"  tf-a  "` → `tf-a`, `impl:210`) and drive branch/worktree/promptPath names.
6. Empty/whitespace `title|axis|goal` (`impl:214-217`); non-object mission (`impl:209`); `missions` absent/`[]`/non-array (`impl:198`); `scope: []` and non-array scope (`impl:219-221`); `stateDir`/`worktreeRoot` non-string (`impl:146-148`); missing `repo` (**reachable**, `impl:192`); missing `ufoRoot` (`main:718-720`); absent spec file (`impl:714-716`). **[+]** the `stateDir`/`worktreeRoot` **default** path (`<repo>/.tower/fleets|worktrees/<fleet>`, `impl:262-263`) is never probed — relevant to the containment finding (§3.10-22).
7. `roundCeiling` 0/-1/1.5/`"2"` (`impl:250-251`) **[+]** and its default `1` (`impl:250`); `maxTime` `""`/`"-3h"`/`"3 h"` (`impl:252-253`) **[+]** plus `maxTime: null` silently accepted as the literal string `"null"` (`impl:252` `String(null)`) — the same wrong-accept family as `"h"` and `"3h "` (the latter two are accepted because `:252` trims before testing the pattern). The `|| maxTime.startsWith("-")` disjunct is **[dead]** (brute-forced: 2,190 dash-leading strings, zero counterexamples).
8. `normalizeScopePath` (`impl:151-163`), all 14 branches re-derived: `./` strip, trailing `/`, whitespace trim, leading `~`, `..` segment, `//` empty segment, non-string, empty/whitespace, post-strip-empty, `.` segment accepted, interior `~` accepted, intra-mission duplicates not deduped.
9. `scopeOverlaps` (`impl:165-170`): identical scopes, equal-length deep-identical prefixes, 3-mission chains, component boundary `src` vs `srcfoo`; its second clause (`impl:169`) is **[dead]** (exhaustive 400-pair sweep: clause 1 ≡ clause 1 ∧ clause 2).
10. `skills`: non-array (`impl:230-232`), unsafe name (`impl:227`), 64/65 boundary, `null` → `[]` (`impl:223-225`); `copySkill` precedence repo→ufoRoot→`~/.agents` (`impl:467`), recursive `cpSync` (`impl:470-472`), `null` return (`impl:476`), missing-skill `warn` (`impl:524-527`), `record.skills` (`impl:501,527`) — all unexecuted (sole call site `:525` is inside `verbLaunch`). Hazard: the `~/.agents/skills` tier reads the developer's real home (`impl:462`).

### 3.3 band authority
11. The whole `CONFIG_UNREADABLE` family (`impl:110-139`): config absent, invalid JSON, missing `sighting/dispatch/swarm/missionFormat/l1Alias`, `intOf` rejects, impossible band, unsafe `l1Alias` token, non-string coercion (`impl:132`). Five mutants probed by round 2, all exit 2. The fixture copies the real config once (`T:84`) and never perturbs it.

### 3.4 ceilings
12. `PANE_CEILING_EXCEEDED` (`impl:202-204`) is unasserted and **dead under the live 16/16 authority** (reachable iff `windowPaneCeiling < maxConcurrentL1`; probe with pane 3 / L1 16 fires it). *Corrected in round 2:* the L1-before-pane **order is pinned today** — `T:234` asserts `L1_CEILING_EXCEEDED` for n=17, which exceeds both equal bounds, so swapping the two checks fails the suite. But that pin is a coincidence of equal bounds, not a design intent: with a `pane > L1` fixture both the original and the swapped launcher emit the same code, and deleting the pane check outright survives (0 PANE assertions). Pinning the order properly needs an extra fixture (`pane 32 / L1 16`, 33 missions).
13. Exact-ceiling acceptance is untested: the suite only ever tries 2 missions and `L1+1`. My probe: 16 missions → exit 0 (16 planned), 17 → `L1_CEILING_EXCEEDED`. A `>` → `>=` flip would pass the whole suite while rejecting the live 16-mission fleet running this audit.

### 3.5 prompt rendering
14. `RENDER_UNRESOLVED`: unknown-key arm (`impl:294`) **[dead]** from the shipped template (17 placeholders, all in the 18-key values map); leftover arm (`impl:298`) reachable **from spec content**. **Corrected in round 2:** only **5 of 16** substitutions are asserted (`missionId`, `axis`, `waveMin`, `waveMax`, `roundLaneCeiling`), so **11 are never asserted** (`fleet`, `title`, `goal`, `repo`, `worktree`, `base`, `ufoRoot`, `stateDir`, `reportDir`, `validator`, `roundCeiling`) — round 1 said "6 of 17", counting `roundCeiling` as asserted when `T:182` hardcodes the literal `2 rounds`. `RENDER_UNRESOLVED` is asserted **zero** times: deleting `impl:297-299` leaves the suite green even though arm `:298` is the live render-error path. The guard's `[A-Za-z]+` class lets `{{evil1}}` / `{{ evil }}` through verbatim, and spec values are interpolated unescaped into a markdown table — **[+]** a newline in a `goal`, `title`, `axis` (twice) or `scope` entry forges a fake band row at exit 0.
15. **[+]** The template's own prose is unprotected: mutating the 7-line load-order block, the wave-sizing mandate ("padding to the floor is forbidden"), the validator command block (`UFO_PROJECT_ROOT`/`UFO_CONFIG_PATH`/`UFO_FLEET_ALLOW_EXTERNAL_TOOLS`/`node {{validator}} plan`) or the step-7 receipt path (`{{stateDir}}/rounds/{{missionId}}-r<N>.md`) all leave the suite green. The prompt's skill set is not derived from the spec (no `{{skills}}` placeholder), and `skill://wwkd` / `skill://ufo` resolve to no skill on this machine (`.omp/skills` = {swarm, tower}; `~/.agents/skills` = {godspeed, omarchy}).

### 3.6 argv construction and shell-outs
16. omp argv: `--session-dir` (`impl:324`), the `--max-time` value (`impl:325`), `--config` (`impl:327`) — never asserted, and `--config` hardcodes `mission-nightcall.yml` instead of reading `missionFormat.configPath` (proved: a scratch config with `configPath: mission-SENTINEL-OTHER.yml` still prints `mission-nightcall.yml`; today the hardcode coincides with the live value). The `argv[2] !== worktree` check (`impl:334`) is a **[dead]** tautology and mislabels itself `INTERACTIVE_GUARD`. `INTERACTIVE_GUARD` (`impl:310-315`) is unreachable and untested: every token is a fixed literal, a `/`-prefixed path, an `@`-prefixed alias, or the sole bare spec token `maxTime` (gated by `MAXTIME_PATTERN`). **[+]** the guard never scans the **wall-side** launch argv: `["--title", mission.title]` (`impl:346`) forwards a bare spec-controlled token to the wall's parser, so the "only bare token is maxTime" premise holds for the omp argv only.
17. `run()` `ENOENT` → `COMMAND_MISSING` (`impl:360-362`) reachable (proved: `PATH=/nonexistent` → `cannot spawn git … ENOENT`) but unasserted; a non-ENOENT spawn error is laundered — under a mode-644 `git` the launcher reports exit 127 / "is it a git checkout?" instead of a typed error. `status ?? 127` and `?? ""` unprobed. `run()` spreads caller options after its fixed object (`impl:359`), so a future `{shell:true}` call site would void the argv-only rule undetected. `quoteArg` untested.
18. **close's printed removal command** (`impl:664`) interpolates `spec.repo` and the worktree unquoted; the constructed string for a repo path `/tmp/…/repo;semi` pastes as two shell commands. The launcher never executes it itself (hence MEDIUM). Note `quoteArg` already exists at `impl:406` — the smallest fix routes `:664` through it, which is a **source** change, not a test (§7 row 9).

### 3.7 launch (`verbLaunch`, `impl:479-596`) — never executed
19. wall open + `WALL_OPEN_FAILED` (`impl:483-486`), `stateDir` mkdir (`impl:487`), `omp worktree add` argv (`impl:511-517`) + `WORKTREE_ADD_FAILED` (`impl:519`) with its mid-loop abort that skips the `fleet.json` write while earlier panes stay live (proved: exit 2, empty stdout, no `fleet.json`, earlier `launch` call already dispatched), worktree reuse + warn + `worktreeReused` (`impl:507-509`), skill copy (`impl:524-528`), prompt write (`impl:533`), sessions dir (`impl:531-533`), the `launchArgv.slice(2)` reconstruction (`impl:536`), `launchResult` capture + `paneId` match + null-pane warn (`impl:551-555`), `LAUNCH_FAILED` continue + verbatim detail fallback (`impl:536-549`), `fleet.json` schema + `warnings` accumulation (`impl:560-582`), `LAUNCH_PARTIAL` + exit 2 (`impl:592-593`), the clean-run half, `launchResultRecorded` (`impl:585`), human launch output (`impl:587-591`). **[+]** launch-time `WALL_OUTPUT` (an exit-0 wall printing non-JSON, `impl:374-379` via `:551`) is unnamed in round 1 and untested. **[+]** untyped disk errors inside `verbLaunch` (`mkdirSync :487/:532`, `writeFileSync :533/:561`) escape to `UNEXPECTED_ERROR`; **[+]** the failure-detail stream precedence is asymmetric (`:538` seeds `stderr||stdout`, `:540` parses `stdout||stderr`). **[+]** `launch` **hangs forever** when `stateDir` sits under a pseudo-filesystem: `mkdirSync(stateDir, {recursive:true})` at `impl:487` blocks indefinitely (`/proc/1/nope` probe killed at 300 s; minimal repro `timeout 10` → exit 124), while the non-recursive form throws ENOENT instantly.

### 3.8 status (`impl:607-640`) — never executed
20. Fleet filter (`impl:613`), `runId ?? missionId` (`impl:615`), `status ?? phase ?? "unknown"` (`impl:618`), the `not-on-wall` synthesis (`impl:622-626`) **and its count heuristic** (`rows.length < spec.missions.length` silently drops a compensated miss — proved: rows `[sc-a, sc-ghost]` = 2 = spec count → `sc-b` never reported), `roundReceipts` (`impl:598-605`: absent dir, name filter, numeric `r10` vs `r2` sort, `?? 0` fallback), `WALL_STATUS_FAILED` (`impl:610`), `WALL_OUTPUT` (`impl:612`), `wallStatus ?? "present"` (`impl:629`), the human table (`impl:631-638`). **[+]** the `runId`/`missionId` identity split (`impl:615` vs `:623-625`): a live row whose `runId` differs from the spec id is duplicated as a phantom `not-on-wall` row with the receipts split across both — and the phantom inflates `rows.length`, feeding the very heuristic that suppresses true misses. **[+]** the JSON row shape is non-uniform on `title` (live rows omit it when the wall omits it; synthesized rows always carry it).

### 3.9 close (`impl:642-668`) — never executed with `--apply`
21. `--mission` filtering (`impl:645`), `UNKNOWN_MISSION` (`impl:646`) + refusal-before-wall, `complete --mission <id> --note "tower-fleet close"` as single tokens (`impl:650`), `COMPLETE_FAILED` (`impl:652-653`) **and the partial-completion hole** (the throw is inside the loop: earlier missions are already completed on the wall and stdout carries no receipt and no worktree guidance), JSON shape + `worktreeRemoval:"manual-only"` (`impl:655-658`), all human lines (`impl:660-665`), guard precedence (`impl:701-703` fires before `:646`). **[+]** `close --apply --mission ''` closes the **whole fleet**: the filter is truthy (`impl:644`) while the parse guard is a null-check (`impl:700`), so an empty string passes both — `status --mission ''` correctly exits 64.

### 3.10 safety contract (`sighting/tower-fleet.mjs:22-30`) as *tested* properties
22. **No** assertion exists for the never-`omp worktree clear` claim (`grep 'clear' test/tower-fleet.test.mjs` → no match). Round 2 reproduced the mutant: a launcher re-adding `omp worktree clear --all` plus `worktreeRemoval:"automatic"` leaves the suite at `ALL CHECKS PASS` (73 ok).
23. The `<ufoRoot>`-never-written claim is **unenforced and unasserted**: `resolveRepoPath` (`impl:145-148`) has no containment check. Three entry vectors reproduced against the unmodified launcher, all exit 0 with `fleet.json` + `<id>.prompt.md` landing under `ufoRoot`: (a) an absolute `stateDir` inside `ufoRoot`, (b) the same through a **symlink**, (c) — round-2 addition — a **relative** `stateDir` containing `..` (e.g. `../ufoRoot/config`): `normalizeScopePath` refuses `..` for scope, `resolveRepoPath` does not. Any fix must pin `realpath`-inside checks, not just absolute/symlink detection. Same class as the operator's 01:22Z clobber.
24. plan's no-write guarantee is asserted only for the two tmp dirs (`T:208-209`, `T:281`), never for `ufoRoot` or the repo.

### 3.11 harness fidelity (the test file itself)
25. The band assertion is self-referential: `BAND` is parsed from the same fixture copy (`T:84`, `T:91-99`) the launcher reads (`T:170-173`), so **hardcoding today's live numbers passes**, and cross-wiring the sources (a `waveMin` source swap) is silent too — proved: the same hardcoded launcher FAILS (2 checks) against a fixture with `waveMinLanes 20`, showing the green run is self-reference. **[+]** `T:195` (`--model @alias`) shares the blindness: hardcoding `"--model","@m_strong"` while deleting alias routing still passes.
26. The suite is not self-contained: it GATEs with `exit 1` — the same code as a real failure — when the substrate config is missing (`T:78`), and its default substrate path (`T:45`) is machine-specific.
27. Mission identities are never pinned (`tf-alpha`/`tf-beta` appear only as inputs); an id-mangling mutant survives.
28. Cleanup runs on the happy path only: the live crash path is the unguarded `JSON.parse` of the fixture config (`T:91`) — round-2 correction: the `T:166` site cannot fire today, it is behind the `plan exit 0` guard. Remediation should wrap both parses and hoist `rmSync` into an exit/finally handler. A leaked round-1 temp dir was observed still present.
29. `launcher()` (`T:141-143`) has no timeout and no env option — a hanging child hangs the suite (relevant to the `impl:487` hang above); one check spawns twice (`T:287`), 16 spawns / ≈17 node processes per run, ~239–249 ms.

### 3.12 cross-suite (round-2 additions)
30. **No procedure tells anyone to run the launcher suite.** `.omp/skills/tower/SKILL.md`'s fleet section has 0 references to `test/tower-fleet.test.mjs`; the smoke doc's run list never runs it. The spec's `tf-smokedoc` goal demanded the smoke doc cover the live launch procedure for this launcher; the doc has 0 references to `tower-fleet`.
31. `run-wave-test.mjs` covers only the band/wave **validator** (0 hits for `tower-fleet`, `fleet.json`, `worktree`, `l1-prompt`); it never dispatches. The "never against a real wall" bound is tower-fleet-only: `--live-wall` drives real wall verbs there, and the smoke doc hand-runs them — a reader could mistake those for fleet coverage.
32. A sibling mission branch already closes part of the inventory: `tower/tower1/tf-tests` @ `24a47c5` is an **unlanded** 1617-line / 246-check rewrite of `test/tower-fleet.test.mjs` (+1344 lines) that runs `status`, `close --apply` and `launch --apply` refusal paths against a recorded-argv stub wall. Merge-base with this audit is `3dee568`, so it is neither ancestor nor descendant of `8e48b75`. Not my scope to merge; recorded so the recommendations are not re-derived from scratch.

## 4. Tests that only re-pin incidental behaviour

Verbatim assertions, why each is incidental, and the measured evidence. Round-2 re-checked every
quoted assertion against HEAD and re-ran the two receipts; the corrections are noted inline.

| # | assertion (verbatim, trimmed) | why incidental | evidence |
|---|---|---|---|
| P1 | `T:181` wave-band markdown cell | pins the template's prose + cell syntax + en-dash; fails on `per wave`→`each wave` or `–`→`-` with behaviour unchanged; passes when the numbers are hardcoded | wording-only edit → `FAILURES 4`/`FAILURES 2`, exit 1; hardcoded cells → `ALL CHECKS PASS` |
| P2 | `T:182` round-ceiling cell | same class, plus the literal `2 rounds` bypasses `spec.roundCeiling` (never varied) | correct render with `roundCeiling: 3` → `FAILURES 2` |
| P3 | `T:183` `!/\{\{[A-Za-z]+\}\}/.test(row.prompt)` | a character-for-character copy of the implementation's own guard (`impl:297`) — tautological, and blind to its `[A-Za-z]` class gap | `{{evil1}}` goal → exit 0 with the token in the prompt |
| P4 | `T:187` `argv[0]==="bash" && argv[1]===…ufo-sighting && argv[2]==="launch"` | **partly** incidental (round-2 refinement): the `bash` token is an implementation detail (the wall CLI is a `#!bash` wrapper invocable by path), but the `argv[1]` path and `argv[2]` verb are genuine contract | round-2 re-derivation |
| P5 | `T:190` six-flag membership via `argv.includes(flag)` | presence-only: passes if the flags move after `--`, and never checks their values (`--run-id`/`--session-id`/`--title`/`--runner-reservation`) though status/close key on them | round-2 re-derivation |
| P6 | `T:193` `ompArgv[0]==="omp"` + `--print-thoughts`/`--auto-approve`; `T:196` forbidden-token filter | display-only flags (zero hits in the wall preflight); the filter reproduces `interactiveGuard`'s predicate on the plan preview, so it cannot distinguish "guard ran" from "guard deleted", and misses `-p=x`/`--print=x` forms | round-2 re-derivation |
| P7 | `T:198` `ompArgv.at(-1) === "@" + promptPath` | pins argv order; the wall returns child argv after `--` in original order, so prompt position is free | round-2: site is `T:198` (round 1 cited `T:196`) |
| P8 | `T:167` `plan.verb === "plan"`, `T:169` `plan.writes === false`, `T:168`/`T:174` fleet/length echoes | echoes of the tool's own report with no in-tree consumer; `writes:false` is also proven behaviourally (`T:208-209`) | round-2 re-derivation |
| P9 | `T:259`/`T:260` "bad fleet" + "uppercase fleet" | one branch (`impl:189-190`), one observable; across **43** mutants `T:259` produced **0 unique kills**, `T:260` produced 2 | `r1-pin-refusals.md` §5 |
| P10 | `T:270` "absolute scope" | pins a disjunction (`impl:155-157` **or** `impl:159-161`): deleting either site alone survives | mutant `abs-scope-site-removed` SURVIVES |
| P11 | `T:279`/`T:280` launch/close without `--apply` | one `\|\|` condition (`impl:701-703`), one observable | `guard-message-loses-verb` SURVIVES |
| P12 | `T:287` `check("missing --spec", launcher(["plan"]).status === 64, String(launcher(["plan"]).status))` | re-spawns a second process to print a status the condition already knows: 2 of 16 spawns, ~7% runtime, zero discrimination | 239 ms vs 222 ms single-call copy |
| P13 | `T:281` `!existsSync(STATE_DIR)` | **partly** incidental (round-2 refinement): the claim is true (it is not a wall-touch proof), but it is the suite's only killer of "mkdir-before-guard" — not zero-power | `r1-pin-refusals.md` |
| P14 | `T:287-289` usage trio | three branches, one observable (`status === 64`); the `{"ok":false,"code":"USAGE"}` payload (`impl:86`) is unpinned | `usage-no-typed-payload` SURVIVES; round 2: sites are `287-289`, payload at `impl:86` |
| P15 | `T:170-173` `plan reads band live` | compares plan output to the same config copy the fixture read — a coincidence pin (§3.11-25) | round-2 hardcode mutant survives |
| P16 | `T:208` `readdirSafe(STATE_DIR).length === 0` (conjunct) | dead once `!existsSync` holds — zero detection power | round-2 re-derivation |
| P17 | `T:3` header claim "hermetic checks" | prose stronger than behaviour (external substrate dependency) | round 2: phrase is at `T:3` (round 1 cited `T:5-9`) |
| P18 | `T:184` id/axis presence via backticks | *judged not incidental*: the backticked id occurs only at the 3 substitution sites, so it does discriminate substitution | round-2 re-derivation |
| P19 | **[+]** `T:195` `ompArgv[model]===@${BAND.l1Alias}` | same self-referential blindness as P15: hardcoding `@m_strong` while deleting alias routing passes | round-2 mutant `mut-model` → `ALL CHECKS PASS` |

## 5. Dead / unreachable code — reported so it is not counted as "untested"

`INTERACTIVE_GUARD` arms (`impl:310-315`); the `argv[2] !== worktree` tautology (`impl:334`); `main()`'s
`default:` usageExit (`impl:728`); `loadSpec`'s "spec must be a JSON object" (`impl:188`, `main:718`
fires first); `loadSpec`'s duplicate **file** (`impl:184-187`) and **ufoRoot** (`impl:193`) guards,
shadowed by `main():713-716`/`718-720`; `maxTime.startsWith("-")` (`impl:253`); `scopeOverlaps`'s
second clause (`impl:169`); the `(typed(...), [])` non-array fallback (`impl:230-232`); `close`'s
`status: completed.status` (`impl:655`, always 0 because a nonzero throws at `:653`); and
`PANE_CEILING_EXCEEDED` **under the live 16/16 authority** (`impl:202-204`).

*Round-2 correction:* round 1 listed the **repo** guard among the shadowed duplicates — wrong.
`impl:192` is the sole live `repo` gate (probe with a spec lacking `repo` → exit 2
`fleet spec needs a repo path`). Also: all 10 dead claims above were re-derived, and the
`skills: "tower"` probe confirms the non-array fallback's `[]` arm can never be returned.

## 6. Adjudications, corrections, and process notes (judge log)

- **Round-1 cross-lane contradiction resolved.** `r1-spec-identity.md` first called the fleet-name pair
  "covered"; `r1-pin-refusals.md` showed `T:259` yields 0 unique kills. The peer re-ran the probes,
  agreed (`"tftest "` refused; a trim-adding and an unanchored-`$` mutant both survive) and amended its
  report. Accepted.
- **My briefs were wrong twice** (lanes corrected them): the suite *does* run the human plan renderer
  (`T:253` — smoke-executed, unasserted), and absolute scope *is* covered (`T:270-272`).
- **Round-2 contradicting receipts, all integrated above:** mutant tally (43/17/26, not 42/25/17);
  assertion census (30 standalone `check` + 9 `expectTyped`, ≈73 executed — not "33 + 10 = 63", which
  counted the helper's own three `check(` lines); L1-before-pane order *is* pinned as an equal-bounds
  coincidence; 5 (not 6) substituted values asserted, 11 (not 7) never asserted; the `repo` guard is
  live; `impl:548` → `impl:533` for the prompt write; §3.1 item 3 ranges (`impl:393-395`,
  `impl:432` + `impl:436-441`); §7 row 9's `quoteArg` clause is a **source** fix, split out below;
  `spec.json` line cites refreshed after that file was reordered; P4/P13 refined to *partly* incidental;
  P7/P8/P14/P17 sites corrected; `T:166` crash path is really `T:91`.
- **Lane-report citation drift** (reported by `R2LaneIntegrity`, not blocking): 9 lane reports carry
  off-by-a-few line cites (`r1-runtime-matrix.md:129` `test:88` → `test:85`; `r1-pin-prompt-text.md:30`
  `:87`/`:96-103` → `:84`/`:92-99`; `r1-launch-happy.md:3` "292 lines" → 294; `r1-exit-taxonomy.md`
  parseArgs sites; `r1-argv-guard.md:14/81` `:264` → `:253`; `r1-spec-identity.md:11/29` `150-151` →
  `145-148`; `r1-runtime-matrix.md:125` "close never invoked" → "invoked only as the no-`--apply`
  refusal"). All 22 reports carry a verdict line and an evidence section; all 22 verdicts are GAP.
- **Corpus stability:** `r1-pin-refusals.md` was rewritten mid-round by its lane; cross-references
  between reports must cite anchor text, not line numbers, and be snapshot by hash at merge.
- **Rejected moves:** none. No lane regressed an axis; no source was modified — this mission's scope is
  this report alone.

## 7. Cheapest tests that would close the largest gaps (ranked)

Round 2 executed every seam below in `/tmp` and confirmed 9 of 10 rows are **test-only** achievable.

1. **Exact-ceiling acceptance** — a 16-mission spec against the fixture config must exit 0. Kills the `>=` flip that would reject the live fleet. (Existing fixture; no new stub.)
2. **`PANE_CEILING_EXCEEDED` + order pin** — a second `ufoRoot` whose config sets `windowPaneCeiling 3 / maxConcurrentL1 16` with 4 missions (exit 2 + code), **and** a `pane 32 / L1 16` fixture with 33 missions to pin L1-first properly.
3. **`launch --apply` partial failure** — stub `<ufoRoot>/scripts/ufo-sighting` (fails mission 2) + PATH-shimmed `omp`; assert exit 2, `LAUNCH_PARTIAL`, `fleet.json` with `ok:false`, and the surviving pane. Requires `launcher()` to gain an `env` option.
4. **Replace the fixture config with an inline synthetic config** carrying sentinel band numbers, and pin `plan.missions.map(r => r.id)`. Kills the self-referential band and alias pins (P1/P2/P15/P19), the cross-wire blindness, the substrate GATE and the machine-specific path in one move (proved: pristine passes under both configs; a hardcoded launcher yields `FAILURES 8`).
5. **`status` against a stub wall** — canned `status --lite` with a foreign-fleet row, a missing fleet mission, a `runId != id` row, and rounds `r1/r2/r10`; assert filtering, the `not-on-wall` row, the phantom-row behaviour, and numeric ordering.
6. **`close --apply` against a logging stub wall** — assert the `complete` argv as single tokens, the manual per-path `git -C … worktree remove` line, `--mission ''` refusal, and the strongest receipt: **no `omp worktree clear/remove` appears in the recorded argv log**.
7. **`CONFIG_UNREADABLE` set** — four per-probe `ufoRoot`s: absent, invalid JSON, empty/unsafe `l1Alias`, `waveMin > waveMax`.
8. **Spec-refusal set** — `maxTime "-3h"` and `null`, `roundCeiling 0`, blank `title`/`goal`, `scope []`, `skills` non-array and unsafe name, scope `..`/`~`/`//`, `missions` absent; plus the acceptance-named bad-`maxTime` row.
9a. **Injection receipt (test-only)** — a `title` of `x; touch …` must arrive as one argv token with no side-effect; assert one token.
9b. **`quoteArg` on the printed removal line (`impl:664`) — a source change, split out of the test set.** A test can only pin today's unquoted string, i.e. codify the hazard.
10. **Harness hardening (test-file-only)** — give `launcher()` a timeout and `env`; drop the double spawn (`T:287`); hoist cleanup out of `finish()` into an exit/finally handler; wrap both `JSON.parse` sites (esp. `T:91`).

## 8. What this audit does not prove

- Nothing about the wall's own semantics (tmux pane teardown on `complete`, `status --lite` truthfulness) — no mutating wall verb was executed by any lane or by me; all wall interaction used `/tmp` stubs.
- Nothing about the band/wave-validator chain itself (tf-band / tf-wavetest axes; `test/run-wave-test.mjs` marked PASS(elsewhere)).
- No source change was made anywhere: this mission's scope is this report. Every recommended test is unapplied.
- `launch --apply` was never run against the real wall, so end-to-end production behaviour remains unverified — only its plan-time argv and its stub-wall behaviour were exercised.
- The sibling branch `tower/tower1/tf-tests` @ `24a47c5` reportedly implements many of §7's tests; I did not read or merge it beyond recording its existence — the recommendations below are not known to be un-implemented there.

## 9. Round-2 verification log

Axis set: `report-veracity` · `residual-surface` (round 1's inventory axes were saturated).
18 lanes, one batched dispatch, spec `/tmp/tf-audit-tests-r2.spec.json`, wave `tf-audit-tests-r2`,
validated live before dispatch. All read-only; all re-read the band authority and matched.

| lane | verdict | result |
|---|---|---|
| R2VerifyHeadline | FAIL | 6/7 headline numbers re-derived; mutant row corrected to 43/17/26; assertion census corrected |
| R2VerifyMatrix | FAIL | 12/12 verdict cells re-derived true; §2.1 `fleet.json` grep qualification; `impl:548`→`533`; spec.json cites refreshed; no additions |
| R2VerifyCliPlan | FAIL | all behaviours hold; §3.1 item 3 code ranges corrected; +2 additions (`title`, `ompArgv` echoes) |
| R2VerifyValidation | GAP | 45/45 sub-claims confirmed, 0 contradicted; +4 additions (`maxTime null`, padded mission id, `stateDir` default, `roundCeiling` default) |
| R2VerifyConfigCeilings | FAIL | CONFIG_UNREADABLE family, pane deadness, exact-ceiling all hold; the "order unpinned" claim corrected |
| R2VerifyPrompt | PASS | 7/7 confirmed; +2 additions (forgery is not goal-specific; `RENDER_UNRESOLVED` asserted zero times) |
| R2VerifyArgv | PASS | 11/11 confirmed; precision notes (EACCES laundering; exact `close` string) |
| R2VerifyLaunch | FAIL | 15/15 coverage claims hold; seams re-proved; `impl:548`→`533`; +3 additions |
| R2VerifyStatusClose | GAP | every §3.8/§3.9 claim re-derived true; +2 additions (runId phantom row; non-uniform `title`) |
| R2VerifySafetyHarness | PASS | all confirmed; mutant re-add reproduced; +2 additions (relative `..` vector; `T:166`→`T:91`) |
| R2VerifyPins | GAP | all 15 receipts re-run; 8 citation corrections; +2 additions (`T:195`; `T:168`/`T:174`) |
| R2VerifyDeadcode | FAIL | 10/11 dead claims confirmed by construction; `repo` guard corrected to live; +1 addition (wall-side `--title`) |
| R2VerifyRecommendations | FAIL | 9/10 rows executed as test-only seams; row 9 split; self-referential-config and id-pin fixes proved by mutation |
| R2LaneIntegrity | FAIL | 22/22 reports well-formed, all verdicts GAP; 9 lane-report citation drifts listed; corpus-stability warning |
| R2PromptTemplateSurface | FAIL | rendered-value claim corrected (5 asserted / 11 not); +7 template-prose additions |
| R2PlanEchoSurface | GAP | +4 additions (`ompArgv`, `title`, `emitJson` shape, JSON-vs-human consistency) |
| R2CrossSuite | GAP | "entire suite" claim confirmed by `git grep`; +4 additions (no run procedure; spec'd smoke coverage missing; sibling branch; real-wall bound is fleet-only) |
| R2ResidualHarvest | GAP | +10 additions (incl. the `stateDir` pseudo-FS hang, `--mission ''` fleet-wide close, flags-as-values, repeated flags, closed-stdout) |

**Saturation decision:** round 2 accepted 22 additions and 9 corrections, so the mission is not
saturated by "nothing accepted" — it stops at the **round ceiling (2)** with the deliverable updated
in place. A hypothetical round 3 would have to re-verify a now-corrected document against a lane
corpus that other missions are concurrently rewriting; the honest marginal value is low, and the
mission's budget is spent.