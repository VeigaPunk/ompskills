# Round-2 falsification — corrections ledger

**Asked.** Round 2 re-derived the 26 round-1 entries from primary sources
(16 read-only lanes; card-contract audit = ALL_CONFIRM, 0 violations) and
recorded every refuted/overstated claim, wrong anchor, and missing caveat.

**Observed.** No round-1 entry was rewritten (the corpus is append-only). This
ledger is the correction channel: each row names the target entry, the verdict,
and the corrected fact. Verified anchors below were re-checked by the L1 with
`grep -n` on the current `host/apply.mjs` (1041 lines) and `host/omp-agent.config.yml`
(491 lines).

## Load-bearing corrections (REFUTE / overstated)

| target entry | verdict | corrected fact |
| ------------ | ------- | -------------- |
| `resolver-gate` | **REFUTE** | The L617 wave-CLI-probe leg does **not** read `UFO_OMP_GLOBAL_CONFIG_PATH`: `ufo-swarm-wave.mjs` and its import graph have no reader (it reads `UFO_PROJECT_ROOT` L123 and `UFO_CONFIG_PATH` L136); its only global-config path is reached under `--route-probe`/`--route-families`, which apply never passes. Only the L714 `--check` leg reads it (`sync-global-routing.mjs:328`). |
| `resolver-gate` | **REFUTE** | Refusal-code list incomplete: `ambiguous` is reachable from `readGlobalSeatRouting` (`yamlBlock:129-131`, `parseSimpleMap:292`, `parseFallbackChains:406`). It never surfaces in apply only because gate 1 pre-rejects duplicate sections. |
| `credential-screen` | **REFUTE** | "nothing file- or subprocess-derived is printed unredacted" is false. Raw `say`/`ok` sinks at `apply.mjs:396, 789, 791, 804, 634` print unfiltered; the delta and `ufo.json` are never credential-screened (only the candidate is, preflight L214–216). Observed: `ok   l1Alias "m_strong token=LEAKME" is bare and nonempty` on a `/tmp` run. |
| `substrate-mirror-script` | **REFUTE** | The referent "the readme's six-field summary" does not exist (no such readme anywhere reachable). The **seven**-key seat shape `{alias, chainKey, requested, resolved, effort, family, fallbackChain}` is confirmed four ways (`sync:256-264/277-285`, render probe, `sync-ufo-contracts.mjs:758`, `build.rs:243-244`). |
| `dispatch-delta-bounds` | overstated | "gate 3 is strictly stricter" holds for positivity/non-inversion/cap only — for `swarm.minLanes` gate 3 is strictly **weaker** (the F2 hole). |
| `host-apply-surface`, `plan-print-deferred` | overstated | "writes exactly two files" is the net-new-file framing; a run also writes a timestamped `.bak` (`backupFile:842-849`) and a transient `.tmp` (`writeAtomic:853-863`, removed on failure). |
| `mirror-drift-report` | overstated | "Steps 1–6 are the authoritative gates" — the source names steps **2–5** (`apply.mjs:755-758`); 1–6 is behaviorally right (every `fail()` sits in 1–6) but not source-carried. A reworded child string lands in the explicit else-WARN (`:753-758`), so the downgrade is visible, not silent. |
| `wave-band-edges` | overstated | "101 proves cap ≤ 101" — the hard clamp `min(policy.maxLanes, MAX_SWARM_LANES)` (`ufo-mission-result.mjs:790-791` + `apply.mjs:386`) means it proves cap ≤ 100 regardless of the delta. |
| `config-parser-dialect` | overstated | R1 "bare" is too strong: quoted header spellings (`"modelRoles":`) load by design (L124 / apply L204). The enforced property is column-0 + exactly-one + nothing-after-colon. The echo defect's reachable site is `resolveSeatFromMaps:524`; `:529` is a dead branch. |
| `install-config-path` | overstated | the "same-millisecond backup tag collision" risk is overstated — the two per-run backups have distinct targets, so identical stamps cannot self-collide (needs clock rollback or a concurrent same-target apply). |
| `dispatch-merge-edits` | overstated | the `byte 3952` rewrite bullet came from a **private probe** with `oldMin=100`, unreachable from the shipped call site (which passes the live `waveMinLanes`); mark it as not-from-shipped. The note-rewrite comment is L333–335 and its OLD-floor claim is **TRUE** — only the ceiling is wrong. |
| `compile-gate-rule` | overstated | the empty-chain over-rejection is **latent**: 0/14 seats carries an empty `fallbackChain` today. |

## Anchor corrections

