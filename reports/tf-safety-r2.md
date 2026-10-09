# tf-safety-r2 — write-safety audit of the final `sighting/tower-fleet.mjs`

**Mission** `tf-safety-r2` (fleet `tower1`, axis `substrate-confinement`). Advisory L1 audit of the
final integrated launcher after tower rounds 1-2. Read-only except this file.
**Target** `sighting/tower-fleet.mjs` (1241 lines) at worktree
`/home/vgpnk/Projects/ompskills/.tower/worktrees/tower1/tf-safety-r2`, branch `tower/tower1/tf-safety-r2`,
base `d3267d Merge branch 'feat/tower-fleet-r1' (tower fleet rounds 1-2)`.
**Tenet tested** the launcher's own contract (lines 22-52): writes land only under `<stateDir>`,
`<worktreeRoot>`, and the mission worktrees; both write roots are refused when their realpath lands inside
the substrate/repo/.git; every shell-out is `spawnSync` with an argv array; panes stay interactive;
relaunch/close are idempotent; liveness is the wall's live view.

## Verdict by axis

| axis | verdict | basis |
| ---- | ------- | ----- |
| write-confinement | **VIOLATED** (F1 HIGH), plus F2 LOW | derived write paths are never realpath-checked |
| launch-idempotency | HOLDS | 5/5 lanes (reuse tree, prompt bytes, live-row adopt, retired reserved, partial failure, double run) |
| close-idempotency | HOLDS, F3 cosmetic | 2/2 lanes |
| registry-reconciliation | HOLDS | 2/2 lanes |
| tty-preservation | HOLDS (E2E refusal leg INCONCLUSIVE by construction) | 1 lane |
| band-fidelity | HOLDS — live band stable at 16-32 / 100 | 2 lanes |

Evidence: one wave of **18 lanes**, 18/18 terminal outcomes (all `completed`; 0 failed, 0 timeouts).
Wave `tf-safety-r2-r1-w1`; lane reports in
`.tower/fleets/tower1-safety-r2/reports/tf-safety-r2/`; registry
`…/reports/tf-safety-r2/swarm-registry.json`.

Live authority (quoted, sha256 `0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3`,
`ufo-fsd-alpha/config/ufo.json`): `swarm.waveMinLanes 16 / waveMaxLanes 32 / maxLanes 100`,
`windowPaneCeiling 16`, `maxConcurrentL1 16`, `missionFormat.l1Alias m_strong`.

---

## F1 — HIGH · write-confinement: symlinked *derived* write paths escape to `<ufoRoot>`

`assertSafeWriteRoot` (234-249) is applied only to the two **roots** — `stateDir`, `worktreeRoot`
(call sites 342-343) — and each is resolved through `realpathDeepest` (201-226). Every later write is
`path.join(root, …)` and the fs call **follows symlinks**, so a symlink planted at a derived child
redirects the write. The tool reports `ok:true`, exit 0, with no refusal.

Four independent targets, all reproduced by me **and** independently by lane `ConfNestedTargets`
(report `ConfNestedTargets.md`):

| # | planted link | write site | observed |
| - | ------------ | ---------- | -------- |
| a | `<worktreeRoot>/<id>` → `<ufoRoot>/target` | `cpSync` skill copy (637-639) | created `<ufoRoot>/target/.omp/skills/probe/SKILL.md`, exit 0 |
| b | `<stateDir>/<id>.prompt.md` → `<ufoRoot>/config/ufo.json` | `writeFileSync` prompt (774-778) | **overwrote the substrate band authority** with the rendered prompt, exit 0 |
| c | `<stateDir>/sessions` → `<ufoRoot>/sub` | `mkdirSync(…,{recursive:true})` (772-773) | created `<ufoRoot>/sub/probe/`, exit 0 |
| d | `<stateDir>/fleet.json` → `<ufoRoot>/target/fleet.json` | `writeFileSync(fleetPath,…)` (841-842) | created/overwrote the target with the fleet state, exit 0 |

