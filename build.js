/* eslint-env node */
"use strict";

var md = require("markdown-it")({
    html: true
}),
    fs = require("fs-extra");
    
var readme = fs.readFileSync("README.md", "utf8");
var rendered = md.render(readme);

fs.removeSync("docs");
fs.ensureDirSync("docs");

fs.writeFileSync("docs/index.html", rendered);

var toCopy = ["demos", "examples", "preferences", "switch", "uiOptions", "slidingPanel", "tableOfContents", "tests",
    "textfieldControl", "src", "node_modules/infusion", "infusionModuleIndex.js", "all-tests.html", ".nojekyll"]

toCopy.forEach(function (path) {
    fs.copySync(path, "docs/" + path);
});
