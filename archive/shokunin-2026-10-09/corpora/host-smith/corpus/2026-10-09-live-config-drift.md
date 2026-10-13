# Live installed config vs the candidate

**Asked.** Diff `~/.omp/agent/config.yml` against `host/omp-agent.config.yml`.

**Observed.** Exactly **one behavioral difference**: `modelRoles.default` —
live `:22` `devin/deepseek-v4-1-flash:max` vs candidate `:111`
`openai-codex/gpt-5.6-luna:medium` (the same value as candidate `m_luna:157`).
Everything else after normalizing comments/indent/quoting is value-identical:

- chain items re-quoted in the candidate (all 145 lines),
- 261 comment lines added,
- `default` moved to the top of `modelRoles`,
- live missing a trailing newline on `autoqaConsent: granted`.

All 31 `fallbackChains` including `retry.fallbackChains.default` (live 44–48 =
candidate 247–251) are value-identical. Raw `diff -u` shows 431 insertions/161
deletions; the normalized diff collapses to 3 hunks.

- **Sizes/modes:** live 7457 bytes mode 0600 (sha256 `ed164f81…`); candidate
  25425 bytes mode 0644 (sha256 `15b40185…b5c9`).
- **What `--apply` would overwrite:** `~/.omp/agent/config.yml` wholesale with the
  candidate's 25425 bytes (timestamped `.bak` first; **mode carried from the
  existing file stays 0600** — the candidate's 0644 never propagates;
  byte-identity read-back enforced). And `config/ufo.json` is rewritten
  unconditionally via `mergeDispatch` even though the dry run shows all six
  `sighting.dispatch` keys `already correct` (byte-identical rewrite + `.bak`).
- **Pool members match:** all 19 candidate `modelRoles` keys exist in live at
  identical routes except `default`.

**Takeaway (recipe).** Normalize-then-diff (strip comments/blanks/indentation/
chain-item quoting) is the drift signal between candidate and live authority —
raw diff screams churn while the entire behavioral delta is one route. But
`apply.mjs` ships formatting as authority (whole-file byte-identity read-back),
so state both: semantics normalize, bytes are what installs.

**Unknowns.** Origin of the live file's last write (hand edit vs prior partial
apply) is not evidenced; quoted-vs-unquoted chain-item parse-equivalence is
inferred from the clean dry run.

**Added.** 2026-10-09 · lane `LiveConfigDrift` (connector)