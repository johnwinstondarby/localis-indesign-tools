# InDesign Tool Suite Harmonization Specification

**Scope:** DocStats, HeaderFix, NormalFix, TableFix
**Deferred:** StyleFix adopts after its v1.0.8 canary passes. Nothing here requires a change to StyleFix while that work is in progress, and the contracts below are written so StyleFix can adopt them without redesign.
**Cross-cutting suite service:** ScriptWatch spans the tool suite as shared observability infrastructure and does not own document regions. Suite tools adopt the ScriptWatch Harness so they can publish job semantics to the ScriptWatch console. External or community scripts may opt in to the same Harness contract. ScriptWatch retains agentless process and host telemetry when no Harness is present.
**Status:** Active harmonization specification. Steps #1 through #4 are closed and frozen as of August 22, 2026. Editorial authority is John Darby.

**Canonical location:** this document lives in the `localis-indesign-tools` repository and is the single authoritative copy. Tool repositories link to it and never carry their own divergent copy.

**Migration note:** DocStats was the temporary authority before the suite repository existed. The first `localis-indesign-tools` commit that contains this specification establishes the new authority. The DocStats copy is then replaced by a link to this file.

---

## 1. Why harmonize before fixing

Four repositories currently carry four independent copies of the same helper functions: validity checks, guarded property reads, object type resolution, preview truncation, column padding, location resolution, override detection, color conversion, and CSV writing.

Those copies have already diverged in a way that produced a defect. NormalFix v1.5 replaced `applyParagraphStyle(style, true)` with the character-style-preserving pattern because the older call destroyed applied character styles. HeaderFix still uses the older behavior. The same lesson was learned once and applied once.

Every additional per-tool fix without a shared core recreates that condition.

### Evidence-first engineering rule

Uncertain host behavior is settled by executable evidence before a contract is frozen. The default sequence is:

1. identify the unsafe or ambiguous behavior;
2. build a fixture that can express both the expected state and the refusal case;
3. run the fixture against the pinned InDesign host;
4. record independent read-back, rollback, Undo, or observer evidence as applicable;
5. freeze only the behavior that the evidence supports.

Review and reasoning define the hypothesis. Canary, census, discrimination, and refusal tests decide whether the hypothesis becomes a suite contract. The same method is used for mutation safety, production discrimination, identity resolution, DOM surface assumptions, and future shared-core behavior.

---

## 2. Distribution model

ExtendScript has no package manager, and the audience for a community release is practitioners rather than developers. The model that resolves both constraints:

**Source is modular. Distribution is a single generated file.**

```
localis-indesign-tools/          suite repository
    core/                        shared modules
    ownership/OWNERSHIP.md       ownership map (authoritative)
    codes/CODES.csv              finding code registry (authoritative)
    build/build.py               inliner
tool repositories                one per tool, consuming core
    src/                         tool-specific source
    dist/ToolName.jsx            generated, committed, installable
ScriptWatch repository           cross-cutting runtime observer
    ScriptWatchHeartbeat.jsxinc  heartbeat transport
    ScriptWatchJob.jsxinc        ScriptWatch Harness
```

The build inliner concatenates the required core modules with the tool source and writes one file to `dist/`, stamping a header block with tool version, core version, build timestamp, and a hash of each contributing source file.

This resolves three separate problems at once. Practitioners install one file. Installed-artifact parity becomes trivially checkable, because there is one artifact. The multi-module loader parity mechanism StyleFix is currently carrying becomes unnecessary rather than permanent.

A GitHub Action runs the build and fails on any mismatch between the committed `dist/` file and a fresh build.

ScriptWatch remains a cross-cutting repository rather than a document-ownership tool. For suite builds, `ScriptWatchHeartbeat.jsxinc` and `ScriptWatchJob.jsxinc` are source components and are inlined into the generated single-file distribution with the other required modules. Practitioners still install one generated `.jsx` file. Authors integrating ScriptWatch into a script outside the suite may include the two `.jsxinc` files directly.

