# skills/godspeed/SKILL.md — the substrate skill shape

**Asked:** frontmatter, loaded set, and the envelope-marker rule of the repo godspeed skill.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/skills/godspeed/SKILL.md` (1242 B, 28 lines, sha256
`c0d2232a22a07be4fd36fbabc0ce3be77af604a761d5aa207332c9f9bfaf9bb3`); adjacent
`skills/godspeed/directive.md` = ssot `db88963c…`.

## Observed

- Frontmatter is exactly two keys (L1-8): `name: godspeed` and a folded block `description`
  ("Godspeed posture — load directive.md only. … Never load filter.md or velocity.md (judge-only).").
  Em dashes are U+2014; triggers are bare `godspeed` / `--with godspeed`, not the slash token.
- **Directive-only rule** (L10,12,14): "You follow **one file**: `directive.md` (in this skill
  directory)"; "Read `directive.md` before you act. It is the whole posture for this role."
- **Trilogy ban** (L18): "`filter.md` and `velocity.md` are **judge-only** (`ufo`/`ufo-fsd`). You never
  open them. You never inject them into a spawn. If you are not the judge, the directive is sufficient."
- **Envelope-marker section** (L22): a trailing `GODSPEED_MARKER` "is an envelope marker only — it loads
  nothing. The load mechanism is this skill's invocation (`GODSPEED_INVOCATION` as the leading line); a
  marker without the invocation runs godspeed-blind (run-logic §4.3)."
- Cites run-logic §4.3 (`/home/vgpnk/Projects/ufo-fsd-alpha/skills/ufo/references/run-logic.md:713`),
  corroborated at run-logic:727-735.
- Two known drifted copies: `.cursor/skills/godspeed/SKILL.md` (`c17af878…`; run-logic:2462-2466 flags
  it as unmanaged, pre-`## Envelope marker`) and the host install `1d616723…` — both **lack** the trilogy
  ban and the envelope section.

## Unknown

Exact `.cursor` copy bytes; whether any sync step regenerates the host/`.cursor` copies.