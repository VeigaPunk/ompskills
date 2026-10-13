# Hook scope, discovery roots, and the bypass surfaces

**Asked:** where the godspeed hook loads, and what injection does *not* cover.
**Source:** existence checks + `omp://hooks.md`, `omp://extension-loading.md`, `omp://config-usage.md`,
`omp://tools/eval.md`; the hook header; run-logic §4.3.

## Observed

- Existence checks — all **ABSENT**: `ompskills/.omp/hooks`, this worktree's `.omp/hooks`,
  `~/.omp/hooks`, `~/.omp/agent/hooks`. Control **EXISTS**: the substrate
  `/home/vgpnk/Projects/ufo-fsd-alpha/.omp/hooks/pre/` (three hooks incl. `ufo-godspeed-inject.js`) plus
  an undiscoverable `.omp/hooks/ufo-statusline.mjs` loaded explicitly via config.
- Discovery roots: project `<cwd>/.omp/hooks/pre|post/*.{ts,js}` (**cwd-only, no ancestor walk**) and user
  `<agentDir>/hooks/pre|post/*.{ts,js}` (default `~/.omp/agent/hooks`, profile/env aware). Auto-scan is
  `.ts`/`.js` only. **Real scope on this host:** the hook loads only in sessions rooted at the substrate
  repo — zero ambient hooks in ompskills-rooted fleet sessions.
- `--config` (and `PI_CONFIG_FILES`) is a settings overlay: it can add explicit factory paths or suppress
  hooks via ids, but **cannot move the discovery roots** (fixed by cwd and profile/env-resolved
  `agentDir`). Matches the hook header claim and `fleet-dispatcher.mjs:8492-8500` (spawns L1 with
  `--config <snapshot>`, no extension flags).
- **Bypass surfaces:** eval-kernel `agent()` / `workpool()` are host-bridge calls, not AgentTool calls —
  they emit no `tool_call` (hook header :22-25 verbatim; run-logic:732-733); hand-written launchers and
  any non-`task` dispatch; sessions rooted outside a discovery root (every ompskills fleet session —
  self-proven: this lane's prompt led with the invocation while no hook could have fired here);
  resume/`hub send` continuity messages (never prefixed).
- Divergence honesty: a historical probe report's anchors drifted and its double-prefix verdict is
  superseded (current bytes guard every prepend site); transcripts store **pre-revision** tool_call text,
  so treat them as caller emission, not executed input.

## Unknown

Whether an eval `tool.task(...)` bridge call still emits `tool_call` (left unresolved by the probe, taught
neither way); the exact `disabledExtensions` id spelling; runtime `--config` snapshot contents.