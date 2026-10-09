# symlink-test-probes — symlink-test-probes — suite §37 and the full-suite result

Asked: what do the derived-target symlink probes pin, and does the suite pass?
Source: `test/tower-fleet.test.mjs:1631-1682` (§37), `:106-110` (fixture copy). Lane: `SymlinkTestProbes`.

- Full suite at tip `87c351a`: `node test/tower-fleet.test.mjs` → `ALL CHECKS PASS`, exit 0, **967** checks, 0 failures, ~3.5 s, hermetic (temp fixtures; the real `config/ufo.json` **copied** in).
- Five fixtures (prompt leaf, sessions parent, fleet state leaf, worktree slot, skill target parent), each asserting `result.status === 2 && typedError(result)?.code === "INVALID_SPEC"` (:1677). Only the **code and exit** are pinned; the message strings are not asserted.
- Two guard branches cover all five: symlinked **leaf** → "is a symlink — refusing a write through it" (:270-273); symlinked **parent** with a nonexistent leaf → realpath containment "resolves outside its write root" (:280-283).
- Band-authority byte-identity: the config Buffer is compared before/after the five probes (`:1635,:1680-1681`), so any escaped write would be caught; all five links point at/into that config.
- Ordering: `assertLaunchWriteTargets` (:708) runs before the wall opens; guards re-run at each write site (:697,:727,:797,:835,:837,:906).

## Unknowns
- Single run (no flake measurement); no TOCTOU swap experiments; the real substrate config is protected by fixture isolation, not directly measured.
