"use strict";

fluid.registerNamespace("fluid.tests.tableOfContents");

fluid.setLogging(true);

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
