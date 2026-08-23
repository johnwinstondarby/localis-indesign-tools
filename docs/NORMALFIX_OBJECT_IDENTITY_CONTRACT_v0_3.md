# NormalFix Object-Reference Identity Contract v0.3

**Status:** SAFETY AMENDMENT CANDIDATE — August 23, 2026.
**Baseline:** v0.2, frozen August 22, 2026.
**Adoption state:** NormalFix adapter implementation is blocked until the v0.3 freeze gates in §17 pass.

**Reason for amendment:** During NormalFix `core/mutate` adapter construction, the frozen 243-key rollback registry was cross-checked against the frozen v0.2 identity families. Two reconstructive/required keys, `paragraph.kinsokuSet` and `paragraph.mojikumi`, can hold document-resident `KinsokuTable` and `MojikumiTable` objects, but v0.2 did not register either identity family. The disagreement resolved in the unsafe direction: rollback coverage was declared for values the shared identity layer would return as `UNSUPPORTED_TYPE`.

v0.2 remains in the repository as the historical freeze record. v0.3 supersedes v0.2 for future NormalFix adoption only after the amendment gates pass.

## 1. Principle

Rollback state uses two related mechanisms:

1. **identified objects**, where InDesign exposes durable semantic identity;
2. **referenced objects**, where no semantic identity exists and the snapshot can only preserve an opaque document-local reference plus verification evidence.

Resolution is exact or refused.

Snapshots store durable plain data. Live ExtendScript host references are prohibited in authoritative snapshot state.

Sentinel values that represent a legitimate absence of host-object state are normalized before identity serialization. They are not unsupported object families.

## 2. Identified-object families

The identified families are:

| Family | Primary semantic identity | Supplemental evidence |
|---|---|---|
| Language | language name | concrete type, ID when exposed |
| CharacterStyle | qualified style-group path + style name | concrete type, ID |
| ParagraphStyle | qualified style-group path + style name | concrete type, ID |
| Named Swatch/Color | document-scoped name; group path where meaningful | concrete type, ID |
| Font | PostScript name; full name/name only when PostScript name is unavailable | concrete type |
| StrokeStyle | document-scoped name | concrete type, ID |
| NumberingList | document-scoped name | concrete type, ID |
| KinsokuTable | exact document-scoped name | concrete type, ID |
| MojikumiTable | exact document-scoped name | concrete type, ID |

An unregistered host-object family serializes as `UNSUPPORTED_TYPE`. Generic name matching is prohibited for unknown families.

### 2.1 KinsokuTable and MojikumiTable rule

`KinsokuTable` and `MojikumiTable` use the same identified-object pattern as `NumberingList` and `StrokeStyle`:

- the active transaction binds resolution to one document;
- exact document-local name is the primary semantic identity;
- concrete type and object ID are supplemental evidence;
- ID corroborates semantic identity and never overrides it;
- zero semantic candidates returns `UNRESOLVED_IDENTITY` unless the stored ID identifies a renamed or otherwise changed object, which returns `IDENTITY_CONFLICT`;
- multiple exact semantic candidates return `AMBIGUOUS_IDENTITY`;
- matching semantic identity with a different stored ID returns `IDENTITY_CONFLICT`;
- a stale or conflicting specifier returns `SPECIFIER_IDENTITY_CONFLICT`.

No fallback is permitted by collection index, built-in roster position, approximate name, translated name, resource contents, nearest resource, or stored ID alone.

Resolution must not create or materialize a Kinsoku or Mojikumi resource solely to satisfy identity lookup.

### 2.2 Built-in and custom resource rule

On the approved host, standard and custom Kinsoku/Mojikumi resources present the same document-owned object shape once the collections are populated. Standard resources therefore use the same exact document-local name rule as custom resources.

The approved evidence is language-build specific. Cross-locale name equivalence has not been proven.

If a resource name differs because of localization or any other cause, resolution refuses. No translation table or built-in-name substitution is authorized by this contract.

### 2.3 Lazy collection rule

The approved-host surface probe observed both `doc.kinsokuTables` and `doc.mojikumiTables` at count `0` before custom-resource creation, followed by populated standard-resource collections after creation.

