# doc-history — `docs/PRIMEAGENT-ASSIMILATION.md` reconciled

Asked: the mechanism map, the per-round history, and every self-marked correction/drift. Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `DocHistory` (scribe).

Observed (doc = 1329 lines):
- Mechanism map (:14-24): 7 rows (ledger r01; hook r02/r03; compaction r03; daemon lifecycle r04/r05; IPython/explicit-messaging/durable-goals "not started").
- Per-round, one-axis narrative for r01-r10, r18-r25 (r02-r06 literally say "Widened exactly one axis").
- **Fidelity gap:** no r11-r17 sections — `## Round 10` (:703) jumps to `## Round 18` (:742); the only trace is "the r17 sentinel" (:744).
- Self-marked corrections: C1 mission-id rotation (r02 assumption disproved r03); C2 "one generation deep" superseded r22;
  C3/C4 scope-bound store/ring and no-default store (SUB-7); C5 r05 exact-key-set note corrected r06; C6 daemon protocol version divergence;
  C7 UFO screens lineage at write+read (reference screens type only); C8 r09 fixture corrections; C9 `+00:00` no longer accepted;
  C10 prune validates first; C11 r25 read-archives ENOENT fix; C12 `loadHookConfig` no longer loads ledger policy.
- Doc-vs-source divergences: D1 r24 frozen key table omits the shipped conditional `omitted` key; D2 r25 carries two run ids (header rescued-attempt);
  D3 `config/…json:26` still names the fixed nc5-primeagent ring path (the config is the stale artifact, the doc is right); D4 r11-r17 absent.
- Probes: nine-verb list (`unknown verb undefined …`), no-ledger-bound refusal, scope `status --json` `state:"empty"`,
  empty roll-up `51174ef6…6f82`.

Changed: nothing. Unknowns: r11-r17 axes unrecoverable from this doc; vendored PrimeAgent bytes absent (C6/C7 not re-derivable here);
live `.ufo/scopes/nc5-primeagent` run-state absent.

Report: `reports/ledger-keeper/DocHistory.md`.
