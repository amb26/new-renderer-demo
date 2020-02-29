var fluid = require("infusion");

fluid.require("%new-renderer-demo/src/serverRendererIndex.js");

fluid.renderer.loadModule(__dirname); // TODO: %fluid-table-of-contents should be possible

    fluid.registerNamespace("fluid.tests.tableOfContents");

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
                // TODO! Some proper polymorphism between URL and File resources
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
            },
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
        components: {
            link: {
                type: "fluid.uiLink",
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

fluid.setLogging(true);

    fluid.tests.tableOfContents.dump = function (that) {
        console.log("Top model: ", that.model);
        var headings = fluid.queryIoCSelector(that, "level");
        console.log("Got " + headings.length + " headings");
        fluid.each(headings, function (heading) {
            console.log("path " + fluid.pathForComponent(heading));
            console.log("model: ", heading.model);
        });
        console.log("Dumping markup: ");
        console.log(fluid.htmlParser.render(that.container));
    };

fluid.defaults("fluid.tests.tableOfContents.renderer", {
    gradeNames: "fluid.renderer.template",
    components: {
        component: {
            type: "fluid.tableOfContents.ui",
            options: {
                container: {tagName: "div"},
                model: fluid.tests.tableOfContents.linearHeadings.model,
                listeners: {
                    "onCreate.dump": "fluid.tests.tableOfContents.dump" 
                }          
            }
        }
    }
});    

var renderer = fluid.tests.tableOfContents.renderer();
