# guarantee-enforcement-loci — which guarantee is enforced by the env file, by bwrap, and which is policy-only

Asked: of the ephemeral-l1 isolation guarantees, which are enforced by the
environment file itself, which by the bwrap invocation, and which are
policy-only (not machine-enforced). Primary citations:
`scripts/prepare-ephemeral-l1.mjs` (sha256 `d91907da…bbfb`, 962 lines) and
`config/ephemeral-l1.machine.json` (sha256 `9d0184a4…9e01`); consumer checks at
`scripts/ufo-sighting.mjs` (sha256 `5e8ea127…d19e`). Re-verified at
`ufo-fsd-alpha@5ace2559`; hashes match the index anchors.

## Bucket 1 — enforced by the environment file itself

The file (`<root>/<id>/isolation/environment.json`) is **passive attestation**:
mode 0600, `O_EXCL|O_NOFOLLOW`, `flush:true` (prepare:714-715). Its guarantees
hold because of write-time discipline plus read-time exact validation —
"enforced by the file" means "enforced by validating that the file is exactly
this shape":

- **Path-redirection map**: exactly 8 path keys, all beneath `ephemeralRoot`
  (producer: `environmentPaths` hardcodes them prepare:538-547; drift self-check
  :550-553; emission :706-709). Consumer: exact 11-key set
  (ufo-sighting:45-46), per-key absolute+canonical+`beneath` (:47-53), real
  owner-only directory chain with no symlink traversal (:68-80); `OPENCODE_DB`
  may be absent but when present must be a regular owner-only non-symlink file
  (:70-76).
- **No credential values**: the emitted map is exactly `{...paths,
  ...policy.flagVariables}` (prepare:709) — 11 keys, nothing else can smuggle
  in because the consumer's exact-key set is closed.
- **Flag values pinned verbatim** `OPENCODE_DISABLE_{AUTOUPDATE,
  DEFAULT_PLUGINS,EXTERNAL_SKILLS} = "true"` (config; consumer
  ufo-sighting:54-56).
- **Identity + bound**: `schema = "ufo-ephemeral-l1-environment-v1"`
  (prepare:707 = `policy.environmentSchema` config), `ephemeralRoot` absolute
  canonical (consumer :37-40); bytes ≤ `maxEnvironmentBytes` (16384) checked
  *before* write (prepare:713), so no partial mission.
- **Policy guardrails that keep the file well-formed** (prepare `readPolicy`):
  `pathVariables` exact set **including length** (:121-129, r13
  duplicate-length clause), flags must not shadow path variables (:132-135),
  `maxEnvironmentBytes` safe int ≥1024 (:118-119).

Effect at runtime: the child receives exactly these 11 vars via bwrap
`--setenv`, so the product's state lands only inside the mission root. Without
the file's attested map, bwrap has no path set to bind; a plain
`launch --cwd <root>/checkout` without `--env-file` consumes none of it.

## Bucket 2 — enforced by the bwrap invocation

Assembled in `buildEphemeralSandboxDispatch` (ufo-sighting:4236-4287) from the
validated env file + policy `sandbox.*`/`childEnvironment`:

- **Writable set = the mission's own paths only**: `--bind <d> <d>` ×6 —
  checkout, HOME, XDG_DATA_HOME, XDG_CACHE_HOME, XDG_STATE_HOME, TMPDIR (:4281).
  Nothing else is writable; bwrap's root is otherwise an empty tmpfs.
- **Read-only confinement**: `--ro-bind` of `XDG_CONFIG_HOME` (:4282, the
  OpenCode config/agents/resolver snapshot cannot be mutated); per-policy
  system roots `--dir <p> --ro-bind <p> <p>` for `/usr,/bin,/lib,/lib64,/etc`
  (`sandbox.readonlySystemPaths`, :4247-4258).
- **Credential scrubbing**: `--clearenv` then `--setenv` of
  `childEnvironment` (empty `SSH_AUTH_SOCK`/`GH_TOKEN`/`GITHUB_TOKEN`,
  `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null`, `GIT_TERMINAL_PROMPT=0`) overlaid by
  the env file's 11 keys — ambient `process.env` is not inherited (:4244, 4286;
  `ephemeralChildEnvironment` :4179-4191).
