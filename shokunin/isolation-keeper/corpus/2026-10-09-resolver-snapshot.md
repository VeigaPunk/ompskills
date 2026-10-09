# resolver-snapshot — write, bind, and the two distinct refusals

Asked: establish where the resolver snapshot is written and how the sandbox binds
it. Source: `scripts/prepare-ephemeral-l1.mjs:442-466`; `scripts/ufo-sighting.mjs:
4214-4234,4284`; `config/ephemeral-l1.machine.json:42-47`. Lane `ResolverSnapshot`
(scout).

Write side (`snapshotResolver` 442-466, called from `prepareOpenCode`:472):
`realpathSync(policy.sandbox.resolverSource)` (= `/etc/resolv.conf`), require a
bounded regular file (`MAX_RESOLVER_BYTES = 65_536` :37, pre- and post-read) and
NUL-free; destination is `path.join(paths.XDG_CONFIG_HOME,
policy.sandbox.resolverSnapshotFile)` = `<root>/<id>/isolation/config/
sandbox-resolv.conf`; written `O_EXCL|O_NOFOLLOW`, 0600, `flush:true`, then
chmod. The containing `config` dir is a private `ensurePrivateDirectory`.

Consume side (`buildEphemeralSandboxDispatch`):
- locate the snapshot at `environment.environment.XDG_CONFIG_HOME +
  resolverSnapshotFile` (:4214-4217);
- refuse unless it stays canonical/beneath the root (:4218-4219) and is not a
  symlink (:4221-4222), private-owned and regular (:4223), 0 < size ≤ 65_536
  (:4224-4225);
- the **mount target** is `resolverSource` itself, or — when the source is a
  symlink — `path.resolve(dirname(src), readlink(src))` (:4228-4230), a one-hop
  resolution, not a full `realpath`; it must be absolute, canonical, and start
  with `/etc/` or `/run/` (:4231-4234);
- bind: `args.push("--ro-bind", resolverSnapshot, resolverMountTarget)` (:4284).

Two distinct refusals must not be conflated: :4218-4219 governs the **source**
(the snapshot must live in the ephemeral root — else arbitrary host bytes could
be ro-bound at the resolver path), :4231-4234 governs the **target** (approved
system roots only).

Live host: `/etc/resolv.conf -> /run/systemd/resolve/stub-resolv.conf`, so on
this host the :4228 symlink branch fires and the target is
`/run/systemd/resolve/stub-resolv.conf` (passes `/run/`). The sandbox has **no
`--unshare-net`**, so the child shares the host network namespace; the resolver
snapshot is bound in, which is consistent with network being intended — the
source states no intent.

Test pins: `tests/prepare-ephemeral-l1.test.js:237-238,374-376`;
`tests/ufo-sighting.test.js:1334-1336,1428-1435` (the `--ro-bind` precedent
index and the `/etc|/run` target regex).

## Unknowns

- The concrete mount target is host-dependent (rule given, not a constant).