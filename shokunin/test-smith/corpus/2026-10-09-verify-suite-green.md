# 2026-10-09 — verify tower-fleet suite green (re-run of the anatomy claim)

**Asked.** Verify one claim from `2026-10-09-tower-fleet-test-anatomy.md`
against the current source: run `node test/tower-fleet.test.mjs` from the
worktree and record the observed exit code, the count of `  ok ` lines, and the
final line. (Lane `CardVerify`, card-verification task.)

**Observed.** Command, run from the worktree root
`/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin/test-smith`:

```
node test/tower-fleet.test.mjs
```

Result (stdout captured to a shell variable; `rc` is the node exit status):

- exit code `0`
- `  ok ` lines: `967` (counted with `grep -c '^  ok '`)
- stdout lines: `1013`
- `FAIL` lines: `0`; `GATE` lines: `0`
- final line: `ALL CHECKS PASS`
- wall time: `3.50 seconds`
- stderr: no bytes observed on the shell's stderr stream (not byte-counted in
  this run — see Unknown)

Every number matches the anatomy entry exactly (exit 0, 967 ok, 1013 stdout
lines, 0 FAIL, 0 GATE, final `ALL CHECKS PASS`, ~3.5s). The claim is confirmed
against the current source, not merely re-quoted.

Corroborating shape checks on `test/tower-fleet.test.mjs` (same worktree):

- `wc -l` → `1685` lines — matches the entry's "1685 lines".
- `grep -c '^// ── '` → `41` markers; of these, `37` are numbered section
  headers (`// ── N.`) and `4` are unnumbered plumbing markers at `:73`
  (console/result plumbing), `:105` (fixture root), `:185` (fixture helpers),
  `:1683` (finish). So the entry's "37 numbered sections" is consistent — the
  raw marker count is 41, not a contradiction.
- `grep -c 'spawnSync(process.execPath'` → `1` (the single `launcher()` call
  site); `grep -c '^import '` → `5` (five builtin imports, no framework).

Repo state: HEAD `b251c5a`; `git status --porcelain` shows
`?? shokunin/test-smith/corpus/` (the corpus directory is untracked in this
worktree) and no modification to `test/tower-fleet.test.mjs`.

**Changed.** Added this entry and its index row. No suite, source, or other file
was modified; the run is read-only with respect to the repo (the suite uses its
own temp fixture root).

**Unknown.** stderr was not byte-counted in this run (it was left to flow to the
shell's stderr and nothing appeared), so "stderr 0 bytes" is observed-empty but
not measured. The run was not repeated, so per-run variance (e.g. wall time) is
not characterized. The suite's behavioral quality was not judged (out of lane
scope). The corpus directory being untracked means these entries are not yet
committed anywhere.
