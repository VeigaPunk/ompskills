# overlay-history — how `mission-nightcall.yml` got its current bytes

Lane `NightcallHeaderHistory` (revenger). Read-only git over the substrate.

- On `main`, the file enters only at grafted root `72ab84a8` (blob `ba5bb2fa`);
  `.git/shallow` hides the rest, so `git log --follow` from HEAD returns one commit.
- Full lineage on other refs:
  - `4f10fbff` (2026-09-20): new file with project route pins,
    `advisor.enabled: false`, and `maxConcurrency: 32`.
  - `61ad599b` (2026-09-21, "global-alias routing cutover"): drops the pins,
    turns the advisor on, and adds the "16-32 lane waves" header. This is
    today's content.
  - `a23b93c5` (2026-09-24, nc7, not on `main`): drops the advisor block and
    changes the header to 16-100.
- Header L1-5: "operator directive 2026-09-20 … sequential 16-32 lane waves …
  carries no project route pins". That "16-32" matches today's live band, by
  accident of the 2026-10-09 working-tree edit to `config/ufo.json`.
- **Advisor divergence**: `run-logic.md:1055-1056` says the advisor stays
  DISABLED and absent. The overlay on `main` still has `advisor.enabled: true`.
  The removal (`a23b93c5`) never reached `main`.

## Unknowns
- Operator intent for the advisor on fleet L1 panes (rule vs bytes disagree).
