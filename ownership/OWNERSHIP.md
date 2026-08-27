# InDesign Tool Suite Ownership Map

**Status:** Step #8 source census ACTIVE. This map is not frozen.
**Authority:** `localis-indesign-tools`
**Opened:** August 26, 2026

This file is the suite authority for document-region ownership, reporting, detection coverage, and remediation authority.

The current table records both normative boundaries and source-verified implementation actuals. A coverage defect does not transfer ownership. A source implementation that exceeds its granted remediation authority is recorded as a conformance defect until corrected.

## Field rules

**Owner:** exactly one tool per region.

**Reporters:** zero or more tools may report a condition without acquiring ownership or mutation authority.

**Detection Coverage:**

- `FULL`
- `PARTIAL`
- `NONE`

A frozen Detection Coverage claim requires `SOURCE_VERIFIED` evidence at minimum.

**Remediation Authority:**

- `NONE`
- `MUTATE_ON_SELECTION`
- `MUTATE_DOCUMENT_WIDE`

**Evidence State:**

- `DOCUMENTED_ONLY`
- `SOURCE_VERIFIED`
- `RUNTIME_VERIFIED`

Evidence state is recorded per row.

## Opening source pins

| Tool | Commit / branch | Source |
|---|---|---|
| NormalFix | `c57a25e94b0aa4a3691a8bff625c76bb2e0516aa` | `NormalFix.jsx` |
| HeaderFix | `6a811800b77d3641a6c03e2f8b18d274d15cc260` | `HeaderFix.jsx` |
| TableFix | `50613a468c0e034953b32007917c953329b4093c` | `TableFix.jsx` |
| DocStats | `7eb2053665e0b736359325c41657e93041191f88`, branch `agent/docstats-v1.1.0` | `DocStats.jsx` |

The TableFix row above is the historical opening pin. The current runtime-verified TableFix production pin is:

| Tool | Current commit | Source | Runtime source SHA-256 |
|---|---|---|---|
| TableFix | `67bea87c99c2bd0214f0330f6c8c5cebdd6f5db8` | `TableFix.jsx` | `FD6CB5E6C9184B846B2738454A53BAA59EC0F6EE959A6505C79FA7CF00B1AFD5` |

## Active census

