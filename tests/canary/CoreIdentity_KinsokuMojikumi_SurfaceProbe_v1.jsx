#target "InDesign"

#include "../../../ScriptWatch/ScriptWatchHeartbeat.jsxinc"
#include "../../../ScriptWatch/ScriptWatchJob.jsxinc"

/*
 * CoreIdentity Kinsoku/Mojikumi surface probe
 * Copyright (C) 2026 John Darby
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Read/probe scope:
 *   - disposable document only
 *   - enumerates existing KinsokuTable/MojikumiTable resources
 *   - records document ownership, primitive identity fields, and specifier round-trip
 *   - creates one custom resource of each family in the disposable document
 *   - proves NothingEnum.NOTHING read/write behavior for both paragraph properties
 *   - saves, closes, reopens the disposable document and compares resource identity
 *
 * No production document is read or modified.
 */

(function () {
    var VERSION = "1.0.0";
    var REPORT_PREFIX = "CoreIdentity_KinsokuMojikumi_SurfaceProbe_";
    var report = [];
    var failures = [];
    var doc = null;
    var frame = null;
    var para = null;
    var tempFile = null;
    var sw = null;
    var beforeK = [];
    var beforeM = [];
    var customKName = "CI Probe Custom Kinsoku";
    var customMName = "CI Probe Custom Mojikumi";

    function s(v) {
        try { return String(v); } catch (e) { return ""; }
    }

    function typeName(obj) {
        try {
            if (obj && obj.reflect && obj.reflect.name) {
                return String(obj.reflect.name);
            }
        } catch (e) {}
        return "";
    }

    function valid(obj) {
        try {
            if (!obj) { return false; }
            if (obj.isValid === false) { return false; }
        } catch (e) { return false; }
        return true;
    }

    function idOf(obj) {
        try { return String(obj.id); } catch (e) { return ""; }
    }

    function nameOf(obj) {
        try { return String(obj.name); } catch (e) { return ""; }
    }

    function specifierOf(obj) {
        try { return String(obj.toSpecifier()); } catch (e) { return ""; }
    }

    function parentRecord(obj) {
        var p = null;
        try { p = obj.parent; } catch (e) { p = null; }
        return {
            typeName: typeName(p),
            id: idOf(p),
            name: nameOf(p)
        };
    }

    function resolveSpecifierRecord(specifier) {
        var raw = null;
        var candidate = null;
        var count = 0;

        if (!specifier || specifier.length === 0) {
            return {ok:false, count:0, typeName:"", id:"", name:"", reason:"EMPTY_SPECIFIER"};
        }

        try {
            raw = resolve(specifier);
        } catch (eResolve) {
            return {ok:false, count:0, typeName:"", id:"", name:"", reason:"RESOLVE_ERROR:" + eResolve.message};
        }

        if (raw instanceof Array) {
            count = raw.length;
            if (count === 1) { candidate = raw[0]; }
        } else {
            count = valid(raw) ? 1 : 0;
            candidate = raw;
        }

        if (count !== 1 || !valid(candidate)) {
            return {ok:false, count:count, typeName:"", id:"", name:"", reason:"CARDINALITY_OR_VALIDITY"};
        }

        return {
            ok:true,
            count:count,
            typeName:typeName(candidate),
            id:idOf(candidate),
            name:nameOf(candidate),
            reason:""
        };
    }

    function recordResource(obj, index) {
        var p = parentRecord(obj);
        var spec = specifierOf(obj);
        var rr = resolveSpecifierRecord(spec);
        var rec = {
            index:index,
            typeName:typeName(obj),
            id:idOf(obj),
            name:nameOf(obj),
            parentType:p.typeName,
            parentId:p.id,
            parentName:p.name,
            specifier:spec,
            resolveOk:rr.ok,
            resolveCount:rr.count,
            resolvedType:rr.typeName,
            resolvedId:rr.id,
            resolvedName:rr.name,
            resolveReason:rr.reason
        };

        if (rr.ok) {
            rec.roundTripExact =
                rec.typeName === rr.typeName &&
                rec.id === rr.id &&
                rec.name === rr.name;
        } else {
            rec.roundTripExact = false;
        }

        return rec;
    }

    function enumerate(collection) {
        var out = [];
        var i, item;
        for (i = 0; i < collection.length; i++) {
            item = collection.item(i);
            if (valid(item)) {
                out.push(recordResource(item, i));
            }
        }
        return out;
    }

    function writeResourceSection(label, records) {
        var i, r;
        report.push(label + " count=" + records.length);
        for (i = 0; i < records.length; i++) {
            r = records[i];
            report.push(
                label + "[" + r.index + "]" +
                " type=" + r.typeName +
                " id=" + r.id +
                " name=" + r.name +
                " parentType=" + r.parentType +
                " parentId=" + r.parentId +
                " parentName=" + r.parentName +
                " resolveOk=" + r.resolveOk +
                " resolveCount=" + r.resolveCount +
                " roundTripExact=" + r.roundTripExact +
                " specifier=" + r.specifier
            );
        }
        report.push("");
    }

    function enumRecord(value) {
        var reflectName = "";
        var text = "";
        var numberText = "";
        try { reflectName = String(value.reflect.name); } catch (eReflect) {}
        try { text = String(value); } catch (eText) {}
        try { numberText = String(Number(value)); } catch (eNumber) {}
        return {
            typeofValue: typeof value,
            reflectName: reflectName,
            text: text,
            numberText: numberText,
            hostType: typeName(value),
            hostId: idOf(value),
            hostName: nameOf(value)
        };
    }

    function writeValue(label, value) {
        var r = enumRecord(value);
        report.push(
            label +
            " typeof=" + r.typeofValue +
            " reflect=" + r.reflectName +
            " text=" + r.text +
            " number=" + r.numberText +
            " hostType=" + r.hostType +
            " hostId=" + r.hostId +
            " hostName=" + r.hostName
        );
        return r;
    }

    function assertTrue(condition, message) {
        if (!condition) { failures.push(message); }
    }

    function findByName(records, name) {
        var i;
        for (i = 0; i < records.length; i++) {
            if (records[i].name === name) { return records[i]; }
        }
        return null;
    }

    function compareSavedIdentity(label, before, after) {
        var i, b, a;
        for (i = 0; i < before.length; i++) {
            b = before[i];
            a = findByName(after, b.name);
            if (!a) {
                failures.push(label + " missing after reopen: " + b.name);
                continue;
            }
            if (b.typeName !== a.typeName || b.id !== a.id || b.name !== a.name) {
                failures.push(
                    label + " identity changed after reopen: " + b.name +
                    " before=" + b.typeName + ":" + b.id + ":" + b.name +
                    " after=" + a.typeName + ":" + a.id + ":" + a.name
                );
            }
        }
    }

    function timestampToken() {
        var d = new Date();
        function p(n) { return n < 10 ? "0" + n : String(n); }
        return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" +
               p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
    }

    function writeReport() {
        var path = Folder.desktop.fsName + "/" + REPORT_PREFIX + timestampToken() + ".txt";
        var f = new File(path);
        f.encoding = "UTF-8";
        f.lineFeed = "Windows";
        if (!f.open("w")) { return "<REPORT_WRITE_FAILED>"; }
        f.writeln(report.join("\r\n"));
        f.close();
        return path;
    }

    try {
        try {
            sw = ScriptWatchJob.start({
                job:"core/identity Kinsoku/Mojikumi surface probe",
                tool:"CoreIdentityKinsokuMojikumiProbe",
                toolVersion:VERSION,
                target:8,
                mode:"probe"
            });
        } catch (eHarnessStart) {}

        report.push("core/identity Kinsoku/Mojikumi surface probe");
        report.push("probeVersion=" + VERSION);
        report.push("InDesignVersion=" + app.version);
        try { report.push("DOMVersion=" + app.scriptPreferences.version); }
        catch (eDOM) { report.push("DOMVersion=<unreadable>"); }
        report.push("");

        doc = app.documents.add();
        frame = doc.pages.item(0).textFrames.add();
        frame.geometricBounds = [36, 36, 360, 500];
        frame.contents = "CoreIdentity Kinsoku Mojikumi surface probe\r";
        para = frame.parentStory.paragraphs.item(0);

        writeValue("NothingEnum.NOTHING", NothingEnum.NOTHING);
        writeValue("default paragraph.kinsokuSet", para.kinsokuSet);
        writeValue("default paragraph.mojikumi", para.mojikumi);
        report.push("");

        beforeK = enumerate(doc.kinsokuTables);
        beforeM = enumerate(doc.mojikumiTables);
        writeResourceSection("KINSOKU_PRECREATE", beforeK);
        writeResourceSection("MOJIKUMI_PRECREATE", beforeM);

        var customK = doc.kinsokuTables.add(
            customKName,
            {
                cantBeginLineChars:"、。）》」』】",
                cantEndLineChars:"（《「『【",
                hangingPunctuationChars:"、。",
                cantBeSeparatedChars:"……"
            }
        );
        var customM = doc.mojikumiTables.add(
            customMName,
            {basedOnMojikumiSet:MojikumiTableDefaults.LINE_END_ALL_ONE_EM_ENUM}
        );

        assertTrue(valid(customK), "custom KinsokuTable creation failed");
        assertTrue(valid(customM), "custom MojikumiTable creation failed");

        para.kinsokuSet = customK;
        var assignedK = writeValue("assigned paragraph.kinsokuSet", para.kinsokuSet);
        assertTrue(assignedK.hostType.indexOf("KinsokuTable") >= 0,
            "assigned kinsokuSet did not read back as KinsokuTable");

        para.mojikumi = customM;
        var assignedM = writeValue("assigned paragraph.mojikumi", para.mojikumi);
        assertTrue(assignedM.hostType.indexOf("MojikumiTable") >= 0,
            "assigned mojikumi did not read back as MojikumiTable");

        para.kinsokuSet = NothingEnum.NOTHING;
        var clearedK = writeValue("cleared paragraph.kinsokuSet", para.kinsokuSet);
        assertTrue(clearedK.reflectName === "Enumerator" || clearedK.text === s(NothingEnum.NOTHING),
            "kinsokuSet NothingEnum.NOTHING write/read did not yield sentinel state");

        para.mojikumi = NothingEnum.NOTHING;
        var clearedM = writeValue("cleared paragraph.mojikumi", para.mojikumi);
        assertTrue(clearedM.reflectName === "Enumerator" || clearedM.text === s(NothingEnum.NOTHING),
            "mojikumi NothingEnum.NOTHING write/read did not yield sentinel state");
        report.push("");

        beforeK = enumerate(doc.kinsokuTables);
        beforeM = enumerate(doc.mojikumiTables);
        writeResourceSection("KINSOKU_PRESAVE", beforeK);
        writeResourceSection("MOJIKUMI_PRESAVE", beforeM);

        tempFile = new File(Folder.temp.fsName + "/CI_KinsokuMojikumi_" + timestampToken() + ".indd");
        doc.save(tempFile);
        doc.close(SaveOptions.YES);
        doc = null;

        doc = app.open(tempFile);
        var afterK = enumerate(doc.kinsokuTables);
        var afterM = enumerate(doc.mojikumiTables);
        writeResourceSection("KINSOKU_REOPEN", afterK);
        writeResourceSection("MOJIKUMI_REOPEN", afterM);

        compareSavedIdentity("KinsokuTable", beforeK, afterK);
        compareSavedIdentity("MojikumiTable", beforeM, afterM);

        var kCustomAfter = findByName(afterK, customKName);
        var mCustomAfter = findByName(afterM, customMName);
        assertTrue(kCustomAfter !== null, "custom KinsokuTable missing after reopen");
        assertTrue(mCustomAfter !== null, "custom MojikumiTable missing after reopen");
        if (kCustomAfter) { assertTrue(kCustomAfter.roundTripExact, "custom KinsokuTable specifier round-trip failed after reopen"); }
        if (mCustomAfter) { assertTrue(mCustomAfter.roundTripExact, "custom MojikumiTable specifier round-trip failed after reopen"); }

        report.push("SUMMARY");
        report.push("failures=" + failures.length);
        if (failures.length === 0) {
            report.push("PASS: surface probe completed with no failed assertions.");
        } else {
            var fi;
            for (fi = 0; fi < failures.length; fi++) {
                report.push("FAIL " + failures[fi]);
            }
        }

    } catch (fatal) {
        failures.push("FATAL " + fatal.message);
        report.push("FATAL " + fatal.message);
    } finally {
        try { if (doc) { doc.close(SaveOptions.NO); } } catch (eClose) {}
        try { if (tempFile && tempFile.exists) { tempFile.remove(); } } catch (eDelete) {}

        try {
            if (sw) {
                sw.end(
                    failures.length === 0 ? "DONE" : "ABORTED",
                    failures.length === 0 ? "PASS" : (failures.length + " failure(s)")
                );
            }
        } catch (eHarnessEnd) {}

        var reportPath = writeReport();
        alert(
            "CoreIdentity Kinsoku/Mojikumi surface probe " + VERSION + "\n\n" +
            (failures.length === 0 ? "PASS" : (failures.length + " failure(s)")) +
            "\n\nReport:\n" + reportPath
        );
    }
}());
