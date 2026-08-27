# InDesign Tool Suite Decision Ledger

**Status:** FINAL REVIEW APPLIED, AWAITING JOHANN'S APPROVAL
**Planned canonical location:** repository root, `localis-indesign-tools/DECISIONS.md`
**Review circle:** Johann Darby, Daisy, Pilgrim
**Created:** 2026-08-27
**Scope:** Durable architecture, authority, safety, schema, evidence, and sequencing decisions for the Localis InDesign tool suite.

This ledger records accepted decision milestones. Discussion, alternatives, and exploratory hypotheses stay in review notes and chat history. When later evidence changes a decision, the original entry remains and a new entry identifies the superseded decision.

The ledger does not replace:

- `SUITE_HARMONIZATION.md`, which remains the authoritative suite specification and adoption sequence.
- `ownership/OWNERSHIP.md`, which remains the authoritative ownership, reporting, detection-coverage, and remediation-authority map.
- `codes/CODES.csv`, which remains the authoritative finding-code registry.
- Tool repositories and Git history, which remain the authoritative implementation record.

## Ledger rules

Each decision entry records:

- decision ID;
- date or backfill period;
- status;
- decided by;
- scope;
- decision;
- rationale;
- consequences;
- evidence or implementation references;
- supersession relationship, when applicable.

Decision IDs are independent of harmonization step numbers so the record survives later sequencing changes.

Accepted decisions are append-only. Editorial corrections may clarify wording without changing intent. A changed intent requires a new decision entry.

`Decided by` records who made the call, not who first raised it. Johann Darby holds editorial authority for the suite; entries decided on his instruction record him regardless of which reviewer proposed the option.

The `Supersedes` field references decision IDs. Where a decision replaces an unrecorded prior practice rather than a ledger entry, that belongs in Rationale and `Supersedes` reads `None`.

Status values are:

- `OPEN`: a decision remains unresolved.
- `ACCEPTED`: the decision is approved and normative.
- `ACCEPTED / IMPLEMENTATION PENDING`: the decision is approved but required implementation work remains.
- `ACCEPTED / IMPLEMENTED`: the approved behavior is implemented but this entry does not claim independent runtime verification.
- `ACCEPTED / VERIFIED`: the approved behavior is implemented and supported by the cited verification evidence.

## Decision index

| ID | Decision | Date | Status |
|---|---|---|---|
| DEC-001 | Use executable evidence before freezing uncertain host behavior | 2026-08 | ACCEPTED |
| DEC-002 | Keep source modular and ship one generated installable script | 2026-08 | ACCEPTED |
| DEC-003 | Make `localis-indesign-tools` the sole authority for shared-core source | 2026-08-26 | ACCEPTED |
| DEC-004 | Make ScriptWatch mandatory horizontal observability, without document ownership | 2026-08 | ACCEPTED |
| DEC-005 | Route suite document mutation through the shared transactional `core/mutate` contract | 2026-08 | ACCEPTED |
| DEC-006 | Use exact-or-refuse object identity with version-bound host qualification | 2026-08 | ACCEPTED |
| DEC-007 | Keep finding codes stable and globally unique while keeping Severity suite-wide | 2026-08 | ACCEPTED |
| DEC-008 | Separate ownership, reporting, detection coverage, and remediation authority | 2026-08-26 | ACCEPTED |
| DEC-009 | Allow one owner and many reporters, while prohibiting mutation overlap | 2026-08-26 | ACCEPTED / IMPLEMENTATION PENDING |
| DEC-010 | Freeze the remediation-authority vocabulary and require explicit operator refusal for `NONE` | 2026-08-26 | ACCEPTED |
| DEC-011 | Assign TableFix ownership of table paragraph formatting and table header semantics | 2026-08-26 | ACCEPTED |
| DEC-012 | Decouple TableFix paragraph auditing from visual-header qualification | 2026-08-27 | ACCEPTED / IMPLEMENTED |
| DEC-013 | Preserve TableFix selection-only mutation authority for eligible HIGH-confidence standard tables | 2026-08-27 | ACCEPTED / VERIFIED |
| DEC-014 | Distinguish process Black, Registration, complex tables, and single-cell tables in TableFix | 2026-08-27 | ACCEPTED / VERIFIED |
| DEC-015 | Keep DocStats source-authority uncertainty separate from Step #8 census work | 2026-08-26 | ACCEPTED |
| DEC-016 | Separate suite Severity from tool-specific Classification | 2026-08-27 | ACCEPTED / IMPLEMENTATION PENDING |
| DEC-017 | Add bidirectional registry-versus-implementation conformance as a suite rule | 2026-08-27 | ACCEPTED / IMPLEMENTATION PENDING |
| DEC-018 | Derive every verification independently of the thing it verifies | 2026-08 | ACCEPTED |
| DEC-019 | Require that a test and a gate be able to fail | 2026-08 | ACCEPTED |
| DEC-020 | Require production-resident evidence for object-valued and container-sensitive state | 2026-08 | ACCEPTED |
| DEC-021 | Complete read-only evidence before production mutation | 2026-08 | ACCEPTED |
| DEC-022 | Bind every claim to the artifact and host that produced it | 2026-08 | ACCEPTED |
| DEC-023 | Preserve failure history, including whether each defect was loud or silent | 2026-08 | ACCEPTED |
| DEC-024 | Group Undo at batch level and rollback at item level | 2026-08 | ACCEPTED / VERIFIED |
| DEC-025 | Require every mutation target to end in one named state | 2026-08 | ACCEPTED / VERIFIED |
| DEC-026 | Refuse to mutate a target whose snapshot is not rollback-ready | 2026-08 | ACCEPTED / VERIFIED |
| DEC-027 | Make resolution failure stage-sensitive | 2026-08 | ACCEPTED / VERIFIED |
| DEC-028 | Distinguish identified objects from referenced objects | 2026-08 | ACCEPTED / VERIFIED |
| DEC-029 | Amend `core/identity` for KinsokuTable and MojikumiTable after freeze | 2026-08-27 | ACCEPTED / VERIFIED |
| DEC-030 | Carry liveness in motion and condition in colour, on independent axes | 2026-08 | ACCEPTED |
| DEC-031 | Drive instrument motion from sample arrival, never from a free-running timer | 2026-08 | ACCEPTED / IMPLEMENTED |
| DEC-032 | Require that indicators be able to disagree | 2026-08 | ACCEPTED / IMPLEMENTATION PENDING |
| DEC-033 | Separate authored instrument artwork from telemetry semantics | 2026-08 | ACCEPTED / IMPLEMENTED |
| DEC-034 | Require source verification before recording detection coverage | 2026-08-26 | ACCEPTED |
| DEC-035 | HeaderFix document-wide mutation authority | 2026-08-27 | OPEN |

---

## DEC-001 - Use executable evidence before freezing uncertain host behavior

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Suite engineering method

### Decision

Uncertain InDesign host behavior is resolved with executable evidence before a suite contract is frozen.

The standard sequence is:

1. identify the unsafe or ambiguous behavior;
2. build a fixture that expresses expected behavior and refusal behavior;
3. run it against the pinned InDesign host;
4. record independent read-back, rollback, Undo, observer, census, or discrimination evidence as applicable;
5. freeze only the behavior supported by that evidence.

### Rationale

Review and reasoning define the hypothesis. Canary, census, discrimination, refusal, rollback, and read-back evidence determine whether the hypothesis becomes a suite contract.

### Consequences

- Host assumptions require qualification.
- Frozen contracts retain host/version boundaries where applicable.
- Executable defects can reopen a frozen boundary.
- Review consensus alone does not establish uncertain DOM behavior.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §1 Evidence-first engineering rule.
- NormalFix production-discrimination work.
- `core/mutate` real-DOM canaries.
- `core/identity` adversarial refusal and anonymous-Color qualification.

