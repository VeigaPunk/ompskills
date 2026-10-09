# prior-audit-remediation — prior-audit-remediation — F1/F2/F3 closed at the tip; residual still holds

Asked: are `reports/tf-safety-r2.md`'s findings closed at the current tip?
Source: `reports/tf-safety-r2.md:35-93,176-197`; `sighting/tower-fleet.mjs:179-181,257-285,287-307,571-573,697,727,797,835-837,906`; suite `:616-619,1579,1617-1619,1631-1682`. Lane: `PriorAuditRemediation`.

- **F1 (child-symlink escapes) CLOSED**: `assertSafeWriteTarget` (:257-285) + the launch re-checks + the pre-flight (:708), pinned by suite §37. Case (b) reproduced at the tip: `exit 2 INVALID_SPEC` "mission probe prompt … is a symlink — refusing a write through it", zero wall calls, config `0e416f0a…` unchanged.
- **F2 (`scope:["."]`) CLOSED**: `normalizeScopePath` :179-181; suite `:616-619`. Reproduced `exit 2 INVALID_SPEC` for `["."]` and `"reports/./x.md"`.
- **F3 (`close --json` phase mislabel) CLOSED**: `wallRowDisposition` (:571-573) over the registry-tagged disposition. Reproduced `"phase":"completed","paneLive":false` on the audit's no-phase completed-row shape.
- **Residual limit still holds**: `grep` for `openSync|O_NOFOLLOW|constants.|flock|rename` → no matches; every guard is check-then-write, so same-user symlink-swap races and bind mounts remain uncontained. (Sibling `toctou-window` then *observed* the swap landing a write; sibling `derived-target-escape-hardlink` observed the hardlink gap.)

## Not carried by the source
- The stock fake wall reproduces the audit's stray-`}` bash brace-default quirk; the launcher again refused the corrupt wall output as `WALL_OUTPUT` (fail-closed).

## Unknowns
- The suite itself was read, not run, by this lane (siblings `symlink-test-probes`/`scope-test-pins` ran it).
