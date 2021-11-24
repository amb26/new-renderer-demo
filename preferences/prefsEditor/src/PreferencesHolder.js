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

fluid.defaults("fluid.prefs.preferencesHolder", {
    gradeNames: ["fluid.modelComponent", "fluid.remoteModelComponent"],
    model: {
        defaultPreferences: "@expand:fluid.prefs.getDefaultPreferences({that}.options.schemaIndex)", 
        userPreferences: { // Any preferences which have been written by the user - this goes to UIEnhancer
        },
        livePreferences: { // always === "defaultPreferences" + "userPreferences" - what is shown in the UI
        },
        persistentPreferences: { // Flushed from "userPreferences" on save
        },
        local: { // for remoteModelComponent
            preferences: "{that}.model.persistentPreferences"
        }
    },
    autoSave: false,
    events: {
        save: null,
        reset: null,
        cancel: null
    },
    components: {
        store: {
            type: "fluid.prefs.globalSettingsStore"
        }
    },
    listeners: {
        "save.main": {
            funcName: "fluid.prefs.setModelValue",
            path: "persistentPreferences",
            value: "{that}.model.userPreferences"
        },
        "reset.main": {
            funcName: "fluid.prefs.setModelValue",
            path: "userPreferences",
            value: undefined
        },
        "cancel.main": {
            funcName: "fluid.prefs.setModelValue",
            path: "userPreferences",
            value: "{that}.model.persistentPreferences"            
        }
    },
    modelRelay: {
        mergeDefaultPrefs: {
            target: "livePreferences",
            func: "fluid.prefs.merge",
            args: ["{that}.model.defaultPreferences", "{that}.model.userPreferences"]
        }
    },
    modelListeners: {
        "savePrefs": {
            path: "persistentPreferences",
            func: "{that}.write"
        },
        "handleAutoSave": {
            path: "livePreferences",
            listener: "fluid.prefs.handleAutoSave",
            args: ["{that}"],
            excludeSource: "init"
        }
    },
    invokers: {
        writeImpl: {
            func: "{that}.store.set"
        },
        readImpl: {
            func: "{that}.store.get"
        }
    }
});

fluid.prefs.setModelValue = function (that, path, value) {
    var transaction = that.applier.initiate();
    transaction.fireChangeRequest({path: path, type: "DELETE"});
    transaction.change(path, value);
    transaction.commit();
};

fluid.prefs.handleAutoSave = function (that) {
    if (that.options.autoSave) {
        that.events.save.fire();
    }
};