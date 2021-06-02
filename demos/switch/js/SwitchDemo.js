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

var demo = demo || {};

(function () {
    "use strict";

    fluid.defaults("demo.faces", {
        gradeNames: ["fluid.viewComponent"],
        strings: {
            on: "on",
            off: "off"
        },
        selectors: {
            panel: ".demo-faces-panel",
            text: ".demo-faces-text",
            face: ".demo-faces-face",
            switchUI: ".demo-faces-switch"
        },
        styles: {
            light: "demo-light"
        },
        faces: {
            primary: "😃",
            random: ["😆", "😋", "😝", "😲"]
        },
        members: {
            switchPoint: 0.5
        },
        model: {
            lightOn: false
        },
        modelRelay: {
            text: {
                target: "{that}.model.dom.text.text",
                func: (strings, value) => strings[value ? "on" : "off"],
                args: ["{that}.options.strings", "{that}.model.lightOn"]
            },
            face: {
                target: "{that}.model.dom.face.text",
                func: (getFace, value) => value ? getFace() : "",
                args: ["{that}.getFace", "{that}.model.lightOn"]
            },
            panel: {
                source: "{that}.model.lightOn",
                target: {
                    segs: ["dom", "panel", "class", "{that}.options.styles.light"]
                }
            },
            allocatePanelId: {
                target: "dom.panel.attrs.id",
                func: (value) => value || fluid.allocateGuid(),
                // An awkward hack requires a throwaway 2nd argument to ensure the relay is triggered on startup
                args: ["{that}.model.dom.panel.attrs.id", "{that}.model"]
            }
        },
        invokers: {
            getFace: {
                funcName: "demo.faces.getFace",
                args: ["{that}.switchPoint", "{that}.options.faces"]
            }
        },
        components: {
            switchUI: {
                type: "fluid.switchUI",
                container: "{that}.dom.switchUI",
                options: {
                    model: {
                        enabled: "{demo.faces}.model.lightOn",
                        controlAttrs: {
                            "aria-labelledby": "flc-switchUI-label",
                            // Note: https://heydonworks.com/article/aria-controls-is-poop/
                            "aria-controls": "{demo.faces}.model.dom.panel.attrs.id"
                        }
                    },
                    modelRelay: {
                        controlAttrs: {
                            source: "controlAttrs",
                            target: "dom.control.attrs"
                        }
                    }
                }
            }
        }
    });

    demo.faces.getFace = function (switchPoint, faces) {
        var rand = Math.random();

        if (rand >= switchPoint) {
            switchPoint += 0.05;
            var faceIdx = Math.floor(Math.random() * (faces.random.length));
            return faces.random[faceIdx];
        } else {
            return faces.primary;
        }
    };

})();
