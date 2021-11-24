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


/*
 * A component that works in conjunction with the UI Enhancer component
 * to allow users to set personal user interface preferences. The Preferences Editor component provides a user
 * interface for setting and saving personal preferences, and the UI Enhancer component carries out the
 * work of applying those preferences to the user interface.
 */
fluid.defaults("fluid.prefs.prefsEditor", {
    gradeNames: ["fluid.remoteModelComponent", "fluid.viewComponent"],
    markup: {
        // only used when dynamically generating the panel containers.
        panel: "<li class=\"%className flc-prefsEditor-panel fl-prefsEditor-panel\"></li>"
    },
    invokers: {
        // Updates the change applier and fires modelChanged on subcomponent fluid.prefs.controls
        // TODO: These two methods for "RemoteModel" component - in practice we need to decouple this workflow.
        // These forward to settingsGetter's "getSettings" which now becomes its dataSource.
        // Q: It seems we want to jam RemoteModel's listener into the DataSource's sequence, but this doesn't seem
        // quite right since they have their own signature (don't use transformStrategy). We will instead stick
        // ONE listener for the whole thing into the chain?
        // Probably. Note that our current entry point into reading and writing prefs is via RemoteModel's top-level
        // "fetch" invoked from "cancel" and "finishInit" and "write" invoked from "save".
        
        // Note that the fetch in "finishInit" will be moved into the resource fetch, and the fetch in "cancel" will
        // be removed since we will already have "persistentPreferences" to fall back on.
        
        // Some future UIO might have a "live read" capability like UIO+
        
        fetchImpl: {
            funcName: "fluid.prefs.prefsEditor.fetchImpl",
            args: ["{that}"]
        },
        writeImpl: {
            funcName: "fluid.prefs.prefsEditor.writeImpl",
            args: ["{that}", "{arguments}.0"]
        },
        
        applyChanges: {
            funcName: "fluid.prefs.prefsEditor.applyChanges",
            args: ["{that}"]
        },
        save: {
            funcName: "fluid.prefs.prefsEditor.save",
            args: ["{that}"]
        },
        saveAndApply: {
            funcName: "fluid.prefs.prefsEditor.saveAndApply",
            args: ["{that}"]
        },
        reset: {
            funcName: "fluid.prefs.prefsEditor.reset",
            args: ["{that}"]
        },
        cancel: {
            funcName: "fluid.prefs.prefsEditor.cancel",
            args: ["{that}"]
        }
    },
    selectors: {
        panels: ".flc-prefsEditor-panel",
        cancel: ".flc-prefsEditor-cancel",
        reset: ".flc-prefsEditor-reset",
        save: ".flc-prefsEditor-save",
        previewFrame : ".flc-prefsEditor-preview-frame"
    },
    events: {
        onSave: null,
        onCancel: null, // <-- Unnecessary - there are no listeners, and all that happens is that it fires to onReset
        beforeReset: null, // <-- Unnecessary - only listener is arrowScrolling - it should instead contribute its own init value of {panelIndex: 0}
        afterReset: null, // <-- Lots of the "preview" varieties listen to this event and only apply the settings at this point,
        // Which is a mess because they are also applied via a different route on onUpdateEnhancerModel
        // autoSave: null, // Unnecessary, this can just be a namespaced listener to "save"
        onPrefsEditorRefresh: null, // <-- Eliminate
        onUpdateEnhancerModel: null, // <-- Eliminate - just keep extra copies of the model
        onPrefsEditorMarkupReady: null,
        onReady: null
    },
    listeners: {
        "onCreate.init": "fluid.prefs.prefsEditor.init",
        "onAutoSave.save": "{that}.save"
    },
    model: {
        defaultPreferences: { // Assembled from primary schemas for registered preferences
        },
        userPreferences: { // Any preferences which have been written by the user - this goes to UIEnhancer
        },
        livePreferences: { // always === "defaultPreferences" + "userPreferences" - what is shown in the UI
        },
        persistentPreferences: { // Flushed from "userPreferences" on save
        },
        local: {
            preferences: "{that}.model.persistentPreferences"
        }
    },
    modelListeners: {
        "livePreferences": [{
            listener: "fluid.prefs.prefsEditor.handleAutoSave",
            args: ["{that}"],
            namespace: "autoSave",
            excludeSource: ["init"]
        }]
    },
    members: {
        resources: {
            template: "{templateLoader}.resources.prefsEditor"
        }
    },
    autoSave: false
});

/*
 * Refresh PrefsEditor
 */
fluid.prefs.prefsEditor.applyChanges = function (that) {
    that.events.onUpdateEnhancerModel.fire();
};

fluid.prefs.prefsEditor.fetchImpl = function (that) {
    var promise = fluid.promise(),
        fetchPromise = that.getSettings();

    fetchPromise.then(function (savedModel) {
        var completeModel = $.extend(true, {}, that.initialModel, savedModel);
        promise.resolve(completeModel);
    }, promise.reject);

    return promise;
};

