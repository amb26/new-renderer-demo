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

// TODO: There is a site in tests and also in example.prefs.localization which sets localizationScheme and uses
// all this infrastructure

"use strict";

// There is an example at /fluid-infusion-master/examples/framework/preferences/localizationPreference/urlPath/js/localization which
// derives from this - it defines a example.prefs.localization which in the end is applied as a mixin to
// example.prefs.localization.localized.prefsEditor, the overall prefsEditor grade

fluid.defaults("fluid.prefs.localizationPrefsEditorConfig", {
    gradeNames: ["fluid.contextAware"],
    contextAwareness: {
        localeChange: {
            checks: {
                urlPath: {
                    contextValue: "{localizationPrefsEditorConfig}.options.localizationScheme",
                    equals: "urlPath",
                    gradeNames: "fluid.prefs.localizationPrefsEditorConfig.urlPathLocale"
                }
            }
        }
    },
    distributeOptions: {
        "prefsEditor.localization.enactor.localizationScheme": {
            source: "{that}.options.localizationScheme",
            target: "{that uiEnhancer fluid.prefs.enactor.localization}.options.localizationScheme"
        },
        "prefsEditor.localization.panel.locales": {
            source: "{that}.options.locales",
            target: "{that prefsEditor fluid.prefs.panel.localization}.options.controlValues.localization"
        },
        "prefsEditor.localization.panel.localeNames": {
            source: "{that}.options.localeNames",
            target: "{that prefsEditor fluid.prefs.panel.localization}.options.stringArrayIndex.localization"
        }
    }
});

fluid.defaults("fluid.prefs.localizationPrefsEditorConfig.urlPathLocale", {
    distributeOptions: {
        "prefsEditor.localization.enactor.langMap": {
            source: "{that}.options.langMap",
            target: "{that uiEnhancer fluid.prefs.enactor.localization}.options.langMap"
        },
        "prefsEditor.localization.enactor.langSegIndex": {
            source: "{that}.options.langSegIndex",
            target: "{that uiEnhancer fluid.prefs.enactor.localization}.options.langSegIndex"
        }
    }
});
