# 2026-10-09 — verification: card dispatch and the hook-install-scope claim

Lane `CardVerify` (scout) · milestone r1-research · axes source-fidelity, verification.
Question: is the `harness-scout` card discoverable by name from its own mission worktree,
and does the central claim of `2026-10-09-hook-install-scope.md` hold under independent
read-only probes?

## What was asked

Bounded verification dispatch for the `harness-scout` card from the mission worktree
`/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin2/harness-scout`. Read the corpus
index, then `2026-10-09-hook-install-scope.md`; independently confirm whether
`.omp/hooks/pre/ufo-godspeed-inject.js` exists in (a) this worktree, (b)
`/home/vgpnk/Projects/ompskills`, (c) `/home/vgpnk/.omp/agent/hooks/`, and (d)
`/home/vgpnk/Projects/ufo-fsd-alpha/.omp/hooks/pre/`; state a CONFIRMED/REFUTED/PARTIAL
verdict; record this entry and one index row.

## Observed

All probes read-only, run from the worktree above. Commands and results verbatim.

- **(a) worktree** — `find .omp -maxdepth 3 -print` lists only `.omp/agents/` (9 cards) and
  `.omp/skills/` (`shokunin`, `swarm`, `tower`). `ls -la .omp/hooks` →
  `No such file or directory`; `ls -la .omp/hooks/pre/ufo-godspeed-inject.js` →
  `No such file or directory`. **Absent.**
- **(b) repo** — `ls -la /home/vgpnk/Projects/ompskills/.omp` shows only `agents/` and
  `skills/`; `ls -la /home/vgpnk/Projects/ompskills/.omp/hooks` → `No such file or
  directory`; `find /home/vgpnk/Projects/ompskills -name 'ufo-godspeed-inject*'` prints
  nothing (exit 0, worktrees included). **Absent.**
- **(c) user root** — `ls -la /home/vgpnk/.omp/agent/hooks` → `No such file or directory`;
  `find /home/vgpnk/.omp -name 'ufo-godspeed-inject*'` prints nothing (exit 0). The
  `~/.omp/agent/` listing holds `agents/`, `cache/`, `sessions/`, `config.yml`, and DBs —
  no `hooks/`. **Absent.**
- **(d) substrate** — `ls -la /home/vgpnk/Projects/ufo-fsd-alpha/.omp/hooks/pre/` lists
  `primeagent-assimilation.js` (19019 B), `ufo-godspeed-inject.js` (3819 B),
  `ufo-l0-monitor.js` (10972 B); `stat` confirms `ufo-godspeed-inject.js` **3819 bytes**.
  `hooks/post/` → `No such file or directory`; `ufo-statusline.mjs` (13037 B) sits at the
  `hooks/` root and is named by the substrate `.omp/config.yml` `extensions:` entry
  (`./.omp/hooks/ufo-statusline.mjs`). **Present.**

Supporting checks, all matching the entry: `.omp/skills/swarm/SKILL.md:131` and
`.omp/skills/tower/SKILL.md:51` both name `.omp/hooks/pre/ufo-godspeed-inject.js`; the live
global config `/home/vgpnk/.omp/agent/config.yml` has no top-level `extensions`/`hooks`/
`disabledExtensions` key (`grep -iE '^(extensions|hooks|disabledExtensions)'` exit 1).

## Verdict

**CONFIRMED** — the entry's central claim matches observation exactly: the hook is absent
from the worktree, the repo (worktrees included), and the user root, and present only in the
substrate at 3819 bytes.

## What changed

Nothing in the harness. This entry is a verification record only; the original
`2026-10-09-hook-install-scope.md` is untouched. One index row appended.

## Unverified

No live `task` dispatch was run, so "the hook does not fire in this repo" remains inferred
from the absent file plus cwd-scoped discovery (as the original entry already states), not
from observing a handler; the running main session's cwd was not confirmed; the compiled
bundle `/home/vgpnk/.local/bin/omp` was not re-probed for this check — the four filesystem
probes above are the whole evidence base.
