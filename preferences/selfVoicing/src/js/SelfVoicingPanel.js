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

/**********************************************************************************
* speakPanel
**********************************************************************************/
fluid.defaults("fluid.prefs.panel.selfVoicing", {
    gradeNames: ["fluid.prefs.panel.switchAdjuster"],
    container: ".flc-prefsEditor-selfVoicing",
    preferencesMap: {
        "fluid.prefs.speak": {
            "model.value": "value"
        }
    },
    resources: {
        template: {
            path: "%fluid-prefs-self-voicing/src/html/SelfVoicing.html"
        },
        messages: {
            path: "%fluid-prefs-self-voicing/src/messages/selfVoicing.json"
        }
    }
});