### Supersedes

None.

---

## DEC-002 - Keep source modular and ship one generated installable script

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Distribution architecture

### Decision

Shared and tool-specific source stays modular during development. Distribution is one generated `.jsx` file per shipping tool.

### Rationale

ExtendScript has no package manager, while the practitioner installation model should remain one-file simple. Generated single-file output also makes installed-artifact parity and version stamping directly verifiable.

This replaces the long-term model of per-tool copied helper implementations.

### Consequences

- Shared modules live in the suite repository.
- Tool repositories consume shared source plus tool-specific source.
- The build inliner produces `dist/ToolName.jsx`.
- CI verifies generated artifact freshness and source/version parity.
- ScriptWatch Harness components are inlined into shipping suite artifacts.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §2 Distribution model.
- Master adoption sequence Step #14.

### Supersedes

None.

---

## DEC-003 - Make `localis-indesign-tools` the sole authority for shared-core source

**Date:** 2026-08-26, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Source authority

### Decision

After creation of `localis-indesign-tools`, new shared modules are developed only in the shared repository. Tool repositories consume shared source and do not fork copied shared implementations.

### Rationale

The harmonization effort exists because independently copied helpers diverged and produced tool-specific defects.

This replaces DocStats as the temporary location for the harmonization specification.

### Consequences

- `localis-indesign-tools` is the canonical suite repository.
- `SUITE_HARMONIZATION.md`, shared registries, shared core, and ownership artifacts live there.
- Tool repositories link to or consume shared artifacts instead of carrying divergent authoritative copies.
- `CONTRIBUTING.md` repeats this permanent source-authority rule.

### Evidence / references

- Master adoption sequence Step #5, CLOSED / PASS.
- `SUITE_HARMONIZATION.md` canonical-location and permanent source-authority statements.

### Supersedes

None.

---

## DEC-004 - Make ScriptWatch mandatory horizontal observability, without document ownership

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Observability architecture

### Decision

Every shipping Localis InDesign suite script carries the pinned ScriptWatch Harness contract. ScriptWatch remains horizontal observability infrastructure and owns no document region.

Agentless process/host telemetry and in-script Harness telemetry remain independent views.

### Rationale

Operational telemetry and semantic job state are both useful, but neither should acquire document ownership or replace mutation-safety controls.

### Consequences

- ScriptWatch observes DocStats, HeaderFix, NormalFix, TableFix, StyleFix when adopted, and future suite tools.
- Observation failure cannot stop tool work.
- `core/mutate` remains authoritative for mutation safety.
- Disagreement between agentless and Harness observations can itself be a finding.
- Build enforcement occurs in the generated distribution system.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §3.9 and §8.1.
- Master adoption sequence Step #1, CLOSED / PASS.

### Supersedes

None.

---

## DEC-005 - Route suite document mutation through the shared transactional `core/mutate` contract

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Mutation safety

### Decision

Document changes performed by suite tools pass through a shared mutation transaction with:

- target re-resolution;
- precheck;
- snapshot;
- mutation;
- independent verification;
- rollback;
- durable mutation journal;
- batch hard-stop behavior when safe continuation cannot be established;
- one-step InDesign Undo grouping.

Snapshot state used for restoration and digest evidence used for verification remain independently derived.

### Rationale

A write returning without an exception does not prove the document reached the intended state. Verification must re-read live state, and rollback must restore independently captured state.

This replaces independent per-tool mutation patterns that lacked shared rollback and verification semantics.

### Consequences

- Mutation success requires read-back verification.
- Failed verification cannot leave an undocumented partial mutation.
- Batch-level Undo is part of the contract.
- Tool-specific mutation adapters consume the shared core contract.
- NormalFix is the first production adapter and conformance reference.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §3.5 and §8.2.
- NormalFix adapter `0.1.0-dev3`.
- NormalFix commits `b1a849cd7b1cc4f8a7584a958765f0b1061b99e4` and `c57a25e94b0aa4a3691a8bff625c76bb2e0516aa`.
- Step #7 closure commit `2fa7de5f7858af0f17069046d50af684f7671c2c`.

### Supersedes

None.

---

## DEC-006 - Use exact-or-refuse object identity with version-bound host qualification

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** `core/identity`

### Decision

Object-valued state is serialized to plain data and resolved by family-specific semantic identity. Resolution is exact or refused.

Supplemental IDs do not override semantic identity for identified objects. Anonymous document-owned Color resolution is document-bound and requires exact agreement on its qualified identity tuple.

Host properties such as anonymous-Color ID non-reuse are version-bound evidence, not general InDesign assumptions.

### Rationale

Live ExtendScript host references and loose identity matching can survive object replacement or resolve the wrong object while appearing valid.

This replaces unrecorded prior practice: loose host-reference identity and fallback resolution by value or collection index.

### Consequences

- Shared snapshots do not store live host references as authoritative identity.
- Unknown host families return `UNSUPPORTED_TYPE`.
- Stage-sensitive resolution failure remains binding.
- Future supported InDesign hosts rerun qualification gates for version-bound identity properties.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §3.10.
- `docs/NORMALFIX_OBJECT_IDENTITY_CONTRACT_v0_2.md`.
- Master adoption sequence Step #4, CLOSED / FROZEN.

### Supersedes

None.

---

## DEC-007 - Keep finding codes stable and globally unique while keeping Severity suite-wide

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Finding model

### Decision

Finding codes are globally unique across the suite but do not have to encode their owning tool in the prefix.

Published codes retain stable meaning. A materially changed meaning receives a new code.

Suite Severity remains one cross-tool axis:

- `ERROR`
- `WARNING`
- `INFO`
- `PASS`

### Rationale

Existing DocStats family codes already have published meaning. Tool-named prefixes would break stability without improving ownership because the registry already carries a Tool field.

A shared severity vocabulary allows cross-suite sorting and reporting.

This rejects the proposed rule that every finding-code prefix must identify its tool.

### Consequences

- `codes/CODES.csv` is the suite registry.
- Code ownership is explicit in the Tool column.
- Existing DocStats families remain valid.
- HeaderFix retains `H1-`.
- Tool-specific classifications do not enter Severity.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §4.

### Supersedes

None.

---

## DEC-008 - Separate ownership, reporting, detection coverage, and remediation authority

**Date:** 2026-08-26, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Step #8 ownership model

### Decision

Each ownership row separates four independent concepts:

- **Owner:** normative responsibility for the document region.
- **Reporters:** zero or more tools that may report a condition there.
- **Detection Coverage:** empirical coverage of the current implementation.
- **Remediation Authority:** maximum permitted document-change authority.

Evidence state is recorded per row rather than per tool.

### Rationale

Earlier ownership language mixed responsibility, current implementation coverage, reporting, and mutation permission. Those concepts can differ without transferring ownership.

This replaces earlier ownership prose that conflated responsibility, reporting, coverage, and mutation permission.

### Consequences

- A detection gap does not create a new owner.
- A reporting tool does not gain mutation authority by reporting.
- Evidence state can differ across regions within one tool.
- Frozen Detection Coverage requires at least source verification.
- The census universe includes detected, mutated, excluded, claimed, and cross-tool overlap regions.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §5.
- `ownership/OWNERSHIP.md`, Field rules.

### Supersedes

None.

---

## DEC-009 - Allow one owner and many reporters, while prohibiting mutation overlap

**Date:** 2026-08-26, backfilled
**Status:** ACCEPTED / IMPLEMENTATION PENDING
**Decided by:** Johann Darby
**Scope:** Step #8 ownership model

### Decision

Every region in the census universe has exactly one owner.

Reporting overlap is permitted.