---

## 3. Core modules

### 3.1 `core/dom`

`valid()`, `safeProperty()`, `safePropertyObject()`, `objectTypeName()`, `collectionElements()`, and the DOM contract registry.

**Contract registry rule:** no DOM property or method name appears as a bare literal at a call site in any tool. Every name is declared in the registry, probed at startup, and resolved through an accessor. A name that was never registered stops the run.

This is the class-level fix for the recurring wrong-name defect. Four instances are on record: `language` for `appliedLanguage`, `endnotes` on the wrong host, `applyCharacterStyle` on Story, and `indexOptions` for `indexGenerationOptions`. Each was found individually. The registry is what finds the fifth before it ships.

The registry uses the five-state taxonomy already accepted for StyleFix: `SUPPORTED`, `NOT_APPLICABLE`, `NO_APPLICABLE_INSTANCE`, `NOT_EXPOSED`, `FAILED`.

**Operation-surface and return-shape rule:** registry entries record more than a member name. Each entry declares the host family, whether the member is a property or method, the operations the suite is permitted to perform on the returned value, and the expected return shape where code depends on shape. Shapes include Array, Collection, scalar, Enumerator, host object, and plain object. Startup probing must reject a surface that exposes the right name with the wrong callable or return contract.

Three production findings establish this requirement:

- `Paragraph.parentTextFrames` exists but returns an Array on InDesign 21.5.1.73, so Collection `.item()` is invalid.
- `doc.strokeStyles` exists on the same host, but its exposed surface has no `.add()` method.
- host families may throw when code reads family-irrelevant members; `StrokeStyle` does not support Font-only members such as `postscriptName` and `fullName`.

**Primitive-only comparison rule:** shared core never applies strict equality to a value that may be an InDesign host object. Host state is reduced to registered primitive evidence first, and only those primitives are compared. This rule applies across serializers, digests, verifiers, identity resolution, and other shared-core comparison paths.

**Family-specific access rule:** serializers and resolvers read only members registered for the selected host family. Generic read-everything probing is prohibited in production paths.

### 3.2 `core/text`

- `overrideState(para)` returning both the value and the detection method used.
- `applyCanonicalParagraphStyle(para, style)` implementing the NormalFix v1.5 pattern: apply without clearing character attributes, then clear paragraph-only overrides, with the enum path and the numeric fallback both recorded.
- `characterStyleSignature(text)` and `formattingSignature(text)` for preservation verification.

**Binding rule:** no tool calls `applyParagraphStyle` directly. The preserving pattern is the only paragraph-style application path in the suite. This closes the HeaderFix divergence permanently rather than by patch.

### 3.3 `core/color`

`colorToRGB()`, `swatchName()`, `isRedFamily()`, and tint-aware evaluation. NormalFix and TableFix currently implement red detection separately for `CLI Code Red Body` and `CLI Code Red Table`. The hue logic is one function; the target style name is a parameter.

Two corrections belong here rather than in either tool:

- The swatch-name test must not bypass color analysis. A name containing "red" as a substring currently short-circuits the hue check, so a brown swatch named Redwood is accepted without examination. Name becomes a supporting signal, or an exact match against a configured list.
- `fillTint` must be evaluated. A tinted instance of a red swatch renders pale, matches on swatch identity, and is currently converted to full strength. Tinted instances are reported for review rather than converted silently.

### 3.4 `core/location`

One container-aware location resolver. The current implementations fail to resolve a page whenever text sits inside a table, an anchored frame, or a group, which was confirmed in the StyleFix v1.0.7 canary run: C14, whose own literal reads "table on parent page," resolved as `No page/Pasteboard`, while C08 on the same parent page resolved correctly.

Location never determines risk in any tool. It determines whether a practitioner can act on a finding, which is the safety net for every row the tool declines to fix automatically. One correct implementation serves all four.

