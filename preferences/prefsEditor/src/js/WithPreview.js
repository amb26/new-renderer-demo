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

/***********************************
 * Full Preview Preferences Editor *
 ***********************************/

fluid.defaults("fluid.prefs.withPreview", {
    outerUiEnhancerOptions: "{originalEnhancerOptions}.options.originalUserOptions",
    outerUiEnhancerGrades: "{originalEnhancerOptions}.uiEnhancer.options.userGrades",
    components: {
        enhancerClone: {
            type: "fluid.prefs.enhancerClone"
        },
        previewEnhancer: {
            type: "fluid.prefs.uiEnhancer"
        }
    },
    distributeOptions: {
        "fullPreview.enhancer.outerUiEnhancerOptions": {
            source: "{that}.enhancerClone.options.outerUiEnhancerOptions",
            target: "{that previewEnhancer}.options"
        },
        "fullPreview.enhancer.outerUiEnhancerGrades": {
            source: "{that}.enhancerClone.options.outerUiEnhancerGrades",
            target: "{that previewEnhancer}.options.gradeNames"
        }
    }
});
