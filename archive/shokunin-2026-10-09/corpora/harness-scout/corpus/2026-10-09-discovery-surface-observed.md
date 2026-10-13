# 2026-10-09 — the discovery surface as it exists on this machine

Lane `AgentDiscoveryObserved` (revenger) · milestone r1-research · axes source-fidelity, coverage.
Question: what the live discovery surface actually contains, and which root serves
a card dispatched from the mission worktree.

## Observed

- **User agent root** `/home/vgpnk/.omp/agent/agents/` — 13 cards (connector, critic,
  distiller, executor, labrat, mutation-tester, planner, revenger, reviewer, scout,
  scribe, sentinel, simplifier), every frontmatter `name` = filename stem, every card
  carries `ufo: true`, and `diff -rq` shows them **byte-identical** to the substrate
  `/home/vgpnk/Projects/ufo-fsd-alpha/.omp/agents/`. `executor.md` is the one card
  declaring `spawns: labrat`. There is **no** `/home/vgpnk/.omp/agents/` (the user
  root is under the singular `agent/` segment).
- **Project agent root (this worktree)** `.omp/agents/` — the 8 shokunin cards
  (fleet-warden, host-smith, mission-keeper, route-auditor, skill-scribe, test-smith,
  wall-watcher, wave-smith), all git-tracked and clean; `md5`-identical to the
  main-repo copies at commit `87c351a`. No `.omp` exists in `.tower/`,
  `.tower/worktrees/`, or `.tower/worktrees/shokunin2/` above the worktree, and no
  `/home/vgpnk/Projects/.omp` — so the worktree's own `.omp/agents` is the sole,
  nearest project hit.
- `/home/vgpnk/.agents/` is **skills-only** (godspeed dir + omarchy symlink → the
  omarchy default skill); no `agents/` dir, so it contributes nothing to agent
  discovery.
- Foreign roots: `~/.claude/agents/` exists with one symlinked card
  (`the-kimiraikkoner.md`) that the doc's `.omp` source filter skips;
  `~/.claude/plugins`, `~/.codex/agents`, `~/.gemini` absent; `CLAUDE_CONFIG_DIR`
  unset.
- **Live config corroborates the user root is operative**: `task.agentModelOverrides`
  keys are exactly the 13 user card names **plus `main`**; `maxConcurrency: 32`,
  `maxRecursionDepth: 2`; no `extensions:`, no `enabledProviders`, no
  `task.disabledAgents`.
- Name sets are disjoint: no project name appears in the user root, so the
  project-vs-user precedence rule governs a hypothetical collision here, not an active
  one. The only active collisions are user `reviewer`/`scout` vs the same-named
  **bundled** definitions.

## Inference (from `omp://task-agent-discovery.md`, not exercised)

Walking up from the worktree cwd, the nearest `.omp` hit is `.omp/agents/` → a card
dispatched from the worktree resolves from the **worktree project root**; the
byte-identical main-repo copy above it is unreachable under "first `.omp` hit only".
Merge is first-wins by exact case-sensitive name, so project beats user beats
extension roots beats Claude plugins beats bundled; the observed active collision
resolves to the user `reviewer`/`scout` over bundled.

## Not observable without a dispatch

The merged runtime `AgentDefinition[]` with per-entry `source` tags; a live collision
proof; the preflight refusal texts; description-time vs execution-time discovery
divergence; effective per-dispatch model routing; whether any guardrail fired for
this fleet's lanes. Implementation files are absent on this machine, so the doc is the
strongest local authority.