Mutation overlap is prohibited.

Ownership follows the stable document region rather than the current detector.

### Rationale

Multiple tools can surface useful evidence about one region, but mutation authority must remain unambiguous.

This rejects any model in which reporting overlap implies co-ownership.

### Consequences

- Cross-tool reporting is legal.
- Conflicting mutation paths are Step #8 conformance defects.
- DocStats may report table-header-semantic conditions without acquiring TableFix ownership.
- A tool implementation that exceeds granted mutation authority must be corrected before the ownership map freezes.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §5 One owner, many reporters.
- `ownership/OWNERSHIP.md`.

### Supersedes

None.

---

## DEC-010 - Freeze the remediation-authority vocabulary and require explicit operator refusal for `NONE`

**Date:** 2026-08-26, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Step #8 authority and operator contract

### Decision

Remediation Authority uses exactly:

- `NONE`
- `MUTATE_ON_SELECTION`
- `MUTATE_DOCUMENT_WIDE`

`REPORT_ONLY` is not a remediation-authority value.

Every reported condition with authority `NONE` explicitly tells the operator that no automated suite remediation exists.

### Rationale

Reporting and mutation permission are separate axes. A disabled or absent button does not clearly communicate an intentional refusal boundary.

This replaces open-ended remediation-authority wording such as `NONE until ...` inside the authority field.

### Consequences

- Operator disposition is required for `NONE` findings.
- Generic disabled UI does not satisfy the rule.
- Existing operator-message gaps remain Step #8 defects until corrected.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §5.
- `ownership/OWNERSHIP.md`, Field rules and Freeze rule.

### Supersedes

None.

---

## DEC-011 - Assign TableFix ownership of table paragraph formatting and table header semantics

**Date:** 2026-08-26, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Table ownership

### Decision

TableFix owns:

- paragraph formatting inside tables;
- table header-row semantics.

NormalFix excludes paragraphs inside tables.

DocStats may report missing table-header semantics through `EPUB-004`, but DocStats remediation authority for that region is `NONE`.

### Rationale

Ownership follows the stable table region. The TableFix detector determines coverage, not ownership. DocStats has useful EPUB reporting context but should not independently mutate a region owned by TableFix.

This replaces the implicit co-ownership of table header semantics between TableFix and DocStats.

### Consequences

- TableFix detection gaps stay TableFix gaps.
- DocStats `EPUB-004` mutation of `headerRowCount` is a conformance defect.
- `EPUB-004` remains a reporter path after mutation authority is removed.
- The ownership map cannot freeze until the DocStats mutation conflict is removed.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §5 Table header semantics.
- `ownership/OWNERSHIP.md`, active census.
- DocStats branch-qualified source at `7eb2053665e0b736359325c41657e93041191f88`.

### Supersedes

None.

---

## DEC-012 - Decouple TableFix paragraph auditing from visual-header qualification

**Date:** 2026-08-27
**Status:** ACCEPTED / IMPLEMENTED
**Decided by:** Johann Darby
**Scope:** TableFix v1.2, `TF-CENSUS-001`

### Decision

Paragraph auditing runs independently for every table before header-specific classification.

Visual-header qualification continues to govern header inference and automatic remediation rather than paragraph-audit reach.

### Rationale

The opening Step #8 census showed that TableFix owned paragraph formatting inside all tables while the prior implementation could return before paragraph auditing when no visual-header candidate existed.

The correction belongs inside TableFix detection, not in the ownership map.

This replaces the TableFix v1.1 detection ordering in which paragraph auditing was downstream of the visual-header gate.

### Consequences

- Ordinary non-visual tables receive paragraph-schema audit.
- Complex, Registration, single-cell, and other non-HIGH populations remain detectable without acquiring mutation authority.
- Clean non-visual tables may remain silent while still contributing to required cross-table census counters.
- `TF-CENSUS-001` is CLOSED / PASS.

### Evidence / references

TableFix:

- v1.2 published commit `67bea87c99c2bd0214f0330f6c8c5cebdd6f5db8`.
- final `TableFix.jsx` SHA-256 `FD6CB5E6C9184B846B2738454A53BAA59EC0F6EE959A6505C79FA7CF00B1AFD5`.
- production read-only scan of 108 tables.
- disposable T01-T07 canary.
- selected T01 mutation and automatic rescan.

Shared suite:

- `localis-indesign-tools` commit `fc0dad6fd96b100a213efee9ea5d2f91c838877e`.
- `SUITE_HARMONIZATION.md`, §9.2.
- `ownership/OWNERSHIP.md`, Closed census defects.

### Supersedes

None.

---

## DEC-013 - Preserve TableFix selection-only mutation authority for eligible HIGH-confidence standard tables

**Date:** 2026-08-27
**Status:** ACCEPTED / VERIFIED
**Decided by:** Johann Darby
**Scope:** TableFix remediation boundary

### Decision

TableFix automatic remediation remains limited to explicitly selected, HIGH-confidence, non-complex eligible tables.

No TableFix document-wide Fix All path is introduced.

REVIEW, complex, Registration, single-cell, and non-visual paragraph-only populations have remediation authority `NONE` under the current v1.2 contract.

### Rationale

Detection coverage can expand without expanding mutation authority. Header inference and normalization require a stronger evidence threshold than reporting.

### Consequences

- `TF-001` is selection-fixable.
- `TF-002`, `TF-003`, `TF-004`, `TF-005`, `TF-006`, and `TF-007` carry no current automated TableFix remediation path.
- Runtime evidence must continue to prove refusal paths as well as successful mutation paths.

### Evidence / references

- TableFix v1.2 `fixOneTable()` HIGH/non-complex guard.
- Disposable canary T01-T07.
- `ownership/OWNERSHIP.md`, TableFix active-census rows.

### Supersedes

None.

---

## DEC-014 - Distinguish process Black, Registration, complex tables, and single-cell tables in TableFix

**Date:** 2026-08-27
**Status:** ACCEPTED / VERIFIED
**Decided by:** Johann Darby
**Scope:** TableFix classification and refusal behavior

### Decision

TableFix distinguishes these conditions instead of collapsing them into standard HIGH-confidence header handling:

- `TF-003`: structurally complex merged/spanned or multi-header-row table;
- `TF-006`: Registration used in a non-complex top row;
- `TF-007`: single-cell 1x1 table.

Registration is semantically distinct from process Black and does not qualify as process Black.

Single-cell tables remain explicit review-only cases rather than disappearing through an exclusion.

Complexity takes precedence where structural complexity applies.

### Rationale

Visual similarity is insufficient for semantic equivalence. Registration and process Black have different publishing meanings. A 1x1 structure commonly serves a layout purpose. Complex tables require separate review because automatic header inference is unsafe.

This replaces any implicit rule equating Registration with process Black or silently excluding 1x1 tables.

### Consequences

- Registration refusal is explicit.
- 1x1 tables are visible to the operator as `TF-007`.
- Complex tables remain non-remediable by TableFix automation.
- Production pages 255, 257, 562, 272, 275, and 335 established representative cases.

### Evidence / references

- TableFix v1.2 production read-only scan.
- T03, T04, and T05 disposable canary cases.
- Shared suite commit `fc0dad6fd96b100a213efee9ea5d2f91c838877e`.

### Supersedes

None.

---

## DEC-015 - Keep DocStats source-authority uncertainty separate from Step #8 census work

**Date:** 2026-08-26, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** DocStats sequencing

### Decision

`DS-CENSUS-001` does not block Step #8 documentation, source census, and ownership analysis.

It blocks Step #9 production adoption until authoritative DocStats production source is established on `main`.

Branch-qualified DocStats evidence may be used during Step #8 when labeled accordingly.

### Rationale

