/* eslint-env node */

"use strict";

fluid.defaults("fluid.tests.renderer.renderingPage", {
    gradeNames: "fluid.rootPage",
    resources: {
        template: {
            path: "%new-renderer-demo/tests/node/apps/html/RenderingTestApp.html"
        }
    },
    selectors: {
        testComponentInclude: ".test-component-include"
    },
    components: {
        testComponentInclude: {
            container: "{that}.dom.testComponentInclude",
            type: "fluid.tests.rendererComponent",
            options: {
                model: {
                    value: 4
                }
            }
        }
    }
});
