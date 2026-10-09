# destroy-force-recovery — what `--force` relaxes and still enforces

Asked: what does `destroy --force true` relax vs. still enforce, and does the doc
match? Source: `scripts/prepare-ephemeral-l1.mjs:814-893`;
`docs/EPHEMERAL-L1-MISSIONS.md:99`; 16-case `/tmp` probe. Lane `DestroyForce`
(reviewer).

Relaxes:
- Marker provenance: an absent/unparseable/wrong-identity marker falls back to
  heuristic layout recovery (:830-844, :847-869); ordinary destroy requires a
  fully validating marker.
- Provenance return values may be `null` with `forced: true` (:888 vs :892).
- Adds permission repair: `chmod` candidate 0700 (:846/:872) plus a recursive
  `chmodSweep` 0700/0600 that **skips symlinks** (:873-886, the r01
  SwarmReviewer33 F1 planted-link escape fix).
- `rmSync force:true` (:887 vs :891).

Still enforces:
- target required (:815); configured root exists + owner-private (:820-821);
- candidate is exactly one direct child (:823), not a symlink (:825),
  owner-private (:826), canonical (:827);
- **identity gate** (:833-844): a marker whose `schema === policy.markerSchema`
  AND `root === candidate` that fails validation is **never downgraded** — the
  original refusal is re-thrown (`active` :806, `registered` :809, unknown state
  :810). Mechanism: re-read the marker; if it matches schema+root, `throw error`;
- the heuristic branch still requires `checkout/`+`isolation/` as canonical
  non-symlink owner-private directories (:848-857) **and** a witness —
  `checkout/.git` **directory** OR `isolation/environment.json` regular file
  (:859-866); a worktree-style `.git` **file** alone is not a witness.

CLI: `destroy` accepts `--root/--parent-root/--force` only (:930); force coerces
only `"true"`/`"1"` (:939); bare `--force` throws (`requires a value`);
`cleanupCommand` never carries `--force` (:742).

Doc reconcile: **NONE** on force semantics — every element of
`docs/EPHEMERAL-L1-MISSIONS.md:99` maps to an anchor. Non-behavioral wording
note: the docs omit that force also requires target-not-symlink and
configured-root-owner-private.

## Residuals

- The suite has **zero** coverage of the force arm (no `destroyEphemeralL1` call
  with force, no `--force` CLI test); the lane's `/tmp` probe is the only runtime
  evidence.
- Identity gate re-reads the marker with plain `readFileSync` (:838) without the
  symlink/size/mode discipline of :766-772 — a swapped/oversized marker is
  re-read unbounded, and the two reads can observe different content (TOCTOU)
  [INFERENCE].
- `prepare-ephemeral-fleet.mjs:466-468` has a **separate** force contract (only
  `"true"`, no `"1"`) — never conflate the two arms.