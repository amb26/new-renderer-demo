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
    gradeNames: ["fluid.modelComponent", "fluid.remoteModelComponent", "fluid.resourceLoader"],
    model: {
        defaultPreferences: "@expand:fluid.prefs.getDefaultPreferences({that}.options.schemaIndex)",
        userPreferences: { // Any preferences which have been written by the user - this goes to root page's UIEnhancer
        },
        livePreferences: {
            // always === "defaultPreferences" + "userPreferences" - what is shown in the PrefsEditor UI
        },
        persistentPreferences: "{that}.resources.initialPersistentPreferences.parsed.preferences", // Flushed from "userPreferences" on save
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
    modelRelay: {
        mergeDefaultPrefs: {
            target: "livePreferences",
            func: "fluid.prefs.merge",
            args: ["{that}.model.defaultPreferences", "{that}.model.userPreferences"]
        },
        updatePersistentPrefs: {
            target: "userPreferences",
            source: "persistentPreferences",
            backward: "never"
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
        },
        "transferPrefs": { // Transfer any user changes caused to live preferences back into userPreferences
            path: "livePreferences.*",
            listener: "fluid.prefs.transferPrefs",
            args: ["{that}", "{change}.value", "{change}.path"],
            excludeSource: ["init", "preferencesHolder"]
        }
    },
    resources: {
        initialPersistentPreferences: {
            // TODO: Should really be a "read" pseudoevent which, e.g. slidingPanel can subscribe to
            promiseFunc: "{that}.fetchImpl"
        }
    },
    listeners: {
        "save.main": { // Save: Saves userPreferences to persistentPreferences
            funcName: "fluid.prefs.setModelValue",
            args: ["{that}", "persistentPreferences", "{that}.model.userPreferences"]
        },
        "reset.main": { // Reset: Zeros out userPreferences, returns to defaults
            funcName: "fluid.prefs.reset",
            args: ["{that}"]
        },
        "cancel.main": { // Cancel: Resets userPreferences to persistentPreferences
            funcName: "fluid.prefs.setModelValue",
            args: ["{that}", "userPreferences", "{that}.model.persistentPreferences"]
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

        // Some future UIO might have a "live read" capability like UIO+
        writeImpl: "fluid.prefs.write({that}, {arguments}.0)",
        fetchImpl: "fluid.prefs.read({that}, {that}.store.get)"
    }
});

fluid.prefs.write = function (that, persistentPrefs) {
    // Used to say "don't save a reset model" but that doesn't seem consistent
    return that.store.set(null, {
        preferences: persistentPrefs
    });
};

fluid.prefs.read = function (that, getter) {
    return fluid.promise.map(getter(), function (result) {
        return result && result.preferences;
    });
};

fluid.prefs.merge = function (defs, user) {
    return fluid.extend(true, {}, defs, user);
};

/** Transfer any "leaf preference change" operated by the user from one preference set to another - used to
 * keep live preferencs (from the UI) in sync with user preferences.
 * @param {PreferencesHolder} that - The preferencesHolder component storing the preference sets
 * @param {Any} newLive - The new value of the preference
 * @param {String} path - The path at which the preference has been updated
 */
fluid.prefs.transferPrefs = function (that, newLive, path) {
    var segs = that.applier.parseEL(path);
    that.applier.change(["userPreferences", fluid.peek(segs)], newLive);
};

fluid.prefs.reset = function (that) {
    fluid.prefs.setModelValue(that, "userPreferences", undefined);
    that.events.save.fire();
    // TODO: bug - somehow we seemed to see the "mergeDefaultPrefs" relay not operating here
    fluid.prefs.setModelValue(that, "livePreferences", that.model.defaultPreferences);
};

/** Update one (possibly composite) model value to become identical with another, by operating a transaction
 * in which any existing value at the target path is deleted and then set to the supplied value
 * @param {fluid.modelComponent} that - The component holding the value to be updated
 * @param {String} path - The path in the component's model at which the value is to be updated
 * @param {Any} value - The new value to be stored at `path`
 */
fluid.prefs.setModelValue = function (that, path, value) {
    var transaction = that.applier.initiate();
    transaction.fireChangeRequest({path: path, type: "DELETE", source: "preferencesHolder"});
    if (value !== undefined) {
        transaction.change(path, value, "ADD", "preferencesHolder");
    }
    transaction.commit();
};

fluid.prefs.handleAutoSave = function (that) {
    if (that.options.autoSave) {
        that.events.save.fire();
    }
};
