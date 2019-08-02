/**
 * Renderer Module Loader
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

fluid.registerNamespace("fluid.renderer");

// TODO: This to go into Infusion - which will then indirect to fluid.renderer.loadModule via bundleType
fluid.module.modulesByBundleType = {};

fluid.module.registerModuleBundle = function (pkg) {
    fluid.set(fluid.module.modulesByBundleType, [pkg.infusion.bundleType, pkg.name],
        fluid.filterKeys(pkg, ["name", "version", "infusion"]));
};

fluid.renderer.loadModule = function (path) {
    var basePath = fluid.module.resolvePath(path);
    var pkg = require(basePath + "/package.json");
    if (!pkg) {
        fluid.fail("Cannot find package.json file at path " + basePath);
    } else {
        if (!pkg.infusion) {
            fluid.fail("Cannot load renderer module without \"infusion\" section in package.json");
        }
        if (pkg.infusion.bundleType !== "fluid-renderer-module") {
            fluid.fail("Cannot load renderer module which does not have bundle type of \"fluid-renderer-module\"" +
               " - actual bundle type was ", pkg.infusion.bundleType);
        }
        var moduleName = pkg.name;
        fluid.module.register(moduleName, basePath);
        var jsFiles = pkg.infusion.jsFiles;
        fluid.each(jsFiles, function (jsFile) {
            fluid.loadInContext(basePath + "/" + jsFile, true);
        });
        fluid.module.registerModuleBundle(pkg);
    }
};

// This will go into Infusion's package.json
fluid.renderer.imputedInfusionPkg = {
    name: "infusion",
    version: "3.0.0",
    infusion: {
        bundleType: "fluid-renderer-module",
        staticMountBase: "./"
    }
};

fluid.module.registerModuleBundle(fluid.renderer.imputedInfusionPkg);

fluid.renderer.hyphenToCamelCase = function (hyphenName) {
    // from https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
    return hyphenName.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
};

fluid.renderer.generateStaticMounts = function () {
    var mounts = {};
    fluid.each(fluid.module.modulesByBundleType["fluid-renderer-module"], function (pkg, moduleName) {
        var camelName = fluid.renderer.hyphenToCamelCase(moduleName);
        var staticMountBase = pkg.infusion.staticMountBase || "./";
        // We could try to use path.normalize here but it will make a mess on Windows
        var suffix = staticMountBase === "./" || staticMountBase === "." ? "" : staticMountBase;
        mounts[camelName + "StaticHandler"] = {
            type: "kettle.staticRequestHandlers.static",
            options: {
                root: "%" + moduleName + suffix,
                prefix: "/" + camelName + "Static"
            }
        };
    });
    return mounts;
};

fluid.renderer.staticMountsGradeName = "fluid.renderer.staticMountsGrade";

fluid.renderer.generateStaticMountsGrade = function () {
    fluid.defaults(fluid.renderer.staticMountsGradeName, {
        components: fluid.renderer.generateStaticMounts()
    });
    return fluid.renderer.staticMountsGradeName;
};

fluid.defaults("fluid.renderer.autoMountRendererModulesApp", {
    gradeNames: "{that}.generateStaticMountsGrade",
    invokers: {
        generateStaticMountsGrade: {
            funcName: "fluid.renderer.generateStaticMountsGrade"
        }
    }
});
