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

// add extra prefs to the starter primary schemas
fluid.defaults("demo.schemas.simplify", {
    gradeNames: ["fluid.prefs.schema"],
    schema: {
        "demo.prefs.simplify": {
            "type": "boolean",
            "default": false
        }
    }
});

/**********************************************************************************
 * simplifyPanel
 **********************************************************************************/

fluid.defaults("demo.prefsEditor.simplifyPanel", {
    gradeNames: ["fluid.prefs.panel.switchAdjuster"],
    container: ".demo-simplifyPanel",
    preferencesMap: {
        "demo.prefs.simplify": {
            "model.value": "value"
        }
    },
    resources: {
        template: {
            path: "%fluid-prefs-demo/html/SimplifyPanelTemplate.html"
        },
        messages: {
            path: "%fluid-prefs-demo/messages/simplify.json"
        }
    }
});

/**********************************************************************************
 * simplifyEnactor
 *
 * Simplify content based upon the model value.
 *
 * This component is added as an example of how simplification may appear.
 * However, the following code does not provide a generalized solution that
 * can be easily used across sites.
 **********************************************************************************/
fluid.defaults("demo.prefsEditor.simplifyEnactor", {
    gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
    preferencesMap: {
        "demo.prefs.simplify": {
            "model.simplify": "value"
        }
    },
    container: "body",
    styles: {
        simplified: "demo-content-simplified"
    },
    model: {
        simplify: false
    },
    modelRelay: {
        source: "{that}.model.simplify",
        target: {
            segs: ["dom", "container", "class", "{that}.options.styles.simplified"]
        }
    }
});
