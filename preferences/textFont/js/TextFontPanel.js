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


/********************************
 * Preferences Editor Text Font *
 ********************************/

/**
 * A sub-component of fluid.prefs that renders the "text font" panel of the user preferences interface.
 */
fluid.defaults("fluid.prefs.panel.textFont", {
    gradeNames: ["fluid.prefs.panel", "fluid.prefs.withEnactorMap"],
    container: ".flc-prefsEditor-text-font",
    preferencesMap: {
        "fluid.prefs.textFont": {
            "model.value": "value",
            "model.optionValues": "enum",
            "model.enumLabels": "enumLabels"
        }
    },
    enactorMap: { // Fetch the class map from our corresponding enactor
        "fluid.prefs.textFont": {
            "classes": "classes"
        }
    },
    selectors: {
        textFont: ".flc-prefsEditor-text-font-select"
    },
    components: {
        "select": {
            type: "fluid.uiSelect",
            container: "{textFont}.dom.textFont",
            options: {
                model: {
                    value: "{textFont}.model.value",
                    optionValues: "{textFont}.model.optionValues"
                },
                modelRelay: {
                    lookupLabels: {
                        target: "optionLabels",
                        func: "fluid.transforms.messageLookup",
                        args: ["{textFont}.model.enumLabels", "{textFont}.model.messages"]
                    },
                    renderNodes: {
                        target: "optionNodes",
                        func: "fluid.prefs.panel.textFont.renderNodes",
                        args: ["{that}.model.optionValues", "{textFont}.options.classes", "{textFont}.options.styles.preview"]
                    }
                }
            }
        }
    },
    styles: {
        preview: "fl-preview-theme"
    },
    resources: {
        template: {
            path: "%fluid-prefs-text-font/html/TextFont.html"
        },
        messages: {
            path: "%fluid-prefs-text-font/messages/textFont.json"
        }
    }
});

fluid.prefs.panel.textFont.renderNodes = function (optionValues, classes, previewStyle) {
    return optionValues.map(function (option) {
        return {
            "class": fluid.arrayToHash(fluid.makeArray(classes[option]).concat(previewStyle))
        };
    });
};
