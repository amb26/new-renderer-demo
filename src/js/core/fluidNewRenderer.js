/*
Copyright 2018 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

(function ($, fluid) {
    "use strict";

    fluid.rendererForComponent = function (that) {
        return fluid.resolveContext("fluid.renderer", that, true);
    };
    fluid.defaults("fluid.newRendererComponent", {
        gradeNames: ["fluid.viewComponent", "fluid.resourceLoader", "fluid.templateResourceFetcher"],
        members: {
            container: "@expand:fluid.renderer.resolveRendererContainer({that}, {that}.options.container)",
            dom: {
                expander: {
                    funcName: "fluid.renderer.createRendererDomBinder",
                    args: ["{that}", "{that}.container", "{that}.options.selectors"]
                }
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
        // An override from "fluid.templateResourceFetcher"
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

    // A rendering component is a fresh renderer root requiring a new document fragement container if no renderer component has been created in this transaction which contains it -
    // And of course that it does not have the "parentMarkup" option
    fluid.renderer.isFreshRoot = function (shadow) {
        var transRec = fluid.currentTreeTransaction();
        return !transRec.outputShadows.find(function (outputShadow) {
            var that = shadow.that;
            // If we pass all these conditions for any constructing component then the component is disqualified from being a fresh root
            return shadow !== outputShadow && fluid.componentHasGrade(that, "fluid.newRendererComponent")
                && !fluid.getForComponent(that, ["options", "parentMarkup"])
                && shadow.path.startsWith(outputShadow.path);
        });
    };

    fluid.renderer.binderSymbol = Symbol("rendererBinder");

    // Called for the "container" member of every renderer component, given its containerSpec. It should return "the right" DOM node,
    // even if it is decontextualised for the moment. There could be an "outer container" which is the the one directly designated by the
    // spec - it might be a real node in the outer document, or a DOM binder return from a previous cycle.
    // If we have a template, we use it to generate an "inner container" from it which we either attach to the outer container or
    // else fuse with it.
    // Now - if the outer container is something which is really in the outer document, we don't want to fuse with it right now
    // in case we generate reflows. Instead we need to leave notes as before inside "rendererRecords.domRootContainer".

    // Of course, now we are using "real" DOM notes throughout, we can't necessarily distinguish the situations where the outer
    // element is in the document or not by just looking at it. And also, note that PART of a tree of renderer components might
    // rerender, in which case we can't simply rely on the parent DOM binder output either. We need to be able to somehow look up
    // the tree - but of course, we have access to the full tree of "new" renderer components in the driver so we can simply
    // see which is the most derived one.
    // But part of our aim is also to see whether we can massively simplify the framework workflow and do away with the idea
    // that we can't return to modelComponent phases if we have started to touch the markup - otherwise, how could we source
    // material acquired from raw markup into models?
    // So - can we somehow incrementalise this algorithm? Can we assign some kind of DOM node root to every component
    // "at any time"? That is, go back to the ancient essentially synchronous system that could evaluate a container in an early expander.
    // I guess we will always know what the freshly constructing component roots are in a transaction at the instant of their
    // construction. We just introspect into the current transaction at the time of construction and see if we are at the top.

    // Currently we have somewhat shittily done this by stashing inside "renderer" - but shouldn't we properly do this inside the
    // transaction itself? What if there were multiple simultaneous transactions?
    // We would expect that these couldn't conflict by trying to construct "the same" material but what if they did, a la Kulkarni?
    // We should probably really prepare to do this properly, and prepare for proper "cross-tree" giant immutable transaction waves.

    // So indeed - let's do this properly. fluid.clearTreeTransaction shows what is currently in the transaction, although there is
    // clearly more. For example there is pendingPotentiae which in practice contains everything, which merely gets marked
    // with the "applied = true" flag. And then there is outputShadows recording everything which was produced. We also need to
    // consider our generally immature handling of deletes. In the "new future" we will have this list of edits materialised more
    // practically.

    // OK - in every ordinary case, we now have it that outerContainer[0] WILL IMMEDIATELY BECOME THE REAL CONTAINER.
    // The only extraordinary case is where parentMarkup = true and we are a dynamic array-backed component. In that case,
    // the parent DOM binder MUST have been a renderer DOM binder, AND have already marked this as a renderer selector by means
    // of self-inspection.
    // In that case it will have stashed the 0th node as a template, and then spliced away all the others already. So it will have
    // to make a "special return" including the template which we will now parse right away and then create our own renderer DOM binder.
    // This means in every case we just behave essentially as the old container resolver and almost all the intelligence goes into the
    // DOM binder.

    // Well no, obviously that's wrong - EVERY case of being a dynamic array-backed component is exceptional because there is no
    // container yet. However, we still have a renderer DOM binder return. Note that we still need to be able to positionally refer to
    // the location in the DOM of zero things. Because there is no insertAfter, we will keep a RIGHT SENTINEL for every range when
    // we acquire it. A DOM ITERATOR is "parent node plus right sentinel" where the sentinel may be null.

    // Not any more - EVERYTHING is sentinelised

    // Note that we could make this model consonant with that of containerRenderingView. All that we don't get from there is "bulked roots" as DocumentFragments.

    /** Insert a new node into an active range supplied from a renderer DOM binder's cache. This will simultaneously update the DOM
     * as well as the active range to include the supplied new element at the end of the range.
     * @param {DomBinderRange} binderCache - The active range as supplied from a renderer DOM binder
     * @param {Node} newNode - The new node to be inserted
     * @param {Object} binderRecords - The binder records structure attached to the active range
     */
    fluid.renderer.insertAt = function (binderCache, newNode, binderRecords) {
        Array.prototype.push.apply(binderCache, newNode);
        var sentinel = binderRecords.sentinel;
        sentinel.parentNode.insertBefore(newNode, sentinel);
    };

    fluid.renderer.fuseNode = function (target, source) {
        while (source.childNodes.length > 0) {
            target.appendChild(source.firstChild);
        }
        for (var i = 0; i < source.attributes.length; i++) {
            var attrib = source.attributes[i];
            if (attrib.name !== "class" && attrib.name !== "id") {
                target.setAttribute(attrib.name, attrib.value);
            }
        }
        target.classList.add.apply(target.classList, source.classList);
    };

    fluid.renderer.renderTemplate = function (that, outerContainer) {
        var $b = fluid.renderer.binderSymbol;
        var templateContainer = that.resources.template.parsed.node.cloneNode(true);
        var binderRecords = outerContainer[$b];
        if (binderRecords) {
            fluid.renderer.insertAt(outerContainer, templateContainer, binderRecords);
        } else {
            if (outerContainer.length !== 1) {
                fluid.fail("Assertion failure - conventional DOM binder return without one element for template insertion");
            } else {
                var target = outerContainer[0];
                if (target.nodeType === 11) {
                    if (target.firstElementChild) {
                        fluid.fail("Assertion failure - documentFragment has already been rendered to");
                    } else {
                        target.appendChild(templateContainer);
                    }
                } else {
                    fluid.renderer.fuseNode(target, templateContainer);
                }
            }
        }
        return templateContainer;
    };

    fluid.renderer.resolveRendererContainer = function (that, containerSpec) {
        var $b = fluid.renderer.binderSymbol;
        var fail = function (extraMessage) {
            fluid.fail("Cannot resolve container ", containerSpec, " from " + fluid.dumpComponentAndPath(that) + extraMessage);
        };
        if (!containerSpec) {
            fail(" which was empty");
        }
        var selfTemplate = function (node) {
            that.resources.template = {
                parsed: fluid.htmlParser.parse(node, that.options.resources.template.parseOptions)
            };
        };

        var parentMarkup = fluid.getForComponent(that, ["options", "parentMarkup"]);
        // Note that we can't use fluid.container here since there may be several or none of them
        var outerContainer = fluid.isJQuery(containerSpec) ? containerSpec : $(containerSpec);
        var innerContainer = outerContainer;
        var binderRecords = outerContainer[$b];
        if (binderRecords) {
            if (binderRecords.isBoolean) {
                if (!parentMarkup) {
                    // Don't set return - but remember to process elision
                    fluid.renderer.renderTemplate(that, outerContainer);
                }
            } else if (!binderRecords.isBoolean) { // It's an array case
                if (parentMarkup) { // Relay what the binder stored as the template into our own template structure
                    selfTemplate(binderRecords.template);
                }
                // We do this here otherwise there is nothing we could initialise "container" with - and also in this case
                // we know there must be a parent rendererComponent and hence we are not in "split mode"
                innerContainer = fluid.renderer.renderTemplate(that, outerContainer);
            }
        }
        return $(innerContainer);
    };

    // Modifies supplied argument
    fluid.renderer.lastValue = function (array) {
        return array.reverse().find(fluid.identity);
    };

    /** Introspect to find the remaining kinds of renderer selectors we can't detect through the presence of a concrete
     * subcomponent demanding it during startup - the ones bound to model sourced dynamic components which are bound
     * to empty arrays or "false" ("nullary" components)
     * @param {fluid.rendererComponent} that - The component for which we should seek nullary subcomponents
     * @param {Object<String, TemplateRange>} dom - The renderer component's DOM binder
     */
    fluid.renderer.findRendererSelectors = function (that, dom) {
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
                dom.rendererSelectors[selectorName] = {
                    isBoolean: record.isBoolean
                };
            } else {
                // why might there not be one?
            }
        });
    };

    /** Determine whether the supplied node is part of the "frontier" of the growing collection in the first argument.
     * It is part of the frontier if either i) it is itself in the `frontier` collection OR ii) it is not a node contained
     * by any node already in the collection.
     * @param {Node[]} frontier - An array of DOM nodes forming the existing frontier
     * @param {Node} node - The node to be tested
     * @return {Boolean} `true` if the node is part of the frontier
     */
    fluid.renderer.isInFrontier = function (frontier, node) {
        return frontier.every(function (fel) {
            return fel === node || !fel.contains(node);
        });
    };

    fluid.renderer.cullToFrontier = function (dom) {
        var frontier = [];
        for (var selectorName in dom.rendererSelectors) {
            var all = dom.cache[selectorName];
            var filtered = Array.prototype.filter.call(all, function (element) {
                var inFrontier = fluid.renderer.isInFrontier(frontier, element);
                if (inFrontier) {
                    frontier.push(element);
                }
                return inFrontier;
            });
            dom.cache[selectorName] = $(filtered);
        };
    };

    /** Determine whether the supplied node is a sentinel node as dispensed from fluid.renderer.createSentinel
     * @param {Node} node - The node to be tested
     * @return {Boolean} `true` if the supplied node is a sentinel
     */
    fluid.renderer.isSentinel = function (node) {
        return node && node.nodeType === 8 && node.textContent === "fluid-renderer-sentinel";
    };

    // Commentary on placeholder strategies: https://stackoverflow.com/a/36174526
    /** Create a "sentinel" node, a distinguished node in the DOM that will not render and can be used to mark a position
     * before which conditionally present node(s) should be constructed.
     * @param {Node} neighbour - A node in the same document as the desired sentinel
     * @return {Node} A fresh sentinel node
     */
    fluid.renderer.createSentinel = function (neighbour) {
        var dokkument = neighbour.ownerDocument;
        return dokkument.createComment("fluid-renderer-sentinel");
    };

    fluid.renderer.sentinelize = function (parentNode, node) {
        var next = node.nextSibling;
        if (!fluid.renderer.isSentinel(next)) {
            parentNode.insertBefore(fluid.renderer.createSentinel(parentNode), next);
            next = node.nextSibling;
        }
        return next;
    };

    fluid.renderer.initialiseDomBinder = function (that, dom) {
        var shadow = fluid.shadowForComponent(that);
        var isFreshRoot = fluid.renderer.isFreshRoot(shadow);
        if (isFreshRoot && !that.options.parentMarkup) { // Create a "split mode" DOM binder - but where does the content come from? It needs to be here by the time we execute the immediately following block of "doQuery"
            dom.containerFragment = $(document.createDocumentFragment());
        }
        if (!that.options.parentMarkup) {
            // Whether it is a split container or a genuine one, now render our markup into it
            var innerContainer = dom.containerFragment || dom.locate("container");
            // TODO: Resolve "elideParent" option to fuse inner and outer containers
            // TODO: Extract some kind of base class out of "fluid.containerRenderingView" so that we could expose a path via override of renderMarkup and that.options.markup.container
            fluid.renderer.renderTemplate(that, innerContainer);
        }
    };

    fluid.renderer.evaluateRendererSelectors = function (that, dom) {
        var $b = fluid.renderer.binderSymbol;
        fluid.renderer.findRendererSelectors(that, dom);

        // All this business with renderer selectors is referred against the *original* markup in the template - do we assume this has got into the document already
        // Well of course we do, because that is the basis of self-templating. So this implies that we indeed *put* it into the document if it isn't already -
        // That is, if it is a regular fucking template. So that indeed then goes into the private documentFragment.
        for (let selectorName in dom.rendererSelectors) {
            dom.locate(selectorName);
        }
        fluid.renderer.cullToFrontier(dom);
        for (let selectorName in dom.rendererSelectors) {
            var elements = dom.cache[selectorName];
            var parentNode = null;
            Array.prototype.forEach.call(elements, function (element) { // eslint-disable-line no-loop-func
                if (element.parentNode !== parentNode) {
                    if (parentNode !== null) {
                        fluid.fail("Error in markup template structure. Node ", element, " which matched renderer selector " + selectorName + " is a child of node ",
                            element.parentNode , " which differs from parent ", parentNode, " of another such node.");
                    }
                    parentNode = element.parentNode;
                }
            });
            var last = fluid.peek(elements);
            var binderRecords = elements[$b] = {};
            binderRecords.sentinel = fluid.renderer.sentinelize(parentNode, last);
            binderRecords.isBoolean = dom.rendererSelectors[selectorName].isBoolean;
            if (elements.length > 0) {
                // Note this isn't going to be adequate in recursive cases - this really needs to be potentialised somehow, perhaps via an options distribution -
                // however we really need something like a "wildcard path distribution" - perhaps it's even time to start building regexes dynamically
                binderRecords.template = elements[0].cloneNode(true);
            }
            if (!binderRecords.isBoolean) {
                // TODO: Don't do this in the case of "snapshot" markup rendered from the server from the same model. This used to be signalled by "parentMarkup" but is
                // probably a distinct case.
                Array.prototype.forEach.call(elements, function (element) {
                    element.parentNode.removeChild(element);
                });
                elements.length = 0;
            }
        }
    };

    /**
     * Creates a new DOM Binder instance bound to a parsed markup template, used to locate elements in the DOM by name.
     * @param {Component} parentThat - the component to which the DOM binder is to be attached
     * @param {jQuery} container - the root element in which to locate named elements
     * @param {Object} selectors - a collection of named jQuery selectors
     * @return {Object} - The new DOM binder.
     */
    fluid.renderer.createRendererDomBinder = function (parentThat, container, selectors) {
        var userJQuery = container.constructor;
        var that = fluid.createDomBinder(container, selectors);
        that.rendererSelectors = {};
        that.doQuery = function (selector, selectorName) {
            if (!that.rendererSelectors[selectorName] || !that.cache[selectorName]) {
                var innerContainer = (that.containerFragment || container)[0];
                return userJQuery(innerContainer.querySelectorAll(selector));
            } else {
            // Renderer selectors are just resolved from the cache which is really a live map of the DOM structure
                return that.cache[selectorName];
            }
        };
        fluid.renderer.initialiseDomBinder(parentThat, that);
        fluid.renderer.evaluateRendererSelectors(parentThat, that);
        return that;
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
        },
        listeners: {
            "render.render": {
                funcName: "fluid.renderer.render",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

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
            // Note that leaf components will probably be abolished - this work will be done during onDomBind through materialisation
            var that = shadow.that;
            if (fluid.componentHasGrade(that, "fluid.leafRendererComponent")) {
                fluid.getForComponent(that, "updateTemplateMarkup")(that.container[0], that.model);
            }
        });
        // Final pass to render all accumulate documentFragments into the real dom
        shadows.forEach(function (shadow) {
            var dom = shadow.that.dom;
            if (dom.containerFragment) {
                fluid.renderer.fuseNode(dom.container[0], dom.containerFragment[0].firstElementChild);
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
            fluid.getForComponent(renderer, "events.render");
            renderer.events.render.fire(shadows);
        });
    };

    fluid.defaults("fluid.renderer.rootRenderer", {
        gradeNames: ["fluid.renderer", "fluid.resolveRootSingle"],
        singleRootType: "fluid.renderer"
    });

    fluid.renderer.rootRenderer();

})(jQuery, fluid_3_0_0);
