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

    fluid.defaults("fluid.uiTextBinding", {
        modelRelay: {
            value: {
                target: "dom.container.text",
                source: "{that}.model.value"
            }
        }
    });

    fluid.defaults("fluid.uiValueBinding", {
        modelRelay: {
            value: {
                target: "dom.container.value",
                source: "{that}.model.value"
            }
        }
    });

    fluid.defaults("fluid.uiText", {
        gradeNames: ["fluid.newRendererComponent", "fluid.uiTextBinding"],
        model: {
            // value: any
        },
        resources: {
            template: {
                resourceText: "<span></span>"
            }
        },
        parentMarkup: true
    });

    fluid.defaults("fluid.uiInput", {
        gradeNames: "fluid.polyMarkupComponent",
        model: {
            // value: any
        },
        resources: {
            template: {
                resourceText: "<input type=\"text\"/>"
            }
        },
        markupChecks: {
            "fluid.uiValueBinding": {
                selector: "",
                tagName: "input"
            },
            "fluid.uiTextBinding": {}
        },
        parentMarkup: true
    });

    fluid.defaults("fluid.polyMarkupComponent", {
        gradeNames: "fluid.newRendererComponent"
    });

    // Applied by hand by the renderer
    fluid.polyMarkupComponent.check = function (that) {
        var checks = fluid.getForComponent(that, ["options", "markupChecks"]);
        var grade = fluid.find(checks, function (value, grade) {
            if (value.selector !== undefined) {
                var container = that.dom.container;
                var fullSelector = "#" + container[0].id + " " + value.selector; // TODO: Deal with prefixing comma selectors by splitting and rejoining
                var nodes = that.dom.doQuery(fullSelector, "*");
                var tags = fluid.makeArray(value.tagName);
                if (nodes.length > 0 && tags.includes(nodes[0].tagName.toLowerCase())) {
                    return grade;
                }
            } else {
                return grade;
            }
        });
        if (grade !== undefined) {
            var shadow = fluid.shadowForComponent(that);
            var upDefaults = fluid.defaults(grade);
            // Cheapskate strategy - grade content will be wrong since we can't be bothered to hack into computeDynamicGrades and its malignly hidden "rec" structure
            shadow.mergeOptions.mergeBlocks.push(fluid.generateExpandBlock({
                options: upDefaults,
                recordType: "polyMarkupBindings",
                priority: fluid.mergeRecordTypes.distribution
            }, that, {}));
            // Note that this limits us to only handling long-form relay records since we bypass all the machinery of the mergePolicy and the weird special-case logic
            // inside fluid.establishModelRelay
            fluid.each(upDefaults.modelRelay, function (mrrec, key) {
                fluid.parseModelRelay(that, mrrec, key);
            });
            shadow.mergeOptions.updateBlocks();
            return true;
        }
        return false;
    };

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
