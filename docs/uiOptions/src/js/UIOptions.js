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

fluid.defaults("fluid.uiOptions", {
    gradeNames: ["fluid.prefs.weaver", "fluid.viewComponent"],
    prefsEditorContainer: "{that}.options.container",
    model: {
        prefsEditor: true
    },
    autoSave: true
});

/** A configuration of UIOptions which is suitable for statically localised contexts. It accepts two additional
 * top-level options, both of which are optional
 * {String} [locale] - The initial locale in which UIOptions should render
 * {String} [direction] - A suitable value for the `dir` attribute of the UIOptions container - this may take
 * values `ltr`, `rtl` or `auto`
 */
fluid.defaults("fluid.uiOptions.multilingual", {
    gradeNames: ["fluid.uiOptions"],
    prefsEditorLoader: {
        defaultLocale: "{that}.options.locale"
    },
    listeners: {
        "onPrefsEditorReady.addLanguageAttributesToBody": {
            "this": "{that}.prefsEditorLoader.prefsEditor.container",
            method: "attr",
            args: {
                lang: "{that}.options.locale",
                dir: "{that}.options.direction"
            },
            priority: "first"
        }
    }
});
