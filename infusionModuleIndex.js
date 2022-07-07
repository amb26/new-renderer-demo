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
        "moduleName": "fluid-prefs-captions",
        "suffix": "",
        "prefix": "preferences/captions/"
    },
    {
        "moduleName": "fluid-prefs-contrast",
        "suffix": "",
        "prefix": "preferences/contrast/"
    },
    {
        "moduleName": "fluid-prefs-enhance-inputs",
        "suffix": "",
        "prefix": "preferences/enhanceInputs/"
    },
    {
        "moduleName": "fluid-prefs-letter-space",
        "suffix": "",
        "prefix": "preferences/letterSpace/"
    },
    {
        "moduleName": "fluid-prefs-line-space",
        "suffix": "",
        "prefix": "preferences/lineSpace/"
    },
    {
        "moduleName": "fluid-prefs-localization",
        "suffix": "",
        "prefix": "preferences/localization/"
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
        "moduleName": "fluid-prefs-self-voicing",
        "suffix": "",
        "prefix": "preferences/selfVoicing/"
    },
    {
        "moduleName": "fluid-prefs-syllabification",
        "suffix": "",
        "prefix": "preferences/syllabification/"
    },
    {
        "moduleName": "fluid-prefs-table-of-contents",
        "suffix": "",
        "prefix": "preferences/tableOfContents/"
    },
    {
        "moduleName": "fluid-prefs-text-font",
        "suffix": "",
        "prefix": "preferences/textFont/"
    },
    {
        "moduleName": "fluid-prefs-text-size",
        "suffix": "",
        "prefix": "preferences/textSize/"
    },
    {
        "moduleName": "fluid-prefs-word-space",
        "suffix": "",
        "prefix": "preferences/wordSpace/"
    },
    {
        "moduleName": "fluid-sliding-panel",
        "suffix": "",
        "prefix": "slidingPanel/"
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
