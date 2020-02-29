/*
Copyright 2019 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    // Full-page "client renderer" which accepts an init block as rendered from the server, which insists that the
    // page's markup should correspond to that required, and constructs a matching model skeleton

    fluid.defaults("fluid.renderer.client", {
        gradeNames: "fluid.renderer.browser",
        rootPageGrade: "fluid.clientRootPage",
        invokers: {
            render: {
                funcName: "fluid.renderer.client.render",
                args: ["{that}", "{arguments}.0"]
            }
        },
        // broadcastParentMarkup: true,
        distributeOptions: {
            broadcastParentMarkup: {
                source: "{that}.options.broadcastParentMarkup",
                target: "{that fluid.newRendererComponent}.options.parentMarkup"
            }
        }
    });


    fluid.defaults("fluid.clientRootPage", {
        // No reason why this can't specify "html" directly to avoid hard-coding fluid.container.
        // container: "html",
        members: {
            // Re-override container definition from newRendererComponent with one from fluid.newViewComponent again
            // This will interpret the container spec of "/" in fluid.rootPage as a designation of an <html> root element
            container: "@expand:fluid.container({that}.options.container)"
        }
    });

    fluid.renderer.pathToSkeletonPath = function (segs) {
        var outSegs = [];
        segs.forEach(function (seg) {
            outSegs.push.apply(outSegs, ["options", "components", seg]);
        });
        outSegs.push("model");
        return outSegs;
    };

    fluid.renderer.modelsToSkeleton = function (models) {
        var togo = {};
        models.forEach(function (modelRec) {
            var skeletonPath = fluid.renderer.pathToSkeletonPath(modelRec.path);
            fluid.set(togo, skeletonPath, modelRec.model);
        });
        return togo;
    };

    fluid.renderer.clientRendererPath = "clientRenderer";


    // Client side initBlock "driver" function which accepts the "care package" from the server and uses it to
    // reconstruct whatever component tree needs to be built against the already-correct markup. It sets
    // "parentMarkup" to true for every component to prevent it from attempting to render again.
    fluid.renderer.initClientRenderer = function (config) {
        var rendererPotentia = {
            path: fluid.renderer.clientRendererPath,
            type: "create",
            records: [{
                type: "fluid.renderer.client",
                options: {
                    broadcastParentMarkup: true
                },
                recordType: "user"
            }]
        };
        var transRec = fluid.registerPotentia(rendererPotentia);
        // TODO: In the full Whiteheadian future we will have to invent a new recordType in order to express that this
        // initial model skeleton is not intended to be homeostatic
        var skeletonRecord = {
            recordType: "user",
            options: fluid.renderer.modelsToSkeleton(config.models)
        };
        var lightMergeRecords = fluid.transform(config.lightMerge, function (oneLightMerge) {
            return $.extend({recordType: "user"}, oneLightMerge);
        });
        var pagePotentia = {
            path: [fluid.renderer.clientRendererPath, "rootPage"],
            type: "create",
            records: lightMergeRecords.concat([skeletonRecord])
        };
        fluid.registerPotentia(pagePotentia, transRec.transactionId);
        fluid.commitPotentiae(transRec.transactionId);
        transRec.promise.then(null, function (err) {
            fluid.log.apply(null, [fluid.logLevel.FAIL, "Error received during client rendering: "].concat([err]));
            throw err;
        });
    };

    fluid.renderer.client.render = function (renderer, components) {
        // Note that this appears to be the core workflow of every renderer - note that fluid.renderer.server.render is so
        // effectful that we could just deliver all of this as a prefix before the tree gets munged
        console.log("About to render " + components.length + " components to renderer " + fluid.dumpComponentPath(renderer));
        var rootComponent = components[0];
        /*
        if (!fluid.componentHasGrade(rootComponent, "fluid.rootPage")) {
            fluid.fail("Must render at least one component, the first of which should be descended from fluid.rootPage - "
               + " the head component was ", rootComponent);
        }*/
        components.forEach(function (component) {
            // Evaluating the container of each component will force it to evaluate and render into it
            fluid.getForComponent(component, "container");
        });
        return rootComponent.container[0];
        // renderer.markupTree = rootComponent.container[0];
    };

})(jQuery, fluid_3_0_0);
