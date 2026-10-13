---
name: shokunin
description: >
  Shokunin (職人) — mint domain-specialist agents and train them on a
  continual learning path (curation, quality gating, understanding, expanding
  perspective) on OMP and Devin CLI. Thin host binding over the canonical
  kimi-shokunin protocol. Triggers: "shokunin", "mint a specialist", "craft
  round", "train <id>", "teach <id>". Anti-trigger: general orchestration and
  any-problem planning are tower/ufo, not this skill.
metadata:
  axis_family: agents
  language: match-repo
  substrate: omp, devin
---

# `/shokunin` — host binding (OMP, Devin)

A shokunin is a domain specialist that earns its domain through demonstrated
craft and keeps learning: its corpus expands, the quality of what it holds
rises, and it recognizes quality increasingly well. This file only binds that
protocol to OMP and Devin; it adds no rules of its own.

## Canonical source — read it, don't re-memorize

The protocol lives in the kimi-shokunin checkout: `$SHOKUNIN_PLUGIN`, else
`~/Projects/kimi-shokunin`. Follow its load order on every activation:
`skills/shokunin/SKILL.md`, then `skills/shokunin/protocol/` — `PROTOCOL.md`,
`PROTOCOL-APPENDIX.md`, `MISSION.md`, `AXES.md`, `CORPUS.md`, `LEARNING.md`.
`protocol/` next to this file links there for callers that resolve it from
the skill directory. On process, gates, verdicts and the learning path the
canonical files win; on host mechanics this file wins. If the checkout is
missing, say so and stay advisory: plan, draft, review — never fabricate a
round, a verdict, or a spot-check.

The fleet root is `$SHOKUNIN_ROOT`, else `~/Projects/shokunin`: `MISSION.md`
copy, `shokunin.conf`, `MANIFEST.json`, `.ufo/`, and one git repo per lane at
`<id>-shokunin/`.

## Verbs

- `/shokunin` — one craft round on the lane whose repo is the cwd.
- `/shokunin mint <id> <domain>` — enforce the mint bar and roster scan
  (canonical §Lifecycle), then `scripts/mint-agent.sh --id <id> --domain
  "<domain>" --fleet-root "$SHOKUNIN_ROOT"` from the canonical checkout, and
  complete `MINT.md` with the real evidence. The script cannot supply it.
- `/shokunin round <id>` — dispatch one round for that lane (below) and judge
  it on its axis and on the three learning trends (`LEARNING.md`).
- `/shokunin teach <id> <lesson>` — write the operator's words verbatim to
  `<id>-shokunin/corpus/lessons/operator-<YYYY-MM-DD>-<slug>.md`, marked
  `author: operator`, and commit only that path. The lane must reflect it in
  `QUALITY.md` or `SKILL.md` by its next round.
- `/shokunin status` — roster, ranks, last round and its trend verdicts, open
  `.ufo/l0-questions.md` lines.

## Host mapping

| Canonical concept | OMP | Devin CLI |
| --- | --- | --- |
| In-session lane round | `task` with the filled `templates/round-prompt.md`, the lane repo as its only write scope | `run_subagent` (`subagent_general`) with the filled round prompt; name the lane repo's absolute path and require `workdir`/absolute paths |
| Headless `SUBSTRATE_CMD` (watchdog) | `omp -p --cwd "%C" "@%P"` | `cd "%C" && devin -p --prompt-file "%P"`; the permission mode is the operator's choice, never assumed |
| Non-author spot-check / promotion review | a fresh `task` the orchestrator dispatches | a fresh `run_subagent` the orchestrator dispatches (`ufo-reviewer` profile when installed) |
| Godspeed | `task` hook injects it | prepend `~/.agents/skills/godspeed/directive.md` bytes to each fresh task |
| Consulting a trained lane outside rounds | the operator promotes a card to `~/.omp/agent/agents/<id>-shokunin.md` (operator-owned; never written from here) | a profile `~/.config/devin/agents/<id>-shokunin.md`: frontmatter `name`, `description` (the lane `SKILL.md` description), no `model:`; body tells it to read the lane's `SKILL.md`, `PROVINCE.md`, `corpus/QUALITY.md` and relevant entries before answering, and to report candidate lessons rather than write the corpus |
| Model | operator's OMP routing; never pinned | profile default; never passed |

A consulted lane is advisory: corpus writes happen inside its own rounds, so
the lane identity, the gate, and the spot-check stay attached to every
admitted entry.

## Archive

The 26 UFO-internal keeper cards and corpora this skill minted on 2026-10-09
are archived under this repo's `archive/shokunin-2026-10-09/`; they are not
roster lanes and are not dispatched.
