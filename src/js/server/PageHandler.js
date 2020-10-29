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

// Core grade managing rendering functionality, independent of delivery scheme
fluid.defaults("fluid.renderer.pageHandler", {
    gradeNames: "fluid.renderer.server",
    member: {
        // The renderer workflow accumulates the virtual DOM tree into this member during component construction
        markupTree: null
    },
    components: {
        page: { // TODO: overridden by clients with something derived from fluid.rootPage
            type: "fluid.rootPage"
        }
    }
});

// The handler as middleware
fluid.defaults("fluid.renderer.pageMiddleware", {
    gradeNames: ["kettle.middleware", "fluid.renderer.pageHandler"],
    invokers: {
        handle: {
            funcName: "kettle.plainMiddleware.resolve"
        }
    }
});

/**
 * @param {fluid.renderer.pageHandler} request - The pageHandler request in progress in the server
 * @return {fluid.promise} A promise resolving the rendered markup as a String
 */
fluid.renderer.pageHandler.handle = function (request) {
    var text = fluid.htmlParser.render(request.markupTree.children);
    request.res.type("html");
    return fluid.promise().resolve(text);

};

// The handler as a requestHandler - we should really abolish this silly distinction in next Kettle
// TODO: Write tests that verify error behaviour
fluid.defaults("fluid.renderer.pageRequestHandler", {
    gradeNames: ["kettle.request.http", "fluid.renderer.pageHandler"],
    distributeOptions: {
        record: {
            namespace: "toKettleRequest",
            func: "fluid.renderer.signalResourceError",
            args: ["{kettle.request.http}", "{arguments}.0"]
        },
        target: "{that fluid.resourceLoader}.options.listeners.onResourceError"
    },
    invokers: {
        handleRequest: {
            funcName: "fluid.renderer.pageHandler.handleGet"
        }
    }
});

fluid.renderer.signalResourceError = function (request, error) {
    error.statusCode = 404;
    request.events.onError.fire(error);
};

fluid.renderer.pageHandler.handleGet = function (request) {
    var togo = fluid.renderer.pageHandler.handle(request);
    togo.then(request.events.onSuccess.fire);
};