Reproduction (any single case; this is case (b), verified firsthand):

```bash
S=$(mktemp -d); mkdir -p $S/ufo/config $S/ufo/scripts $S/repo $S/state $S/wt/probe
cp /home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json $S/ufo/config/ufo.json   # real copy, never a symlink
cat > $S/ufo/scripts/ufo-sighting <<'W'
#!/usr/bin/env bash
case "${1:-}" in
  open) echo '{"ok":true}';;
  status) echo '{"status":"attached","missions":[],"completed":[],"stopped":[],"completedMissionCount":0,"stoppedMissionCount":0,"staleMissionCount":0}';;
  launch) echo '{"missions":[{"runId":"probe","paneId":"%77"}]}';;
  complete) echo '{"mission":"probe"}';;
esac
exit 0
W
chmod +x $S/ufo/scripts/ufo-sighting
ln -s $S/ufo/config/ufo.json $S/state/probe.prompt.md          # <-- the planted link
printf '%s\n' '{"fleet":"probe","repo":"'$S'/repo","ufoRoot":"'$S'/ufo","base":"main","stateDir":"'$S'/state","worktreeRoot":"'$S'/wt","missions":[{"id":"probe","title":"t","axis":"a","goal":"g","scope":["reports/x.md"]}]}' > $S/spec.json
node /home/vgpnk/Projects/ompskills/.tower/worktrees/tower1/tf-safety-r2/sighting/tower-fleet.mjs launch --spec $S/spec.json --apply --json
head -c 60 $S/ufo/config/ufo.json      # observed: '/skill:tower\n/skill:godspeed…' — the config is gone
```

Observed (firsthand): `exit 0`, `"ok": true`; `$S/ufo/config/ufo.json` no longer parses as JSON — it is the
rendered L1 prompt. Lane `ConfNestedTargets` reproduced all four with the substrate config hash unchanged
after cleanup (`0e416f0a…` before and after), so no live substrate was harmed by the audit itself.

**Root cause.** `realpathDeepest` guards the roots at load time; nothing re-resolves the actual write leaf.
The four child paths (`<worktreeRoot>/<id>`, `<stateDir>/sessions`, `<stateDir>/<id>.prompt.md`,
`<stateDir>/fleet.json`) are written without an `lstat`/realpath re-check, and the *reuse* branches make an
existing tree/link even easier to hit (`existsSync(row.worktree)` → "reusing it as-is", 735-737; the prompt
is read then rewritten, 774-778).

**Blast radius.** Case (b) is the worst: it clobbers `<ufoRoot>/config/ufo.json` — the live band authority
every fleet reads — while the tool reports success. Case (a)/(c)/(d) write files/dirs into the substrate.
Preconditions: a symlink at a path inside the fleet's own `stateDir`/`worktreeRoot`. Those dirs persist
across runs (`stateDir/sessions` is created on first launch; a worktree slot is reused by design), so a
leftover or moved/relinked state dir is the realistic vector, not only an adversary.

**Fix sketch (out of this mission's scope — it is read-only + report).** Before each derived write, run the
existing `realpathDeepest` on the target (and on its deepest existing parent) and refuse a `dangling` link or
a resolved path outside the validated root; or `lstatSync` the leaf and refuse `isSymbolicLink()`. The
primitive already exists — it is simply not applied below the roots.

## F2 — LOW · write-confinement: `scope: ["."]` is accepted and slips the one-writer gate

`normalizeScopePath` (175-187) refuses empty, absolute, `~`, `..`, and empty segments, but `.` survives as a
single segment. Verified firsthand:

```bash
# missions: {id:m1, scope:["."]}, {id:m2, scope:["reports/x.md"]}
node …/tower-fleet.mjs plan --spec spec2.json --json   # exit 0, m1 scope ["."]
```

`scopeOverlaps` (189-194) compares segments lexically, so `["."]` overlaps nothing — `SCOPE_OVERLAP` (321)
never fires, and a mission declares the **whole repo** alongside a sibling's subtree. Not an escape (the
fleet gate is a declaration, not the write confinement), so LOW; refused at the write paths would be the
belt-and-braces fix. Lane `ConfEnotdirAndScope`.

