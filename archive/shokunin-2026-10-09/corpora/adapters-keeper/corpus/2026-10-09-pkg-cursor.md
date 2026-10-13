# pkg-cursor — packages/cursor

Asked: inventory + role of packages/cursor.
Source: lane CursorPkg (`reports/adapters-keeper/CursorPkg.md`).

## Observed

- 32 files: skills/ufo (6) + wwkd (2) flat mirror + agents/ (13, byte-identical
  canonical, parity-only — README.md:31-33: not runtime input) + ssot directive +
  `README.md` + **`packages/cursor/.cursor/`** (9 files: the cursor-native target —
  `.cursor/skills/ufo` + wwkd/ssot dep closure). No ufo-skill-scope.json (cursor is
  not a charterlist slot).
- `packages/cursor/.cursor/skills/ufo` is the **seated runtime skill**
  (substrates/cursor/substrate.json skills[0]); the flat `packages/cursor/skills/ufo`
  has no runtime consumer — a parity mirror only.
- Sync wiring: skillTargets.cursor (flat) + skillTargets."cursor-native" (:89-103),
  agentTargets.cursor (:169-174), supportedSubstrates (:200). No cursor-specific npm
  script; runtime delegate is substrates/cursor/bin/cli.mjs → lane-cli + seat-skills.
- `sync --check` at anchor: no cursor-path failures.
- Not automaticSubstrate (omp), not runnerUpSubstrate (devin); native-surface, local.

## Contract

Cursor is the two-root adapter: flat parity tree **and** a host-native `.cursor/`
subtree — only cursor and devin carry a native-dir variant, and cursor's is tracked.

## Unknowns

- Repo-root `.cursor/rules/godspeed-always.mdc` is authored, no sync gate covers it.
- Live cursor-agent behavior unrun; external Cursor rules format from one source.
