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

// TODO: Port this over to new renderer

fluid.defaults("fluid.prefs.panel.localization", {
    gradeNames: ["fluid.prefs.panel"],
    container: ".flc-prefsEditor-localization",
    preferencesMap: {
        "fluid.prefs.localization": {
            "model.value": "value",
            "controlValues.localization": "enum",
            "stringArrayIndex.localization": "enumLabels"
        }
    },
    selectors: {
        localization: ".flc-prefsEditor-localization"
    },
    protoTree: {
        label: {messagekey: "label"},
        localizationDescr: {messagekey: "description"},
        localization: {
            optionnames: "${{that}.msgLookup.localization}",
            optionlist: "${{that}.options.controlValues.localization}",
            selection: "${value}"
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