Identity resolution may inspect the collection state exposed by the bound document. It must not depend on a fixed built-in count, fixed ordinal, or side-effecting resource creation.

## 3. Sentinel rule: NothingEnum.NOTHING

`paragraph.kinsokuSet` and `paragraph.mojikumi` legitimately return `NothingEnum.NOTHING`.

On the approved host:

- the default value of both properties is the `NOTHING` Enumerator;
- assigning a real KinsokuTable/MojikumiTable produces the expected host-object family;
- assigning `NothingEnum.NOTHING` restores the sentinel state.

`NothingEnum.NOTHING` is therefore a normal absence-of-object state, not an identity failure.

The NormalFix read layer must recognize this sentinel before calling `CoreIdentity.serialize()` and encode it as `CoreMutate.NOT_APPLICABLE`.

`CoreIdentity` must never receive `NothingEnum.NOTHING` as though it were an identified host object. If the adapter fails to normalize the sentinel and identity sees it as an unknown host family, that is an adapter defect, not a legitimate `UNSUPPORTED_TYPE` outcome.

Snapshot, rollback digest, verification, and rollback reconstruction must preserve the sentinel distinctly from:

- `null`;
- `undefined`;
- an empty string;
- an unresolved object;
- an unsupported host-object family.

## 4. Referenced-object family: anonymous document-owned Color

An anonymous document-owned `Color` has no semantic name and therefore has no semantic identity to reconstruct.

The snapshot records an **anonymous Color reference** containing:

- contract version;
- family `AnonymousColorReference`;
- concrete InDesign type;
- document-local object ID;
- color model;
- color space;
- color value;
- object specifier as a lookup path;
- diagnostic document binding metadata.

The active transaction already binds the snapshot to one InDesign document. Resolution never searches another document.

### 4.1 Digest rule

The rollback digest compares the recorded anonymous-Color tuple directly. Digest comparison does not resolve the object.

### 4.2 Restoration rule

Rollback may resolve the stored specifier only inside the bound document. The resolved candidate must agree exactly on:

- concrete type;
- object ID;
- document ownership;
- anonymous-name state;
- color model;
- color space;
- color value.

Any disagreement refuses restoration.

There is no fallback search by color value, collection index, nearest match, or another same-value Color.

### 4.3 Missing-reference rule

If the anonymous Color reference no longer resolves:

- before `mutate()` starts: `SKIPPED / RESOLVE_FAILED`;
- after mutation may have started: `HARD_STOP`.

### 4.4 Evidence

Production evidence established that:

- anonymous Colors are present in `doc.colors` but absent from `doc.swatches`;
- IDs and specifiers survive save, close, and reopen;
- `resolve(specifier)` returns the original object ID;
- many different anonymous Color objects can share identical model, space, and value;
- the tested deleted Color ID was not reused across 32 newly created Color objects;
- one-step InDesign Undo preserved the tested anonymous Color reference;
- forced verification failure followed by rollback restored the tested anonymous Color through serialized state;
- the tested snapshot record contained no live host object.

### 4.5 Version-bound ID non-reuse rule

The anonymous-Color reference rule is qualified only for the approved host build: **InDesign 21.5.1.73 / DOM 21.5**.

The canary proved that a deleted anonymous Color ID was not reused across 32 newly created Color objects on that host. This is empirical host-build evidence, not a timeless property of InDesign. A future host build must re-run the ID-reuse canary before anonymous-Color restoration is admitted. If reuse is observed, the host build is unsupported for this reference mechanism until a stronger discriminator is proven.

A resolver must never assume ID non-reuse solely because it held on a previously approved build.

## 5. Qualified-path rule

For style families, the qualified group path is part of semantic identity.

`Group A/Body Emphasis` and `Group B/Body Emphasis` are different CharacterStyles even when the leaf name is identical.

A group rename or style move changes semantic identity for rollback purposes. Resolution of the old state is refused.

## 6. Supplemental-ID rule for identified objects

ID corroborates semantic identity and never overrides it.

