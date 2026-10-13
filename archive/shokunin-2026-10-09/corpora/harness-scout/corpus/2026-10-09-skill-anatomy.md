# 2026-10-09 — what a skill is and how it is discovered

Lane `SkillAnatomy` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: the skill shape, the required layout, SKILL.md frontmatter, the
`loadSkills()` pipeline, and provider priorities.

## Observed

Authority: `omp://skills.md`. Existence of the named implementation files and (for
five providers) the numeric priorities were cross-checked by string extraction from
the compiled bundle `/home/vgpnk/.local/bin/omp` (`18.8.6`, non-stripped ELF with
`// packages/coding-agent/src/<file>` source comments).

- **Shape.** A discovered skill is `name`, `description`, `filePath` (the
  `SKILL.md`), `baseDir`, and source metadata (`provider`, `level`, path). The
  capability validator requires only `name` + `path`; providers add frontmatter
  requirements. Matching quality depends on `description`.
- **Layout.** Conventional provider roots discover **one level under `skills/`**:
  `<skills-root>/<skill-name>/SKILL.md`. Nested `group/<skill>/SKILL.md` is **not**
  discovered. Variants: the Claude-plugin provider also accepts manifest-declared skill
  dirs containing `SKILL.md` directly; Agent Plugins use only
  `skills/<name>/SKILL.md`; Skillshare registry packages have a root-level `SKILL.md`;
  `skills.customDirectories` scans the same non-recursive `*/SKILL.md`.
- **Frontmatter.** `name?`, `description?`, `globs?: string[]`, `alwaysApply?: boolean`,
  `hide?: boolean`, `disableModelInvocation?: boolean` (normalized from kebab-case),
  `enabled: false` skips the skill, unknown keys preserved as metadata. `globs`/
  `alwaysApply` are metadata, **not** invocation controls. `name` defaults to the
  directory name. `description` is required for the `native` (`.omp`) provider,
  `omp-plugins`, `github`, and `customDirectories`; claude/codex/agents/opencode/
  claude-plugins may load without one. Agent Plugins apply stricter Agent Skills
  validation (required name+description, directory-name agreement, closed field set;
  OMP `hide`/`enabled` rejected).
- **Pipeline.** `loadSkills()` (`packages/coding-agent/src/extensibility/skills.ts`)
  does three passes: (1) capability providers via `loadCapability("skills")`
  (managed/auto-learn skipped here); (2) `skills.customDirectories` via
  `scanSkillsFromDir(..., {requireDescription:true})`, where a custom-directory skill
  overrides a same-named provider skill; (3) `omp-managed` auto-learn skills dead-last.
  `skills.enabled: false` returns no skills.
- **Provider precedence** (priority-first, higher wins; ties by registration order):
  `native` 100 → `skillshare` 95 → `omp-plugins` 90 → `claude` 80 → `agent-plugins` 75 →
  the priority-70 group (`claude-plugins`, `agents`, `codex`) → `opencode` 55 →
  `github` 30 (`.github/skills/<name>/SKILL.md`, project-only) → `omp-managed` 5
  (`~/.omp/agent/managed-skills`, always defers to an authored skill).
- **Live observation.** The global config has **no `skills:` key** (no
  `customDirectories`, `includeSkills`, `ignoredSkills`, `disabledExtensions`, source
  toggles) — everything is at default. `~/.omp/agent/managed-skills`, `~/.omp/plugins/node_modules`,
  and any `skills.lock.json` do not exist here.

## Divergence / precision

Only five priorities (95/90/75/70/55) were extracted numerically from the binary;
native 100, claude 80, github 30, omp-managed 5 rest on the doc. A minified
`"omp-managed", 64000` string is a file-cap constant, not a priority.

## Unverified

No `.ts` source exists in the worktree or the substrate; the doc is the behavioral
authority. The pipeline, the custom-directory override, `enabled:false` skipping, and
Agent-Plugins/Skillshare validation were not exercised (no such packages/config live
here). The binary is one build (`18.8.6`).