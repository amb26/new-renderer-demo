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

/***********************************
 * Full Preview Preferences Editor *
 ***********************************/

// Addon grade for top-level Weaver which sets up preview enhancer and prefs editor grades
fluid.defaults("fluid.prefs.withPreview", {
    // previewTemplatePath: ""
    components: {
        enhancerClone: {
            type: "fluid.prefs.enhancerClone",
            options: {
                distributeOptions: {
                    "withPreview.outerUiEnhancerOptions": {
                        source: "{that}.options.originalUserOptions",
                        target: "{fluid.prefs.withPreview previewEnhancer}.options"
                    },
                    "withPreview.outerUiEnhancerGrades": {
                        source: "{that}.options.userGrades",
                        target: "{fluid.prefs.withPreview previewEnhancer}.options.gradeNames"
                    }
                }
            }
        }
    },
    distributeOptions: {
        "withPreview.prefsEditor": {
            record: "fluid.prefs.prefsEditorWithPreview",
            target: "{that prefsEditor}.options.gradeNames"
        }
    }
});

// Addon grade for fluid.prefs.prefsEditor
fluid.defaults("fluid.prefs.prefsEditorWithPreview", {
    gradeNames: "fluid.prefs.prefsEditor.withButtons",
    selectors: {
        previewFrame: ".flc-prefsEditor-preview-frame"
    },
    resources: {
        template: {
            path: "%fluid-prefs-editor/src/html/FullPreviewPrefsEditor.html"
        }
    },
    components: {
        preview: {
            type: "fluid.newRendererComponent",
            options: {
                container: "{prefsEditorWithPreview}.dom.previewFrame",
                resources: {
                    template: {
                        path: "{withPreview}.options.previewTemplatePath"
                    }
                }
            }
        },
        previewEnhancer: {
            type: "fluid.prefs.uiEnhancer",
            options: {
                container: "{prefsEditor}.preview.container",
                enactorRegistry: "{fluid.prefs.weaver}.options.enactorRegistry",
                varietyPathPrefix: "{fluid.prefs.weaver}.model.userPreferences"
            }
        }
    }
});
