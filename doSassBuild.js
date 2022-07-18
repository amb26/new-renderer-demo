"use strict";

var fs = require("fs"),
    glob = require("glob"),
    sass = require("sass"),
    fluid = require("infusion");

fluid.registerNamespace("fluid.module");

fluid.module.findModulesOfType = function (packageFileNames) {
    var modulesOfType = {};

    packageFileNames.forEach(function (fileName) {
        var pkg = require("./" + fileName);
        if (pkg.infusion) {
            var bundleTypes = pkg.infusion.bundleType = fluid.makeArray(pkg.infusion.bundleType);
            var basePath = fileName.substring(0, fileName.length - "package.json".length);
            bundleTypes.forEach(function (bundleType) {
                fluid.set(modulesOfType, [bundleType, pkg.name], {
                    pkg: pkg,
                    basePath: basePath
                });
            });
            console.log("Infusion module " + pkg.name + " at " + basePath);
        }
    });

    return modulesOfType;
};

fluid.module.pathParser = /(.+[\/\\])*(.+)\.(.+)/;

fluid.module.parseFileName = function (fileName) {
    var matched = fileName.match(fluid.module.pathParser);
    return {
        path: matched[1],
        baseName: matched[2],
        ext: matched[3]
    };
};

var local = glob.sync("!(node_modules)/**/package.json");

fluid.module.modulesOfType = fluid.module.findModulesOfType(local);

console.log(fluid.module.modulesOfType);

var preferenceModules = fluid.module.modulesOfType["fluid-preference-module"];

fluid.module.defaultSassOptions = {
//    outputStyle: "compressed"
};

/** Compile a single SASS file, writing the output CSS to the parent "css" directory together with a
 * matching source map
 * @param {String} sourcePath - The absolute path to the SASS file
 * @param {String[]} includePaths - The directories to be placed on the compiler's include path
 * @param {Object} [userOptions] - Any additional options to be passed to the compiled
 */
fluid.module.compileOneSass = function (sourcePath, includePaths, userOptions) {
    var parsed = fluid.module.parseFileName(sourcePath);
    if (parsed.path.endsWith("/sass/") || parsed.path.endsWith("\\sass\\")) {
        var parentDir = parsed.path.slice(0, -"/sass/".length) + "/";
        var outFile = parentDir + parsed.baseName + ".css";
        var sourceMap = parentDir + parsed.baseName + ".css.map";
        var options = fluid.extend({}, fluid.module.defaultSassOptions, {
            file: sourcePath,
            outFile: outFile,
            sourceMap: sourceMap,
            includePaths: includePaths || []
        }, userOptions);
        var compiled = sass.renderSync(options);
        console.log("Compiled to CSS of length", compiled.css.length);
        console.log("Writing to " + outFile);
        fs.writeFileSync(outFile, compiled.css);
        console.log("Writing to " + sourceMap);
        fs.writeFileSync(sourceMap, compiled.map);
    } else {
        fluid.fail("Unexpected SASS file name " + sourcePath + " - should be placed in directory named \"sass\"");
    }
};

fluid.module.compileSassDir = function (sassDir, includePaths, userOptions) {
    var allSass = glob.sync(sassDir + "*.scss");
    console.log("Compiling files ", allSass);
    allSass.forEach(function (oneSass) {
        fluid.module.compileOneSass(oneSass, includePaths, userOptions);
    });
};

var sassDirs = Object.values(preferenceModules).map(function (module) {
    return module.basePath + "src/css/sass/";
});

sassDirs.forEach(function (sassDir) {
    fluid.module.compileSassDir(sassDir, sassDirs);
});

fluid.module.compileSassDir("preferences/prefsEditor/src/css/sass/", sassDirs);
