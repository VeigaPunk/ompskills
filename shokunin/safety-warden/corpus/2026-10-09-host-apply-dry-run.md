# host-apply-dry-run — host-apply-dry-run — the third write surface's gate and its gaps

Asked: what does `host/apply.mjs` write, what is the dry-run gate, and does it confine writes?
Source: `host/apply.mjs:9-11,38,156-167,163,365,187-191,771-774,842-849,853-863,865-892,894-941,1003-1012`. Lane: `HostApplyDryRun`.

- Dry-run is the **default**: `apply=false` (:156-157); without `--apply` it prints "DRY RUN PASSED … Nothing was written." and exits 0; the first write (`installConfig`, :1015) is unreachable. Exit codes 0/1/64.
- Two write destinations + a per-target timestamped `.bak`: the global config `~/.omp/agent/config.yml` (`writeAtomic` :880) and `<ufoRoot>/config/ufo.json` (`writeAtomic` :938). `writeAtomic` (:853-863) is `mkdirSync(dirname)` + `writeFileSync(tmp,{flag:'wx'})` + `renameSync` — atomic but **unconfined**, and it follows symlinked parent dirs.
- Symlink guards: YES on the install target (`lstatSync`+`isSymbolicLink` refusal :867-871) and the candidate source (:187-191); **NO** on the `ufo.json` merge target (:894-941) — straight to backup + `writeAtomic`.
- `realpathSync` appears **zero** times: no realpath/`startsWith(root)`/containment analogue. `host/ufo-sighting-dispatch.json` is payload-only (no path/symlink fields).
- So the substrate ban is a **per-surface** rule: `host/apply.mjs` legitimately *writes* `<ufoRoot>/config/ufo.json`.

## Unknowns
- `--apply` was not run (read-only lane); apply behavior is source-derived; no full dry run through a scratch `--ufo-root`.
