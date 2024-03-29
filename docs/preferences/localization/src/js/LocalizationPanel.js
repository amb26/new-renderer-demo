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

fluid.defaults("fluid.prefs.panel.localization", {
    gradeNames: ["fluid.prefs.panel", "fluid.prefs.withEnactorMap", "fluid.prefs.panel.localisedEnumLabels"],
    container: ".flc-prefsEditor-localization",
    preferencesMap: {
        "fluid.prefs.localization": {
            "model.value": "value",
            "model.optionValues": "enum",
            "model.enumLabels": "enumLabels"
        }
    },
    selectors: {
        select: ".flc-prefsEditor-localization-select"
    },
    components: {
        select: {
            type: "fluid.uiSelect",
            options: {
                container: "{panel}.dom.select",
                model: {
                    value: "{panel}.model.value",
                    optionValues: "{panel}.model.optionValues",
                    optionLabels: "{panel}.model.optionLabels"
                }
            }
        }
    },
    resources: {
        template: {
            path: "%fluid-prefs-localization/src/html/Localization.html"
        },
        messages: {
            path: "%fluid-prefs-localization/src/messages/localization.json"
        }
    }
});
