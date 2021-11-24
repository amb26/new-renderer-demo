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


// Note that the implementors need to provide the container for this view component
fluid.defaults("fluid.prefs.enactor.tableOfContents", {
    gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
    preferenceMap: {
        "fluid.prefs.tableOfContents": {
            "model.toc": "value"
        }
    },
    components: {
        tableOfContents: {
            type: "fluid.tableOfContents",
            container: "{fluid.prefs.enactor.tableOfContents}.container",
            source: "{enactor}.model.toc"
        }
    },
    distributeOptions: {
        "tocEnactor.tableOfContents.ignoreForToC": {
            source: "{that}.options.ignoreForToC",
            target: "{that tableOfContents}.options.ignoreForToC"
        }
    }
});
