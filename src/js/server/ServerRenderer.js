
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
    gradeNames: "fluid.renderer.template",
    rootPageGrade: "fluid.serverRootPage", // Gets distributed onto the rootPage via linkage
    invokers: {
        render: {
            funcName: "fluid.renderer.server.render",
            args: ["{that}", "{kettle.staticMountIndexer}", "{arguments}.0", "{that}.options.markup.initBlockTemplate"]
        }
    },
    includeSelectorsToRewrite: ["link", "script"],
    markup: {
        initBlockTemplate: "fluid.renderer.initClientRenderer({\n  lightMerge: %lightMerge, \n  models: %models\n});"
    }
});

fluid.defaults("fluid.serverRootPage", {
    selectors: {
        // container: "{that}.options.container",
        // This selector is used to determine where to dump the <script> tag holding the initBlock for the client's
        // component tree - it will be deposited as the final child
        body: "body",
        // These selectors are used to rewrite module-relative includes within <head>
        link: "head link",
        script: "head script"
    },
    members: {
        container: "@expand:fluid.buildTemplateContainer({that})"
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

// Global workflow function collects together all renderer components nested under a renderer and dispatches them
// in groups, I/O and parsing will already have been achieved via "waitIO" in the workflow definition and the
// resource loader
fluid.renderer.server.render = function (renderer, staticMountIndexer, components, initBlockTemplate) {
    console.log("About to render " + components.length + " components to renderer " + fluid.dumpComponentPath(renderer));
    var rootComponent = components[0];
    if (!fluid.componentHasGrade(rootComponent, "fluid.rootPage")) {
        fluid.fail("Must render at least one component, the first of which should be descended from fluid.rootPage - "
           + " the head component was ", rootComponent);
    }

    components.forEach(function (component) {
        // Evaluating the container of each component will force it to evaluate and render into it
        fluid.getForComponent(component, "container");
        console.log("Considering component at " + fluid.dumpComponentPath(component));
        console.log("Container option is " + component.options.container);
    });

    var rootComponentDom = fluid.getForComponent(rootComponent, "dom");
    // Rewrite any module-relative includes
    var selectorsToRewrite = fluid.getForComponent(renderer, ["options", "includeSelectorsToRewrite"]);
    fluid.includeRewriting.rewriteTemplate(rootComponentDom, staticMountIndexer, selectorsToRewrite);

    if (components.length > 0) {
        var pageShadow = fluid.globalInstantiator.idToShadow[renderer.page.id];
        var pagePotentia = pageShadow.potentia;
        //console.log("Got PAGE POTENTIA ", fluid.prettyPrintJSON(fluid.censorKeys(pagePotentia, ["localRecord", "parentThat"])));
        var toMerges = pagePotentia.lightMerge.toMerge.filter(function (oneToMerge) {
            return oneToMerge.recordType !== "defaults" && oneToMerge.type !== "fluid.emptySubcomponent";
        }).map(function (oneToMerge) {
            return fluid.filterKeys(oneToMerge, ["type", "options"]);
        });

        var rootPath = fluid.pathForComponent(rootComponent);
        var models = components.map(function (component) {
            return {
                path: fluid.removePrefix(rootPath, fluid.pathForComponent(component)),
                model: component.model
            };
        });
        var initBlock = fluid.stringTemplate(initBlockTemplate, {
            lightMerge: JSON.stringify(toMerges, null, 2),
            models: JSON.stringify(models, null, 2)
        });

        var bodyNode = rootComponentDom.locate("body")[0];
        var scriptNode = {
            tagName: "script",
            children: [{
                text: initBlock
            }]
        };
        if (!bodyNode) {
            fluid.fail("Unable to render to root page template since no body tag was present");
        }
        bodyNode.children.push(scriptNode);
    }
    renderer.markupTree = rootComponent.container[0];
};
