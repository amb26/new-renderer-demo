/*
Copyright 2018-2019 Raising the Floor - International
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle");

fluid.registerNamespace("fluid.includeRewriting");

fluid.includeRewriting.tagToHref = {
    "link": "href",
    "script": "src"
};

fluid.includeRewriting.dumpMounts = function (mountTable) {
    return fluid.transform(mountTable, function (mount) {
        return "%" + mount.moduleName + "/" + mount.suffix;
    }).join(", ");
};

fluid.includeRewriting.rewriteUrl = function (node, attrName, staticMountIndexer) {
    var href = node.attrs[attrName];
    var rewritten = kettle.staticMountIndexer.rewriteUrl(staticMountIndexer, href);
    if (rewritten === null) {
        fluid.fail("Request for module-relative path " + href +
            " which can't be resolved into a static mount - available module mounts are " +
            fluid.includeRewriting.dumpMounts(staticMountIndexer.mountTable));
    } else {
        console.log("Rewriting " + attrName + " to " + rewritten);
        node.attrs[attrName] = rewritten;
    }
};

/** Rewrite the URLs attached to all appropriate nodes in the template's head from module-relative to paths as
 * hosted by the server.
 * @param {DomBinder} dom - The DOM binder locating the nodes to be rewritten
 * @param {kettle.staticMountIndexer} staticMountIndexer - The `kettle.staticMountIndexer` for this server
 * @param {String[]} selectorsToRewrite - The DOM binder selector names matching the nodes to be rewritten
 */
fluid.includeRewriting.rewriteTemplate = function (dom, staticMountIndexer, selectorsToRewrite) {
    selectorsToRewrite.forEach(function (selector) {
        var nodes = dom.locate(selector);
        nodes.forEach(function (node) {
            var attrName = fluid.includeRewriting.tagToHref[node.tagName];
            fluid.includeRewriting.rewriteUrl(node, attrName, staticMountIndexer);
        });
    });
};
