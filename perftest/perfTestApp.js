/**
 * New Renderer Performance Test App
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

require("../src/serverRendererIndex.js");

fluid.renderer.loadModule("%new-renderer-demo");
fluid.renderer.loadModule("%new-renderer-demo/perftest");

fluid.renderer.autoMountRendererModulesServer({
    moduleConfiguration: {
        "fluid-renderer-perftest": {
            rewriteUrls: true
        }
    }
});
