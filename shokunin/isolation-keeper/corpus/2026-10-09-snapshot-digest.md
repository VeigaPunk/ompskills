# snapshot-digest — what the digest hashes, and what it does not

Asked: establish the digest's inputs, algorithm, label, and the create stdout
field set. Source: `scripts/prepare-ephemeral-l1.mjs:609-657,706-744`;
`docs/EPHEMERAL-L1-MISSIONS.md:29-34`; `tests/prepare-ephemeral-l1.test.js:336-342,
837-850`. Lane `SnapshotDigest` (reviewer).

Algorithm: `sha256` hex, 64 chars (`createHash("sha256")` :633,
`digest("hex")` :656). Label default `"ufo-ephemeral-l1-v1"` (:616); the L1
creator never overrides it (659-677). `prepare-ephemeral-fleet.mjs:235` uses
`"ufo-ephemeral-fleet-v1"` — the label is the hash-domain separator between the
two lineages.

Feed order (:633 + untracked loop):

1. `` `${digestLabel}\0${sourceHead}\0` `` — `sourceHead` is the trimmed
   `rev-parse --verify HEAD`.
2. the tracked binary diff buffer `git diff --binary <sourceHead>`
   (staged + unstaged; empty allowed).
3. per untracked entry, in `.sort()`ed decoded `-z` order: header
   `\0<safe>\0<mode & 0o7777>\0` (:314), then `symlink\0<target>` (:323) or
   `file\0<bytes.length>\0` + raw bytes (:361).

Not hashed: the raw `ls-files` bytes (only the after-the-fact stability check),
directory entries (only file/symlink accepted), clone config/`.git`, and the
environment/marker files. It attests the **source's file-state identity** — the
clone's index *is* staged by `apply --index`, so "not a staging-state capture"
refers to the source's own index split, not the clone.

Emitted create stdout (exactly 6 fields, :739-744): `clone`, `isolationRoot`,
`envFile`, `cleanupCommand` (`[execPath, MODULE_PATH, "destroy", "--root",
missionRoot]`), `sourceHead`, `snapshotDigest`. The mission id is **not**
emitted — recover it from `cleanupCommand[4]`. Pinned at
`tests/prepare-ephemeral-l1.test.js:336-342`.

Custody: `snapshotDigest` lands only in the marker's `snapshotDigest` field
(:725); destroy shape-checks `/^[a-f0-9]{64}$/` (:798) and echoes it.
`ufo-sighting.mjs` + lib contain **zero** references to
`snapshotDigest`/`digestLabel`/`snapshotCheckout` — the launch validates the env
file and marker but never re-derives the digest.

## Unknowns

- Cross-git-version machine reproducibility of the digest (no source claim).
- Any independent digest verifier outside the scoped files.