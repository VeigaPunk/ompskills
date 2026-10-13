# 2026-10-09 — tower-fleet.test section→behavior map, and the launcher behaviors with no test

**Asked.** Map every `say(...)` section of `test/tower-fleet.test.mjs` to the
`sighting/tower-fleet.mjs` behavior it pins; then name launcher behaviors
(from the source) that no test exercises. Both cited. (Lane `GrowTestSmith`.)

**Observed.** Sources read whole: `test/tower-fleet.test.mjs` (1685 lines,
37 sections, 36 of which spawn the launcher — §2 calls none, per the r2
errata); `sighting/tower-fleet.mjs` (1306 lines). Corpus cross-checks:
`2026-10-09-tower-fleet-contract.md` (superseded in part by its errata),
`2026-10-09-tft-refusal-coverage.md`, `2026-10-09-r2-verification-errata.md`.

## Part 1 — section → pinned behavior (37 sections)

| § | say() name (test line) | Launcher behavior pinned (source line) |
| --- | --- | --- |
| 1 | plan — valid 2-mission fleet spec (:269) | `verbPlan` JSON envelope `verb/fleet/writes:false`, live `band` block (:654-681); `buildPlan` row derivation worktree/branch `tower/<fleet>/<id>`/promptPath (:597-617); `renderPrompt` band + identity lines (:419-450); `buildLaunchArgv`+`buildOmpArgv` wall+omp argv with `--fleet/--cwd/--model @<l1Alias>` (:487-504, :468-485) |
| 2 | plan — writes nothing (:314) | `verbPlan` creates no stateDir/worktreeRoot (no fs writes in :654-681) — checked by absence after §1 |
| 3 | default verb — plan (:324) | `parseArgs` default `verb = "plan"` when argv[0] starts with `-` (:1234-1240) |
| 4 | L1 ceiling (:332) | `loadSpec` gate `>` not `>=` → `L1_CEILING_EXCEEDED`, exact message tracks live config, refusal writes nothing (:337-339) |
| 5 | refusal — scope overlap (:371) | `scopeOverlaps` prefix compare + pairwise cross-mission loop → `SCOPE_OVERLAP` (:192-197, :373-384); component-adjacent accepted |
| 6 | nested overlap, both orders (:390) | `scopeOverlaps` symmetry; message names spec-order id pair and leading path (:380); intra-mission parent+child accepted (loop is cross-mission only :374) |
| 7 | bad fleet name and duplicate ids (:428) | `FLEET_PATTERN` (:92, :327-329), `MISSION_ID_PATTERN` (:93, :348-350), duplicate gate (:350), absolute scope → `INVALID_SPEC` (:182-184) |
| 8 | mutation without --apply (:447) | `parseArgs` `MUTATION_REQUIRES_APPLY` for launch/close (:1266-1268); refusal precedes state-dir creation |
| 9 | usage errors — exit 64 (:456) | `usageExit` exit 64 paths: missing `--spec`, unknown verb, unknown flag (:109-115, :1237-1238, :1269) |
| 10 | omp argv shape and derivation (:464) | `buildOmpArgv` exact 12-token list, `--cwd`-equality with wall argv, omp tail = launchArgv after `--` (:468-485); `--config` token need not exist at plan time |
| 11 | identical refused, component-disjoint accepted (:508) | `scopeOverlaps` identical → `SCOPE_OVERLAP` exact message (:380); string-prefix-vs-component-prefix (src/a vs src/ab), dash-suffix (src/a/b vs src/a-b), multi-entry cross-product, later-entry overlap control |
| 12 | accepted spellings normalize (:559) | `normalizeScopePath` trim/strip `./`/strip trailing slashes, verbatim no-dedup echo (:175-190); normalization precedes the overlap gate; interior `//` refused (:186-188) |
| 13 | per-entry refusal taxonomy (:595) | `normalizeScopePath` message per arm (:176-188); container gate "needs a non-empty scope array" (:357-359); refusals write nothing |
| 14 | fleet name pattern (:636) | `FLEET_PATTERN` boundary: 6 refused + 3 accepted + missing key, exact messages (:327-329) |
| 15 | mission id pattern and duplicate gate (:661) | `MISSION_ID_PATTERN` 64/65 boundary (:348-349), trim-identity echo, duplicate gate precedence over field/scope refusals (:350) |
| 16 | mission shape and required fields (:705) | `loadSpec` missions container gate (:336), element-object gate (:347), title/axis/goal messages (:352-356) |
| 17 | skills field validation (:734) | skills absent/null → `[]`, name pattern, verbatim echo, non-array refusal (:361-370) |
| 18 | maxTime (:774) | default `"3h"`, `MAXTIME_PATTERN` acceptance/coercion/trim (:94, :390-391), refusal set with raw-value messages, flows to `--max-time` |
| 19 | roundCeiling (:797) | default 1, positive-integer gate with exact messages (:388-389), prompt-line echo |
| 20 | spec shape and unreadable spec files (:822) | `main` raw read + ufoRoot pre-gate (:1276-1285) precedes `loadSpec`; ENOENT/EISDIR/malformed messages (:323-324); repo required (:330); authority-before-spec precedence (:1286); "must be a JSON object" (:326) pinned as never-firing |
| 21 | windowPaneCeiling live + gate order (:887) | `PANE_CEILING_EXCEEDED` (:340-342), `>` boundary, L1-before-pane order when both trip (:337-342) |
| 22 | help (:924) | `parseArgs` `--help`/`-h` → exit 0, usage on stdout, silent stderr, positional before unknown token (:1257-1260) |
| 23 | usage — typed JSON + plain line (:943) | `usageExit` contract: exit 64, empty stdout, line 1 typed `USAGE`, line 2 usage text, exactly two lines (:109-115); all message forms; duplicate `--spec` last-wins |
| 24 | identity group binds (:965) | `renderPrompt` identity placeholders missionId/axis/fleet/title/goal on their template lines (:422-441) |
| 25 | goal unescaped (:983) | `renderPrompt` raw replace, no escaping (:442-445) |
| 26 | path placeholders (:996) | `renderPrompt` repo/worktree/base/validator/stateDir/reportDir + prose binds (:422-441) |
| 27 | launch argv wall half (:1031) | `buildLaunchArgv` token-by-token, one token per value, single `--`, omp-tail equality; title-is-`--` boundary (two separators; lastIndexOf reading) (:487-504) |
| 28 | mutation-guard ordering (:1100) | `parseArgs` guard position: after usage verdicts, before raw spec read and any wall call (:1234-1270 + `main` :1272-1287); with `--apply`, spec validation refuses (`INVALID_SPEC`, `UNKNOWN_MISSION` :1155) with zero wall spawns |
| 29 | config band integrity (:1172) | `loadBandAuthority` `need()`/`intOf()`/inverted-band arms, exact messages, fail-closed before spec validation (:135-163) |
| 30 | band numbers live (:1261) | all six authority fields mirrored through plan JSON + prompt lines + `--model @<alias>`; mutation-proof vs a hardcoded band (:149-157, :664-681) |
| 31 | band authority unreadable (:1296) | `loadBandAuthority` catch → `CONFIG_UNREADABLE`, no silent fallback, cites config path, gates everything (:133-137) |
| 32 | template placeholder ledger (:1334) | `renderPrompt` values map = 17 distinct template placeholders, `l1Alias` excluded; whole-render equality vs template×values (:419-450) |
| 33 | recursive no-write snapshot (:1372) | plan (json/human/bare/refused) never spawns the wall; `verbStatus` shells `status --lite` exactly once and writes nothing (:654-681, :536-542, :1006-1148 has no fs writes) |
| 34 | l1Alias + windowPaneCeiling parse gates (:1411) | alias token regex + `String(need())` coercion finding recorded-not-pinned (:161-163); strict intOf contrast for the pane ceiling (:145-147); precedence chain parseArgs → raw read → authority → loadSpec; unparseable spec masks broken authority |
| 35 | interactive guard (:1480) | `interactiveGuard` exact-token/-prefix match, `--model`/`--print-thoughts` survive (:454-466); hostile title reaches only the wall argv; alias `@`-prefix neutralization; upstream refusal of smuggled `--max-time` |
| 36 | wall isolation (:1560) | `wallCli` spawns only `bash <spec.ufoRoot>/scripts/ufo-sighting` (:519-521); status argv `[status --lite]` (:537); close argv `[complete --mission <id> --note ...]` (:1214 area); retired-row disposition from the `completed[]` array (:966-984); real CLI/tmux never spawned; status/close write nothing |
| 37 | derived write targets vs symlinks (:1632) | `assertLaunchWriteTargets`/`assertSafeWriteTarget` refuse symlinked prompt leaf, sessions parent, fleet.json leaf, worktree slot, skill parent — all `INVALID_SPEC` before wall open (:287-307, :257-285; arms per r2 errata: 3× :272, 2× :268-272) |

