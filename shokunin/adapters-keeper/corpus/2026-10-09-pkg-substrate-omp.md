# pkg-substrate-omp — packages/substrate-omp (@ufo/substrate-omp-content)

Asked: inventory + role of packages/substrate-omp.
Source: lane SubstrateOmpPkg (`reports/adapters-keeper/SubstrateOmpPkg.md`).

## Observed

- Content-only private package `@ufo/substrate-omp-content` — NOT an npm workspace
  member (deliberate per docs/REPO-LAYOUT.md:105-112). 23 tracked files: byte-identical
  mirrors of skills/ufo (6), skills/wwkd (2), ssot directive, agents/ (13) + generated
  ufo-skill-scope.json. **Only package.json is hand-authored** (`files`:
  agents/skills/ssot/ufo-skill-scope.json).
- Sync wiring: skillTargets.omp, agentTargets.omp, cliFamilyScopes.omp,
  packagedDependencyMirrors; validator check-hand-authored-sets
  (`TARGET_PACKAGE omp→substrate-omp` :36) — exit 0 at anchor.
- The `.omp` host projection (`.omp/skills/ufo`, `.omp/agents`, `.omp/ssot`,
  `.omp/config.yml`) is generated from the same sources + config
  nativeProfiles.omp-native-v1. `.omp/hooks/pre/*.js` + `ufo-statusline.mjs` are
  **hand-authored and exist only under .omp/** — never in the package.
- automaticSubstrate='omp' enforced by build.rs:190-207 + sync:1357;
  runnerUpSubstrate=devin has validators only.
- **Naming hazard**: `substrates/omp` ships as `@ufo/substrate-omp` (the seat package)
  vs `packages/substrate-omp` = `@ufo/substrate-omp-content` — two packages sharing a
  name stem.

## Contract

The primary seat's adapter is a content package like the rest — its extra surfaces
(agents, scope tag, npm-shipped files list) come from omp being the automatic
substrate and a charterlist slot.

## Unknowns

- Host-side ~/.omp/agent/skills/ufo install parity (outside repo).
- Whether it should join the workspaces — recorded operator decision, not defect.
