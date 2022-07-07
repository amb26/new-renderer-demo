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

// Note that fluid.uiEnhancer.starterEnactors contained a lot of definitions like this:
/*
fluid.defaults("fluid.uiEnhancer.starterEnactors", {
    gradeNames: ["fluid.uiEnhancer", "fluid.uiEnhancer.cssClassEnhancerBase", "fluid.uiEnhancer.browserTextEnhancerBase"],
    model: "{fluid.prefs.initialModel}.initialModel.preferences", // <-- This is the reference to initialModel - unnecessary since we can now stick it in a resource
    components: {
        textSize: {
            type: "fluid.prefs.enactor.textSize",
            container: "{uiEnhancer}.container",  // hard binding here, could we avoid it?

*/

/***********************************************
 * UI Enhancer                                 *
 *                                             *
 * Transforms the page based on user settings. *
 ***********************************************/

fluid.defaults("fluid.prefs.uiEnhancer", {
    gradeNames: ["fluid.viewComponent", "fluid.prefs.varietyPathHolder"],
    distributeOptions: {
        enactorContainer: {
            record: "{uiEnhancer}.container",
            target: "{that fluid.prefs.enactor}.options.container"
        }
    },
    dynamicComponents: {
        enactors: {
            sources: "{uiEnhancer}.options.enactorRegistry",
            type: "{source}.type",
            options: "{source}.options" // Currently none of these - could be configured by hand
        }
    },
    enactorRegistry: { // populated by higher-level "weaver"
    }
});

fluid.prefs.uiEnhancer.ignorableGrades = ["fluid.prefs.pageEnhancer"];

// These function is necessary so that we can "clone" a UIEnhancer (e.g. one in an iframe) from another.
// We would like to fix this but this will only be convenient in Infusion 6 since we don't want to propagate "container" in arguments or whatever
fluid.prefs.filterEnhancerGrades = function (gradeNames) {
    return fluid.remove_if(fluid.makeArray(gradeNames), function (gradeName) {
        return fluid.frameworkGrades.includes(gradeName) || fluid.prefs.uiEnhancer.ignorableGrades.includes(gradeName);
    });
};

// Just the options that we are clear safely represent user options
fluid.prefs.filterEnhancerOptions = function (options) {
    return fluid.filterKeys(options, ["classnameMap", "fontSizeMap", "tocTemplate", "tocMessage", "enactorRegistry"]);
};

fluid.defaults("fluid.prefs.enhancerClone", {
    gradeNames: "fluid.component",
    originalUserOptions: "@expand:fluid.prefs.filterEnhancerOptions({pageEnhancer}.options)",
    userGrades: "@expand:fluid.prefs.filterEnhancerGrades({pageEnhancer}.options.gradeNames)"
});


/********************************************************************************
 * PageEnhancer                                                                 *
 *                                                                              *
 * A UIEnhancer wrapper that concerns itself with the entire page.              *
 *                                                                              *
 ********************************************************************************/

fluid.defaults("fluid.prefs.pageEnhancer", {
    gradeNames: "fluid.prefs.uiEnhancer",
    container: "body"
});
