/**
 * Server Renderer Bootstrap
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

fluid.loadFrameworkPatch = function (path) {
    var fullPath = fluid.module.resolvePath(path);
    fluid.loadInContext(fullPath, true);
};


// fluid.loadFrameworkPatch("%new-renderer-demo/src/js/server/jquery.standalone.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/server/jquery.standalone.renderer.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/FluidView-template.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/fluidNewRenderer.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/fluidNewRendererComponents.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/htmlParser.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/fastXmlPull.js");

require("./js/server/IncludeRewriting.js");
require("./js/server/PageHandler.js");
require("./js/server/RendererModuleLoader.js");
require("./js/server/ServerRenderer.js");
