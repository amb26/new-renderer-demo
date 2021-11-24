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

(function ($, fluid) {
    "use strict";

    // OK - we can get rid of "initialModel" - it can go into the preferencesHolder as a separate entry
    // We can unbind UIEnhancer from its container - and all the enactors?
    // Probably not - let's continue with things bound to their container. This is very much an "external resource" - 
    // what becomes of our "fluid" model where everything is mutable?
    // Well - we can bind to new containers and "listen" to their updates and materialise against them. We can't
    // support binding against two different containers. So we continue with the weird "broadcast" model
    // until we have layers and can inherit the "foreign" enhancer directly from the instance of the local one.

    
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

    fluid.defaults("fluid.uiEnhancer", {
        gradeNames: ["fluid.viewComponent"],
        userGrades: "@expand:fluid.prefs.filterEnhancerGrades({that}.options.gradeNames)",
        dynamicComponents: {
            enactors: {
                source: "{uiEnhancer}.options.enactorRegistry",
                type: "{source}.type",
                options: "{source}.options" // Currently none of these - could be configured by hand
            }
        },
        enactorRegistry: {
          
        }

    });

    // Make this a standalone grade since options merging can't see 2 levels deep into merging
    // trees and will currently trash "gradeNames" for 2nd level nested components!
    fluid.defaults("fluid.uiEnhancer.root", {
        gradeNames: ["fluid.uiEnhancer", "fluid.resolveRootSingle"],
        singleRootType: "fluid.uiEnhancer"
    });

    fluid.uiEnhancer.ignorableGrades = ["fluid.uiEnhancer", "fluid.uiEnhancer.root", "fluid.resolveRoot", "fluid.resolveRootSingle"];

    // These function is necessary so that we can "clone" a UIEnhancer (e.g. one in an iframe) from another.
    // We would like to fix this but this will only be convenient in Infusion 6 since we don't want to propagate "container" in arguments or whatever
    fluid.prefs.filterEnhancerGrades = function (gradeNames) {
        return fluid.remove_if(fluid.makeArray(gradeNames), function (gradeName) {
            return fluid.frameworkGrades.indexOf(gradeName) !== -1 || fluid.uiEnhancer.ignorableGrades.indexOf(gradeName) !== -1;
        });
    };

    // Just the options that we are clear safely represent user options
    fluid.prefs.filterEnhancerOptions = function (options) {
        return fluid.filterKeys(options, ["classnameMap", "fontSizeMap", "tocTemplate", "tocMessage", "components"]);
    };

    /********************************************************************************
     * PageEnhancer                                                                 *
     *                                                                              *
     * A UIEnhancer wrapper that concerns itself with the entire page.              *
     *                                                                              *
     ********************************************************************************/

    // TODO: Both the pageEnhancer and the uiEnhancer need to be available separately - some
    // references to "{uiEnhancer}" are present in prefsEditorConnections, whilst other
    // sites refer to "{pageEnhancer}". The fact that uiEnhancer requires "body" prevents it
    // being top-level until we have the options flattening revolution. Also one day we want
    // to make good of advertising an unmerged instance of the "originalEnhancerOptions"
    // originalEnhancerOptions is referenced from FullPreview and SeparatedPanel prefs editors.
    fluid.defaults("fluid.pageEnhancer", {
        gradeNames: ["fluid.component", "fluid.originalEnhancerOptions", "fluid.resolveRootSingle"],
        // <-- Interestingly the pageEnhancer was a settingsGetter (which should just be a dataSource),
        // and it just did persistence on startup. Very odd ... we haven't finished the 
        // "initial resource becomes persistent model source" idiom - but this isn't important until we
        // get the WebSockets version.
        // We will axe settingsGetter and initialModel and instead have a nested injected dataSource reference.
        singleRootType: "fluid.pageEnhancer",
        components: {
            uiEnhancer: {
                type: "fluid.uiEnhancer.root",
                container: "body"
            },
            store: "{fluid.prefs.store}"
        },
        originalUserOptions: "@expand:fluid.prefs.filterEnhancerOptions({uiEnhancer}.options)",
        listeners: {
            "onCreate.initModel": "fluid.pageEnhancer.init"
        }
    });

    fluid.pageEnhancer.init = function (that) {
        var fetchPromise = that.getSettings();
        fetchPromise.then(function (fetchedSettings) {
            that.uiEnhancer.updateModel(fluid.get(fetchedSettings, "preferences"));
        });
    };

})(jQuery, fluid_4_0_0);
