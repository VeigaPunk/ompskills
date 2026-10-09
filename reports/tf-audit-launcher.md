# Audit — `sighting/tower-fleet.mjs` safety invariants

- **Axis:** `audit-launcher` · mission `tf-audit-launcher` · fleet `tower1`
- **Audited revision:** `/home/vgpnk/Projects/ompskills/sighting/tower-fleet.mjs`, 741 lines
  - sha256 `d8d5b6ae26cbfba3faf5d3c130c6e16ceb13b3982060c600e25836a1f33f72d4`
  - md5 `d365090b3df0db67beb4d25da31b8c70` (worktree copy byte-identical)
- **Method:** 32-lane swarm wave (`tf-audit-launcher-r1`, band 16–32, validated by
  `scripts/ufo-swarm-wave.mjs plan`), plus an independent L1 probe. Lanes were
  read-only on the real repo/substrate and probed a `mktemp -d` sandbox with a
  fake `ufoRoot`; each lane's scoped report is under
  `.tower/fleets/tower1/reports/tf-audit-launcher/`.
- **Note on line numbers:** the file was edited during the audit (launcher
  robustness work landed in a sibling mission). All line citations below are
  from the audited revision above; a few lanes also cite the canonical copy,
  which matched byte-for-byte at probe time.

## Verdict summary

| # | Invariant | Verdict | Worst severity |
|---|-----------|---------|----------------|
| 1 | `sweep-safety` — no repo-wide worktree sweep | **HOLDS** | — |
| 2 | `removal-discipline` — per-path removal only, never automatic | **HOLDS** | low (guidance) |
| 3 | `argv-integrity` — argv-array shell-outs, no spec-built shell string | **HOLDS for shell** / **VIOLATED for option-flag injection** | high |
| 4 | `interactivity` — interactive omp argv, `--cwd` == mission cwd | **HOLDS at runtime** / latent guard holes | medium (latent) |
| 5 | `write-confinement` — writes only under stateDir/worktreeRoot/worktrees | **VIOLATED** (spec-trust dependent; follows symlinks) | high |
| 6 | `gate-honesty` — `--apply` gate, truthful typed errors/exit codes | **HOLDS** | medium |

Adversarial confirmation:
- Mutation test M1 — injecting `run(["omp","worktree","clear"])` into `verbStatus`
  was **killed** by the argv-log detector (baseline clean, mutant caught, bytes
  restored to `d8d5b6ae…`) — `SwarmMutationTester03`.
- Mutation test M2 — neutralizing `MAXTIME_PATTERN` leaves the guard
  load-bearing: deleting the `interactiveGuard` call lets `--print` reach the omp
  argv (`SwarmMutationTester20`).

---

## 1. `sweep-safety` — HOLDS

No code path reaches a repo-wide sweep or bulk deletion.

- Single spawn primitive: `spawnSync(argv[0], argv.slice(1), …)` at **:359**;
  `shell` is never set by any caller (`Sp2`, `S13`, `R02`, `S16`).
- Only worktree subcommand ever executed: `omp worktree add -C <repo> -b <branch>
  <worktree> <base>` at **:511–517** (`add` only).
- `node:fs` imports (`:49–56`) are `cpSync / existsSync / mkdirSync / readFileSync /
  readdirSync / writeFileSync` — **no delete/remove primitive is imported at all**,
  so in-process removal is structurally impossible.
- `omp worktree clear` appears only as prohibition prose (`:22`) and a printed
  banner (`:662`); `git … worktree remove` only inside a printed string (`:664`).
- Runtime: `plan`/`status`/gated and un-gated `launch`/`close` in a PATH-shimmed
  sandbox logged only `omp worktree add`, `ufo-sighting open|launch|complete`.
- Cross-repo map (`Connector04`): the only automatic worktree remover in either
  repo is `ufo-fsd-alpha/scripts/nc5-origin-sync.sh` (`rm -rf`/`git worktree
  remove --force` against a hardcoded `/tmp/nc5-sync-wt`), disjoint from fleet
  trees and not scheduled/running. Nothing in `ufo-sighting` removes worktrees.

## 2. `removal-discipline` — HOLDS

