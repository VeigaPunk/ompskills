# receipt-naming — Round receipt path, N rule, and launcher ordering

Item: step 7 (`sighting/l1-prompt.md:139-144`) + `roundReceipts`/`verbStatus`.

Observed: path `<stateDir>/rounds/<missionId>-r<N>.md`, `<N>` = 1 + the number of receipt files already present (a literal `<N>` misreports the round). Launcher `roundReceipts` (`tower-fleet.mjs:951-958`) filters names by `startsWith('<missionId>-r') && endsWith('.md')` and sorts by `Number(/r(\d+)\.md$/ ?? 0)` — numeric, so r2 precedes r10; non-numeric names are admitted at key 0 and front the list. `verbStatus` joins receipts to every row (JSON `missions[].rounds` + the text `rounds` column); it parses NO receipt content.
Provenance: the launcher creates only `stateDir` and `sessions/<id>` — no launcher code creates `<stateDir>/rounds`; the agent's write tool auto-creates parents (AUD-07 downgraded to medium). A lost first receipt reads as "zero rounds" and N restarts at 1 silently.
Latent hazard: a missionId that is a proper prefix of a sibling (`tf-audit` vs `tf-audit-routing`) inherits that sibling's receipts.
No canonical heading template exists across the 26 live receipts; the step-7 content slots recur under variable heading names — bind on content slots.

Evidence: `ReceiptNamingRule.md`, `ReceiptOrderingLauncher.md`.
Unknowns: live ext4 readdir tie order [INFERENCE]; dir-creation attribution [INFERENCE].
