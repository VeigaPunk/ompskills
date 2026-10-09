# The resume exemption — no invocation, no binding, resumeSends

**Asked:** how a resume lane is composed and why it carries no invocation.
**Source:** `ufo-swarm-wave.mjs` resume arm :1128-1143, `planToDispatchPayload` :1307-1344; live read-only
plan probes.

## Observed

- **Injection exists only in the spawn arm** (:1166-1168); the resume arm returns at :1143. Comment
  :1139-1140: "The leading invocation is NOT injected — a resumed lane keeps its identity and
  transcript." A wake revives the same agent with its transcript (header :22-26); run-logic:734-735.
  The hook structurally cannot reach it either (`toolName === "task"` only; resume entries carry no
  `task` field, probed). The resume arm additionally **skips** `laneBindingSuffix` (spawn :1156 vs
  resume :1128-1134): only the report suffix and the bound-then-envelope tail are shared.
- **Message composition:** default `Continue your assigned work and report the outcome.` (:1128);
  `message`/`prompt` are aliases with a null-as-absent conflict check (:907-922); `reportDir` append via
  the shared `reportInstruction` with marker-aware `appendReportSuffix` keeping the marker terminal
  (:181-188, :1129-1133); tail `checkComposedText` :1141; entry shape
  `{name, resume, member, item, message}`.
- **Judgment inheritance:** restating `role`/`item`/`axes`/`milestone` on a resume is refused
  (`resume_role_forbidden` :892-894, `resume_item_forbidden` :895-897, `resume_meta_forbidden` :901-906);
  the member's binding is carried hop-invariant via `inheritedJudgment` (:596-621, :1068-1079) onto the
  resume registry row with `agentId: null` so the original spawn row keeps sole ownership of the handle.
  Ownership resolves fail-closed from the own registry or a declared `priorRegistry`
  (`resume_unknown_member`, :1027-1066).
- **resumeSends split:** `planToDispatchPayload` (:1307-1344) has two independent branches;
  `taskCall = {context, tasks: spawns}` only when spawns exist and is `null` for resume-only waves;
  `resumeSends` carries the resume entries; `dispatch.calls` is 1 or 0. Resume-only waves are exempt from
  the wave floor **and** ceiling but not the member cap.
- **L1 consequence:** send `hub send --to <entry.resume> --message <entry.message>` verbatim
  (`entry.name` is bookkeeping). Never prefix the message, never echo the binding, and `--to` takes
  `entry.resume`. Probes observed verbatim refusals: `resume_meta_forbidden`, `resume_role_forbidden`,
  `resume_unknown_member`, `duplicate-marker invalid_spec`, `message_with_prompt`, `spawn_message_forbidden`;
  payload keys `[name,resume,member,item,message]` (no `agent`, no `task`).

## Unknown

`fleet-dispatcher` `splitGodspeedEnvelope` body (cited, not read); runtime resume-revalidation paths
(require registry writes — out of a read-only lane); no published evidence registry carries a chained
resume row with non-null inherited axes.

## Caveat

`run-logic.md` numeric anchors into the script are ~22-23 lines stale (cites :193/:218/:1110 vs actual
:215/:240/:1133); cite script anchors or prose, not run-logic line numbers.