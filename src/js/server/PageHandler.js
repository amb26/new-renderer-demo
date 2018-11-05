/**
 * Renderer Markup Handler
 *
 * Copyright 2018 Raising The Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * You may obtain a copy of the License at
 * https://github.com/fluid-project/kettle/blob/master/LICENSE.txt
 */

"use strict";

var fluid = require("infusion"),
    kettle = fluid.require("%kettle");

fluid.registerNamespace("fluid.renderer.pageHandler");

fluid.defaults("fluid.renderer.pageHandler", {
    gradeNames: ["kettle.request.http", "fluid.renderer.server"],
    invokers: {
        handleRequest: {
            funcName: "fluid.renderer.pageHandler.handleGet"
        }
    },
    member: {
        markupTree: null
    },
    components: {
        page: { // TODO: overridden by clients
            type: "fluid.emptySubcomponent"
        }
    }
});

fluid.defaults("fluid.renderer.server", {
    gradeNames: "fluid.viewComponent",
    workflows: {
       // We are here. The component tree starting at "page" will be instantiated for real, but against the 
       // "standalone" jQuery virtual DOM. This will be "woven into existence" as each component constructs,
       // with its root ending up in "markupTree". The "renderer workflow" will wait for the total model of the
       // tree to stabilise and then locate all markup templates, parse them into subtrees with the
       // "placeholder markers" where selectors bite, and then instantiate them, binding to the container
       // nodes. "onCreate" will then fire and perhaps make some last-minute adjustments.
    }
});

fluid.renderer.pageHandler.handleGet = function (request) {
    var text = fluid.htmlParser.render(request.markupTree);
    request.res.type("html");
    request.events.onSuccess.fire(text);
};
