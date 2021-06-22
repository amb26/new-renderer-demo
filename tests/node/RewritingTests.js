/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle");

kettle.loadTestingSupport();

fluid.require("%new-renderer-demo");

require("./support/RendererTestSupport.js");

require("./apps/js/RewritingTestApp.js");

fluid.renderer.loadModule("%new-renderer-demo");
// We only load this so that includes and hence static mount table are stable across tests
fluid.renderer.loadModule("%new-renderer-demo/tests/node/node_modules/renderer-test-module");

fluid.defaults("fluid.tests.rewritingApp", {
    gradeNames: "fluid.renderer.autoMountRendererModulesApp",
    requestHandlers: {
        getHandler: {
            type: "fluid.renderer.pageRequestHandler",
            route: "/rewritingApp",
            method: "get",
            options: {
                pageGrade: "fluid.tests.renderer.rewritingPage"
            }
        }
    }
});

fluid.defaults("fluid.tests.rewriting.config", {
    appGrade: "fluid.tests.rewritingApp",
    name: "Rewriting test",
    message: "Received expected rewritten markup",
    expectedMarkup: "%new-renderer-demo/tests/node/apps/expected/RewritingTestExpected.html",
    expectedStatusCode: 200,
    distributeOptions: {
        path: {
            target: "{that testRequest}.options.path",
            record: "/rewritingApp"
        }
    }
});

fluid.tests.rewriting.testDefs = [
    "fluid.tests.rewriting.config"
];

fluid.renderer.tests.executeTests(fluid.tests.rewriting.testDefs, "fluid.renderer.testDefTemplate");
