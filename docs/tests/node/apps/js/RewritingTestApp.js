/* eslint-env node */

"use strict";

fluid.defaults("fluid.tests.renderer.rewritingPage", {
    gradeNames: "fluid.rootPage",
    resources: {
        template: {
            path: "%new-renderer-demo/tests/node/apps/html/RewritingTestApp.html"
        }
    }
});
