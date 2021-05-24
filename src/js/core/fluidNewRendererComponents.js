/*
Copyright 2020 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.uiText", {
        model: {
            // value: any
        },
        modelRelay: {
            value: {
                target: "dom.container.text",
                source: "{that}.model.value"
            }
        },
        resources: {
            template: {
                resourceText: "<span></span>"
            }
        }
    });

    fluid.defaults("fluid.uiInput", {
        gradeNames: "fluid.polyMarkupComponent",
        model: {
            // value: any
        },
        modelRelay: {
            value: {
                target: "dom.container.value",
                source: "{that}.model.value"
            }
        },
        resources: {
            template: {
                resourceText: "<input type=\"text\"/>"
            }
        }
    });

    fluid.defaults("fluid.uiLink", {
        gradeNames: "fluid.newRendererComponent",
        parentMarkup: true,
        model: {
            // target: string
            // linkText: string (optional)
        },
        modelRelay: {
            linkTarget: {
                target: "dom.container.attrs.href",
                source: "{that}.model.target"
            },
            linkText: {
                target: "dom.container.text",
                source: "{that}.model.linkText"
            }
        },
        resources: {
            template: {
                resourceText: "<a href=\"#\">Placeholder text</a>"
            }
        }
    });

    /** Could be supported some day via some variety of AFFERENT POLYMORPHISM but the reusability value seems low -
     * the user is far more likely to simply specify the relay rule onto the relevant attribute inline as above
     */
    /*
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
    */

})(jQuery, fluid_3_0_0);
