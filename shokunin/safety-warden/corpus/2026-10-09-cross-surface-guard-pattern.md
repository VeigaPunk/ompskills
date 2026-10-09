# cross-surface-guard-pattern — cross-surface-guard-pattern — one invariant, three parameters

Asked: is there one shared path-confinement pattern across the three writer surfaces?
Source: launcher `sighting/tower-fleet.mjs:204-230,237-252,257-285`; substrate `ufo-mission-result.mjs:1114-1139,2143-2159`, `ufo-swarm-wave.mjs:431-448`; `host/apply.mjs`. Lane: `CrossSurfaceGuardPattern`.

- Shared invariant, three clauses: (1) materialize before deciding (realpath-anchor what exists, reason about what does not); (2) refuse symlink traversal at the write site; (3) a spatial predicate on the residual path — stay-beneath-a-sanctioned-root **or** out-of-every-forbidden-zone. **No shared helper exists**; each question must be answered per surface.
- Symlink-**component** semantics **invert**: an in-root symlink component is *allowed* by the launcher (if the landing stays contained/in-zone) but *refused* by `beneath` (any symlink component → false), both proven on the same planted layout.
- Launcher leaf refusal is unconditional; `beneath` needs no leaf clause (the walk subsumes it); `host/apply.mjs` lacks the leaf clause on its one substrate write path (defensible only because the write is rename-based).
- The same tree is "never written" for the launcher (zone) and "the only writable root" for the substrate (containment); `host/apply.mjs` is a deliberate third trust tier that writes `<ufo-root>/config/ufo.json`.
- Refusal vocabularies never travel: `INVALID_SPEC` exit 2 (launcher) / `EXEC_PATH_OUTSIDE_ROOT` exit 1 (substrate) / `error:` exit 1 (host). The launcher re-types a post-wall refusal (`STATE_DIR_UNAVAILABLE`).
- TOCTOU closure styles differ: launcher re-asserts inline but non-atomically; substrate closes at the primitive (`O_NOFOLLOW`, `writeFileAtomic`); host closes with `wx`+rename+no-clobber+read-back.

## Unknowns
- The host `wx`+rename claim that it clobbers a link rather than following it is inference, not executed.