| Region / condition | Owner | Reporters | Detection Coverage | Remediation Authority | Operator Disposition | Evidence State | Evidence Ref | Census Status |
|---|---|---|---|---|---|---|---|---|
| Verified Normal+ paragraph outside tables (`NF-001`) | NormalFix | NormalFix | FULL | MUTATE_ON_SELECTION | `Fix Selected to Normal` after explicit confirmation | SOURCE_VERIFIED | NormalFix `c57a25e...` `NormalFix.jsx` | CONFORMING |
| Normal paragraph outside tables with unknown override state (`NF-002`) | NormalFix | NormalFix | FULL | NONE | Current source offers Locate but does not explicitly state that no automated remediation exists | SOURCE_VERIFIED | NormalFix `c57a25e...` `NormalFix.jsx` | OPERATOR_MESSAGE_GAP |
| Table paragraph formatting, HIGH visual-header, standard table (`TF-001`) | TableFix | TableFix | FULL within this qualified population | MUTATE_ON_SELECTION | `Fix Selected Tables` after explicit confirmation | RUNTIME_VERIFIED | TableFix `67bea87...` `TableFix.jsx`; v1.2 disposable mutation canary | CONFORMING |
| Table paragraph formatting, REVIEW visual-header candidate (`TF-002`) | TableFix | TableFix | FULL within this qualified population | NONE | Finding explicitly states that no automated remediation is available | RUNTIME_VERIFIED | TableFix `67bea87...` `TableFix.jsx`; v1.2 disposable detection canary | CONFORMING |
| Table paragraph formatting, complex visual-header candidate (`TF-003`) | TableFix | TableFix | FULL within this qualified population | NONE | Finding explicitly states that no automated remediation is available | RUNTIME_VERIFIED | TableFix `67bea87...` `TableFix.jsx`; production scan and v1.2 disposable canary | CONFORMING |
| Table paragraph formatting, standard table with no visual-header qualification (`TF-005` when dirty) | TableFix | TableFix | FULL for paragraph-schema audit; clean tables remain silent | NONE | Dirty tables explicitly state that no automated remediation is available | RUNTIME_VERIFIED | TableFix `67bea87...` `TableFix.jsx`; production page 266 and v1.2 T06 canary | CONFORMING |
| Table paragraph formatting, complex table with no visual-header qualification (`TF-003`) | TableFix | TableFix | FULL for paragraph-schema audit and structural-complexity detection | NONE | Finding explicitly states that no automated remediation is available | RUNTIME_VERIFIED | TableFix `67bea87...` `TableFix.jsx`; production page 335 and v1.2 T03 canary | CONFORMING |
| Table header semantics, HIGH visual-header, standard table | TableFix | TableFix; DocStats (`EPUB-004` when header is absent) | FULL within TableFix-qualified population | MUTATE_ON_SELECTION | TableFix selected remediation after confirmation | SOURCE_VERIFIED | TableFix `67bea87...`; v1.2 T01 mutation canary; DocStats `7eb2053...` | DOCSTATS_MUTATION_CONFLICT |
| Table header semantics, REVIEW visual-header candidate | TableFix | TableFix; DocStats when header is absent | FULL within TableFix-qualified population | NONE | TableFix explicitly states that no automated remediation is available | SOURCE_VERIFIED | TableFix `67bea87...`; v1.2 T02 detection canary; DocStats `7eb2053...` | DOCSTATS_MUTATION_CONFLICT |
| Table header semantics, complex table | TableFix | TableFix; DocStats when header is absent | FULL for structural-complexity detection; header inference remains visual-evidence-bound | NONE | TableFix explicitly states that no automated remediation is available | SOURCE_VERIFIED | TableFix `67bea87...`; production complex-table evidence and v1.2 T03 canary; DocStats `7eb2053...` | DOCSTATS_MUTATION_CONFLICT |
| Table header semantics without qualifying visual-header evidence | TableFix | DocStats (`EPUB-004` when header is absent) | NONE for header inference by design; paragraph, complexity, single-cell, and Registration conditions are detected separately | NONE | No suite tool has authority to infer and set a header row without qualifying evidence | SOURCE_VERIFIED | TableFix `67bea87...`; v1.2 non-visual refusal canary; DocStats `7eb2053...` | DOCSTATS_MUTATION_CONFLICT |
| TableFix required paragraph styles missing or ambiguous (`TF-004`) | TableFix | TableFix | FULL for non-complex audited tables | NONE | Finding explicitly states that no automated remediation is available until required styles resolve | SOURCE_VERIFIED | TableFix `67bea87...` `TableFix.jsx` | CONFORMING |
| Registration swatch used in a non-complex top row (`TF-006`) | TableFix | TableFix | FULL for effective top-row cell/row fill evaluation | NONE | Finding explicitly states that no automated remediation is available and directs replacement with approved process Black | RUNTIME_VERIFIED | TableFix `67bea87...` `TableFix.jsx`; production pages 255, 257, and 562 plus v1.2 T04 canary | CONFORMING |
| Single-cell table (`TF-007`) | TableFix | TableFix | FULL for 1x1 table classification | NONE | Finding explicitly states that no automated remediation is available and directs purpose/format review | RUNTIME_VERIFIED | TableFix `67bea87...` `TableFix.jsx`; production pages 272 and 275 plus v1.2 T05 canary | CONFORMING |
| Required section marker missing (`H1-001`) | HeaderFix | HeaderFix | FULL for the four exact markers across scanned stories | NONE | Current row says `None`; explicit no-automated-remediation wording required | SOURCE_VERIFIED | HeaderFix `6a81180...` `HeaderFix.jsx` | OPERATOR_MESSAGE_GAP |
| Section marker uses wrong paragraph style (`H1-002`) | HeaderFix | HeaderFix | FULL | MUTATE_DOCUMENT_WIDE | Selected or `Fix All Errors`, both confirmation-gated | SOURCE_VERIFIED | HeaderFix `6a81180...` `HeaderFix.jsx` | CONFORMING |
| Section marker has verified local override (`H1-003`) | HeaderFix | HeaderFix | FULL | MUTATE_DOCUMENT_WIDE | Selected or `Clear All Overrides`, both confirmation-gated | SOURCE_VERIFIED | HeaderFix `6a81180...` `HeaderFix.jsx` | CONFORMING |
| Section marker override state cannot be verified (`H1-003` unknown-state path) | HeaderFix | HeaderFix | FULL | NONE | Current source offers Locate but does not explicitly state no automated remediation exists | SOURCE_VERIFIED | HeaderFix `6a81180...` `HeaderFix.jsx` | OPERATOR_MESSAGE_GAP |
| Missing linked asset relink (`DOC-002`) | DocStats | DocStats | FULL for detected missing links | MUTATE_ON_SELECTION | `Relink...` opens explicit replacement selection | SOURCE_VERIFIED_BRANCH | DocStats `7eb2053...` `DocStats.jsx` | SOURCE_AUTHORITY_BLOCK |
| Out-of-date linked asset update (`DOC-003`) | DocStats | DocStats | FULL for detected out-of-date links | MUTATE_ON_SELECTION | `Update link` with confirmation | SOURCE_VERIFIED_BRANCH | DocStats `7eb2053...` `DocStats.jsx` | SOURCE_AUTHORITY_BLOCK |
| Graphic alternate text (`EPUB-001`) | DocStats | DocStats | FULL for scanned graphics resolved to page-item containers | MUTATE_ON_SELECTION | `Set alt text...` prompts for explicit value | SOURCE_VERIFIED_BRANCH | DocStats `7eb2053...` `DocStats.jsx` | SOURCE_AUTHORITY_BLOCK |
| Document title and author metadata (`EPUB-005`, `EPUB-006`) | DocStats | DocStats | FULL for the two currently checked metadata fields | MUTATE_ON_SELECTION | `Set title...` / `Set author...` prompt for explicit value | SOURCE_VERIFIED_BRANCH | DocStats `7eb2053...` `DocStats.jsx` | SOURCE_AUTHORITY_BLOCK |

