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


fluid.defaults("fluid.prefs.panel.textSize", {
    gradeNames: ["fluid.prefs.panel.stepperAdjuster"],
    container: ".flc-prefsEditor-text-size",
    preferencesMap: {
        "fluid.prefs.textSize": {
            "model.value": "value",
            "range.min": "minimum",
            "range.max": "maximum",
            "step": "multipleOf"
        }
    },
    resources: {
        template: {
            path: "%fluid-prefs-text-size/src/html/TextSize.html"
        },
        messages: {
            path: "%fluid-prefs-text-size/src/messages/textSize.json"
        }
    }
});
