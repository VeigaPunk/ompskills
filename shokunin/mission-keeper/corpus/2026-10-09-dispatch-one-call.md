# dispatch-one-call — Step 4: exactly one batched task call; resume-only branch

Item: step 4 (`sighting/l1-prompt.md:107-114`) + `skill://swarm` + smoke step 5.

Observed: exactly ONE batched `task` call using `taskCall.context` + the complete `taskCall.tasks` array verbatim; never add/drop/reword a lane; never split a wave to evade a refusal; no per-lane model param exists; each task entry is exactly `{name, agent, task}`. A null `taskCall` is resume-only: no task call, each `resumeSends` entry via `hub send --to <entry.resume> --message <entry.message>` (`entry.name` is bookkeeping).
Corrections: `hub` does not exist on this substrate (`command -v hub` absent; corroborated by `tf-audit-prompt-r1.md` §4) — the resume path is declared but was never exercised end-to-end (r1 waves were spawn-only). The "solutionSpace unavoidable deviation" claim is NOT in `test/sighting-wave-smoke.md` (zero occurrences); it lives in the round receipts. AUD-10 as corrected: the task tool tolerates omitting `solutionSpace` (defaults to the task text), so verbatim dispatch executes; the surviving finding is fabrication pressure.

Evidence: `DispatchOneCall.md`.
Unknowns: whether any off-PATH hub mechanism exists; r2 still added `solutionSpace` despite the correction.
