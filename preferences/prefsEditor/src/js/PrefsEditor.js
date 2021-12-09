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

fluid.defaults("fluid.prefs.staticPanelHolder", {
    gradeNames: "fluid.newRendererComponent",
    parentMarkup: true
});


/*
 * A component that works in conjunction with the UI Enhancer component
 * to allow users to set personal user interface preferences. The Preferences Editor component provides a user
 * interface for setting and saving personal preferences, and the UI Enhancer component carries out the
 * work of applying those preferences to the user interface.
 */
fluid.defaults("fluid.prefs.prefsEditor", {
    gradeNames: ["fluid.newRendererComponent", "fluid.prefs.varietyPathHolder"],
    // varietyPathPrefix: must be overridden
    markup: {
        // only used when dynamically generating the panel containers.
        panel: "<li class=\"%className flc-prefsEditor-panel fl-prefsEditor-panel\"></li>"
    },
    components: {
        prefsHolder: "{fluid.prefs.preferencesHolder}",
        panelHolder: {
            type: "fluid.newRendererComponent",
            options: {
                container: "{prefsEditor}.dom.panelHolder"
            }
        }
    },
    selectors: {
        panelHolder: ".flc-prefsEditor-panelHolder",
        // panels: ".flc-prefsEditor-panel",
        cancel: ".flc-prefsEditor-cancel",
        reset: ".flc-prefsEditor-reset",
        save: ".flc-prefsEditor-save"
    },
    events: {
        //beforeReset: null, // <-- Unnecessary - only listener is arrowScrolling - it should instead contribute its own init value of {panelIndex: 0}
        //afterReset: null, // NoPreview listened to this and does "applyChanges" followed by "save"
    },
    resources: {
        template: {
            // need to parameterise the area where panels appear -
            // Separated panel has fl-prefsEditor-panels as the container, others have fl-prefsEditor-
            path: "%fluid-prefs-editor/src/html/FullPreviewPrefsEditor.html"
        }
    },
    modelListeners: {
        cancelButton: {
            path: "dom.cancel.click",
            listener: "{prefsHolder}.events.cancel.fire",
            excludeSource: "init"
        },
        resetButton: {
            path: "dom.reset.click",
            listener: "{prefsHolder}.events.reset.fire",
            excludeSource: "init"
        },
        saveButton: {
            path: "dom.save.click",
            listener: "{prefsHolder}.events.save.fire",
            excludeSource: "init"
        }
    }
});

// called once markup is applied to the document containing tab component roots
fluid.prefs.prefsEditor.finishInit = function (that) {

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
};
