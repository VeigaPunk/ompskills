# sighting-test-pins — the ephemeral arms of `ufo-sighting.test.js`

Asked: enumerate the ephemeral-related tests and their assertions. Source:
`tests/ufo-sighting.test.js:1290-1582`. Lane `SightingTestPins` (reviewer).

Subset run: `node --test --test-name-pattern 'ephemeral' tests/ufo-sighting.test.js`
→ 4/4 pass (node v24.21.0, bwrap 0.11.2 present). The full 4682-line tmux-wall
suite was **not** run (skip-if-heavy per assignment).

Tests:
1. "ephemeral creator captures dirty nonignored state in a remote-free normal
   clone" (1290-1353) — dirty carried (1310-1311), gitignored excluded
   (1312-1313), `.git` directory + common-dir `.git` + empty remote (1314-1316),
   `sourceHead` (1317), digest `/^[a-f0-9]{64}$/` (1318), every `pathVariables`
   value under the mission dir (1322-1324), envFile 0600 (1320), mission dir /
   path-var dirs 0700 (1321,1326), `OPENCODE_DB` file 0600 (1328-1329), resolver
   snapshot 0600 (1334-1335), isolation `.gitignore` 0600 (1337).
2. "ephemeral preparation rejects escaping symlinks and environment traversal,
   secrets, and symlink swaps" (1355-1396) — escaping source symlink throws
   `/symlink escapes/` with zero root mutation (1368-1369); HOME traversal,
   `OPENAI_API_KEY` secret, and HOME symlink swap all throw
   `{code:"INVALID_ENVIRONMENT"}` (1382, 1387, 1392).
3. "ephemeral child environment is isolated while manifests without it remain
   valid" (1398-1478) — HOME+OPENCODE_CONFIG_DIR from stored (1417-1418),
   `OPENCODE_DISABLE_EXTERNAL_SKILLS="true"` (1419), no `OPENAI_API_KEY` (1420),
   `SSH_AUTH_SOCK=""` (1421), `GITHUB_TOKEN=""` (1422),
   `GIT_CONFIG_GLOBAL/SYSTEM="/dev/null"` (1423-1424), ambient HOME untouched
   (1437); bwrap argv: the resolver snapshot is bound via a preceding `--ro-bind`
   (1432-1434), target under `/etc|/run` (1435), **no** wholesale `--ro-bind
   /run` (1436). The prefix flags (`--die-with-parent`/`--new-session`/
   `--unshare-*`/`--clearenv`) are **not** pinned by this file. A manifest
   without `environment` validates unchanged (1470-1471).
4. "ephemeral destroy is confined, marker-guarded, and refuses active roots"
   (1549-1582) — marker path = missionRoot + policy.marker (1563); `active` +
   activePids → destroy `/active/` (1565-1570); restored marker → destroy returns
   `{destroyed}` and the root is gone (1577-1578); a foreign unmarker'd dir
   throws (1558-1562).

Negative findings: **zero** `SANDBOX_UNAVAILABLE` occurrences (absent-bwrap
refusal unpinned here); the cwd/substrate guard refusals (ufo-sighting:4195-4200)
unpinned; the `allowedMarkerStates=["prepared"]` gate (84) and the marker schema
attestation (127-133) unexercised; `UFO_PEEK_MARKER_42` / `UFO_STEER_MARK_7` /
attach markers are pane-capture markers, **not** the ephemeral isolation marker.
The fixture helper's only ephemeral touch is copying
`config/ephemeral-l1.machine.json` into scratch projects because the module loads
the policy at import time (fixture.mjs:68-72; base.mjs:245).

## Unknowns

- Whether other substrate suites pin the gaps above.