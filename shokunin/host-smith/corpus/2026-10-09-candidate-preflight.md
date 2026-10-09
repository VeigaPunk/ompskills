# Gate 1 — candidate preflight

**Asked.** Every file-level rule `preflightCandidate` enforces before parsing,
its exact failure string, and which of them the substrate resolver also
enforces.

**Observed.** `host/apply.mjs:185-223` (called L967). Every refusal goes through
`fail()` (L101–104): `error: <msg>` on stderr, exit 1; messages interpolate only
path/byte-count/header-count/line-numbers, never candidate content.

| rule | line | failure |
| ---- | ---- | ------- |
| missing candidate | 187–188 | `candidate not found: <path>` |
| symlink | 189–191 | `candidate is a symlink, which the resolver refuses outright` |
| non-regular file | 192 | `candidate is not a regular file` |
| 1 MiB bound | 193–194 | `exceeds the resolver's 1 MiB bound` (strict `>`; exactly 1048576 passes) |
| UTF-8 BOM | 196–197 | `candidate carries a UTF-8 BOM` |
| tab anywhere | 198 | `contains a tab; the resolver fails closed on tab indentation` |
| column-0 unique sections | 200–211 | `declares no top-level <s>: section` / `declares the top-level <s>: section N times (ambiguous)` |
| credential shape per line | 214–220 | `carries a credential shape on N line(s): <numbers>` |

The section scan uses `^(?:<s>|"<s>"|'<s>')\s*:\s*$` (gm) over **raw** bytes —
a column-0 header inside a comment block counts; no comment stripping.

**Resolver independence** (`scripts/omp-global-config.mjs`):

- **Also enforced:** missing (ENOENT→`missing`, L79–86), symlink (O_NOFOLLOW
  L78, ELOOP→`malformed` L83–86; `globalOmpConfigPath` lstat live-or-dangling
  L322–326), non-regular (fstat→`malformed` L89–90), 1 MiB (L25/L91–93),
  duplicate/missing section (identical anchored regex `yamlBlock` L122–131).
- **Partially:** tab — the resolver rejects only indentation tabs inside parsed
  blocks (L145/L175/L229/L387); preflight's whole-file `/\t/` is broader.
- **Not a refusal:** BOM — the resolver *strips* it (L106–108) so a BOM'd config
  parses; credential shape — the resolver only *redacts its own echoes*
  (`safeLine`/`safeKey`), a credential-bearing line parses clean.
- **Resolver-only:** post-read double-fstat TOCTOU (L94–103), and the
  `task.agentModelOverrides` / `retry.fallbackChains` sub-block requirements
  (L355–356/L371–372), covered by gate 2's real resolver call.

**Added.** 2026-10-09 · lane `CandidatePreflight` (reviewer)