# 2026-10-09 — findings: TowerFinding

**Asked.** Finding schema, template, and routing.
**Sources.** `protocol__store.ts.js:517-567` `fileFinding`, `tools__finding__finding.ts.js` (schema), `findingTool.ts.js`, `finding.md__raw.js`; all 11 hub-A + 3 hub-B files.
**Observed.**
- `type` ∈ `bug | improve | vuln | idea` (runtime-checked, `:518`). `severity` ∈ `low | medium | high | critical` (schema only; default `medium`). Required: `title, summary, details, suggested_fix`; optional `location` (default `(not specified)`).
- Template: `# Finding: <title>`, `**Date**: YYYYMMDD` (local), `**Agent**`, `**Type**`, `**Severity**`, `**Mission**: <id> — <title>` or `(none)`, `**Tokens**`, `---`, `## Summary`, `## Location`, `## Details`, `## Suggested Fix / Action`, `## Why Not Fixed Directly` (boilerplate scope sentence), `---`, `*Filed by tower agent <name> via \`.tower/comms/findings/\`*`.
- One log line `<agent> finding.file type= slug= tokens= ref=`. **No inbox message** is created; **nothing reads `findings/`**; files carry no status/disposition. Routing is manual tower triage (tool output: "The tower will route it — do not fix out-of-scope issues yourself.").
- All 14 real files pass the template; totals bug 9, improve 5, vuln/idea 0; high 2, medium 7, low 5. The tower filed none.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Whether zod enforces severity at runtime; no tower-filed finding exists.

**Lane.** FindingFile (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/FindingFile.md`.