The ownership census can inspect and record known branch source while preserving the distinction between evidence and production authority.

This rejects sequencing that would stop all Step #8 census work solely because DocStats `main` lacks the inspected production script.

### Consequences

- DocStats branch `agent/docstats-v1.1.0` at `7eb2053665e0b736359325c41657e93041191f88` remains branch-qualified evidence.
- Step #9 cannot begin against unresolved production-source authority.
- `SOURCE_VERIFIED_BRANCH` remains an active census qualifier until the source-authority defect closes.

### Evidence / references

- `SUITE_HARMONIZATION.md`, §5 Source authority.
- `ownership/OWNERSHIP.md`, `DS-CENSUS-001`.

### Supersedes

None.

---

## DEC-016 - Separate suite Severity from tool-specific Classification

**Date:** 2026-08-27
**Status:** ACCEPTED / IMPLEMENTATION PENDING
**Decided by:** Johann Darby
**Scope:** Suite finding schema, `TF-CENSUS-002`

### Decision

The suite Severity enum remains:

- `ERROR`
- `WARNING`
- `INFO`
- `PASS`

`REVIEW` remains a TableFix Classification and is not added to Severity.

The finding record, CSV output, reports, and `codes/CODES.csv` gain a separate `Classification` field.

Severity tracks reader or output consequence across the suite. Classification tracks tool-specific interpretation, confidence, or action category.

Remediation Authority remains a third, independent axis.

### TableFix mapping

| Code | Severity | Classification | Current remediation authority |
|---|---|---|---|
| TF-001 | WARNING | HIGH | MUTATE_ON_SELECTION |
| TF-002 | WARNING | REVIEW | NONE |
| TF-003 | WARNING | REVIEW | NONE |
| TF-004 | ERROR |  | NONE |
| TF-005 | WARNING |  | NONE |
| TF-006 | WARNING |  | NONE |
| TF-007 | INFO | REVIEW | NONE |

### Rationale

A shared Severity axis must retain one meaning across tools.

`REVIEW` describes TableFix confidence or interpretation, not suite-wide urgency. Extending Severity with `REVIEW` would mix incompatible dimensions and make cross-tool sorting ambiguous.

TF-002 and TF-003 share WARNING because each can produce reader-facing header-semantic or accessibility consequences even though their classifications differ.

TF-007 is INFO because a 1x1 table commonly represents an intentional layout structure that still deserves verification.

This replaces the TableFix v1.2 output behavior that emits `REVIEW` in the CSV `Severity` field for TF-002, TF-003, and TF-007.

### Consequences

- `codes/CODES.csv` schema becomes:
  `Code,Tool,Family,Severity,Classification,Meaning,Remediable,OwnershipRegion`
- TableFix finding records emit Severity and Classification separately.
- Reports surface both fields.
- Reports also surface remediation availability so severity is never interpreted as fixability. With `REVIEW` removed from Severity, TF-002 and TF-003 join TF-001, TF-005, and TF-006 in the WARNING band, while TF-007 is INFO. Severity therefore cannot imply whether TableFix will remediate a finding. That distinction lives in Remediation Authority and the operator message.
- StyleFix can later use tool-specific classifications such as LOW, MEDIUM, HIGH, and REPLACE without polluting Severity.
- `TF-CENSUS-002` stays open until implementation and acceptance evidence pass.

### Evidence / references

- Daisy review, 2026-08-27.
- Existing suite rule in `SUITE_HARMONIZATION.md`, §4.
- Current `TF-CENSUS-002` in `ownership/OWNERSHIP.md`.

### Supersedes

None.

---

## DEC-017 - Add bidirectional registry-versus-implementation conformance as a suite rule

**Date:** 2026-08-27
**Status:** ACCEPTED / IMPLEMENTATION PENDING
**Decided by:** Johann Darby
**Scope:** Finding-registry conformance

### Decision

Finding conformance is checked in both directions.

For TableFix and eventually every suite tool:

1. each emitted code must match the Severity and Classification declared for that code in `codes/CODES.csv`;
2. each emitted Severity must belong to the frozen suite enum;
3. each emitted Classification must belong to that tool's admitted classification vocabulary or be blank;
4. every registry code for the tool must be exercised or explicitly accounted for by the acceptance fixture;
5. no registry row may declare a Severity outside the frozen enum.

### Rationale

A self-consistent implementation can agree with itself while disagreeing with the authoritative registry. Reverse registry checking catches drift that implementation-local assertions cannot detect.

The reverse direction is the load-bearing half. A suite that tests only what it declares will always pass. Every coverage gap found in this project was found by comparing two independently derived things: the scanner against a census, a rollback digest against a snapshot, and a frozen key registry against an identity layer. This decision is the specific application of DEC-018 to the finding registry.

This replaces one-direction-only registry checks.

### Consequences

- The existing TableFix T01-T07 disposable canary is reused for `TF-CENSUS-002`.
- No new TableFix fixture is required solely for the Severity/Classification split.
- Registry-versus-implementation validation becomes a reusable suite gate for HeaderFix, NormalFix, DocStats, TableFix, and StyleFix.
- AC08-11 remains open until current Step #8 registry and production behavior agree.

### Acceptance evidence for `TF-CENSUS-002`

The TableFix canary must prove:

- every emitted Severity is `ERROR`, `WARNING`, `INFO`, or `PASS`;
- every emitted Classification is `HIGH`, `REVIEW`, or blank;
- each T01-T07 finding carries the expected pair;
- each emitted code matches `codes/CODES.csv`;
- each TableFix registry row has a valid Severity;
- no TableFix code emits a Severity absent from the frozen enum;
- `NONE` remediation findings continue to communicate that no automated remediation is available.

### Evidence / references

- Daisy review, 2026-08-27.
- Current Step #8 AC08-11 requirement.
- Identity-work precedent for independent forward/reverse conformance gates.

### Supersedes

None.

---

# Method decisions

The entries above record what the suite is. The entries in this section record how the
suite establishes that a claim is true. Several consequential coverage defects were found
by these rules, and peer review also exposed cases where an independent check was missing.
The methods are therefore recorded as decisions in their own right rather than only as
consequences of the contracts that apply them.

---

## DEC-018 - Derive every verification independently of the thing it verifies

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Suite engineering method

### Decision

A verification must not share code, a property list, a traversal path, or a derivation
with the artifact it verifies.

Concretely:

- a fixture census is assembled by a path that does not route through the scanner's own
  traversal code;
- `rollbackDigest()` is derived independently of `snapshot()`, and comparing the same
  property list against itself does not constitute proof;
- `digestCoverage()` is enforced against the emitted digest key set rather than accepted
  as a declaration;
- a frozen registry whose values can be host objects asserts its coverage against the
  identity layer at startup;
- finding conformance is checked in both directions, registry to implementation and
  implementation to registry.

### Rationale

A verification that shares a derivation with its subject inherits the subject's blind
spots and reports agreement. That agreement is indistinguishable from correctness and is
more dangerous than no verification at all, because it produces confidence.

The recurring pattern is that self-consistent checks can miss their own blind spots.
Several consequential defects were exposed by comparing independently derived evidence,
while peer review exposed cases where that independent comparison was missing.

### Consequences

- New verification layers state what they are independent of.
- A gate that cannot name an independent derivation is not a gate.
- Independence is a reviewable property of a test design, not an implementation detail.
- This rule generates DEC-017 and constrains every future canary, census, and gate.

### Evidence / references

- Table-cell traversal blind spot, found by peer review of an unverified assumption.
- `core/mutate` T07, proving `verifyRollback` is not circular.
- `core/identity` gate #5, registry-to-identity coverage, 243 keys and 25 bindings.
- StyleFix E02, an unsafe LOW admitted by a completeness gate that could only report YES.

### Supersedes

