"use strict";

var fluid = fluid || {};
fluid.infusionModuleIndex = [
    {
        "moduleName": "new-renderer-demo",
        "suffix": "",
        "prefix": ""
    },
    {
        "moduleName": "fluid-switch-demo",
        "suffix": "",
        "prefix": "demos/switch/"
    },
    {
        "moduleName": "fluid-toc-demo",
        "suffix": "",
        "prefix": "demos/tableOfContents/"
    },
    {
        "moduleName": "fluid-textfield-controls-demo",
        "suffix": "",
        "prefix": "demos/textfieldControls/"
    },
    {
        "moduleName": "server-renderer-demo",
        "suffix": "",
        "prefix": "demos/textfieldControlsMutation/"
    },
    {
        "moduleName": "fluid-renderer-perftest",
        "suffix": "",
        "prefix": "perftest/"
    },
    {
        "moduleName": "fluid-prefs-enhance-inputs",
        "suffix": "",
        "prefix": "preferences/enhanceInputs/"
    },
    {
        "moduleName": "fluid-prefs-line-space",
        "suffix": "",
        "prefix": "preferences/lineSpace/"
    },
    {
        "moduleName": "fluid-preferences",
        "suffix": "",
        "prefix": "preferences/"
    },
    {
        "moduleName": "fluid-prefs-editor",
        "suffix": "",
        "prefix": "preferences/prefsEditor/"
    },
    {
        "moduleName": "fluid-prefs-text-size",
        "suffix": "",
        "prefix": "preferences/textSize/"
    },
    {
        "moduleName": "fluid-switch",
        "suffix": "",
        "prefix": "switch/"
    },
    {
        "moduleName": "fluid-table-of-contents",
        "suffix": "",
        "prefix": "tableOfContents/"
    },
    {
        "moduleName": "renderer-test-module",
        "suffix": "",
        "prefix": "tests/node/node_modules/renderer-test-module/"
    },
    {
        "moduleName": "fluid-textfield-controls",
        "suffix": "",
        "prefix": "textfieldControl/"
    },
    {
        "moduleName": "fluid-ui-options",
        "suffix": "",
        "prefix": "uiOptions/"
    },
    {
        "moduleName": "infusion",
        "suffix": "",
        "prefix": "node_modules/infusion/"
    }
];
(function () {
    var indexScript = document.querySelector("script[module-index]");
    var src = indexScript.getAttribute("src");
    var prefix = src.substring(0, src.indexOf("infusionModuleIndex.js"));
    if (fluid.resourceLoader) {
        fluid.resourceLoader.staticMountTable = fluid.infusionModuleIndex.map(function (entry) {
            var togo = Object.assign({}, entry);
            togo.prefix = prefix + togo.prefix;
            return togo;
        });
    }
})();
