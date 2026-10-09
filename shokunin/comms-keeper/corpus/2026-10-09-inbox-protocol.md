# 2026-10-09 — the inbox: TowerSend / TowerInbox

**Asked.** Recipients, file template, read selection, read state, notification.
**Sources.** `protocol__store.ts.js:449-516` (`send`, `readInbox`), `tools__send__sendTool.ts.js`, `tools__inbox__inboxTool.ts.js` (`DEFAULT_LIMIT=20`), `protocol__frontmatter.ts.js`, `towerOps.ts.js` (`TowerInboxSent`), `towerService.ts.js:107+`.
**Observed.**
- `to` ∈ {`tower`, `all`, exact roster name} (trimmed, case-sensitive). Unknown → `unknown recipient "<to>" — address a roster agent, tower, or all (known: …)`; writes nothing. Self-send → `cannot send an inbox message to yourself`. Dead roster entries remain valid recipients.
- File = YAML-ish frontmatter (`---` fences, `key: value`, single-line values or a plain `Error`) + blank line + `body.trim()`: `type: inbox`, `message_id` (UUID, never read by anything), `from` (caller's roster name or `tower`), `to`, `subject`, `sent_at` (UTC ISO), optional `scope`, `action`, `consent_ref`, `tokens` (sender's cumulative session tokens, `-1` if unknown).
- Then log `<from> inbox.send to=<to> subject=<slug> tokens=<n> ref=<file>` — written **after** the file.
- `readInbox(caller, limit)`: scans every `inbox/*.md`, keeps `type: inbox`; non-tower reader sees `to == self || to == all` (own broadcasts included); **tower sees everything**; newest first by `sent_at`; tool default 20.
- **No read state**: nothing is marked, moved or deleted; there is no unread count anywhere (TowerStatus counts visible messages, capped at 1000).
- Wake: `TowerInboxSent` published only when caller ≠ tower and `to ∈ {tower, all}`; only the main agent wakes (coalesced, subject cut to 120 chars). Workers are never woken — they must poll `TowerInbox`.
- Verified on hub A `inbox/20261008-tower-worker-hostcfg-m2-amendment-2-m-swe-primary-is-devin-swe-2.md`, `…reviewer-skills-worker-skills-review-result-…`, and the stray file (misfit).
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Whether the observable event bus at `kimi.strings:1012553` is the same `sessionBus`.

**Lane.** SendAndInbox (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/SendAndInbox.md`.
