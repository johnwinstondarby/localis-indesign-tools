# Contributing to Localis InDesign Tools

This repository is the shared-source authority for the Localis InDesign tool suite.

## Shared-source authority

After establishment of `localis-indesign-tools`, no new shared module is developed as a copied implementation inside a tool repository.

Tool repositories consume shared source from this repository. They do not fork, clone, or independently evolve shared-core implementations.

A tool-specific adapter may live in the tool repository when it contains only tool-owned behavior and calls the shared contract. Shared behavior belongs here.

## Evidence before promotion

Shared-core behavior is frozen from executable evidence.

Before a host-sensitive contract or implementation is promoted:

1. define the expected case and refusal/failure case;
2. build a fixture or canary that can exercise both;
3. run it against the pinned InDesign host;
4. record independent read-back, rollback, Undo, digest, or observer evidence as applicable;
5. freeze only the behavior supported by that evidence.

Reasoning and review define the hypothesis. Canary, census, discrimination, refusal, and conformance results decide promotion.

## Host-object comparison

Never apply strict equality to a value that may be an InDesign host object.

Extract registered primitive evidence first and compare those primitives only.

This rule applies to serializers, digests, verifiers, identity resolution, adapters, and shared-core comparison helpers.

## DOM registry

The DOM registry records operation surface and return shape, not only member names.

Where code depends on them, registry entries identify:

- host family;
- property or method;
- permitted operations;
- expected return shape;
- supported methods or properties used by the suite.

Expected shapes include Array, Collection, scalar, Enumerator, host object, and plain object.

Family-specific code reads only members registered for that host family.

## Host-version binding

Host-sensitive evidence is qualified to the InDesign application version and DOM/script version under which it was proven.

A new supported host version must re-run the relevant qualification gates before host-sensitive assumptions are admitted.

## Mutation safety

Document changes use the shared `core/mutate` transaction contract.

Production mutation adapters preserve:

- target re-resolution;
- immediate precheck;
- authoritative plain-data snapshot;
- independently derived digest;
- mutation;
- read-back verification;
- rollback;
- rollback verification;
- durable journal;
- deterministic ordering;
- declared hard-stop behavior;
- one-step InDesign Undo at the batch boundary.

Dry-run mode is planning only. It does not claim mutation, verification, rollback, or Undo success.

## ScriptWatch Harness

Every shipping Localis InDesign suite script includes the current pinned ScriptWatch Harness contract.

Diagnostic canaries may omit Harness instrumentation only when instrumentation would invalidate the measurement.

ScriptWatch observation and mutation safety are separate concerns. Harness state never substitutes for mutation verification, rollback, journaling, or target re-resolution.

## Licensing

Source contributed to this repository is licensed under GPL-3.0-or-later.

Generated single-file distributions will carry one canonical generated-artifact header with:

- copyright holder `John Darby`;
- `SPDX-License-Identifier: GPL-3.0-or-later`;
- tool, shared-core, and Harness provenance required by the build contract.
