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

fluid.defaults("fluid.prefs.starterPanelHolder", {
    components: {
        textSize: {
            type: "fluid.prefs.panel.textSize"
        },
        textFont: {
            type: "fluid.prefs.panel.textFont"
        },
        lineSpace: {
            type: "fluid.prefs.panel.lineSpace"
        },
        contrast: {
            type: "fluid.prefs.panel.contrast"
        },
        tableOfContents: {
            type: "fluid.prefs.panel.tableOfContents"
        },
        enhanceInputs: {
            type: "fluid.prefs.panel.enhanceInputs"
        }
    }
});
