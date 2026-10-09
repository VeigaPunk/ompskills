# swarm validator environment contract

**Asked:** the exact env/path/arg contract of `ufo-swarm-wave.mjs`.
**Sources:** `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` ("wave"),
`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-mission-result.mjs` ("hub").

## Observed

- `UFO_PROJECT_ROOT` (wave L122-124): default when unset is the parent of the script's
  `scripts/` dir; `||` treats empty as unset; read per consumer (the hub never reads it).
- `UFO_CONFIG_PATH` (wave L135-137 -> hub `gatedConfigPath` L2143-2159): default
  `<ROOT>/config/ufo.json`; the gate fires only when an override IS set, `ALLOW_EXTERNAL_TOOLS`
  is false, and `beneath` says outside/throws. Refusal `EXEC_PATH_OUTSIDE_ROOT` (message names
  the var, not the path); `resolve(envValue || fallback)` is CWD-anchored for relative overrides.
- `UFO_FLEET_ALLOW_EXTERNAL_TOOLS` (hub L2126): `=== "1"` strict, bound once at module load;
  default-deny. Fixture scratch roots set it to 1.
- `beneath(root, candidate)` (hub L1114-1139): realpath root anchor, `rel===""` inside,
  rejects `..`/root escape, per-component `lstat` rejects any symlink, ENOENT components
  continue (not-yet-existing write targets pass), other faults rethrow -> callers fail closed.
- Relative-path rule for `reportDir` / `priorRegistry` / `--registry` (wave L397-410):
  no leading `/` or drive letter, no backslashes, no empty/`.`/`..` segments, 512-byte cap.
  Codes `invalid_report_dir` (L413) and `invalid_registry_path` (L462, L1649); length/emptiness
  faults instead carry `invalid_spec` via `optionalText`; `priorRegistry` <= 16 entries.
  `gatedRegistryPath` (L431-448) resolves ROOT-anchored (not CWD) and its message names the
  relative ref.
- Spec-source exclusion (wave L1822-1829): both `--spec` and `--spec-json` -> usage
  "declare exactly one spec source"; neither -> usage; `--spec -` is the stdin arm, not a
  third source. Usage exits 64 with code `usage`; typed refusals exit 1.
- Size bounds (wave L153-155, 252-253; hub L2420): `MAX_SPEC_BYTES` 1 MiB, `MAX_PROMPT_BYTES`
  64 KiB, `MAX_ITEM_BYTES` 4 KiB, `MAX_REGISTRY_BYTES` 1 MiB, `MAX_LANE_AXES` 8,
  `MAX_LANE_META_BYTES` 256. `readBoundedFd` (hub L768-824) fstats size before buffering and
  dies on mid-read mutation; open flags `O_RDONLY | O_NOFOLLOW | O_NONBLOCK` (hub L833).
- `reportDir` is interpolated verbatim into every lane prompt as
  `Report: write your scoped findings to ${reportDir}/${name}.md` (wave L216) — spec-relative,
  root-relative at read time.

## Remaining unknown

`test/` conformance vectors for these codes; the dispatcher `gatedExecPath` body.
