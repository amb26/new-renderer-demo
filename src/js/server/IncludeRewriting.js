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

var fluid = require("infusion");

fluid.registerNamespace("fluid.includeRewriting");

fluid.includeRewriting.tagToHref = {
    "link": "href",
    "script": "src"
};

fluid.includeRewriting.rewriteUrl = function (node, attrName, mountTable) {
    var href = node.attrs[attrName];
    var rewritten = fluid.resourceLoader.rewriteUrlWithDiagnostic(mountTable, href);
    node.attrs[attrName] = rewritten;
};

/** Rewrite the URLs attached to all appropriate nodes in the template's head from module-relative to paths as
 * hosted by the server.
 * @param {DomBinder} dom - The DOM binder locating the nodes to be rewritten
 * @param {MountTableEntry[]} mountTable - Array of MountTableEntry records originally from the `kettle.staticMountIndexer` component
 * @param {String[]} selectorsToRewrite - The DOM binder selector names matching the nodes to be rewritten
 */
fluid.includeRewriting.rewriteTemplate = function (dom, mountTable, selectorsToRewrite) {
    selectorsToRewrite.forEach(function (selector) {
        var nodes = dom.locate(selector);
        nodes.forEach(function (node) {
            var attrName = fluid.includeRewriting.tagToHref[node.tagName];
            fluid.includeRewriting.rewriteUrl(node, attrName, mountTable);
        });
    });
};
