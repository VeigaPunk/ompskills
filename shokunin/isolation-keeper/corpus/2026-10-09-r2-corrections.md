# r2-corrections — round-2 falsification ledger, every corrected claim

Round 2 ran 24 adversarial lanes (`isolation-keeper-r2-w1`) over the card and the
corpus. Verdicts: the substantive contract **survives** (139 anchors re-derived,
0 FALSE on the source contract; both objective gates re-passed 41/41 and 4/4).
The corrections below are claims that were **false, drifted, or overbroad as
written** and were fixed in place. Each row names the verifier lane.

| # | claim as written | verdict | correction | lane |
| --- | --- | --- | --- | --- |
| 1 | "A twin of an ephemeral mission is refused outright (`OMP_EPHEMERAL_TWIN_UNSAFE`, 3908)" | FALSE | 3908 is an **OMP**-argv guard ("an OMP twin requires durable independent session state"); `twinMission` builds the row **without** `environment`, so a twin bypasses the marker gate and the bwrap sandbox — a gap, not a guard | CardLaunch |
| 2 | "an ephemeral root is single-pane by construction" | FALSE | single-pane is a property of the `--env-file` launch; a plain `launch --cwd <root>/checkout` takes the non-ephemeral path | CardLaunch |
| 3 | "the ambient `/run/user/<uid>` (a tmux socket)" | FALSE | no tmux socket under `/run/user`; the socket is `/tmp/tmux-<uid>/default`, and `--dir /tmp` is emitted only when a destination is under `/tmp` (not with the shipped `/scratch` root) | CardLaunch |
| 4 | "Those strands have **no recovery path**" | FALSE (overclaim) | while the marker carries the expected identity both destroy paths refuse; remove the marker and `destroy --force true` recovers via the layout arm (live-reproduced) | CardResiduals |
| 5 | "Every write is `O_EXCL|O_NOFOLLOW`, `flush:true`, then `chmod`; every directory is `ensurePrivateDirectory`" | FALSE | the auth copy is `COPYFILE_EXCL`; several writes have no trailing chmod; the mission-root and untracked-parent `mkdirSync` bypass `ensurePrivateDirectory` | OverclaimHunt |
| 6 | "the source is never mutated" | FALSE (narrow) | no worktree file/ref/object is modified, but git's stat-cache refresh can rewrite `.git/index` metadata | OverclaimHunt |
| 7 | "41 tests, all under `mkdtempSync(tmpdir())`" | FALSE | 38 of 41 use the fixture (3 do not) | OverclaimHunt |
| 8 | "sandbox/opencode refusals quoted verbatim in the corpus" | FALSE | those two are summarized as variants; the marker/exact-key/git-config/symlink/mission-exists messages are verbatim | OverclaimHunt |
| 9 | "the digest's consumer is the marker alone" | DRIFTED | destroy's return also carries it | OverclaimHunt |
| 10 | "a missing/unparseable `.git/config` fails closed" | FALSE | the guard runs `--local --list` with `allowStatus [0,1]` and reads stdout only; a malformed config passed a `/tmp` probe (the later `rev-parse` fails) | CorpusPolicyGit |
| 11 | "`removeCloneRemotes` sweeps `^remote\.` and `^branch\.`; a survivor throws" | FALSE (imprecise) | `^remote\.` throws on a survivor; `^branch\.` keys are `--unset-all`'d; the union sweep throws | CardCreate |
| 12 | "requires byte-identity with the registered mission" | DRIFTED | `JSON.stringify` structural equality — whitespace-insensitive, key-order-sensitive | CardLaunch |
| 13 | "the mount target must be the realpath of `resolverSource`" | DRIFTED | one-hop `path.resolve(dirname, readlink)`, not `realpathSync` | CardLaunch, CorpusDigestLayout |
| 14 | "`runPane` (4336-4400)" | DRIFTED | 4336-4397 | CardLaunch |
| 15 | "`validateStoredEnvironment` (31-81)" | DRIFTED | 32-82 | CardEnv |
| 16 | "`OPENCODE_DB` may be absent but must not be a symlink" | under-specified | when present it must also be a regular owner-only file | CardEnv |
| 17 | "`active` … no `allowedMarkerStates` set" | FALSE as written | `active` is admitted by no set, but the pane loads with `["registered"]` at 4353 before transitioning | CardMarker |
| 18 | "`INVALID_ARGUMENT`" in the env/marker/sandbox code list | overbroad | it is a CLI-argument code; raw ENOENT/SyntaxError is prepare-side only | CardRefusals |
| 19 | "two tranche cards deviate by an extra `## <name>` title" | FALSE | those lines are H1 titles; all nine cards carry one; the SKILL has no title rule | CardContractConformance |
| 20 | "Cards that add a fourth `##` section (e.g. mission-keeper's)" | FALSE | mission-keeper has exactly three `##`; no card has a fourth | CardContractConformance |
| 21 | "`ufo-fsd-alpha@87c351a`-era HEAD" | FALSE | 87c351a is an ompskills commit, not an object in the substrate; HEAD is `5ace2559` | CardSources, CardEnv |
| 22 | "963 lines" (prepare) | DRIFTED | 962 by `wc -l`; the index's `ufo-sighting` count uses the same convention | CardSources, CorpusIndexIntegrity |
| 23 | "the resolver is bound in precisely because the network is intended" | DRIFTED | the source states no intent; the binding is *consistent with* network being intended | CorpusDigestLayout |
| 24 | "`snapshotDigest` lands only in the marker field" | DRIFTED | destroy's return also carries it | CorpusDigestLayout |
| 25 | "the corpus index was appended as entries landed" | FALSE (process) | the index was authored as a complete plan before the entries existed (mtime evidence); the append-only *content* rule still holds | CorpusIndexIntegrity |
| 26 | 18 anchor ranges off by 1-2 (`assertSourceGitConfigSafe` 227-244→227-241, `copyUntrackedEntry` 307-380→307-373, `createEphemeralL1` 659-752→659-754, `readEphemeralPolicy` 207-245→209-237, `launchMission` ~2388→2372, `buildEphemeralSandboxDispatch` 4193-4288→4193-4289, `assertEnvironmentObject`/`assertExactKeys` 332-343→331-343, plus corpus anchors) | DRIFTED | all corrected in place | AnchorDrift |

## What survived (re-derived, not re-asserted)

- All three file sha256 anchors; the config byte count; `rev-list --count HEAD` = 2.
- The snapshot pipeline order, the byte bounds, the symlink confinement, the
  remote/branch sweeps, the digest feed order and the 6 emitted fields.
- The 11-key environment map, the 3-key disk vs 4-key stored shape, the
  `maxEnvironmentBytes` bound, the no-credential claim.
- The bwrap argv order (reproduced by the real function), the policy-PATH
  resolution, `SANDBOX_UNAVAILABLE`, the no-prepend verdict, the cleared 25-key
  child environment, the resolver rules.
- The marker state machine, the destroy check order and tie-breakers, the force
  identity gate, the typed-vs-bare refusal split.
- Both objective gates: `prepare-ephemeral-l1.test.js` 41/41, the sighting
  ephemeral arms 4/4.

## Unknowns carried forward

- `87c351a` provenance (unresolvable in the shallow clone).
- Product-side OpenCode behavior behind the disable flags and the no-model
  default; bwrap's own flag semantics (never executed).
- Whether an external consumer parses prepare's stderr expecting a `code` field.