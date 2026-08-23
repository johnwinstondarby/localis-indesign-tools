#target "InDesign"

#include "../../core/mutate/CoreMutate.jsxinc"
#include "../../../ScriptWatch/ScriptWatchHeartbeat.jsxinc"
#include "../../../ScriptWatch/ScriptWatchJob.jsxinc"

/*
core/mutate real-DOM canary body
Canary version: 1.0.0-dev6
T10: one InDesign Undo restores declared canary-document digest.
T11: mutation invalidates the original target instance; stable-locator re-resolution still verifies.

This body is concatenated after core/mutate.js to build dist/CoreMutate_RealDOM_Canary.jsx.
*/

(function () {
    var CANARY_VERSION = "1.0.0-dev6";
    var PREFERRED_OUTPUT_PATH = "D:/Recovery Community Dropbox/DARBY FAMILY/!!!New Business 2025/AI Ecosystem/DocStats";
    var report = [];
    var doc = null;
    var frame = null;
    var story = null;
    var changedParagraphStyle = null;
    var markCharacterStyle = null;
    var testCount = 0;
    var passCount = 0;
    var swSession = null;
    var outputFolder = resolveOutputFolder();
    var journalBase;

    if (outputFolder === null) {
        alert("core/mutate real-DOM canary\n\nNo output folder was selected. No test was run.");
        return;
    }

    journalBase = outputFolder.fsName + "/CoreMutate_Canary_" + timestampToken();

    swSession = ScriptWatchJob.begin({
        job: "core/mutate real-DOM canary",
        tool: "CoreMutateRealDOMCanary",
        toolVersion: CANARY_VERSION,
        mode: "canary",
        total: 2,
        everyTargets: 1,
        everyMs: 1000,
        checkpointEvery: 1,
        gcOnCheckpoint: false
    });
    swSession.note("T10/T11 real-DOM validation");

    function log(line) {
        report.push(String(line));
    }

    function valid(obj) {
        try { return obj !== null && obj !== undefined && obj.isValid !== false; }
        catch (e) { return false; }
    }

    function assertTrue(condition, message) {
        if (!condition) { throw new Error(message || "Assertion failed"); }
    }

    function assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error((message ? message + ": " : "") + "expected " + expected + ", got " + actual);
        }
    }

    function runCase(id, name, fn) {
        testCount++;
        if (swSession !== null) {
            try { swSession.step(id + " · " + name); } catch (eStep) {}
        }
        try {
            fn();
            passCount++;
            log(id + " PASS  " + name);
            if (swSession !== null) {
                try {
                    swSession.pass();
                    swSession.metric("testsRun", testCount, {unit: "tests", display: "counter"});
                    swSession.metric("testsPassed", passCount, {unit: "tests", display: "counter", force: true});
                } catch (ePass) {}
            }
        } catch (e) {
            log(id + " FAIL  " + name + " :: " + e.message + " | line " + errorLine(e));
            if (swSession !== null) {
                try {
                    swSession.fail(e);
                    swSession.metric("testsRun", testCount, {unit: "tests", display: "counter"});
                    swSession.metric("testsPassed", passCount, {unit: "tests", display: "counter", force: true});
                } catch (eFail) {}
            }
        }
    }

    function errorLine(e) {
        try { return e.line; } catch (x) { return "?"; }
    }

    function timestampToken() {
        var d = new Date();
        function pad(n) { return n < 10 ? "0" + n : String(n); }
        return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" +
               pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    }

    function resolveOutputFolder() {
        var preferred = new Folder(PREFERRED_OUTPUT_PATH);
        var selected;

        if (preferred.exists) {
            return preferred;
        }

        alert("The preferred DocStats output folder is unavailable:\n\n" +
              PREFERRED_OUTPUT_PATH + "\n\nChoose a non-system output folder for this canary run.");
        selected = Folder.selectDialog("Choose output folder for core/mutate canary reports and journals");
        if (selected === null || selected === undefined) {
            return null;
        }
        return selected;
    }

    function propertyName(obj, prop, fallback) {
        try {
            if (obj && obj[prop] !== undefined && obj[prop] !== null) {
                if (obj[prop].name !== undefined) { return String(obj[prop].name); }
                return String(obj[prop]);
            }
        } catch (e) {}
        return fallback;
    }

    function numberProperty(obj, prop) {
        try { return Number(obj[prop]); } catch (e) { return 0; }
    }

    function boundsArray(obj) {
        var raw, out = [], i;
        try {
            raw = obj.geometricBounds;
            for (i = 0; i < raw.length; i++) { out.push(Number(raw[i])); }
        } catch (e) {}
        return out;
    }

    function arraysEqualNumbers(a, b) {
        var i;
        if (!a || !b || a.length !== b.length) { return false; }
        for (i = 0; i < a.length; i++) {
            if (Number(a[i]) !== Number(b[i])) { return false; }
        }
        return true;
    }

    function canaryDocumentDigest() {
        var digest = {stories: []};
        var s, p, c, st, para, ch, storyEntry, paraEntry, charEntry;

        for (s = 0; s < doc.stories.length; s++) {
            st = doc.stories.item(s);
            storyEntry = {
                id: Number(st.id),
                contents: String(st.contents),
                paragraphs: [],
                characters: []
            };

            for (p = 0; p < st.paragraphs.length; p++) {
                para = st.paragraphs.item(p);
                paraEntry = {
                    index: p,
                    contents: String(para.contents),
                    paragraphStyle: propertyName(para, "appliedParagraphStyle", "<NONE>"),
                    leftIndent: numberProperty(para, "leftIndent"),
                    rightIndent: numberProperty(para, "rightIndent"),
                    firstLineIndent: numberProperty(para, "firstLineIndent"),
                    spaceBefore: numberProperty(para, "spaceBefore"),
                    spaceAfter: numberProperty(para, "spaceAfter")
                };
                storyEntry.paragraphs.push(paraEntry);
            }

            for (c = 0; c < st.characters.length; c++) {
                ch = st.characters.item(c);
                charEntry = {
                    index: c,
                    contents: String(ch.contents),
                    characterStyle: propertyName(ch, "appliedCharacterStyle", "<NONE>"),
                    fillColor: propertyName(ch, "fillColor", "<NONE>"),
                    pointSize: numberProperty(ch, "pointSize"),
                    fontStyle: propertyName(ch, "fontStyle", "")
                };
                storyEntry.characters.push(charEntry);
            }
            digest.stories.push(storyEntry);
        }

        return CoreMutate.canonicalSerialize(digest);
    }

    function makeT10Adapter() {
        return {
            adapterId: "CoreMutateRealDOM-T10",
            adapterVersion: "1.0.0",
            lastConformanceVersion: "1.0.0",
            lastConformanceDate: "2026-08-19",

            compareLocators: function (a, b) {
                if (a.storyId !== b.storyId) { return a.storyId < b.storyId ? -1 : 1; }
                if (a.paragraphIndex === b.paragraphIndex) { return 0; }
                return a.paragraphIndex < b.paragraphIndex ? -1 : 1;
            },

            resolve: function (locator) {
                var st, para;
                try {
                    st = doc.stories.itemByID(locator.storyId);
                    if (!valid(st)) { return null; }
                    para = st.paragraphs.item(locator.paragraphIndex);
                    if (!valid(para)) { return null; }
                    return para;
                } catch (e) { return null; }
            },

            precheck: function (para) {
                return propertyName(para, "appliedParagraphStyle", "") !== changedParagraphStyle.name ||
                       numberProperty(para, "leftIndent") !== 18;
            },

            snapshot: function (para) {
                return {
                    rollbackReady: true,
                    rollbackReason: "",
                    state: {
                        paragraphStyleName: propertyName(para, "appliedParagraphStyle", ""),
                        leftIndent: numberProperty(para, "leftIndent")
                    }
                };
            },

            digestCoverage: function () {
                return ["contents", "leftIndent", "paragraphStyle"];
            },

            rollbackDigest: function (para) {
                return {
                    contents: String(para.contents),
                    leftIndent: numberProperty(para, "leftIndent"),
                    paragraphStyle: propertyName(para, "appliedParagraphStyle", "")
                };
            },

            mutate: function (para) {
                para.appliedParagraphStyle = changedParagraphStyle;
                para.leftIndent = 18;
            },

            verify: function (para) {
                return propertyName(para, "appliedParagraphStyle", "") === changedParagraphStyle.name &&
                       numberProperty(para, "leftIndent") === 18;
            },

            rollback: function (para, snapshot) {
                var style = doc.paragraphStyles.itemByName(snapshot.state.paragraphStyleName);
                if (!valid(style)) { throw new Error("Snapshot paragraph style could not be resolved."); }
                para.appliedParagraphStyle = style;
                para.leftIndent = snapshot.state.leftIndent;
            }
        };
    }

    function pageItemIdPresent(id) {
        var items;
        var i;
        var itemId;

        try {
            items = doc.pageItems;
            for (i = 0; i < items.length; i++) {
                try {
                    itemId = Number(items.item(i).id);
                    if (itemId === Number(id)) {
                        return true;
                    }
                } catch (eItem) {}
            }
        } catch (eItems) {}

        return false;
    }

    function textFrameIndexById(id) {
        var i;
        var candidate;
        try {
            for (i = 0; i < doc.textFrames.length; i++) {
                candidate = doc.textFrames.item(i);
                if (valid(candidate) && Number(candidate.id) === Number(id)) {
                    return i;
                }
            }
        } catch (e) {}
        return -1;
    }

    function resolveFrameByLabel(label) {
        var i, candidate, found = null;
        var matches = 0;
        try {
            for (i = 0; i < doc.textFrames.length; i++) {
                candidate = doc.textFrames.item(i);
                if (valid(candidate) && String(candidate.label) === String(label)) {
                    found = candidate;
                    matches++;
                }
            }
        } catch (e) { return null; }
        return matches === 1 ? found : null;
    }

    function makeT11Adapter() {
        var adapter = {
            adapterId: "CoreMutateRealDOM-T11",
            adapterVersion: "1.0.0",
            lastConformanceVersion: "1.0.0",
            lastConformanceDate: "2026-08-19",
            originalRef: null,
            originalRefIsValidAfterRemoval: null,
            originalId: null,
            originalIdGone: false,
            originalCollectionIndex: null,
            replacementId: null,
            replacementCollectionIndexAfterRemoval: null,

            compareLocators: function (a, b) {
                if (a.label === b.label) { return 0; }
                return a.label < b.label ? -1 : 1;
            },

            resolve: function (locator) {
                return resolveFrameByLabel(locator.label);
            },

            precheck: function (target) {
                return String(target.contents) !== "Z";
            },

            snapshot: function (target) {
                return {
                    rollbackReady: true,
                    rollbackReason: "",
                    state: {
                        contents: String(target.contents),
                        label: String(target.label),
                        geometricBounds: boundsArray(target)
                    }
                };
            },

            digestCoverage: function () {
                return ["contents", "geometricBounds", "label"];
            },

            rollbackDigest: function (target) {
                return {
                    contents: String(target.contents),
                    geometricBounds: boundsArray(target),
                    label: String(target.label)
                };
            },

            mutate: function (target, snapshot, locator) {
                var page;
                var spacerBefore;
                var replacement;
                var spacerAfter;
                var savedBounds = boundsArray(target);
                var tempLabel = String(locator.label) + "__replacement_pending";

                page = doc.pages.item(0);
                if (!valid(page)) {
                    throw new Error("T11 fixture page could not be resolved.");
                }

                adapter.originalRef = target;
                adapter.originalId = Number(target.id);
                adapter.originalCollectionIndex = textFrameIndexById(adapter.originalId);
                if (adapter.originalCollectionIndex < 0) {
                    throw new Error("Original TextFrame collection index could not be established.");
                }

                // Perturb the TextFrames collection on both sides of the successor.
                // This prevents an accidental same-index replacement from satisfying
                // a resolver that has silently regressed to positional identity.
                spacerBefore = page.textFrames.add();
                spacerBefore.geometricBounds = [630, 36, 650, 100];
                spacerBefore.label = String(locator.label) + "__index_spacer_before";
                spacerBefore.contents = "B";

                // Create the successor under a temporary locator before deleting
                // the original. This prevents resolve(locator) from becoming
                // ambiguous during the handoff.
                replacement = page.textFrames.add();
                replacement.geometricBounds = savedBounds;
                replacement.label = tempLabel;
                replacement.contents = "Z";
                adapter.replacementId = Number(replacement.id);

                spacerAfter = page.textFrames.add();
                spacerAfter.geometricBounds = [660, 36, 680, 100];
                spacerAfter.label = String(locator.label) + "__index_spacer_after";
                spacerAfter.contents = "C";

                if (adapter.replacementId === adapter.originalId) {
                    throw new Error("Replacement TextFrame reused the original unique ID.");
                }

                target.remove();

                // isValid is diagnostic only. InDesign object variables are
                // specifiers and may continue to resolve after the underlying
                // instance has been removed.
                try {
                    adapter.originalRefIsValidAfterRemoval =
                        adapter.originalRef.isValid === true;
                } catch (eInvalid) {
                    adapter.originalRefIsValidAfterRemoval = false;
                }

                // Instance invalidation is proved by document membership and
                // unique ID, not by object-specifier validity.
                adapter.originalIdGone = !pageItemIdPresent(adapter.originalId);
                if (!adapter.originalIdGone) {
                    try { replacement.remove(); } catch (eCleanupReplacement) {}
                    throw new Error("Original TextFrame ID remains present in the live document.");
                }

                adapter.replacementCollectionIndexAfterRemoval =
                    textFrameIndexById(adapter.replacementId);
                if (adapter.replacementCollectionIndexAfterRemoval < 0) {
                    throw new Error("Replacement TextFrame collection index could not be established.");
                }
                if (adapter.replacementCollectionIndexAfterRemoval ===
                    adapter.originalCollectionIndex) {
                    throw new Error(
                        "T11 fixture failed to force a collection-index shift; " +
                        "positional false-pass protection is not active."
                    );
                }

                replacement.label = locator.label;
            },

            verify: function (target, snapshot, preDigest, locator) {
                return String(target.contents) === "Z" &&
                       String(target.label) === String(locator.label) &&
                       Number(target.id) === Number(adapter.replacementId) &&
                       Number(target.id) !== Number(adapter.originalId) &&
                       adapter.originalIdGone === true &&
                       adapter.replacementCollectionIndexAfterRemoval !==
                           adapter.originalCollectionIndex;
            },

            rollback: function (target, snapshot) {
                target.contents = snapshot.state.contents;
                target.label = snapshot.state.label;
                target.geometricBounds = snapshot.state.geometricBounds;
            }
        };
        return adapter;
    }

    function writeReport() {
        var path = outputFolder.fsName + "/CoreMutate_RealDOM_Canary_" + timestampToken() + ".txt";
        var f = new File(path);
        f.encoding = "UTF-8";
        f.lineFeed = "Windows";
        if (f.open("w")) {
            f.writeln("core/mutate real-DOM canary");
            f.writeln("Canary version: " + CANARY_VERSION);
            f.writeln("Core version: " + CoreMutate.VERSION);
            f.writeln("InDesign version: " + app.version);
            f.writeln("Output folder: " + outputFolder.fsName);
            f.writeln("");
            f.writeln(report.join("\r\n"));
            f.writeln("");
            f.writeln("Summary: " + passCount + "/" + testCount + " PASS");
            f.close();
            return path;
        }
        return "<report write failed>";
    }

    try {
        doc = app.documents.add();
        frame = doc.pages.item(0).textFrames.add();
        frame.geometricBounds = [36, 36, 500, 500];
        frame.contents = "Alpha beta\rGamma delta\r";
        story = frame.parentStory;

        changedParagraphStyle = doc.paragraphStyles.add({name: "CM Canary Changed"});
        markCharacterStyle = doc.characterStyles.add({name: "CM Canary Mark"});
        try { story.characters.item(1).appliedCharacterStyle = markCharacterStyle; } catch (eMark) {}

        runCase("T10", "one InDesign Undo restores declared canary-document digest", function () {
            var before = canaryDocumentDigest();
            var label = "CoreMutate Canary T10";
            var adapter = makeT10Adapter();
            var result = CoreMutate.transaction(label, [
                {storyId: Number(story.id), paragraphIndex: 0},
                {storyId: Number(story.id), paragraphIndex: 1}
            ], adapter, {
                mode: CoreMutate.MODE_LIVE,
                journalPath: journalBase + "_T10.log"
            });
            var changed = canaryDocumentDigest();
            var undoName = "";
            try { undoName = String(doc.undoName); } catch (eUndoNameDoc) {
                try { undoName = String(app.undoName); } catch (eUndoNameApp) {}
            }

            assertEqual(result.batchState, "COMPLETE", "T10 transaction batch state");
            assertEqual(result.items[0].finalState, "COMMITTED", "T10 item 1");
            assertEqual(result.items[1].finalState, "COMMITTED", "T10 item 2");
            assertTrue(changed !== before, "T10 mutation did not change the canary digest");
            if (undoName.length > 0) {
                log("T10 DIAG  top Undo label before Undo: " + undoName);
            }

            doc.undo();
            assertEqual(canaryDocumentDigest(), before, "T10 post-Undo digest");
        });

        runCase("T11", "mutation invalidates original target instance and re-resolution verifies", function () {
            var t11Label = "CoreMutate_T11_Target_" + timestampToken();
            var t11Frame = doc.pages.item(0).textFrames.add();
            var adapter;
            var result;
            var resolved;

            t11Frame.geometricBounds = [520, 36, 620, 240];
            t11Frame.label = t11Label;
            t11Frame.contents = "A";

            adapter = makeT11Adapter();
            result = CoreMutate.transaction("CoreMutate Canary T11", [
                {label: t11Label}
            ], adapter, {
                mode: CoreMutate.MODE_LIVE,
                journalPath: journalBase + "_T11.log"
            });

            if (result.items.length > 0) {
                log("T11 DIAG  state=" + result.items[0].finalState +
                    " reason=" + result.items[0].reasonCode +
                    " verify=" + result.items[0].verificationResult +
                    " originalId=" + adapter.originalId +
                    " originalIndex=" + adapter.originalCollectionIndex +
                    " replacementId=" + adapter.replacementId +
                    " replacementIndex=" + adapter.replacementCollectionIndexAfterRemoval +
                    " originalIdGone=" + adapter.originalIdGone +
                    " originalRefIsValidAfterRemoval=" + adapter.originalRefIsValidAfterRemoval +
                    (result.items[0].errorText ? " errors=" + result.items[0].errorText : ""));
            }

            assertEqual(result.batchState, "COMPLETE", "T11 transaction batch state");
            assertEqual(result.items[0].finalState, "COMMITTED", "T11 item state");
            assertTrue(adapter.originalIdGone === true,
                       "T11 original TextFrame ID remains present in the live document");
            assertTrue(Number(adapter.replacementId) !== Number(adapter.originalId),
                       "T11 replacement did not receive a distinct unique ID");
            assertTrue(adapter.replacementCollectionIndexAfterRemoval !==
                       adapter.originalCollectionIndex,
                       "T11 replacement remained at the original TextFrames collection index");

            resolved = resolveFrameByLabel(t11Label);
            assertTrue(valid(resolved), "T11 replacement target could not be re-resolved by stable label");
            assertEqual(Number(resolved.id), Number(adapter.replacementId),
                        "T11 stable locator did not resolve the replacement instance");
            assertEqual(String(resolved.contents), "Z", "T11 re-resolved content");

            doc.undo();
            resolved = resolveFrameByLabel(t11Label);
            assertTrue(valid(resolved), "T11 cleanup Undo did not restore the original target");
            assertEqual(String(resolved.contents), "A", "T11 cleanup Undo contents");
        });

    } catch (eTop) {
        log("CANARY FATAL :: " + eTop.message + " | line " + errorLine(eTop));
    } finally {
        var reportPath = writeReport();
        if (swSession !== null) {
            try {
                swSession.end(
                    (testCount === 2 && passCount === 2) ? "DONE" : "ABORTED",
                    passCount + "/" + testCount + " PASS · report " + reportPath
                );
            } catch (eHarnessEnd) {}
        }
        if (doc !== null && valid(doc)) {
            try { doc.close(SaveOptions.NO); } catch (eClose) {}
        }
        alert("core/mutate real-DOM canary " + CANARY_VERSION + "\n\n" +
              passCount + "/" + testCount + " PASS\n\n" +
              report.join("\n") + "\n\nReport:\n" + reportPath);
    }
}());
