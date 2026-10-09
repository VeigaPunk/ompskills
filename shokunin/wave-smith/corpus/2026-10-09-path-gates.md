# path-gates — ROOT, `beneath`, the escape flag, and the relative-path rules

Asked: the path/root gates the wave CLI applies.
Source: `scripts/ufo-swarm-wave.mjs:122-137, 397-448, 1412, 1427-1455`;
`ufo-mission-result.mjs:1114-1139, 2126, 2143-2159, 862-869`. Lane: `PathGates`.

- `ROOT = resolve(process.env.UFO_PROJECT_ROOT || <script dir>/..)`. The config default is
  the hub's `gatedConfigPath` with a `UFO_CONFIG_PATH` override and a
  `<ROOT>/config/ufo.json` fallback — the fallback arm is **never** beneath-walked.
- `gatedRegistryPath` = `resolve(ROOT, relPath)` → `beneath(ROOT, resolved)` → refusal only
  when `!ALLOW_EXTERNAL_TOOLS`, code `EXEC_PATH_OUTSIDE_ROOT`. An unstatable path is not
  provably inside, so it fails closed into the same refusal.
- `beneath` realpaths the root and `lstat`s every relative component, returning false on
  **any** symlink component — that is what defeats a planted in-root link a lexical prefix
  test would read through. ENOENT tail components are skipped; other faults rethrow.
- `ALLOW_EXTERNAL_TOOLS = process.env.UFO_FLEET_ALLOW_EXTERNAL_TOOLS === "1"` — exact
  match; an empty string denies. Bound at module load.
- `validateRelativePath` (three arms): no absolute path or drive letter, no backslash
  anywhere, no empty/`.`/`..` segment. Codes: `invalid_report_dir` (`reportDir`),
  `invalid_registry_path` (priorRegistry entries, `record --registry`), `invalid_spec` for
  an empty/non-string/>512-byte value. `registryRelPath` adds the `wave` single-segment rule.
- `redactFsErrorMessage` strips Node's `, <syscall> <path>` tails so a diagnostic names
  only the caller-spelled relative ref, never the resolved absolute path.
- Gate covers: `UFO_CONFIG_PATH`, `spec.priorRegistry` (plan load, run revalidation, record
  attestation), the own wave registry (resume read, persist), `record --registry`,
  `--prior-refinement`, `--route-probe`. **Not** covered: the `--spec <file>` read (bare
  `resolve`, so an outside-root spec is read), `UFO_PROJECT_ROOT` itself, and the config
  fallback path.
- Ordering observed: config gate → relative-path validation → lane band → registry gating.
  Zero-mutation verified: a symlinked `reportDir` is refused `EXEC_PATH_OUTSIDE_ROOT` once
  the **own-registry** gate runs — a resume lane's admission read, or `run`/`record`
  persist — with the link target gaining no files. Round-2 correction: a **spawn-only
  `plan` admits** the same symlinked `reportDir` (exit 0, the plan still emits
  `registry.path`), because that gate sits inside `if (resumes.length > 0)`.

## Not carried by the source

- No gate on the spec file path, so `--spec` is the one ungated **operator-declared**
  read (the config fallback path is read ungated too, but no operator spells it).
- `redactFsErrorMessage` strips Node's `, <syscall> <path>` tails (and the two-path rename
  tail), so the errno and its description survive while the resolved absolute path goes; a
  caller-spelled relative ref appears only where the caller interpolates it (e.g.
  `cannot read registry ${ref}:` at `:525`).
- A missing config is not refused at all: the loader falls back to the built-in defaults
  (`source: "default"`); any other read fault → `invalid_policy`. Neither is a gate refusal.

## Unknowns

- The Windows drive-letter arm is unprobed on this POSIX host; the `--prior-refinement`
  refusal was quoted from source, not executed.