- semantic identity matches and stored ID matches: `RESOLVED`;
- semantic identity matches but stored ID differs: `IDENTITY_CONFLICT`;
- semantic identity has no match but the stored ID points to an object with a different name/path: `IDENTITY_CONFLICT`;
- no semantic match and no ID match: `UNRESOLVED_IDENTITY`.

A resolver never follows ID to a renamed or moved identified object and silently accepts it.

This rule applies to KinsokuTable and MojikumiTable exactly as it applies to other document-scoped identified families.

This rule does not apply to `AnonymousColorReference`, whose ID is the opaque document-local reference key defined in §4.

## 7. Specifier rule

`toSpecifier()` may be retained as a fast same-session lookup and as diagnostic evidence.

ExtendScript resolution uses the global `resolve(specifier)` function.

For identified objects, a specifier result is accepted only after family/name/path/ID verification.

For `AnonymousColorReference`, a specifier result is accepted only after the exact checks in §4.2.

A stale or conflicting specifier produces `SPECIFIER_IDENTITY_CONFLICT`.

## 8. Candidate and family-surface rule

Candidate search is family-specific and bounded. Identity serialization and comparison are also family-specific: code reads only the properties declared for that family. Generic serializers that probe family-irrelevant host properties are prohibited.

This rule is required because InDesign host proxies may throw or stall when a property is read from a family that does not expose it. The adversarial work proved that `StrokeStyle` does not expose Font-only properties such as `postscriptName` and `fullName`; the final v0.2 canary passed only after the serializer stopped probing irrelevant members.

Examples:

- Language searches language collections.
- CharacterStyle searches character styles and validates qualified group path.
- ParagraphStyle searches paragraph styles and validates qualified group path.
- Named Swatch/Color searches the appropriate document swatch/color surface.
- Font enumeration is permitted only for Font state.
- StrokeStyle searches document stroke styles.
- NumberingList searches document numbering lists.
- KinsokuTable searches only the bound document's Kinsoku table surface.
- MojikumiTable searches only the bound document's Mojikumi table surface.
- AnonymousColorReference performs no semantic candidate search and no fallback search.

Cross-family exhaustive fallback is prohibited.

## 9. Cardinality rule

For identified objects:

- exactly one candidate satisfying primary semantic identity: continue to supplemental checks;
- zero candidates: `UNRESOLVED_IDENTITY`, unless supplemental ID exposes a changed object, which is `IDENTITY_CONFLICT`;
- more than one candidate: `AMBIGUOUS_IDENTITY`.

No first-match or best-match behavior is permitted.

AnonymousColorReference does not use candidate cardinality. Its stored reference either resolves and verifies exactly or refuses.

## 10. Snapshot-readiness consequence

Any of the following makes a target snapshot unready:

- `UNSUPPORTED_TYPE`;
- `INCOMPLETE_IDENTITY`;
- `UNRESOLVED_IDENTITY`;
- `AMBIGUOUS_IDENTITY`;
- `IDENTITY_CONFLICT`;
- `SPECIFIER_IDENTITY_CONFLICT`;
- `RESOLVE_FAILED`.

A legitimate `CoreMutate.NOT_APPLICABLE` sentinel is ready state for a registry key whose contract explicitly permits the sentinel.

NormalFix refuses mutation for an unready target. `core/mutate` remains responsible for final transaction state and hard-stop policy.

## 11. Production discrimination gate

Object-valued, container-sensitive, and universally sentinel-valued properties require evidence from pre-existing document-resident state before admission to a production proof surface.

The gate requires:

1. at least one value that existed before the diagnostic script started;
2. a positive discriminating case proving that a non-default/non-sentinel value can be read;
3. for identified host objects, a same-session serialize/strict-resolve round trip;
4. for referenced objects, a strict reference round trip plus mutation/rollback and Undo evidence;
5. a negative/refusal case proving changed semantic identity, conflicting supplemental ID, or invalid reference state is rejected;
6. production-shaped container coverage for container-sensitive properties.

Synthetic fixtures remain valid for deliberate positive discrimination when the production manuscript contains no positive case, provided the fixture is saved and closed before the read-only verifier starts.

## 12. Production-discrimination actuals

The NormalFix production-discrimination gate established:

