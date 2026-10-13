# Prior findings recheck — .tower/comms/findings vs live

Asked (lane CommsFindingsRecheck): re-adjudicate M1/M2-era findings against the
live config (rewritten since; sha `1ef7b233`).

## Verdicts

| finding (file prefix 20261008-worker-*) | verdict |
|---|---|
| audit-bug-8-of-14-ufo-seats-route-to-model-selectors | SPLIT: devin half SUPERSEDED (devin now authenticated, 644 catalog rows, twins served); charm-hyper/stepfun/opencode-go half STILL-TRUE but only in the bundled mirror — live config has 0 unaddressable seat primaries |
| audit-bug-bundled-omp-seat-routing-json-mirror-is-stale | STILL-TRUE: bundled mirror source sha `dc31bdb2` (HEAD) vs live `1ef7b233`; all 14 seats drift; bundled `config.json` still `l1Alias=m_daybreak` vs live `m_strong` |
| hostcfg-bug-effort-suffixes-are-never-checked | STILL-TRUE, structural; mutation `qwen3.8-max:high` passes all gates while catalog declares only low,medium,xhigh |
| audit-bug-l1context-minimumtokens-literal-number | Gate gap STILL-TRUE (`build.rs:533-537` etc. check literal 1000000); the 872K instance SUPERSEDED — live L1 primary has `contextWindow: null`, so the floor is unverifiable rather than violated |
| audit-improve-head-config-comment-overstates-the-parser | Candidate header SUPERSEDED (rewritten); code fact STILL-TRUE — `containsSensitiveShape` only redacts error echoes (`omp-global-config.mjs:208,214`); refusal lives in `prepare-ephemeral-fleet.mjs:163` |
| hostcfg-bug-m1-survey-4-4-swarm-note | Fact STILL-TRUE (note carries no band text); action closed |
| skills-bug-doc-drift | STILL-TRUE: `AGENTS.md:117-126` seat table still prints m_antigravity/m_luna/m_flash/m_zfl/m_daybreak/m_kcode + charm-hyper/opencode-go/stepfun hops; `:154,:162,:166` still print band `16-100` (live is waveMin 16 / waveMax 32, maxLanes 100) |
| wavetest (4 files: sighting usage line, godspeed hook scope, apply --verify, reportDir root) | out of chain scope |

## What this means for cascade-keeper

Carry: bundled-mirror staleness (primary open defect — the compiled mirror
still maps seats to charm-hyper/opencode-go/stepfun routes), effort-gate
blindness, l1-context-unverifiable, and the 7 google dead hops. Dead history:
the 8-of-14 devin/charm-hyper *live* primaries, the 872K L1 value.

## Evidence

- Report `CommsFindingsRecheck.md` (all 11 findings named and adjudicated,
  mirror render compared, mutation test run on a private copy).

## Unknowns

- Whether `sync-global-routing.mjs` regeneration is planned — operator-owned
  decision; the mirror is stale BY policy until then.
