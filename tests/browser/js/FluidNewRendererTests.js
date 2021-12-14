/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global jqUnit, QUnit */

"use strict";

fluid.registerNamespace("fluid.tests.renderer");

fluid.defaults("fluid.tests.renderer.fontSelect", {
    gradeNames: "fluid.uiSelect",
    model: {
        value: "default",
        optionValues: ["default", "times", "comic", "arial", "verdana", "open-dyslexic"],
        optionLabels: ["Default", "Times New Roman", "Comic Sans", "Arial", "Verdana", "Open Dyslexic"]
    }
});

fluid.tests.renderer.fontSelect.expectedNodes = function (that) {
    return that.model.optionValues.map(function (value, index) {
        var expected = {
            nodeName: "option",
            value: value,
            nodeText: that.model.optionLabels[index]
        };
        return expected;
    });
};

jqUnit.test("Test UISelect rendering and binding", function () {
    var sel = fluid.tests.renderer.fontSelect("#uiselect-test");
    var options = sel.locate("options");
    jqUnit.assertEquals("Rendered correct number of options nodes", 6, options.length);
    var expected = fluid.tests.renderer.fontSelect.expectedNodes(sel);
    jqUnit.assertNode("Rendered expected markup", expected, options);
    jqUnit.assertEquals("Expected value selected", "default", sel.container.val());
    sel.container.val("arial");
    jqUnit.assertEquals("Expected value selected through UI", "arial", sel.container.val());
    sel.applier.change("value", "verdana");
    jqUnit.assertEquals("Expected value selected through model", "verdana", sel.container.val());
});

fluid.defaults("fluid.tests.renderer.fontSelectNodes", {
    gradeNames: "fluid.uiSelect",
    styles: [undefined, "fl-font-times", "fl-font-comic-sans", "fl-font-arial", "fl-font-arial", "fl-font-open-dyslexic"],
    model: {
        value: "default",
        optionValues: ["default", "times", "comic", "arial", "verdana", "open-dyslexic"],
        optionLabels: ["Default", "Times New Roman", "Comic Sans", "Arial", "Verdana", "Open Dyslexic"]
    },
    modelRelay: {
        target: "optionNodes",
        func: "fluid.tests.renderer.fontSelect.makeNodes",
        args: ["{that}.model.optionValues", "{that}.options.styles"]
    }
});

jqUnit.test("Test UISelect rendering and binding with decorator, relabelling", function () {
    var sel = fluid.tests.renderer.fontSelectNodes("#uiselect-test");
    var options = sel.locate("options");
    jqUnit.assertEquals("Rendered correct number of options nodes", 6, options.length);
    var expected = fluid.tests.renderer.fontSelect.expectedNodes(sel);
    expected.forEach(function (oneNode, index) {
        oneNode["class"] = fluid.makeArray(sel.options.styles[index]).concat("fl-preview-theme").join(" ");
        oneNode.index = "" + index;
    });
    jqUnit.assertNode("Rendered expected markup", expected, options);
    var newLabels = sel.model.optionLabels.map(function (label) {
        return "New " + label;
    });
    sel.applier.change("optionLabels", newLabels);
    expected.forEach(function (oneNode, index) {
        oneNode.nodeText = newLabels[index];
    });
    // Also verifies that the DOM nodes were not replaced
    jqUnit.assertNode("Node labels updated", expected, options);
});

fluid.tests.renderer.fontSelect.makeNodes = function (values, styles) {
    return values.map(function (value, index) {
        return {
            "class": fluid.arrayToHash(fluid.makeArray(styles[index]).concat("fl-preview-theme")),
            "attr": {
                index: "" + index
            }
        };
    });
};


// This test used to rely on not actually rendering. Probably the only way to restore this is to white-box by producing
// the "snapshot" mode that will be used by server rendering
/*
fluid.defaults("fluid.tests.frontierTest", {
    gradeNames: "fluid.newRendererComponent",
    selectors: {
        rendererSelector: ".renderer-selector",
        nonRendererSelector: ".nonrenderer-selector"
    },
    model: {
        sources: [1, 2, 3]
    },
    dynamicComponents: {
        renderChildren: {
            sources: "{that}.model.sources",
            // Note that we already couldn't make this fluid.viewComponent since otherwise the default resolution of fluid.component would fail
            // through finding multiple containers
            type: "fluid.newRendererComponent",
            container: "{that}.dom.rendererSelector",
            options: {
                parentMarkup: true
            }
        }
    }
});

jqUnit.test("Frontier test", function () {
    var that = fluid.tests.frontierTest("#frontier-test");
    var frontier = that.dom.locate("rendererSelector");
    jqUnit.assertEquals("Frontier size: 2", 2, frontier.length);
});

jqUnit.test("Bad template structure test", function () {
    jqUnit.expectFrameworkDiagnostic("Template with badly nested renderer selector target", function () {
        fluid.tests.frontierTest("#bad-template");
    }, ["structure", "rendererSelector"]);
});
*/

