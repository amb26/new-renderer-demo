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

/** Rewrites <script and <link includes throughout a (git) project in order to resolve them onto physical paths in a
 * npm-installed package tree. This is a development convenience to allow development and running of test cases
 * against files in the filesystem without having to run a special server local to a micromodule or a build process on
 * every edit.
 * The action of this script is idempotent, and for any header tags of <script-symbolic and <link-symbolic,
 * a resolved <script and <link tag is output pointing at the module's path in the filesystem, specially marked
 * with an attribute "synthetic" to allow rewriting these on a further pass.
 * In addition, a module index file infusionModuleIndex.js is generated in the root holding a fluid.resourceLoader.staticMountTable
 * global, which is used by renderer components to resolve symbolic references to their own resource.
 *
 * The index will need to be regenerated whenever a file or module is moved between directories, or when an include is
 * added or removed from a file.
 *
 * When we have completed the work of the Infusion 5 build system, this table will be integrated into WebPack or Rollup's
 * equivalent facilities.
 */


"use strict";

var fs = require("fs"),
    glob = require("glob"),
    linkedom = require("linkedom"),
    fluid = require("infusion");

var local = glob.sync("!(node_modules)/**/package.json");

var direct = glob.sync("node_modules/*/package.json");

var allpkgs = ["package.json"].concat(local).concat(direct);

var moduleTable = {};

allpkgs.forEach(function (file) {
    var pkg = require("./" + file);
    if (pkg.infusion || pkg.name === "infusion") {
        console.log("Infusion module " + pkg.name + " at " + file);
        moduleTable[pkg.name] = file.substring(0, file.length - "package.json".length);
    }
});

console.log("Got moduleTable", moduleTable);

var writeFile = function (filename, data) {
    fs.writeFileSync(filename, data, "utf8");
    var stats = fs.statSync(filename);
    console.log("Written " + stats.size + " bytes to " + filename);
};

var staticMountTable = fluid.hashToArray(moduleTable, "moduleName", function (newEl, el) {
    newEl.suffix = "";
    newEl.prefix = el;
});

// This function is copied into the header script
var rebaseModuleIndex = function () {
    var indexScript = document.querySelector("script[module-index]");
    var src = indexScript.getAttribute("src");
    var prefix = src.substring(0, src.indexOf("infusionModuleIndex.js"));
    if (fluid.resourceLoader) {
        fluid.resourceLoader.staticMountTable = fluid.infusionModuleIndex.map(function (entry) {
            var togo = Object.assign({}, entry);
            togo.prefix = prefix + togo.prefix;
            return togo;
        });
    }
};


writeFile("./infusionModuleIndex.js", "\"use strict\";\n\nvar fluid = fluid || {};\nfluid.infusionModuleIndex = " + JSON.stringify(staticMountTable, null, 4)
    + ";\n(" + rebaseModuleIndex.toString() + ")();\n");

var htmls = glob.sync("{!(node_modules)/**/*.html,*.html}");

var templateRegex = /%([\w-_\.]*)\//g; // Note we have an extra / at the end of this pattern to replace only e.g. %infusion/

var stringTemplate = function (template, func) {
    var replacer = function (all, match) {
        return func(match);
    };
    return template.replace(templateRegex, replacer);
};

var fileToRelative = function (fileName, suffix) {
    var lastdotpos = fileName.lastIndexOf(".");
    return fileName.substring(0, lastdotpos) + suffix;
};

var normaliseWhitespace = function (white) {
    return "\n" + white.match(/[^\S\n\r]*$/) || "";
};

var addSyntheticNode = function (document, relative, tag, attr, value) {
    var extra = document.createElement(tag);
    extra.setAttribute(attr, value);
    // We can't get linkdom to output a blind attribute "synthetic" so use this hack instead
    extra.setAttribute("synthetic", "PLACEHOLDER_NULL");
    relative.parentNode.insertBefore(extra, relative.nextSibling);
    return extra;
};

var addWhitespaceNode = function (document, relative, newWhite) {
    var extraWhite = document.createTextNode();
    extraWhite.textContent = newWhite;
    relative.parentNode.insertBefore(extraWhite, relative);
};

var rewriteTags = function (document, tag, attr, prefix, lastNodeHolder) {
    var symbolic = document.querySelectorAll(tag + "-symbolic");
    if (symbolic.length > 0) {
        var synthetic = document.querySelectorAll(tag + "[synthetic]");
        fluid.each(synthetic, function (oneSynth) {
            var prev = oneSynth.previousSibling;
            if (prev.nodeType === 3) {
                prev.remove();
            }
            oneSynth.remove();
        });

        fluid.each(symbolic, function (oneSymbol) {
            var src = oneSymbol.getAttribute(attr);
            var replaced = stringTemplate(src, function (match) {
                var looked = moduleTable[match];
                return prefix + looked;
            });
            var extra = addSyntheticNode(document, oneSymbol, tag, attr, replaced);
            fluid.each(oneSymbol.attributes, function (oneAttr) {
                if (oneAttr.name !== attr) {
                    extra.setAttribute(oneAttr.name, oneAttr.value);
                }
            });
            var newWhite = normaliseWhitespace(oneSymbol.previousSibling.textContent) + "    ";
            addWhitespaceNode(document, extra, newWhite);

            lastNodeHolder.lastNode = extra;
            lastNodeHolder.lastWhite = newWhite;
        });
    }
    return symbolic.length;
};



fluid.each(htmls, function (htmlFileName) {
    console.log("Parsing " + htmlFileName);
    var text = fs.readFileSync(htmlFileName, "utf8");
    var depth = htmlFileName.split("/").length - 1;
    var prefix = fluid.generate(depth, "../").join("");
    var document = linkedom.parseHTML(text).document;
    var lastNodeHolder = {};
    var links = rewriteTags(document, "link", "href", prefix, lastNodeHolder);
    var scripts = rewriteTags(document, "script", "src", prefix, lastNodeHolder);
    if (scripts + links > 0) {
        // Output the special script tag for loading the module index after the last rewritten script
        var extra = addSyntheticNode(document, lastNodeHolder.lastNode, "script", "src", prefix + "infusionModuleIndex.js");
        extra.setAttribute("module-index", "PLACEHOLDER_NULL");
        addWhitespaceNode(document, extra, lastNodeHolder.lastWhite);

        var outFile = fileToRelative(htmlFileName, "-out.html");
        var data = "<!DOCTYPE html>\n" + document.documentElement.outerHTML + "\n";
        var dataR = data.replace(/=\"PLACEHOLDER_NULL\"/g, "");

        writeFile(outFile, dataR);
        fs.unlinkSync(htmlFileName);
        fs.renameSync(outFile, htmlFileName);
    }
});
