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
        container: "html",
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
    // TODO: Note this is obviously faulty since the components may subsequently RE-RENDER.
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
        } else if (node.text) {
            domNode = document.createTextNode(node.text);
        }
        if (domNode) {
            if (node.id) {
                templateIdToDom[node.id] = domNode;
            }
            parent.appendChild(domNode);
        }
    };

    /** Convert an array of template nodes into a DOM document fragment
     * @param {Object<String, DomNode>} templateIdToDom - Map of template node ids to corresponding DOM nodes they have been allocated to - updated
     * by this call
     * @param {TemplateNode[]} templateNodes - Array of template nodes to be rendered
     * @return {DocumentFragment} A DOM document fragment with one child for each new template node
     */
    fluid.renderer.client.renderFragment = function (templateIdToDom, templateNodes) {
        var fragment = new DocumentFragment();
        templateNodes.forEach(function (node) {
            fluid.renderer.client.templateToDOM(templateIdToDom, fragment, node);
        });
        return fragment;
    };

    fluid.renderer.client.createDomBinder = function (that, container, selectors, templateBinder) {
        var domBinder = fluid.createDomBinder(container, selectors);
        domBinder.baseLocate = domBinder.locate;
        domBinder.templateBinder = templateBinder;
        domBinder.locate = function (selectorName, localContainer) {
            var oldReturn = domBinder.baseLocate(selectorName, localContainer);
            if (!localContainer) { // TODO: eliminate this crazy variant signature from base DOM binder
                oldReturn.contextThat = that; // note that this is already there
                oldReturn.templateRange = templateBinder.locate(selectorName);
            }
            return oldReturn;
        };
        domBinder.resolvePathSegment = domBinder.locate;
        return domBinder;
    };

    /** Convert a list of supplied template nodes to DOM nodes and render them as children of the supplied DOM node
     * @param {Object<String, DomNode>} templateIdToDom - Map of template node ids to corresponding DOM nodes they have been allocated to - updated by this call
     * @param {DomNode} domContainer - The DOM container to receive the new children
     * @param {TemplateNode[]} templateNodes - Array of template nodes to be rendered
     */
    fluid.renderer.client.renderToDom = function (templateIdToDom, domContainer, templateNodes) {
        var fragment = fluid.renderer.client.renderFragment(templateIdToDom, templateNodes);
        console.log("Got DOM container ", domContainer);
        console.log("Dumping markup: ");
        console.log(fluid.htmlParser.render(templateNodes));
        domContainer.appendChild(fragment);
    };

    /** Added as a listener to the renderer's "render" event after the main listener fluid.renderer.render **/

    fluid.renderer.client.render = function (renderer, shadows) {
        var templateIdToDom = renderer.templateIdToDom;
        var rootComponent = shadows[0].that;
        var rootShadow = fluid.shadowForComponent(rootComponent);
        var rootContainer = rootComponent.container[0];
        var domRoot = fluid.getImmediate(rootShadow, ["rendererRecords", "domRootContainer"]);
        if (domRoot) {
            templateIdToDom[rootContainer.id] = domRoot;
            // TODO: make sure this "splicing" behaviour (where all the children are spliced as children of the existing parent
            // node without disturbing it) is consistent in differential rendering too - in practice, we probably want to splice the
            // nodes together more intelligently, e.g. by compounding any classes together that are on either node
            fluid.renderer.client.renderToDom(templateIdToDom, domRoot, rootContainer.children);
        }

        renderer.perRenderState.invalidatedDomParents.forEach(function (invalidated) {
            var parentNode = invalidated.parentNode;
            console.log("Considering invalidated parentNode ", parentNode);
            var children = parentNode.children;
            var newChildren = children.filter(function (child) {
                return child.originalIndex === undefined;
            });
            console.log("Found " + newChildren.length + " newly rendered children");
            var domParent = templateIdToDom[parentNode.id];
            fluid.renderer.client.renderToDom(templateIdToDom, domParent, newChildren);
            // TODO: after this, we may need to resort the children depending on their new positions
        });
        // Use this test as cheap proxy for not having been initially rendered against a real DOM - 
        // TODO: Note that in future we will have to construct a full template DOM on the client too, so that re-rendering can occur consistently 
        if (!fluid.componentHasGrade(rootComponent, "fluid.clientRootPage")) {
            shadows.forEach(function (shadow) {
                var component = shadow.that;
                // Stash the original container and DOM binder for later use during re-rendering
                fluid.model.setSimple(shadow, ["rendererRecords", "templateContainer"], component.container);
                fluid.model.setSimple(shadow, ["rendererRecords", "templateDomBinder"], component.dom);
                var nodeId = component.container[0].id;
                if (!nodeId || !templateIdToDom[nodeId]) {
                    fluid.fail("Unable to remap container for component ", component);
                }
                // Whip through all the freshly constructed components, malignantly rewriting their container and DOM binder to point to
                // ones oriented to the browser's DOM. We subvert the DOM binder's return so that containers of freshly instantiating components
                // in subsequent rounds can locate the template DOM
                component.container = fluid.container(templateIdToDom[nodeId]);
                component.dom = fluid.renderer.client.createDomBinder(component, component.container, component.options.selectors, component.dom);
                component.events.onDomBind.fire(component);
            });
        }
    };

    fluid.defaults("fluid.renderer.rootBrowserRenderer", {
        gradeNames: ["fluid.renderer.client", "fluid.resolveRootSingle"],
        singleRootType: "fluid.renderer"
    });

    fluid.renderer.rootBrowserRenderer();

})(jQuery, fluid_3_0_0);
