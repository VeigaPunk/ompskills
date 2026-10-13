# substrate-write-primitives — substrate-write-primitives — atomic publish, dir lock, bounded reads

Asked: what do the substrate's write-safety primitives guarantee, and how do they contrast with the launcher?
Source: `ufo-fsd-alpha/scripts/ufo-mission-result.mjs:968-1005` `writeFileAtomic`, `:1571-1701` `withDirLock`, `:832-840`/`:768-824` `readBoundedFile`/`readBoundedFd`; correction `ufo-swarm-wave.mjs:675`/`:629`. Lane: `SubstrateWritePrimitives`.

- `writeFileAtomic`: `O_EXCL` random tmp `${path}.tmp-${pid}-${uuid}` mode `0o600` → fsync → **dev+ino re-verify of the tmp pathname** before rename → rename → dir fsync; a swap is refused ("staged tmp was replaced before rename (possible swap)"). It **never** mkdirs the parent (ENOENT observed).
- `withDirLock`: lock **directory** mkdir-claimed `0o700`, `owner.json` `O_EXCL|O_NOFOLLOW` fsynced, `timeoutMs`/`staleMs` default `30_000`, fenced stale-break via rename-quarantine + token check.
- `readBoundedFile`/`readBoundedFd`: `O_RDONLY|O_NOFOLLOW|O_NONBLOCK`, fstat-pinned bound; ELOOP on a symlink, "not a regular file" on a dir.
- **Round-2 correction re-attributed**: the registry-parent `mkdirSync` is in the wave wrapper `withRegistryLock` (`ufo-swarm-wave.mjs:675`, before `withDirLock`), not inside `withDirLock`.
- Contrast: the substrate closes TOCTOU **at the primitive** (O_NOFOLLOW, dev+ino, rename) but is path-agnostic (containment is caller-side via `beneath`-gated paths); the launcher is the opposite — static path confinement with plain `writeFileSync`/`mkdirSync` and no atomicity.
- Environment fact: `NODE_COMPILE_CACHE=<substrate>/.ufo/cache/node-compile`, so **any** `node` run against substrate `.mjs` files writes cache entries **into the substrate** (Node/env, not a lane write).

## Unknowns
- `readBoundedFd` mid-read grow/shrink and pipe-chunk arms code-inferred; the real two-contender lock race unprobed.
