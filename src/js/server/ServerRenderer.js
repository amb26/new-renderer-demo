
/**
 * Renderer Markup Page Handler
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
fluid.require("%kettle");

// TODO: Perhaps "server renderer" functions could be split up better between i) full-page isomorphic renderer
// ii) merely doing head URL rewriting, iii) rendering to node in existing page

// One of these is created by every "PageHandler" and it expects to be the parent of all rendered components

fluid.defaults("fluid.renderer.server", {
    gradeNames: "fluid.renderer",
    rootPageGrade: "fluid.serverRootPage", // Gets distributed onto the rootPage via linkage
    listeners: {
        "render.server": {
            funcName: "fluid.renderer.server.render",
            args: ["{that}", "{kettle.staticMountIndexer}", "{arguments}.0", "{that}.options.markup"],
            priority: "after:render"
        }
    },
    includeSelectorsToRewrite: ["link", "script"],
    markup: {
        initBlockTemplate: "fluid.renderer.initBlockClientRenderer({\n  lightMerge: %lightMerge, \n  models: %models\n});",
        modulePathToURLTemplate: "fluid.resourceLoader.staticMountTable = %mountTable;\n"
    }
});

fluid.defaults("fluid.serverRootPage", {
    selectors: {
        // This selector is used to determine where to dump the <script> tag holding the initBlock for the client's
        // component tree - it will be deposited as the final child
        body: "body",
        // These selectors are used to rewrite module-relative includes within <head>
        link: "head link",
        script: "head script"
    },
    includeTemplateRoot: true,
    parentMarkup: true, // Don't try to template in during rendering because we directly adopt the template as root node below
    skipTemplateFetch: false,
    container: "@expand:fluid.cloneDom({that}.resources.template.parsed.element)"
});

fluid.removePrefix = function (prefix, segs) {
    for (var i = 0; i < prefix.length; ++i) {
        if (segs[i] !== prefix[i]) {
            fluid.fail("Error in fluid.removePrefix - ", prefix, " is not a prefix for path ", segs);
        }
    }
    return segs.slice(prefix.length);
};

// Don't bother to transmit the materialised DOM model to the client
fluid.renderer.server.censorDomModel = function (model) {
    return model ? fluid.censorKeys(model, ["dom"]) : model;
};

/** Adds a templated <script> block as a child of the supplied node.
 * @param {Element} bodyNode - The node to which the <script> block is to be added
 * @param {String} template - A template for the block's code, as supplied to `fluid.stringTemplate`
 * @param {Object} terms - A hash of terms to be interpolated into the template
 * @param {Node|Null} insertBefore - The child of `bodyNode` before which the script is to be inserted,
 * or `null` if it should be added as the last child of `bodyNode`
 */
fluid.renderer.server.addScriptTemplate = function (bodyNode, template, terms, insertBefore) {
    var script = "<script>" + fluid.stringTemplate(template, fluid.transform(terms, function (term) {
        return JSON.stringify(term, null, 2);
    })) + "</script>";

    var scriptNode = fluid.htmlParser.parseMarkup(script, true);
    bodyNode.insertBefore(scriptNode, insertBefore);
};

// Global workflow function collects together all renderer components nested under a renderer and dispatches them
// in groups, I/O and parsing will already have been achieved via "waitIO" in the workflow definition and the
// resource loader
fluid.renderer.server.render = function (renderer, staticMountIndexer, shadows, markup) {
    var rootComponent = shadows[0].that;
    if (!fluid.componentHasGrade(rootComponent, "fluid.rootPage")) {
        fluid.fail("Must render at least one component, the first of which should be descended from fluid.rootPage - "
           + " the head component was ", rootComponent);
    }
    var rootComponentDom = fluid.getForComponent(rootComponent, "dom");
    // Rewrite any module-relative includes
    var selectorsToRewrite = fluid.getForComponent(renderer, ["options", "includeSelectorsToRewrite"]);
    fluid.includeRewriting.rewriteTemplate(rootComponentDom, staticMountIndexer.mountTable, selectorsToRewrite);

    var bodyNode = rootComponentDom.locate("body")[0];

    if (!bodyNode) {
        fluid.fail("Unable to render to root page template since no body tag was present");
    }

    fluid.renderer.server.addScriptTemplate(bodyNode, markup.modulePathToURLTemplate, {
        mountTable: staticMountIndexer.mountTable
    }, bodyNode.firstChild);

    if (shadows.length > 1) {
        var pageShadow = fluid.globalInstantiator.idToShadow[renderer.page.id];
        var pagePotentia = pageShadow.potentia;
        //console.log("Got PAGE POTENTIA ", fluid.prettyPrintJSON(fluid.censorKeys(pagePotentia, ["localRecord", "parentThat"])));
        // TODO: in CLEAN ROOM INFUSION (or earlier) create a scheme for recovering the actual original user gesture potentia -
        // How the Mike do distributions get in there?
        var toMerges = pagePotentia.lightMerge.toMerge.filter(function (oneToMerge) {
            return oneToMerge.recordType !== "defaults" && oneToMerge.recordType !== "distribution" && oneToMerge.type !== "fluid.emptySubcomponent";
        }).map(function (oneToMerge) {
            return fluid.filterKeys(oneToMerge, ["type", "options"]);
        });
        // This doesn't seem right, but otherwise we end up with "type": "{pageHandler}.options.pageGrade"
        var expandedMerges = fluid.expandImmediate(toMerges, pageShadow.that);

        var rootPath = fluid.pathForComponent(rootComponent);
        var models = shadows.map(function (shadow) {
            return {
                path: fluid.removePrefix(rootPath, fluid.globalInstantiator.parseEL(shadow.path)),
                model: fluid.renderer.server.censorDomModel(shadow.that.model)
            };
        }).filter(function (rec) {
            return rec.model !== undefined;
        });

        fluid.renderer.server.addScriptTemplate(bodyNode, markup.initBlockTemplate, {
            lightMerge: expandedMerges,
            models: models
        }, null);
    }
};
