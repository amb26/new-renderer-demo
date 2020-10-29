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

// TODO: support relative paths from point of view of requestor
fluid.renderer.loadModule = function (path) {
    console.log("RENDERER LOADMODULE for " + path);
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
        var jsFiles = fluid.makeArray(pkg.infusion.jsCommonFiles).concat(fluid.makeArray(pkg.infusion.jsServerFiles));
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

fluid.renderer.normaliseSimplePath = function (suffix) {
    // We could try to use path.normalize here but it will make a mess on Windows
    if (suffix.startsWith(".")) {
        return suffix.substring(1);
    } else if (!suffix.startsWith("/")) {
        return "/" + suffix;
    } else {
        return suffix;
    }
};

fluid.unslashify = function (path) {
    return typeof(path) === "string" && path.endsWith("/") ? path.slice(0, -1) : path;
};

fluid.setLogging(true);

// Generates dynamic component material with one "kettle.staticRequestHandlers.static" component for every
// loaded "fluid-renderer-module" Infusion module, which hosts its static content, and one
// "fluid.renderer.rewriting.request" requestHandler for every such module whose entry in the supplied
// moduleConfiguration has the rewriteUrls option set to true.
// This then gets interpolated
// into a dynamically generated grade applied to a Kettle app hosting the content.

fluid.renderer.generateMountOptions = function (moduleConfiguration) {
    var options = {};
    fluid.each(fluid.module.modulesByBundleType["fluid-renderer-module"], function (pkg, moduleName) {
        var camelName = fluid.renderer.hyphenToCamelCase(moduleName);
        var mountEntire = fluid.getImmediate(moduleConfiguration, [moduleName, "mountEntire"]);
        var staticMountBase = !mountEntire && pkg.infusion.staticMountBase || "./";
        var suffix = fluid.renderer.normaliseSimplePath(staticMountBase);
        // Note that "preferredMountPath" is now only functional for the static mount - the rewritten mount now defaults to "/" for easy user access
        var pkgPreferred = pkg.infusion.preferredMountPath;
        var preferredMountPath = fluid.isValue(pkgPreferred) ? fluid.unslashify(pkgPreferred) : "/" + camelName + "Static";

        var isRoot = preferredMountPath === "";
        var baseStaticHandlerOptions = {
            root: "%" + moduleName + suffix,
            prefix: preferredMountPath
        };
        var staticHandlerOptions = fluid.extend({}, baseStaticHandlerOptions, isRoot ? {
            priority: "last"
        } : {});
        var staticHandlerKey = camelName + "StaticHandler";
        fluid.model.setSimple(options, ["components", staticHandlerKey], {
            type: "kettle.staticRequestHandlers.static",
            options: staticHandlerOptions
        });
        fluid.log("Mounting module " + moduleName + " at path " + preferredMountPath);
        // TODO: some things can be specified in the package, such as "preferredMountPath" whereas some come from the
        // per-module configuration - these should be merged and/or rationalised
        // Recall that we decided against a "PHP-style" mounting whereby the rewritten versions of resources were
        // plastered on top of the static ones, but instead to keep them in separate areas
        var rewriteUrls = fluid.getImmediate(moduleConfiguration, [moduleName, "rewriteUrls"]);
        if (rewriteUrls) {
            var prefix = fluid.unslashify(fluid.getImmediate(rewriteUrls, "target")) || "";
            // TODO: Think about reading "source" member of rewriteUrls and sticking it on to mountedRoot
            fluid.model.setSimple(options, ["requestHandlers", camelName + "RewritingHandler"], {
                type: "fluid.renderer.rewriting.request",
                route: "/*.html",
                prefix: fluid.isValue(pkgPreferred) ? pkgPreferred : "",
                options: {
                    mountedRoot: staticHandlerOptions.root
                },
                method: "get",
                priority: "last" // see notes on FLUID-5948
            });
        }
    });
    return options;
};

// Horrific practice! Don't do this! In practice we need "grades as components", don't we - after all, how will we know when to clean them up?
fluid.renderer.staticMountsGradeName = "fluid.renderer.staticMountsGrade";

fluid.renderer.generateMountsGrade = function (moduleConfiguration) {
    fluid.defaults(fluid.renderer.staticMountsGradeName,
        fluid.renderer.generateMountOptions(moduleConfiguration));
    return fluid.renderer.staticMountsGradeName;
};

fluid.defaults("fluid.renderer.autoMountRendererModulesApp", {
    gradeNames: ["kettle.app", "{that}.generateMountsGrade"],
    invokers: {
        generateMountsGrade: {
            funcName: "fluid.renderer.generateMountsGrade",
            args: "{kettle.server}.options.moduleConfiguration"
        }
    }
});

fluid.defaults("fluid.renderer.autoMountRendererModulesServer", {
    gradeNames: "kettle.server",
    port: 8085,
    moduleConfiguration: {
        // hash of module name to record of options to be applied to the staticRequestHandler
        // Currently just accepts rewriteUrls: true for every module that wants rewriting
    },
    components: {
        app: {
            type: "fluid.renderer.autoMountRendererModulesApp"
        }
    }
});

fluid.defaults("fluid.renderer.rewriting.request", {
    gradeNames: "fluid.renderer.pageRequestHandler",
    sourcePagePath: "@expand:fluid.renderer.rewriting.getSourcePagePath({that}.options.mountedRoot, {that}.req.url)",
    distributeOptions: {
        target: "{that fluid.rootPage}.options.resources.template.path",
        // TODO: Make sure we don't take these out of options as threatened - since we'll then be unable to distribute
        // TODO: Options distribution system is insane - in its scheme of taking source material in unexpanded form and trying
        // to then ship it to the target  - this means that references into it will not resolve if it is itself a reference!
        // source: "{that}.options.req.url"
        record: "{fluid.renderer.rewriting.request}.options.sourcePagePath"
    }
});

fluid.renderer.rewriting.getSourcePagePath = function (mountedRoot, requestUrl) {
    var urlObj = new URL(requestUrl, "http://localhost/");
    var fsPath = fluid.module.resolvePath(mountedRoot) + urlObj.pathname;
    return fsPath;
};
