# safety-invariants — the six header invariants at b251c5a

Asked: for each header safety invariant, PASS/FAIL with the enforcing line; and which prior-audit
findings are closed/open.
Source: `sighting/tower-fleet.mjs` safety-contract block **:21-52** + the enforcing code @ b251c5a.
Lanes: `SafetyVerdicts`, `WriteConfinement`, `ArgvIntegrity`, `InteractiveGuard`, `WriteSites`,
plus an L1 probe.

| # | invariant (header line) | verdict | enforcing evidence |
| --- | --- | --- | --- |
| 1 | never `omp worktree clear`/repo-wide sweep (:22) | PASS | no delete/remove primitive among the fs imports (:71-80); `omp worktree clear` only in prose (:22) and a printed banner; the only worktree subcommand is `add` (:805-811) |
| 2 | per-path removal printed only, never automatic (:22-24) | PASS | `verbClose` writes the per-path `git -C <repo> worktree remove <path>` to stdout only (:1220-1224); `--json` `worktreeRemoval:"manual-only"` (:1209); reuse never deletes (:798-799). Residual L-2.1 open (:1223 unquoted) |
| 3 | every shell-out `spawnSync` argv array, no shell string (:29-30) | PASS | `run()` (:507-508) sole primitive; `shell` only in comments; no `execSync`/`exec(`; hostile title arrives as one inert argv token |
| 4 | interactive omp argv; `omp --cwd` equals mission cwd (:31-32) | PASS by construction / latent holes | fixed template (:468-485) + `interactiveGuard` (:454-466, called :482); M-4.1 `--print=` unblocked (latent, CLI-unreachable), L-4.2 `:483` tautology |
| 5 | writes only under stateDir/worktreeRoot/worktrees; roots refused into ufoRoot/.git/repo-root incl. symlinks (:25-28) | PASS with residuals | `assertSafeWriteRoot` (:237-252) at load (:401-402) + `assertSafeWriteTarget` (:257-285) at :708 and every write site. Containment is NEGATIVE (three zones only) and relative to the declared `ufoRoot`. Residuals: a symlinked `stateDir` is refused late (post-open, as `STATE_DIR_UNAVAILABLE`); a symlinked `worktreeRoot` is not leaf-guarded; TOCTOU is inherent |
| 6 | honest `--apply` gate; typed codes + exit codes 0/2/64 (:17-19, :33-35) | PASS with holes | `MUTATION_REQUIRES_APPLY` (:1266-1268, before the spec read); envelope (:1299-1305); holes: `close --mission ''` widens scope (M-6.1), and a missing prompt template is untyped `UNEXPECTED_ERROR` (:420); the fleet.json write (:907) is in no try, so an fs error there is also untyped (`launch-partial-policy`) |

Prior audit (`reports/tf-audit-launcher.md` — the report is 475 lines; it audited the launcher at
a 741-line revision, commit `3dee568`) re-checked at b251c5a:
- **H-5.1 root containment — CLOSED** (`assertSafeWriteRoot` :237-252 at :401-402; refusals :243-251).
- **H-5.2 symlink writes — CLOSED for the overwrite/escape class** (`assertSafeWriteTarget`
  :270-283, `realpathDeepest`; the `cpSync` site is now guarded). NB the audit's proposed
  realpath-under-**repo** containment was NOT implemented.
- **M-7.2 scope dot-segment bypass — CLOSED** (`normalizeScopePath` :179-188; `ScopeGate` finds no
  residual evasion).
- **H-3.1 `base` option injection — OPEN** (:387 trim-only, no dash guard; the `omp worktree add`
  argv has no `--` terminator; real `omp 18.8.6` reads a `-`-leading base as its own option).
- **M-6.1 `close --mission ''` — OPEN** (reproduced: exit 0, all missions completed; `--mission ' '`
  → `UNKNOWN_MISSION`).
- **M-7.1 `fleet` type coercion — OPEN** (L1-reproduced: `fleet: 1` accepted, `plan` echoes
  `"fleet": 1`, default roots `.tower/fleets/1`; `["ab"]`/`true` also pass).
- **M-4.1 `--print=`/`-p=` forms — OPEN (latent)** per `interactive-guard`.
- **L-2.1 printed removal command unquoted — OPEN**; **L-2.2 reuse keyed on `existsSync` only —
  OPEN**; **L-6.3 untyped missing prompt template — OPEN**.

Note: the safety block is :21-52, not :19-46 — the lower bound lands mid-sentence on the exit-code
claim, so a :19-46 range keeps the liveness bullet (:42-46) but drops the status (:47-48) and close
(:49-52) bullets.

Evidence: source lines above; lane reproductions; L1 probe for M-7.1.
