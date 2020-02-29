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

    fluid.createRendererDomBinder = function (createDomBinderMethod, that, createTemplateDomBinder, createBrowserDomBinder) {
        var method = fluid.getForComponent(that, createDomBinderMethod);
        return method();
    };

    fluid.defaults("fluid.newRendererComponent", {
        gradeNames: ["fluid.newViewComponent", "fluid.resourceLoader"],
        members: {
            container: "@expand:fluid.resolveTemplateContainer({that}, {that}.options.container)",
            // TODO: use an options distribution/contextAwareness to distinguish between server and client DOM binders
            dom: {
                expander: {
                    funcName: "fluid.createRendererDomBinder",
                    args: ["{fluid.renderer}.options.createDomBinderMethod", "{that}", "{that}.createTemplateDomBinder", "{that}.createBrowserDomBinder"]
                }
            }
        },
        invokers: { // TODO: Shift these methods into the renderer itself
            createTemplateDomBinder: {
                funcName: "fluid.createTemplateDomBinder",
                args: ["{that}", "{that}.options.selectors", "{that}.container", "{that}.resources.template.parsed"]
            },
            createBrowserDomBinder: {
                funcName: "fluid.createDomBinder",
                args: ["{that}.container", "{that}.options.selectors"]
            }
        },
        resources: {
            template: {
                dataType: "html",
                resourceText: "Default text: no template was configured",
                parseOptions: {
                    selectors: "{that}.options.selectors"
                }
            }
        },
        selectors: {
            container: "/"
        },
        // Configure a map here of all templates which should be pre-fetched during fetchTemplates so that they are
        // ready for renderMarkup
        rendererTemplateResources: {
            template: true
        },
        // Set to `true` if there is no template and/or the component expects to render into markup provided by parent
        parentMarkup: false,
        // Set to `true` if the root node of the template is to be written into the markup
        // otherwise it will be elided and its children joined to the parent node directly
        includeTemplateRoot: false,
        replaceParent: true,
        workflows: {
            global: {
                fetchTemplates: {
                    funcName: "fluid.renderer.fetchTemplates",
                    priority: "after:resolveModelSkeleton"
                },
                renderMarkup: {
                    funcName: "fluid.renderer.renderMarkup",
                    priority: "after:fetchTemplates",
                    waitIO: true
                }
            }
        }
    });

    /** Construct the virtual DOM container for the component out of its parsed template structure.
     * NOTE: Currently mutates the parsed template in place in order to rebase its matched selectors
     * @param {fluid.newRendererComponent} that - The root page container for which the container is to be constructed
     * @return {ljQuery} The container node.
     */
    fluid.buildTemplateContainer = function (that) {
        var includeTemplateRoot = fluid.getForComponent(that, "options.includeTemplateRoot");
        var matchedSelectors = that.resources.template.parsed.matchedSelectors;
        if (!matchedSelectors.container) {
            fluid.fail("Failure in template for " + fluid.dumpComponentAndPath(that) + " at " + (that.resources.template.path || that.resources.template.url) + ": template selector " + that.options.selectors.container + " was not matched");
        }
        var matchedContainer = matchedSelectors.container[0];
        var containerTree = matchedContainer.node;
        var containerCopy = fluid.copy(containerTree);
        var rootDepth = matchedContainer.childIndices.length - (includeTemplateRoot ? 1 : 0);
        // TODO: Create a separate area for these rather than bashing the parsed template in place
        fluid.each(matchedSelectors, function (matchedSelector) {
            matchedSelector.forEach(function (oneMatch) {
                oneMatch.childIndices = oneMatch.childIndices.slice(rootDepth);
            });
        });
        return fluid.container(containerCopy);
    };

    fluid.resolveTemplateContainer = function (that, containerSpec) {
        var fail = function (extraMessage) {
            fluid.fail("Cannot resolve container ", containerSpec, " from " + fluid.dumpComponentAndPath(that) + extraMessage);
        };
        if (!containerSpec) {
            fail(" which was empty");
        }
        var outerContainer = fluid.container(containerSpec);
        if (fluid.getForComponent(that, ["options", "parentMarkup"])) {
            return outerContainer;
        } else if (that.resources.template) {
            var innerContainer = fluid.buildTemplateContainer(that);
            // Find the target location in the parent's document where we might write our own template to
            // form our own container
            var parentNode = outerContainer.parentNode;
            if (parentNode && fluid.getForComponent(that, ["options", "replaceParent"])) {
                if (!outerContainer.childIndex) {
                    fail(" which is not a template matchedSelector");
                }
                parentNode.children = parentNode.children || [];
                parentNode.children[outerContainer.childIndex] = innerContainer[0];
            } else {
                fluid.pushArray(outerContainer[0], "children", innerContainer[0]);
                console.log("It must be a root page!");
            }
            return innerContainer;
        } else {
            fluid.fail("Cannot resolve container for renderer " + fluid.dumpComponentPath(that)
                + " which has no markup template and has not set `parentMarkup` to `true` - container argument was ",
                that.options.container);
        }
    };

    /**
     * Creates a new DOM Binder instance bound to a parsed markup template, used to locate elements in the DOM by name.
     * @param {Component} parentThat - the component to which the DOM binder is to be attached
     * @param {Object} selectors - a collection of named jQuery selectors
     * @param {jQuery} container - the root element in which to locate named elements

     * @param {ParsedTemplate} parsedTemplate - a parsed HTML template as returned from fluid.htmlParser.parse
     * @return {Object} - The new DOM binder.
     */
    fluid.createTemplateDomBinder = function (parentThat, selectors, container, parsedTemplate) {
        var that = {
            id: fluid.allocateGuid()
        };
        if (!container || !container.length) {
            fluid.fail("Cannot create DOM binder without container node for " + fluid.dumpComponentPath(parentThat)
                + " - failed to resolve ", parentThat.options.container);
        }
        that.locate = function (name) {
            var matches = parsedTemplate.matchedSelectors[name];
            if (!matches) {
                fluid.fail("Could not match selector " + name + " for template component " + fluid.dumpThat(parentThat)
                   + " at path " + fluid.pathForComponent(parentThat).join(".") + ": available selectors are "
                   + fluid.keys(parsedTemplate.matchedSelectors));
            }
            var parentNode, childIndex;
            var togo = $(fluid.transform(matches, function (matched) {
                var navigate = fluid.htmlParser.navigateChildIndices(container[0], matched.childIndices);
                parentNode = navigate.parentNode;
                childIndex = navigate.childIndex;
                return navigate.node;
            }));
            togo.selectorName = name;
            if (matches.length === 1) {
                togo.parentNode = parentNode;
                togo.childIndex = childIndex;
            }
            return togo;
        };
        that.resolvePathSegment = that.locate;

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
        invokers: {
            render: {
                funcName: "fluid.renderer.render",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    fluid.defaults("fluid.renderer.browser", {
        gradeNames: "fluid.renderer",
        createDomBinderMethod: "createBrowserDomBinder"
    });

    fluid.defaults("fluid.renderer.template", {
        gradeNames: "fluid.renderer",
        createDomBinderMethod: "createTemplateDomBinder"
    });

    fluid.renderer.render = function (renderer, components) {
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
            var container = fluid.getForComponent(component, "container");
            if (fluid.componentHasGrade(component, "fluid.leafRendererComponent")) {
                fluid.getForComponent(component, "updateTemplateMarkup")(container[0], component.model);
            }
        });
        return rootComponent.container[0];
    };

    /** Global workflow functions for fluid.newRendererComponent **/

    fluid.renderer.fetchTemplates = function (shadows) {
        shadows.forEach(function (shadow) {
            var that = shadow.that;
            if (fluid.componentHasGrade(that, "fluid.newRendererComponent")) {
                var parentMarkup = fluid.getForComponent(that, ["options", "parentMarkup"]);
                if (!parentMarkup) {
                    var rendererTemplateResources = fluid.getForComponent(that, ["options", "rendererTemplateResources"]);
                    fluid.each(rendererTemplateResources, function (value, key) {
                        if (value) {
                            fluid.getForComponent(that, ["resources", key]);
                        }
                    });
                }
            }
        });
    };


    fluid.renderer.renderMarkup = function (shadows) {
        // Map of parent renderer's id to list of nested renderer components
        var rendererToComponents = {};
        shadows.forEach(function (shadow) {
            if (fluid.componentHasGrade(shadow.that, "fluid.newRendererComponent")) {
                var rendererComponent = shadow.that;
                var parentRenderer = fluid.resolveContext("fluid.renderer", rendererComponent, true);
                if (!parentRenderer) {
                    fluid.fail("Unable to locate parent renderer from " + fluid.dumpComponentPath(rendererComponent));
                }
                fluid.pushArray(rendererToComponents, parentRenderer.id, rendererComponent);
            }
        });
        fluid.each(rendererToComponents, function (rendererComponents, key) {
            var renderer = fluid.globalInstantiator.idToShadow[key].that;
            fluid.getForComponent(renderer, "render");
            renderer.render(rendererComponents);
        });
    };

})(jQuery, fluid_3_0_0);
