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

    fluid.defaults("fluid.renderer.client", {
        gradeNames: "fluid.renderer",
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
        members: {
            // Re-override container definition from newRendererComponent with one from fluid.newViewComponent again
            // TODO: Somehow this definition needs to be properly contextual, and also time-dependent! For nested
            // components, will resolve to template resolver during initial render, and then live DOM during
            // mature state - unless we enhance our virtual DOM to always be real (which I guess we must, if it is
            // to be a usable virtual DOM for diffing - but this should be an optional decision).
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
        // TODO: we are here!
        console.log("About to render " + components.length + " components to renderer " + fluid.dumpComponentPath(renderer));
        var rootComponent = components[0];
        if (!fluid.componentHasGrade(rootComponent, "fluid.rootPage")) {
            fluid.fail("Must render at least one component, the first of which should be descended from fluid.rootPage - "
               + " the head component was ", rootComponent);
        }
        components.forEach(function (component) {
            // Evaluating the container of each component will force it to evaluate and render into it
            fluid.getForComponent(component, "container");
        });
        // Now we have some interesting problem here - if the tree actually renders, we go through one pass where the
        // containers are bound to the virtual DOM and then another pass where we rebind them to the real one?!
        renderer.markupTree = rootComponent.container[0];
    };

})(jQuery, fluid_3_0_0);
