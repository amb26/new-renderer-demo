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
    container: "{uiEnhancer}.container",
    preferencesMap: {
        "fluid.prefs.tableOfContents": {
            "model.toc": "value"
        }
    },
    dynamicComponents: { // TODO: relay the locale down into tableOfContents resourceLoader.locale field
        tableOfContents: {
            type: "fluid.tableOfContents",
            container: "{enactor}.container",
            source: "{enactor}.model.toc",
            options: {
                ignoreForToc: "{enactor}.options.ignoreForToc",
                listeners: { // Note similarity with fluid.containerRenderingView - our idiom is currently that container is static in document
                    "onDestroy.clearInjectedMarkup": {
                        "this": "{that}.dom.tocContainer",
                        method: "empty",
                        args: []
                    }
                }
            }
        }
    }
});
