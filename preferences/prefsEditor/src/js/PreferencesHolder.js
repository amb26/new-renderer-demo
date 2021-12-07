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
        livePreferences: {
            // always === "defaultPreferences" + "userPreferences" - what is shown in the PrefsEditor UI
            // and in addition to any preview
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
        "save.main": { // Save: Saves userPreferences to persistentPreferences
            funcName: "fluid.prefs.setModelValue",
            args: ["{that}", "persistentPreferences", "{that}.model.userPreferences"]
        },
        "reset.main": { // Reset: Zeros out userPreferences, returns to defaults
            funcName: "fluid.prefs.setModelValue",
            args: ["{that}", "userPreferences"]
        },
        "cancel.main": { // Cancel: Resets userPreferences to persistentPreferences
            funcName: "fluid.prefs.setModelValue",
            args: ["{that}", "userPreferences", "{that}.model.persistentPreferences"]            
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
            listener: "{that}.write"
        },
        "handleAutoSave": {
            path: "livePreferences",
            listener: "fluid.prefs.handleAutoSave",
            args: ["{that}"],
            excludeSource: "init"
        }
    },
    invokers: {
        // Two overrides for the "remoteModelComponent" interface
        // TODO: These two methods for "RemoteModel" component - in practice we need to decouple this workflow.
        // Q: It seems we want to jam RemoteModel's listener into the DataSource's sequence, but this doesn't seem
        // quite right since they have their own signature (don't use transformStrategy). We will instead stick
        // ONE listener for the whole thing into the chain?
        // Probably. Note that our current entry point into reading and writing prefs is via RemoteModel's top-level
        // "fetch" invoked from "cancel"  and "write" invoked from "save".
        
        // Note that the fetch in "finishInit" will be moved into the resource fetch, and the fetch in "cancel" will
        // be removed since we will already have "persistentPreferences" to fall back on.
        
        // Some future UIO might have a "live read" capability like UIO+
        writeImpl: {
            func: "{that}.store.set"
        },
        fetchImpl: {
            func: "{that}.store.get"
        }
    }
});

fluid.prefs.merge = function (defs, user) {
    return fluid.extend({}, defs, user);
};

fluid.prefs.setModelValue = function (that, path, value) {
    var transaction = that.applier.initiate();
    transaction.fireChangeRequest({path: path, type: "DELETE"});
    if (value !== undefined) {
        transaction.change(path, value);
    }
    transaction.commit();
};

fluid.prefs.handleAutoSave = function (that) {
    if (that.options.autoSave) {
        that.events.save.fire();
    }
};