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

var linkedom = require("linkedom");

fluid.loadFrameworkPatch = function (path) {
    var fullPath = fluid.module.resolvePath(path);
    fluid.loadInContext(fullPath, true);
};

fluid.serverDocument = linkedom.parseHTML("<html />").document;

fluid.serverDocumentParser = function (text) {
    var document = linkedom.parseHTML(text).document;
    var fragment = document.createDocumentFragment();
    fragment.appendChild(document.firstElementChild);
    return fragment;
};

fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/jquery.standalone.renderer.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/fluidNewRenderer.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/fluidNewRendererComponents.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/htmlParser.js");
fluid.loadFrameworkPatch("%new-renderer-demo/src/js/core/ResourceRewriter.js");

require("./js/server/IncludeRewriting.js");
require("./js/server/PageHandler.js");
require("./js/server/RendererModuleLoader.js");
require("./js/server/ServerRenderer.js");
