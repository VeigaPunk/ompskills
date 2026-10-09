# 2026-10-09 — branch naming: tower/<fleet>/<id> and the lane sibling

**Asked.** Verify the branch-naming contract across the tower skill, the L1 prompt, and the launcher; check the "child ref cannot exist" claim against git.
**Sources.** `.omp/skills/tower/SKILL.md:142-143`; `sighting/tower-fleet.mjs:92-93` (`FLEET_PATTERN`/`MISSION_ID_PATTERN`), :348-351, :597-617 (exact string :610), :644, :742, :805-811; `sighting/l1-prompt.md:150-157,134`; `test/tower-fleet.test.mjs:286`.
**Observed.**
- Mission branch = `tower/<fleet>/<id>` (launcher `buildPlan` :610 ``tower/${spec.fleet}/${mission.id}``; used at :644, :742, and the creation argv :805-811). `FLEET_PATTERN`/`MISSION_ID_PATTERN` forbid `/` (enforced :348-351), so the mission ref is always exactly 3 components with `<id>` a leaf.
- Lane branch = `tower/<fleet>/<missionId>-<lane>` (l1-prompt.md:151-154), a hyphen-suffixed **sibling** of the mission branch; integration takes a writer lane's change via `git checkout <lane-branch> -- <paths>` (:134). `<lane>` is instruction-text only, not launcher-validated.
- Git ref rule verified empirically (git 2.55.0): `tower/x/y` and `tower/x/y/z` each pass `git check-ref-format` yet cannot coexist — creating the child after the parent fails `fatal: cannot lock ref 'refs/heads/tower/x/y/z': 'refs/heads/tower/x/y' exists`, exit 128; the refusal is structural (refs are a file hierarchy), survives `pack-refs` and the reftable backend, and is order-independent. The hyphen sibling `tower/x/y-lane` coexists. → the l1-prompt claim "a child ref under that one cannot exist" is TRUE, and `tower/<fleet>/<id>-<lane>` is exactly the legal sibling shape.
- Live conformance: 37 `refs/heads/tower/*` refs, all exactly `tower/<fleet>/<id>`; every `.tower/worktrees/<fleet>/<id>` pairs with `[tower/<fleet>/<id>]`. No lane-shaped branch exists in production yet ([INFERENCE]: no writer lane has run). Outliers: `tower/f/m1` (no matching spec, likely a manual probe) and worktree `shokunin2/probe1` on bare branch `probe1`.
**Changed.** Seed entry.
**Unknown.** `omp worktree add`'s own `-b` name validation (compiled binary; git-level refusal proven, omp envelope not — see the add-argv entry); a runtime L1-chosen `<lane>` could violate `check-ref-format` lexical rules (leading dot, `.lock`) — no source pins lane-name validation.

**Lane.** TowerBranchNaming (reviewer). Report: `reports/worktree-keeper/TowerBranchNaming.md`.
