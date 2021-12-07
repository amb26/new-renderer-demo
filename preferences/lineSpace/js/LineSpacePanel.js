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

fluid.defaults("fluid.prefs.panel.lineSpace", {
    gradeNames: ["fluid.prefs.panel.stepperAdjuster"],
    container: ".flc-prefsEditor-line-space", // with "new view" we can now put this into options
    preferencesMap: {
        "fluid.prefs.lineSpace": {
            "model.value": "value",
            "range.min": "minimum",
            "range.max": "maximum",
            "step": "multipleOf"
        }
    },
    resources: {
        template: {
            path: "%fluid-prefs-line-space/html/LineSpace.html",
        },
        messages: {
            path: "%fluid-prefs-line-space/messages/lineSpace.json"
        }
    }
});
