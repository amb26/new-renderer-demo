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

"use strict";

/**********************
 * Sliding Panel *
 *********************/

fluid.defaults("fluid.slidingPanel", {
    gradeNames: ["fluid.viewComponent"],
    selectors: {
        panel: ".flc-slidingPanel-panel",
        toggleButton: ".flc-slidingPanel-toggleButton",
        toggleButtonLabel: ".flc-slidingPanel-toggleButton"
    },
    events: {
        onStateChange: null,
        afterStateChange: null
    },
    listeners: {
        "onStateChange.operate": "fluid.slidingPanel.operateStateChange",
        "onStateChange.fireAfter": {
            func: "{that}.events.afterStateChange.fire",
            priority: "after:operate"
        }
    },
    model: {
        isShowing: false,
        messages: {
            showText: "show",
            hideText: "hide",
            panelLabel: "panel"
        }
    },
    modelListeners: {
        isShowing: {
            funcName: "fluid.promise.fireTransformEvent",
            args: ["{that}.events.onStateChange", null, {
                that: "{that}",
                isShowing: "{change}.value"
            }],
            excludeSource: "init"
        }
    },
    animationDurations: {
        hide: 400,
        show: 400
    },
    modelRelay: {
        clickToToggle: {
            source: "dom.toggleButton.click",
            target: "isShowing",
            singleTransform: {
                type: "fluid.transforms.toggle"
            }
        },
        toggleButtonRole: {
            value: "button",
            target: "dom.toggleButton.attr.role"
        },
        toggleButtonControls: {
            source: "dom.panel.id", // TODO: check that reading this actually assigns it
            target: "dom.toggleButton.attr.aria-controls"
        },
        toggleButtonPressed: {
            source: "isShowing",
            target: "dom.toggleButton.attr.aria-pressed"
        },
        toggleButtonExpanded: {
            source: "isShowing",
            target: "dom.toggleButton.attr.aria-expanded"
        },
        toggleButtonAriaLabel: {
            target: "dom.toggleButtonLabel.attr.aria-label",
            singleTransform: {
                type: "fluid.transforms.condition",
                condition: "{that}.model.isShowing",
                "true":  "{that}.model.messages.hideTextAriaLabel",
                "false": "{that}.model.messages.showTextAriaLabel"
            }
        },
        toggleButtonLabelText: {
            target: "dom.toggleButtonLabel.text",
            singleTransform: {
                type: "fluid.transforms.condition",
                condition: "{that}.model.isShowing",
                "true":  "{that}.model.messages.hideText",
                "false": "{that}.model.messages.showText"
            }
        },
        panelRole: {
            value: "group",
            target: "dom.panel.attr.role"
        },
        panelAriaLabel: {
            source: "messages.panelLabel",
            target: "dom.panel.attr.aria-label"
        }
    }
});

fluid.slidingPanel.operateStateChange = function (payload, options) {
    var that = options.that,
        isShowing = options.isShowing,
        panel = that.dom.locate("panel"),
        togo = fluid.promise();
    panel.clearQueue();
    that.dom.locate("panel")[isShowing ? "slideDown" : "slideUp"](
        that.options.animationDurations[isShowing ? "show" : "hide"], togo.resolve);
    return togo;
};
