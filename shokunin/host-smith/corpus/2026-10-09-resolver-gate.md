# Gate 2 — resolver gate

**Asked.** How the installer drives the real substrate resolver and what it
reads back.

**Observed.** `host/apply.mjs`.

- Dynamic import, absolute, rooted at `--ufo-root`: `await import(path.join(
  opts.ufoRoot, "scripts", "omp-global-config.mjs"))` at L232; pre-guard that the
  file exists L951–954.
- `process.env.UFO_OMP_GLOBAL_CONFIG_PATH = CANDIDATE` set at L231, but the
  resolver itself never reads that env var here — apply passes
  `readGlobalSeatRouting({ path: CANDIDATE })` explicitly at L235. The env var is
  re-injected per subprocess at L617 (wave CLI probe) and L714 (`--check`) via
  `plannerEnv` (L588–595), where consumers *do* read it.
- Return shape (L588–595 of the resolver): `{ path, text, sha256, seats:
  Map<seat,{route,fallbackChain:string[],via:{alias,chainKey}}>, modelRoles:
  Map<string,string>, fallbackChains: Map<string,string[]> }`. `seats` covers
  every `task.agentModelOverrides` key; `sha256` is a raw-bytes digest from the
  fd-bound `readBoundedFile`. The call also runs an orphan-chain check —
  `parsed clean` proves parse + all seats resolved + no dead chains. Refusal
  codes: `missing`, `malformed`, `oversized`, `unreadable`.
- `MIRROR_SEATS` (L79–83, 14 seats) equals `build.rs ROLE_TAXONOMY`; the check
  L243–245 is a one-way subset (`MIRROR_SEATS ⊆ seats`).
- Bucket grouping L247–259: key `entry.via.alias ?? entry.route`, sorted; the
  alias-keyed grouping keeps `m_fast` and `m_strong` separate despite sharing
  `alibaba-token-plan/deepseek-v4.1-flash:max`. Observed: m_fast 6 seats/6 hops,
  m_mid 5/6, m_strong 3/9.
- Variant enumeration L262: `/^(m_strong|m_mid|m_fast)_/` over `modelRoles` keys
  → exactly the 3 declared variants; non-bucket pool lanes are intentionally not
  listed, and a future fourth bucket's variants would not print (enumeration
  aid, not a gate).

**Verified.** Dry run: `19 modelRoles, 31 fallbackChains, 14 seats`,
`sha256 15b40185…b5c9` (independently reproduced with `sha256sum`).

**Added.** 2026-10-09 · lane `ResolverGate` (reviewer)