fluid.prefs.prefsEditor.writeImpl = function (that, modelToSave) {
    var promise = fluid.promise(),
        stats = {changes: 0, unchanged: 0, changeMap: {}},
        changedPrefs = {};

    modelToSave = fluid.copy(modelToSave);

    // To address https://issues.fluidproject.org/browse/FLUID-4686
    fluid.model.diff(modelToSave.preferences, fluid.get(that.initialModel, ["preferences"]), stats);

    if (stats.changes === 0) {
        delete modelToSave.preferences;
    } else {
        fluid.each(stats.changeMap, function (state, pref) {
            fluid.set(changedPrefs, pref, modelToSave.preferences[pref]);
        });
        modelToSave.preferences = changedPrefs;
    }

    that.events.onSave.fire(modelToSave);
    var setPromise = that.setSettings(modelToSave);

    fluid.promise.follow(setPromise, promise);
    return promise;
};

/**
 * Sends the prefsEditor.model to the store and fires onSave
 *
 * @param {fluid.prefs.prefsEditor} that - A `fluid.prefs.prefsEditor` instance
 * @return {Promise} A promise that will be resolved with the saved model or rejected on error.
 */
fluid.prefs.prefsEditor.save = function (that) {
    var promise = fluid.promise();
    if (!that.model || $.isEmptyObject(that.model)) {  // Don't save a reset model
        promise.resolve({});
    } else {
        var writePromise = that.write();
        fluid.promise.follow(writePromise, promise);
    }

    return promise;
};

fluid.prefs.prefsEditor.saveAndApply = function (that) {
    var promise = fluid.promise();
    var prevSettingsPromise = that.getSettings(),
        savePromise = that.save();

    prevSettingsPromise.then(function (prevSettings) {
        savePromise.then(function (changedSelections) {
            // Only when preferences are changed, re-render panels and trigger enactors to apply changes
            if (!fluid.model.diff(fluid.get(changedSelections, "preferences"), fluid.get(prevSettings, "preferences"))) {
                that.events.onPrefsEditorRefresh.fire();
                that.applyChanges();
            }
        });
        fluid.promise.follow(savePromise, promise);
    });

    return promise;
};

fluid.prefs.prefsEditor.resetModel = function (that, newModel) {
    var transaction = that.applier.initiate();
    transaction.fireChangeRequest({path: "preferences", type: "DELETE"});
    transaction.change("", newModel);
    transaction.commit();
    that.events.onPrefsEditorRefresh.fire();
};

/*
 * Resets the selections to the integrator's defaults and fires afterReset
 */
fluid.prefs.prefsEditor.reset = function (that) {
    that.events.beforeReset.fire(that);
    fluid.prefs.prefsEditor.resetModel(that, fluid.copy(that.initialModel));
    that.events.afterReset.fire(that);
};

/*
 * Fires onCancel and resets the selections to the last saved selections
 */
fluid.prefs.prefsEditor.cancel = function (that) {
    that.events.onCancel.fire();
    var fetchPromise = that.fetch();
    fetchPromise.then(function () {
        fluid.prefs.prefsEditor.resetModel(that, that.model.remote);
    });
};

// called once markup is applied to the document containing tab component roots
fluid.prefs.prefsEditor.finishInit = function (that) {
    var bindHandlers = function (that) {
        var saveButton = that.locate("save");
        if (saveButton.length > 0) {
            saveButton.on("click", that.saveAndApply);
            var form = fluid.findForm(saveButton);
            $(form).on("submit", function () {
                that.saveAndApply();
            });
        }
        that.locate("reset").on("click", that.reset);
        that.locate("cancel").on("click", that.cancel);
    };

    var template = that.resources.template.resourceText;
    if (that.options.generatePanelContainers) {
        var sorted = fluid.parsePriorityRecords(that.options.preferences, "preferences"); // sort the preferences
        var sortedPrefs = fluid.getMembers(sorted, "namespace"); // retrieve just the preferences names

        // generate panel container markup
        var panels = sortedPrefs.map(function (pref) {
            var className = that.options.selectors[that.options.prefToMemberMap[pref]].slice(1);
            return fluid.stringTemplate(that.options.markup.panel, {className: className});
        }).join("");

        // interpolate panels into template.
        template = fluid.stringTemplate(template, {panels: panels});
    }

    that.container.append(template);
    bindHandlers(that);

    var fetchPromise = that.fetch();
    fetchPromise.then(function () {
        that.events.onPrefsEditorMarkupReady.fire();
        that.events.onPrefsEditorRefresh.fire();
        that.applyChanges();
        that.events.onReady.fire(that);

    });
};

fluid.prefs.prefsEditor.handleAutoSave = function (that) {
    if (that.options.autoSave) {
        that.events.onAutoSave.fire();
    }
};

fluid.prefs.prefsEditor.init = function (that) {
    // This setTimeout is to ensure that fetching of resources is asynchronous,
    // and so that component construction does not run ahead of subcomponents for SeparatedPanel
    // (FLUID-4453 - this may be a replacement for a branch removed for a FLUID-2248 fix)
    setTimeout(function () {
        if (!fluid.isDestroyed(that)) {
            fluid.prefs.prefsEditor.finishInit(that);
        }
    }, 1);
};
