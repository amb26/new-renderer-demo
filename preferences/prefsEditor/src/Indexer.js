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
    // An index of all schema grades registered with the framework.
    schemaIndex: {
        expander: {
            func: "fluid.prefs.indexer.indexUnique",
            args: ["schemaIndex", {
                gradeNames: "fluid.prefs.schema",
                indexFunc: "fluid.prefs.indexer.schemaIndexer"
            }]
        }
    },
    enactorIndex: {
        expander: {
            func: "fluid.prefs.indexer.indexUnique",
            args: ["enactorIndex", {
                gradeNames: "fluid.prefs.enactor",
                indexFunc: "fluid.prefs.indexer.enactorIndexer"
            }]
        }
    },
    mergePolicy: {
        varietyToModelPath: "noexpand" 
    },
    varietyToModelPath: {
        enactor: "{fluid.prefs.enhancer}.model.preferences",
        panel: "{fluid.prefs.weaver}.model.livePreferences"
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

fluid.prefs.indexer.indexUnique = function (indexName, indexPayload) {
    var rawIndex = fluid.indexDefaults(indexName, indexPayload)
    return fluid.transform(rawIndex, function (grades) {
        if (grades.length !== 1) {
            fluid.log(fluid.logLevel.WARN, "More than one " + indexPayload.gradeNames + " grade was registered for preference with key ", key, ": ", grades.join(", "));
        }
        return fluid.peek(grades);
    });
};

/**
 * An index function that indexes all enactors based on their preference name.
 *
 * @param {Object} defaults - Registered default options for an enactor grade.
 * @return {String[]} - The preference name.
 */
fluid.prefs.indexer.enactorIndexer = function (defaults) {
    return fluid.keys(defaults.preferencesMap);
};

fluid.prefs.indexer.allEnactorRegistry = function (enactorIndex) {
    return fluid.transform(enactorIndex, function (grade) {
        return {
            type: grade
        }
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

// Construct a mixin grade which establishes model relay for an enactor or panel grade based on its preferenceMap by decoding
// it against the grade index held in the supplied "indexer"
fluid.prefs.makePrefsMapGrade = function (that, indexer) {
    var variety = fluid.getForComponent(that, ["options", "prefsMapVariety"]);
    if (variety !== "enactor" && variety !== "panel") {
        fluid.fail("Only varieties enactor and panel are acceptable for withPreferencesMap grade " + that.typeName);
    }
    var modelRefPrefix = indexer.options.varietyToModelPath[variety];
    var prefsMap = fluid.getForComponent(that, ["options", "preferencesMap"]);
    var gradeName = that.typeName + ".withPrefsMap";
    var keys = Object.keys(prefsMap);
    if (keys.length !== 1 && variety === "enactor") {
        fluid.fail(variety + " preferencesMap grade must have exactly one key - has ", keys.join(", "));
    }
    var mapKey = keys[0];
    var mapValue = prefsMap[mapKey];
    var schema = indexer.schemaIndex[mapKey];
    if (!schema) {
        fluid.fail(variety + " preferencesMap grade referred to preferences grade " + mapKey + " for which no primary schema was registered");
    }
    var options = {};
    fluid.each(mapValue, function (source, target) {
        if (source === "value") {
            fluid.set(options, target, modelRefPrefix + "." + source);
        } else {
            var schemaValue = fluid.get(schema, source);
            fluid.set(options, target, schemaValue);
        }
    });
    fluid.defaults(gradeName, options);
    return gradeName;
};

fluid.prefs.getDefaultPreferences = function (schemaIndex) {
    return fluid.transform(schemaIndex, function (schema) {
        return schema["default"];
    });
};
