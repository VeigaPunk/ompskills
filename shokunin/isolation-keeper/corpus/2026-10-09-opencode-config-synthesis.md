# opencode-config-synthesis — the emitted OpenCode config and its disables

Asked: quote what the synthesized OpenCode config contains and omits, and prove
the no-model-key guarantee. Source: `scripts/prepare-ephemeral-l1.mjs:420-535`;
`config/ephemeral-l1.machine.json:9-13,25-29`;
`docs/EPHEMERAL-L1-MISSIONS.md:55-60`. Lane `OpenCodeSynth` (scout).

Emitted config `opencode.json` (`prepareOpenCode` :524-534) verbatim:

```js
const config = {
  $schema: "https://opencode.ai/config.json",
  autoupdate: false,
  plugin: [],
  permission: { external_directory: "deny" },
  agent: { general: { disable: true }, explore: { disable: true } },
};
```

Emitted keys: `$schema` (:525), `autoupdate:false` (:526), `plugin:[]` (:527),
`permission.external_directory:"deny"` (:528), `agent.general.disable` (:530),
`agent.explore.disable` (:531). **Omitted**: any `model` key, any other agent
entry, any provider/credential key.

No-model-key proof: the literal above has no `model` field; `grep -n model
scripts/prepare-ephemeral-l1.mjs` → no match; the policy `exactKeys`
allow-lists (106-109, 163-165) reject a `model` field; `tests/prepare-ephemeral-l1
.test.js:109` asserts `Object.hasOwn(policy,"model") === false`; the doc at :54
states the isolated product resolves its own default. So there is no project
model pin.

`${scope}: `synthesizeAgent`` (:428-440) writes frontmatter
`description`, `mode`, `permission: {"*": allow, external_directory: deny}` — and
no model line. `stripFrontmatter` (:420-426) matches LF **or** CRLF delimiters.

Primary synthesis: `opencode.primarySource = skills/ufo/SKILL.md` (:473) →
`agents/ufo.md`, `mode: primary`. Subagents: `readdirSync(agents)` filtered by
`^[a-z0-9][a-z0-9-]*\.md$` (:495), `ufo.md` skipped (:503), `xbgst`/`xbreed`
refused (:504) → `agents/<name>.md`, `mode: subagent`.

The disable carriers split: `autoupdate`/`plugin:[]`/agent-disable are **config
file** keys; `OPENCODE_DISABLE_AUTOUPDATE|DEFAULT_PLUGINS|EXTERNAL_SKILLS` are
**policy env flags** (machine config:25-29, spread at prepare:709). "No
global-agent fallback" is only shown for the **synthesis** (only two source
roots read, :473/:489; env redirected into isolation) — the product's runtime
behavior behind the flags is not asserted by any source line.

Consumer note: `ufo-sighting.mjs` + lib do **not** read `opencode.json` or the
`opencode.*` policy keys (grep: no matches); the config is consumed by the
external OpenCode product. Only `environment.json` is consumed (plus the
`OPENCODE_DB` symlink check at sighting:70-75).

## Unknowns

- The product's actual default-model resolution and flag honoring (not executed).