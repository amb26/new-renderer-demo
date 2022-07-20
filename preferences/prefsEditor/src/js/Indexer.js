/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

fluid.defaults("fluid.prefs.indexer", {
    gradeNames: ["fluid.component"],
    // An index of preference names to the schema grade contents for that name
    schemaIndex: {
        expander: {
            func: "fluid.prefs.indexer.indexUnique",
            args: ["schemaIndex", {
                gradeNames: "fluid.prefs.schema",
                indexFunc: "fluid.prefs.indexer.schemaIndexer"
            }, "fluid.prefs.indexer.dereferenceSchema"]
        }
    },
    // An index of preference names to the enactor grade name which handles that preference
    enactorIndex: {
        expander: {
            func: "fluid.prefs.indexer.indexUnique",
            args: ["enactorIndex", {
                gradeNames: "fluid.prefs.enactor",
                indexFunc: "fluid.prefs.indexer.enactorIndexer"
            }]
        }
    }
});

// A grade interpreted by fluid.prefs.makePrefsMapGrade that it will indirect into in order to discover the
// model prefix that a prefsMap holding component should be bound to via its model relay
fluid.defaults("fluid.prefs.varietyPathHolder", {
    mergePolicy: {
        varietyPathPrefix: "noexpand"
    }
});

/**
 * An index function that indexes all primary schema grades based on their preference name.
 *
 * @param {Object} defaults - Registered default options for a primary schema grade.
 * @return {String[]} - The preference name.
 */
fluid.prefs.indexer.schemaIndexer = function (defaults) {
    return fluid.keys(defaults.schema);
};

fluid.prefs.indexer.dereferenceSchema = function (gradeName, indexKey) {
    var defaults = fluid.defaults(gradeName);
    return fluid.getImmediate(defaults, ["schema", indexKey]);
};

fluid.prefs.indexer.indexUnique = function (indexName, indexPayload, dereferenceFunc) {
    var rawIndex = fluid.indexDefaults(indexName, indexPayload);
    return fluid.transform(rawIndex, function (grades, indexKey) {
        if (grades.length !== 1) {
            fluid.log(fluid.logLevel.WARN, "More than one " + indexPayload.gradeNames + " grade was registered for preference with key ", indexKey, ": ", grades.join(", "));
        }
        var gradeName = fluid.peek(grades);
        return dereferenceFunc ? fluid.invokeGlobalFunction(dereferenceFunc, [gradeName, indexKey]) : gradeName;
    });
};

/**
 * An index function that indexes all enactors based on their preference name.
 *
 * @param {Object} defaults - Registered default options for an enactor grade.
 * @return {String[]} - The preference name for all preferences handled by the enactor
 */
fluid.prefs.indexer.enactorIndexer = function (defaults) {
    return fluid.keys(defaults.preferencesMap);
};


fluid.prefs.flatRegex = /\./g;

fluid.prefs.flattenName = function (name) {
    return name.replace(fluid.prefs.flatRegex,  "_");
};

fluid.prefs.indexer.allEnactorRegistry = function (enactorIndex) {
    var togo = {};
    fluid.each(enactorIndex, function (grade) {
        // We must flatten these keys since they become names of dynamic components
        var flatName = fluid.prefs.flattenName(grade);
        togo[flatName] = {
            type: grade
        };
    });
    return togo;
};

fluid.prefs.indexer.filterPrefsEditorEnactors = function (enactorRegistry) {
    return fluid.transform(enactorRegistry, function (record) {
        var upDefaults = fluid.defaults(record.type);
        return fluid.hasGrade(upDefaults, "fluid.prefs.enactor.excludeFromPrefsEditor") ? fluid.NO_VALUE : record;
    });
};

/*******************************************************************************
 * Base primary schema grade
 *******************************************************************************/
fluid.defaults("fluid.prefs.schema", {
    gradeNames: "fluid.component"
});