Coverage verdict: the suite is a plan-side suite. All 37 sections pin
plan/gate/argv/render/authority behavior; `launch` is exercised only up to its
refusal points (§8, §28, §37); `status`/`close` run against stubs (§28, §33,
§36) but only their spawn argv and (for close §36) the retired-row happy path
are asserted.

## Part 2 — launcher behaviors with no test (source-cited)

The suite's only `launch` invocations are test:450 (no `--apply` → refused at
:1266-1268), test:1164-1165 (`--apply` with missing/duplicate spec → refused
in `loadSpec`), and test:1676 (five `--apply` runs → refused at
`assertLaunchWriteTargets` :708). No launch ever reaches wall open (:714).
The only `close` invocations are test:451, test:1166, and test:1607
(`--apply --force --json` against a stub holding one `completed[]` row).
`status` runs (test:1119, 1392, 1469-refused, 1598) but its JSON is never
parsed. From the source, the untested behaviors:

**verbLaunch body (:706-949) — every step after the write-target guard:**
1. `wall open` and `WALL_OPEN_FAILED` (:714-717).
2. Whole-registry adoption: `registryById` over retired+active with live rows
   last (:720-727, :966-1004); prior `launchResult` retention
   (`launchResultFrom: "prior-state"`, :772-774).
3. Live-row reuse: `paneReused`, reuse/foreign-fleet warnings (:775-781).
4. Retired-row `RUN_ID_RESERVED` and its suspended-vs-other remedy text
   (:782-791).
