# godspeed skill: frontmatter, directive, SHA256SUMS

**Asked:** frontmatter + loaded set of the godspeed skill and its `directive.md` dependency.
**Sources:** `/home/vgpnk/Projects/ufo-fsd-alpha/skills/godspeed/SKILL.md` (28 lines),
`skills/godspeed-core/*`, `skills/SHA256SUMS`.

## Observed

- `skills/godspeed/SKILL.md` frontmatter is exactly two fields: `name: godspeed` and a folded
  `description` carrying the trigger contract ("godspeed", "--with godspeed", godspeed-marked
  framing) plus "Never load filter.md or velocity.md (judge-only)". No other keys.
- The skill loads exactly one file, `directive.md` (in its skill directory); `filter.md` and
  `velocity.md` are judge-only. A trailing `| godspeed` is an envelope marker that loads
  nothing — the load mechanism is the leading `/skill:godspeed` invocation.
- `skills/godspeed-core/directive.md` is 429 B, sha256 `db88963cbdf5a0db22b460b284bf6f1d1f4abac9eaadb28bdb5e9bffe27be3bb`,
  byte-identical across every observed copy (30 under the substrate, including
  `ssot/godspeed-core/directive.md` — the authored source).
- Runtime load order (`crates/ufo-core-runtime/src/godspeed.rs:64-70`): ssot first, then
  `skills/ufo/references/godspeed-core/directive.md`, then `godspeed-core/directive.md`.
  `scripts/sync-ufo-contracts.mjs:76` authors from `ssot/godspeed-core/directive.md` and
  mirrors to 6 hardcoded dests + 13 `skillTargets`.
- `skills/SHA256SUMS` is a 15-entry flat manifest over `skills/**`; `sha256sum -c` -> 15 OK,
  exit 0. `ssot/godspeed-core/SHA256SUMS` (3 entries) also verifies OK.
- `filter.md` / `velocity.md` diverge between `skills/godspeed-core/` (`09957d08…`/`349243f6…`)
  and `ssot/godspeed-core/` (`ddfabdcb…`/`dbd37a12…`); the directive does not.

## Remaining unknown

`.cursor` mirror body diff; the host install `~/.agents/godspeed-core/directive.md` (outside
the substrate).
