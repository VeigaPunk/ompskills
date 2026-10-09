# directive.md — authored posture source

**Asked:** the exact text, hash, and copy census of `ssot/godspeed-core/directive.md`.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/ssot/godspeed-core/directive.md`
(+ `find … | xargs sha256sum` over the substrate and `/home/vgpnk/.agents`).

## Observed

- 429 B, 8 lines, sha256 `db88963cbdf5a0db22b460b284bf6f1d1f4abac9eaadb28bdb5e9bffe27be3bb`,
  declared on line 1 of `ssot/godspeed-core/SHA256SUMS` (`sha256sum -c` → all OK).
- Whole file, verbatim: L1 `You are a Godspeed-enabled subagent.`; L2 blank; L3–L6 the four
  numbered rules (`Name the axes.` / `Iterate cheap, in parallel.` / `Keep moves that improve
  any axis and harm none.` / `Don't aim — let the frontier walk itself.`; L6 em dash = U+2014);
  L7 blank; L8 the `## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS…` paragraph. No frontmatter,
  title, or footer.
- 30 byte-identical copies total: 29 under the substrate (ssot, `godspeed-core/`,
  `skills/godspeed-core/`, `skills/godspeed/`, `skills/ufo/references/godspeed-core/`,
  `crates/ufo-core-runtime/bundled/godspeed-core/`, `.cursor`, `.omp`, 11 `packages/*`),
  plus `/home/vgpnk/.agents/skills/godspeed/directive.md`. All distinct inodes.
- 87 files carry the intro string; the other 57 are conformance fixtures/vectors, docs, and
  evidence blobs embedding it as a substring (e.g. `conformance/vectors/godspeed/inject.json:42`).

## Unknown

Exact `.cursor/skills/godspeed/SKILL.md` bytes (a different file, `GodspeedSkill` lane).