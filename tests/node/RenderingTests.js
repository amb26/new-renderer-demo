/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle");

kettle.loadTestingSupport();

fluid.require("%new-renderer-demo");

require("./support/RendererTestSupport.js");

require("./apps/js/RenderingTestApp.js");

fluid.renderer.loadModule("%new-renderer-demo");
fluid.renderer.loadModule("%new-renderer-demo/tests/node/node_modules/renderer-test-module");

fluid.defaults("fluid.tests.renderingApp", {
    gradeNames: "fluid.renderer.autoMountRendererModulesApp",
    requestHandlers: {
        getHandler: {
            type: "fluid.renderer.pageRequestHandler",
            route: "/renderingApp",
            method: "get",
            options: {
                pageGrade: "fluid.tests.renderer.renderingPage"
            }
        }
    }
});

fluid.defaults("fluid.tests.rendering.config", {
    appGrade: "fluid.tests.renderingApp",
    name: "Rendering test",
    message: "Received expected rendered markup",
    expectedMarkup: "%new-renderer-demo/tests/node/apps/expected/RenderingTestExpected.html",
    expectedStatusCode: 200,
    distributeOptions: {
        path: {
            target: "{that testRequest}.options.path",
            record: "/renderingApp"
        }
    }
});

fluid.tests.rendering.testDefs = [
    "fluid.tests.rendering.config"
];

fluid.renderer.tests.executeTests(fluid.tests.rendering.testDefs, "fluid.renderer.testDefTemplate");