- `verbClose` (`:642–668`) completes wall missions and **prints**, never runs, a
  per-path command; `--json` emits `worktreeRemoval: "manual-only"` (`:658`).
- Reuse branch (`:507`): an existing worktree is reused with a warning, never
  reset/removed — proven by re-running `launch --apply` over a dirty/advanced
  worktree (branch tip, reflog, HEAD, modified/untracked all unchanged; zero
  extra `omp` spawns) — `Critic14`.
- Real `omp worktree add -b` refuses an existing branch without moving its tip.

**Findings (low):**
- **L-2.1 Printed cleanup command is unquoted** (`:664` interpolates `spec.repo`
  and `row.worktree` raw). A repo/worktree path containing a space or `$(…)`
  makes the pasted line split and, if pasted into a shell, execute command
  substitution from spec content. The launcher itself never executes it
  (argv-integrity unaffected). Fix: reuse `quoteArg` (`:406`), already used for
  plan's display at `:421`. (`SwarmReviewer12` F2, `SwarmReviewer18`, `SwarmReviewer02`)
- **L-2.2 Reuse keyed on `existsSync` only** (`:507`) — a pre-existing directory
  at `<worktreeRoot>/<id>` that is *not* a worktree on `row.branch` is silently
  reused; the mission then runs on the wrong branch (or a non-git directory,
  cfg. 5.3). Fix: verify `git -C <wt> rev-parse --abbrev-ref HEAD == row.branch`,
  else typed refuse. (`SwarmCritic14` F2)

## 3. `argv-integrity` — shell holds, option-flag injection VIOLATED

**Shell-string integrity HOLDS.** One `spawnSync` site (`:359`), argv arrays
everywhere, no `shell: true` / `exec*` / backtick command strings. A hostile
`title` (`drop $(touch PWNED) \`id\``) arrived as **one inert argv element** in
the wall argv; no artifact created (`SwarmScout16`, `SwarmReviewer18`,
`SwarmReviewer02`, `SwarmSentinel08`). `bash` is `bash <script> <args>` with an
explicit script path, never `-c`.

**VIOLATION — unvalidated `base` reaches an option position.**

- `base` (`:249`) is only `String(raw.base).trim()` — no type check, no pattern,
  no leading-dash check (contrast `maxTime` at `:253`).
- It is passed as the **final positional** of `omp worktree add` (`:512–517`)
  with no `--` terminator.
- Observed against a **real** `omp` in a sandbox (`SwarmCritic10` C2):
  `base: "--cwd=<otherrepo>"` → the launcher reports `ok:true` and
  `worktree=<repo>/.tower/worktrees/tower1/tf-x`, while the worktree and branch
  are actually registered **in `<otherrepo>`** (`otherrepo/.git/worktrees/tf-x/*`,
  branch `tower/tower1/tf-x`); `git -C <repo> worktree list` does not see it.
  `SwarmSentinel15` independently observed `--force`, `--`, `-b` reaching the
  `omp` argv (the `-b` case via `base: ["-b"]` → `String()` coercion).
  Adding `--` before the positional makes `omp` fail closed with zero writes.
- Shell execution is **not** possible here (`$()` stays inert); the impact is
  flag/semantics injection and misreported success.

Fix: require `typeof base === "string"` and a conservative ref pattern
(e.g. `^[A-Za-z0-9][A-Za-z0-9._/@:-]{0,255}$`), and pass `--` before positionals.

**Finding (low) — `title` `--` boundary.** `title` (`:214–217`) is trim-only and
passed as `--title <title>` (`:346`); the wall splits on the first literal `--`,
so a title of exactly `--` shifts the boundary. The real wall fails closed (no
pane), but the launcher has already created the worktree/prompt for that mission.
Fix: refuse `title === "--"` and control characters. (`SwarmSentinel15` F2)

**Finding (info) — `run()` spreads caller options** (`:359`): a future caller
passing `shell:true` would break the invariant; unreachable today. (`Sp2`,`R02`)

## 4. `interactivity` — HOLDS at runtime, latent guard holes