None.

---

## DEC-019 - Require that a test and a gate be able to fail

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Suite engineering method

### Decision

Every fixture carries negative controls as well as positive ones, and every completeness
gate has a credible path to `NO`.

A canary states which of its cases must fail and which must pass. A suite composed only
of cases that must pass proves nothing about discrimination, because an implementation
broken toward caution satisfies it completely.

A gate that reports only success is documentation, not a gate.

### Rationale

A scanner that classifies nothing as safe passes a positive-only canary while being
useless. A completeness gate whose only evidence is the absence of a thrown exception
certifies silence rather than coverage.

Both failures were observed in this project before the rule was adopted.

### Consequences

- Fixture specifications name the exact set of results permitted to be negative.
- Gate definitions name the condition that would produce `NO`.
- Deliberate defect injection is a required fixture case, not an optional one.
- Sentinel and unsupported states remain distinguishable so that neither can absorb the
  other.

### Evidence / references

- `CANARY.md` negative-control requirement and pass criterion 4.
- `core/mutate` T05, T06, T07, T18 through T23.
- `core/identity` adversarial refusal canary, 16/16.
- StyleFix `ExportMapScanComplete` reporting `YES` while the scan missed a planted map.

### Supersedes

None.

---

## DEC-020 - Require production-resident evidence for object-valued and container-sensitive state

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Suite engineering method, production discrimination

### Decision

Synthetic fixtures alone cannot certify object-valued properties, container-sensitive
properties, or properties that can appear universally sentinel-valued. Those classes
require proof against state that existed in a saved document before the test script ran.

At least one positive discriminating case is required wherever a property could otherwise
appear universally `NOT_APPLICABLE`, null, or default-valued.

### Rationale

A fixture proves that a property can be read as the fixture wrote it, which is a claim
about the fixture. An object created in the same session can resolve where a
document-resident one does not.

The eleven-hour production sweep found the boundary where the fixture model stopped
representing the document: 207 of 207 fixture assertions passed while 2,883 of 2,883
production targets failed snapshot readiness, and every failing property was
object-valued.

### Consequences

- Object-valued serializers are proved against pre-existing document-resident values.
- A property returning a sentinel across an entire production population requires a
  deliberate positive fixture before that result is accepted as meaningful.
- Prepared fixture documents are saved, closed, and reopened before use, and are never
  regenerated by the test that consumes them.
- StyleFix inherits this gate when it returns to active work. Its synthetic fingerprint
  success is not sufficient evidence for fill colour, stroke colour, or applied language.

### Evidence / references

- NormalFix read-only production sweep, 2,883 targets, 4,631 `appliedLanguage` failures.
- Production discrimination gate in `SUITE_HARMONIZATION.md`.
- `kerningValue` and `strokeColor` document-resident fixture, verifier 6/6.

### Supersedes

None.

---

## DEC-021 - Complete read-only evidence before production mutation

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Sequencing

### Decision

Work that will eventually change a production document is preceded by a read-only pass
that establishes what is actually there.

Audit precedes remediation. Census precedes contract amendment. Source review precedes
implementation change.

### Rationale

A read-only pass costs machine time and risks nothing. It has repeatedly found conditions
that no amount of reasoning about the code would have surfaced, and it establishes a
baseline against which a later change can be judged.

### Consequences

- Tools ship an audit mode that is useful on its own.
- A production sweep is an acceptable prerequisite to adopting a contract.
- The manuscript is never the first document a new mutation path touches.
- Census output is committed as evidence rather than consumed and discarded.

### Evidence / references

- NormalFix read-only sweep preceding adapter construction.
- Step #8 read-only source census preceding the ownership amendment.
- TableFix v1.2 production read-only scan, 108 tables, no mutation.

### Supersedes

None.

---

## DEC-022 - Bind every claim to the artifact and host that produced it

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Provenance and parity

### Decision

A claim carries the identity of what produced it and the host it was produced on.

- Generated reports carry a provenance header: tool and version, core version and build
  hash, run timestamp, document name and modification date, InDesign version and build,
  operating system, ownership scope, mutation state, and counts.
- Empirical results about host behavior are bound to an InDesign version and build.
- A conformance pass is bound to an exact `adapterVersion` and expires when the behavior
  it proved changes.
- A census result is bound to a `censusVersion`.
- Documentation and implementation versions are checked against each other rather than
  maintained in parallel by hand.

Where a host property is unavailable, the field reports `NOT_EXPOSED` rather than empty.

### Rationale

This project began with a specification describing work that the committed script did not
contain. The failure was not carelessness; it was that nothing connected the claim to the
artifact.

A report that cannot be traced to the code that produced it cannot be entered into an
errata record weeks later, and an expired proof that still looks valid is worse than no
proof.

### Consequences

- CI verifies generated-artifact freshness and version parity.
- A conformance proof does not silently outlive the code it proved.
- Host-bound findings state their host, so a different build is a detected condition
  rather than a silent wrong answer.
- Reports without provenance are not admissible evidence for a gate.

### Evidence / references

- StyleFix README and script version divergence, 2026-08-18.
- DocStats `main` lacking `DocStats.jsx` while v1.1.0 exists on a branch, `DS-CENSUS-001`.
- Anonymous-Color ID non-reuse recorded as version-bound rather than general.
- Step #7 closure recording adapter SHA-256 and both contributing commits.

### Supersedes

None.

---

## DEC-023 - Preserve failure history, including whether each defect was loud or silent

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** Engineering record

### Decision

Defects found during development are recorded rather than quietly fixed. The record
carries date, version, context, error, line, diagnosis, fixing version, what caught it,
and whether the failure mode was `LOUD` or `SILENT`.

A loud defect announces itself and stops. A silent defect produces a confident, wrong
result that looks like success.

### Rationale

The ratio of silent defects caught before production is the measure of whether the test
apparatus earns its cost. That number cannot be reconstructed after the fact, and the
embarrassing entries are the informative ones.

### Consequences

- `CANARY_FAILURES.csv` is a durable repository artifact.
- Fixes reference the failure entry they close.
- The record supports the Making Of account of this project's method.

### Evidence / references

- `CANARY_FAILURES.csv`.
- Table-cell traversal blind spot, `SILENT`, caught by peer review.
- Endnote traversal Error 55, `LOUD`, caught by canary.
- StyleFix E02 unsafe LOW, `SILENT`, caught by canary.

### Supersedes

None.

---

# Mutation-contract decisions

DEC-005 records that mutation passes through a shared transaction. The entries below
record the specific choices inside that contract that were decided rather than derived.

---

## DEC-024 - Group Undo at batch level and rollback at item level

**Date:** 2026-08, backfilled
**Status:** ACCEPTED / VERIFIED
**Decided by:** Johann Darby
**Scope:** `core/mutate`

### Decision

A mutation batch runs inside one `app.doScript` call with `UndoModes.ENTIRE_SCRIPT`,
producing a single InDesign Undo entry for the whole batch. Per-item restoration is
performed by the adapter's own rollback rather than by InDesign Undo.

`HARD_STOP` is a returned result and never a throw out through the `doScript` boundary,
so the batch Undo entry always forms.

### Rationale

Nested `doScript` calls collapse into the outer entry, so batch-level and per-item Undo
granularity cannot both exist. Batch-level was chosen for operator experience, with
manual rollback as the in-transaction mechanism and InDesign Undo as the backstop.

The accepted consequence is that a rolled-back item inside a completed batch leaves a
batch whose single Undo reverts every item in it. The operator message for an
unrecoverable rollback states that one Undo reverses the entire batch, so the backstop
must exist for that message to be true.

### Consequences

- Thirty repairs produce one undo step rather than thirty.
- A rollback of item seven does not isolate item seven from a subsequent batch Undo.
- The engine must return normally from inside the undo group under every failure path.

