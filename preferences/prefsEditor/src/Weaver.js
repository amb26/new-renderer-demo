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



// We used to have 
// fluid.prefs.assembler.prefsEd", {
//        gradeNames: ["fluid.prefs.assembler.uie"
// and then uio

/*
 * Top-level component that orchestrates construction of panels, enhancers and stores for a preferences
 * editor component. Replaces previous-generation "builder".
 */
fluid.defaults("fluid.prefs.weaver", {
    gradeNames: ["fluid.prefs.indexer", "fluid.prefs.preferencesHolder"],
    // Override this definition in the case the user wants to respond to fewer enactors than are loaded
    enactorRegistry: "@expand:fluid.prefs.indexer.allEnactorRegistry({that}.options.enactorIndex)",
    model: {
        prefsEditor: false, // Whether the prefsEditor should be constructed
    },

    components: {
        prefsEditor: {
            type: "fluid.prefs.editor",
            source: "{that}.model.prefsEditor",
            components: {
                prefsHolder: "{fluid.prefs.preferencesHolder}"
            }
        },
        enhancer: {
            type: "fluid.prefs.enhancer",
            options: {
                model: {
                    preferences: "{fluid.prefs.weaver}.model.userPreferences"
                },
                enactorRegistry: "{fluid.prefs.weaver}.enactorRegistry"
            }
        }
    },
    distributeOptions: {
        weaveEnactors: {
            target: "{that fluid.prefs.enactor}.options.gradeNames",
            record: "fluid.prefs.withPreferencesMap"
        },
        weavePanels: {
            target: "{that fluid.prefs.panel}.options.gradeNames",
            record: "fluid.prefs.withPreferencesMap"
        }
    }
   
});

