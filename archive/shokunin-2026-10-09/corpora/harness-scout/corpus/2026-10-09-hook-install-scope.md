# 2026-10-09 — hook install scope, and where this repo stands

Lane `HookInstallScope` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: which roots a hook installs into, how a discovered hook loads, and whether the
godspeed-injection hook the tower/swarm skills name is present here.

## Observed

Authority: `omp://hooks.md`, `omp://extension-loading.md`; live config; read-only
inspection of the worktree, the repo, and the substrate.

- **Roots**: project `<cwd>/.omp/hooks/pre/*.{ts,js}` and `…/post/*.{ts,js}`;
  user `<agentDir>/hooks/pre|post/*.{ts,js}` (default `~/.omp/agent/hooks`; profile- and
  `PI_CODING_AGENT_DIR`-aware). A factory **directly** in `hooks/` is not discovered;
  dot-entries and non-files are skipped; only `.ts`/`.js` are appended by the native hook
  scan. **Project scope is cwd-only — no ancestor walk.** Path resolution: absolute as-is,
  `~` expanded, relative against cwd.
- **Load path**: the default runtime is the extension runner — `--hook` aliases
  `--extension`; `hookCapability` `.ts`/`.js` factories load as extension modules that
  bind `pi.on(...)` to the event bus; tools are wrapped by `ExtensionToolWrapper`.
  Discovery order: native extension modules → discovered hook factories → installed plugin
  entries → explicit configured paths (CLI then settings `extensions`); dedup by absolute
  path, first seen wins. The legacy `discoverAndLoadHooks`/`loadHooks` path still exists
  as a library path, not the default startup path.
- **Observed install state**:
  - the mission worktree `.omp/` and `/home/vgpnk/Projects/ompskills/.omp/` hold only
    `agents/` + `skills/` — **no `hooks/`**; no `ufo-godspeed-inject.js` anywhere under
    `/home/vgpnk/Projects/ompskills` (worktrees included);
  - the user root `~/.omp/agent/hooks/` **does not exist**;
  - the global config names no `extensions`/`hooks`/`disabledExtensions` key;
  - the substrate `/home/vgpnk/Projects/ufo-fsd-alpha/.omp/hooks/pre/` **does** hold
    `ufo-godspeed-inject.js` (3819 B) plus two more factories; substrate `hooks/post/` is
    absent; `ufo-statusline.mjs` sits at the `hooks/` root and loads via the substrate
    `.omp/config.yml` `extensions:` entry.
- **Claim vs observation**: `.omp/skills/swarm/SKILL.md` and `.omp/skills/tower/SKILL.md`
  both state the OMP `task` hook `.omp/hooks/pre/ufo-godspeed-inject.js` prepends
  `/skill:godspeed` to every dispatch. The hook is **absent from both ompskills roots and
  from the user root**, and discovery is cwd-scoped with no ancestor walk — so for a
  session rooted in this repo/worktree the hook half of that prose is **inert**. The
  consequence is the one the prose itself concedes: the **wave renderer's leading line**
  is the only guarantee. The renderer is not in this repo; it is
  `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`
  (`GODSPEED_INVOCATION = "/skill:godspeed"`, an idempotence guard
  `opensWithGodspeedInvocation`, a guarded prefix in the legacy lane composition and an
  unconditional prefix in the compact/hoisted emission). Evidence it ran: the substrate's
  `test/evidence/wave-20261008T191554Z/dispatch-32*.json` each contain exactly 32
  `/skill:godspeed` occurrences for 32 lanes (one leading invocation per lane, not doubled).

## Unverified

No live `task` dispatch was run, so "the hook does not fire in this repo" is inferred from
the absent file plus cwd-scoped discovery, not from observing a handler; the running main
session's cwd was not confirmed; the extension-loader source was not traced
(doc-sourced only); the substrate's install history was not traced.