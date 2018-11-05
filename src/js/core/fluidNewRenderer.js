/*
Copyright 2018 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";
    
    fluid.defaults("fluid.newRendererComponent", {
        gradeNames: "fluid.newViewComponent",
        members: {
            // Hack to load resources synchronously given we still don't have FLUID-4982
            resources: "@expand:fluid.loadResourcesQuick({that}.options.resources, {that}.options.selectors, {that}.options.container)"
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

    fluid.defaults("fluid.rootPage", {
        gradeNames: "fluid.newViewComponent",
        container: "html",
        members: {
            container: "@expand:fluid.container({that}.resource.template.parsedSelectors.container)"
        }
    });


    fluid.renderMarkup = function (shadows) {
        shadows.forEach(function (shadow) {
            if (fluid.componentHasGrade(shadow.that, "fluid.newRendererComponent")) {
                fluid.getForComponent(shadow.that.resources);
            }
        });
    };

    fluid.loadResourcesQuick = function (resources, selectors, container) {
        var allSelectors = $.extend({
            container: container
        }, 
            selectors
        );
        return fluid.transform(resources, function (resource) {
            fluid.loadOneResourceQuick(allSelectors)
        });
    };

    fluid.resolveResourceLoader = function (resourceSpec) {
         var loader = fluid.find(fluid.resourceLoaders.loader, function (loader, key) {
             if (resourceSpec[key]) {
                 return loader;
             }
         });
         if (!loader) {
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
        togo.resourceText = loader(resourceSpec);
        if (resourceSpec.dataType === "html") {
            togo.parsed = fluid.htmlParser.parse(togo.resourceText, parseOptions);
        }
    };

})(jQuery, fluid_3_0_0);
