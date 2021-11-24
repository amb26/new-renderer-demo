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

/* global jqUnit */

"use strict";

fluid.registerNamespace("fluid.tests.renderer");

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