### Evidence / references

- `core/mutate` contract, batch-undo section.
- `core/mutate` T10, one-step Undo verified against a real-DOM fixture.
- NormalFix residual CoreMutate canary, 5/5.

### Supersedes

None.

---

## DEC-025 - Require every mutation target to end in one named state

**Date:** 2026-08, backfilled
**Status:** ACCEPTED / VERIFIED
**Decided by:** Johann Darby
**Scope:** `core/mutate`

### Decision

Every target ends in exactly one of `COMMITTED`, `SKIPPED`, `REFUSED`, `ROLLED_BACK`,
`HARD_STOP`, or `NOT_ATTEMPTED`. A batch ends `COMPLETE` or `HALTED`.

No other outcome exists. A target may not end in a described condition that is not one of
these states.

`REFUSED` is distinct from `SKIPPED`: a safety refusal is a finding the operator should
see, not an absence of work.

### Rationale

The original NormalFix partial-mutation defect existed because "Could not verify" was a
report string rather than a state with defined document consequences. A description does
not say whether the document was changed. A state does.

### Consequences

- Report strings cannot substitute for outcome states.
- `HARD_STOP` halts the batch, so an unrecoverable item is not buried under subsequent
  successful changes.
- Reporting can aggregate outcomes across tools because the vocabulary is closed.

### Evidence / references

- `core/mutate` contract, item-state table.
- `core/mutate` T01 through T09, T13 through T15.
- NormalFix partial-mutation defect, the condition this vocabulary replaced.

### Supersedes

None.

---

## DEC-026 - Refuse to mutate a target whose snapshot is not rollback-ready

**Date:** 2026-08, backfilled
**Status:** ACCEPTED / VERIFIED
**Decided by:** Johann Darby
**Scope:** `core/mutate`

### Decision

`snapshot()` reports `rollbackReady` with a reason. A target that is eligible for
mutation but not rollback-ready does not mutate. It ends `REFUSED`.

### Rationale

Recording what a value was is not the same as being able to return to it. A snapshot that
captures a former state it cannot restore offers the appearance of reversibility without
the substance.

### Consequences

- Mutation eligibility and rollback capability are evaluated separately.
- A refusal for safety reasons is visible in reporting rather than folded into ordinary
  skips.
- Adapters state per target why restoration would not be possible.

### Evidence / references

- `core/mutate` contract, snapshot section.
- `core/mutate` T15, rollback-readiness refusal.
- Proposed by Pilgrim during contract review, 2026-08.

### Supersedes

None.

---

## DEC-027 - Make resolution failure stage-sensitive

**Date:** 2026-08, backfilled
**Status:** ACCEPTED / VERIFIED
**Decided by:** Johann Darby
**Scope:** `core/mutate`, `core/identity`

### Decision

Failure to resolve a target or a serialized reference is `SKIPPED / RESOLVE_FAILED` when
it occurs before `mutate()` is invoked, and the batch continues. The same failure after
mutation may have begun is `HARD_STOP`.

The transition point is invocation of `mutate()`, not proof that a write occurred.

### Rationale

A stale locator on an untouched target is harmless: the document is unchanged and the
correct response is to skip. The same failure after mutation leaves the document in an
unknown state.

Treating both as `HARD_STOP` would halt an entire batch whenever an operator edited the
document between scan and repair, which is the common case rather than the exotic one.

### Consequences

- Editing between scan and fix degrades gracefully instead of halting the batch.
- Post-mutation resolution failure remains unrecoverable and stops work.
- The rule applies to both target locators and serialized object references.

### Evidence / references

- `core/mutate` contract, resolve-stage section.
- `core/mutate` T13.
- Anonymous-Color adversarial canary, stage-sensitive missing-reference case.

### Supersedes

None.

---

# Identity decisions

DEC-006 records exact-or-refuse identity. The entries below record the conceptual split
inside it and the one post-freeze amendment.

---

## DEC-028 - Distinguish identified objects from referenced objects

**Date:** 2026-08, backfilled
**Status:** ACCEPTED / VERIFIED
**Decided by:** Johann Darby
**Scope:** `core/identity`

### Decision

A named object is *identified*: its semantic name, qualified where the family is grouped,
is primary, and its ID is corroborating evidence only.

An anonymous document-owned object is *referenced*: it has no semantic identity, so the
document-local opaque ID is primary, resolution is confined to the bound document, and
concrete type, parent-document ownership, model, space, and value are mandatory
verification evidence.

Same-value substitution with a different ID refuses. There is no value-based, index-based,
or nearest-match fallback in either case.

### Rationale

An anonymous Color has nothing that could be primary. This is not a weakening of
name-first identity but a case that name-first identity does not reach.

Value cannot substitute. The production manuscript contains 48 distinct anonymous Colors
defined as RGB 0,0,0 and eight sharing RGB 0,0,2, so any value-based resolution would
resolve confidently to the wrong object.

### Consequences

- Refusal means different things in each case: ambiguity for a named object, absence for
  an anonymous one.
- Anonymous references never resolve outside the document they were captured in.
- ID non-reuse is version-bound evidence rather than an assumed property of InDesign.
- The digest compares the stored tuple directly and requires no resolution.

### Evidence / references

- `docs/NORMALFIX_OBJECT_IDENTITY_CONTRACT_v0_2.md`.
- Anonymous-Color adversarial canary, 6/6, including ID non-reuse across 32 new Colors.
- Production identity diagnostic, 10 of 12 anchors resolved, 2 correctly refused.

### Supersedes

None.

---

## DEC-029 - Amend `core/identity` for KinsokuTable and MojikumiTable after freeze

**Date:** 2026-08-27
**Status:** ACCEPTED / VERIFIED
**Decided by:** Johann Darby
**Scope:** `core/identity` v0.3

### Decision

`KinsokuTable` and `MojikumiTable` are document-scoped identified families, using exact
document-local name as semantic identity with supplemental ID corroboration, under the
same conflict and refusal rules as `NumberingList` and `StrokeStyle`.

`NothingEnum.NOTHING` for `paragraph.kinsokuSet` and `paragraph.mojikumi` normalizes to
`CoreMutate.NOT_APPLICABLE` before reaching `core/identity`, and remains distinct from
`UNSUPPORTED_TYPE`.

### Rationale

Two frozen contracts disagreed, and the disagreement resolved unsafely. The 243-key
registry marked both keys `RECONSTRUCTIVE / REQUIRED`, while `core/identity` did not
support either family, so the adapter would have claimed reconstructive rollback coverage
it could not deliver.

The 12/12 identity canary did not expose this because its cases were drawn from the
families the contract already declared.

This amends the frozen `core/identity` v0.2 family list, which returned `UNSUPPORTED_TYPE` for KinsokuTable and MojikumiTable.

### Consequences

- Reusing the `NumberingList` family shape avoided inventing a new identity pattern.
- The registry-to-identity coverage assertion was added so a future registry addition
  cannot outrun the identity layer silently. That cross-check, not the two additional
  cases, is what prevents recurrence.
- A normal document state and a coverage gap remain distinguishable.
- Built-in table naming across localized InDesign builds is recorded as unresolved and
  host-bound.

### Evidence / references

- `core/identity` v0.3 gates 1 through 8, all PASS.
- Adversarial refusal canary 16/16, with independent ScriptWatch confirmation.
- Registry-to-identity coverage: 243 keys, 25 host-object-capable, 25 bindings, 0 errors.
- Sentinel normalization 6/6.

### Supersedes

None.

---

# ScriptWatch instrument decisions

DEC-004 records ScriptWatch as horizontal observability. The entries below record the
display decisions that govern what the console is permitted to claim.

---

