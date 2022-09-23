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

/*******************************************************************************
 * selfVoicing
 *
 * The enactor that enables self voicing of the DOM
 *******************************************************************************/

fluid.defaults("fluid.prefs.enactor.selfVoicing", {
    gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent", "fluid.prefs.enactor.ignorableSelectorHolder",
        "fluid.prefs.enactor.excludeFromPrefsEditor"],
    preferencesMap: {
        "fluid.prefs.speak": {
            "model.enabled": "value"
        }
    },
    // from ignorableSelectorHolder:
    // ignoreSelectorForEnactor - an enactor receives a selector in this field which marks material in the document to be ignored
    selectors: {
        controller: ".flc-prefs-selfVoicingWidget",
        // Note that we can't supply "body" as a selector here since fluid.container always needs to return a node strictly
        // nested in its own container/context - which in this case is also "body"
        content: document.body
    },
    events: {
        onInitOrator: null
    },
    modelListeners: {
        "enabled": {
            funcName: "fluid.prefs.enactor.selfVoicing.initOrator",
            args: ["{that}", "{change}.value"],
            namespace: "initOrator"
        }
    },
    components: {
        orator: {
            type: "fluid.orator",
            // We use an old-style createOnEvent so that we lazily construct this possibly expensive component
            createOnEvent: "onInitOrator",
            container: "{fluid.prefs.enactor.selfVoicing}.container",
            options: {
                model: {
                    enabled: "{selfVoicing}.model.enabled"
                },
                controller: {
                    parentContainer: "{fluid.prefs.enactor.selfVoicing}.dom.controller"
                },
                selectors: {
                    content: "{fluid.prefs.enactor.selfVoicing}.options.selectors.content"
                }
            }
        }
    },
    distributeOptions: {
        oratorOpts: {
            source: "{that}.options.orator",
            target: "{that > orator}.options",
            namespace: "oratorOpts"
        },
        ignoreSelectorForEnactor: {
            source: "{that}.options.ignoreSelectorForEnactor",
            target: "{that > orator > domReader > parser}.options.ignoredSelectors.forEnactor"
        }
    }
});

fluid.prefs.enactor.selfVoicing.initOrator = function (that, enabled) {
    if (enabled && !that.orator) {
        that.events.onInitOrator.fire();
    }
};