### 3.5 `core/mutate`

The mutation transaction. Every change to a document in every tool passes through it.

```
transaction(label, targets, {
    precheck,    // re-verify eligibility immediately before the change
    snapshot,    // capture everything that must survive
    mutate,      // perform the change
    verify,      // compare post-state against snapshot
    rollback     // restore on verification failure
})
```

Four tools mutate documents, not three. DocStats v1.1.0 carries five guarded actions: link update, relink, alternate-text entry, table header-row designation, and metadata entry. No tool in the suite currently groups undo or rolls back.

Three properties, all currently missing across the suite:

**Batch-level undo grouping.** The whole transaction runs inside `app.doScript` with `UndoModes.ENTIRE_SCRIPT` and the supplied label, so a batch is one undo step rather than dozens.

**Per-item rollback.** A verification failure restores that item rather than leaving the document partly changed. NormalFix currently assigns the red character style, then applies the paragraph style, then verifies, and on failure returns "Could not verify" while leaving the character-style assignment in place. The document has been modified and the report does not say so.

**Read-back verification as a required stage.** `verify` re-reads the changed property from the document rather than trusting the write. Two tools have independently produced the same silent-success defect: NormalFix reports "Could not verify" while leaving a change in place, and DocStats `setCustomAltText` writes `customAltText`, silently swallows a failure to set `altTextSourceType`, and returns success. In both cases the report claims a state the document does not have.

TableFix already implements half of this pattern with its cell-fill snapshot and restore. Generalizing that instinct into the shared contract is most of the work.

Highest-consequence action currently unguarded: DocStats `relinkAsset` replaces a placed asset with no confirmation beyond the file dialog, captures nothing about the original, and offers no restore.

### 3.6 `core/report`

The findings model, the code registry loader, and the CSV writer.

CSV output rules for every tool: UTF-8 with BOM, Windows line endings, all fields quoted, control characters escaped to printable form before writing. The v1.0.7 StyleFix CSV contains a raw `\u0004` from a footnote marker, which reads as file corruption to a strict consumer.

**Provenance header.** Every CSV from every tool opens with the same `#`-prefixed block:

| Field | Note |
|---|---|
| Tool name, tool version | |
| Core version, build hash | from the generated header |
| ScriptWatch Harness version | exact Harness contract when instrumented; `NOT_INSTRUMENTED` when no Harness is present |
| Run timestamp | |
| Document name, path, file modified | |
| InDesign version and build | report `NOT_EXPOSED` rather than an empty field |
| Operating system | |
| Ownership scope | what this tool claims, from the ownership map |
| Mutation state | `AUDIT_ONLY` or `MUTATED`, with the undo label when mutated |
| Counts by finding code | |

A report that cannot be traced to the code that produced it cannot be entered into an errata record six weeks later.

### 3.7 `core/ui`

Palette scaffold, multi-column listbox with sortable headers, the standard button row, Save CSV, and Save Diagnostic.

Two fixes land here for all four tools simultaneously. Space-padded columns do not align in the proportional ScriptUI default font, so a real multi-column listbox replaces `fixed()` padding. And the open-document guard must run inside the scan and every action handler, not once at load. With `#targetengine` the palette outlives the document, so closing it and clicking Rescan currently throws in NormalFix and did in StyleFix.

### 3.8 `core/boot`

Version constants, artifact parity check, measurement-unit normalization to points with restore, and redraw suppression with restore.

### 3.9 Cross-cutting observability: ScriptWatch

ScriptWatch is horizontal suite infrastructure. It observes DocStats, HeaderFix, NormalFix, TableFix, StyleFix when adopted, and future tools through two independent acquisition paths.