## Active census defects

### DS-CENSUS-001 — Production source authority unresolved

`DocStats/main` currently contains no `DocStats.jsx`.

The inspected v1.1.0 source resides on branch `agent/docstats-v1.1.0` at commit:

`7eb2053665e0b736359325c41657e93041191f88`

Step #8 may use that source for branch-qualified census evidence. Step #9 cannot begin until the authoritative production source is established on `main`.


### EPUB-004 overlap — DocStats currently exceeds Step #8 authority

DocStats v1.1.0 currently binds `EPUB-004` to `setFirstHeaderRow()` and writes `table.headerRowCount = 1`.

The Step #8 contract grants DocStats reporting authority only for this region and grants it remediation authority `NONE`.

The production source must be changed before the map can freeze.

### TF-CENSUS-002 — TableFix REVIEW severity/classification mismatch

TableFix v1.2 currently emits `REVIEW` in the CSV `Severity` field for `TF-002`, `TF-003`, and `TF-007`.

`SUITE_HARMONIZATION.md` §4 reserves `ERROR`, `WARNING`, `INFO`, and `PASS` for shared severity and describes TableFix `REVIEW` as classification. The finding registry records the current production-emitted values while this discrepancy is active.

AC08-11 and the Step #8 freeze gate remain open until the output and registry contracts agree.

## Closed census defects

### TF-CENSUS-001 — Paragraph audit is gated by visual-header detection — CLOSED / PASS

TableFix v1.2 at commit `67bea87c99c2bd0214f0330f6c8c5cebdd6f5db8` runs the paragraph-style audit independently for every table before header-specific classification.

Production read-only evidence and the disposable v2 canary verified ordinary non-visual, complex, Registration, single-cell, REVIEW, and eligible HIGH-confidence paths. The final published `TableFix.jsx` SHA-256 is `FD6CB5E6C9184B846B2738454A53BAA59EC0F6EE959A6505C79FA7CF00B1AFD5`.

## Freeze rule

Step #8 remains ACTIVE until all AC08 criteria in `SUITE_HARMONIZATION.md` pass.

Before mutation adapters beyond NormalFix are adopted:

- every region in the census universe has exactly one owner;
- all frozen Detection Coverage claims are source-verified or runtime-verified;
- no mutation overlap remains;
- every reported `NONE` condition tells the operator that no automated remediation exists;
- TableFix paragraph auditing covers all tables before header-specific gates are applied; this item is complete in v1.2;
- TableFix severity/classification output agrees with the shared finding model;
- DocStats `EPUB-004` no longer mutates header state;
- the cross-tool ownership canary passes; and
- this file is explicitly changed from ACTIVE to FROZEN.
