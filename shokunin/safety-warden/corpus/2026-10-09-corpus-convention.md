# corpus-convention — corpus-convention — index + entry shape, append-only

Asked: what shape must a new `shokunin/<name>/corpus/` match?
Source: `skill://shokunin`; `shokunin/wall-watcher/corpus/index.md:1,3,5-7` + entries; `shokunin/wave-smith/corpus/index.md:1-3,6-9,11-13` + entries; every card's corpus-protocol section. Lane: `CorpusConvention`.

- Directory: `shokunin/<name>/corpus/`. `index.md` title `# <name> corpus — index` / `# <name> — corpus index`; header row byte-identical everywhere: `| entry | topic | added |`; one entry per assignment named `<YYYY-MM-DD>-<slug>.md`; rows appended in add-order, never reordered; the only non-dated file is `index.md`.
- Entry body (distilled, not a transcript): heading, then **asked / observed** (exact `path:line`, commands, refusal codes) / **changed** / **unknown**. Two observed dialects — wall-watcher bold-label (`**Asked:**` etc., 25/25) and wave-smith plain-label (`Asked:`/`Source: … Lane: X` + `## Not carried by the source` + `## Unknowns`, 28/32 `Lane:`). Either is valid; stay consistent.
- Append-only rule verbatim: "The corpus only grows: never rewrite, reorder, or delete an entry or a row; a later entry that corrects an earlier one says so in its own body." All 8 cards restate it.
- `Lane:` names the writing lane's CamelCase id (not derived from the card name); wall-watcher entries omit it entirely.
- No observed entry uses a heading outside the allowed sets — no invented `Summary`/`Notes`/`References`.

## Unknowns
- Which dialect a new corpus adopts is the author's call (this one adopts the slug-led, `Asked:/Source:/Lane:` + `## Unknowns` dialect).
