/**
 * New Renderer Demo App
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

require("../src/serverRendererIndex.js");

fluid.renderer.loadModule("%new-renderer-demo/textfieldControl");

require("./DemoPage.js");
    
fluid.defaults("fluid.demos.demoApp", {
    gradeNames: "kettle.app",
    requestHandlers: {
        getHandler: {
            type: "fluid.demos.demoPageHandler",
            route: "/demoApp",
            method: "get"
        }
    }
});

fluid.defaults("fluid.demos.demoPageHandler", {
    gradeNames: "fluid.renderer.pageHandler",
    components: {
        page: {
            type: "fluid.demos.demoPage"
        }
    }
});

fluid.defaults("fluid.demos.server", {
    gradeNames: "kettle.server",
    port: 8085,
    components: {
        app: {
            type: "fluid.demos.demoApp"
        }
    }
});

var server = fluid.demos.server();

fluid.defaults("fluid.demos.client", {
    gradeNames: "kettle.dataSource.URL",
    url: "http://localhost:8085/demoApp",
    components: {
        encoding: {
            type: "kettle.dataSource.encoding.none"
        }
    }
});

var client = fluid.demos.client();

client.get().then(function (markup) {
    console.log("Received markup ", markup);
    server.destroy();
}, function (error) {
    console.log("Received *ERROUR* ");
    server.destroy();
});