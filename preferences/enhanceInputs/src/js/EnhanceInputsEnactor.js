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
 * enhanceInputs
 *
 * The enactor to enhance inputs in the container according to the value
 *******************************************************************************/

fluid.defaults("fluid.prefs.enactor.enhanceInputs", {
    gradeNames: ["fluid.prefs.enactor.styleElements", "fluid.viewComponent"],
    preferencesMap: {
        "fluid.prefs.enhanceInputs": {
            "model.value": "value"
        }
    },
    cssClass: "fl-input-enhanced",
    elementsToStyle: "{that}.container"
});
