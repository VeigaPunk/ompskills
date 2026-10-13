# hook-intake — the session_start intake hook

Asked: path resolution, config loading, the package module load, `intakeSession`'s role matrix, step-0 parent
binding, and the ring writer. Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `HookIntake`.
Hook sha256 `7247f8b0ec3d2b382b546810b347d241a053287fa28aa18635e2767d332a0eef`.

Observed (`.omp/hooks/pre/primeagent-assimilation.js`):
- `HOOK_DIR`/`REPO_ROOT`/`CONFIG_PATH`/`SCOPES_ROOT`/`STATE_ROOT`/queue/package-spec resolution (:61-105).
- `HOOK_DEFAULTS` mirror the canonical hook block; `loadHookConfig` (:123-146) tighter-only min against `canonicalHookCaps`,
  `boundedInt` ranges 1..64 / 256..8192 / 1..256 / 1024..65536; unreadable → hard defaults.
- `containedScopePath`/`resolveHookPaths` (:72-92; `undefined` vs `null`=refused) and `resolveHookQueuePath` state-root containment (:285-289).
- `loadPackageModule` (:174-193): workspace specifier then checkout URL fallback, memoized once, total failure rejects silently.
- `intakeSession` reads env at call time (`deps.env`), non-fleet silent no-op (:333-342); role matrix writer/child (pass-through
  `result.role` + `digest.display`), unbound, invalid(chain-invalid), mismatch(parent-mismatch), foreign (silent status + one ring record),
  catch-all silent; `record`/`setStatus` swallow errors (:402-429).
- `resolveParentBinding` step-0 (:298-331): queue row `lineage.parentRunId` → caller-parent binding; all failure modes never throw.
- `recordRing` (:199-283): debounce `RING_DEBOUNCE_MS` 5000, rotation to `ringCapacity`, `ringMaxBytes` budget, `O_NOFOLLOW` read,
  parent-dir trust, pid+uuid tmp + rename atomic replace.
- Divergences noted: the ring emits **8** roles (adds mismatch, override-refused, unresolved); `chain-invalid` maps to role
  `invalid` with detail `validate refused`; a foreign session leaves a ring record but no status.

Changed: nothing. Unknowns: O_NOFOLLOW/parent-dir-trust runtime paths (harness domain).

Report: `reports/ledger-keeper/HookIntake.md`.
