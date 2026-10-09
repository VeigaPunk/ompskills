# scope-overlap-semantics — scope-overlap-semantics — component-prefix overlap, and F2 closure

Asked: what is the exact overlap predicate, and is `scope:["."]` closed?
Source: `sighting/tower-fleet.mjs:192-197` `scopeOverlaps`, gate :374-385; `:179-181` dot refusal; suite §6 :389-425, §11 :507-556. Lane: `ScopeOverlapSemantics` (incl. a mutation probe).

- Predicate: the **shorter component array is a component-wise prefix of the longer** (equal length ⇒ component-identical). **Not** a string prefix.
- Refused `SCOPE_OVERLAP` (exit 2, message naming both ids and the leading scope): identical, nested parent-first and child-first, deep nesting, a later-entry overlap in a multi-entry scope, and normalized-equal spellings. Accepted: component-adjacent (`src/core` vs `src/correction`), string-prefix siblings (`src/a` vs `src/ab`), dash-suffix (`src/a/b` vs `src/a-b`), one mission owning parent+child.
- **F2 CLOSED**: `scope:["."]` (alone or beside a sibling) refuses `INVALID_SPEC` at `:179-181` before the pairwise gate.
- Mutation probe: a string-prefix mutant flips `src/a` vs `src/ab` to refuse → **KILLED**; dropping the redundant `&& short.every(...)` conjunct is provably equivalent → SURVIVED. Repo file restored byte-identical.

## Not carried by the source
- The overlap compare is purely Lexical: symlink aliasing between two disjoint scope paths is neither refused nor pinned; case (`src` vs `SRC`) is treated disjoint.

## Unknowns
- `launch`-side effects of accepted scopes unobserved (plan path only).
