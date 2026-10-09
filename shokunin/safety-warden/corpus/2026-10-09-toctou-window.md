# toctou-window — toctou-window — the check→write race landed a write; residual limit confirmed

Asked: can a same-user swap of a derived leaf between the final check and the syscall land a write outside the root?
Source: `sighting/tower-fleet.mjs:837` check → `:838-842` read/write, `:257-285`, `:204-228`; `reports/tf-safety-r2.md` residual limitation. Lane: `ToctouWindow` (mutation-tester, bounded race).

- **VIOLATED.** With a background loop flipping `<stateDir>/probe.prompt.md` between absent and a symlink to `<ufoRoot>/config/ufo.json`, a run reached `exit 0`, `ok:true`, and the config's bytes were **replaced** by the rendered L1 prompt (`0e416f0a…` → `66e16088…`, 10965 bytes). Two independent runs landed it (attempt 23, then attempt 5).
- Controls: a clean launch (no flipper) left the config unchanged; a **static** planted symlink refused `INVALID_SPEC`.
- Extra refusal class observed: a racing swap **inside** `realpathDeepest` (`existsSync`:207 then `lstatSync`:213) produced a fail-closed "resolves through a dangling symlink" false positive.
- Residual limit, exact: the same-user race between the final check (`:837`) and the syscall (`:842`) is **not closed**; it needs an fd/`O_NOFOLLOW` or tempfile+`renameSync` primitive, not another path check. Bind mounts (not symlinks) are also unclosed and untested.

## Unknowns
- The race is timing-dependent; it was reproduced, not characterized statistically. Real substrate was never touched (scratch only, restored to `0e416f0a…`).