## F3 — LOW (cosmetic) · `close --json` mislabels a retired row's phase

`wallRowPhase` (506-508) reads `row.phase ?? (wallRowLive(row) ? "working" : "unknown")`, ignoring the
`disposition` the registry tagged. For a retired row with no `phase`, `wallRowLive` returns `true` (no
`levels`) → `"working"`. Verified firsthand with `completed:[{runId:"probe",paneId:"%42"}]` and no `phase`:

```json
{"id":"probe","status":0,"completed":true,"paneLive":false,"phase":"working"}
```

A completed mission is reported `phase:"working"` in `close --json` results. Cosmetic (the liveness field
`paneLive:false` is correct); fix by routing the report through `wallRowDisposition` (512-514). Lane
`CloseIdemAndAbsent` flagged the same on the synthetic shape.

---

## Confirmed HOLDS (evidence per check)

| check | lane | key observed evidence |
| ----- | ---- | --------------------- |
| roots refused inside ufoRoot / == repo / inside `.git`, direct **and** symlinked, dangling refused | ConfRoots | 17/17 hostile specs exit 2 `INVALID_SPEC` with reason-naming messages; safe control exit 0 |
| honest `launch --apply` writes nothing under `<ufoRoot>` | ConfUfoReadOnlyNormal | `find $S/ufo -type f -exec sha256sum {} +` byte-identical before/after two full launches (exit 0, ok:true) |
| ENOTDIR intermediate + scope normalization | ConfEnotdirAndScope | `realpathDeepest` on a file-intermediate → `plan` exit 0, not `UNEXPECTED_ERROR`; absolute/`~`/`..`/`//`/empty → `INVALID_SPEC`; nested scopes → `SCOPE_OVERLAP` |
| no shell string from spec content | ConfShellArgv | `grep` → 1 `spawnSync` (449); title `x; touch $S/PWNED` arrived as one argv element at the wall, no `PWNED*` file; hostile id/fleet → `INVALID_SPEC` |
| existing worktree not clobbered | IdemReuseTree | sentinel `KEEP.txt` sha unchanged, `worktreeReused:true`, `omp.log` has no `worktree add` |
| byte-identical prompt untouched | IdemPromptByte | run 2 same sha256 + mtime, `promptReused:true`; changed goal → new hash, `promptReused:false` |
| live wall row adopted, no relaunch | IdemLiveRowAdopt | wall log has 0 `launch` lines; `paneReused:true`, `launchResultFrom:"prior-state"` |
| retired row reserves the run id | IdemRetiredReserved | `RUN_ID_RESERVED`, 0 launch calls, exit 2; completed→`remove` remedy, suspended→`resume` remedy; truncated view → documented warning + fallback |
| partial failure never aborts the run | IdemPartialFailure | `fleet.json` written with both missions; sibling pane `%41` kept; exit 2 `LAUNCH_PARTIAL`; dual-cause → one `failure` + one `secondaryFailure` |
| two launches converge | IdemDoubleRun | run 2 wall log = `open`+`status --lite` only; record flips to adopted; prompt sha+mtime unchanged |
| close idempotent / absent skipped | CloseIdemAndAbsent | retired-by-id close exit 0 twice, byte-identical; unregistered mission → `status:"absent"`, exit 0 |
| close typed guards | CloseGuards | `PANE_LIVE` / `WALL_ABSENT` / `UNKNOWN_MISSION` / `MUTATION_REQUIRES_APPLY` exact, each with **zero** `complete` calls; `--force` exit 0 + warning + `forced:true` |
| status reconciles both directions | ReconBothWays | `onWallNotInState:["orphan"]`, `inStateNotOnWall:["missing"]`, human reconcile lines quoted |
| status read-only; retired = history | ReconReadOnlyAndRetired | state tree hashes byte-identical before/after; row `source:"wall-retired"`, `live:false`; truncation warning quoted |
| argv stays interactive | TtyArgvGuard | `ompArgv[0..2] = omp --cwd <worktree>`; no `-p`/`--print`/`--mode` token; `--print-thoughts` correctly not matched by the wall's `HEADLESS_MISSION_REJECTED` (`ufo-sighting-lib/argv.mjs:304-319`) |
| band read live, no literals | BandLiveAndLiterals | `plan --json` echoes live values; patched copy (4/8/12) echoes patched values; `grep -E '\b(16\|32\|100)\b'` → 0 hits |
| band/ceilings fail closed | BandRefusals | inverted band → `CONFIG_UNREADABLE`; missing key → `CONFIG_UNREADABLE`; `L1_CEILING_EXCEEDED`; `PANE_CEILING_EXCEEDED`; unsafe alias → `CONFIG_UNREADABLE`; zero mutation on refusal |

