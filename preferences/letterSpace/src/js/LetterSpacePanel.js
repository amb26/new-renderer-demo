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

/*************************************
 * Preferences Editor Letter Spacing *
 *************************************/

fluid.defaults("fluid.prefs.panel.letterSpace", {
    gradeNames: ["fluid.prefs.panel.stepperAdjuster"],
    container: ".flc-prefsEditor-letter-space",
    preferencesMap: {
        "fluid.prefs.letterSpace": {
            "model.value": "value",
            "range.min": "minimum",
            "range.max": "maximum",
            "step": "multipleOf"
        }
    },
    resources: {
        template: {
            path: "%fluid-prefs-letter-space/src/html/LetterSpace.html"
        },
        messages: {
            path: "%fluid-prefs-letter-space/src/messages/letterSpace.json"
        }
    }
});