- `buildOmpArgv` (`:319–336`) is the sole omp-argv constructor; `interactiveGuard`
  (`:305–317`) runs before the wall (`:333` → before `wallCli` at `:483/:536`),
  proven both directions with a wall-reaching fake. The real argv passes the
  guard (`--print-thoughts` matches by **equality**, not prefix — `:310/:328`).
- Guard fires on `-p`, `--print`, `--mode`, `--mode=rpc`, `--mode=rpc` via `=`.
  Deleting the guard call lets `--print` through → guard is load-bearing
  (`SwarmMutationTester20`, `SwarmScout22`, `SwarmReviewer19`).
- `argv.slice(1)` correctly excludes `argv[0]`.

**Findings:**
- **M-4.1 `--print=`/`-p=` forms are not blocked** (`:310` matches exact tokens),
  asymmetric with the deliberate `--mode=` handling at `:313`. Latent today:
  no spec field can inject a dash-leading token (`maxTime` is pattern-gated;
  paths are `path.resolve`d and lead with `/`), and the wall's own preflight
  rejects headless argv on `launch`. `plan` never reaches the wall, so a naive
  future edit is the exposure. Fix: also match `token.startsWith("--print=")` /
  `token.startsWith("-p=")`. (`SwarmReviewer19` F1)
- **L-4.2 `--cwd` assertion is a tautology** (`:334` compares `argv[2]` — the same
  `worktree` binding stored at `:323`); it never checks `argv[1] === "--cwd"`, so a
  layout edit that silently drops `--cwd` is not caught. Informational; the
  invariant holds by construction today. Fix: check the pair by token.
  (`SwarmCritic21`, `SwarmReviewer19` F3)
- **L-4.3** exit-immediately omp flags (`--export=`, `--alias=`, `--from-claude`)
  are in neither guard's vocabulary; literal-edit-only vector. (`SwarmReviewer19` F2)

## 5. `write-confinement` — VIOLATED

Converged across 8 independent lanes (`Scout05`, `Sentinel06`, `Sentinel08`,
`Sentinel11`, `Critic10`, `Scribe32`, `Revenger09`, `Critic14`) plus the L1 probe.

**H-5.1 No containment check on `stateDir` / `worktreeRoot`** — `resolveRepoPath`
(`:145–148`) is `path.isAbsolute(value) ? path.normalize(value) : path.resolve(repo, value)`
with **no** boundary test; `loadSpec` passes the result through (`:262–263`).
Observed (sandbox, `launch --apply` unless noted):

