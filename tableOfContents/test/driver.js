/**
 * Table of Contents Test Driver
 *
 * Copyright 2018 Raising The Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * You may obtain a copy of the License at
 * https://github.com/fluid-project/kettle/blob/master/LICENSE.txt
 */

/* eslint-env node */

"use strict";

var fluid = require("infusion");

fluid.require("%kettle");
fluid.require("%new-renderer-demo");

fluid.renderer.loadModule("%new-renderer-demo");

// This is a test driver that mounts the module in a little HTTP server (so that symbolic references in the HTML
// are resolved) so that its test cases may be run. In the end this facility will be exposed in some kind of automated
// way, e.g. via some form of testem plugin or npx script

// TODO: We have to load this in an odd way since it is not in a node_modules directory
fluid.renderer.loadModule("%new-renderer-demo/tableOfContents");

fluid.renderer.autoMountRendererModulesServer({
    moduleConfiguration: {
        "fluid-table-of-contents": {
            rewriteUrls: "/test/html",
            mountEntire: true
        }
    }
});