**Agentless acquisition.** `scriptwatch.py` observes the InDesign process and host from outside InDesign and writes the canonical telemetry CSV. This path requires no modification to the observed script and remains available when a script publishes no heartbeat. The v1 collector surface includes process CPU, private memory, working set, threads, handles, cumulative read/write/other I/O bytes and operations, page faults, Windows GDI and USER object counts when available, process uptime, host physical-memory use, system commit charge, system cache, kernel paged/nonpaged pools, and system process/thread/handle counts. Unsupported counters remain unavailable rather than being assigned a different meaning. `scriptwatch_web.py` consumes the collector snapshot and does not maintain a second host-memory sampler.

**Harness acquisition.** The ScriptWatch Harness is the reusable code part a script includes when it wants the ScriptWatch console to understand the work inside the process. The canonical source components live in the ScriptWatch repository and are included in this order:

```javascript
#include "ScriptWatchHeartbeat.jsxinc"
#include "ScriptWatchJob.jsxinc"
```

`ScriptWatchHeartbeat.jsxinc` owns the fail-isolated heartbeat transport. `ScriptWatchJob.jsxinc` owns the shared job contract and is the preferred adoption point for suite tools. Observation failure must never stop the tool. If the heartbeat transport is absent or unavailable, Harness calls degrade to no-op observation while tool work continues.

**Current contract:** ScriptWatch Harness 1.2 and heartbeat schema 1.2. Harness 1.2 publishes structured `tool`, `toolVersion`, `harnessVersion`, `mode`, and heartbeat `schemaVersion` fields in addition to the human-readable `<tool> · harness <version>` note prefix. The collector persists those fields directly in CSV so provenance does not depend on parsing display text.

The Harness provides two execution shapes:

- `ScriptWatchJob.run()` for collection-driven work where one outer-loop target is the ETA unit.
- `ScriptWatchJob.begin()` for phase-driven work where the tool advances through named stages rather than a target collection or where another subsystem already owns sequencing.

The shared Harness contract standardizes target progress, PASS/FAIL counts, checkpoint cadence, notes, terminal state, and Harness version provenance. `false` and thrown errors report FAIL; any other return reports PASS. A failing target continues by default. `continueOnError: false` converts the first failure into an `ABORTED` terminal state and rethrows to the caller. Terminal publication occurs in `finally` so a completed or aborted tool does not leave a live RUNNING heartbeat behind.

**Custom metrics.** Harness 1.2 provides `session.metric(name, value, opts)` for bounded domain telemetry that ScriptWatch cannot know generically. A job may publish up to 32 current finite numeric metrics. Metadata may include `unit`, `min`, `max`, `note`, and `display` (`counter`, `dial`, or `trend`). Unsupported display values normalize to `counter`. The heartbeat and CSV retain the metadata. The current dashboard renders custom metrics as number-in-box counters; richer presentation can use the existing metadata without changing the producer contract. This channel prevents tool-specific counters from expanding or redefining the fixed process/host telemetry schema.

**Persistent-engine boundary.** Each heartbeat `start()` resets prior metrics, counters, notes, timing, and lock state so a persistent ExtendScript engine cannot carry one job's observability state into the next job.

**Integration boundary with `core/mutate`.** ScriptWatch observes work; `core/mutate` owns document mutation safety. Harness progress, checkpoints, notes, status, and custom metrics must not replace target re-resolution, precheck, snapshot, digest coverage, verification, rollback, durable mutation journaling, or batch hard-stop semantics. A mutation tool whose loop is owned by `core/mutate` uses the phase/session Harness form or an explicit reporting bridge rather than creating a second competing target loop.

**Third-party integration.** A script outside the suite can become ScriptWatch-aware by adding the two Harness code parts and describing its work through `run()` or `begin()`. The external observer remains useful without that integration, but only Harness-enabled scripts can publish semantic job data such as target count, PASS/FAIL, checkpoint, phase notes, terminal state, structured provenance, and custom domain metrics.

