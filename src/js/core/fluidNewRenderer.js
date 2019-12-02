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

    fluid.createRendererDomBinder = function (that, parentMarkup, createTemplateDomBinder, createBrowserDomBinder) {
        return parentMarkup ? createBrowserDomBinder() : createTemplateDomBinder();
    };

    fluid.defaults("fluid.newRendererComponent", {
        gradeNames: ["fluid.newViewComponent", "fluid.resourceLoader"],
        members: {
            container: "@expand:fluid.resolveTemplateContainer({that}, {that}.options.container)",
            // TODO: use an options distribution/contextAwareness to distinguish between server and client DOM binders
            dom: {
                expander: {
                    funcName: "fluid.createRendererDomBinder",
                    args: ["{that}", "{that}.options.parentMarkup", "{that}.createTemplateDomBinder", "{that}.createBrowserDomBinder"]
                }
            }
        },
        invokers: {
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
        // Configure a map here of all templates which should be pre-fetched during fetchTemplates so that they are
        // ready for renderMarkup
        rendererTemplates: {
            template: true
        },
        // Set to `true` if there is no template and/or the component expects to render into markup provided by parent
        parentMarkup: false,
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

    fluid.resolveTemplateContainer = function (that, containerSpec) {
        var fail = function (extraMessage) {
            fluid.fail("Cannot resolve container ", containerSpec, " from " + fluid.dumpComponentPath(that) + extraMessage);
        };
        if (!containerSpec.selectorName) {
            fail(" which did not resolve to a DOM binder resolved element");
        }
        if (fluid.getForComponent(that, "options.parentMarkup")) {
            return containerSpec;
        } else if (that.resources.template) {
            if (!containerSpec.childIndex) {
                fail(" which is not a template matchedSelector");
            }
            // Find the target location in the parent's document where we might write our own template to
            // form our own container
            var parentNode = containerSpec.parentNode;
            var container = fluid.buildRootContainer(that);
            parentNode.children[containerSpec.childIndex] = container[0];
            return container;
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
        gradeNames: "fluid.newRendererComponent",
        container: "/"
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
        }
    });

    /** Global workflow function for fluid.newRendererComponent **/

    fluid.renderer.fetchTemplates = function (shadows) {
        shadows.forEach(function (shadow) {
            var that = shadow.that;
            if (fluid.componentHasGrade(that, "fluid.newRendererComponent")) {
                var parentMarkup = fluid.getForComponent(that, ["options", "parentMarkup"]);
                if (!parentMarkup) {
                    var rendererTemplates = fluid.getForComponent(that, ["options", "rendererTemplates"]);
                    fluid.each(rendererTemplates, function (value, key) {
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
