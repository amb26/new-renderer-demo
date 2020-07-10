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

    fluid.setLogging(true);

    // Use the table in fluid.resourceLoader.staticMountTable to rewrite "path" resources to "url" resources and load them -
    // Presumably this should be eventually made into some more general patten of resource interception
    fluid.resourceLoader.loaders.path = function (resourceSpec) {
        var rewritten = fluid.resourceLoader.rewriteUrlWithDiagnostic(fluid.resourceLoader.staticMountTable, resourceSpec.path);
        var specCopy = fluid.censorKeys(resourceSpec, ["path"]);
        specCopy.url = rewritten;
        return fluid.resourceLoader.loaders.XHR(specCopy);
    };

    // Full-page "client renderer" which accepts an init block as rendered from the server, which insists that the
    // page's markup should correspond to that required, and constructs a matching model skeleton

    fluid.defaults("fluid.renderer.client", {
        gradeNames: "fluid.renderer",
        rootPageGrade: "fluid.clientRootPage",
        listeners: {
            "render.client": {
                funcName: "fluid.renderer.client.render",
                args: ["{that}", "{arguments}.0"],
                priority: "after:render"
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
    fluid.renderer.initBlockClientRenderer = function (config) {
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

    fluid.renderer.client.templateToDOM = function (templateIdToDom, parent, node) {
        var domNode;
        if (node.tagName) {
            domNode = document.createElement(node.tagName);
            fluid.each(node.attrs, function (value, key) {
                domNode.setAttribute(key, value);
            });
            fluid.each(node.children, function (child) {
                fluid.renderer.client.templateToDOM(templateIdToDom, domNode, child);
            });
        } else if (node.comment) {
            domNode = document.createComment(node.comment);
        } else {
            domNode = document.createTextNode(node.text);
        }
        if (node.id) {
            templateIdToDom[node.id] = domNode;
        }
        parent.appendChild(domNode);
        return node;
    };

    fluid.renderer.client.renderFragment = function (templateIdToDom, nodes) {
        var fragment = new DocumentFragment();
        nodes.forEach(function (node) {
            fluid.renderer.client.templateToDOM(templateIdToDom, fragment, node);
        });
        return fragment;
    };

    fluid.renderer.client.render = function (renderer, components) {
        var rootComponent = components[0];
        var rootShadow = fluid.shadowForComponent(rootComponent);
        var rootContainer = rootComponent.container[0];
        var domRoot = rootShadow.rendererRecords.domContainer;
        var templateIdToDom = rootShadow.rendererRecords.templateIdToDom = {};
        templateIdToDom[rootContainer.id] = domRoot;
        var fragment = fluid.renderer.client.renderFragment(templateIdToDom, rootContainer.children);

        console.log("Got DOM root ", domRoot);
        console.log("Dumping markup: ");
        console.log(fluid.htmlParser.render(rootContainer));
        domRoot.appendChild(fragment);
        components.forEach(function (component) {
            var componentShadow = fluid.shadowForComponent(component);
            // Stash the original container and DOM binder for later use during re-rendering
            fluid.model.setSimple(componentShadow, ["rendererRecords", "templateContainer"], component.container);
            fluid.model.setSimple(componentShadow, ["rendererRecords", "templateDomBinder"], component.dom);
            var nodeId = component.container[0].id;
            if (!nodeId || !templateIdToDom[nodeId]) {
                fluid.fail("Unable to remap container for component ", component);
            }
            component.container = fluid.container(templateIdToDom[nodeId]);
            component.dom = fluid.createDomBinder(component.container, component.options.selectors);
        });
    };

    fluid.defaults("fluid.renderer.rootBrowserRenderer", {
        gradeNames: ["fluid.renderer.client", "fluid.resolveRootSingle"],
        singleRootType: "fluid.renderer"
    });

    fluid.renderer.rootBrowserRenderer();

})(jQuery, fluid_3_0_0);
