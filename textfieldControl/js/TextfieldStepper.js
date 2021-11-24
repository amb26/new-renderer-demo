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

/*********************
 * Textfield Stepper *
 *********************/

fluid.defaults("fluid.textfieldStepper", {
    gradeNames: ["fluid.newRendererComponent"],
    resources: {
        template: {
            path: "%fluid-textfield-controls/html/TextfieldStepper.html"
        }
    },
    selectors: {
        textfield: ".flc-textfieldStepper-field",
        focusContainer: ".flc-textfieldStepper-focusContainer",
        increaseButton: ".flc-textfieldStepper-increase",
        decreaseButton: ".flc-textfieldStepper-decrease"
    },
    styles: {
        container: "fl-textfieldStepper",
        focus: "fl-textfieldStepper-focus"
    },
    components: {
        textfield: {
            type: "fluid.textfield.withRangeController",
            container: "{that}.dom.textfield",
            options: {
                components: {
                    controller: {
                        options: {
                            model: "{textfieldStepper}.model"
                        }
                    }
                }
            }
        },
        increaseButton: {
            type: "fluid.textfieldStepper.button",
            container: "{textfieldStepper}.dom.increaseButton",
            options: {
                modelListeners: {
                    increase: {
                        excludeSource: "init",
                        path: "click",
                        func: "{textfieldStepper}.increase"
                    }
                },
                model: {
                    messages: {
                        label: "{textfieldStepper}.model.messages.increase"
                    }
                },
                modelRelay: {
                    target: "disabled",
                    args: ["{textfieldStepper}.model.value", "{textfieldStepper}.model.range.max"],
                    func: (value, max) => value >= max
                }
            }
        },
        decreaseButton: {
            type: "fluid.textfieldStepper.button",
            container: "{textfieldStepper}.dom.decreaseButton",
            options: {
                modelListeners: {
                    decrease: {
                        excludeSource: "init",
                        path: "click",
                        func: "{textfieldStepper}.decrease"
                    }
                },
                model: {
                    messages: {
                        label: "{textfieldStepper}.model.messages.decrease"
                    }
                },
                modelRelay: {
                    target: "disabled",
                    args: ["{textfieldStepper}.model.value", "{textfieldStepper}.model.range.min"],
                    func: (value, min) => value <= min
                }
            }
        }
    },
    invokers: {
        // TODO: We could generalise our existing "toggle" transform to a general "differential linear relay"
        increase: {
            funcName: "fluid.textfieldStepper.step",
            args: ["{that}"]
        },
        decrease: {
            funcName: "fluid.textfieldStepper.step",
            args: ["{that}", -1]
        }
    },
    modelRelay: {
        focus: {
            source: "dom.container.focusin",
            target: {
                segs: ["dom", "container", "class", "{that}.options.styles.focus"]
            }
        },
        containerStyle: {
            target: {
                segs: ["dom", "container", "class", "{that}.options.styles.container"]
            },
            value: true
        },
        ariaLabel: {
            source: "label",
            target: "dom.container.attr.aria-label"
        }
    },
    model: {
        value: null,
        step: 1,
        range: {
            min: 0,
            max: 100
        },
        messages: {
            increase: "increment", // Goes to increase button's aria-label
            decrease: "decrement", // Goes to decrease button's aria-label
            label: ""             // Goes to our own aria-label
        }
        // ariaLabelledBy - a label passed down to the aria-labelled-by attribute of the textfield
    },
    distributeOptions: [{
        // The scale option sets the number of decimal places to round
        // the number to. If no scale is specified, the number will not be rounded.
        // Scaling is useful to avoid long decimal places due to floating point imprecision.
        source: "{that}.options.scale",
        target: "{that > fluid.textfield > controller}.options.scale"
    }]
});

fluid.textfieldStepper.step = function (that, coefficient) {
    coefficient = coefficient || 1;
    var newValue = that.model.value + (coefficient * that.model.step);
    that.applier.change("value", newValue);
};

fluid.defaults("fluid.textfieldStepper.button", {
    gradeNames: ["fluid.newRendererComponent"],
    parentMarkup: true,
    styles: {
        container: "fl-textfieldStepper-button"
    },
    model: {
        messages: {
            // to be specified by an implementor.
            // to provide a label for the button.
            // label: ""
        },
        disabled: false,
        click: 0
    },
    modelRelay: {
        markupEnabled: {
            source: "disabled",
            target: "dom.container.enabled",
            func: x => !x
        },
        // removing from tab order as keyboard users will
        // increment and decrement the stepper using the up/down arrow keys.
        removeFromTabOrder: {
            target: "dom.container.attr.tabindex",
            value: -1
        },
        containerStyle: {
            target: {
                segs: ["dom", "container", "class", "{that}.options.styles.container"]
            },
            value: true
        },
        label: {
            target: "dom.container.attr.aria-label",
            source: "messages.label"
        },
        click: {
            target: "click",
            source: "dom.container.click"
        }
    }
});