- **Namespaces**: `--unshare-user/ipc/pid/uts`, `--unshare-cgroup-try`,
  `--new-session`, `--die-with-parent` (:4237-4243). **No `--unshare-net`** —
  the child shares the host network namespace.
- **Executable + cwd gate**: direct `opencode` argv only, `cwd ===
  <root>/checkout`, exe `--ro-bind`'d if outside the mounts (:4195-4211,
  4269-4271, 4283).
- **Resolver snapshot**: `--ro-bind <snapshot> <target>` with the target
  restricted to `/etc/` or `/run/` (:4284, :4231-4234).
- **Presence gate**: `bwrap` resolved through policy `childEnvironment.PATH`,
  not ambient PATH; missing → typed `SANDBOX_UNAVAILABLE` (:4202-4206).

## Bucket 3 — policy-only (not machine-enforced)

Carried in `config/ephemeral-l1.machine.json` (or code constants) as
configuration/attestation with no runtime machine boundary:

- **`sandbox.executable: "bwrap"`** — shape-validated in `readPolicy`
  (prepare:144-149) but prepare never invokes it; the name itself is trusted
  at launch via policy PATH resolution.
- **`readonlySystemPaths` membership** — the set is machine-*applied*, but its
  *contents* are policy choice; anything not listed (`/home`, `/var`, `/tmp`
  under the shipped `/scratch` root) is hidden only incidentally by the empty
  tmpfs root, not denied by rule.
- **`flagVariables` semantics** — the sandbox *sets* `OPENCODE_DISABLE_*`;
  whether OpenCode honors them is product-side behavior, not sandbox-enforced.
- **`opencode.*` names** (`primarySource`, `configFile`, `agentsDirectory`,
  `authFile`) — data; only `SIMPLE_NAME` shape validated (prepare:162-174).
- **`root`** (`/scratch/tmp/vgpnk/ufo/ufo-ephemeral-l1`) — a configured scratch
  path; no fence around it beyond create/destroy-time `ensurePrivateDirectory`
  checks against the configured root.
- **Attestation tokens** — `marker`, `markerSchema`, `environmentSchema` are
  shape-checked only; `schema` is attestation-only, never emitted.
- **`maxEnvironmentBytes` value** — write-time bound; 16384 is policy.
- **`childEnvironment.PATH`** — closed PATH applied to the child, but the
  contents (`/usr/local/sbin:…:/bin`) are policy; no verification of the
  binaries it names.
- **"No remote" as a network property** — NOT machine-enforced: realized only
  by clone-time remote stripping (prepare:583-607) + credential scrubbing;
  with no `--unshare-net` the child can reach the network (residual R1).
- **`snapshotDigest`** — attested in the marker at create (prepare:633-656);
  the consumer never re-derives it, so post-create checkout tampering is not
  machine-detected at launch.
- **marker `sourceRoot`** — carried, value-checked by no reader.
- **Doc bounded retention / triage deadline** — zero code (known-failure-modes
  FM4, UNENFORCED).

Third locus, neither of the three: **owner-only 0700/0600 modes** are enforced
by the OS via mode bits that prepare's writes set and destroy re-verifies
(`ensurePrivateDirectory` :255-283, `assertOwnerPrivate`) — filesystem
enforcement, not env-file, bwrap, or policy semantics.

## What changed

Nothing in the substrate; classification distilled from re-verified anchors
(emission prepare:659-754, `readPolicy` :106-177, `PATH_VARIABLES` :42-54,
config full read, consumer validation ufo-sighting:31-85, sandbox argv
:4236-4287).

## Unknowns

- bwrap's own flag semantics never executed live; enforcement assumed per
  argv construction and the 4/4 sighting ephemeral tests.
- Product-side behavior behind `OPENCODE_DISABLE_*` and the no-model default
  (out of the sandbox's reach by design).
- Whether any external consumer parses prepare's stderr expecting a typed
  `code` field (carried from evidence-digest).
