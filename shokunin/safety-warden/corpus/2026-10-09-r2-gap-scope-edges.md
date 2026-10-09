# r2-gap-scope-edges — r2-gap-scope-edges — lexical gate confirmed; no length ceiling

Asked: the round-1 unpinned scope edges — symlink aliasing, case sensitivity, length ceiling.
Source: `sighting/tower-fleet.mjs:174-197`; card `:118-133`. Lane: `GapScopeEdges`.

- `src` vs a symlink alias of it → `exit 0` (no aliasing resolution); `src` vs `SRC` → `exit 0`; 100,000- and 1,000,000-character scope entries → `exit 0` with full measured lengths, **no observed ceiling**.
- The card's "lexical, POSIX-only, does not resolve aliasing" claim is confirmed; the no-ceiling fact is new.

## Unknowns
- Plan-only probes; no launch-side effect of a huge scope entry observed.
