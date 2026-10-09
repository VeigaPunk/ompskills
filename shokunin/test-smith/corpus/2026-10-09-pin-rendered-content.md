# 2026-10-09 — pin rendered content, not template line numbers

**Asked.** What did commit `fec9765` change and why, what do the render-fidelity
sections assert now, and which substitutions remain unasserted? (Lane
`PinRenderedContent`, reviewer.)

**Observed.** Sources: `git show fec9765 --stat` and the commit's diff;
`test/tower-fleet.test.mjs` §24-26 (`:964-1030`) and §32 (`:1333-1371`);
`sighting/l1-prompt.md` at `cc0d61f`/`332760e`; `sighting/tower-fleet.mjs:419-450`.

- `fec9765` touched `test/tower-fleet.test.mjs` only (17 insertions / 17
  deletions). It replaced §26's line-indexed whole-line equality checks
  (`at(39) === …`, `at(94)`, justified by "Rendering substitutes in place, so
  prompt line N is template line N") with 12 substring content checks under the
  new comment (`:1012-1013`): "Content-based: the template's line layout is
  incidental, so assert the rendered values, never their line numbers." It also
  updated two stale scope-row literals (now `:568`/`:579`) from "— never edit
  outside it |" to the prefix "— the only repo paths you may edit;".
- Why: `tf-prompt` (`10bea64` + `332760e`, merged `a842b2f`) rewrote
  `sighting/l1-prompt.md` — the old check line numbers were byte-exact only for
  the pre-rewrite template at `cc0d61f`; the rewrite shifted the identity table
  to 39-51, added the `record` verb to the validator row, moved the recipe to
  94-97, and split `worktree-add` across lines 151-152 with a dash-form branch,
  so position pins broke on both geometry and content.
- Current assertions: §24 identity group (H1, intro prose, fleet/mission+title/
  axis/goal rows via `prompt.includes`); §25 the goal
  `ZQ |pipe| & <b>goal</b> \`tick\`` inserted byte-exact/unescaped; §26 plan-JSON
  field equalities (repo/stateDir/worktreeRoot/base) plus per-line substring
  pins for repo/worktree/base/validator(plan/run/record)/state-dir/lane-reports
  rows, the `UFO_PROJECT_ROOT` + `UFO_CONFIG_PATH` recipe env lines, the
  validator recipe command, `5. **Collect.**`, the integrate-prose worktree, and
  `omp worktree add -C <repo> -b`. §32 ledger: the exact 17-name placeholder
  list, `l1Alias` must NOT be a placeholder, per-mission
  `row.prompt === template×values` reconstruction with a first-differing-line
  diagnostic, and zero literal `{{` leaks. The implementation `renderPrompt`
  (`sighting/tower-fleet.mjs:419-450`) fails closed with `RENDER_UNRESOLVED` on
  unknown placeholders or residual braces.
- Assertion style: substring on rendered output —
  `check(label, row.prompt.includes(<literal built from fixture constants>), detail)`;
  the third `check()` argument (e.g. `l1-prompt.md:5`) is a failure breadcrumb,
  not an assertion. The sole whole-value pins are §32's `row.prompt ===`
  reconstruction and §26's plan-JSON `===` fields.
- Unasserted in §24-26: `scope`, `waveMin`, `waveMax`, `roundLaneCeiling`,
  `roundCeiling` have no substring pin there (covered elsewhere: §1 `:289-290`,
  §12 `:568`/`:579`, §19 `:805`/`:811`); `ufoRoot` is pinned only via derived
  config/validator paths, and its prose occurrences (template `:54`, `:158`)
  have no substring pin anywhere. Dropped by `fec9765` in favor of
  layout-independence, caught only by §32's equality: `reportDir` inside the
  Collect prose (the new check is the bare `5. **Collect.**`), the
  `tower/<fleet>/<id>-<lane>` branch pattern in the worktree-add prose (the
  check stops at `-b`), exact line geometry (indent/trailing ` |`), and the
  "Commit path-scoped" prose tail.

**Changed.** Nothing — read-only research.

**Unknown.** The lane did not execute the suite (not requested; no
`--live-wall` involved) and did not run it between `a842b2f` and `fec9765` to
observe the red state — the breakage is inferred from verified line/content
mismatches between the deleted check literals and
`git show cc0d61f/332760e:sighting/l1-prompt.md`.
