# 2026-10-09 — post-amendment verification of two errata claims

**Asked.** Post-amendment verification of the `test-smith` card (worktree
`/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin/test-smith`). Read
`shokunin/test-smith/corpus/index.md` first, then
`2026-10-09-r2-verification-errata.md`, and verify two corrected claims against
the current source:

1. `test/tower-fleet.test.mjs` is **1685 lines** (`wc -l`).
2. Its section 2 (`:313-321`) calls **no launcher** (grep that range for
   `launcher(`).

Write only inside `shokunin/test-smith/corpus/`; do not modify the suites or any
other file.

**Observed.** Both claims hold against the current worktree source.

Claim 1 — line count:

- `wc -l test/tower-fleet.test.mjs` → `1685 test/tower-fleet.test.mjs`.
- Cross-check `awk 'END{print NR}' test/tower-fleet.test.mjs` → `1685`.
- The file ends with a newline (`tail -c 40 … | od -c` shows the final byte
  `\n` after `finish(failures === 0 ? 0 : 1);`), so `wc -l` counts every line.
- Note: the `read` tool's footer reported "of 1686" for this file, one more than
  `wc -l`/`awk NR`; the reader appears to count a phantom trailing line. The
  authoritative count is **1685**. The reader's line *numbers* also drifted by
  one in one range render (`:322-328:raw` displayed the content of 323-328);
  the `grep` tool's line numbers agreed with `wc -l`/`awk NR` throughout.

Claim 2 — section 2 calls no launcher:

- `grep 'launcher\(' test/tower-fleet.test.mjs:313-321` → **No matches found**.
- Section 2 spans exactly `:313-321`: `:313` the header comment
  `// ── 2. plan writes nothing ──`, `:314` `say("plan — writes nothing")`,
  `:315` `{`, `:316-317` the two `check(...)` assertions (`stateDir stays
  absent`, `worktreeRoot stays absent`), `:318` `}`, `:319-321` the
  `function readdirSafe(dir)` helper. No `launcher(` token appears anywhere in
  the range.
- The nearest `launcher(` call is in section 3 at `:326`
  (`const result = launcher(["--spec", writeSpec(baseSpec()), "--json"]);`),
  after the section-3 header at `:323`. So section 2 is the one section of the
  suite that asserts on fixture state without spawning the launcher — matching
  the errata's "36 of 37 sections spawn the launcher".

**Changed.** Nothing outside the corpus. Added this entry and appended its row
to `shokunin/test-smith/corpus/index.md`. The suites and all other files were
read-only.

**Unknown.** The `read` tool's off-by-one line count (1686 vs 1685) and its
one-line range drift were observed here but not diagnosed; they are harness
behavior, not suite behavior. Whether the errata's other corrections still hold
was out of scope — only the two named claims were re-verified.
