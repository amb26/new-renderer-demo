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

/*******************************
 * Preferences Editor Contrast *
 *******************************/

/**
 * A sub-component of fluid.prefs that renders the "contrast" panel of the user preferences interface.
 */
fluid.defaults("fluid.prefs.panel.contrast", {
    gradeNames: ["fluid.prefs.panel.themePicker", "fluid.prefs.withEnactorMap"],
    container: ".flc-prefsEditor-contrast",
    preferencesMap: {
        "fluid.prefs.contrast": {
            "model.value": "value",
            "model.optionValues": "enum",
            "model.enumLabels": "enumLabels"
        }
    },
    enactorMap: { // Fetch the class map from our corresponding enactor
        "fluid.prefs.contrast": {
            "classes": "classes"
        }
    },
    styles: {
        defaultThemeLabel: "fl-prefsEditor-themePicker-defaultThemeLabel"
    },
    resources: {
        template: {
            path: "%fluid-prefs-contrast/html/Contrast.html"
        },
        messages: {
            path: "%fluid-prefs-contrast/messages/contrast.json"
        }
    }
});