fluid.defaults("fluid.prefs.withPreferencesMap", {
    gradeNames: ["fluid.component", "{that}.makePrefsMapGrade"],
    // prefsMapVariety: enactor/panel
    invokers: {
        makePrefsMapGrade: "fluid.prefs.makePrefsMapGrade({that}, {fluid.prefs.indexer})"
    }
});

fluid.defaults("fluid.prefs.withEnactorMap", {
    gradeNames: ["fluid.component", "{that}.makeEnactorMapGrade"],
    invokers: {
        makeEnactorMapGrade: "fluid.prefs.makeEnactorMapGrade({that}, {fluid.prefs.indexer})"
    }
});

// Construct a mixin grade which establishes model relay for an enactor or panel grade based on its preferencesMap by decoding
// it against the grade index held in the supplied "indexer"
fluid.prefs.makePrefsMapGrade = function (that, indexer) {
    var variety = fluid.getForComponent(that, ["options", "prefsMapVariety"]);
    if (variety !== "enactor" && variety !== "panel") {
        fluid.fail("Only varieties enactor and panel are acceptable for withPreferencesMap grade " + that.typeName);
    }
    var pathHolder = fluid.resolveContext("fluid.prefs.varietyPathHolder", that);
    if (!pathHolder) {
        fluid.fail("Unable to resolve variety path holder from prefsMap component ", fluid.dumpComponentAndPath(that));
    }
    var modelRefPrefix = fluid.getForComponent(pathHolder, ["options", "varietyPathPrefix"]);
    if (!modelRefPrefix) {
        fluid.fail("fluid.prefs.varietyPathHolder component" + fluid.dumpComponentAndPath(pathHolder) + " was not configured with a varietyPathPrefix");
    }
    var prefsMap = fluid.getForComponent(that, ["options", "preferencesMap"]);
    var gradeName = that.typeName + ".withPrefsMap";
    var keys = Object.keys(prefsMap);
    if (keys.length !== 1) {
        fluid.fail(variety + " preferencesMap grade must have exactly one key - has ", keys.join(", "));
    }
    var mapKey = keys[0];
    var flatKey = fluid.prefs.flattenName(mapKey);
    var mapValue = prefsMap[mapKey];
    var schemaIndex = fluid.getForComponent(indexer, ["options", "schemaIndex"]);
    var schema = schemaIndex[mapKey];
    if (!schema) {
        fluid.fail(variety + " preferencesMap grade referred to preferences grade " + mapKey + " for which no primary schema was registered");
    }
    var options = {};
    fluid.each(mapValue, function (source, target) {
        if (source === "value") {
            fluid.set(options, target, modelRefPrefix + "." + flatKey);
        } else {
            var schemaValue = fluid.get(schema, source);
            fluid.set(options, target, schemaValue);
        }
    });
    fluid.defaults(gradeName, options);
    return gradeName;
};

/** Given the schemaIndex structure held by a fluid.prefs.indexer, return the default preferences structure formed from
 * each of defaults values held in its collection of indexed schemas
 * @param {Object} schemaIndex - The schema index mapping preference names to schemas
 * @return {Object} A preference set with each element set to its default value as recorded in its schema
 */
fluid.prefs.getDefaultPreferences = function (schemaIndex) {
    var schemaEntries = Object.entries(schemaIndex);
    var mappedEntries = schemaEntries.map(function (e) {
        return [fluid.prefs.flattenName(e[0]), e[1]["default"]];
    });
    return Object.fromEntries(mappedEntries);
};

fluid.prefs.makeEnactorMapGrade = function (that, indexer) {
    var gradeName = that.typeName + ".withEnactorMap";
    var enactorMap = fluid.getForComponent(that, ["options", "enactorMap"]);
    var options = {};
    fluid.each(enactorMap, function (mapValue, mapKey) {
        var enactorIndex = fluid.getForComponent(indexer, ["options", "enactorIndex"]);
        var defaults = fluid.defaults(enactorIndex[mapKey]);
        fluid.each(mapValue, function (source, target) {
            var enactorValue = fluid.get(defaults, source);
            fluid.set(options, target, enactorValue);
        });
    });

    fluid.defaults(gradeName, options);
    return gradeName;
};
