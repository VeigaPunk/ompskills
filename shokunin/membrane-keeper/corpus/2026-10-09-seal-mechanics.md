# seal-mechanics — the JS launcher side of the seal

Asked: the membrane seal lifecycle in `scripts/run-omp-native-trial.mjs`:
path, state read, write, fresh-dispatch refusal, verdict arm, other readers.

Observed (wave r1-w1 lane SealMechanics):

- `MEMBRANE_SEAL_PATH` = `<root>/.ufo/membrane-seal.json` (:1788).
- `membraneSealState` (:1796-1818): `lstatSync` — absent or dangling symlink
  reads as unsealed; present-but-unreadable returns a marker object with no
  `run_id` = **fail-closed** (the refusal prints `<unreadable seal>`).
- Seal write (:1831-1863): ancestry walk via `realDirChainOrNull` refuses a
  symlinked `.ufo` (the seal is the membrane's own record); tmp
  `membrane-seal.json.tmp-<pid>` with `O_EXCL|O_NOFOLLOW` mode 0600, then
  `renameSync`; no dir fsync, no lease. Payload kind `ufo-membrane-seal-v1`,
  fields `run_id, session_id, round, accept_digests` (+ sealed_at_ms).
- Fresh-dispatch refusal (:3331-3341): gated on `resumeDecision.redispatch`
  and `!args["prepare-only"]` — a resume pairing (snapshot present, no settled
  collection) is NOT a fresh dispatch and proceeds. Exact die:
  `membrane seal stands for run <id>: fresh dispatch is refused until the
  operator runs \`ufo charter sign <runId>\` and a full Phase 0 re-passes`.
- Verdict arm (:4151-4174): `verdictParsed.membrane_accepts` →
  `acceptDigests`; seal-write failure → tries `rejection.txt`, else
  console.error, `finalExit = 2`.
- Unseal: only `ufo charter sign` (main.rs:989-1109, `remove_file` :1099).
- Live state: `.ufo/membrane-seal.json` absent on the substrate (lstat).
- Gaps found: nothing gates the next launch on `verdict.json`'s `loop_stop`
  or `rejection.txt` — the seal file is the only barrier; the Rust
  `refuse_if_membrane_sealed` uses `path.is_file()` (:115) which is fail-open
  on a dangling symlink or directory, contradicting its own doc comment.
- Probe-confirmed: seal tmp mode 0600; symlinked tmp refused EEXIST;
  `test -f` false on dangling link.

Confidence: high for anchors; medium for the is_file fail-open (source +
semantics, not run). Unknowns: whether `.ufo/` must pre-exist for the JS
writer (it does not mkdir).