## DEC-030 - Carry liveness in motion and condition in colour, on independent axes

**Date:** 2026-08, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** ScriptWatch instrument semantics

### Decision

Motion answers whether a source is alive. Colour answers what condition its value is in.
The two axes are independent.

An instrument at limit still moves, because it is still alive. Only a dead source stops.

Never-sampled is a distinct display state from a source reporting zero. A never-sampled
instrument shows no value, not a zero.

### Rationale

At operational distance an observer detects two things: something stopped moving, and
something is not green. Both signals only carry information if the resting state is
featureless, so uniform motion and uniform colour when healthy are requirements rather
than aesthetics.

Spotlight cannot distinguish a dead source from one reporting zero. That distinction is
the improvement this suite makes on the model it draws from.

### Consequences

- The resting state of a healthy console is deliberately without feature.
- A non-green element in a healthy console costs signal and requires justification.
- An uninitialised instrument renders as no value rather than as a confident reading.
- Wall and desk viewing distances may use different liveness carriers, since a low sample
  cadence makes per-sample motion approach stillness at range.

### Evidence / references

- Johann Darby, AT&T Wireless NOC Spotlight deployment, cited by Quest Software as a
  best-practice example.
- Segmented dial artwork ships with all 36 illuminated segments hidden by default.
- ScriptWatch degraded-state annunciation rollup.

### Supersedes

None.

---

## DEC-031 - Drive instrument motion from sample arrival, never from a free-running timer

**Date:** 2026-08, backfilled
**Status:** ACCEPTED / IMPLEMENTED
**Decided by:** Johann Darby
**Scope:** ScriptWatch instrument semantics

### Decision

Every motion carrier is driven by an observed sample event. No carrier runs on an
independent animation loop.

Liveness is computed from time since last sample, so a source that stops reporting halts
without any code path instructing it to stop.

Value magnitude, displayed-value change, and source event are three separate inputs:
raw value controls magnitude, the rendered value string controls change acknowledgement,
and the source event controls liveness.

### Rationale

An animation that continues after a source dies is a false statement rendered
attractively. Deriving motion from sample arrival makes death the absence of input rather
than a state someone must remember to set, so a bug that forgets to mark a source dead
cannot produce a moving indicator.

The raw-versus-rendered distinction was found by diagnostic instrumentation: a metric held
at a constant displayed value fired four change acknowledgements from sub-threshold raw
movement.

This replaces free-running CSS animation as a liveness carrier.

### Consequences

- Free-running CSS animation was removed from the dial tracer.
- Glint fires on displayed-value change, not on sample arrival.
- Initialization, recovery from missing data, and transitions into or out of dormant do
  not count as value changes.
- Motion cadence follows observed sample cadence.

### Evidence / references

- ScriptWatch sample-motion bridge.
- Instrument diagnostic: CPU 0 display changes with 4 glint starts, RAM 3 with 4.
- Visual contract, sample-driven carrier requirement.

### Supersedes

None.

---

## DEC-032 - Require that indicators be able to disagree

**Date:** 2026-08, backfilled
**Status:** ACCEPTED / IMPLEMENTATION PENDING
**Decided by:** Johann Darby
**Scope:** ScriptWatch instrument semantics

### Decision

No two carriers may fire in lockstep across a long observation. Indicators that always
agree are one indicator drawn many times and are consolidated.

Where several instruments share one acquisition event, liveness is asserted once at the
source or group level. Individual instruments below it carry value change, not arrival.

### Rationale

A field of indicators pulsing in unison carries a single bit. It reads as independent
activity while conveying nothing beyond the shared trigger.

Staggering or phase-offsetting synchronized indicators would manufacture the appearance of
independence, which is the same class of falsehood as free-running animation and harder to
detect.

### Consequences

- Liveness carriers are disabled on instruments sharing a collector event.
- An acceptance test may compare carrier timestamps across metrics for simultaneity.
- An indicator earns its place only if it can disagree with its neighbours.

### Evidence / references

- Johann Darby, HP Superdome storage-network Spotlight deployment, where uniform pulsing
  indicators conveyed no per-stream information.
- CPU and RAM `activity` carriers disabled where the collector event is shared.
- Instrument diagnostic showing identical glint counts across unrelated metrics.

### Supersedes

None.

---

## DEC-033 - Separate authored instrument artwork from telemetry semantics

**Date:** 2026-08, backfilled
**Status:** ACCEPTED / IMPLEMENTED
**Decided by:** Johann Darby
**Scope:** ScriptWatch instrument architecture

### Decision

Instrument appearance is authored artwork with a declared public layer contract. Value,
condition, freshness, change events, and all animation timing remain in the compositor.

The artwork contains no animation, no script, no text, no raster, and no external
reference. Expensive filters attach only to static layers. Animatable layers respond to
transform and opacity alone.

The compositor validates the layer contract before replacing an existing instrument and
retains the prior implementation if validation fails.

### Rationale

The visual ceiling is set by whoever draws the instrument, and approximating an undrawn
object in stylesheet rules has a low ceiling. Separating the two lets visual iteration be
an export rather than a code change.

Fail-safe validation means a bad artwork revision degrades to the previous instrument
rather than blanking it.

### Consequences

- Every internal artwork ID and reference is namespaced per instance, or instances share
  gradients silently.
- Lit geometry ships hidden, so an uninitialised instrument cannot display a confident
  full reading.
- Artwork revisions that preserve the public contract require no compositor change.
- Contract changes require a contract-version bump and a compositor review.

### Evidence / references

- `docs/SEGMENTED_DIAL_SVG_CONTRACT_v0_1.md`, artwork rev 0.2.
- `dashboard/instrument_compositor.js`, two-instance isolation verified live.
- Visual contract, authored-SVG architecture section.

### Supersedes

None.

---

# Step #8 additions

---

## DEC-034 - Require source verification before recording detection coverage

**Date:** 2026-08-26, backfilled
**Status:** ACCEPTED
**Decided by:** Johann Darby
**Scope:** `ownership/OWNERSHIP.md`

### Decision

A Detection Coverage entry requires evidence state `SOURCE_VERIFIED` at minimum.
`DOCUMENTED_ONLY` is not sufficient to record what a tool inspects.

### Rationale

Detection Coverage is an empirical claim about what code actually examines. The original
ownership gap existed because coverage was inferred from documentation, and the TableFix
visual-header gate was found only by reading source.

### Consequences

- Coverage claims for any tool or region not yet source-reviewed remain
  `DOCUMENTED_ONLY` and are not eligible to freeze as Detection Coverage.
- A census cannot freeze coverage for a region whose implementation has not been read.
- Evidence state is recorded per region, not per tool, since one tool may be verified in
  one region and undocumented in another.

### Evidence / references

- `TF-CENSUS-001`, paragraph audit gated by visual-header detection, found by source
  review at pin `50613a468c0e034953b32007917c953329b4093c`.
- Step #8 census evidence-state column.

### Supersedes

None.

---

## DEC-035 - HeaderFix document-wide mutation authority

**Date:** 2026-08-27
**Status:** OPEN
**Decided by:** Pending — Johann Darby
**Scope:** Ownership and remediation authority

### Open question

HeaderFix provides Fix All Errors and Clear All Overrides, giving it document-wide
mutation authority. NormalFix and TableFix both restrict remediation to explicit
selection.

DEC-010 froze `MUTATE_DOCUMENT_WIDE` into the authority vocabulary, and the Step #8 census
confirmed HeaderFix genuinely exercises it. Neither established that HeaderFix *should*
retain it.

This entry exists so that the presence of a matching slot in the enum is not mistaken for
a decision.

### Considerations

- The marker population is small, exactly four literal strings, and unambiguous, which is
  the strongest argument for keeping document-wide authority.
