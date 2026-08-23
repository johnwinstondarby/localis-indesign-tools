# InDesign Tool Suite Ownership Map

**Status:** Provisional scaffold. Ownership is frozen at harmonization step #8.
**Authority:** `localis-indesign-tools`

This file is the suite authority for document-region ownership. Tool repositories link here rather than maintaining independent ownership maps.

Regions with no current owner are recorded explicitly as `UNOWNED`. Overlapping mutation authority is recorded as a conflict until step #8 resolves it.

| Document region / condition | Current owner | Current behavior | Mutation authority | Status | Notes |
|---|---|---|---|---|---|
| Normal+ paragraph outside tables | NormalFix | Detects and remediates eligible Normal+ paragraphs | NormalFix | PROVISIONAL | Existing NormalFix scope |
| Normal+ paragraph inside simple table | TableFix | Table-scoped handling | TableFix | PROVISIONAL | NormalFix excludes paragraphs inside tables |
| Normal+ paragraph inside complex table | UNOWNED | NormalFix excludes table paragraphs; TableFix refuses complex tables | NONE | GAP | Must be resolved at step #8 |
| Table header-row semantics | TableFix | Detects and remediates table header-row state | CONFLICT | OVERLAP | DocStats EPUB-004 currently mutates the same state |
| EPUB-004 header-row finding | DocStats | Reports and currently remediates headerRowCount | CONFLICT | OVERLAP | Step #8 makes EPUB-004 report-only and assigns mutation authority to TableFix |

## Freeze rule

Before mutation adapters beyond NormalFix are adopted, step #8 must resolve every `GAP` and `OVERLAP` relevant to those adapters and freeze this map.
