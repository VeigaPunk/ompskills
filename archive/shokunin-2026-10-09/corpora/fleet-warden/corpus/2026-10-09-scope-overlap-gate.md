# scope-overlap-gate — one-writer-per-path SCOPE_OVERLAP and canonicalization

Asked: the truth table of `scopeOverlaps`, the canonicalization, and any residual evasion.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `ScopeGate` (mutation-tester).

- `normalizeScopePath` (:175-190): trim → strip ONE leading `./` → strip ALL trailing `/` →
  reject dot-segment/root, absolute/`~`, `..`, empty part → `split("/")`.
- `scopeOverlaps` (:192-197): true when one component list is a prefix of the other (so identical,
  nested, and component-prefix all overlap; string-prefix siblings `a` vs `ab` do not).
- The pairwise loop (`loadSpec` :375-384) compares every pair of every mission's entries →
  `SCOPE_OVERLAP` refuses the whole fleet.
- Refused entry forms: non-string/empty (`:176`), `/` `///` `./` (`:178`), `.` and any `.` part
  (`:179-181`), absolute/`~`/`~foo` (`:182-184`), `..`/empty part (`:185-188`); the container gate
  refuses an absent/empty `scope` array (`:357-359`).
- Truth table (real `plan` runs, exit 2 = SCOPE_OVERLAP): identical, nested either order, deep
  nesting, `./src` vs `src/`, `a/` vs `a`, whitespace-padded, `src//` vs `src` all overlap;
  disjoint `a`/`b`, siblings `a/b`/`a/c`, string-prefix `src/a`/`src/ab`, `src/a/b`/`src/a-b` do
  not; overlap hidden in a later entry is caught; multi-entry sets are compared cross-product.
- No overlapping spelling was found to slip through (residual evasion: none). Residual laxness
  (not evasion): canonicalization is purely lexical — a NUL byte, a space segment, or a
  Unicode-dot character in an entry is not normalized away, so those byte-distinct prefixes pass.

Mutation probes (run on the launcher, source restored to `80f0814e…`): killing the `index >=
short.length` disjunct lets nested scopes escape (KILLED); weakening the trailing-slash strip
turns `src//` into `INVALID_SPEC` (KILLED); removing the second conjunct of `scopeOverlaps` is a
surviving equivalent mutant (implied by the first clause) — not an independent guard.

Evidence: lane `ScopeGate` (16-case truth table, mutation battery, hash-verified restore).
