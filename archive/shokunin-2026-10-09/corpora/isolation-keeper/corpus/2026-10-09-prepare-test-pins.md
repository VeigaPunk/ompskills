# prepare-test-pins — what `prepare-ephemeral-l1.test.js` pins

Asked: what the 41-test suite pins, what it leaves unpinned, and the real run.
Source: `tests/prepare-ephemeral-l1.test.js`. Lane `PrepareTestPins` (reviewer).

Real run: `node tests/prepare-ephemeral-l1.test.js` → exit 0, `tests 41 / pass 41
/ fail 0 / cancelled 0 / skipped 0 / todo 0`. Fixtures live under
`mkdtemp(TMPDIR)` (:36-40); the default policy root `/scratch/tmp/vgpnk/ufo/
ufo-ephemeral-l1` was absent before and after; 0 scratch leftovers. (In the
ambient shell `NODE_COMPILE_CACHE` points into the repo's gitignored `.ufo/cache`
— node runtime traffic, not suite code.)

Pinned groups:
- **policy parse** (10): schema/name, symlink refusal, 256 KiB bound, marker
  regex, env-bound floor (1023 refuse / 1024 accept), drift/shadow/PATH/NUL/name/
  basename refusals, no `model` field.
- **create layout + snapshot**: layout clone/isolation/env/marker; dirty +
  untracked + relative-symlink carried; ignored `.ufo` excluded; detached HEAD +
  empty remote; marker/env 0600, missionRoot 0700; flagVariables verbatim +
  pathVariables under isolationRoot + resolver snapshot byte-equal 0600;
  untracked mode fidelity 0664; staged add/delete overlay via `--index`; nested
  untracked parents 0700; content-addressed replay-stable digest; remote/upstream
  strip incl. exit-1 config probes; canonical agent emission + xbgst/xbreed
  refusals + `mode: primary/subagent` + `external_directory: deny` frontmatter.
- **create refusals**: 6 invalid ids zero-mutation; non-repo/subdir/worktree/
  symlink-root; escaping+absolute symlink targets; foreign uid; file-as-root;
  env bound; 32 MiB untracked bound inclusive; resolver oversize/empty/NUL;
  auth-file abs/basename/symlink/1 MiB; executable git hooks (`core.fsmonitor`,
  `uploadpack.packObjectsHook`); duplicate id.
- **destroy arms**: mismatch / one-direct-child / does-not-own / escaping /
  active / registered / unknown-state / invalid-pids / forged-schema /
  extra-fields / byte-bound / marker-symlink / owner-only refusals, then a
  finished destroys; foreign-uid root; per-member trust-chain mode refusals;
  widened root by name; kind refusals; provenance + env-symlink + `.git`-symlink
  refusals; symlink target; requires-target.
- **CLI**: `main()` error argv matrix; spawned entrypoint exit 2 with JSON
  stderr `.error`, incl. through a symlinked `argv[1]`.

Not pinned: the bwrap launch contract / sandbox argv; **no destroy `--force`
arm**; the CLI happy path; ufo-sighting consumption / marker transitions;
childEnvironment credential-nulling in the emitted environment; opencode.json
content (existence only); `OPENCODE_DB` existence only; `OPENCODE_DISABLE_*`
names never asserted literally; `activePids` liveness semantics; submodule
handling.

## Unknowns

- Whether `ufo-sighting.test.js` pins the unpinned gaps (see its entry).