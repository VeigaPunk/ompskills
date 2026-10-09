# sessions-transcripts — Mining sessions/<id>/ transcripts

Source: r1 lane `SessionsTranscripts` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

What sessions/<id>/ holds and exact jq recipes.

## Observed

- Layout: `sessions/<id>/<ISO>_<uuid>.jsonl` (L1) + same-stem dir with `__advisor.jsonl`, one `<Lane>.jsonl` (with `session.parentSession` = absolute L1 jsonl path) and `<Lane>.md` (JSON payload despite `.md`) per spawned lane, and `N.bash.log`/`N.eval.log` spills (N ≠ toolCall ordinal).
- Record types: `message` (user/assistant/toolResult), `custom` (`tool_execution_start`, `session_exit`…), `custom_message` (`async-result`), `session`, `model_change`, `thinking_level_change`, `title`.
- shokunin/mission-keeper: 255 records, 05:12:39.839Z → 14:33:16.375Z, `session_exit` `{reason:"sighup",kind:"signal"}`; first user message = rendered prompt (12,734 chars); 89 toolCalls, **0 `task`** — dispatch was `eval` cells calling `tool.task` (24 + 1 `CardProbe` = 25 lane files).
- Recipes: start/end `jq -r '.timestamp // empty' F | sed -n '1p;$p'`; tool histogram `jq -r 'select(.type=="message" and .message.role=="assistant")|.message.content[]?|select(.type=="toolCall")|.name' F | sort | uniq -c`; dispatch cells: toolCall `name=="eval"` with `.arguments.code` containing `tool.task` (use `.arguments`, not `.args`); completions `jq -r 'select(.customType=="async-result")|.content' F | grep -o '<task-result id="[^"]*" agent="[^"]*" status="[^"]*"'`; exit `jq -c 'select(.customType=="session_exit")' F`.
- Spawn result text is truncated at 768 bytes/line; union with sibling filenames for the full lane list.

## Unknowns

- Only mission-keeper's session mined in depth.
