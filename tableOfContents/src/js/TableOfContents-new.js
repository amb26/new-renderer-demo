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

(function (fluid) {
    "use strict";

    /******
    * ToC *
    *******/
    fluid.registerNamespace("fluid.tableOfContents");


    fluid.defaults("fluid.tableOfContents.withLevels", {
        gradeNames: ["fluid.newRendererComponent", "fluid.resourceLoader"],
        dynamicComponents: {
            levels: {
                sources: "{that}.model.headings",
                type: "fluid.tableOfContents.level",
                container: "{that}.dom.level",
                options: {
                    model: "{source}"
                }
            }
        },
        resources: {
            template: {
                path: "%fluid-table-of-contents/src/html/TableOfContents-new.html"
            }
        }
    });

    fluid.defaults("fluid.tableOfContents.ui", {
        gradeNames: "fluid.tableOfContents.withLevels",
        strings: {
            tocHeader: "Table of Contents"
        },
        selectors: {
            container: "/",
            tocHeader: ".flc-toc-header",
            levelContainer: ".flc-toc-level-container"
        },
        includeTemplateRoot: true,
        model: {
            messages: "{that}.options.strings"
        },
        components: {
            header: {
                type: "fluid.uiValue",
                container: "{ui}.dom.tocHeader",
                options: {
                    model: {
                        value:"{ui}.model.messages.tocHeader"
                    }
                }
            }
        },
        dynamicComponents: {
            levels: {
                container: "{ui}.dom.levelContainer"
            }
        }
        // Shares template and "levels" definition with "fluid.tableOfContents.level"
    });

    fluid.defaults("fluid.tableOfContents.level", {
        gradeNames: "fluid.tableOfContents.withLevels",
        model: {
            // text: heading, url: linkURL, headings: [ an array of subheadings in the same format ]
        },
        selectors: {
            container: ".flc-toc-level-container",
            link:  ".flc-toc-link",
            item: ".flc-toc-item",
            level: ".flc-toc-level"
        },
        dynamicComponents: {
            link: {
                type: "fluid.uiLink",
                source: "{level}.model.text",
                options: {
                    container: "{level}.dom.link",
                    model: {
                        target: "{level}.model.url",
                        linktext: "{level}.model.text"
                    }
                }
            }
        }
    });


    fluid.tableOfContents.headingTextToAnchorInfo = function (heading) {
        var id = fluid.allocateSimpleId(heading);

        var anchorInfo = {
            id: id,
            url: "#" + id
        };

        return anchorInfo;
    };

    fluid.tableOfContents.locateHeadings = function (that, ignoreForToC) {
        var headings = that.locate("headings");

        fluid.each(ignoreForToC, function (sel) {
            headings = headings.not(sel).not(sel + " :header");
        });

        return headings;
    };

    fluid.tableOfContents.pullHeadingsModel = function (that, modelBuilder) {
        var headings = that.locateHeadings();

        // This is scrawled onto the component primarily to make some tests easier to write
        var anchorInfo = that.anchorInfo = fluid.transform(headings, that.headingTextToAnchorInfo);

        return modelBuilder.assembleModel(headings, anchorInfo);
    };

    fluid.defaults("fluid.tableOfContents", {
        gradeNames: ["fluid.viewComponent", "fluid.resourceLoader"],
        components: {
            ui: { // TODO: Invert this structure so ui is the top-level component
                type: "fluid.tableOfContents.ui",
                container: "{tableOfContents}.dom.tocContainer",
                options: {
                    model: "{tableOfContents}.model"
                }
            },
            modelBuilder: {
                type: "fluid.tableOfContents.modelBuilder"
            }
        },
        model: {
            messages: {
                tocHeader: "Table of Contents"
            },
            headings: "{that}.resources.documentHeadingsSource.parsed"
        },
        resources: {
            documentHeadingsSource: {
                promiseFunc: "{that}.pullHeadingsModel"
            }
        },
        invokers: {
            headingTextToAnchorInfo: "fluid.tableOfContents.headingTextToAnchorInfo",
            locateHeadings: {
                funcName: "fluid.tableOfContents.locateHeadings",
                args: ["{that}", "{that}.options.ignoreForToC"]
            },
            pullHeadingsModel: {
                funcName: "fluid.tableOfContents.pullHeadingsModel",
                args: ["{that}", "{that}.modelBuilder"]
            },
            // TODO: is it weird to have hide and show on a component?
            // TODO: Yes, this should be replaced by conditional construction/destruction of the component in the enactor
            hide: {
                "this": "{that}.dom.tocContainer",
                "method": "hide"
            },
            show: {
                "this": "{that}.dom.tocContainer",
                "method": "show"
            }
        },
        selectors: {
            headings: ":header:visible",
            tocContainer: ".flc-toc-tocContainer"
        },
        ignoreForToC: {
            tocContainer: "{that}.options.selectors.tocContainer"
        }
    });


    /*******************
    * ToC ModelBuilder *
    ********************/

    fluid.registerNamespace("fluid.tableOfContents.modelBuilder");

    fluid.tableOfContents.modelBuilder.toModel = function (headingInfo, modelLevelFn) {
        var headings = fluid.copy(headingInfo);
        var buildModelLevel = function (headings, level) {
            var modelLevel = [];
            while (headings.length > 0) {
                var heading = headings[0];
                if (heading.level < level) {
                    break;
                }
                if (heading.level > level) {
                    var subHeadings = buildModelLevel(headings, level + 1);
                    if (modelLevel.length > 0) {
                        fluid.peek(modelLevel).headings = subHeadings;
                    } else {
                        modelLevel = modelLevelFn(modelLevel, subHeadings);
                    }
                }
                if (heading.level === level) {
                    modelLevel.push(heading);
                    headings.shift();
                }
            }
            return modelLevel;
        };
        return buildModelLevel(headings, 1);
    };

    fluid.tableOfContents.modelBuilder.gradualModelLevelFn = function (modelLevel, subHeadings) {
        var subHeadingsClone = fluid.copy(subHeadings);
        subHeadingsClone[0].level--;
        return subHeadingsClone;
    };

    fluid.tableOfContents.modelBuilder.skippedModelLevelFn = function (modelLevel, subHeadings) {
        modelLevel.push({headings: subHeadings});
        return modelLevel;
    };

    fluid.tableOfContents.modelBuilder.convertToHeadingObjects = function (that, headingCalculator, headings, anchorInfo) {
        return fluid.transform(headings, function (heading, index) {
            return {
                level: headingCalculator.getHeadingLevel(heading),
                text: heading.textContent,
                url: anchorInfo[index].url
            };
        });
    };

    fluid.tableOfContents.modelBuilder.assembleModel = function (that, headings, anchorInfo) {
        var headingInfo = that.convertToHeadingObjects(headings, anchorInfo);
        return that.toModel(headingInfo);
    };

    fluid.defaults("fluid.tableOfContents.modelBuilder", {
        gradeNames: ["fluid.component"],
        components: {
            headingCalculator: {
                type: "fluid.tableOfContents.modelBuilder.headingCalculator"
            }
        },
        invokers: {
            toModel: {
                funcName: "fluid.tableOfContents.modelBuilder.toModel",
                args: ["{arguments}.0", "{modelBuilder}.modelLevelFn"]
            },
            modelLevelFn: "fluid.tableOfContents.modelBuilder.gradualModelLevelFn",
            convertToHeadingObjects: "fluid.tableOfContents.modelBuilder.convertToHeadingObjects({that}, {that}.headingCalculator, {arguments}.0, {arguments}.1)", // headings, anchorInfo
            assembleModel: "fluid.tableOfContents.modelBuilder.assembleModel({that}, {arguments}.0, {arguments}.1)" // headings, anchorInfo
        }
    });

    /*************************************
    * ToC ModelBuilder headingCalculator *
    **************************************/

    fluid.registerNamespace("fluid.tableOfContents.modelBuilder.headingCalculator");

    fluid.tableOfContents.modelBuilder.headingCalculator.getHeadingLevel = function (levels, heading) {
        return levels.indexOf(heading.tagName) + 1;
    };

    fluid.defaults("fluid.tableOfContents.modelBuilder.headingCalculator", {
        gradeNames: ["fluid.component"],
        invokers: {
            getHeadingLevel: "fluid.tableOfContents.modelBuilder.headingCalculator.getHeadingLevel({that}.options.levels, {arguments}.0)" // heading
        },
        levels: ["H1", "H2", "H3", "H4", "H5", "H6"]
    });

})(fluid_3_0_0);
