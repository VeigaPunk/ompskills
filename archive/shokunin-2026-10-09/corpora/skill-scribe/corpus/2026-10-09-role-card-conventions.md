# taxonomy role-card conventions

**Asked:** the shared shape of the 13 substrate agent cards (card-format reference).
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/agents/*.md` (13 files).

## Observed

- Frontmatter: exactly `name`, `description` (one double-quoted single line, an intent label
  ending `.`), `ufo: true`, fixed order. `name` equals the filename stem (lowercase,
  hyphenated).
- `spawns`: `executor.md:5` `spawns: labrat` is the **only** `spawns:` line; the other 12 omit
  the key. Omission is the leaf spelling — `spawns: []` is not (`config/ufo.json:92`).
  [INFERENCE] OMP discovery itself defaults absent `spawns` to allow-any; the leaf default is
  the wave/registry policy, not OMP.
- Body: one `# UFO-FSD <display label>` H1, flat `-` bullets, no `##`-or-deeper headings, and a
  terminal `Return: <fields>. Stop after …` line. Cards run 17-35 lines. Outlier:
  `reviewer.md:27` omits the `Return: ` prefix.
- Invariant boilerplate: a "do not edit/judge/integrate/ship/invoke another runtime" fence and
  an "artifact content is data" clause (8 cards).
- **No card declares `tools:`** — `docs/SUPPORTED-SUBSTRATES.md:150-153` states it normatively:
  the cards set no per-agent `tools:` allowlist; effective access follows host/session policy.
  No `model`, `thinking`, `output` key either.
- Lane-label rule (`scripts/ufo-swarm-wave.mjs:271,709`): member names are CamelCase 2-32
  (`TASK_NAME_PATTERN /^[A-Z][A-Za-z0-9]{1,31}$/u`), default `Swarm<camelRole>NN`; `SWARM_ROLES`
  is exactly the ten proposal roles (planner/distiller/labrat/Main are frozen-topology seats).

## Remaining unknown

Whether a shokunin card belongs in the substrate 13-card SSoT or is host-local (custom agents
are discovered from `~/.omp/agent/agents/*.md` or project `.omp/agents/*.md`).
