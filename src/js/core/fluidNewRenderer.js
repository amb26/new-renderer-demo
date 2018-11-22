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

    // Version of core framework's "newViewComponent" with extra mergePolicy for FLUID-5668
    fluid.defaults("fluid.newViewComponent", {
        gradeNames: ["fluid.modelComponent"],
        members: {
            // 3rd argument is throwaway to force evaluation of container
            dom: "@expand:fluid.initDomBinder({that}, {that}.options.selectors, {that}.container)",
            container: "@expand:fluid.container({that}.options.container)"
        },
        mergePolicy: {
            "members.dom": "replace",
            "members.container": "replace"
        }
    });

    fluid.defaults("fluid.newRendererComponent", {
        gradeNames: "fluid.newViewComponent",
        members: {
            // Hack to load resources synchronously given we still don't have FLUID-4982
            resources: "@expand:fluid.loadResourcesQuick({that}.options.resources, {that}.options.selectors)",
            container: "@expand:fluid.resolveTemplateContainer({that}, {that}.options.container)",
            // TODO: use an options distribution or so to distinguish between server and client DOM binders
            dom: {
                expander: {
                    funcName: "fluid.createTemplateDomBinder",
                    args: ["{that}", "{that}.options.selectors", "{that}.container", "{that}.resources.template.parsed"]
                }
            }
        },
        resources: {
            template: {
                dataType: "html"
            }
        },
        workflows: {
            global: {
                renderMarkup: {
                    funcName: "fluid.renderMarkup",
                    priority: "after:resolveModelSkeleton"
                }
            }
        }
    });

    fluid.resolveTemplateContainer = function (that, containerSpec) {
        if (!containerSpec.selectorName || !containerSpec.childIndex) {
            fluid.fail("Cannot resolve container " + that.options.container + " from " + fluid.dumpComponentPath(that)
               + " which did not resolve to a DOM binder resolved element");
        }
        if (fluid.getForComponent(that, "options.parentMarkup")) {
            return containerSpec;
        } else if (that.resources.template) {
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
            var matched = parsedTemplate.matchedSelectors[name][0];
            if (!matched) {
                fluid.fail("Could not match selector " + name + " for template component " + fluid.dumpThat(parentThat)
                   + " at path " + fluid.pathForComponent(parentThat).join(".") + ": available selectors are "
                   + fluid.keys(parsedTemplate.matchedSelectors));
            }
            var navigate = fluid.htmlParser.navigateChildIndices(container[0], matched.childIndices);
            var togo = $(navigate.node);
            togo.selectorName = name;
            togo.parentNode = navigate.parentNode;
            togo.childIndex = navigate.childIndex;
            return togo;
        };
        that.resolvePathSegment = that.locate;

        return that;
    };

    fluid.defaults("fluid.rootPage", {
        gradeNames: "fluid.newRendererComponent",
        container: "/",
        selectors: {
            container: "{that}.options.container"
        },
        members: {
            container: "@expand:fluid.buildRootContainer({that})"
        }
    });

    fluid.buildRootContainer = function (that) {
        var matchedSelectors = that.resources.template.parsed.matchedSelectors;
        var matchedContainer = matchedSelectors.container[0];
        var containerTree = matchedContainer.node;
        var containerCopy = fluid.copy(containerTree);
        var rootDepth = matchedContainer.childIndices.length;
        // TODO: Create a separate area for these rather than bashing the parsed template in place
        fluid.each(matchedSelectors, function (matchedSelector) {
            matchedSelector.forEach(function (oneMatch) {
                oneMatch.childIndices = oneMatch.childIndices.slice(rootDepth);
            });
        });
        return fluid.container(containerCopy);
    };

    fluid.dumpComponentPath = function (component) {
        return "component at path " + fluid.pathForComponent(component).join(".");
    };

    fluid.renderMarkup = function (shadows) {
        var rendererToComponents = {};
        shadows.forEach(function (shadow) {
            if (fluid.componentHasGrade(shadow.that, "fluid.newRendererComponent")) {
                // TODO: hacked loading of resources here
                console.log("Loading resources for " + fluid.dumpComponentPath(shadow.that));
                fluid.getForComponent(shadow.that, "resources");
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

    fluid.loadResourcesQuick = function (resources, selectors) {
        return fluid.transform(resources, function (resource) {
            return fluid.loadOneResourceQuick(resource, selectors);
        });
    };

    fluid.resolveResourceLoader = function (resourceSpec) {
        var loader = fluid.find(fluid.resourceLoader.loaders, function (loader, key) {
            if (resourceSpec[key]) {
                return loader;
            }
        });
        var dataTypeOnly = $.isEmptyObject(fluid.censorKeys(resourceSpec, ["dataType"]));
        if (!loader && !dataTypeOnly) {
            fluid.fail("Couldn't locate resource loader for resource spec ", resourceSpec);
        }
        return loader;
    };

    fluid.loadOneResourceQuick = function (resourceSpec, selectors) {
        var loader = fluid.resolveResourceLoader(resourceSpec);
        var togo = fluid.extend({}, resourceSpec);
        var parseOptions = {
            selectors: selectors
        };
        if (loader) {
            togo.resourceText = loader(resourceSpec);
            if (resourceSpec.dataType === "html") {
                togo.parsed = fluid.htmlParser.parse(togo.resourceText, parseOptions);
                console.log("Parsed templates to ", togo.parsed);
            }
            return togo;
        }
    };

})(jQuery, fluid_3_0_0);
