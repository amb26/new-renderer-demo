/**
 * Renderer Markup Page Handler
 *
 * Copyright 2018 Raising The Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * You may obtain a copy of the License at
 * https://github.com/fluid-project/kettle/blob/master/LICENSE.txt
 */

/* eslint-env node */

"use strict";

var fluid = require("infusion");
fluid.require("%kettle");

fluid.defaults("fluid.renderer.pageHandler", {
    gradeNames: ["kettle.request.http", "fluid.renderer.server"],
    invokers: {
        handleRequest: {
            funcName: "fluid.renderer.pageHandler.handleGet"
        }
    },
    member: {
        // The renderer workflow accumulates the virtual DOM tree into this member during component construction
        markupTree: null
    },
    components: {
        page: { // TODO: overridden by clients with something derived from fluid.rootPage
            type: "fluid.emptySubcomponent"
        }
    }
});

/** @param {fluid.renderer.pageHandler} request - The pageHandler request in progress in the server
 */
fluid.renderer.pageHandler.handleGet = function (request) {
    var text = fluid.htmlParser.render(request.markupTree.children);
    request.res.type("html");
    request.events.onSuccess.fire(text);
};
