# shokunin2-fleet-audit — Reconstruction of fleet shokunin2

Source: r1 lane `Shokunin2FleetAudit` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Cross-index fleet `shokunin2` (8 missions).

## Observed

- Clean launch: 8 panes, `ok:true`, no failure fields.
- Lane accounting reconciles for all 8: spec = payload = registry = report `.md` (12 registries, 410 members, 0 missing, 0 orphan).
- 13 verification-lane transcripts (12 unique names) sit outside every registry — creation-verification dispatches are direct `task` calls, not wave members; `GodspeedKeeperVerify` is named in no receipt.
- `waves/run.err`, `r2-plan.err`, `r2-run.err`: 0-byte shell redirects from the safety-warden L1; the invalid r2 spec was rewritten before retry and survives only in the transcript. All 19 wave `.err` files are 0 bytes.
- Git: all 8 tips merged `--no-ff` 09:20:33-34 -0300; later main commits `2c868b1`, `ada7a90` add 9 corpus entries on no branch, in no receipt.
- Four missions reuse one registry dir across r1 and r2; probe commits `0bea18a`/`a76ea62`/`b991cf5`/`e3fd96a` reachable only via reflog.

## Unknowns

- Validator-call count in sessions unresolved (jq 0 vs grep hits).