- production object-valued properties resolve through strict family-specific identity except anonymous Colors, which use §4;
- `Paragraph.parentTextFrames` returns an Array on the approved host, and production `frameSpanSignature` must use array indexing rather than Collection `.item()`;
- direct frame IDs and independent line-derived frame IDs agree on tested production targets;
- the production manuscript contained no positive manual `kerningValue` or non-default `strokeColor` case;
- a saved, closed document-resident fixture proved two distinct manual kerning values through direct `textStyleRange` reads and production-shaped one-fetch `textStyleRange.properties`;
- the same fixture proved a named non-default stroke color, weight, and tint through direct and one-fetch production-shaped reads;
- control/default state remained distinct and the read-only verifier left the fixture unmodified.

The Kinsoku/Mojikumi amendment additionally established on InDesign 21.5.1.73 / DOM 21.5:

- default `paragraph.kinsokuSet` and `paragraph.mojikumi` read as `NothingEnum.NOTHING`;
- custom KinsokuTable and MojikumiTable values are writable and read back as their concrete host-object types;
- standard and custom resources present as document-owned objects when the collections are populated;
- names and object IDs remained stable across save, close, and reopen in the disposable fixture;
- the parent document ID changed across reopen, confirming that document object ID is diagnostic binding evidence rather than durable semantic identity;
- global `resolve(specifier)` returned exactly one matching resource for each recorded table in the probe;
- no cross-locale name-equivalence claim was established.

## 13. Registry-to-identity coverage cross-check

The identity contract and rollback registry must be mechanically cross-checked before mutation.

Every frozen digest-registry key whose runtime value can be a host object must have an explicit startup declaration that maps the key to:

1. a registered CoreIdentity family; and
2. any legitimate sentinel state permitted for that key.

A host-object-capable reconstructive key with no registered identity family is `ADAPTER_CONTRACT_MISMATCH`.

A sentinel-capable key whose sentinel normalization rule is undeclared is `ADAPTER_CONTRACT_MISMATCH`.

The cross-check fails before any target mutation begins.

The check must derive its registry input independently from the identity implementation. A list copied from `CoreIdentity` into the check is circular and does not satisfy this requirement.

The NormalFix frozen registry remains the authority for rollback/digest key membership. The shared identity layer remains the authority for supported identity families. The adapter binding between those authorities must be explicit and testable.

This gate exists because the v0.2 12/12 identity canary tested only families already declared by the identity contract and therefore could not expose a disagreement with the independent rollback registry.

## 14. Adversarial refusal gate

A disposable-document canary must prove the identified-object resolver refuses unsafe substitutions.

Required v0.3 cases:

1. two CharacterStyles with the same leaf name in different groups remain distinct by qualified path;
2. renaming a style group after snapshot makes the old CharacterStyle identity refuse even when the stored ID still points to the moved object;
3. changing stored CharacterStyle ID while name/path match produces `IDENTITY_CONFLICT`;
4. renaming a named swatch after snapshot makes the old identity refuse rather than following ID;
5. two ParagraphStyles with the same leaf name in different groups remain distinct by qualified path;
6. a stored ParagraphStyle ID conflict refuses;
7. a Language name mismatch refuses rather than following ID;
8. a NumberingList name mismatch refuses rather than following ID;
9. a StrokeStyle name mismatch refuses rather than following ID;
10. a Font PostScript-name mismatch refuses;
11. an unsupported host-object family returns `UNSUPPORTED_TYPE`;
12. snapshot records contain no live host objects;
13. a KinsokuTable semantic-name mismatch refuses rather than following stored ID;
14. a KinsokuTable stored-ID conflict refuses while exact semantic name matches;
15. a MojikumiTable semantic-name mismatch refuses rather than following stored ID;
16. a MojikumiTable stored-ID conflict refuses while exact semantic name matches.

The disposable document is saved, closed, and reopened before the adversarial tests so the tested objects are document-resident rather than transient setup objects.

The v0.2 12/12 result remains historical evidence. v0.3 requires a fresh 16/16 modular run against the amended shared implementation.

## 15. Sentinel normalization gate

