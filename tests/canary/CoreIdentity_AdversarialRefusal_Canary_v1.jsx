/*
 * Localis InDesign Tools - core/identity modular adversarial refusal canary
 * Copyright (C) 2026 John Darby
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

#target "InDesign"
#include "../../core/identity/CoreIdentity.jsxinc"
#include "../../../ScriptWatch/ScriptWatchHeartbeat.jsxinc"
#include "../../../ScriptWatch/ScriptWatchJob.jsxinc"

/*
core/identity modular adversarial refusal canary v1.0.0
Contract candidate: NORMALFIX_OBJECT_IDENTITY_CONTRACT_v0_2.md
Contract version exercised by this canary: 0.2.0

DEVELOPMENT CANARY ONLY. This exercises the shared core/identity source directly.

The canary:
  1. creates a disposable fixture document;
  2. creates every test object before testing;
  3. saves, closes, and reopens the fixture;
  4. runs twelve adversarial refusal cases;
  5. closes without saving and deletes the disposable fixture.

No production manuscript is required or modified.

Cases:
  IR01 CharacterStyles with same leaf name remain distinct by qualified path
  IR02 CharacterStyle group rename refuses despite same supplemental ID
  IR03 CharacterStyle stored-ID conflict refuses
  IR04 named swatch rename refuses rather than following ID
  IR05 ParagraphStyles with same leaf name remain distinct by qualified path
  IR06 ParagraphStyle stored-ID conflict refuses
  IR07 Language semantic-name mismatch refuses
  IR08 NumberingList semantic-name mismatch refuses
  IR09 StrokeStyle semantic-name mismatch refuses
  IR10 Font PostScript-name mismatch refuses
  IR11 unsupported host-object family returns UNSUPPORTED_TYPE
  IR12 serialized identity states contain no live host objects
*/

