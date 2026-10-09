# The seat table and the chain-rule audit

**Asked.** Read `host/omp-agent.config.yml`'s seat table and the live
`~/.omp/agent/config.yml`: name every seat and its bound alias, and flag any
seat that would fail the resolver or the build.rs chain rule (empty chain,
duplicate bare models). Cite.

**Observed — the seat table (both files agree, 14 seats).**
`task.agentModelOverrides` — host `host/omp-agent.config.yml:222-236`, live
`/home/vgpnk/.omp/agent/config.yml:26-40`, byte-identical bindings:

| alias | seats (host:line / live:line) |
| ----- | ------------------------------ |
| `@m_strong` | critic (:224/:28), main (:228/:32), planner (:230/:34) |
| `@m_mid` | connector (:223/:27), executor (:226/:30), revenger (:231/:35), reviewer (:232/:36), sentinel (:235/:39) |
| `@m_fast` | distiller (:225/:29), labrat (:227/:31), mutation-tester (:229/:33), scout (:233/:37), scribe (:234/:38), simplifier (:236/:40) |

3 strong + 5 mid + 6 fast = 14, matching `ROLE_TAXONOMY`
(`crates/ufo-core-runtime/build.rs:46-103`) and `MIRROR_SEATS`
(`scripts/sync-global-routing.mjs:89`) exactly.

**Observed — resolver, executed.** `readGlobalSeatRouting({path})` from
`scripts/omp-global-config.mjs:546` run against BOTH files: all 14 seats
resolve, zero failures. Alias dereference: `m_strong` ->
`alibaba-token-plan/deepseek-v4.1-flash:max` (live :7), `m_mid` ->
`alibaba-token-plan/qwen3.8-flash:high` (live :9), `m_fast` ->
`alibaba-token-plan/deepseek-v4.1-flash:max` (live :10). Chain keyed by alias
for every seat (`via.chainKey` = `m_strong`/`m_mid`/`m_fast`; chains at live
:70-86, :88-93, :95-101; host :301-313, :323-329, :332-338) — never the empty
`else []` branch (`resolveFromMaps`, :460-471). The dead-weight chain-key gate
inside `readGlobalSeatRouting` (:583-586) also passed as part of the call (it
returns only when every `retry.fallbackChains` key matches a modelRoles key,
value, or resolved seat route). No `missing`/`malformed`/`ambiguous` codes from
any seat-level fail site (:474-484 alias-to-alias / unknown alias, :517-529
missing seat / empty override). Live config sha256 observed by the resolver:
`a4e70cf5…` (matches `sha256sum`).

**Observed — build.rs chain rule, executed over both tables.**
`validate_chain` (`build.rs:493-511`) requires the primary-plus-chain list
(`extract_omp_chains` pushes the primary first, :251-260) to be non-empty and
pairwise-distinct on `bare_route` = `provider/model` with the last `:segment`
stripped (`:507-513`); `parse_route` (:414-482) adds the effort whitelist
`low|medium|high|xhigh|max` (:41) and the gemini ban with the
`google-antigravity/` exemption (:484-498). Reproduced in JS over the
resolver's output: all 14 live seats **chain-OK** — strong seats chainLen=9,
mid chainLen=6, fast chainLen=6, no empty chain, no duplicate bare model. The
near-miss worth naming: the `m_strong`/`m_fast` primary
`alibaba-token-plan/deepseek-v4.1-flash:max` vs first hop
`devin/deepseek-v4-1-flash:max` — bare-distinct only because the dash/dot
spellings differ (`deepseek-v4.1-flash` ≠ `deepseek-v4-1-flash`); same for
`m_strong` hop 3 `deepseek-v4-pro`. The rule is chain-scoped, not
table-scoped (`build.rs:488-492`): `m_strong` and `m_fast` sharing one
concrete primary (live :7 = :10) is not a violation.

**Flag — none fail; but the compiled input is a different (older) table.**
No seat in either the host candidate or the live config fails the resolver or
the chain rule. However `build.rs` never reads those files: it consumes the
derived mirror `crates/ufo-core-runtime/bundled/omp-seat-routing.json`
(:54-55, 234). That mirror is drifted: `node scripts/sync-global-routing.mjs
--check` -> exit 1, `error: … drifts from the live global OMP config`.
Mirror `source.sha256` = `dc31bdb2…` vs live `a4e70cf5…` (the live hash also
moved on from `ed164f81…` recorded in
`2026-10-09-seat-routing-mirror-drift.md` — the operator's table was edited
again after that entry). Mirror bindings are an old generation: main=m_daybreak
(`openai-codex/gpt-daybreak-blue-latest:max`, 1-hop chain), critic/executor/
sentinel=m_luna, distiller/simplifier=m_flash, planner=m_kcode,
connector=m_antigravity, the other six=m_zfl. All 14 mirrored seats also pass
the chain rule (non-empty, bare-distinct), so the stale mirror is a
self-consistent old generation the compiler would still consume — the loud
seam is `--check`, as before. Note also `sync-global-routing.mjs:248-256`
renders the mirror's `main` from the project `l1Alias`, not from
`agentModelOverrides.main` (both are `m_strong` today, so no conflict; the
render path just skips the seat override for main).

**Changed.** None outside this corpus (read-only audit; the mirror is
deliberately left drifted — regenerating is an operator decision).

**Unknown.** Whether a cargo build currently runs clean on the stale mirror
(not run; the earlier entry established the old generation is
self-consistent). The prior global-config bytes behind `dc31bdb2…` (cannot date
the mirror's render). Whether the operator intends to re-sync after the latest
live edit.

Evidence: `readGlobalSeatRouting` executed over both files (14/14 resolved,
chainKey/chainLen per seat printed); JS re-implementation of
`validate_chain` over live-resolved chains and over the committed mirror (all
chain-OK); `node scripts/sync-global-routing.mjs --check` exit 1;
`sha256sum` of both config files; reads cited above. Confidence: high —
resolver and chain-rule results are executed, not inferred.
