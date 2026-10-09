# L1 pane invocation — where the Godspeed bytes enter an L1

**Asked:** where the invocation enters an L1 pane, and whether the tower-fleet renderer does it.
**Source:** `sighting/l1-prompt.md`, `sighting/tower-fleet.mjs`.

## Observed

- **Load-order marker line** `l1-prompt.md:2` — the template's line 2 carries the Godspeed invocation
  between `/skill:tower` (L1) and `/skill:swarm` (L3). The template **authors** the bytes.
- **Fallback description** (l1-prompt.md:15-18,20-21): "The `/skill:` lines above are invocation markers.
  If they did not inject the skill bodies into this session …, read them explicitly, in this order:"
  → `skill://tower`, `skill://godspeed`, `skill://swarm`, `skill://wwkd`. A missing URI is never a gate.
- **Prohibition rule** (l1-prompt.md:88-91, verbatim): "Never hand-write `/skill:godspeed` into the spec
  context or a lane prompt — the renderer leads every spawn lane with it, and a resume message must not
  carry it."
- **`tower-fleet.mjs` carries NO godspeed logic:** `grep -n -i godspeed` → no matches (exit 1).
  `renderPrompt()` (:419-449) is pure `{{placeholder}}` substitution (:442); the values map (:422-441)
  includes `validator=/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (:439) and no godspeed
  value; no `/skill:` or `skill://` literal anywhere in the file.
- **Misattribution:** the Godspeed bytes live in the template (`l1-prompt.md:2`, :89-91); the injector that
  leads every spawn lane is the L2 renderer `ufo-swarm-wave.mjs`, **not** `tower-fleet.mjs`.
  `tower-fleet.mjs` is a carrier (substitutes tokens, writes the rendered prompt). The repo-tracked `tower`
  skill's "the fleet renderer prepends it" is therefore unanchored (see the paraphrase entry).

## Unknown

The exact byte values of `GODSPEED_INVOCATION`/`GODSPEED_MARKER` (other lanes); the renderer's prepend code
path (covered by the composition entry).