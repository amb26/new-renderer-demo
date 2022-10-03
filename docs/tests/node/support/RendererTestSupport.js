/**
 * Renderer Server Test Support
 *
 * Copyright 2021 Raising The Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * You may obtain a copy of the License at
 * https://github.com/fluid-project/kettle/blob/main/LICENSE.txt
 */

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    kettle = fluid.require("%kettle");

var fs = require("fs");
var jqUnit = fluid.registerNamespace("jqUnit");

var jsonDiff = require("json-diff");

kettle.loadTestingSupport();

// Copied over partially from SingleRequestTestDefs.js with the same caveat:
// TODO: this should never work if the server constructs asynchronously - need to merge with
// kettle.test.serverEnvironment infrastructure
fluid.defaults("fluid.renderer.tests.common.config", {
    gradeNames: "fluid.component",
    components: {
        server: {
            type: "kettle.server",
            options: {
                port: 8087,
                components: {
                    app: {
                        type: "kettle.app"
                    }
                }
            }
        }
    }
});

/** Merge the config testDefs, generate their grades derived from
 * "fluid.renderer.tests.common.config" and execute them **/

/**
 * @param {String[]} testDefs - An array of the grade names holding
 *     "hollow grades" to be merged into full fixtures
 * @param {String} testDefTemplateGrade - The grade holding the
 *     "test def template" including the actual test sequence and assertion
 *     defaults to be merged into the hollow grades
 * @param {Boolean} errorExpect - `true` If the `expect` count for the fixtures
 *     is to be derived based on the `errorTexts` option.
 */

fluid.renderer.tests.executeTests = function (testDefs, testDefTemplateGrade, errorExpect) {
    fluid.each(testDefs, function (testDefGrade) {
        var testDefDefaults = fluid.defaults(testDefGrade);
        var mergedConfigName = testDefGrade + ".mergedConfig";
        fluid.defaults(mergedConfigName, {
            gradeNames: "fluid.renderer.tests.common.config",
            distributeOptions: {
                target: "{that kettle.server}.options.components.app.type",
                record: testDefDefaults.appGrade
            }
        });
        var mergedTestDefName = testDefGrade + ".mergedTestDef";
        fluid.defaults(mergedTestDefName, {
            gradeNames: [testDefTemplateGrade, testDefGrade]
        });
        var fullTestDef = fluid.copy(fluid.defaults(mergedTestDefName));
        fullTestDef.configType = mergedConfigName;
        if (errorExpect) {
            fullTestDef.expect = 2 + fluid.makeArray(fullTestDef.errorTexts).length;
        } else {
            fullTestDef.expect = 2;
        }
        kettle.test.bootstrapServer(fullTestDef);
    });
};

fluid.renderer.tests.markupToJSON = function (markup) {
    var node = fluid.htmlParser.parseMarkup(markup, true);
    var canon = fluid.renderer.tests.nodeToJSON(node);
    return canon;
};

fluid.renderer.tests.assertResponse = function (options) {
    kettle.test.assertResponseStatusCode(options, options.expectedStatusCode);
    var expectedMarkup = fs.readFileSync(fluid.module.resolvePath(options.expectedMarkup), "utf8");
    var expectedCanon = fluid.renderer.tests.markupToJSON(expectedMarkup);
    var actualCanon = fluid.renderer.tests.markupToJSON(options.string);

    var diff = jsonDiff.diff(expectedCanon, actualCanon);
    if (diff) {
        console.log("JSON-structured markup diff report: ");
        console.log(jsonDiff.diffString(expectedCanon, actualCanon));
    }
    jqUnit.assertDeepEq("Expected markup returned", expectedCanon, actualCanon);
    console.log("Got response text ", options.string);
};


// TODO: adapted from kettle GoodRequestTestDefs.js

fluid.defaults("fluid.renderer.testDefTemplate", {
    gradeNames: "fluid.component",
    mergePolicy: {
        sequence: "noexpand"
    },
    expectedStatusCode: 200,
    components: {
        testRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/",
                port: 8087,
                method: "GET"
            }
        }
    },
    sequence: [
        {
            func: "{testRequest}.send"
        }, {
            event: "{testRequest}.events.onComplete",
            listener: "fluid.renderer.tests.assertResponse",
            args: {
                message: "{testCaseHolder}.options.message",
                statusCode: "{testCaseHolder}.options.expectedStatusCode",
                expectedMarkup: "{testCaseHolder}.options.expectedMarkup",
                string: "{arguments}.0",
                request: "{testRequest}"
            }
        }
    ]
});

// From https://stackoverflow.com/a/44195856
fluid.decodeHtmlEntities = function (encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function (match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function (match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
};

fluid.renderer.tests.nodeToJSON = function (element) {
    var togo = {};
    togo.tagName = element.tagName.toLowerCase();
    var attrs = {};
    var hasAttrs = false;
    for (var i = 0; i < element.attributes.length; i++) {
        hasAttrs = true;
        var attrib = element.attributes[i];
        if (attrib.name !== "id" || !attrib.value.startsWith("fluid-id")) {
            attrs[attrib.name] = attrib.value;
        }
    }
    if (hasAttrs) {
        togo.attrs = attrs;
    }
    var childNodes = [];
    var text = "";
    fluid.each(element.childNodes, function (node) {
        if (node.nodeType === 1) { // ELEMENT_NODE
            childNodes.push(fluid.renderer.tests.nodeToJSON(node));
        } else if (node.nodeType === 3) { // TEXT_NODE
            text = node.nodeValue.trim().replace(/\s\s+/g, " ");
        } else if (node.nodeType === 8) { // COMMENT_NODE
            togo.comment = fluid.decodeHtmlEntities(node.nodeValue);
        }
    });
    if (childNodes.length > 0) {
        togo.childNodes = childNodes;
    }
    if (text) {
        togo.text = text;
    }
    return togo;
};
