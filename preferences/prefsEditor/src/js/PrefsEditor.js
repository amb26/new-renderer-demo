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

/** An addon grade for the prefs editor's PanelHolder which sources the panel holder template from static markup
 * held in the prefs editor's "template" resource
 */
fluid.defaults("fluid.prefs.staticPanelHolder", {
    gradeNames: "fluid.newRendererComponent",
    templateHasRoot: false,
    resources: {
        template: {
            path: "%fluid-prefs-editor/src/html/StaticPanelHolder.html"
        }
    }
});

fluid.defaults("fluid.prefs.dynamicPanelHolder", {
    gradeNames: "fluid.newRendererComponent",
    markup: {
        panels: "<ul class=\"fl-prefsEditor-panels\">%panels</ul>",
        panel: "<li class=\"%className flc-prefsEditor-panel fl-prefsEditor-panel\"></li>"
    },
    templateHasRoot: false,
    workflows: {
        global: {
            dynamicPrefsEditorTemplate: {
                funcName: "fluid.prefs.dynamicPanelHolder.generate",
                priority: "before:fetchTemplates"
            }
        }
    },
    resources: {
        template: {
            promiseFunc: "fluid.prefs.dynamicPanelHolder.resolve",
            promiseArgs: ["{dynamicPanelHolder}"]
        }
    }
});

fluid.prefs.dynamicPanelHolder.markupFromPanels = function (panels, markupOptions) {
    var panelMarkup = panels.map(function (panel) {
        var container = fluid.getForComponent(panel, ["options", "container"]);
        var className = container.substring(1);
        return fluid.stringTemplate(markupOptions.panel, {className: className});
    }).join("\n");
    var fullMarkup = fluid.stringTemplate(markupOptions.panels, {
        panels: panelMarkup
    });
    return fullMarkup;
};

fluid.prefs.dynamicPanelHolder.generate = function (shadows) {
    var templateHolder = shadows[0].that;
    var panels = [];
    // We abuse these internals of Infusion to look ahead into panels that are created - we can't use the workflow
    // shadows since Infusion only supplies the dynamicPanelTemplate component itself based on its grade
    var allShadows = fluid.currentTreeTransaction().outputShadows;
    allShadows.forEach(function (shadow) {
        // In theory we would be more principled and verify that the panels have a common prefsEditor parent with the panelHolder
        // but the chance someone tries to construct two prefsEditors simultaneously is vanishingly small
        if (fluid.componentHasGrade(shadow.that, "fluid.prefs.panel")) {
            panels.push(shadow.that);
        }
    });
    var markupOptions = fluid.getForComponent(templateHolder, ["options", "markup"]);
    var panelMarkup = fluid.prefs.dynamicPanelHolder.markupFromPanels(panels, markupOptions);
    templateHolder.dynamicTemplate = panelMarkup;
};

fluid.prefs.dynamicPanelHolder.resolve = function (templateHolder) {
    return templateHolder.dynamicTemplate;
};

/*
 * A component that works in conjunction with the UI Enhancer component
 * to allow users to set personal user interface preferences. The Preferences Editor component provides a user
 * interface for setting and saving personal preferences, and the UI Enhancer component carries out the
 * work of applying those preferences to the user interface.
 */
fluid.defaults("fluid.prefs.prefsEditor", {
    gradeNames: ["fluid.newRendererComponent", "fluid.prefs.varietyPathHolder"],
    // varietyPathPrefix: must be overridden
    components: {
        panelHolder: {
            type: "fluid.newRendererComponent",
            options: {
                container: "{prefsEditor}.dom.panelHolder"
            }
        }
    },
    selectors: {
        panelHolder: ".flc-prefsEditor-panelHolder",
        panels: ".flc-prefsEditor-panel" // used by ArrowScrolling
    },
    events: {
        //beforeReset: null, // <-- Unnecessary - only listener is arrowScrolling - it should instead contribute its own init value of {panelIndex: 0}
        //afterReset: null, // NoPreview listened to this and does "applyChanges" followed by "save"
    },
    templateHasRoot: false,
    resources: {
        template: {
            path: "%fluid-prefs-editor/src/html/FullPreviewPrefsEditor.html"
        }
    }
});

fluid.defaults("fluid.prefs.prefsEditor.withButtons", {
    selectors: {
        cancel: ".flc-prefsEditor-cancel",
        reset: ".flc-prefsEditor-reset",
        save: ".flc-prefsEditor-save"
    },
    modelListeners: {
        cancelButton: {
            path: "dom.cancel.click",
            listener: "{preferencesHolder}.events.cancel.fire",
            excludeSource: "init"
        },
        resetButton: {
            path: "dom.reset.click",
            listener: "{preferencesHolder}.events.reset.fire",
            excludeSource: "init"
        },
        saveButton: {
            path: "dom.save.click",
            listener: "{preferencesHolder}.events.save.fire",
            excludeSource: "init"
        }
    }
});