- HeaderFix source is already `SOURCE_VERIFIED` at
  `6a811800b77d3641a6c03e2f8b18d274d15cc260`. The current implementation exposes selected
  and document-wide actions for H1-002 and H1-003.
- HeaderFix still uses the older direct paragraph-style application path identified by the
  harmonization specification. That implementation-safety debt is separate from the
  normative question of whether document-wide authority should exist.
- Three tools in one suite carrying two safety postures should be deliberate rather than
  incidental.

### Required before closing

- Johann decides whether HeaderFix retains `MUTATE_DOCUMENT_WIDE` or is reduced to
  `MUTATE_ON_SELECTION`.
- The decision records its operator-confirmation model.
- The existing direct paragraph-style mutation path remains a separate implementation
  conformance item for the shared preserving text/mutation contracts; closing this
  authority decision does not approve that older mutation mechanism.

### Interim operating constraint

Until HeaderFix migrates to the shared preserving paragraph-style application path in
`SUITE_HARMONIZATION.md` §3.2, `Fix All Errors` is not approved for use against the
production manuscript. This constraint applies regardless of how DEC-035 resolves.

### Evidence / references

- `ownership/OWNERSHIP.md`, HeaderFix rows, source-verified at
  `6a811800b77d3641a6c03e2f8b18d274d15cc260`.
- `SUITE_HARMONIZATION.md`, §3.2 binding paragraph-style application rule and §6 safety
  posture note.
- DEC-010 authority vocabulary.

### Supersedes

None.

---

# Open implementation follow-through

These items are implementation work derived from accepted decisions rather than undecided architecture.

## TF-CENSUS-002

Implement DEC-016 and DEC-017 as one discrete TableFix work unit:

1. add `Classification` to the TableFix finding record and CSV/report surface;
2. normalize TF-002 to `WARNING / REVIEW`;
3. normalize TF-003 to `WARNING / REVIEW`;
4. normalize TF-007 to `INFO / REVIEW`;
5. keep TF-001 as `WARNING / HIGH`;
6. keep TF-004 as `ERROR / blank`;
7. keep TF-005 as `WARNING / blank`;
8. keep TF-006 as `WARNING / blank`;
9. update `codes/CODES.csv`;
10. run the reusable T01-T07 forward and reverse registry-conformance gates;
11. record runtime evidence;
12. close `TF-CENSUS-002` only after implementation and registry agree.

## HeaderFix preserving paragraph-style migration

Migrate HeaderFix to the shared preserving paragraph-style application path required by
`SUITE_HARMONIZATION.md` §3.2. This implementation conformance item is required regardless
of whether DEC-035 retains `MUTATE_DOCUMENT_WIDE` or reduces HeaderFix to
`MUTATE_ON_SELECTION`.

Until that migration is complete, HeaderFix `Fix All Errors` is not approved for use
against the production manuscript.

## Remaining Step #8 items after TF-CENSUS-002

- resolve `DS-CENSUS-001` production source authority;
- remove DocStats `EPUB-004` table-header mutation authority;
- close remaining `NONE` operator-message gaps;
- complete suite-wide code-registry agreement;
- run the cross-tool ownership canary;
- freeze `ownership/OWNERSHIP.md` only after every AC08 criterion passes.

---

# Review record

**Reviewer:** Daisy
**Date:** 2026-08-27
**Outcome:** Applied. Eighteen entries added, three structural changes, four corrections.

## Added

Six method decisions (DEC-018 through DEC-023). The draft recorded what the suite is but
almost nothing about how it establishes that anything is true, and method is where every
defect in this project was actually found.

Four mutation-contract decisions split out of DEC-005 (DEC-024 through DEC-027): the
batch-versus-item Undo choice, the exhaustive item-state vocabulary, the rollback-readiness
gate, and stage-sensitive resolution failure. Each was a decision rather than a derivation.

Two identity decisions split out of DEC-006 (DEC-028, DEC-029): the identified-versus-
referenced split, and the post-freeze Kinsoku/Mojikumi amendment, which is the worked
example of two frozen contracts disagreeing.

Four ScriptWatch instrument decisions (DEC-030 through DEC-033), none of which were
represented. Two of them derive from operational experience rather than analysis, and the
entries say so.

One Step #8 addition (DEC-034), and one item that was recorded as settled but is not
(DEC-035).

## Corrected

DEC-009 status changed to `ACCEPTED / IMPLEMENTATION PENDING`, since DocStats `EPUB-004`
currently violates the mutation-overlap prohibition.

DEC-016 gained the consequence that with `REVIEW` out of the Severity column, four
TableFix codes become WARNING and severity alone no longer distinguishes what will be
fixed from what will not.

DEC-017 gained a rationale paragraph naming why the reverse direction is load-bearing, and
its relationship to DEC-018.

DEC-006 `Supersedes` corrected: it referenced an unrecorded prior practice rather than a
ledger entry.

## Structural

`Date` column added to the index. `Decided by` added to every entry and to the ledger
rules. `Supersedes` semantics stated explicitly.

## Confirmed unchanged

DEC-014 bundles three TableFix semantic detections but lists them separately with
individual evidence. Splitting would add ledger noise without adding retrievability.

The DEC-016 severity mappings match the accepted rationale.

DEC-017 correctly captures both directions.

No entry was found that mislabels a decision as implementation detail.

## Open for Johann

DEC-035 requires a decision and cannot be closed by review. HeaderFix source is already
`SOURCE_VERIFIED`; what remains open is the normative authority decision. The ledger must
not infer approval of document-wide mutation from the fact that the current implementation
already exposes document-wide actions.


---

## Pilgrim consistency pass

**Reviewer:** Pilgrim
**Date:** 2026-08-27
**Outcome:** Applied. Canonical cross-check and ledger-internal consistency corrections completed.

### Corrected

- Reconciled Decision Index dates with entry dates for DEC-008 through DEC-011 and DEC-015.
- Corrected DEC-009 entry status to `ACCEPTED / IMPLEMENTATION PENDING`.
- Backdated DEC-034 to the Step #8 opening decision period and removed the incorrect claim that HeaderFix remained `DOCUMENTED_ONLY`.
- Corrected DEC-035 to reflect that HeaderFix is already `SOURCE_VERIFIED` at `6a811800b77d3641a6c03e2f8b18d274d15cc260`. The open issue is normative document-wide authority, not missing source review.
- Clarified DEC-016 so the WARNING band and remediation distinction are stated accurately.
- Removed absolute method claims in DEC-018 that contradicted its own peer-review evidence.
- Enforced the ledger rule that `Supersedes` contains decision IDs only; unrecorded prior practices now remain in Rationale and `Supersedes` reads `None`.
- Moved the open implementation follow-through section after the decision entries so the ledger remains structurally ordered.
- Added explicit status definitions so `ACCEPTED`, `IMPLEMENTED`, `VERIFIED`, and `OPEN` cannot drift in meaning.

### Still open

DEC-035 remains OPEN for Johann. No authority decision was inferred from current HeaderFix behavior.

---

## Daisy final checksum review

**Reviewer:** Daisy
**Date:** 2026-08-27
**Outcome:** PASS with one tracking gap corrected.

Daisy confirmed the Pilgrim consistency corrections, including the DEC-035 source-verification
correction, the DEC-018 rationale correction, uniform `Supersedes` handling, and explicit
status definitions.

The remaining gap was that DEC-035 named HeaderFix's direct paragraph-style application path
as a separate implementation conformance item without tracking it in follow-through. This
revision adds that item explicitly and records the interim production constraint: until
HeaderFix migrates to the shared preserving paragraph-style application path, `Fix All Errors`
is not approved for use against the production manuscript.

No further factual or structural gap was identified in the ledger.
