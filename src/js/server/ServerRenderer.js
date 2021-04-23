
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

// TODO: Factor "server renderer" into genuine server full-page renderer and one which merely applies a template
// representation
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
    members: {
        container: "@expand:fluid.renderer.buildTemplateContainer({that})"
    }
});

fluid.removePrefix = function (prefix, segs) {
    for (var i = 0; i < prefix.length; ++i) {
        if (segs[i] !== prefix[i]) {
            fluid.fail("Error in fluid.removePrefix - ", prefix, " is not a prefix for path ", segs);
        }
    }
    return segs.slice(prefix.length);
};

fluid.renderer.server.scriptToNode = function (script) {
    return {
        tagName: "script",
        children: [{
            text: script
        }]
    };
};

fluid.renderer.server.addScriptTemplate = function (bodyNode, template, terms, method) {
    method = method || "push";
    var script = fluid.stringTemplate(template, fluid.transform(terms, function (term) {
        return JSON.stringify(term, null, 2);
    }));

    var scriptNode = fluid.renderer.server.scriptToNode(script);
    bodyNode.children[method](scriptNode);
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
    }, "unshift");

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

        var rootPath = fluid.pathForComponent(rootComponent);
        var models = shadows.map(function (shadow) {
            return {
                path: fluid.removePrefix(rootPath, fluid.globalInstantiator.parseEL(shadow.path)),
                model: shadow.that.model
            };
        });

        fluid.renderer.server.addScriptTemplate(bodyNode, markup.initBlockTemplate, {
            lightMerge: toMerges,
            models: models
        }, "push");
    }
    renderer.markupTree = rootComponent.container[0];
};
