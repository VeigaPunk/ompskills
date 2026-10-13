# r2-drift-report-vs-source — report claims re-derived against the tip; what held, what went stale

Asked: re-derive `sighting/tower-fleet.mjs`'s write-safety invariants from the current source and check them
against `reports/tf-safety-r2.md` — flag any invariant the report claims that the source no longer enforces,
and any guard at tip the report does not mention. Cite lines.
Source: `sighting/tower-fleet.mjs` (1306 lines, clean tree, HEAD `2c868b1`; launcher tip for these paths is
`6206db3`); `reports/tf-safety-r2.md` (audited a 1241-line pre-fix revision, base `d3267d7`); fix commits
`99af0eb` (F1), `0bc1c79` (F2), `6206db3` (F3), report remediation text last updated by `6206db3`.
Lane: safety-warden card, no fleet spawn.

## Verdict

No enforced invariant from the report's HOLDS table was dropped at tip — every row re-derives from the
current source. The drift is the other way on the three findings: the report *body* describes violations the
tip no longer permits, and its own "Parent remediation" section records the closures. What actually went
stale is (a) the three F-bodies, (b) every line citation in the body (1241-line revision vs 1306-line tip,
roughly +60/+13/+2 shift), and (c) the report never enumerates several guard arms that exist at tip.

## Finding bodies that no longer reproduce at tip

| report claim (body) | tip source | status |
| --- | --- | --- |
| F1 "write-confinement **VIOLATED** — derived write paths are never realpath-checked" (`assertSafeWriteRoot` 234-249 at root sites 342-343 only; escapes at cpSync 637-639, sessions mkdir 772-773, prompt write 774-778, fleet.json 841-842, all exit 0 `ok:true`) | `assertSafeWriteTarget` :257-285 guards all five derived destinations: pre-flight `assertLaunchWriteTargets` :287-307 fired at :708 **before** the wall opens at :714, plus per-site rechecks at :697 (skill copy), :727 (stateDir), :797 (worktree slot), :835 (sessions), :837 (prompt), :906 (fleet.json) | closed; remediation section documents it; the four escape reproductions would now refuse `INVALID_SPEC` pre-open |
| F2 "`normalizeScopePath` (175-187) … `.` survives as a single segment", `plan` exit 0 | dot-segment arm :179-181 refuses `.` and any embedded `.` segment (`0bc1c79`); pins at `test/tower-fleet.test.mjs:613-616` | closed; remediation mentions it |
| F3 "`close --json` reports `phase:"working"` … via `wallRowPhase` (506-508)" | close results now carry `phase: wallRowDisposition(row)` at :1203/:1206 (`6206db3`); `wallRowPhase` (:565-567) survives only for live status rows at :1049 — its correct use | closed exactly as the report proposed |

## HOLDS-table invariants re-derived (all still enforced)

- Root denylist `assertSafeWriteRoot` :237-252: dangling :239-241; ufoRoot zone on **both** lexical and real
  faces, separator-exact equality-or-prefix via `inside()` :242-245; repo root **equality-only** :246-248;
  `.git` subdirs :249-251; fired at load :401-402.
- Scope gate: six-message taxonomy `normalizeScopePath` :175-189; container gate ("needs a non-empty scope
  array") :352-354; pairwise `SCOPE_OVERLAP` :376-382 (`scopeOverlaps` :192-200, component prefix).
- `realpathDeepest` :204-227: bare catches at :213 and :224-226 (ENOTDIR intermediate stays typed-safe).
- Exactly one `spawnSync` (:508, via `run()`); `wallCli` argv array :519-521; fs import set :71-81 has no
  `rm`/`unlink`/`rmdir`.
- Removal contract: header :22-24; close prints per-path `git -C <repo> worktree remove <path>` :1220-1223;
  `--json` declares `worktreeRemoval: "manual-only"` :1209.
- Close guards: `UNKNOWN_MISSION` :1162, `WALL_ABSENT` :1167, `PANE_LIVE` :1170, `MUTATION_REQUIRES_APPLY` :1267.
- Band read live :131-167 with zero `16|32|100` literals; fail-closed `CONFIG_UNREADABLE`.
- Honest-path write set is exactly: `mkdirSync` :698/:728/:836, `cpSync` :699, `writeFileSync` :842/:907 —
  all beneath the two root-gated dirs; the authority is read-only (`readFileSync` :136).

## Guards/mechanisms at tip the report does not mention

1. **lstat error arm** :274-279 — a leaf whose `lstatSync` fails for anything but ENOENT (EACCES,
   ENOTDIR-on-leaf) is a typed `INVALID_SPEC` "cannot be inspected safely", not a silent pass. The
   remediation lists only "dangling or symbolic-link leaves".
2. **Double zone re-application** — the target guard re-runs the full root denylist on the root (:264) and
   re-applies it to the resolved leaf (:284). The report's "rechecks … at each write site" covers timing,
   never this structure.
3. **Unconditional symlink-leaf refusal** :270-273 — refused even when the link resolves *inside* the root.
   Remediation's "Refuse symlink leaves outright" is consistent but never states the in-root case
   (mutation-tested in corpus `2026-10-09-r2-verify-target-arms`).
4. **Spec-controlled path-component patterns** — `FLEET_PATTERN` :88, `MISSION_ID_PATTERN` :89, and the
   skill-name pattern :363-365 keep `..` and `/` out of every derived `path.join`; the report never mentions
   them.
5. **`STATE_DIR_UNAVAILABLE` wrapper** :726-731 — the stateDir mkdir site converts any failure (including a
   post-open per-site refusal) into its own typed code; the report never names this type. Corollary the
   report does not scope: refusals at :727 (after wall `open` :714) and :906 (after panes launched) are
   typed but **not** zero-wall-side-effect; the remediation's "all refuse … before the wall stub is called"
   is true only of the pre-flight five (fixture probes at `test/tower-fleet.test.mjs:1631-1682` pin
   `INVALID_SPEC` + byte-identical fixture config; §37 itself does not assert the empty wall log — the
   pre-open ordering is from source :708 < :714).

## Residual limits the report understates

The report names only the swap race as residual ("a same-user process can race a symlink replacement").
At tip the leaf check is still `isSymbolicLink()`-only (:271) with no `nlink` arm and no mount awareness, so:
- **hardlink leaf** — escapes (observed, corpus `2026-10-09-r2-falsify-hardlink`); unmentioned in the report.
- **bind mount** — escapes (observed, corpus `2026-10-09-r2-gap-bind-mount`); the report's "Limits" says
  only "not exercised", never that the guards are defeated.
- **TOCTOU swap race** — named by the report; reproduced 3/3 in corpus `2026-10-09-r2-falsify-toctou`.

## Not carried by the source / not re-run

- The five §37 probes, the full suite, and the honest-path byte-identical run were **not re-run** here
  (verification is the main lane); the report's regression claims were checked against test source only.
- Wall-side semantics, spawn-argv shape, and liveness reconciliation are outside this card's write-safety
  question; their HOLDS rows were spot-checked structurally (single `spawnSync`, no delete import, no write
  in `verbStatus`) but not re-derived line by line.

## Unknowns

- Whether any HOLDS row *behaves* differently at tip than structurally derived (only a suite/wave re-run
  would show); none is contradicted by the source.
- Exact check count at HEAD `2c868b1` (card cites 967 at `87c351a`; `test:1684` still gates on
  `ALL CHECKS PASS`).
