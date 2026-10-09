# evidence-digest — the wave's gate report

Asked: gate report for the wave — suite transcript, sibling census, axis pins,
not-established list. Source: `tests/prepare-ephemeral-l1.test.js` + the wave's
own reports under `reports/isolation-keeper/`. Lane `EvidenceDigest` (scribe).

Suite (read-only, cwd `/tmp`):
`node /home/vgpnk/Projects/ufo-fsd-alpha/tests/prepare-ephemeral-l1.test.js` →
`pass 41 / fail 0 / cancelled 0 / skipped 0 / todo 0`, `EXIT=0`. /tmp-only
established: the suite declares it (:3-4) and implements it via
`mkdtempSync(os.tmpdir())` (:36-40); every `createEphemeralL1` call passes a
fixture root; TMPDIR empty in the shell.

Sibling census at census time: only `RemoteStrip.md` was on disk (30 roster
lanes had no report yet when the lane looked — it claimed none of their results).
This is telemetry, not a finding.

Axis pins (strongest single piece of evidence each):
- **source-fidelity** — `PATH_VARIABLES` frozen key set (prepare:40-54) enforced
  by exact-set equality in `readPolicy` (122-127) and the emitter drift guard
  (550-553), mirrored at ufo-sighting:45-46.
- **isolation-coverage** — `buildEphemeralSandboxDispatch` (sighting:4193) fails
  `SANDBOX_UNAVAILABLE` at :4206 when bwrap is missing and builds the
  unshare/bind argv at :4236-4245 / :4247-4254 / :4281-4287; policy names the
  inputs only; the prepare module spawns only git.
- **consumer-integrity** — ufo-sighting:45-56 exact-key + path-containment
  validation of `environment.json`, and the marker identity gate :127-130;
  producer `createEphemeralL1` writes `environment.json` :705-715 and the marker
  :717-736.

Not established at census time (superseded by later lanes; recorded honestly):
the later consumer lanes, `ufo-sighting-lib/*` internals beyond `resolveExecutable
Path`/`coveredBy`/`parentDirectories`, the card/corpus convention, the destroy
force/refusal taxonomy, non-remote git config namespaces, object-store
independence beyond `--no-local`, and git-version stability of url-less remote
removal.