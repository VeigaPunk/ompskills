# scope-normalization — scope-normalization — the scope-entry refusal taxonomy, six messages one code

Asked: what does `normalizeScopePath` normalize, and which refusal fires when?
Source: `sighting/tower-fleet.mjs:174-190` (guards :176,:178,:179-181,:182-184,:185-188), sole call site :360, container gate :357-359, envelope :1297-1306; suite `test/tower-fleet.test.mjs:595-633`. Lane: `ScopeNormalization`.

- Normalization (:177): trim, strip **one** leading `./`, collapse a trailing slash run → parts joined at :360. `./src`→`src`, `src/`→`src`, `src//`→`src`; `././src` refuses (double dot).
- Six `INVALID_SPEC` messages, one code, in source-check order `:176 → :178 → :180 → :183 → :187`: non-string/blank (never echoes the value); collapse-to-empty (`/`, `///`, `./`); `.`/dot segment; absolute or any `~`; `..`/interior-empty; and the separate container gate `:357-359` ("needs a non-empty scope array of repo-relative path prefixes"). Source order decides attribution: `/./x` reports the **dot** message, not "absolute"; `//` reports "does not name a repo-relative path".
- Every refusal: `exit 2`, stdout empty, envelope on stderr, **zero bytes written** (70+ runs, `find` empty).
- The canonical key drives the overlap gate: `./src` vs `src/`, `src/x/` vs `src/x`, `"  src  "` vs `src` all refuse `SCOPE_OVERLAP`; per-entry validation finishes before the pairwise loop.
- **Scope never reaches a filesystem path** in the launcher (consumers :360/:377-380/:428; `host/apply.mjs` 0 hits) — the gate carries no confinement promise.
- Lexical, POSIX-only pass-throughs: `src\..\etc`, `C:/Windows`, `...`, `.hidden`, and an embedded NUL (2 NUL bytes land in the rendered prompt at `l1-prompt.md:46`).

## Unknowns
- `launch`/`close` legs not exercised (plan-only); scope-gate vs ceiling-gate ordering read but not exhaustively probed.
