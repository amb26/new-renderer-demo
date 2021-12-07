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
    // Override to configure both panel templating style and panel choice - perhaps this should be a hash
    panelHolderGrades: "fluid.prefs.starterPanelHolder",
    // Override with desired container for prefsEditor - UIOptions naturally forwards its own container
    prefsEditorContainer: "",

    // Ends up with schemaIndex, enactorIndex from fluid.prefs.indexer

    components: {
        enhancer: {
            type: "fluid.prefs.pageEnhancer",
            options: {
                enactorRegistry: "{fluid.prefs.weaver}.options.enactorRegistry"
            }
        }
    },
    dynamicComponents: {
        prefsEditor: {
            type: "fluid.prefs.prefsEditor",
            source: "{that}.model.prefsEditor",
            options: {
                container: "{fluid.prefs.weaver}.options.prefsEditorContainer",
                components: {
                    prefsHolder: "{fluid.prefs.preferencesHolder}",
                    panelHolder: {
                        options: {
                            gradeNames: "{fluid.prefs.weaver}.options.panelHolderGrades"
                        }
                    }
                }
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

