/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests.tableOfContents");

    fluid.tests.tableOfContents.emptyHeadings = {
        headingTags: [],
        anchorInfo: [],
        headingInfo: [],
        model: []
    };

    fluid.tests.tableOfContents.linearHeadings = {
        headingTags: ["h1", "h2", "h3", "h4", "h5", "h6"],
        anchorInfo: [{url: "#h1"}, {url: "#h2"}, {url: "#h3"}, {url: "#h4"}, {url: "#h5"}, {url: "#h6"}],
        headingInfo: [
            {level: 1, text: "h1", url: "#h1"},
            {level: 2, text: "h2", url: "#h2"},
            {level: 3, text: "h3", url: "#h3"},
            {level: 4, text: "h4", url: "#h4"},
            {level: 5, text: "h5", url: "#h5"},
            {level: 6, text: "h6", url: "#h6"}
        ],
        model: {
            headings: [{
                level: 1,
                text: "h1",
                url: "#h1",
                headings: [{
                    level: 2,
                    text: "h2",
                    url: "#h2",
                    headings: [{
                        level: 3,
                        text: "h3",
                        url: "#h3",
                        headings: [{
                            level: 4,
                            text: "h4",
                            url: "#h4",
                            headings: [{
                                level: 5,
                                text: "h5",
                                url: "#h5",
                                headings: [{
                                    level: 6,
                                    text: "h6",
                                    url: "#h6"
                                }]
                            }]
                        }]
                    }]
                }]
            }]
        }
    };

    fluid.tests.tableOfContents.skippedHeadingsForSkippedIndentationModel = {
        headingTags: ["h1", "h6"],
        anchorInfo: [{url: "#h1"}, {url: "#h6"}],
        headingInfo: [
            {level: 1, text: "h1", url: "#h1"},
            {level: 6, text: "h6", url: "#h6"}
        ],
        model: {
            headings: [{
                level: 1,
                text: "h1",
                url: "#h1",
                headings: [{
                    headings: [{
                        headings: [{
                            headings: [{
                                headings: [{
                                    level: 6,
                                    text: "h6",
                                    url: "#h6"
                                }]
                            }]
                        }]
                    }]
                }]
            }]
        }
    };

    fluid.tests.tableOfContents.skippedHeadingsForGradualIndentationModel = {
        headingTags: ["h1", "h6"],
        anchorInfo: [{url: "#h1"}, {url: "#h6"}],
        headingInfo: [
            {level: 1, text: "h1", url: "#h1"},
            {level: 6, text: "h6", url: "#h6"}
        ],
        model: {
            headings: [{
                level: 1,
                text: "h1",
                url: "#h1",
                headings: [{
                    level: 2,
                    text: "h6",
                    url: "#h6"
                }]
            }]
        }
    };

    fluid.tests.tableOfContents.createElm = function (tagName) {
        return fluid.unwrap($("<" + tagName + "/>", {text: tagName}));
    };

    fluid.tests.tableOfContents.createElms = function (tagArray) {
        return fluid.transform(tagArray, fluid.tests.tableOfContents.createElm);
    };

    fluid.tests.tableOfContents.toModelTests = function (headingInfo, expectedModel, modelLevelFn) {
        var model = {
            headings: fluid.tableOfContents.modelBuilder.toModel(headingInfo, modelLevelFn)
        };
        jqUnit.assertDeepEq("headingInfo converted to toModel correctly", expectedModel, model);
    };

    fluid.tests.tableOfContents.convertToHeadingObjectsTests = function (headings, anchorInfo, expectedHeadingInfo) {
        var modelBuilder = fluid.tableOfContents.modelBuilder();
        var headingInfo = modelBuilder.convertToHeadingObjects(headings, anchorInfo);
        jqUnit.assertDeepEq("Heading objects created correctly", expectedHeadingInfo, headingInfo);
    };

    fluid.tests.tableOfContents.assembleModelTests = function (headings, anchorInfo, expectedModel) {
        var modelBuilder = fluid.tableOfContents.modelBuilder();
        var model = {
            headings: modelBuilder.assembleModel(headings, anchorInfo)
        };
        jqUnit.assertDeepEq("Model assembled correctly", expectedModel, model);
    };

    jqUnit.module("Table of Contents: Heading Calculator Tests");

    jqUnit.test("getHeadingLevel", function () {
        var headingCalc = fluid.tableOfContents.modelBuilder.headingCalculator();

        for (var i = 1; i <= 6; i++) {
            var tagName = "h" + i;
            var heading = fluid.tests.tableOfContents.createElm(tagName);
            jqUnit.assertEquals(tagName + " level", i, headingCalc.getHeadingLevel(heading));
        }
    });
    var linearHeadings = fluid.tests.tableOfContents.linearHeadings;
    var skippedHeadingsForSkippedIndentationModel = fluid.tests.tableOfContents.skippedHeadingsForSkippedIndentationModel;
    var skippedHeadingsForGradualIndentationModel = fluid.tests.tableOfContents.skippedHeadingsForGradualIndentationModel;

    jqUnit.module("Table of Contents: Model Builder Tests");

    jqUnit.test("toModel: linear headings with gradual indentation models", function () {
        fluid.tests.tableOfContents.toModelTests(linearHeadings.headingInfo, linearHeadings.model, fluid.tableOfContents.modelBuilder.gradualModelLevelFn);
    });
    jqUnit.test("toModel: linear headings with skipped indentation models", function () {
        fluid.tests.tableOfContents.toModelTests(linearHeadings.headingInfo, linearHeadings.model, fluid.tableOfContents.modelBuilder.skippedModelLevelFn);
    });
    jqUnit.test("toModel: skipped headings with gradual indentation models", function () {
        fluid.tests.tableOfContents.toModelTests(skippedHeadingsForGradualIndentationModel.headingInfo, skippedHeadingsForGradualIndentationModel.model,
            fluid.tableOfContents.modelBuilder.gradualModelLevelFn);
    });
    jqUnit.test("toModel: skipped headings with skipped indentation models", function () {
        fluid.tests.tableOfContents.toModelTests(skippedHeadingsForSkippedIndentationModel.headingInfo, skippedHeadingsForSkippedIndentationModel.model,
            fluid.tableOfContents.modelBuilder.skippedModelLevelFn);
    });

    jqUnit.test("convertToHeadingObjects: linear headings", function () {
        fluid.tests.tableOfContents.convertToHeadingObjectsTests(
            fluid.tests.tableOfContents.createElms(linearHeadings.headingTags), linearHeadings.anchorInfo, linearHeadings.headingInfo);
    });
    jqUnit.test("convertToHeadingObjects: skipped headings", function () {
        fluid.tests.tableOfContents.convertToHeadingObjectsTests(
            fluid.tests.tableOfContents.createElms(skippedHeadingsForSkippedIndentationModel.headingTags),
            skippedHeadingsForSkippedIndentationModel.anchorInfo, skippedHeadingsForSkippedIndentationModel.headingInfo);
        fluid.tests.tableOfContents.convertToHeadingObjectsTests(
            fluid.tests.tableOfContents.createElms(skippedHeadingsForGradualIndentationModel.headingTags),
            skippedHeadingsForGradualIndentationModel.anchorInfo, skippedHeadingsForGradualIndentationModel.headingInfo);
    });

    jqUnit.test("assembleModel: linear headings", function () {
        fluid.tests.tableOfContents.assembleModelTests(
            fluid.tests.tableOfContents.createElms(linearHeadings.headingTags), linearHeadings.anchorInfo, linearHeadings.model);
    });
    jqUnit.test("assembleModel: skipped headings", function () {
        // test assembleModel with default toModel invoker - skippedHeadingsForGradualIndentationModel
        fluid.tests.tableOfContents.assembleModelTests(
            fluid.tests.tableOfContents.createElms(skippedHeadingsForGradualIndentationModel.headingTags),
            skippedHeadingsForGradualIndentationModel.anchorInfo, skippedHeadingsForGradualIndentationModel.model);
    });

    jqUnit.test("Test gradualModelLevelFn", function () {
        var modelLevel = ["level1", "level2"];
        var subHeadings = [{level: 6, text: "h6", url: "#h6"}];
        var expectedModelLevel = [{level: 5, text: "h6", url: "#h6"}];

        var gradualIndentationModel = fluid.tableOfContents.modelBuilder.gradualModelLevelFn(modelLevel, subHeadings);
        jqUnit.assertDeepEq("gradual indentation model returns the subHeadings with level decremented by exactly 1.", gradualIndentationModel, expectedModelLevel);

        // reference check. The function should not modify the object with the same reference.
        jqUnit.assertFalse("This function should not modify the level value directly on the object. Returned value should not have the same reference as parameter.", subHeadings === gradualIndentationModel);
    });

    jqUnit.test("Test skippedModelLevelFn", function () {
        var modelLevel = ["level1", "level2", {headings: ["subHeading1", "subHeading2"]}];
        var modelLevelClone = fluid.copy(modelLevel);
        var subHeadings = modelLevelClone.pop();
        var skippedIndentationModel = fluid.tableOfContents.modelBuilder.skippedModelLevelFn(modelLevelClone, subHeadings.headings);
        jqUnit.assertDeepEq("skipped indentation model should always return the modelLevel with subHeadings as a child.", modelLevel, skippedIndentationModel);
    });


    jqUnit.module("Table of Contents Tests");

    /**
     * Retrieve a jQuery that's associated with all the selectorNames
     * @param {Object} that - The component itself.
     * @param  {Array} selectorNames - Array of selector names.
     * @return {Object} - A jQuery object containing objects matching selectorNames.
     */
    fluid.tests.tableOfContents.locateSet = function (that, selectorNames) {
        var set = $();  // Creates an empty jQuery object.
        fluid.each(selectorNames, function (selectorName) {
            set = set.add(that.locate(selectorName));
        });
        return set;
    };

    fluid.tests.tableOfContents.domPositionComparator = function (na, nb) {
        var comparison = na[0].compareDocumentPosition(nb[0]);
        return 3 - comparison;
    };

    /**
     * @param {fluid.tableOfContents.ui} ui - An instance of fluid.tableOfContents.ui component
     * @param {Object} testHeadings - expected heading info data
     * @param {Object} anchorInfo - optional. An array of anchor info objects
     *                              these should include at least the url like {url: "#url"}.
     *                              Typically this will come from the "anchorInfo" member of a
     *                              fluid.tableOfContents component.
     *
     */
    fluid.tests.tableOfContents.renderTOCTest = function (ui, testHeadings, anchorInfo) {
        var linkComponents = fluid.queryIoCSelector(ui, "fluid.uiLink");
        var tocLinks = fluid.getMembers(linkComponents, "container");
        tocLinks.sort(fluid.tests.tableOfContents.domPositionComparator);
        jqUnit.assertEquals("The toc header is rendered correctly", ui.options.strings.tocHeader, ui.locate("tocHeader").text());
        jqUnit.assertEquals("The correct number of links are rendered", testHeadings.headingInfo.length, tocLinks.length);
        // #FLUID-4352: check if <ul> exists when there is no tocLinks
        if (tocLinks.length === 0) {
            jqUnit.assertEquals("<ul> should not be defined when no headers are found", 0, $("ul", ui.container).length);
        }
        fluid.each(tocLinks, function (elm, idx) {
            var jElm = $(elm);
            var hInfo = testHeadings.headingInfo[idx];
            jqUnit.assertEquals("ToC text set correctly", fluid.get(hInfo, "text"), jElm.text());
            var headingURL = fluid.get(anchorInfo, [idx, "url"]) || hInfo.url;
            jqUnit.assertEquals("ToC anchor set correctly", headingURL, jElm.attr("href"));
        });
    };

    fluid.tests.tableOfContents.renderTOCTests = function (testHeadings) {
        var container = $(".flc-toc-tocContainer", "#flc-toc");
        fluid.tableOfContents.ui(container, {
            model: testHeadings.model,
            listeners: {
                onCreate: function (that) {
                    fluid.tests.tableOfContents.renderTOCTest(that, testHeadings);
                    jqUnit.start();
                }
            }
        });
    };

    jqUnit.asyncTest("Render toc: empty headings", function () {
        //FLUID-4352
        fluid.tests.tableOfContents.renderTOCTests(fluid.tests.tableOfContents.emptyHeadings);
    });
    jqUnit.asyncTest("Render toc: linear headings", function () {
        fluid.tests.tableOfContents.renderTOCTests(fluid.tests.tableOfContents.linearHeadings);
    });
    jqUnit.asyncTest("Render toc: skipped headings for skipped indentation model", function () {
        fluid.tests.tableOfContents.renderTOCTests(fluid.tests.tableOfContents.skippedHeadingsForSkippedIndentationModel);
    });
    jqUnit.asyncTest("Render toc: skipped headings for gradual indentation model", function () {
        fluid.tests.tableOfContents.renderTOCTests(fluid.tests.tableOfContents.skippedHeadingsForGradualIndentationModel);
    });


    jqUnit.test("public function: headingTextToAnchorInfo", function () {
        var toc = fluid.tableOfContents("#flc-toc");
        var tocBodyHeading = $("#amphibians");
        var anchorInfo = toc.headingTextToAnchorInfo(tocBodyHeading);
        jqUnit.assertEquals("anchor url is the same as id except url has a '#' in front", anchorInfo.url.substr(1), anchorInfo.id);
    });

    jqUnit.asyncTest("public function: show/hide component", function () {
        var testMethods = function (that) {
            var tocContainer = that.locate("tocContainer");
            jqUnit.isVisible("Initially the component is visible.", tocContainer);
            tocContainer.hide();
            jqUnit.notVisible("After calling hide, the component is invisible.", tocContainer);
            tocContainer.show();
            jqUnit.isVisible("After calling show, the component is visible.", tocContainer);
            jqUnit.start();
        };
        fluid.tableOfContents("#flc-toc", {
            listeners: {
                onCreate: testMethods
            }
        });
    });

    /**
     * Test anchor links created by TOC.  Check if the heading table a href link maps to the correct header
     */
    fluid.tests.tableOfContents.renderTOCAnchorTest = function () {
        var anchorLinks = $(".flc-toc-link");
        anchorLinks.each(function (anchorIndex) {
            var anchorHref = anchorLinks.eq(anchorIndex).attr("href");
            jqUnit.assertValue("Component test headings: TOC anchors should map to the headers correctly - " + anchorHref, $(anchorHref)[0]);
        });
    };

    /**
     * Test component and make sure the number of links, text and anchors are set correctly.
     */
    jqUnit.asyncTest("Component test headings", function () {
        // craft headingInfo so renderTOCTest() can use it
        var testHeadings = {
            headingInfo : []
        };
        var headings = $("#flc-toc").children(":header");

        fluid.each(headings, function (heading) {
            heading = $(heading);
            var headingID = heading.attr("id");
            testHeadings.headingInfo.push({
                level: heading.prop("tagName").substr(heading.prop("tagName").length - 1),
                text: heading.text(),
                url: headingID ? "#" + headingID : undefined
            });
        });
        fluid.tableOfContents("#flc-toc", {
            listeners: {
                onCreate: {
                    func: function (that) {
                        fluid.tests.tableOfContents.renderTOCTest(that.ui, testHeadings, that.anchorInfo);
                        fluid.tests.tableOfContents.renderTOCAnchorTest();
                        jqUnit.start();
                    },
                    args: ["{that}"]
                }
            }
        });
    });

    /**
     * #FLUID-4352: Test component with no headings. Make sure no <ul> is set
     */
    jqUnit.asyncTest("Component test empty headings", function () {
        // craft headingInfo so renderTOCTest() can use it
        var testHeadings = {
            headingInfo : []
        };
        fluid.tableOfContents("#flc-toc-noHeaders", {
            listeners: {
                onCreate: {
                    func: function (that) {
                        fluid.tests.tableOfContents.renderTOCTest(that.ui, testHeadings, that.anchorInfo);
                        fluid.tests.tableOfContents.renderTOCAnchorTest();
                        jqUnit.start();
                    },
                    args: ["{that}"]
                }
            }
        });
    });


    /**
     * #FLUID-4723: Test that the output includes an actual header
     */
    jqUnit.asyncTest("Output includes a heading", function () {
        fluid.tableOfContents("#flc-toc", {
            listeners: {
                onCreate: {
                    func: function (that) {
                        var header = $("h2", that.container);
                        jqUnit.assertEquals("The output should contain exactly one H2", 1, header.length);
                        jqUnit.assertEquals("The H2 should contain the expected text", "Table of Contents", header.text());
                        jqUnit.start();
                    },
                    args: ["{that}.ui"]
                }
            }
        });
    });

    /**
     * #FLUID-5110: refreshView updates headings
     */
    jqUnit.asyncTest("Component test refreshView", function () {
        // craft headingInfo so renderTOCTest() can use it
        var testHeadingRefreshed = {
            headingInfo: [{
                level: "2",
                text: "H2"
            }, {
                level: "2",
                text: "test"
            }]
        };
        fluid.tableOfContents("#flc-toc-refreshHeadings", {
            listeners: {
                "onCreate.initialState": {
                    listener: function (that) {
                        var renderer = fluid.resolveContext("fluid.renderer", that, true);
                        renderer.events.render.addListener(function () {
                            jqUnit.assert("The onRefresh event should have fired");
                            fluid.tests.tableOfContents.renderTOCTest(that.ui, testHeadingRefreshed, that.anchorInfo);
                            fluid.tests.tableOfContents.renderTOCAnchorTest();
                            renderer.events.render.removeListener("inTestCase");
                            jqUnit.start();
                        }, "inTestCase", "last");

                        that.container.append("<h2>test</h2>");
                        that.resourceFetcher.refetchOneResource("documentHeadingsSource");
                    }
                }
            }
        });
    });

    /**
     * #FLUID-5567: Test that table of contents header is localizable
     */
    jqUnit.asyncTest("FLUID-5567: Table of Contents header localization", function () {
        fluid.tableOfContents("#flc-toc-l10n", {
            strings: {
                tocHeader: "Localized ToC Header"
            },
            listeners: {
                onCreate: {
                    listener: function (that) {
                        jqUnit.assertEquals("The ToC Header should be localized.", that.options.strings.tocHeader, that.locate("tocHeader").text());
                        jqUnit.start();
                    },
                    args: ["{that}.ui"]
                }
            }
        });
    });

    /**
     * #FLUID-5697: Test the exclusion of headers
     */
    jqUnit.asyncTest("FLUID-5697: Header exclusion", function () {
        // craft headingInfo so renderTOCTest() can use it
        var testHeadings = {
            headingInfo: [{
                level: "2",
                text: "Included"
            }]
        };

        fluid.tableOfContents("#fluid-5697", {
            ignoreForToC: {
                "fluid-5697": ".fluid-5697-exclude"
            },
            listeners: {
                onCreate: {
                    listener: function (that) {
                        fluid.tests.tableOfContents.renderTOCTest(that.ui, testHeadings, that.anchorInfo);
                        fluid.tests.tableOfContents.renderTOCAnchorTest();
                        jqUnit.start();
                    }
                }
            }
        });
    });

})(jQuery);
