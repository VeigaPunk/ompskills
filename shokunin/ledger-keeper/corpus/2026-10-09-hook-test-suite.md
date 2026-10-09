# hook-test-suite — what the 19-case hook suite pins

Asked: the harness, injected deps, pinned facts, and gaps. Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `HookTestSuite` (reviewer).
Live: `node --test tests/primeagent-assimilation-hook.test.js` → 19/19 pass, exit 0; substrate `git status` unchanged.

Observed:
- Real integration: seeds the real ledger via `appendEntry`/`loadPolicy`/`DEFAULT_LEDGER_PATH`, reaches the typed package dynamically;
  injected hook API surface (not the default export); `makeCtx` fake records `ctx.ui.setStatus`; env as data (`fleetEnv`); injected frozen clock.
- Pins: bounded titles-only child digest (`pa-ledger` key, `←1 (parent run-parent-0)` 12-char truncation, `[untrusted data]` tag,
  body text MUST NOT appear, whole line ≤1024 bytes literal); writer labelling (`writer · 1 entries`, no arrow); foreign silence (0 statuses)
  + one ring record `[foreign, m_<hex>, "mission mismatch"]`; empty env → no ring file at all; session-start burst debounce
  (16 records 60 ms apart → 1; +6000 ms → 2; +6010 ms different session → 3); unbound `/unbound .* intake refused/` + ring role;
  chain-invalid `/chain-invalid \(intake refused\)/` + role `invalid`; missing/garbage bytes never throw; ring rotation (capacity 4 → 4 survivors oldest-first) + byte bound;
  config fallback to `HOOK_DEFAULTS`; canonical caps floors (raise → 16/1024/32/16384; tighten honored); default paths (no scope → no ring;
  scope → `.ufo/scopes/<scope>/hook-loads/loads.json`; escapes → null); refused override observable (`override-refused`, never fallback);
  ring read no-follow + real dir; r21 hardened ring write (tmp `<ring>.<pid>.<uuid-v4>.tmp`, legacy symlink never followed);
  WO-4 step 0 (queue `lineage.parentRunId` binds caller-parent across mission rotation; `parent-mismatch`; three untrustworthy queues → `parent-unresolved`; queue override containment).
- Left unpinned: the default export / live OMP host behavior; call-time env read contract; package-resolution failure no-op; ring byte-eviction path;
  several `resolveParentBinding` reasons; caps forwarding to the package.

Changed: nothing. Unknowns: what a real OMP host passes as `ctx`/`pi` at `session_start`(live-host probe out of scope).

Report: `reports/ledger-keeper/HookTestSuite.md`.