5. stateDir `mkdirSync` and `STATE_DIR_UNAVAILABLE` (:727-731).
6. Worktree branch: `worktreeReused` (:798-799), the
   `omp worktree add -C <repo> -b <branch> <wt> <base>` spawn (:804-810),
   `WORKTREE_ADD_FAILED` (:815), `worktreeRecreated`/`worktreeMissing`
   (:800-819).
7. Skills: `skillSourceDirs` search order repo→ufoRoot→`~/.agents/skills`
   (:684-689), `cpSync` into the worktree (:692-703), missing-skill warning
   (:826-828). (Suite-side skill *validation* is pinned in §17; the copy is not.)
8. Prompt write: sessions-dir mkdir, byte-identity `promptReused` vs
   `writeFileSync` rewrite (:834-843).
9. Wall launch itself: spawn of `launchArgv.slice(2)` (:845), `LAUNCH_FAILED`
   with the wall's parsed code and the stale-count hint on `RUN_ID_CONFLICT`
   (:853-868), `WALL_OUTPUT` on a zero-exit non-JSON body (:869-875), paneId
   extraction and the missing-paneId warning (:876-880).
10. Per-mission catch → `MISSION_FAILED`/typed code (:894-900);
    `recordMissionFailure` first-wins + `secondaryFailure` (:627-634, printed
    :936-937).
11. `fleet.json` written either way: `ok` flag, `launchedAt`, `warnings`
    array, per-mission records (:905-925).
12. Launch output shapes: JSON `launchResultRecorded` Boolean, human
    per-mission lines (:927-941); `LAUNCH_PARTIAL` exit 2 (:945-947).

