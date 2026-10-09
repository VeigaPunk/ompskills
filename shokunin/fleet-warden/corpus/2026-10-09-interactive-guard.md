# interactive-guard — the omp-argv guard and its latent holes

Asked: the guard vocabulary, the `--cwd` assertion, and any unblocked flag forms.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `InteractiveGuard`.

- `interactiveGuard(tokens, missionId)` (:454-466) refuses, by exact equality, `-p` (:459) and
  `--print`; by equality `--mode` (:462); and by `startsWith("--mode=")` (:462) — the only prefix
  match. `--model` and `--print-thoughts` are safe (the launcher itself emits both, :475/:477),
  pinned by `test/tower-fleet.test.mjs:1486-1489`.
- `buildOmpArgv` calls it with `argv.slice(1)` (:482, excluding the literal `omp`) before returning
  (:484). It runs inside `buildPlan` (:601), which `verbLaunch` calls (:707) strictly before the
  first spawn (`wallCli "open"` :714, `omp worktree add` :805, pane launch :852) — so an
  `INTERACTIVE_GUARD` refusal means zero mutation and zero spawn.

Findings:
- **Tautological `--cwd` assertion (low).** :483 `if (argv[2] !== worktree)` compares the fresh
  literal slot against the same `worktree` binding used to initialize it (:469, :472); nothing
  mutates `argv` between (the guard reads a copy), so the condition is statically false. It never
  inspects `argv[1]`, so swapping the `--cwd` flag name would not fire it — a dead tripwire, not a
  real cwd-pair check. Remediation: drop it or compare `argv[1] === "--cwd" && argv[2] === worktree`.
- **Unblocked forms (defense-in-depth gap, not CLI-reachable).** `--print=<x>`, `-pm`, `-P`,
  `--PRINT`, `--printer`, `@-p` etc. reach the guard unblocked; but every injectable argv slot is
  gated strictly stronger upstream (maxTime :391, mission id :349, alias :161, paths absolute,
  title never enters the omp argv), so none is reachable through the CLI. Whether such a form
  de-interactivizes omp is UNKNOWN (omp's parser is out of the launcher source).

Evidence: lane `InteractiveGuard` (harness over a scratch copy).
