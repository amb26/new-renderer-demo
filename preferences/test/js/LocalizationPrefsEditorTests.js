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

(function ($) {
    "use strict";

    fluid.defaults("fluid.tests.localizationPrefsEditor", {
        gradeNames: ["fluid.prefs.localizationPrefsEditorConfig", "fluid.prefs.builder", "fluid.viewComponent"],
        localizationScheme: "urlPath",
        localeNames: ["localization-default", "localization-en", "localization-fr", "localization-es", "localization-fa"],
        locales: ["", "en", "en-ca", "fr", "es", "fa"],
        langMap: {
            "en": "",
            "en-ca": "en-Ca",
            "es": "es",
            "fa": "fa",
            "fr": "fr"
        },
        langSegIndex: 2,
        preferences: ["fluid.prefs.localization"],
        auxiliarySchema: {
            defaultLocale: "fr",
            terms: {
                templatePrefix: "../../../../src/framework/preferences/html",
                messagePrefix: "../../../../src/framework/preferences/messages"
            }
        }
    });

    fluid.defaults("fluid.tests.localizationPrefsEditorTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            localizationPrefsEditor: {
                type: "fluid.tests.localizationPrefsEditor",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "{localizationPrefsEditorTester}.events.onTestCaseStart"
            },
            localizationPrefsEditorTester: {
                type: "fluid.tests.localizationPrefsEditorTester"
            }
        }
    });

    fluid.defaults("fluid.tests.localizationPrefsEditorTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            localizationScheme: "urlPath",
            localeNames: ["localization-default", "localization-en", "localization-fr", "localization-es", "localization-fa"],
            locales: ["", "en", "en-ca", "fr", "es", "fa"],
            langMap: {
                "en": "",
                "en-ca": "en-Ca",
                "es": "es",
                "fa": "fa",
                "fr": "fr"
            },
            langSegIndex: 2,
            defaultLocale: "fr"
        },
        modules: [{
            name: "fluid.prefs.localizationPrefsEditorConfig",
            tests: [{
                expect: 7,
                name: "Options Distributions",
                sequence: [{
                    // Init
                    listener: "jqUnit.assert",
                    event: "{localizationPrefsEditorTests localizationPrefsEditor}.events.onReady",
                    args: ["The prefs editor was created"]
                }, {
                    // `defaultLocale` distributed to prefsEditorLoader
                    func: "jqUnit.assertEquals",
                    args: [
                        "The defaultLocale is passed to the prefsEditorLoader",
                        "{that}.options.testOpts.defaultLocale",
                        "{localizationPrefsEditor}.prefsEditorLoader.options.defaultLocale"
                    ]
                }, {
                    // `locales` distributed to localization panel
                    func: "jqUnit.assertDeepEq",
                    args: [
                        "The localization panel's control values are set",
                        "{that}.options.testOpts.locales",
                        "{localizationPrefsEditor}.prefsEditorLoader.prefsEditor.fluid_prefs_panel_localization.options.controlValues.localization"
                    ]
                }, {
                    // `localeNames` distributed to localization  panel
                    func: "jqUnit.assertDeepEq",
                    args: [
                        "The localization panel's localization options have been set",
                        "{that}.options.testOpts.localeNames",
                        "{localizationPrefsEditor}.prefsEditorLoader.prefsEditor.fluid_prefs_panel_localization.options.stringArrayIndex.localization"
                    ]
                }, {
                    // `localizationScheme` distributed to localization enactor
                    func: "jqUnit.assertEquals",
                    args: [
                        "The localization enactor's localizationScheme is set",
                        "{that}.options.testOpts.localizationScheme",
                        "{localizationPrefsEditor}.enhancer.uiEnhancer.fluid_prefs_enactor_localization.options.localizationScheme"
                    ]
                }, {
                    // `langMap` distributed to localization enactor
                    func: "jqUnit.assertDeepEq",
                    args: [
                        "The localization enactor's langMap is set",
                        "{that}.options.testOpts.langMap",
                        "{localizationPrefsEditor}.enhancer.uiEnhancer.fluid_prefs_enactor_localization.options.langMap"
                    ]
                }, {
                    // `langSegIndex` distributed to localization enactor
                    func: "jqUnit.assertEquals",
                    args: [
                        "The localization enactor's langSegIndex is set",
                        "{that}.options.testOpts.langSegIndex",
                        "{localizationPrefsEditor}.enhancer.uiEnhancer.fluid_prefs_enactor_localization.options.langSegIndex"
                    ]
                }]
            }]
        }]
    });

    $(function () {
        fluid.test.runTests([
            "fluid.tests.localizationPrefsEditorTests"
        ]);
    });

})(jQuery);
