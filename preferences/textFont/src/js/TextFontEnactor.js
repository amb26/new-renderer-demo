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
 * textFont
 *
 * The enactor to change the font face used according to the value
 *******************************************************************************/
// Note that the implementors need to provide the container for this view component
fluid.defaults("fluid.prefs.enactor.textFont", {
    gradeNames: ["fluid.prefs.enactor.classSwapper"],
    preferencesMap: {
        "fluid.prefs.textFont": {
            "model.value": "value"
        }
    },
    classes: { // Used to be in fluid.uiEnhancer.cssClassEnhancerBase in StarterGrades.js
        "default": "",
        "times": "fl-font-times",
        "comic": "fl-font-comic-sans",
        "arial": "fl-font-arial",
        "verdana": "fl-font-verdana",
        "open-dyslexic": "fl-font-open-dyslexic"
    }
});
