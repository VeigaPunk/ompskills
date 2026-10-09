# item-kind-spawn-vs-resume — how a lane is classified and which keys each kind refuses

Asked: spawn vs resume lane classification inside the item loop.
Source: `scripts/ufo-swarm-wave.mjs:889, 875-975, 699-737, 1108-1143`. Lane: `ItemKindSplit`.

Discriminator (`:889`): `const isResume = raw.resume !== undefined && raw.resume !== null;`
— `resume: null` is absent, so the item falls through to the **spawn** arm.

| item key | spawn | resume | refusal code |
| --- | --- | --- | --- |
| `role` | required, must be in `SWARM_ROLES` | forbidden — the guard is `!== undefined`, so **`role: null` refuses too** (unlike `item`/`axes`/`milestone`) | `role_required` `:935`, `unknown_role` `:938` / `resume_role_forbidden` `:892-893` |
| `item` | optional partition label; required iff `spec.template` | forbidden | `item_required` `:951` / `resume_item_forbidden` `:896` |
| `prompt` | lane text; forbidden with `spec.template` | alias of `message` | `prompt_with_template` `:947` / `message_with_prompt` `:912` |
| `message` | forbidden (guard is `!== undefined`, so `message: null` refuses too) | lane text | `spawn_message_forbidden` `:932` / `message_with_prompt` `:912` |
| `axes` | optional metadata | forbidden | `invalid_spec` `:724-733` / `resume_meta_forbidden` `:902` |
| `milestone` | optional metadata | forbidden | `invalid_spec` `:736` / `resume_meta_forbidden` `:905` |
| `name` | optional; else minted | optional; else minted | `invalid_name` `:709` |
| `resume` | absent/null | present non-null handle | `invalid_resume_id` `:701` |

- Resume value source: `raw.message ?? raw.prompt` (`:919`); the diagnostic labels
  the key the input actually carried (`:920-921`) — a resume may not set both.
- Spawn text source: `text = prompt ?? item` (`:969`); `prompt` wins, and `item`
  survives as the lane's registry partition label.
- Resume default text when no message: `"Continue your assigned work and report
  the outcome."` (`:1128`), then the marker-aware report suffix is appended.

## Not carried by the source

- A resume lane cannot carry a new `role`, so a resume never mints a replacement
  identity — that is the I6 rule, enforced by refusal not by silent inheritance.
- No ordering gate: a resume lane may be `items[0]` (observed: mixed wave with the
  resume first, `counts {spawn:16, resume:1, total:17}`).

## Unknowns

- The intent behind one label edge: `{message: null, prompt: "x"}` on a resume is a
  present-valued `message`, so the diagnostic says `items[N].message` even though
  the value came from `prompt` (`:921`).
- A resume lane combined with `spec.template` was read from source (resume branch
  returns before the template block), not probed.