**Contract canaries.** ScriptWatch carries dependency-free collector, dashboard-contract, Harness, and heartbeat canaries. They pin stale-terminal discovery, CSV column uniqueness, stable host-counter schema, legacy CSV report compatibility, structured provenance, custom metric forwarding/serialization, fail-fast terminal behavior, lock release, and persistent-engine reset behavior before a suite tool adopts the Harness.


### 3.10 `core/identity`

`core/identity` serializes, compares, resolves, and refuses object-valued state without storing live ExtendScript host references in authoritative snapshots.

The frozen design contract is `docs/NORMALFIX_OBJECT_IDENTITY_CONTRACT_v0_2.md`.

Two mechanisms are explicit:

- **identified objects** have semantic identity that can be reconstructed, such as Language, CharacterStyle, ParagraphStyle, named Swatch/Color, Font, StrokeStyle, and NumberingList;
- **referenced objects** have no semantic identity to reconstruct. The proven initial case is an anonymous document-owned Color.

For identified objects, family-specific semantic identity is primary and supplemental ID never overrides it. Resolution is exact or refused. Unknown host families return `UNSUPPORTED_TYPE`.

For an anonymous document-owned Color, the snapshot stores a plain-data reference record containing document-local ID and mandatory verification evidence. Digest comparison uses the stored tuple directly. Rollback resolves only within the already-bound document and requires exact agreement on concrete type, ID, document ownership, anonymous-name state, model, color space, and color value. There is no fallback by value, collection index, or nearest match.

Anonymous-Color ID non-reuse is a **version-bound host property, not an assumption about InDesign generally**. The current evidence is qualified only for InDesign 21.5.1.73 / DOM 21.5. Future supported hosts must re-run the identity qualification gate before this reference rule is admitted.

Stage-sensitive failure remains binding: a missing reference before `mutate()` is `SKIPPED / RESOLVE_FAILED`; a missing or unverifiable reference after mutation may have begun is `HARD_STOP`.

---

## 4. Finding codes and severity

Two shared registries, both living in the suite repository and read by the tools rather than restated in each README.

**Code prefixes are not required to name their tool.** DocStats already publishes family-based codes (`DOC-`, `HYP-`, `PRINT-`, `EPUB-`) and its FINDINGS.md commits to keeping published codes stable. Requiring tool-named prefixes would break that for no benefit. The registry carries a Tool column instead, so a code's owner is recorded rather than encoded in its name. HeaderFix keeps `H1-`.

Codes remain globally unique across the suite. A check whose meaning changes substantially receives a new code rather than being repurposed, and letter suffixes may identify stages of one check family, as with `DOC-006A` and `DOC-006B`.

**Severity is one axis for all tools:** `ERROR`, `WARNING`, `INFO`, `PASS`.

**Classification is a separate, tool-specific column.** StyleFix's LOW, MEDIUM, HIGH, and REPLACE are a risk classification, not a severity, and collapsing them into the severity axis would make the two incomparable across tools. TableFix's REVIEW is similarly a classification rather than a severity.

`codes/CODES.csv` carries one row per code across the whole suite: code, tool, family, severity, meaning, remediable yes or no, and the ownership region it applies to.

---

## 5. Ownership map as an artifact

The ownership boundary currently lives as prose in four separate READMEs, and the prose does not cover the whole document.

One gap is already visible. NormalFix excludes every paragraph inside a table and defers to TableFix. TableFix refuses to remediate complex tables, which are those with merged or spanned cells or multiple header rows, marking them `TF-003` and never changing them. A `Normal+` paragraph inside a complex table is therefore excluded by NormalFix and declined by TableFix. It is owned by nobody, and nothing in either tool reports that condition.

A second overlap is already in shipped code. TableFix owns tables and owns header-row semantics. DocStats `EPUB-004` remediates the same condition by setting `headerRowCount`, so two tools mutate one region under different verification standards. DocStats should report the condition and defer the change.

