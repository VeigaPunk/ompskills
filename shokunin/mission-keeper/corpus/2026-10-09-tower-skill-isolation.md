# tower-skill-isolation — Tower skill: dispatch discipline, isolation, routing, hook

Item: `.omp/skills/tower/SKILL.md` in full.

Observed: plan-before-dispatch (map assignments to disjoint files; one owner for shared interfaces; concurrent writers need real worktrees; the task tool's agents are NOT worktree-isolated by default); `omp worktree add -C REPO -b UNIQUE_BRANCH PATH [COMMIT]`. Routing: the operator's global config is the sole authority (three approved aliases m_strong/m_mid/m_fast + named `m_*` lanes; the L1 uses `--model @m_strong`); never pin a provider/model/credential or change routing. Godspeed injection: the hook prepends `/skill:godspeed` on `task` calls (flat and batch), idempotent; eval-kernel `agent()`/`workpool()` bypass it.
FIDELITY CORRECTION: the tower SKILL's claim that "the fleet renderer prepends it to a launched mission prompt" is wrong — `renderPrompt` has no prepend; `/skill:godspeed` is static template line 2. The hook is absent from the ompskills worktree (only `.omp/skills/*`), so for lanes the guarantee is the wave renderer + the template lead.
Mission visibility: the wall is display/interaction only, never orchestration; only `launch` creates a pane; task workers do NOT auto-appear on the wall. Settle/recover/cleanup: as in the tower-duties entry; `clear` is a repo-wide orphan sweep, never `clear --all`.

Evidence: `TowerSkillIsolation.md`.
Unknowns: hook-vs-worktree-session coverage (hook absent); "renderer prepends" claim not re-tested.
