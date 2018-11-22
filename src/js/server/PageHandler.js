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

/* eslint-env node */

"use strict";

var fluid = require("infusion");
fluid.require("%kettle");

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

fluid.defaults("fluid.renderer", {
    gradeNames: "fluid.component"
});

fluid.defaults("fluid.renderer.server", {
    gradeNames: "fluid.renderer",
    invokers: {
        render: {
            funcName: "fluid.renderer.server.render",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

fluid.renderer.server.render = function (renderer, components) {
    console.log("About to render " + components.length + " components to renderer " + fluid.dumpComponentPath(renderer));
    var rootComponent = components[0];
    if (!fluid.componentHasGrade(rootComponent, "fluid.rootPage")) {
        fluid.fail("Must render at least one component, the first of which should be descended from fluid.rootPage - "
           + " the head component was ", rootComponent);
    }
    components.forEach(function (component) {
        fluid.getForComponent(component, "container");
        console.log("Considering component at " + fluid.dumpComponentPath(component));
        console.log("Container option is " + component.options.container);
    });
    renderer.markupTree = components[0].container[0];
};

fluid.renderer.pageHandler.handleGet = function (request) {
    var text = fluid.htmlParser.render(request.markupTree.children);
    request.res.type("html");
    request.events.onSuccess.fire(text);
};
