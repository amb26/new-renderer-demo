/*
Copyright 2018 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.rendererForComponent = function (that) {
        return fluid.resolveContext("fluid.renderer", that, true);
    };

    fluid.createRendererDomBinder = function (that, container, createTemplateDomBinder, createBrowserDomBinder) {
        return (fluid.isTemplateDOMNode(container[0]) ? createTemplateDomBinder : createBrowserDomBinder) ();
    };

    fluid.defaults("fluid.newRendererComponent", {
        gradeNames: ["fluid.viewComponent", "fluid.resourceLoader", "fluid.templateResourceFetcher"],
        members: {
            container: "@expand:fluid.renderer.resolveTemplateContainer({that}, {that}.options.container)",
            // TODO: use an options distribution/contextAwareness to distinguish between server and client DOM binders
            // TODO: we should be able to move this method into the renderer now
            dom: {
                expander: {
                    funcName: "fluid.createRendererDomBinder",
                    args: ["{that}", "{that}.container", "{that}.createTemplateDomBinder", "{that}.createBrowserDomBinder"]
                }
            }
        },
        invokers: {
            createTemplateDomBinder: {
                funcName: "fluid.renderer.createTemplateDomBinder",
                args: ["{that}", "{that}.options.selectors", "{that}.container", "{that}.resources.template.parsed"]
            },
            createBrowserDomBinder: {
                funcName: "fluid.createDomBinder",
                args: ["{that}.container", "{that}.options.selectors"]
            }
        },
        listeners: { // Override this temporary listener in fluid.viewComponent since the modern renderer does this timely
            "onCreate.onDomBind": null
        },
        resources: {
            template: {
                dataType: "html",
                parseOptions: {
                    selectors: "{that}.options.selectors"
                }
            }
        },
        selectors: {
            container: "/"
        },
        skipTemplateFetch: "{that}.options.parentMarkup",
        // Set to `true` if there is no template and/or the component expects to render into markup provided by parent
        parentMarkup: false,
        // Set to `false` if, when the "container" selector is "/", whether the synthetic (outer) root node of the template should
        // be taken into account, otherwise when "container" is "/" the template will be considered to consist of 
        // its physical root node. TODO: This will need to be combined with a directive governing splicing, at which point
        // we might be able to remove it.
        includeTemplateRoot: false,
        workflows: {
            global: {
                renderMarkup: {
                    funcName: "fluid.renderer.renderMarkup",
                    // TODO: Should really be able to specify that this depends on BOTH resolveResourceModel AND fetchTemplates
                    // But then what becomes of our "positional" priority scheme!
                    priority: "after:resolveResourceModel",
                    waitIO: true
                }
            }
        }
    });

    fluid.registerNamespace("fluid.renderer");

    /** Construct the virtual DOM container for the component out of its parsed template structure.
     * NOTE: Currently mutates copy of the parsed template in place in order to rebase its matched selectors
     * @param {fluid.newRendererComponent} that - The root page container for which the container is to be constructed
     * @return {ljQuery} The container node.
     */
    fluid.renderer.buildTemplateContainer = function (that) {
        var includeTemplateRoot = fluid.getForComponent(that, "options.includeTemplateRoot") || that.options.selectors.container !== "/";
        var matchedSelectors = that.resources.template.parsed.matchedSelectors;
        if (!matchedSelectors.container) {
            fluid.fail("Failure in template for " + fluid.dumpComponentAndPath(that) + " at "
               + (that.resources.template.path || that.resources.template.url) + ": template selector " + that.options.selectors.container + " was not matched");
        }
        var matchedContainer = matchedSelectors.container[0];

        var containerTree = includeTemplateRoot ? matchedContainer.node : matchedContainer.node.children[0];
        var rootDepth = matchedContainer.childIndices.length + (includeTemplateRoot ? 0 : 1);
        // TODO: Create a separate area for these indices rather than bashing the parsed template in place
        fluid.each(matchedSelectors, function (matchedSelector) {
            matchedSelector.forEach(function (oneMatch) {
                oneMatch.childIndices = oneMatch.childIndices.slice(rootDepth);
            });
        });
        var containerCopy = fluid.copy(containerTree);
        // These ids are used in the index created by fluid.renderer.client.render
        containerCopy.id = fluid.allocateGuid();
        return fluid.jQueryStandalone(containerCopy);
    };

    // Note the original index position of every child at the start of this render cycle
    fluid.renderer.touchTemplateRange = function (rendererComponent, templateRange) {
        var renderer = fluid.rendererForComponent(rendererComponent);
        if (templateRange.syncedAtCycle !== renderer.currentRenderCycle) {
            templateRange.parentNode.children.forEach(function (child, index) {
                child.originalIndex = index;
            });
            templateRange.syncedAtCycle = renderer.currentRenderCycle;
        }
    };

    fluid.renderer.resolveTemplateContainer = function (that, containerSpec) {
        var fail = function (extraMessage) {
            fluid.fail("Cannot resolve container ", containerSpec, " from " + fluid.dumpComponentAndPath(that) + extraMessage);
        };
        if (!containerSpec) {
            fail(" which was empty");
        }
        var outerContainer = fluid.isJQuery(containerSpec) ? containerSpec : fluid.container(containerSpec);
        // First case: We have been instructed to reuse whatever part of the template tree was provided by the parent
        if (fluid.getForComponent(that, ["options", "parentMarkup"])) {
            // These ids are used in the index created by fluid.renderer.client.render
            if (!outerContainer[0].id) {
                outerContainer[0].id = fluid.allocateGuid();
            }
            // Not quite - we might need to find a template and reparse it - and what if it is in the document!
            return outerContainer;
        } else if (that.resources.template) {
            var shadow = fluid.shadowForComponent(that);
            var innerContainer = fluid.renderer.buildTemplateContainer(that);
            var innerContainerNode = innerContainer[0];
            var templateRange = containerSpec.parentNode ? containerSpec : containerSpec.templateRange;
            if (templateRange) {
                // In case this is the first use of this binder on this cycle, take a note of all its current indices
                fluid.renderer.touchTemplateRange(that, templateRange);
            }
            // Find the target location in the parent's document where we might write our own template to form our own container
            var templateParentNode = templateRange && templateRange.parentNode;
            // It's the standard case where we are binding a template DOM binder-resolved outer container and splicing it to a new child component
            // OR the case where we have a new child rendered of a parent which is already in the DOM
            if (templateParentNode) {
                if (containerSpec.parentNode) { // template-template binding
                    fluid.renderer.markAsRendererSelector(containerSpec);
                }
                fluid.renderer.spliceTemplateChildren(templateParentNode, templateRange.rangeEnd, 0, innerContainer);
                var renderer = fluid.rendererForComponent(that);
                if (containerSpec.templateRange) { // It's a hybrid binder return
                    renderer.perRenderState.invalidatedDomParents.push({
                        parentNode: templateParentNode
                    });
                }
            } else {
                var outerContainerNode = outerContainer[0];
                // The outer container is a template node, but has no parent - it must be a server root page, just apply it directly
                if (fluid.isTemplateDOMNode(outerContainerNode)) {
                    // TODO: Fix up template structure so that there is a root DOM binder that allows us to use standard splice
                    fluid.pushArray(outerContainer[0], "children", innerContainerNode);
                } else { // Outer container is a real DOM node - it must be a root node for an initial client render
                    // Fished out by ClientRenderer in order to splice into the real document
                    fluid.model.setSimple(shadow, ["rendererRecords", "domRootContainer"], outerContainerNode);
                }
            }
            return innerContainer;
        } else {
            fluid.fail("Cannot resolve container for renderer " + fluid.dumpComponentPath(that)
                + " which has no markup template and has not set `parentMarkup` to `true` - container argument was ",
                that.options.container);
        }
    };

    /** Splice supplied extra template node children into supplied template parent DOM node's children, adjusting any
     * range iterators that are attached to it
     * @param {TemplateNode} parentNode - The immediate parent node of the children to be spliced
     * @param {Integer} start - The index at which children are to be spliced;
     * @param {Integer} deleteCount - The number of existing children to be deleted
     * @param {TemplateNode[]} items - New template nodes to be added at position `start`
     */
    fluid.renderer.spliceTemplateChildren = function (parentNode, start, deleteCount, items) {
        var shiftCount = items.length - deleteCount;
        var spliceArgs = [start, deleteCount].concat(items);
        Array.prototype.splice.apply(parentNode.children, spliceArgs);
        fluid.each(parentNode.ranges, function (range) {
            if (range.rangeStart > start) {
                range.rangeStart += shiftCount;
            }
            if (range.rangeEnd >= start) {
                range.rangeEnd += shiftCount;
            }
        });
    };

    /** Introspect to find the remaining kinds of renderer selectors we can't detect through the presence of a concrete
     * subcomponent demanding it during startup - the ones bound to model sourced dynamic components which are bound
     * to empty arrays or "false" ("nullary" components)
     * @param {fluid.rendererComponent} that - The component for which we should seek nullary subcomponents
     * @param {Object<String, TemplateRange>} domBinderCache - The renderer component's DOM binder cache
     */
    fluid.renderer.findNullaryComponents = function (that, domBinderCache) {
        var shadow = fluid.shadowForComponent(that);
        fluid.each(shadow.modelSourcedDynamicComponents, function (record, key) {
            var lightMerge = shadow.lightMergeDynamicComponents[key];
            var containers = fluid.getMembers(lightMerge.toMerge, "container");
            var lastContainer = fluid.renderer.lastValue(containers);
            if (lastContainer) {
                var parsed = fluid.parseContextReference(lastContainer);
                var segs = fluid.model.parseEL(parsed.path);
                if (segs.length !== 2 || segs[0] !== "dom") {
                    fluid.fail("Renderer must have template container reference as direct DOM binder reference: " + lastContainer);
                }
                var context = fluid.resolveContext(parsed.context, that);
                if (context.id !== that.id) { // It may be a proxy
                    fluid.fail("Renderer must have template container reference to direct parent: " + lastContainer);
                }
                var selectorName = segs[1];
                var outerContainer = domBinderCache[selectorName];
                fluid.renderer.markAsRendererSelector(outerContainer);
            }
        });
    };

    /** Navigate the data structure returned by the `parsedTemplate` structure as returned from fluid.htmlParser.parse to
     * return navigational details in a fake jQuery-like structure locating not only the node but also enabling
     * variants of it in a mutataed DOM structure to be located in future
     * @param {Component} parentThat - The component to which the parsed template is attached - only used in order to
     * scrawl a record to it in the returned structure
     * @param {String} selectorName - The selector name to be indirected into the matchedSelectors structure
     * @param {TemplateNode} node - The root template node from which navigation is to begin
     * @param {ParsedTemplateMatches} matches - The entry in the parsedTemplate matching the supplied `selectorName`.
     * @return {TemplateRange} A lite jQuery structure wrapping note only the supplied nodes, but also additional
     * navigational properties, particularly firstChild, lastChild indices
     */
    fluid.renderer.mapTemplateSelector = function (parentThat, selectorName, node, matches) {
        var mapped = matches.map(function (matched) {
            return {
                navigate: fluid.htmlParser.navigateChildIndices(node, matched.childIndices),
                childIndices: matched.childIndices
            };
        });
        // Sort shorter paths to the root, so that we can ignore any deeper matches placed for templating purposes
        mapped.sort(function (ma, mb) {
            return ma.childIndices.length - mb.childIndices.length;
        });
        var parentNode = mapped[0].navigate.parentNode,
            nodes = [],
            initialDepth = mapped[0].childIndices.length, // ignore any nodes nested deeper than the first match
            firstChild = Infinity, lastChild = -Infinity;
        for (var i = 0; i < mapped.length; ++i) {
            var oneMapped = mapped[i];
            var depth = oneMapped.childIndices.length;
            if (depth === initialDepth) {
                if (oneMapped.navigate.parentNode !== parentNode) {
                    fluid.fail("Error in template structure - node ", oneMapped.navigate.node, " for selector " + selectorName + " has different parent to previously seen node ", parentNode);
                } else {
                    firstChild = Math.min(firstChild, oneMapped.navigate.childIndex);
                    lastChild = Math.max(lastChild, oneMapped.navigate.childIndex);
                    nodes.push(oneMapped.navigate.node);
                }
            }
        }
        return fluid.extend(fluid.jQueryStandalone(nodes), {
            rangeStart: firstChild,
            rangeEnd: lastChild + 1,
            // One original node for potential use as a template
            oneOriginal: nodes[0],
            // One navigation path so that we can find matching nodes in the real DOM
            onePath: mapped[0].childIndices,
            // The immediate parent node of the bound selection - a template node which will have this range and others pushed onto it to track
            parentNode: parentNode,
            selectorName: selectorName,
            parentThat: parentThat,
            markedAsRendererSelector: false
        });
    };

    /**
     * Creates a new DOM Binder instance bound to a parsed markup template, used to locate elements in the DOM by name. Note that
     * this DOM binder is essentially static and is only capable of binding to the markup as it was originally seen in the template.
     * @param {Component} parentThat - the component to which the DOM binder is to be attached
     * @param {Object} selectors - a collection of named jQuery selectors
     * @param {jQuery} container - the root element in which to locate named elements
     * @param {ParsedTemplate} parsedTemplate - a parsed HTML template as returned from fluid.htmlParser.parse
     * @return {Object} - The new DOM binder.
     */
    fluid.renderer.createTemplateDomBinder = function (parentThat, selectors, container, parsedTemplate) {
        if (!container || !container.length) {
            fluid.fail("Cannot create DOM binder without container node for " + fluid.dumpComponentPath(parentThat)
                + " - failed to resolve ", parentThat.options.container);
        }
        var that = {
            id: fluid.allocateGuid(),
            cache: fluid.transform(parsedTemplate.matchedSelectors, function (matches, name) {
                var range = fluid.renderer.mapTemplateSelector(parentThat, name, container[0], matches);
                // TODO: The root of a server template does not have a "parentNode" property - see if we can remove this irregularity
                if (range.parentNode) {
                    // Push onto the "polluted jQuery" of the parent's "ranges" property this "range duck" so that firstChild/lastChild can be tracked
                    fluid.pushArray(range.parentNode, "ranges", range);
                }
                return range;
            })
        };
        fluid.renderer.findNullaryComponents(parentThat, that.cache);
        // Returns a "polluted jQuery" including firstChild, lastChild, parentNode and selectorName, parentThat
        that.locate = function (name) {
            var togo = that.cache[name];
            if (!togo) {
                fluid.fail("Could not match selector " + name + " for template component " + fluid.dumpThat(parentThat)
                   + " at path " + fluid.pathForComponent(parentThat).join(".") + ": available selectors are "
                   + fluid.keys(parsedTemplate.matchedSelectors));
            }
            return togo;
        };
        that.resolvePathSegment = that.locate;

        return that;
    };

    /** Accepts a TemplateRange as returned from fluid.mapTemplateSelector and via fluid.renderer.createTemplateDomBinder and if
     * it has not already been marked as a renderer selector, do so by splicing away the nodes bound to it (a sample
     * will still be available via the oneOriginal property) and marking it so that the operation is not
     * performed again
     * @param {TemplateRange} outerContainer - The template DOM binder return to be marked as corresponding to a
     * renderer selector
     */
    fluid.renderer.markAsRendererSelector = function (outerContainer) {
        if (!outerContainer.markedAsRendererSelector) {
            fluid.renderer.spliceTemplateChildren(outerContainer.parentNode, outerContainer.rangeStart, outerContainer.rangeEnd - outerContainer.rangeStart, []);
            outerContainer.markedAsRendererSelector = true;
        }
    };

    fluid.defaults("fluid.rootPage", {
        gradeNames: "fluid.newRendererComponent"
    });

    fluid.dumpComponentPath = function (component) {
        return "component at path " + fluid.pathForComponent(component).join(".");
    };


    fluid.registerNamespace("fluid.resourceLoader.parsers");

    fluid.resourceLoader.parsers.html = function (resourceText, options) {
        return fluid.htmlParser.parse(resourceText, options.resourceSpec.parseOptions);
    };

    fluid.defaults("fluid.renderer", {
        gradeNames: "fluid.component",
        distributeOptions: {
            rendererRootPageLinkage: {
                source: "{that}.options.rootPageGrade",
                target: "{that fluid.rootPage}.options.gradeNames"
            }
        },
        events: {
            render: null
        },
        members: {
            // Encodes which render cycle is in progress - relies on this process being synchronous
            currentRenderCycle: 0,
            // State held per render
            perRenderState: {
                invalidatedDomParents: []
            },
            // Used by ClientRenderer to track assignment of template nodes containers to DOM nodes
            templateIdToDom: {}
        },
        listeners: {
            "render.render": {
                funcName: "fluid.renderer.render",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    // Modifies supplied argument
    fluid.renderer.lastValue = function (array) {
        return array.reverse().find(fluid.identity);
    };

    /** Main listener to the fluid.renderer's "render" event */

    fluid.renderer.render = function (renderer, shadows) {
        // First phase of render workflow after resource resolution - first listener to renderer.events.render
        console.log("About to render " + shadows.length + " components to renderer " + fluid.dumpComponentPath(renderer));

        shadows.forEach(function (shadow) {
            var that = shadow.that;
            // Evaluating the container of each component will force it to evaluate and render into it
            fluid.getForComponent(that, "container");
            fluid.getForComponent(that, "dom");
            that.events.onDomBind.fire(that);
        });

        shadows.forEach(function (shadow) {
            // TODO: Will eventually be "Late materialised model relay" which is possible since transaction is not closed
            // until notifyInitModel
            var component = shadow.that;
            if (fluid.componentHasGrade(component, "fluid.leafRendererComponent")) {
                fluid.getForComponent(component, "updateTemplateMarkup")(component.container[0], component.model);
            }
        });
    };

    /** Main workflow function for fluid.newRendererComponent's global workflow.
     * Assembles map of rendererComponent's to corresponding renderer, and then fires the "render"
     * event on each renderer
     */

    fluid.renderer.renderMarkup = function (shadows) {
        // Map of parent renderer's id to list of nested renderer components
        var rendererToShadows = {};
        shadows.forEach(function (shadow) {
            if (fluid.componentHasGrade(shadow.that, "fluid.newRendererComponent")) {
                var rendererComponent = shadow.that;
                var parentRenderer = fluid.rendererForComponent(rendererComponent);
                if (!parentRenderer) {
                    fluid.fail("Unable to locate parent renderer from " + fluid.dumpComponentPath(rendererComponent));
                }
                fluid.pushArray(rendererToShadows, parentRenderer.id, shadow);
            }
        });
        // var renderId = fluid.allocateGuid();
        fluid.each(rendererToShadows, function (shadows, key) {
            var renderer = fluid.globalInstantiator.idToShadow[key].that;
            renderer.currentRenderCycle ++;
            renderer.perRenderState = {
                invalidatedDomParents: []
            };
            fluid.getForComponent(renderer, "events.render");
            renderer.events.render.fire(shadows);
        });
    };

})(jQuery, fluid_3_0_0);