(function () {
    var CANARY_VERSION = "1.0.0";
    var CONTRACT_VERSION = "0.2.0";
    var EXPECTED_APP = "21.5.1.73";
    var EXPECTED_DOM = "21.5";
    var TEST_TOTAL = 12;
    var OUTPUT_PATH =
        "D:/Recovery Community Dropbox/DARBY FAMILY/!!!New Business 2025/AI Ecosystem/DocStats";

    var report = [];
    var passCount = 0;
    var testCount = 0;
    var sw = null;
    var doc = null;
    var tempFile = null;

    function safe(v) {
        try {
            if (!v) {
                if (v === 0) { return "0"; }
                if (v === false) { return "false"; }
                if (v === "") { return ""; }
                return "";
            }
            return String(v);
        } catch (e) {
            return "<unstringable>";
        }
    }

    function valid(obj) {
        /*
         * Do not use strict equality between an InDesign host proxy and
         * null/undefined here. Some host classes, including Color on
         * InDesign 21.5.1.73, throw from their ExtendScript === operator.
         */
        try {
            if (!obj) { return false; }
        } catch (eTruthy) {
            return false;
        }
        try {
            if (obj.isValid === false) { return false; }
        } catch (eValid) {}
        return true;
    }

    function typeName(obj) {
        var out = "";
        if (!valid(obj)) { return out; }
        try {
            if (obj.reflect && obj.reflect.name) {
                out = String(obj.reflect.name);
                if (out.length > 0) { return out; }
            }
        } catch (eReflect) {}
        try {
            if (obj.constructorName !== undefined) {
                out = String(obj.constructorName);
                if (out.length > 0) { return out; }
            }
        } catch (eConstructor) {}
        return out;
    }

    function stringProp(obj, prop) {
        try {
            if (obj[prop] === null || obj[prop] === undefined) { return ""; }
            return String(obj[prop]);
        } catch (e) {
            return "";
        }
    }

    function objectId(obj) {
        return stringProp(obj, "id");
    }

    function safeSpecifier(obj) {
        try { return String(obj.toSpecifier()); }
        catch (e) { return ""; }
    }

    function copyState(state) {
        var out = {}, key, i;
        for (key in state) {
            try {
                if (state.hasOwnProperty && !state.hasOwnProperty(key)) { continue; }
            } catch (eOwn) {}
            if (state[key] instanceof Array) {
                out[key] = [];
                for (i = 0; i < state[key].length; i++) {
                    out[key].push(state[key][i]);
                }
            } else {
                out[key] = state[key];
            }
        }
        return out;
    }

    /*
     * Identity operations below delegate to the shared source. The canary keeps
     * only fixture/report helpers locally so its results exercise core/identity
     * rather than a copied implementation.
     */
    function serializeIdentity(obj) {
        return CoreIdentity.serialize(obj);
    }

    function firstValidItem(collection) {
        var items = collectionItems(collection);
        var i;
        for (i = 0; i < items.length; i++) {
            if (valid(items[i])) { return items[i]; }
        }
        return null;
    }

    function collectionItems(collection) {
        var out = [];
        var i, item;

        if (!collection) { return out; }

        try {
            if (collection instanceof Array) {
                for (i = 0; i < collection.length; i++) {
                    if (valid(collection[i])) { out.push(collection[i]); }
                }
                return out;
            }
        } catch (eArray) {}

        try {
            for (i = 0; i < collection.length; i++) {
                try {
                    item = collection.item ? collection.item(i) : collection[i];
                    if (valid(item)) { out.push(item); }
                } catch (eItem) {}
            }
        } catch (eCollection) {}

        return out;
    }

    function resolveIdentity(docRef, state) {
        return CoreIdentity.resolve(docRef, state);
    }

    function isRefusalStatus(status) {
        return CoreIdentity.isRefusalStatus(status);
    }

    function containsLiveHostObject(value, depth) {
        return CoreIdentity.containsLiveHostObject(value, depth);
    }

    function require(condition, message) {
        if (!condition) { throw new Error(message); }
    }

    function forceHarnessNote(text) {
        try {
            if (typeof ScriptWatch !== "undefined" && ScriptWatch) {
                ScriptWatch.note(
                    "CoreIdentityAdversarialCanary | harness " +
                    ScriptWatchJob.VERSION + " | " + text,
                    true
                );
            }
        } catch (eNote) {}
    }

    function record(testId, description, ok, detail) {
        testCount++;
        if (ok) { passCount++; }

        report.push(
            testId + " " + (ok ? "PASS" : "FAIL") + " " +
            description +
            (detail ? " :: " + detail : "")
        );

        try {
            if (sw) {
                sw.step(testId + " " + (ok ? "PASS" : "FAIL"));
                if (ok) {
                    sw.pass();
                } else {
                    sw.fail(detail || description);
                }
                sw.metric("testsRun", testCount);
                sw.metric("testsPassed", passCount);
            }
        } catch (eHarness) {}
    }

    function runCase(testId, description, fn) {
        try {
            fn();
            record(testId, description, true, "");
        } catch (e) {
            record(testId, description, false, safe(e.message));
        }
    }

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function stamp() {
        var d = new Date();
        return d.getFullYear() +
            pad(d.getMonth() + 1) +
            pad(d.getDate()) + "-" +
            pad(d.getHours()) +
            pad(d.getMinutes()) +
            pad(d.getSeconds());
    }

    function outputFolder() {
        var folder = new Folder(OUTPUT_PATH);
        if (folder.exists) { return folder; }
        return Folder.temp;
    }

    function writeReport() {
        var path =
            outputFolder().fsName +
            "/CoreIdentity_AdversarialRefusal_" +
            stamp() + ".txt";
        var f = new File(path);
        var i;

        f.encoding = "UTF-8";
        f.lineFeed = "Windows";

        if (!f.open("w")) { return "<report write failed>"; }

        f.writeln("core/identity modular adversarial refusal canary");
        f.writeln("canaryVersion=" + CANARY_VERSION);
        f.writeln("contractVersion=" + CONTRACT_VERSION);
        f.writeln("InDesignVersion=" + safe(app.version));
        try {
            f.writeln("DOMVersion=" + safe(app.scriptPreferences.version));
        } catch (eDom) {}
        f.writeln("");

        for (i = 0; i < report.length; i++) {
            f.writeln(report[i]);
        }

        f.writeln("");
        f.writeln("Summary: " + passCount + "/" + testCount + " PASS");
        f.close();

        return path;
    }

    function cleanup() {
        try {
            if (doc && valid(doc)) {
                doc.close(SaveOptions.NO);
            }
        } catch (eClose) {
            report.push("CLEANUP WARN close: " + safe(eClose.message));
        }

        doc = null;

        try {
            if (tempFile && tempFile.exists) {
                tempFile.remove();
            }
        } catch (eDelete) {
            report.push("CLEANUP WARN delete: " + safe(eDelete.message));
        }
    }

    if (safe(app.version) !== EXPECTED_APP) {
        alert(
            "core/identity modular adversarial refusal canary " +
            CANARY_VERSION +
            "\n\nUnsupported InDesign version: " + safe(app.version) +
            "\nExpected: " + EXPECTED_APP
        );
        return;
    }

    try {
        if (safe(app.scriptPreferences.version) !== EXPECTED_DOM) {
            alert(
                "core/identity modular adversarial refusal canary " +
                CANARY_VERSION +
                "\n\nUnsupported DOM version: " +
                safe(app.scriptPreferences.version) +
                "\nExpected: " + EXPECTED_DOM
            );
            return;
        }
    } catch (eDomVersion) {
        alert("Could not read InDesign DOM version.");
        return;
    }

    try {
        sw = ScriptWatchJob.begin({
            job: "core/identity modular adversarial refusal canary",
            tool: "CoreIdentityAdversarialCanary",
            toolVersion: CANARY_VERSION,
            mode: "canary",
            total: TEST_TOTAL,
            everyTargets: 1,
            everyMs: 1000,
            checkpointEvery: 1,
            gcOnCheckpoint: false
        });
    } catch (eHarnessStart) {
        sw = null;
    }

    var fixtureName =
        "NormalFix_CoreIdentity_Adversarial_" + stamp() + ".indd";
    tempFile = new File(Folder.temp.fsName + "/" + fixtureName);

    var csGA, csGB, csRenameGroup, csIdGroup;
    var csA, csB, csRename, csId, csIdOther;
    var psGA, psGB, psIdGroup;
    var psA, psB, psId, psIdOther;
    var swatchRename, numberList, strokeStyle, strokeStyleFixtureId = "";
    var unsupportedFrame;
    var fontObj = null, langObj = null;

    var allStates = [];

    require(CoreIdentity.CONTRACT_VERSION === CONTRACT_VERSION,
        "shared core/identity contract version mismatch: " + CoreIdentity.CONTRACT_VERSION);

    try {
        // -----------------------------------------------------------------
        // Fixture construction. All tested objects exist before save/reopen.
        // -----------------------------------------------------------------
        doc = app.documents.add();

        csGA = doc.characterStyleGroups.add({name:"NF CS Group A"});
        csGB = doc.characterStyleGroups.add({name:"NF CS Group B"});
        csRenameGroup = doc.characterStyleGroups.add({name:"NF CS Rename Group"});
        csIdGroup = doc.characterStyleGroups.add({name:"NF CS ID Group"});

        csA = csGA.characterStyles.add({name:"Shared Leaf"});
        csB = csGB.characterStyles.add({name:"Shared Leaf"});
        csRename = csRenameGroup.characterStyles.add({name:"Rename Leaf"});
        csId = csIdGroup.characterStyles.add({name:"ID Leaf"});
        csIdOther = csIdGroup.characterStyles.add({name:"ID Other"});

        psGA = doc.paragraphStyleGroups.add({name:"NF PS Group A"});
        psGB = doc.paragraphStyleGroups.add({name:"NF PS Group B"});
        psIdGroup = doc.paragraphStyleGroups.add({name:"NF PS ID Group"});

        psA = psGA.paragraphStyles.add({name:"Shared Para Leaf"});
        psB = psGB.paragraphStyles.add({name:"Shared Para Leaf"});
        psId = psIdGroup.paragraphStyles.add({name:"Para ID Leaf"});
        psIdOther = psIdGroup.paragraphStyles.add({name:"Para ID Other"});

        swatchRename = doc.colors.add({
            name:"NF Identity Swatch",
            model:ColorModel.PROCESS,
            space:ColorSpace.RGB,
            colorValue:[12, 34, 56]
        });

        numberList = doc.numberingLists.add({name:"NF Identity List"});

        /*
         * StrokeStyle is intentionally selected from the document's existing
         * stroke-style surface. On InDesign 21.5.1.73, the stroke-style surface is
         * readable but does not expose a creation method. IR09 needs a stable
         * StrokeStyle identity and a forged-name refusal; it does not require
         * creating or renaming the host object.
         */
        strokeStyle = firstValidItem(doc.strokeStyles);
        require(valid(strokeStyle), "No existing StrokeStyle is available for IR09.");

        report.push(
            "FIXTURE DIAG strokeStyles.length=" +
            collectionItems(doc.strokeStyles).length +
            " typeofAdd=" + (typeof doc.strokeStyles.add) +
            " selectedName=" + stringProp(strokeStyle, "name") +
            " selectedId=" + objectId(strokeStyle)
        );

        unsupportedFrame = doc.pages.item(0).textFrames.add();
        unsupportedFrame.geometricBounds = [36, 36, 100, 300];
        unsupportedFrame.contents = "Identity unsupported-family fixture";

        try {
            if (app.fonts.length > 0) {
                fontObj = app.fonts.item(0);
            }
        } catch (eFonts) {}

        try {
            if (app.languagesWithVendors.length > 0) {
                langObj = app.languagesWithVendors.item(0);
            } else if (app.languages.length > 0) {
                langObj = app.languages.item(0);
            }
        } catch (eLanguages) {}

        require(valid(fontObj), "No Font object available for IR10.");
        require(valid(langObj), "No Language object available for IR07.");

        strokeStyleFixtureId = objectId(strokeStyle);
        require(strokeStyleFixtureId.length > 0,
            "Selected StrokeStyle exposes no usable ID.");

        doc.save(tempFile);
        doc.close(SaveOptions.YES);
        doc = null;

        // -----------------------------------------------------------------
        // Fresh reopen. All identity snapshots begin from document-resident
        // objects after serialization through the INDD file.
        // -----------------------------------------------------------------
        doc = app.open(tempFile);

        // Re-acquire by the fixture's semantic names.
        csGA = doc.characterStyleGroups.itemByName("NF CS Group A");
        csGB = doc.characterStyleGroups.itemByName("NF CS Group B");
        csRenameGroup = doc.characterStyleGroups.itemByName("NF CS Rename Group");
        csIdGroup = doc.characterStyleGroups.itemByName("NF CS ID Group");

        csA = csGA.characterStyles.itemByName("Shared Leaf");
        csB = csGB.characterStyles.itemByName("Shared Leaf");
        csRename = csRenameGroup.characterStyles.itemByName("Rename Leaf");
        csId = csIdGroup.characterStyles.itemByName("ID Leaf");
        csIdOther = csIdGroup.characterStyles.itemByName("ID Other");

        psGA = doc.paragraphStyleGroups.itemByName("NF PS Group A");
        psGB = doc.paragraphStyleGroups.itemByName("NF PS Group B");
        psIdGroup = doc.paragraphStyleGroups.itemByName("NF PS ID Group");

        psA = psGA.paragraphStyles.itemByName("Shared Para Leaf");
        psB = psGB.paragraphStyles.itemByName("Shared Para Leaf");
        psId = psIdGroup.paragraphStyles.itemByName("Para ID Leaf");
        psIdOther = psIdGroup.paragraphStyles.itemByName("Para ID Other");

        swatchRename = doc.colors.itemByName("NF Identity Swatch");
        numberList = doc.numberingLists.itemByName("NF Identity List");

        /*
         * Re-acquire the previously selected StrokeStyle by durable document
         * ID after save/close/reopen. Do not assume Collection itemByName().
         */
        var reopenedStrokeItems = collectionItems(doc.strokeStyles);
        var reopenedStroke = null;
        var reopenedStrokeIndex;
        for (reopenedStrokeIndex = 0;
             reopenedStrokeIndex < reopenedStrokeItems.length;
             reopenedStrokeIndex++) {
            if (objectId(reopenedStrokeItems[reopenedStrokeIndex]) ===
                strokeStyleFixtureId) {
                reopenedStroke = reopenedStrokeItems[reopenedStrokeIndex];
                break;
            }
        }
        strokeStyle = reopenedStroke;

        unsupportedFrame = doc.pages.item(0).textFrames.item(0);

        require(valid(csA) && valid(csB), "CharacterStyle fixture reacquire failed.");
        require(valid(psA) && valid(psB), "ParagraphStyle fixture reacquire failed.");
        require(valid(swatchRename), "Swatch fixture reacquire failed.");
        require(valid(numberList), "NumberingList fixture reacquire failed.");
        require(valid(strokeStyle), "StrokeStyle fixture reacquire failed.");

        // -----------------------------------------------------------------
        // IR01
        // -----------------------------------------------------------------
        runCase(
            "IR01",
            "CharacterStyles with same leaf name remain distinct by qualified path",
            function () {
                var a = serializeIdentity(csA);
                var b = serializeIdentity(csB);
                var resolved;

                require(a.ok && b.ok, "CharacterStyle serialization failed.");
                require(a.state.name === b.state.name, "fixture leaf names differ.");
                require(a.state.path !== b.state.path, "qualified paths are not distinct.");

                allStates.push(a.state);
                allStates.push(b.state);

                resolved = resolveIdentity(doc, a.state);
                require(resolved.ok && resolved.status === "RESOLVED",
                    "Group A state did not resolve.");
                require(objectId(resolved.candidate) === a.state.id,
                    "Group A state resolved to wrong ID.");
                require(objectId(resolved.candidate) !== b.state.id,
                    "Group A state resolved to Group B style.");
            }
        );

        // -----------------------------------------------------------------
        // IR02
        // -----------------------------------------------------------------
        runCase(
            "IR02",
            "CharacterStyle group rename refuses despite same supplemental ID",
            function () {
                var before = serializeIdentity(csRename);
                var result;
                var savedId;

                require(before.ok, "CharacterStyle serialization failed.");
                allStates.push(before.state);
                savedId = before.state.id;

                csRenameGroup.name = "NF CS Rename Group Changed";

                result = resolveIdentity(doc, before.state);
                require(!result.ok, "renamed group unexpectedly resolved.");
                require(result.status === "IDENTITY_CONFLICT",
                    "expected IDENTITY_CONFLICT, got " + result.status);
                require(objectId(csRename) === savedId,
                    "fixture ID changed during group rename.");

                csRenameGroup.name = "NF CS Rename Group";
            }
        );

        // -----------------------------------------------------------------
        // IR03
        // -----------------------------------------------------------------
        runCase(
            "IR03",
            "CharacterStyle stored-ID conflict refuses",
            function () {
                var original = serializeIdentity(csId);
                var forged, result;

                require(original.ok, "CharacterStyle serialization failed.");
                allStates.push(original.state);

                forged = copyState(original.state);
                forged.id = objectId(csIdOther);

                result = resolveIdentity(doc, forged);
                require(!result.ok, "forged CharacterStyle ID unexpectedly resolved.");
                require(result.status === "IDENTITY_CONFLICT",
                    "expected IDENTITY_CONFLICT, got " + result.status);
            }
        );

        // -----------------------------------------------------------------
        // IR04
        // -----------------------------------------------------------------
        runCase(
            "IR04",
            "named swatch rename refuses rather than following ID",
            function () {
                var before = serializeIdentity(swatchRename);
                var result;
                var savedId;

                require(before.ok, "named swatch serialization failed.");
                allStates.push(before.state);
                savedId = before.state.id;

                swatchRename.name = "NF Identity Swatch Changed";

                result = resolveIdentity(doc, before.state);
                require(!result.ok, "renamed swatch unexpectedly resolved.");
                require(result.status === "IDENTITY_CONFLICT",
                    "expected IDENTITY_CONFLICT, got " + result.status);
                require(objectId(swatchRename) === savedId,
                    "fixture swatch ID changed during rename.");

                swatchRename.name = "NF Identity Swatch";
            }
        );

        // -----------------------------------------------------------------
        // IR05
        // -----------------------------------------------------------------
        runCase(
            "IR05",
            "ParagraphStyles with same leaf name remain distinct by qualified path",
            function () {
                var a = serializeIdentity(psA);
                var b = serializeIdentity(psB);
                var resolved;

                require(a.ok && b.ok, "ParagraphStyle serialization failed.");
                require(a.state.name === b.state.name, "fixture paragraph leaf names differ.");
                require(a.state.path !== b.state.path, "paragraph qualified paths are not distinct.");

                allStates.push(a.state);
                allStates.push(b.state);

                resolved = resolveIdentity(doc, a.state);
                require(resolved.ok && resolved.status === "RESOLVED",
                    "Group A ParagraphStyle did not resolve.");
                require(objectId(resolved.candidate) === a.state.id,
                    "ParagraphStyle resolved to wrong ID.");
                require(objectId(resolved.candidate) !== b.state.id,
                    "ParagraphStyle resolved to wrong group.");
            }
        );

        // -----------------------------------------------------------------
        // IR06
        // -----------------------------------------------------------------
        runCase(
            "IR06",
            "ParagraphStyle stored-ID conflict refuses",
            function () {
                var original = serializeIdentity(psId);
                var forged, result;

                require(original.ok, "ParagraphStyle serialization failed.");
                allStates.push(original.state);

                forged = copyState(original.state);
                forged.id = objectId(psIdOther);

                result = resolveIdentity(doc, forged);
                require(!result.ok, "forged ParagraphStyle ID unexpectedly resolved.");
                require(result.status === "IDENTITY_CONFLICT",
                    "expected IDENTITY_CONFLICT, got " + result.status);
            }
        );

        // -----------------------------------------------------------------
        // IR07
        // -----------------------------------------------------------------
        runCase(
            "IR07",
            "Language semantic-name mismatch refuses",
            function () {
                var original = serializeIdentity(langObj);
                var forged, result;

                require(original.ok, "Language serialization failed.");
                allStates.push(original.state);

                forged = copyState(original.state);
                forged.name = "__NF_MISSING_LANGUAGE__";
                forged.path = "__NF_MISSING_LANGUAGE__";

                result = resolveIdentity(doc, forged);
                require(!result.ok, "forged Language unexpectedly resolved.");
                require(isRefusalStatus(result.status),
                    "unexpected refusal status " + result.status);
            }
        );

        // -----------------------------------------------------------------
        // IR08
        // -----------------------------------------------------------------
        runCase(
            "IR08",
            "NumberingList semantic-name mismatch refuses",
            function () {
                var original = serializeIdentity(numberList);
                var forged, result;

                require(original.ok, "NumberingList serialization failed.");
                allStates.push(original.state);

                forged = copyState(original.state);
                forged.name = "__NF_MISSING_NUMBERING_LIST__";
                forged.path = "__NF_MISSING_NUMBERING_LIST__";

                result = resolveIdentity(doc, forged);
                require(!result.ok, "forged NumberingList unexpectedly resolved.");
                require(isRefusalStatus(result.status),
                    "unexpected refusal status " + result.status);
            }
        );

        // -----------------------------------------------------------------
        // IR09
        // -----------------------------------------------------------------
        runCase(
            "IR09",
            "StrokeStyle semantic-name mismatch refuses",
            function () {
                var original, forged, result;

                forceHarnessNote("IR09 before serializeIdentity");
                original = serializeIdentity(strokeStyle);
                forceHarnessNote("IR09 after serializeIdentity");

                require(original.ok, "StrokeStyle serialization failed.");
                allStates.push(original.state);

                forceHarnessNote("IR09 before clone/forge");
                forged = copyState(original.state);
                forged.name = "__NF_MISSING_STROKE_STYLE__";
                forged.path = "";
                forceHarnessNote("IR09 after clone/forge");

                forceHarnessNote("IR09 before resolveIdentity");
                result = resolveIdentity(doc, forged);
                forceHarnessNote(
                    "IR09 after resolveIdentity status=" + result.status
                );

                require(!result.ok, "forged StrokeStyle unexpectedly resolved.");
                require(isRefusalStatus(result.status),
                    "unexpected refusal status " + result.status);
            }
        );

        // -----------------------------------------------------------------
        // IR10
        // -----------------------------------------------------------------
        runCase(
            "IR10",
            "Font PostScript-name mismatch refuses",
            function () {
                var original = serializeIdentity(fontObj);
                var forged, result;

                require(original.ok, "Font serialization failed.");
                allStates.push(original.state);

                forged = copyState(original.state);

                if (forged.postscriptName.length > 0) {
                    forged.postscriptName = "__NF_MISSING_POSTSCRIPT_FONT__";
                } else if (forged.fullName.length > 0) {
                    forged.fullName = "__NF_MISSING_FULL_FONT__";
                } else {
                    forged.name = "__NF_MISSING_FONT_NAME__";
                }

                result = resolveIdentity(doc, forged);
                require(!result.ok, "forged Font unexpectedly resolved.");
                require(isRefusalStatus(result.status),
                    "unexpected refusal status " + result.status);
            }
        );

        // -----------------------------------------------------------------
        // IR11
        // -----------------------------------------------------------------
        runCase(
            "IR11",
            "unsupported host-object family returns UNSUPPORTED_TYPE",
            function () {
                var serialized = serializeIdentity(unsupportedFrame);

                require(!serialized.ok, "TextFrame unexpectedly serialized as supported.");
                require(serialized.status === "UNSUPPORTED_TYPE",
                    "expected UNSUPPORTED_TYPE, got " + serialized.status);
                allStates.push(serialized.state);
            }
        );

        // -----------------------------------------------------------------
        // IR12
        // -----------------------------------------------------------------
        runCase(
            "IR12",
            "serialized identity states contain no live host objects",
            function () {
                var i;
                require(allStates.length >= 10,
                    "insufficient serialized states for plain-data audit.");

                for (i = 0; i < allStates.length; i++) {
                    require(
                        !containsLiveHostObject(allStates[i], 0),
                        "live host object detected in state index " + i
                    );
                }
            }
        );

    } catch (fatal) {
        report.push("FATAL " + safe(fatal.message));
    } finally {
        cleanup();

        try {
            if (sw) {
                sw.end(
                    (testCount === TEST_TOTAL && passCount === TEST_TOTAL) ?
                        "DONE" : "ABORTED",
                    passCount + "/" + testCount + " PASS"
                );
            }
        } catch (eHarnessEnd) {}

        var reportPath = writeReport();

        alert(
            "core/identity modular adversarial refusal canary " +
            CANARY_VERSION + "\n\n" +
            passCount + "/" + testCount + " PASS\n\n" +
            "Report:\n" + reportPath
        );
    }
}());
