# 2026-10-09 — two tenants under .tower/: kimi comms vs omp fleets

**Asked.** Does anything on the omp side read/write `.tower/comms`, and how do the two `.tower/` users coexist?
**Sources.** rg over `sighting/`, `.omp/`, `host/`, `test/` and ufo-fsd-alpha; `.omp/skills/tower/SKILL.md`, `sighting/l1-prompt.md`; kimi `WORKTREES_DIR`.
**Observed.**
- No omp-side code reads or writes `.tower/comms`; neither the omp tower skill nor `l1-prompt.md` has a mailbox notion. Prose mentions only in `.omp/agents/evidence-auditor.md:64-67` and its corpus.
- Tenants: **kimi tower** owns `.tower/comms/**` and its `wt-N` slots under `.tower/worktrees/`; **omp tower-fleet** owns `.tower/fleets/<fleet>/**` and `.tower/worktrees/<fleet>/<id>`. `.tower/worktrees/` is shared; kimi's `resolveTowerRepoRoot` maps any cwd under `/.tower/worktrees/` (including an omp fleet worktree) to the parent repo, so a kimi session started in an omp worktree writes the parent repo's hub [source-derived].
- omp's `hub send` (resume by agent id; `hub` tool deprecated in omp 18.3.0 for `wait`/`write`/`proc://`) is a **different mailbox** with no relation to `inbox/`.
- `.tower/` is git-excluded (`.git/info/exclude:7`), so the hub is never tracked — it exists only on disk.
- Name trap: `MISSIONS.md` also matches `EPHEMERAL-L1-MISSIONS.md` in ufo-fsd-alpha docs; word-bound greps.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Origin of `.tower/worktrees/wt-band` and `wt-launcher` (not kimi slots; not traced).

**Lane.** OmpSideCoupling (connector). Report: `.tower/fleets/shokunin3/reports/comms-keeper/OmpSideCoupling.md`.
