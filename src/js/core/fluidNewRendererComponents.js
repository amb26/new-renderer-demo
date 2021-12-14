/*
Copyright 2020 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

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

// fluid.uiSelect's implementation uses a transitional "extremely lightweight materialised virtual DOM" strategy
// since we are too afraid to create a whole component and relays for every <option> element. As well as optionLabels
// and optionValues representing the names and values of the selection controls, a parallel array optionNodes
// encodes any decorations to the nodes encoded as "attr" or "class" maps in the same format accepted by materialisers
// of the same names. We currently only support single selection and a plain HTML <select> element.
fluid.defaults("fluid.uiSelect", {
    gradeNames: ["fluid.newRendererComponent", "fluid.uiValueBinding"],
    parentMarkup: true,
    selectors: {
        options: "option"
    },
    model: {
        // value: String
        // optionLabels: String[]
        // optionValues: String[]
        // optional "virtual DOM" representation using the same addressing scheme as DOM materialisation - currently
        // only supports attr and class
        // optionNodes: Object[]
    },
    modelListeners: {
        relabel: {
            path: "optionLabels",
            listener: "fluid.uiSelect.updateLabels",
            args: ["{that}", "{change}.value"],
            excludeSource: "init"
        }
    },
    resources: {
        template: {
            resourceText: "<select></select>"
        }
    },
    listeners: {
        "onDomBind.render": {
            funcName: "fluid.uiSelect.initialRender",
            priority: "first" // TODO: The binding listeners in FluidView should have priorities
        }
    }
});

// A lightweight representation of the few materialisers we support for direct application - in theory we should
// have factored fluid.materialiserRegistry better so we could access these functions, but they are very small
fluid.registerNamespace("fluid.renderer.lightMaterialisers");

fluid.renderer.lightMaterialisers.attr = function (jNode, payload) {
    jNode.attr(payload);
};

fluid.renderer.lightMaterialisers["class"] = function (jNode, payload) {
    fluid.each(payload, function (value, key) {
        jNode.toggleClass(key, !!value);
    });
};

// Very basic initial implementation that is unidirectional with respect to markup - any initial contents are
// blasted on startup and written from model contents
fluid.uiSelect.initialRender = function (that) {
    var containerNode = that.container[0];
    var dokkument = containerNode.ownerDocument;
    var optionLabels = that.model.optionLabels,
        optionValues = that.model.optionValues,
        optionNodes = that.model.optionNodes;
    that.container.empty();
    if (!optionLabels || !optionValues) {
        fluid.fail("UISelect component must be supplied optionLabels and optionValues arrays: " + fluid.dumpComponentAndPath(that));
    }
    if (optionLabels.length !== optionValues.length) {
        fluid.fail("UISelect component must be supplied optionLabels and optionValues arrays of equal length: " + fluid.dumpComponentAndPath(that));
    }
    optionValues.forEach(function (optionValue, index) {
        var node = dokkument.createElement("option");
        var jNode = $(node);
        jNode.attr("value", optionValues[index]);
        jNode.text(optionLabels[index]);
        fluid.each(optionNodes && optionNodes[index], function (mVal, mKey) {
            fluid.renderer.lightMaterialisers[mKey](jNode, mVal);
        });
        containerNode.appendChild(node);
    });
};

fluid.uiSelect.updateLabels = function (that, newLabels) {
    var options = that.locate("options");
    fluid.each(newLabels, function (label, index) {
        options[index].textContent = label;
    });
};

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
            target: "dom.container.attr.href",
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
