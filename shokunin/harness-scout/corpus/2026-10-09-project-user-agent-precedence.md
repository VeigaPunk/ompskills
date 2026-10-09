# 2026-10-09 — project vs user agent precedence

Lane `HarnessScoutSmoke` · integrated harness-scout card smoke test.
Question: how project and user task-agent definitions resolve when names collide.

## Observed

- Authority read: `omp://task-agent-discovery.md`, sections “Discovery inputs and precedence” and “Merge and collision rules”. It lists nearest project `.omp/agents` before the user agent directory, identified there as `~/.omp/agents` (the concrete root is `~/.omp/agent/agents`), and states project `.omp` overrides user `.omp`.
- Collision is first-wins deduplication by exact `agent.name`: discovery keeps a name only if it has not already been seen. Thus a project definition shadows a user definition with the same spelling. Matching is case-sensitive, so names differing only by case do not collide.
- The same document’s “Agent lookup and selection” specifies `getAgent(agents, name) => agents.find(a => a.name === name)`, confirming exact-name lookup with no case folding.
- Source used for this verification: the `omp://` documentation only; implementation files cited by the doc are not present in the repository workspace and no compiled-bundle probe was performed.

## Unverified

No runtime dispatch or collision fixture was run. The observed result is documented behavior, not a separately exercised runtime outcome; precedence beyond the project/user pair was outside this assignment.
