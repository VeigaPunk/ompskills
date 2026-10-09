# 2026-10-09 — skill name resolution and collision handling

Lane `SkillResolveOrder` (reviewer) · milestone r1-research · axes source-fidelity, coverage.
Question: how a colliding skill name resolves, how `skill://` resolves, and which
filters apply to which name form.

## Observed

Authority: `omp://skills.md` ("Collision and duplicate handling", "Source toggles and
filtering", "`skill://` URL behavior"); live config; live read-only `skill://` probes.
The substrate has no `packages/coding-agent` tree, so code-level checks were impossible.

- **Capability dedup**: key is the skill name; the first item per name
  (highest-precedence provider) wins in the deduped `items` view. `loadSkills()` works
  from the **pre-dedup superset** so lower-precedence copies still get examined.
- **Identical-file dedup**: by `realpath` (symlink-safe). A later same-named skill with
  an identical body and deeply-equal parsed frontmatter is dropped silently (the "same
  skill installed twice"). Supersede clause: when the incoming skill outranks the bare
  holder, the identical copies it supersedes are dropped instead — an override never
  re-admits its own duplicate.
- **Differing copies**: none is dropped. The higher-precedence skill keeps the **bare**
  name; every other variant gets `<namespace>/<name>` with a collision warning naming
  the paths. Precedence for the bare name: authored > skillshare registry install;
  custom-directory > provider (#7190, regardless of admission order); else admission
  order (provider priority, then `customDirectories` array order). Namespace = the
  provider's plugin identity when it tracks one (`claude-plugins`/`agent-plugins` →
  plugin name, `omp-plugins` → extension package name, `skillshare` → package name),
  else the directory owning the `skills/` tree, else the skill root dirname, else the
  provider id. A namespaced slot already taken gets a `~2`, `~3`, … suffix.
- **Raw-name rejection**: a raw frontmatter `name` containing `/` or `\` is rejected
  with a warning for every provider and custom directory — the separator is reserved
  for the namespaced form and `skill://<name>/<path>`.
- **`skill://` resolution** (`packages/coding-agent/src/internal-urls/skill-protocol.ts`):
  `skill://<name>` → the `SKILL.md` for `read`; the skill **directory** in `bash`
  (`realpath`/`readlink` print the physical path); `skill://<name>/<relative-path>`
  resolves inside `baseDir`. Guards: exact name match; relative paths URL-decoded;
  absolute paths rejected; `..` rejected; lexical containment in `baseDir`; Agent
  Plugins/Skillshare additionally realpath-check package-root containment; directories
  return listings; missing files return an explicit `File not found`; no fallback
  search. Namespaced form `skill://<namespace>/<name>[/<path>]` and the
  `/skill:<namespace>/<name>` token (leading or mid-prompt, one `/` per token).
- **Filters**: toggles `enableCodexUser`, `enableClaudeUser`, `enableClaudeProject`,
  `enablePiUser`, `enablePiProject`, `enableAgentsUser`, `enableAgentsProject`;
  `disabledExtensions` entries `skill:<name>`; `ignoredSkills` (exclude globs);
  `includeSkills` (include allowlist). Order: not-disabled → source enabled →
  not-ignored → included. `disabledExtensions` and `ignoredSkills` apply to **both**
  the raw and final name (a namespaced alias cannot bypass an exclusion);
  `includeSkills` applies to the **final** listing only (`second/*` can select a
  namespaced skill).

## Live defaults and probes

`omp config list --json`: `skills.enabled=true`, `enableSkillCommands=true`,
`enableCodexUser=false`, `enableClaudeUser=false`, `enableClaudeProject=true`,
`enablePiUser=true`, `enablePiProject=true`, `enableAgentsUser=true`,
`enableAgentsProject=true`, `customDirectories=[]`, `ignoredSkills=[]`,
`includeSkills=[]`, `disabledExtensions=[]`, `enabledProviders=[]`, `registryUrl=https://skills.omp.sh`
(13 `skills.*` keys). Probes confirmed: exact case-sensitive name match
(`skill://Godspeed` → `Unknown skill: Godspeed` + available list); absolute paths
rejected (also `%2F`-encoded); `..` neutralized to a `File not found` inside `baseDir`
(no dedicated traversal message); `bash realpath skill://godspeed` → the skill dir;
`ls skill://godspeed/` → directory listing.

## Unverified

Runtime emission of `~2`/`~3` suffixes, collision warnings, plugin namespaces, the
#7190 displacement path, the authored-beats-registry re-admission, and the raw-name
rejection warning — all doc-only (exercising them needs colliding skill files, which a
read-only lane must not create); no collisions exist on this machine. The
`omarchy`-present-in-three-roots single-entry result is consistent with realpath dedup
but is not a clean proof (only the `agents` user source is enabled by default anyway).