`ownership/OWNERSHIP.md` becomes the single authority: a table of every document region, the tool that owns it, and what that tool does with it. Regions with no owner are listed explicitly as `UNOWNED` rather than being absent. Each tool README links to it instead of restating it, so the map cannot drift out of agreement with itself.

---

## 6. Repository metadata standard

Applies to the five document-tool repositories and to the ScriptWatch repository where applicable.

| Item | Standard |
|---|---|
| `LICENSE` | GPL-3.0-or-later. Existing suite repositories are licensed; every new suite repository starts licensed from its first commit. |
| No-warranty statement | In the README, in plain language, not only in the license text. |
| `README.md` | Fixed section order: what it does, safety posture, install, usage, finding codes, ownership boundary link, compatibility, license. |
| Safety posture | Stated near the top in fixed vocabulary: `READ-ONLY`, `MODIFIES ON EXPLICIT SELECTION`, or `MODIFIES DOCUMENT-WIDE ON COMMAND`. A practitioner needs to know in five seconds whether the script will touch their file. |
| `CHANGELOG.md` | Present, one entry per tagged release. |
| Tags | Every release tagged `vX.Y.Z`. No repository currently has a tag, so there is no fixed point to install from. |
| `.gitattributes` | Present in all repositories. Currently only HeaderFix has one. |
| GitHub Action | Build, `dist/` freshness check, version parity check. |
| Repository topics | `indesign`, `extendscript`, `publishing`, `epub`, `typesetting`. Discoverability is the whole point of a community release. |
| Repository description | One descriptive sentence in a consistent register. |
| ScriptWatch integration | Suite tool READMEs identify whether the generated artifact includes the ScriptWatch Harness and record the Harness contract version. External/community tools may document optional Harness integration without adopting suite ownership or mutation contracts. |

**Note on safety posture.** Writing this down forces an existing inconsistency into the open. NormalFix and TableFix both state that selection is the remediation boundary and that no document-wide Fix All exists. HeaderFix provides Fix All Errors and Clear All Overrides. The exception may be defensible, since the marker population is small and unambiguous, but three tools in one suite should not carry two safety postures by accident.

**DocStats.** The repository holds a released v1.1.0 script of roughly 1,800 lines, a README, a CHANGELOG, and findings and roadmap documents. It is the most mature tool in the suite and the closest to this standard already: it has a CHANGELOG, uses the `ERROR` / `WARNING` / `INFO` severity axis, and documents its finding codes. GPL licensing is complete. Remaining repository harmonization includes tags, `.gitattributes`, accurate safety-posture language, Actions, topics, descriptions, and CSV provenance.

Its safety posture is `MODIFIES ON EXPLICIT SELECTION`, not `READ-ONLY`. Scanning is read-only; five guarded actions are not. Any statement to the contrary in a README or ownership document is a defect in the highest-consequence field of this standard and should be corrected on sight.

In the ownership model DocStats is the inventory tool, and the style census StyleFix needs belongs there so that two tools do not count the same population independently.

---

## 7. Frozen master adoption sequence

This sequence is authoritative unless a new safety or correctness finding requires revision.

1. **Freeze mandatory ScriptWatch Harness adoption. — CLOSED / PASS**
   Every shipping suite script carries the current pinned `ScriptWatchHeartbeat.jsxinc` + `ScriptWatchJob.jsxinc` contract. Explicit diagnostic canaries may omit it only when instrumentation would invalidate the measurement. Build-time enforcement is implemented at #14.

2. **Close the `core/mutate` real-DOM canary. — CLOSED / PASS**
   T10 proves one-step InDesign Undo restores the declared canary-document digest. T11 proves target replacement, stable target-locator re-resolution, original-ID disappearance, replacement-ID distinction, and collection-index shift.

3. **Close NormalFix production-discrimination gates. — CLOSED / PASS**
   Host-object identity, `frameSpanSignature`, `kerningValue`, `strokeColor`, and related production evidence are complete for the pinned host.

