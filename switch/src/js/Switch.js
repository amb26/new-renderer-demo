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

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /**********
     * Switch *
     **********/

    fluid.defaults("fluid.switchUI", {
        gradeNames: ["fluid.newRendererComponent"],
        resources: {
            template: {
                path: "%fluid-switch/src/html/Switch.html"
            }
        },
        selectors: {
            on: ".flc-switchUI-on",
            off: ".flc-switchUI-off",
            control: ".flc-switchUI-control"
        },
        model: {
            enabled: false,
            strings: {
                // Specified by implementor
                // text of label to apply the switch, must add to "aria-label" in the attrs block
                label: "",
                on: "on",
                off: "off"
            },
            dom: {
                control: {
                    attrs: {
                        // More attributes should be specified by implementor, e.g. 
                        // ID of an element to use as a label for the switch
                        // "aria-labelledby": "",
                        // Should specify either "aria-label" or "aria-labelledby"
                        // "aria-label": "{that}.model.strings.label",
                        // ID of an element that is controlled by the switch.
                        // "aria-controls": ""
                        role: "switch"
                    }
                },
                on: {
                    text: "{that}.model.strings.on"
                },
                off: {
                    text: "{that}.model.strings.off"
                }
            }
        },
        modelRelay: {
            "aria-checked": {
                source: "{that}.model.enabled",
                target: "{that}.model.dom.control.attrs.aria-checked"
            },
            "clicked": {
                source: "{that}.model.dom.control.click",
                target: "{that}.model.enabled",
                singleTransform: {
                    type: "fluid.transforms.toggle"
                }
            }
        }
    });

})(jQuery, fluid_3_0_0);
