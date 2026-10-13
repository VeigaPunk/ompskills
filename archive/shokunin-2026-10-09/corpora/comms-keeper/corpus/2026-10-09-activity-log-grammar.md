# 2026-10-09 — activity.log grammar and verb catalog

**Asked.** Exact line grammar and every verb.
**Sources.** `protocol__store.ts.js:212-229` (`appendLog`, `recentLog`), 23 `appendLog` call sites; both logs parsed (77 + 80 lines).
**Observed.**
- Line: `<ISO-8601 UTC ms Z> <actor> <verb>[ k=v …][ ref=<repo-relative path>]\n` via `appendFile`; no lock. Keys in source order; `undefined` dropped; values interpolated unquoted/unescaped; `ref=` always last.
- Actor = `tower` or the caller's roster name. Tower-only verbs: `init, rebase, adopt, release, died, revived, plan, worktree.add/keep/remove/remove.failed/remove.skipped, spawn, merge, merge.blocked, merge.noop, teardown`. Caller-stamped: `inbox.send, finding.file, review.write, mission.update, mission.rework`.
- `spawn name= kind= agent= mission=|target= model= [ref=<mission file>]`; `died name= agent= kind= status= reason=<≤200, whitespace-collapsed> mission= target=`; `revived name= agent= kind=`.
- `tokens=` only on `inbox.send`, `finding.file`, `review.write`: the caller's **cumulative** session total (monotonic per actor in both logs; not per message).
- Fresh `init` truncates the log (`:123`) — it is append-only except for that.
- Not logged at all: `task_done` ticks, spawn's silent status flip, tower resumes (`Agent(resume=…)`), hand-written files.
- Latent breaks: `task_drop`, `scope`, `worktree.remove.failed reason` values can contain spaces/quotes/newlines; 0 occurrences in either log. 0 grammar violations; all 76 `ref=`s resolve.
- Hub A actors: tower 32, worker-audit 13, worker-hostcfg 11, worker-wavetest 10, worker-skills 5, three reviewers 2 each.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Concurrent `appendFile` atomicity untested.

**Lane.** ActivityLogGrammar (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/ActivityLogGrammar.md`.
