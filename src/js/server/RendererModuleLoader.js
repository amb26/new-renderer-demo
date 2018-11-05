/**
 * Renderer Markup Handler
 *
 * Copyright 2018 Raising The Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * You may obtain a copy of the License at
 * https://github.com/fluid-project/kettle/blob/master/LICENSE.txt
 */

"use strict";

var fluid = require("infusion"),
    kettle = fluid.require("%kettle");

fluid.registerNamespace("fluid.renderer");

fluid.renderer.loadModule = function (path) {
    var basePath = fluid.module.resolvePath(path);
    var pkg = require(basePath + "/package.json");
    if (!pkg) {
        fluid.fail("Cannot find package.json file at path " + basePath);  
    } else {
        var moduleName = pkg.name;
        fluid.module.register(moduleName, basePath)
        var jsFiles = fluid.get(pkg, ["infusion", "jsFiles"]);
        fluid.each(jsFiles, function (jsFile) {
            fluid.loadInContext(basePath + "/" + jsFile, true);
        });
    }
};
