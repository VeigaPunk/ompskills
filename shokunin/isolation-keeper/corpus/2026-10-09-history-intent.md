# history-intent — the commit timeline and the comment→hunk map

Asked: reconstruct why the isolation contract has its present shape. Source:
`git -C /home/vgpnk/Projects/ufo-fsd-alpha log --full-history -S… -- <paths>` +
`git show`. Lane `HistoryIntent` (revenger).

**Governing constraint:** the substrate is a **shallow clone** —
`git rev-list --count HEAD` = 2 (`5ace2559 → 72ab84a8`), `.git/shallow` exists.
So `git log -- <path>` on HEAD's chain returns one row. Deeper history is
recoverable from other refs (3201 commits via `--all`; oldest `f43c757c`
2026-08-25 "Initialize project"), but two traps make naive attribution wrong and
were demonstrated empirically:

- graft boundaries make the whole file count as an add, so `git log -S` /
  `--diff-filter=A` yields 12 **false** introductions whose set is 1:1 the
  `.git/shallow` entries;
- default `git log --all -- <path>` hides merge-side commits — 24 rows vs 48
  with `--full-history`.

All findings used `--full-history` plus a parent-blob-vs-blob test with boundary
exclusion.

Timeline (reachable evidence):

| hash | date | capability | kind |
| --- | --- | --- | --- |
| `4f10fbff` | 2026-09-20 | earliest reachable blob; **already** has resolver-snapshot validation, exact-key policy schema, `environmentSchema`, `sandbox.executable`, the full bwrap argv + `SANDBOX_UNAVAILABLE` in ufo-sighting, `"executable":"bwrap"`. Lacks `DANGEROUS_SOURCE_GIT_CONFIG`, worktreeconfig, pathVariables length clause, chmodSweep, force arm | BOUNDARY-OCCLUDED graft root |
| `0522e67a` | 2026-09-20 | source-git-config sentinel introduced (+ `(r01 EphemeralSafetySentinel D1)` comment); regex then had **no** `extensions.worktreeconfig` | REAL-ADD (parent 3b406e9a lacks the needle) |
| `fb943139`/`ab6dccbd` | 2026-09-21 | last reachable blobs **without** length clause / worktreeconfig / chmodSweep / force arm | upper bound of the absence window |
| `829018d2` | 2026-09-24 | `destroy --parent-root` passthrough + `(r09 probe: …)` comment + the tests:1279 cross-file citation | REAL-ADD |
| `8f018e0e` | 2026-09-24 | earliest carrier of the remaining safety cluster: pathVariables LENGTH clause (+ r13 EphemeralContract D1), `extensions.worktreeconfig` escalation, chmodSweep (+ r01 SwarmReviewer33 F1), F2 fd-bound comment (r16 EphemeralSeams), force-recovery arm + mission-structure gate | BOUNDARY-OCCLUDED (empty parents) |
| `2fb584cb` | 2026-09-25 | first reachable blob with 2 test pins exercising `destroy force:true` (test lines 1763/1775) — **non-HEAD lineage** | reachable side lineage |
| `72ab84a8` | 2026-09-25 | the only commit on HEAD's chain touching the isolation paths; carries the complete present-day contract | BOUNDARY-OCCLUDED — must **not** be described as the commit that added anything |
| `d464c7d3` | 2026-09-27 | fail-open envelope audit; file grows to 1437 lines, adds **no** isolation needle | reachable, non-additive |
| `5ace2559` | 2026-10-08 | HEAD — touches only `config/ufo.json`, zero isolation change | reachable |

Answers: the source-git-config sentinel is attributable to `0522e67a`
(2026-09-20). The duplicate-pathVariables length clause has an **UNKNOWN**
introducing commit (occluded): absent 09-21, first observable `8f018e0e` 09-24,
window 2026-09-21..24. The exact-key environment schema **predates reachable
history** (present at `4f10fbff`).

Consequence for the card: the current `tests/prepare-ephemeral-l1.test.js` has no
force test, but deeper history **did** pin force on a side lineage — so a claim of
"never tested" would be wrong; scope it to "at this checkout".

## Unknowns

- The true introducers of the boundary-occluded capabilities (graft roots have no
  reachable parents).