## Band stability (16-32 / 100)

Live `config/ufo.json` sha256 `0e416f0a…` reads `waveMinLanes 16, waveMaxLanes 32, maxLanes 100,
windowPaneCeiling 16, maxConcurrentL1 16, l1Alias m_strong` — identical to the launcher's snapshot in
`fleet.json` (`waveMin 16 … l1Alias m_strong`). The launcher consumes it live (no literal) and every lane's
scratch copy hashed equal. **Stable.** No lane observed a band drift.

## Harness telemetry (not a launcher defect)

The wave context's fake-wall snippet used `echo "${UFO_FAKE_STATUS:-{…json…}}"`. Bash closes a `{`-starting
parameter default at the first `}`, leaking a stray `}`; 8 lanes hit the resulting `WALL_OUTPUT`/exit 2
**before** their probe and corrected it scratch-side (`printf '%s\n' "${VAR:-$DEFAULT}"`). This itself
confirmed the launcher correctly refuses non-JSON wall output rather than acting on it. No lane result rests
on the broken form; `ConfNestedTargets` and my own four probes used a clean wall.

## Limits of this audit

- The wall, `omp worktree add`, and tmux were **stubbed** (scratch `ufoRoot` + fake `scripts/ufo-sighting`);
  no real wall/session was touched. Wall-side semantics were read from `ufo-sighting.mjs`/`argv.mjs` source.
- Every probe fed the launcher a **planted** symlink; the pre-existing-symlink vector is unquantified in the
  live repo (no such link was found in `stateDir`/`worktreeRoot` here).
- The TTY E2E *refusal* leg is unreachable: `buildOmpArgv` emits a fixed literal array, so no
  launcher-produced argv can trigger `HEADLESS_MISSION_REJECTED`; only the argv **shape** is proven.
- Bind mounts and TOCTOU between `realpathDeepest` and the later write were not exercised.

## Parent remediation (2026-10-09)

Finding F1 was reproduced against the launcher tip audited above. The integrated
launcher now applies `assertSafeWriteTarget` to every derived write destination:
the worktree slot, copied-skill destination, session directory, prompt file, and
`fleet.json`. It resolves each target through its deepest existing ancestor,
rejects dangling or symbolic-link leaves, requires the resolved target to remain
beneath the validated write root, and rechecks before wall open and at each
write site. This prevents the planted child-symlink escapes reproduced in F1.

Regression evidence: `test/tower-fleet.test.mjs` has five fixture-only symlink
probes (prompt, sessions parent, fleet state, worktree slot, and skill target
parent); all refuse as `INVALID_SPEC` before the wall stub is called, and the
fixture `config/ufo.json` remains byte-identical. The scope gate also rejects
`.` and embedded `.` segments, closing F2's repo-root-prefix bypass. The
launcher suite and live wave suite pass.

Residual limitation: a same-user process can race a symlink replacement between
the final path check and the filesystem operation; bind-mount and adversarial
TOCTOU resistance were not established by these checks. The launcher's safety
claim is therefore static symlink containment, not race-free capability
confinement.