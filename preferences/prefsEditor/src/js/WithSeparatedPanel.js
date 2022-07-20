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
 * Separated Panel Preferences Editor *
 ***********************************/

// Addon grade for fluid.prefs.weaver/fluid.prefs.preferencesHolder
fluid.defaults("fluid.prefs.withSeparatedPanel", {
    gradeNames: "fluid.component",
    distributeOptions: {
        "withPreview.prefsEditor": {
            record: ["fluid.prefs.prefsEditor.withSeparatedPanel", "fluid.prefs.arrowScrolling"],
            target: "{that prefsEditor}.options.gradeNames"
        }
    }
});

// Addon grade for fluid.prefs.prefsEditor
fluid.defaults("fluid.prefs.prefsEditor.withSeparatedPanel", {
    gradeNames: "fluid.component",
    resources: {
        template: {
            path: "%fluid-prefs-editor/src/html/SeparatedPanelPrefsEditor.html"
        }
    }
});
