# 2026-10-09 — hub paths and filename grammar

**Asked.** Every comms path constant and filename rule; do real files parse under it?
**Sources.** `protocol__paths.ts.js` (dir constants, `inboxFileName`, `findingFileName`, `reviewFileName`, `missionFileName`, `targetSlug`), `kimi.strings` `dateStamp`/`slugify` (~:1036890-1036898), `protocol__store.ts.js:968-987` `writeUnique`.
**Observed.**
- Constants: `TOWER_ROOT=.tower`, `COMMS_DIR=.tower/comms`, `INBOX_DIR`, `FINDINGS_DIR`, `REVIEWS_DIR`, `MISSIONS_DIR`, `LOG_DIR=…/log`, `WORKTREES_DIR=.tower/worktrees`, `STATE_FILE=…/state.json`, `ACTIVITY_LOG=…/log/activity.log`, `MISSIONS_INDEX=…/MISSIONS.md`, `TOWER_NAME="tower"`; reserved agent names `tower`, `all`.
- `slugify(text,max=60)`: lowercase, runs of `[^a-z0-9]` → `-`, trim dashes, `slice(0,max)`, trim trailing dashes, empty → `item`. Non-ASCII is dropped, not transliterated.
- `dateStamp()` = **local clock** `YYYYMMDD` (`getFullYear/getMonth/getDate`); `dateDash()` = `YYYY-MM-DD` local. Log lines and `sent_at` are UTC ISO — a message sent 00:00–03:00 UTC on this UTC−3 host is named with the previous day.
- `inbox/<YYYYMMDD>-<slug(from,30)>-<slug(to,30)>-<slug(subject,60)>.md`
- `findings/<YYYYMMDD>-<slug(agent,30)>-<slug(type,12)>-<slug(title,60)>.md`
- `reviews/review-<targetSlug(branch)>-<slug(reviewer,30)>-r<round>.md` (`targetSlug` maps `/`,`#` → `-`, leading `#` → `pr`; no date)
- `missions/<id>-<slug(slug)>.md` where the stored slug is `slugify(title,40)` at plan time.
- `writeUnique(rel)`: `open(…,"wx")`; on `EEXIST` retries `<stem>-2<ext>` … `-100`, then throws `could not create a unique file for <rel>`. Callers log the returned name, so `ref=` always points at the real file.
- Replay: 60/61 real files across both hubs reproduce exactly. Mid-word cuts (`…-cannot-addres.md`) are the 60-char slice. The two `-2.md` names in the hubs are subject text (`devin-swe-2`, `2b2c40d-2`), not collision suffixes.
- The single misfit is hub A `inbox/20261008-stray-hub-probe-tower-omp-hub-list-spawns-stray-sessions.md` — see `2026-10-09-stray-inbox-write`.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Whether any collision has ever hit the 100-attempt cap (none visible).

**Lane.** PathsAndNaming (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/PathsAndNaming.md`.
