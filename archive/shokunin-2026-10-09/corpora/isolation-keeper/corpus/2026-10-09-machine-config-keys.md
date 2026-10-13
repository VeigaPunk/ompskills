# machine-config-keys — every policy key, its value, and its consumer line

Asked: for every key, give the live value and the line that consumes it, or mark
it read-but-unused. Source: `config/ephemeral-l1.machine.json` (sha256
`9d0184a479ffda4ef3c4a4004de0c0652ba95e6ab7369ae0094c9817486d9e01`, 1373 bytes,
52 lines) + `readPolicy`/`readEphemeralPolicy` + consumers. Lane
`MachineConfigKeys` (scout).

| key | value | `readPolicy` | consumer |
| --- | --- | --- | --- |
| `schema` | `ufo-ephemeral-l1-policy-v1` | :110 | base.mjs:209 |
| `root` | `/scratch/tmp/vgpnk/ufo/ufo-ephemeral-l1` | :112 | prepare :664,:820,:890 (sighting: **none**) |
| `marker` | `.ufo-ephemeral-l1.json` | :114 | prepare :729,:765,:829; sighting :115,:4292 |
| `markerSchema` | `ufo-ephemeral-l1-root-v1` | :115 | prepare :718,:778,:839; sighting :127,:4306; base :223 |
| `environmentSchema` | `ufo-ephemeral-l1-environment-v1` | :115 | prepare :707; sighting :35; base :222 |
| `maxEnvironmentBytes` | `16384` | :118 | prepare :713,:733,:769,:772; sighting :96,:102,:121,:122,:4298,:4299 |
| `pathVariables` | 8 keys (HOME, XDG_CONFIG_HOME, XDG_DATA_HOME, XDG_CACHE_HOME, XDG_STATE_HOME, TMPDIR, OPENCODE_CONFIG_DIR, OPENCODE_DB) | :125-128 | prepare **read-but-unused** (`environmentPaths` hardcodes :537-550); sighting :46,:47,:68 |
| `flagVariables` | `OPENCODE_DISABLE_{AUTOUPDATE,DEFAULT_PLUGINS,EXTERNAL_SKILLS}=true` | :131,:134 | prepare :709 (spread); sighting :45,:46,:54 |
| `childEnvironment` | PATH + 7 scrub vars | :137,:139 | prepare **read-but-unused**; sighting :4182,:4204; base :214,:231 |
| `sandbox.executable` | `bwrap` | :144-149 | prepare **validator only**; sighting :4202,:4206 |
| `sandbox.resolverSource` | `/etc/resolv.conf` | :151 | prepare :443; sighting :4227,:4229,:4230 |
| `sandbox.resolverSnapshotFile` | `sandbox-resolv.conf` | :154 | prepare :454; sighting :4216 |
| `sandbox.readonlySystemPaths` | `/usr,/bin,/lib,/lib64,/etc` | :157-160 | prepare **validator only**; sighting :4247 |
| `opencode.primarySource` | `skills/ufo/SKILL.md` | :166 | prepare :473 |
| `opencode.subagentSourceDirectory` | `agents` | :167 | prepare :489 |
| `opencode.configFile` | `opencode.json` | :170 | prepare :534 |
| `opencode.agentsDirectory` | `agents` | :171 | prepare :469 |
| `opencode.authFile` | `auth.json` | :172 | prepare :686,:695 |

`unread_keys`: none. `read_but_unused_in_prepare`: `pathVariables`,
`childEnvironment`, `sandbox.executable`, `sandbox.readonlySystemPaths` — the
producer validates their shape but the **consumer** (`ufo-sighting`) is what uses
them; `childEnvironment` reaches the child only via sighting:4182.

Observations:
- `schema` is attestation-only — never emitted into `environment.json`/marker.
- `maxEnvironmentBytes` lower bound diverges: `readPolicy` ≥ 1024 (:118) vs
  `base.mjs` ≥ 1 (:221).
- `root` is prepare-only: no `EPHEMERAL_POLICY.root` reference in
  `ufo-sighting.mjs`/`base.mjs`.

## Unknowns

- Whether the test suites pin the exact live values above (out of this lane).