4. **Freeze the `core/identity` contract. — CLOSED / FROZEN**
   Production identity evidence, anonymous-Color reference evidence, positive discrimination fixtures, and the twelve-case adversarial refusal gate are complete. The frozen contract is `docs/NORMALFIX_OBJECT_IDENTITY_CONTRACT_v0_2.md`.

5. **Create `localis-indesign-tools`. — IN PROGRESS**
   GPL-3.0-or-later from the first commit. Move the authoritative harmonization specification here, establish shared-core directories and registries, and relocate proven `core/mutate` work.

   **Permanent source-authority rule:** after #5, no new shared module is developed as a copied implementation inside a tool repository. Tool repositories consume shared source; they do not fork it. This rule is repeated in `CONTRIBUTING.md`.

6. **Implement the NormalFix `core/mutate` adapter from the shared repository.**
   Snapshot, independent digest, mutation, read-back verification, rollback, durable journal, target re-resolution, and frozen identity behavior.

7. **Pass NormalFix adapter conformance.**
   AC01–AC05 plus repair, refusal, rollback, hard-stop, journal, deterministic ordering, and one-step Undo.

8. **Settle ownership boundaries.**
   Make DocStats `EPUB-004` report-only, resolve the complex-table Normal+ gap, and freeze `ownership/OWNERSHIP.md` before other mutation adapters.

9. **Adopt `core/mutate` in DocStats.**
   Start with `relinkAsset`, then the remaining actions DocStats still owns.

10. **Adopt `core/mutate` in TableFix and HeaderFix.**
    Only mutation surfaces assigned by the frozen ownership map.

11. **Implement/adopt `core/color`.**
    NormalFix and TableFix share one color/tint contract.

12. **Implement/adopt `core/text`.**
    Remove remaining direct paragraph-style mutation paths such as HeaderFix's.

13. **Complete remaining shared services.**
    `core/dom`, `core/location`, `core/report`, `core/ui`, and `core/boot`.

14. **Build the single-file distribution system.**
    Inline shared core, mandatory ScriptWatch Harness, and tool source. Emit one GPL-3.0-or-later / John Darby generated-artifact header; stamp tool/core/Harness versions and hashes; enforce Harness presence, license-header correctness and uniqueness, and `dist/` freshness in CI.

    Licensing assertions for generated artifacts:
    - strip module-level source notices during concatenation;
    - emit one canonical generated-artifact header;
    - verify the exact expected header text, including holder `John Darby` and `GPL-3.0-or-later`;
    - verify exactly one SPDX identifier.

15. **Finish repository harmonization.**
    Existing GPL work counts as complete. Finish safety-posture README language, changelogs, tags, `.gitattributes`, Actions, topics, descriptions, ownership links, and release conventions.

16. **Complete DocStats census work.**
    Style census plus independent instance census. It may run in parallel after #9 only against a frozen test corpus so census semantics do not move during #9–#12.

17. **Bring StyleFix onto shared core.**
    After its canary and production-discrimination gates pass.

18. **Run the full-suite release gate.**
    Regression canaries, ScriptWatch outside+inside telemetry, generated-artifact parity, licensing checks, version parity, and release tags.

---

## 8. Frozen evidence and host contracts

### 8.1 ScriptWatch Harness actuals

The Harness requirement is a binding suite decision.

Every shipping Localis InDesign suite script includes the current pinned ScriptWatch Harness contract. ScriptWatch provides two independent views:

- agentless process/host telemetry from outside InDesign;
- Harness semantic state from inside the running script.

Neither substitutes for the other. Disagreement is itself a finding.

The runtime-discovery repair was proven by focused collector tests and live attach: ScriptWatch can start agentlessly, discover a heartbeat created later, and roll from a finished job to a newer job without restart.

### 8.2 `core/mutate` real-DOM actuals

The `core/mutate` v1 contract is frozen.