| target entry | wrong | correct |
| ------------ | ----- | ------- |
| `host-apply-surface` | `parseArgs` L157–L178; defaults L159/L160/L164/L165 | `parseArgs` **L155–L179**; `apply:false` **L157**, `ufoRoot` **L158**, `ufoJson:null` **L162**, `installTarget` **L163** (flag-loop anchors were already exact) |
| `config-model-roles` | "492 lines" | **491** lines |
| `config-agent-overrides` | `MIRROR_SEATS` apply.mjs:77-81; delta `waveMinLanes` line 8 | `MIRROR_SEATS` **apply.mjs:79-83** (const L79, names L80–82, close L83); delta `waveMinLanes` is **line 9** (line 8 is `minLanes`) |
| `dispatch-delta-bounds`, `dispatch-merge-edits` | walk `:287-320` | `planDispatchEdits` L287–320 with the walk call at **L318** |
| `dispatch-merge-edits` | `planNoteRewrite` L332–349 | **L336–349** |
| `dispatch-delta-file` | `loadSwarmPolicy` `:2470-2530` | **`:2431-2530`** |
| `merge-dispatch-path` | `backupFile` L930 | **L936** |
| `compile-gate-rule` | `generate()` L146–181; `extract_omp_chains` called L171; requested-list L523 | `generate()` **L151–174**; called at **L168**; requested-list at **apply.mjs:521** |
| `substrate-compile-gate` | function ends | `validate_chain` **493–509**, `validate_generated_graph` **519–583**, `validate_routing_mirror` **279–312**, `validate_mirror_step` **321–369**, `parse_route`/`reject_gemini` **412–486**, `generate` **151–174** |
| `substrate-resolver` | openSync L79; non-scalar guard L247-250; apply import L233 | `openSync` **L78**; guard **L246–248**; import **L232**; ends drift (readBoundedFile→114, yamlBlock→149, parseFallbackChains→455, readGlobalSeatRouting→596, resolveSeatRouting→514) |
| `wave-band-gate` | purpose comment L580-587; finally L695-697; pre-apply comment L72-75 | purpose **L581–587**; finally **L693–695**; plannerEnv body ends **L595**; pre-apply comment **L72–74** |
| `wave-band-edges` | `admittedAt(16)` L680 | **L678** |
| `deferred-artifacts` | header directive L11-17; not-touched L808-813 | header **L12–17**; not-touched **L808–811** |
| `plan-print-deferred` | no-note branch L795-806 | **L796–801** |
| `install-config-path` | clobber msg L845; default 0o600 at L878 | msg **L844**; the 0o600 default is the ternary at **L872** |
| `substrate-wave-planner` | clamp at L2415 | `MAX_SWARM_LANES` is L2415; the tighten-only clamp is **L2469** |
| `config-fallback-chains` | "L425-428" | phrase spans **L427–429** |
| `verify-recipe` | verdict L1003-1012 | block; exact ok strings at **L1004–1007** |
| `config-parser-dialect` / `configured` | "no test pins" hazard comment L416 | hazard prose is **L408–412** |

## Missing caveats

- `dispatch-delta-bounds` / `dispatch-delta-file`: the "exactly once file-wide" matcher
  (`apply.mjs:303-306`) runs only for **changed** leaves; all six are unchanged, so
  the dry run does not exercise it.
- `dispatch-merge-edits`: an array-valued delta leaf aborts (`String(value)`);
  a `swarm.note` delta is unwritable (`note` matches 8 lines file-wide); an identity
  rewrite (`from == to` when `oldMin == newMin`) is counted as a note rewrite.
- `install-config-path` (asymmetry): only `installTarget` gets the symlink guard — the
  `ufo.json` sink is read (`L363`), backed up (`copyFileSync` follows symlinks, `L845`),
  and renamed onto with **no** symlink check (`L936–938`); a directory target fails with
  a raw `copyFileSync` error (no tailored refusal).
- `substrate-compile-gate`: `l1Context.minimumTokens` is compared as the **string**
  `"1000000"`; and the converse single-sync (only `contracts:sync`) also fails the build.
- `credential-screen`: `containsCredentialShape` is defined in
  `crates/ufo-core-runtime/src/native_admission_text.rs:18-40` (re-exported via
  `src/native.rs:629`); `SENSITIVE_LITERAL_RE` is `api[_-]?key=` with the `/i` flag; the
  banner `say()` lines (`L946–949`) interpolate argv-derived opts.
- `dispatch-delta-file`: consumers should add `fleet-dispatcher.mjs:3753`
  (`validateMissionFormat(dispatch.missionFormat)`).
- `wave-band-edges`: `postPolicy` also spreads `declaredMaxLanes`/`hardCeiling` (inert
  to `planSwarmWave`); `config-fallback-chains`: the dry run prints hops grouped per
  seat, not `m_strong chain 9 hop(s)` verbatim.

## Disclosures (ambient side effects, corrected)

- Node runs here append to the substrate's `NODE_COMPILE_CACHE`
  (`/home/vgpnk/Projects/ufo-fsd-alpha/.ufo/cache/node-compile`) — a runtime cache, not
  tracked config; every primary hash/mtime was verified unchanged.
- One round-2 lane ran `omp agents unpack`, which briefly wrote
  `security-reviewer.md`/`sonic.md`/`task.md` into `~/.omp/agent/agents/`; the lane
  deleted them and restored the directory to its 13 entries.

**Net.** Every round-1 load-bearing conclusion survived independent re-derivation
(F1, F2, F5, the tautological alias check, the over-rejection, the unbounded
`minLanes`, the gate-6 mutation survivors, the doc-defects, the credential echo).
The corrections above are anchors, overstated wording, and missing caveats — plus
one real overreach (the credential-screen "unredacted" guarantee), now scoped.

**Added.** 2026-10-09 · mission `host-smith` round 2 (16 lanes)