fluid.tests.renderer.sentinelize = function (name, selector) {
    jqUnit.test("Sentinelization test: " + name, function () {
        var node = $(selector)[0];
        fluid.renderer.sentinelize(node.parentNode, node);
        jqUnit.assertTrue("Sentinel created", fluid.renderer.isSentinel(node.nextSibling));
        fluid.renderer.sentinelize(node.parentNode, node);
        jqUnit.assertTrue("Sentinel still there", fluid.renderer.isSentinel(node.nextSibling));
        jqUnit.assertFalse("Sentinel creation idempotent", fluid.renderer.isSentinel(node.nextSibling.nextSibling));
    });
};

fluid.tests.renderer.sentinelize("General element", "#frontier-test");
fluid.tests.renderer.sentinelize("Terminal element", "#sentinel-test");

fluid.defaults("fluid.tests.renderTest", {
    gradeNames: "fluid.newRendererComponent",
    selectors: {
        rendererSelector: ".renderer-selector"
    },
    parentMarkup: true,
    model: {
        sources: [1, 2, 3]
    },
    dynamicComponents: {
        renderChildren: {
            sources: "{that}.model.sources",
            type: "fluid.tests.renderTestChild",
            container: "{that}.dom.rendererSelector",
            options: {
                model: {
                    value: "{source}"
                }
            }
        }
    }
});

fluid.defaults("fluid.tests.renderTestChild", {
    gradeNames: "fluid.newRendererComponent",
    selectors: {
        leaf: ".nested-leaf"
    },
    parentMarkup: true,
    modelRelay: {
        renderLeaf: {
            target: "{that}.model.dom.leaf.text",
            source: "{that}.model.value"
        }
    }
});

jqUnit.test("Basic render test", function () {
    var that = fluid.tests.renderTest("#render-test");
    var rendered = that.dom.locate("rendererSelector");
    jqUnit.assertEquals("Rendered size: 3", 3, rendered.length);
    Array.prototype.forEach.call(rendered, function (element, index) {
        jqUnit.assertNode("Expected node rendering", {
            nodeName: "div",
            "class": "renderer-selector first"
        }, element);
        var leaf = $(".nested-leaf", element);
        jqUnit.assertNode("Expected leaf rendering", {
            nodeName: "div",
            "class": "nested-leaf",
            nodeText: "" + (index + 1)
        }, leaf);
    });
});

jqUnit.test("Markup polymorphism test", function () {
    var that = fluid.uiInput("#poly-test-input", {
        model: {
            value: "from model"
        }
    });
    jqUnit.assertEquals("Markup-based polymorphic input has successfully bound", "from model", that.container.val());

    var that2 = fluid.uiInput("#poly-test-textarea", {
        model: {
            value: "from model"
        }
    });
    jqUnit.assertEquals("Markup-based polymorphic input has successfully bound", "from model", that2.container.val());
});

fluid.defaults("fluid.tests.staticSelectorSubpanel", {
    gradeNames: "fluid.newRendererComponent",
    container: ".line-space-panel",
    resources: {
        template: {
            path: "%new-renderer-demo/tests/browser/data/SubPanel.html"
        }
    },
    selectors: {
        nestedElement: ".template-nested-element"
    }
});

// Test similar to prefs framework panel layout with static container selector held as part of a subcomponent definition
fluid.defaults("fluid.tests.staticSelectorParent", {
    gradeNames: "fluid.newRendererComponent",
    resources: {
        template: {
            path: "%new-renderer-demo/tests/browser/data/RootPanel.html"
        }
    },
    components: {
        subpanel: {
            type: "fluid.tests.staticSelectorSubpanel"
        }
    }
});

jqUnit.asyncTest("Static selector and template test", function () {
    var that = fluid.tests.staticSelectorParent("#static-selector");
    that.events.onCreate.then(function () {
        var nested = that.subpanel.dom.locate("nestedElement");
        jqUnit.assertValue("Nested element rendered into DOM", nested);
        jqUnit.assertNode("Expected node rendering", {
            nodeName: "div",
            "class": "template-nested-element"
        }, nested);
        jqUnit.start();
    });
});

// TODO: Put something like this in core jqUnit
// Double TODO: Reform framework error handling so that async failure can be detected by rejection of top-level that.events.onCreate
jqUnit.expectFrameworkDiagnosticAsync = function (message, toInvoke, errorTexts) {
    errorTexts = fluid.makeArray(errorTexts);
    var assert = function (args) {
        var fullText = fluid.transform(args, fluid.renderLoggingArg).join("");
        errorTexts.forEach(function (errorText) {
            jqUnit.assertTrue(message + " - message text must contain " + errorText, fullText.indexOf(errorText) >= 0);
        });
        fluid.failureEvent.removeListener("jqUnit");
        fluid.failureEvent.removeListener("fail");
        QUnit.config.current.ignoreGlobalErrors = true;
        fluid.invokeLater(jqUnit.start);
        throw new fluid.FluidError("Restart exception"); // Cancel the current stack
    };
    fluid.failureEvent.addListener(fluid.identity, "jqUnit");
    fluid.failureEvent.addListener(assert, "fail");
    toInvoke();
};

jqUnit.asyncTest("Static selector and template test with error", function () {
    jqUnit.expectFrameworkDiagnosticAsync("Got framework exception with selector diagnostic", function () {
        fluid.tests.staticSelectorParent("#static-selector-error", {
            resources: {
                template: {
                    path: "%new-renderer-demo/tests/browser/data/RootPanelError.html"
                }
            }
        });
    }, ".line-space-panel");
});