T10 passed one-step Undo against a separately declared canary-document digest.

T11 passed after the canary stopped using `isValid` as instance-identity proof. The hardened case records PageItem IDs and proves:

- original and replacement IDs differ;
- the original ID disappears from the live document;
- the replacement occupies a different TextFrames collection index;
- the stable target locator resolves the replacement;
- verification runs against the replacement.

A stored host reference remaining `isValid` after underlying-object removal is diagnostic evidence only.

### 8.3 NormalFix production-discrimination actuals

The August 21, 2026 production sweep exercised the frozen 243-key surface across 2,883 `NF-001` Normal+ targets in a 505-page, 23-story manuscript under InDesign 21.5.1.73 / DOM 21.5.

Completed production proof includes:

- 2,883/2,883 exact locator resolution;
- zero exact-key mismatches;
- zero unexpected `NOT_APPLICABLE` classifications;
- object-valued failure isolation;
- `frameSpanSignature` diagnosis;
- positive manual-kerning and non-default-stroke discrimination;
- strict host-object identity/refusal evidence.

The `frameSpanSignature` failure was an operation-surface defect: `Paragraph.parentTextFrames` returns an Array on the pinned host, while the sweep used Collection `.item()`. Manual array indexing and the independent line-derived path agreed on frame IDs.

The production manuscript contained no positive manual `kerningValue` or non-default `strokeColor` case. A separate saved-and-closed document-resident fixture established two distinct manual kerning values and a named non-default stroke. A fresh read-only verifier proved the values through both direct access and the production-shaped one-fetch `textStyleRange.properties` path.

### 8.4 Frozen object identity actuals

Named objects are **identified**. Anonymous document-owned Colors are **referenced**.

Production evidence established that anonymous Colors can be present in `doc.colors` without semantic names, multiple distinct anonymous Colors can share identical model/space/value data, and value matching therefore cannot reconstruct identity.

The anonymous-Color reference canary proved:

- exact serialized reference re-resolution;
- forced verification failure followed by rollback through serialized state;
- one-step InDesign Undo;
- no deleted-ID reuse across 32 new Color objects on the pinned host;
- stage-sensitive missing-reference classification;
- no live host object in authoritative snapshot state.

The adversarial identified-object refusal canary passed 12/12:

1. same-leaf CharacterStyles in different groups remain distinct;
2. CharacterStyle group rename refuses despite the same supplemental ID;
3. CharacterStyle stored-ID conflict refuses;
4. named Swatch/Color rename refuses rather than following ID;
5. same-leaf ParagraphStyles in different groups remain distinct;
6. ParagraphStyle stored-ID conflict refuses;
7. Language semantic-name mismatch refuses;
8. NumberingList semantic-name mismatch refuses;
9. StrokeStyle semantic-name mismatch refuses;
10. Font PostScript-name mismatch refuses;
11. unsupported host family returns `UNSUPPORTED_TYPE`;
12. serialized identity states contain no live host objects.

### 8.5 Host-version binding

Current identity and DOM-surface evidence is qualified for:

- InDesign application version `21.5.1.73`;
- DOM/script version `21.5`.

A future supported host must re-run the relevant discrimination and refusal gates before host-sensitive claims are admitted. This specifically includes anonymous-Color ID non-reuse, collection/Array return shapes, supported operation surfaces, and host-family property behavior.

A host mismatch at a bound production adapter produces `UNSUPPORTED_HOST_VERSION`.

### 8.6 Proof before promotion

Passing test code is not itself production promotion.

A shared-core contract moves into production only after:

1. the unsafe and refusal cases are executable;
2. the pinned-host fixture or production corpus exercises them;
3. independent read-back, rollback, Undo, digest, or observer evidence passes as applicable;
4. failure outcomes match the declared taxonomy;
5. the design is frozen;
6. the proven implementation is reviewed for promotion into shared source.

This is the default suite engineering method for the remaining harmonization sequence.