The v0.3 proof set must additionally prove, outside the 16 identified-object refusal cases:

1. `NothingEnum.NOTHING` for `paragraph.kinsokuSet` is normalized to `CoreMutate.NOT_APPLICABLE`;
2. `NothingEnum.NOTHING` for `paragraph.mojikumi` is normalized to `CoreMutate.NOT_APPLICABLE`;
3. neither sentinel reaches `CoreIdentity.serialize()`;
4. a real KinsokuTable reaches CoreIdentity as `KinsokuTable`;
5. a real MojikumiTable reaches CoreIdentity as `MojikumiTable`;
6. digest serialization preserves `CoreMutate.NOT_APPLICABLE` distinctly.

Failure of any sentinel case blocks NormalFix adapter adoption.

## 16. DOM return-shape registry requirement

Member-name probing alone is insufficient for suite compatibility.

The shared DOM contract registry must record and probe expected return shape where code depends on shape. Examples include Array, Collection, scalar, Enumerator, host object, and plain object.

The production `parentTextFrames` failure established this requirement: the member exists, but it returns an Array on the approved host and therefore does not support Collection methods such as `.item()`.

The Kinsoku/Mojikumi probe adds another shape requirement: `NothingEnum.NOTHING` presents as an `Enumerator`, while assigned values present as `KinsokuTable` and `MojikumiTable` host objects.

This requirement belongs to the shared DOM contract surface, not to object identity resolution.

## 17. Amendment freeze record and adoption rule

v0.3 may be marked **FROZEN** only after all of the following pass on the approved host, InDesign `21.5.1.73` / DOM `21.5`:

1. the shared `CoreIdentity` implementation registers KinsokuTable and MojikumiTable with the rules in §2;
2. the amended adversarial refusal canary passes 16/16;
3. ScriptWatch independently reports successful completion for the amended canary;
4. the sentinel normalization gate in §15 passes;
5. the registry-to-identity coverage cross-check in §13 passes against the frozen 243-key NormalFix registry;
6. snapshot state still contains no live host objects;
7. no collection-index, built-in-roster, translated-name, or ID-only fallback exists for KinsokuTable or MojikumiTable;
8. final review finds no remaining blocking safety case.

Until all eight conditions pass:

- v0.2 remains the last frozen identity baseline;
- v0.3 remains an amendment candidate;
- NormalFix production mutation must not adopt the incomplete identity surface.

After freeze, v0.3 is the binding identity contract for NormalFix adapter implementation and conformance. Future host builds must requalify version-bound claims, including anonymous-Color ID non-reuse, Kinsoku/Mojikumi return shape, built-in resource behavior, and any localization-dependent identity behavior.

## 18. Amendment evidence and provenance

Historical identity contract:

- `docs/NORMALFIX_OBJECT_IDENTITY_CONTRACT_v0_2.md`

Shared implementation prior to amendment:

- `core/identity/CoreIdentity.jsxinc`
- promotion commit `0934b58a2074067ffb54323226078ccc616ad08d`

Frozen NormalFix rollback registry:

- `NormalFix/src/NORMALFIX_DIGEST_KEY_REGISTRY_v1.0_FROZEN.csv`
- 243 keys
- `paragraph.kinsokuSet`: RECONSTRUCTIVE / REQUIRED
- `paragraph.mojikumi`: RECONSTRUCTIVE / REQUIRED

Kinsoku/Mojikumi surface evidence:

- `tests/canary/CoreIdentity_KinsokuMojikumi_SurfaceProbe_v1.jsx`
- probe commit `ba1fe78c2527274fada9603ba4a7fc7b1a5b2d8a`
- probe version `1.0.0`
- approved host: InDesign `21.5.1.73` / DOM `21.5`
- result: `failures=0`, PASS

Earlier snapshot-reconstruction evidence used a pre-freeze generic serialized host record plus specifier/name fallback for KinsokuTable and MojikumiTable. That evidence proved reconstructability and no-live-host-reference capture. It did not prove the stricter v0.2 semantic-identity refusal contract. v0.3 closes that gap by bringing both families under the shared identified-object rules and requiring adversarial refusal proof.
