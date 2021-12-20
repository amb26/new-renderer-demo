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

/***********************************
 * Full Preview Preferences Editor *
 ***********************************/

// Addon grade for top-level Weaver which sets up sliding panel grades and accompanying interaction for a separated panel

fluid.defaults("fluid.prefs.withSlidingPanel", {
    // Turn the Weaver into a renderer component so that we can displace all of its markup down one level
    // We're rather lucky that this level of containment was here to be used otherwise it would have been hard
    // to know what to do here - we don't have any form of SYNCRETIC PROMOTION before Infusion 6 and it's still
    // hard to see how to avoid confusing users with it if we did have it
    gradeNames: "fluid.newRendererComponent",
    resources: {
        template: {
            path: "%fluid-prefs-editor/src/html/SlidingPanel.html"
        }
    },
    model: {
        // Note: Depends that the weaver is also the preferencesHolder, and also on its workflow - should really listen
        // a "read" event and update whenever we go to persistence
        // These are the preferences applied to the prefsEditor's own interface which lag the live ones to prevent the
        // interface jumping under the user
        laggingPreferences: "{that}.resources.initialPersistentPreferences.parsed.preferences",
        // The preferences as applied to the prefsEditor - include defaults to insulate CSS variables
        appliedLaggingPreferences: {
        }
    },
    modelRelay: {
        mergeLaggingPrefs: {
            target: "appliedLaggingPreferences",
            func: "fluid.prefs.merge",
            args: ["{that}.model.defaultPreferences", "{that}.model.laggingPreferences"]
        }
    },
    invokers: {
        updateLaggingPreferences: {
            funcName: "fluid.prefs.setModelValue",
            args: ["{that}", "laggingPreferences", "{that}.model.userPreferences"]
        }
    },
    listeners: {
        "reset.updateLaggingPreferences": {
            func: "{that}.updateLaggingPreferences",
            priority: "after:main"
        }
    },
    templateHasRoot: false,
    selectors: {
        slidingPanelPanel: ".flc-slidingPanel-panel",
        reset: ".flc-prefsEditor-reset"
    },
    // This would be better as an options distribution but the renderer couldn't see the container override because of FLUID-6707
    dynamicComponents: {
        prefsEditor: {
            options: {
                gradeNames: "fluid.prefs.prefsEditor.withSlidingPanel",
                container: "{weaver}.dom.slidingPanelPanel"
            }
        }
    },
    modelListeners: {
        resetButton: {
            path: "dom.reset.click",
            listener: "{preferencesHolder}.events.reset.fire",
            excludeSource: "init"
        }
    }
});

// Addon grade for fluid.prefs.prefsEditor
fluid.defaults("fluid.prefs.prefsEditor.withSlidingPanel", {
    gradeNames: "fluid.messageLoader",
    resources: {
        messages: {
            path: "%fluid-prefs-editor/src/messages/prefsEditor.json"
        }
    },
    components: {
        selfEnhancer: {
            type: "fluid.prefs.uiEnhancer",
            options: {
                container: "{prefsEditor}.container",
                enactorRegistry: "{fluid.prefs.weaver}.options.enactorRegistry",
                varietyPathPrefix: "{fluid.prefs.weaver}.model.appliedLaggingPreferences"
            }
        },
        slidingPanel: {
            type: "fluid.slidingPanel",
            options: {
                // TODO: Is this really right? Is the only reason we shoved the sliding panel down here is
                // that we want it to have the prefs editor's bundle?
                // It may as well really have its own bundle and then we rename it
                container: "{weaver}.container",
                model: {
                    messages: {
                        showText: "{prefsEditor}.model.messages.slidingPanelShowText",
                        hideText: "{prefsEditor}.model.messages.slidingPanelHideText",
                        showTextAriaLabel: "{prefsEditor}.model.messages.showTextAriaLabel",
                        hideTextAriaLabel: "{prefsEditor}.model.messages.hideTextAriaLabel",
                        panelLabel: "{prefsEditor}.model.messages.slidingPanelPanelLabel"
                    }
                },
                listeners: {
                    "afterStateChange.updatePreferences": {
                        listener: "fluid.prefs.withSlidingPanel.updatePreferences",
                        args: ["{preferencesHolder}", "{slidingPanel}"]
                    }
                }
            }
        }
    }
});

fluid.prefs.withSlidingPanel.updatePreferences = function (preferencesHolder, slidingPanel) {
    if (!slidingPanel.model.isShowing) {
        preferencesHolder.updateLaggingPreferences();
    }
};