**verbStatus reconciliation (:1006-1148) — spawn pinned, output unpinned:**
13. Both-direction reconciliation sets `onWallNotInState`/`inStateNotOnWall`
    (:1073-1076).
14. Retired merge: `wall-retired` rows with `retiredAt` and disposition
    (:1078-1086).
15. `not-on-wall` rows sourced from fleet state (carrying `failure` codes)
    and from the spec (:1088-1101).
16. `roundReceipts` — the `rounds/` directory listing (:951-958, consumed at
    :1056/:1084/:1099).
17. Human reconcile lines and JSON block: foreign-fleet rows, `staleMissionCount`,
    `wallStatus === "absent"` (:1131-1146, :1112-1120).

**verbClose guards and failure paths (:1151-1230):**
18. `PANE_LIVE` refusal without `--force` (:1169-1171) and the `--force` live
    warning (:1172-1174) — §36 passes `--force` but its stub has no live row.
19. `WALL_ABSENT` (:1164-1168).
20. Absent-mission skip with the stale-count hint (:1182-1188) — §36 exercises
    the skip behaviorally (exactly one `complete` spawn for a two-mission
    spec, test:1610-1614) but the emitted `status:"absent"` row is not
    asserted.
21. Foreign-fleet warning on complete (:1224-1225).
22. `COMPLETE_FAILED` per-mission + exit 2 (:1226-1228); the human output's
    "Worktrees are NEVER removed automatically" banner and per-mission
    `git -C <repo> worktree remove <wt>` lines (:1220-1225); JSON `forced`
    and `worktreeRemoval: "manual-only"` (:1209).

**Shared wall plumbing:**
23. `readWall` `WALL_STATUS_FAILED` (:536-542) — stubs always exit 0.
24. `parseJsonOutput` `WALL_OUTPUT` (:523-529) — same.
25. `run()` `COMMAND_MISSING` on ENOENT (:507-514).
26. `wallRegistry` truncation warning for shortened `completed[]`/`stopped[]`
    (:978-984) and the `staleCount` surfacing (:992-993).
27. `wallRowLive` liveness semantics — `levels.l1 > 0`, and a live-view row
    with no level reads live (:558-563). Never exercised with a live row.

**Spec/defaults and top level:**
28. `gitHeadBranch` — the `base` default from repo HEAD, and its
    detached-HEAD refusal (:310-317). The suite always sets `base`
    explicitly (`baseSpec` test:97-98) and its temp repo is not a git
    checkout.
29. `stateDir`/`worktreeRoot` default derivation `.tower/fleets/<fleet>` /
    `.tower/worktrees/<fleet>` (:393-394) — the suite always sets both.
30. Top-level catch `UNEXPECTED_ERROR` for non-TypedError throws
    (:1297-1306) — statically reachable, never fired (per the r2 errata).

**Human output formats:**
31. `printPlanHuman` plan text and `quoteArg` shell-quoting of hostile tokens
    (:636-651, :619-621) — run for exit 0/snapshot only (test:1387); format
    unpinned, consistent with the incidental-format doctrine.

Codes already recorded as unasserted in `tft-refusal-coverage` (16 of 24
module codes, errata-corrected: + `WORKTREE_ADD_FAILED`, `MISSION_FAILED`,
`UNEXPECTED_ERROR`) map onto items 1-30 above; the two `RENDER_UNRESOLVED`
arms (:443/:447) remain ledger-guarded-by-§32 rather than test-targets. This
entry adds the behavior-level mechanics and line cites the code-level list
lacks.

**Changed.** This entry; one index row appended. Nothing else — read-only
research; the suites and launcher were not modified or executed.

**Unknown.** Line numbers are this revision's (launcher 1306 / suite 1685
lines, matching `verify-suite-green` and the errata); static mapping only —
the suite was not run for this entry, so "untested" means "no section asserts
it", not "observed to fail". Whether §36's absent-row skip would surface in
close JSON under a stricter assertion is [INFERENCE] from the check labels.
