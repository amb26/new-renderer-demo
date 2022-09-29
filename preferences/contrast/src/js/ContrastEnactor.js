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
 * contrast
 *
 * The enactor to change the contrast theme according to the value
 *******************************************************************************/
// Note that the implementors need to provide the container for this view component
fluid.defaults("fluid.prefs.enactor.contrast", {
    gradeNames: ["fluid.prefs.enactor.classSwapper", "fluid.prefs.enactor.withBlockingClass"],
    blockingClass: "fl-blocking-theme",
    preferencesMap: {
        "fluid.prefs.contrast": {
            "model.value": "value"
        }
    },
    classes: { // Used to be in fluid.uiEnhancer.cssClassEnhancerBase in StarterGrades.js
        "default": "fl-theme-prefsEditor-default",
        "bw": "fl-theme-bw",
        "wb": "fl-theme-wb",
        "by": "fl-theme-by",
        "yb": "fl-theme-yb",
        "lgdg": "fl-theme-lgdg",
        "gd": "fl-theme-gd",
        "gw": "fl-theme-gw",
        "bbr": "fl-theme-bbr"
    }
});
