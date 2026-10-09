# path-confinement-guards — the five guards and the symlink verdict

Asked: quote each guard, name what it refuses, and give real probes. Source:
`scripts/prepare-ephemeral-l1.mjs:243-305`. Lane `PathGuards` (sentinel).

| guard | lines | refuses | symlink-aware? |
| --- | --- | --- | --- |
| `isBeneath` (exported) | 243-246 | root-identity, parent, `../` traversal, cross-root absolute, sibling name-prefix | **no** — zero fs calls |
| `assertOwnerPrivate` | 248-253 | foreign uid, `mode & 0o077` bits, wrong kind | refusal sits at call sites (lstat+isSymbolicLink before it) |
| `ensurePrivateDirectory` (exported) | 255-283 | leaf symlink (O_NOFOLLOW → ELOOP), non-directory, foreign uid, ancestor swap (`realpath` + `isBeneath(within, real)`) | yes (realpath ancestry) |
| `safeRelative` | 285-294 | non-string/empty/NUL/absolute, `../` traversal, any non-canonical lexical form (`normalize !== value`) | n/a |
| `assertRealParents` | 296-305 | symlinked/non-directory parent components; creates missing parents 0700 when `create:true` | yes |

`isBeneath` is **lexical, not symlink-aware** — the probe returns `true` for a
path that escapes through a symlink. It is safe only because every canonical
call site realpaths or proves-canonical both arguments (`ensurePrivateDirectory`
:279; :331-332; :474; :490; destroy :764→780; fleet :211/224 with
`validateSource`). Line :320's lexical use is covered by
`safeRelative`(:308)+`assertRealParents`(:309). A card claiming `isBeneath`
rejects symlinks is source-unfaithful.

`ensurePrivateDirectory` **silently tightens** loose modes (755→700) instead of
refusing, while `assertOwnerPrivate` refuses widened modes — a trap for future
consumers.

Callers: `isBeneath` is shared (within the substrate) only by
`prepare-ephemeral-l1.mjs` and `prepare-ephemeral-fleet.mjs`; `ufo-sighting.mjs`
uses a byte-identical logic twin `beneath` (base.mjs:345, imported at
ufo-sighting.mjs:27, re-exported :4711). No consumer of these symbols exists in
the ompskills worktree (grep: no matches).

## Findings

- LOW: `ensurePrivateDirectory` mkdirs (:256) and fchmods (:270) **before** the
  containment check (:279) — a swapped in-root ancestor symlink gets a real 0700
  dir created outside the trusted root before the refusal (containment still
  holds; probe showed the side effect).
- INFO: uid checks are gated on `typeof process.getuid` — silently skipped on
  runtimes without it.
- INFO: `assertRealParents` with `create:false` throws raw ENOENT on a missing
  parent instead of a named refusal.

## Unknowns

- Foreign-uid refusals unprobed (needs a second uid); grounded on code only.