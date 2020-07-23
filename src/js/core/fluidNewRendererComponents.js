/*
Copyright 2020 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    // Mix this in to any fluid.leafRendererComponent under a fluid.renderer.template in order to keep it live
    fluid.defaults("fluid.templateLeafRendererComponent", {
        modelListeners: {
            updateTemplateMarkup: {
                path: "",
                func: "{that}.updateTemplateMarkup",
                args: ["{that}.container.0", "{change}.value"]
            }
        }
    });

    fluid.defaults("fluid.leafRendererComponent", {
        gradeNames: "fluid.newRendererComponent",
        invokers: {
            updateTemplateMarkup: {
                // signature: container node, model contents
                funcName: "fluid.notImplemented"
            }
        },
        parentMarkup: true
    });

    fluid.defaults("fluid.uiValue", {
        gradeNames: "fluid.leafRendererComponent",
        model: {
            // value: any
        },
        invokers: {
            updateTemplateMarkup: {
                funcName: "fluid.uiValue.updateTemplateMarkup",
                // container node, new model
                args: ["{arguments}.0", "{that}.options.verbatim", "{arguments}.1"]
            }
        },
        resources: {
            template: {
                resourceText: "<span></span>"
            }
        },
        verbatim: false
    });

    // See old fluidRenderer.js renderComponent

    fluid.registerNamespace("fluid.uiValue.template");

    fluid.uiValue.updateTemplateMarkup = function (node, verbatim, model) {
        if (typeof(model.value) !== "string") {
            fluid.fail("uiValue component is missing required model field \"value\": model contents are ", model);
        }
        var encodedValue = verbatim ? model.value : fluid.XMLEncode(model.value);
        var tagName = node.tagName;
        if (tagName === "input") {
            fluid.setImmediate(node, ["attrs", "value"], encodedValue);
        } else {
            node.children = [{text: encodedValue}];
        }
    };

    fluid.defaults("fluid.uiLink", {
        gradeNames: "fluid.leafRendererComponent",
        model: {
            // target: string
            // linktext: string (optional)
        },
        invokers: {
            updateTemplateMarkup: {
                funcName: "fluid.uiLink.updateTemplateMarkup",
                // container node, new model
                args: ["{arguments}.0", "{that}.options.verbatim", "{arguments}.1"]
            }
        },
        resources: {
            template: {
                resourceText: "<a href=\"#\">Placeholder text</a>"
            }
        }
    });

    fluid.uiLink.attributeMap = { // From old fluidRenderer.js
        a: "href",
        link: "href",
        img: "src",
        frame: "src",
        script: "src",
        style: "src",
        input: "src",
        embed: "src",
        form: "action",
        applet: "codebase",
        object: "codebase"
    };

    fluid.uiLink.updateTemplateMarkup = function (node, verbatim, model) {
        if (typeof(model.target) !== "string") {
            fluid.fail("uiLink component is missing required model field \"target\": model contents are ", model);
        }
        var encodedTarget = fluid.XMLEncode(model.target);
        var tagName = node.tagName;
        var linkAttr = fluid.uiLink.attributeMap[tagName] || "href";
        fluid.model.setSimple(node, ["attrs", linkAttr], encodedTarget);
        if (typeof(model.linktext) === "string") {
            node.children = [{
                text: fluid.XMLEncode(model.linktext)
            }];
        }
    };

})(jQuery, fluid_3_0_0);
