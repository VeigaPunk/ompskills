# skills-tree-mirrors — the skills/ tree, its mirrors, and the drift chain

Asked: the `skills/` tree, each skill's authority claim, the mirror sets, and the hash check.
Source: lane SkillsTree report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- `skills/` = 16 files: `ufo/` (`SKILL.md` 600 ln, `references/run-logic.md` 2549 ln,
  `references/CHANGELOG.md` 2655 ln, `references/godspeed-core/{directive,filter,velocity}.md`),
  `godspeed/` (`SKILL.md` 28 ln + `directive.md`), `godspeed-core/` (5 files incl. `always-on.md`),
  `wwkd/` (`SKILL.md` 232 ln + `SHA256SUMS`), `SHA256SUMS` (15 lines).
- Hash checks: `sha256sum -c SHA256SUMS` from `skills/` → exit 0, 15/15 OK (the file is
  skills-relative by design; run from the repo root it fails); `wwkd/SHA256SUMS` → exit 0.
  `skills/SHA256SUMS` is sync-generated and excludes itself (`sync-ufo-contracts.mjs:1085-1097`).
- Mirrors: `ufo/SKILL.md` `4708d14d…` byte-identical across the 7 package roots
  (substrate-omp, kimi, codex, cursor, opencode, grok, devin) + `.omp`, `.cursor`, cursor-native,
  contract-asset targets (12 tracked clones); `run-logic.md` `ed880f02…` ×11; `wwkd/SKILL.md`
  `4015a0f4…` ×14 incl. the crate bundle; 5 generated `ufo-skill-scope.json` tags
  (omp, opencode, codex, grok, kimi) — `README.md:35-37`, `cliFamilyScopes` `sync:178-199`.
- Live check verdict: `node scripts/sync-ufo-contracts.mjs --check` exits **1** at this checkout —
  `skillsSums`/`packageScopes`/`charterlist`/`projection` OK; drift limited to
  `bundled/omp-seat-routing.json` + `bundled/config.json` (host routes mismatch, sighting surface
  digest mismatch) and the 18 uncreated, untracked-but-not-gitignored `.devin`/`packages/devin/.devin`
  native targets — **zero drift on any tracked ufo/wwkd mirror**.
- `wwkd` role: planner-stance enrichment; `run-logic §5` (`:946`) is normative, absence never blocks
  activation, drift resolves in §5's favor (I9), not a gate (`ufo/SKILL.md:52-56`, `AGENTS.md:13-15`).
- Shims: the substrate's `.omp/skills` = `{swarm, tower, ufo, wwkd}` — `ufo`+`wwkd` are sync-generated
  mirrors, `swarm` (`1d6162bc…`) and `tower` (`7af92fb5…`) are hand-authored OMP-only shortcuts
  outside all mirror sets. The ompskills worktree's `.omp/skills` = `{shokunin, swarm, tower}`;
  its `swarm`/`tower` (`b4279d35…`/`6845c00e…`) **diverge** from the substrate's same-named shims —
  no cross-repo check exists.

## Contract

| skill | files | authority claim | mirror set | hash check |
| --- | --- | --- | --- | --- |
| `skills/ufo/` | 6 | guidance/semantic source of truth (`AGENTS.md:3-5`, `README.md:34-35`); run-logic = the single language-neutral runtime contract | 12 SKILL.md clones + 11 run-logic clones + 5 scope tags + per-package dep closure | exit 0, 15/15 OK |
| `skills/godspeed/` | 2 | posture loader; directive load order item 1; the `.cursor` SKILL.md copy is a **hand variant** (missing the Envelope-marker section), not a mirror | `directive.md` only (6+ channels) | directive `db88963c…` identical everywhere |
| `skills/godspeed-core/` | 5 | posture explainer; "which files any seat may open is host policy" (`:33-36`); filter/velocity judge-only | directive rides sync; filter/velocity pinned by `skills/SHA256SUMS` only | OK |
| `skills/wwkd/` | 2 | planner stance; run-logic §5 normative; absence never blocks | dep-closure `<pkgroot>/skills/wwkd/**` for 13 targets + crate bundle | exit 0; 14 byte-identical copies |
| `skills/SHA256SUMS` | 1 | generated, never hand-maintained; must cover every regular file under `skills/` except itself | checked byte-exact in `--check` | reproduced exit 0 |

Enforcement chain: `npm run contracts:check` (`package.json:26`) → `sync-ufo-contracts.mjs --check`
(byte-compare 193 copies, fail-closed missing/drifted `:1658`, exit 1 `:2273`) → `gates.sh:734/:887`
("canonical contract mirrors") → seat `doctor`/`selfcheck` digest equality
(`packages/substrate-runtime/src/seat-skills.mjs`, `lane-cli.mjs:121-177`) → runtime binding
(`NATIVE_CONTRACT_FILES` `native_contract.rs:47-53`; `PROJECT_OMP_MIRRORS` `:118-160` byte-compares
19 `.omp` pairs; `ufo-deps.lock` pins run-logic/directive/wwkd bytes). Precedence: canonical guidance
beats generated mirrors; disagreement halts (I9); checked mirrors and generated projections are not
independent authorities (`README.md:126-131`).

## Not carried by the source

- No cross-repo mirror check between ufo-fsd-alpha and ompskills. `skills/godspeed/SKILL.md` and
  `skills/godspeed-core/{always-on.md,README.md}` have no byte-mirror obligation. README's
  "seven CLI-family package roots" sentence covers only `packages/<seat>/skills/ufo` — the
  authoritative set is `skillTargets`, not the prose. No gate carries the skills tree onto published
  registry packages. `--check` does not verify the cursor godspeed SKILL.md variant.

## Unknowns

- Whether the missing `.devin/**` native targets are expected build-time generation or a committed
  oversight at `5ace2559` (sync without `--check` would create them; not run — it writes).
- The provenance/direction of the two filter/velocity lineages (skills-side `09957d…`/`349243…` vs
  ssot-side `ddfabd…`/`dbd37a…`): nothing states the relationship, only that each is independently pinned.