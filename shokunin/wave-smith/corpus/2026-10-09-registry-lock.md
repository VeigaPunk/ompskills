# registry-lock — the lock, the atomic write, and the residual TOCTOU

Asked: `withRegistryLock` and the atomic registry publish.
Source: `scripts/ufo-swarm-wave.mjs:670-697, 628-631`;
`ufo-mission-result.mjs:1548-1701, 968-1005, 1632-1650`. Lane: `RegistryLock`.

- Lock artifact: a `<registry>.lock` **directory** beside the registry, claimed with
  `mkdir 0o700`; token `swarm-<uuid>` in `owner.json` `{pid, token, at}` written
  `O_EXCL|O_NOFOLLOW` 0o600 + fsync. Protocol is the hub's shared `withDirLock`:
  30 s deadline, 30 s stale bound, fenced quarantine break with seized-token restore,
  a symlink/non-directory refusal, and a token-checked release.
- Typed mappings: `registry_lock_timeout` (`:689-690`, message
  `ufo-swarm-wave: registry lock timeout`) and `registry_lock_unsafe` (`:692-693`).
  Both observed: a contended lock → exit 1 after ~31 s with registry bytes unchanged;
  a symlinked `.lock` → exit 1 in 0.02 s, bytes unchanged.
- `writeRegistry` → both writers use the hub's `writeFileAtomic`: random `O_EXCL`
  0o600 tmp `<path>.tmp-<pid>-<uuid>`, fsync, dev+ino re-verify, rename, directory
  fsync, inode-guarded unlink on failure. A predictable tmp name was refused because
  the spec-controlled `reportDir` is a symlink-squat target.
- Writers taking the lock: `persistWaveRegistry` (`run`, `:1466/1561`) and `mainRecord`
  (`record`, `:1651/1791`) — the only two, and the only writers of
  `ufo-swarm-registry-v1` (collect reads).
- Lock-free reads by design: plan-time own-registry + prior loads, and the in-lock fresh
  prior re-reads. Safe because the atomic rename gives each load one consistent
  snapshot; the lock fences the merge itself.

Residual window named by the source: plan-time admission reads "can be stale by the
time the registry is published" — closed only for the `run` path by the under-lock
revalidation (see `toctou-revalidation`). A hand-executed `plan` payload has **no**
lock-time recheck. Prior-registry races are snapshot-only, never fenced.

Findings recorded (not defects to fix here): the wrapper's "typed `invalid_registry`
owner-reader contract" comment is unreachable — every `readOwner` call inside
`withDirLock` is inside a local try/catch, so a corrupt `owner.json` routes to the
mtime-freshness check instead of a CLI refusal. A `tmp-swap` refusal is a plain
`Error` → mapped to code `internal`, indistinguishable from a bug without the message.

## Not carried by the source

- The lock is a write fence, not a spawn gate; `plan` never takes it.
- No `--wait`/`--timeout` knob on the surface; the deadline is the hub's.

## Unknowns

- Malformed-owner behavior (analysis shows it cannot surface as an envelope) and NFS
  mkdir-atomicity assumptions are unprobed.