| spec `stateDir` / `worktreeRoot` | result |
|---|---|
| `/tmp/outside` / absolute | accepted, exit 0; prompts + `fleet.json` written there |
| `../../escape` / relative | accepted; resolves outside the repo (`/tmp/escape/state`) |
| `<ufoRoot>/config`, `<ufoRoot>/wt` | **accepted**; `fleet.json`, `*.prompt.md`, `sessions/`, and a full worktree checkout written **under the declared ufoRoot** |
| `<repo>/.git` | accepted; writes into the git dir |
| `sighting` (tool's own source dir) | accepted; drops `fleet.json`/prompt/sessions inside `sighting/` |

Impact: the header contract "never edit anything under `<ufoRoot>`" (`:25–26`) is
*spec-trust dependent*, not enforced. The launcher only guarantees writes land
under whatever the spec declares — and a spec can declare the substrate.
Fix: in `loadSpec` (`:262–263`) reject roots that escape the repo or are equal
to / nested in `ufoRoot` (or `repo/.git`), with a typed `INVALID_SPEC`.

**H-5.2 Writes follow symlinks; leaf symlinks are an arbitrary-file-overwrite
primitive** (`Sentinel11`, 5 of 6 planted-symlink probes wrote outside the
sandbox; `Critic14` E5). `resolveRepoPath` is lexical (`path.resolve` only); no
`realpath`/`lstat`/`O_NOFOLLOW` anywhere in the file. Concretely:
- `stateDir` / `worktreeRoot` symlinked out → checkout + skills + `fleet.json`
  land at the link target while `git worktree list` records the resolved path and
  the launcher reports the lexical one (misleading provenance).
- Pre-planted symlinked leaves (`<id>.prompt.md`, `fleet.json`) are truncated and
  overwritten with launcher content (exit 0).
- `cpSync` (`:472`) and `mkdirSync`/`writeFileSync` (`:487,:531–533,:561`) all
  follow links. `existsSync` reuse (`:507`) follows links, so a symlinked
  `<worktreeRoot>/<id>` is "reused" and the pane launches with `--cwd` at an
  external, non-git directory.
- One planted intermediate symlink redirected **both** roots of a launch at once.

This is the same mechanism class as the substrate-config clobber observed during
this mission. Fix: `realpathSync` the nearest existing ancestor of each root and
require it under `realpathSync(repo)`; `lstat`/`O_NOFOLLOW` before the write
sites; make the reuse gate lstat-based.

**M-5.3 `base` injection re-registers worktrees elsewhere** — see §3 (`Critic10` C2);
also a confinement bypass (worktree + branch land in an arbitrary repo while
`ok:true`).

**Context — delegated writes.** `omp worktree add` itself writes under
`<repo>/.git/worktrees/<id>/` (outside the three named roots), and the wall
(`ufo-sighting open|launch|complete`, `status --lite`) writes under
`<ufoRoot>/.ufo/**` — including a status-advisory cache even for
`status --lite` (`Critic23` C1, `Critic24` B). The blanket "no substrate writes"
claim must be read as *no launcher-initiated write into `<ufoRoot>`*, which H-5.1
shows is not enforced.

## 6. `gate-honesty` — HOLDS

- `launch`/`close` without `--apply` refuse with exit 2
  `MUTATION_REQUIRES_APPLY`, **zero** filesystem writes and **zero** wall calls;
  the refusal precedes spec/config I/O (`Critic23`, `Critic24`, `Executor07`,
  `MutationTester03`).
- `plan` (`--json`) emits `writes:false` and performs **no** write under
  instrumented block mode; `status` makes exactly one read-only wall call
  (`status --lite`). `plan` does spawn `git rev-parse` when `base` is absent
  (informational; no write).
- Exit codes truthful in every probe: 0 ok / 2 typed / 64 usage.
  Positive control: `--apply` is the discriminator (`Critic23` F6).
- No parsing bypass reaches the mutating path (9 attack forms rejected).

**Findings:**
- **M-6.1 `close --mission '' --apply` completes ALL missions** — `parseArgs`
  (`:690`) accepts an empty value (non-null), and `verbClose` (`:644`) tests
  truthiness, so the `UNKNOWN_MISSION` guard is skipped and every fleet mission
  is completed (reproduced: exit 0, two `complete` calls). Fix: reject empty at
  the usage layer (64) or compare `!== null`. (`SwarmReviewer25` F1)
- **M-6.2 Partial-failure gaps.** When a mission's wall launch fails, the code
  records `failure`, keeps earlier panes, writes `fleet.json` with `ok:false`,
  then throws `LAUNCH_PARTIAL` (exit 2) — verified good. But a mid-loop **typed
  abort** (`WORKTREE_ADD_FAILED`, `WALL_OUTPUT`) exits *before* `fleet.json` is
  written while earlier panes stay live — contradicting the inline comment
  "written either way" (`:543–545`); human mode prints `launched <id> · pane ?`
  for a **failed** mission; and `close` has no partial policy, so a never-launched
  mission aborts the close loop (`COMPLETE_FAILED`) leaving mixed state
  (`SwarmReviewer27` F1/F2/F3).
- **L-6.3 Untyped surface.** A missing `sighting/l1-prompt.md` (unguarded
  `readFileSync` at `:271`) exits 2 with code `UNEXPECTED_ERROR`, not a typed
  code; the header advertises "2 typed error". (`SwarmScribe26` F2/F3,
  `SwarmReviewer31` F6)

## 7. Spec validation surface (supporting findings)

- **M-7.1 `FLEET_PATTERN` type coercion** (`:189`): `fleet` of `1`, `true`, or
  `["ab"]` is string-coerced past `FLEET_PATTERN.test(raw.fleet ?? "")` and kept
  as the non-string (`:256`); `status` then shows the mission as `not-on-wall`.
  Fix: `typeof fleet === "string"` gate. (`SwarmScout28`)
- **M-7.2 Scope dot-segment overlap bypass** (`:150–163`): `normalizeScopePath`
  strips only one leading `./` and admits `.` parts, so `././a` vs `a`,
  `a/./b` vs `a/b`, and `.` vs `src` evade the one-writer-per-path `SCOPE_OVERLAP`
  gate (all exit 0). `scopeOverlaps` (`:165–170`) itself is correct (verified
  truth table). Fix: filter `.` parts and carry component arrays through the gate.
  (`SwarmScout28`, `SwarmConnector30` — counterfactual fix flips exactly the 3
  bad rows, 0 regressions over 21 probes)
- **L-7.3 Placeholder resolution** (`renderPrompt`, `:288–300`): the `key in values`
  test (`:294`) admits prototype-chain names, so `{{constructor}}`/`{{toString}}`
  render `[native code]` instead of refusing; and the `[A-Za-z]+` regex misses
  digit/underscore placeholders (`{{x1}}`), so the residual check does not catch
  them. Fix: `Object.hasOwn(values, key)`. (`SwarmReviewer31` F1/F2)
- **L-7.4 `l1Alias` String coercion** (`:132`): booleans/numbers coerce
  (`true` → `--model @true`, exit 0); harmless in-file due to the `@` prefix +
  charset regex. Fix: `typeof` check. (`SwarmReviewer29`)
- **Info-7.5 Dead clause** `|| maxTime.startsWith("-")` (`:253`) is unreachable —
  `MAXTIME_PATTERN` already forbids a leading dash. (`SwarmScout28`)
- **Info-7.6** `MISSION_ID_PATTERN` and the skill-name pattern hold (reject
  traversal/space/leading-dash); ceiling gates (`L1_CEILING_EXCEEDED`,
  `PANE_CEILING_EXCEEDED`) and every enumerated `CONFIG_UNREADABLE` arm fire
  truthfully (`SwarmScout28`, `SwarmReviewer29`, `SwarmSentinel06`).

---

## What changed vs. the stated contract

| Contract claim (header `:19–31`) | Reality |
|---|---|
| "never `omp worktree clear`" | **holds** — no sweep reachable |
| "never edit anything under `<ufoRoot>`" | **not enforced** — spec-declared roots may point into or under `ufoRoot`; writes follow symlinks (H-5.1/H-5.2) |
| "writes land only under `<stateDir>`, `<worktreeRoot>`, mission worktrees" | **holds literally**, but those roots are unvalidated spec input |
| "every shell-out is `spawnSync` with an explicit argv array — no shell strings" | **holds**; option-flag injection via unvalidated `base` is a separate gap |
| "omp argv stays interactive; `omp --cwd` equals the mission cwd" | **holds**; guard has latent `--print=` hole and a tautological `--cwd` check |
| "launch/close refuse without `--apply`; 0/2/64" | **holds**; `close --mission ''` and untyped `ENOENT` are the exceptions |

## Recommended remediation order (advisory; not applied)

1. H-5.1/H-5.2 — root containment (`realpath` of nearest existing ancestor under
   `realpathSync(repo)`; reject `ufoRoot`/`repo/.git` nesting) + `lstat`/`O_NOFOLLOW`
   on the write sites; lstat-based reuse gate. *Highest impact; closes the
   substrate-write class.*
2. H-3.1 — validate `base` (type + ref pattern) and add `--` before `omp worktree
   add` positionals.
3. M-6.1 — reject empty `--mission` value; M-7.1/M-7.2 — `typeof fleet` gate and
   dot-segment canonicalization.
4. M-4.1/L-4.2 — guard `--print=`/`-p=` forms; assert `--cwd` by token.
5. M-6.2/L-6.3 — write `fleet.json` on mid-loop aborts, honest human-mode failure
   line, type the prompt-template `ENOENT`.

## Provenance

Accepted evidence comes from the 32 lane reports in
`.tower/fleets/tower1/reports/tf-audit-launcher/`, the independent L1 probe
(`plan --json` on the real fleet spec; a sandbox `stateDir` confinement probe),
and mutation tests M1/M2. Every lane verified the canonical launcher sha256 and
reported zero writes to the real repo or substrate except its own report file.
No check in this report is claimed unrun; unresolved residuals are marked as
`[INFERENCE]` in the individual lane reports.