/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.composite");

    fluid.tests.composite.primarySchema = {
        "fluid.tests.composite.pref.speakText": {
            "type": "boolean",
            "default": false
        },
        "fluid.tests.composite.pref.increaseSize": {
            "type": "boolean",
            "default": false
        },
        "fluid.tests.composite.pref.magnification": {
            "type": "boolean",
            "default": false
        },
        "fluid.tests.composite.pref.lineSpace": {
            "type": "boolean",
            "default": false
        }
    };

    fluid.defaults("fluid.tests.composite.auxSchema", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            template: "%templatePrefix/compositePrefsEditorTemplate.html",
            "terms": {
                "templatePrefix": "../testResources/html",
                "messagePrefix": "../testResources/messages"
            },
            "message": "%messagePrefix/prefsEditor.json",
            groups: {
                increasing: {
                    "container": ".fluid-tests-composite-increasing",
                    "template": "%templatePrefix/increaseTemplate.html",
                    "message": "%messagePrefix/increase.json",
                    "type": "fluid.tests.composite.increase",
                    "panels": {
                        "always": ["fluid.tests.composite.pref.increaseSize"],
                        "fluid.tests.composite.pref.increaseSize": [
                            "fluid.tests.composite.pref.magnification",
                            "fluid.tests.composite.pref.lineSpace"
                        ]
                    }
                }
            },
            "fluid.tests.composite.pref.speakText": {
                panel: {
                    type: "fluid.tests.cmpPanel.speak",
                    container: ".fluid-tests-composite-speaking-onOff",
                    template: "%templatePrefix/checkboxTemplate.html",
                    message: "%messagePrefix/empty.json"
                }
            },
            "fluid.tests.composite.pref.increaseSize": {
                panel: {
                    type: "fluid.tests.cmpPanel.incSize",
                    container: ".fluid-tests-composite-increasing-onOff",
                    template: "%templatePrefix/checkboxTemplate.html",
                    message: "%messagePrefix/empty.json"
                }
            },
            "fluid.tests.composite.pref.magnification": {
                panel: {
                    type: "fluid.tests.cmpPanel.magFactor",
                    container: ".fluid-tests-composite-increasing-magFactor",
                    template: "%templatePrefix/checkboxTemplate.html",
                    message: "%messagePrefix/empty.json"
                }
            },
            "fluid.tests.composite.pref.lineSpace": {
                panel: {
                    type: "fluid.tests.cmpPanel.lineSpace",
                    container: ".fluid-tests-composite-increasing-lineSpace",
                    template: "%templatePrefix/checkboxTemplate.html",
                    message: "%messagePrefix/empty.json"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.composite.increase", {
        gradeNames: ["fluid.prefs.compositePanel"],
        // Removed - we can't support this fallback from nonexistent resource behaviour after FLUID-6580
        /*        messageBase: {
                    increaseHeader: "increase"
                },
        */
        selectors: {
            header: ".flc-prefsEditor-header",
            label: ".fluid-tests-composite-increase-header"
        },
        selectorsToIgnore: ["header"],
        protoTree: {
            label: {messagekey: "increaseHeader"}
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.speak", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.tests.composite.pref.speakText": {
                "model.speakText": "value"
            }
        },
        selectors: {
            header: ".flc-prefsEditor-header",
            bool: ".fluid-tests-composite-input"
        },
        selectorsToIgnore: ["header"],
        protoTree: {
            bool: "${speakText}"
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.base", {
        gradeNames: ["fluid.prefs.panel"],
        selectors: {
            header: ".flc-prefsEditor-header",
            bool: ".fluid-tests-composite-input"
        },
        selectorsToIgnore: ["header"],
        protoTree: {
            bool: "${value}"
        },
        members: {
            origContext: "{that}.container.0.ownerDocument"
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.incSize", {
        gradeNames: ["fluid.tests.cmpPanel.base"],
        preferenceMap: {
            "fluid.tests.composite.pref.increaseSize": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.magFactor", {
        gradeNames: ["fluid.tests.cmpPanel.base"],
        preferenceMap: {
            "fluid.tests.composite.pref.magnification": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.lineSpace", {
        gradeNames: ["fluid.tests.cmpPanel.base"],
        preferenceMap: {
            "fluid.tests.composite.pref.lineSpace": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.composite.separatedPanel", {
        gradeNames: ["fluid.prefs.separatedPanel"],
        iframeRenderer: {
            markupProps: {
                src: "./SeparatedPanelPrefsEditorFrame.html"
            }
        }
    });

    fluid.defaults("fluid.tests.composite.separatedPanel.prefsEditor", {
        gradeNames: ["fluid.prefs.builder", "fluid.tests.composite.auxSchema", "fluid.viewComponent"],
        schema: fluid.tests.composite.primarySchema,
        auxiliarySchema: {
            "loaderGrades": ["fluid.tests.prefs.composite.separatedPanel"],
            "generatePanelContainers": false
        }
    });

    fluid.defaults("fluid.tests.composite.separatedPanel.lazyLoad.prefsEditor", {
        gradeNames: ["fluid.tests.composite.separatedPanel.prefsEditor"],
        prefsEditorLoader: {
            lazyLoad: true
        }
    });

    fluid.defaults("fluid.tests.composite.fullNoPreview.prefsEditor", {
        gradeNames: ["fluid.prefs.builder", "fluid.tests.composite.auxSchema", "fluid.viewComponent"],
        schema: fluid.tests.composite.primarySchema,
        auxiliarySchema: {
            "loaderGrades": ["fluid.prefs.fullNoPreview"],
            "generatePanelContainers": false
        }
    });

})();
