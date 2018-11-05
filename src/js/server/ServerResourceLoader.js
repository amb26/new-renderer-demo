/*
Copyright 2018 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid = require("infusion"),
    kettle = fluid.require("%kettle"),
    fs = require("fs");
    
fluid.registerNamespace("fluid.resourceLoader.loaders");

// Quick synchronous mockup of file resource fetcher before we have FLUID-4982
fluid.resourceLoader.loaders.path = function (resourceSpec) {
    var resourcePath = fluid.module.resolvePath(resourceSpec.path);
    var resourceText = fs.readFileSync(resourcePath, resourceSpec.charEncoding || "utf8");
    return resourceText;
};
