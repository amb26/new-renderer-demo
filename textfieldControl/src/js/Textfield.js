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

/*************
 * Textfield *
 *************/

// An addon grade to choose to source a component container's "aria-label" attribute directly from its "label" message
fluid.defaults("fluid.directAriaLabel", {
    gradeNames: ["fluid.viewComponent"],
    modelRelay: {
        directAriaLabel: {
            source: "{that}.model.messages.label",
            target: "{that}.model.dom.container.attr.aria-label"
        }
    }
});

// An addon grade to choose to source a component container's "aria-labelled-by" attribute directly from its ariaLabelledBy option
// Currently used only in test cases
fluid.defaults("fluid.ariaLabelledBy", {
    gradeNames: ["fluid.viewComponent"],
    modelRelay: {
        ariaLabelledBy: {
            source: "{that}.options.ariaLabelledBy",
            target: "{that}.model.dom.container.attr.aria-labelledby"
        }
    }
});

/*
 * A component for controlling a textfield and handling data binding.
 * Typically this will be used in conjunction with a UI control widget such as
 * button steppers or slider.
 */
fluid.defaults("fluid.textfield", {
    gradeNames: ["fluid.viewComponent"],
    parentMarkup: true,
    modelRelay: {
        textfieldValue: {
            source: "dom.container.value",
            target: "value"
        }
    }
});

/******************************
 * TextField Range Controller *
 ******************************/

/*
 * Range Controller is intended to be used as a grade on a fluid.textfield component. It will limit the input
 * to be constrained within a given numerical range. This should be paired with configuring the textfield.setModel
 * invoker to use fluid.textfield.setModelRestrictToNumbers.
 * The Range Controller is useful when combining the textfield with a UI control element such as stepper buttons
 * or a slider to enter numerical values.
 */
fluid.defaults("fluid.textfield.withRangeController", {
    gradeNames: ["fluid.textfield"],
    components: {
        controller: {
            type: "fluid.modelComponent",
            options: {
                model: {
                    // value: null // numeric value
                    // step
                    // range: {min, max}
                },
                modelRelay: {
                    scale: { // Note that this relay is bidirectional - a change in text value will also get converted onto this number
                        source: "value",
                        target: "{fluid.textfield}.model.value",
                        singleTransform: {
                            type: "fluid.transforms.numberToString",
                            // The scale option sets the number of decimal places to round
                            // the number to. If no scale is specified, the number will not be rounded.
                            // Scaling is useful to avoid long decimal places due to floating point imprecision.
                            scale: "{that}.options.scale"
                        }
                    },
                    min: {
                        target: "{fluid.textfield}.model.dom.container.attr.min",
                        source: "{that}.model.range.min"
                    },
                    max: {
                        target: "{fluid.textfield}.model.dom.container.attr.max",
                        source: "{that}.model.range.max"
                    },
                    step: {
                        target: "{fluid.textfield}.model.dom.container.attr.step",
                        source: "{that}.model.step"
                    }
                },
                modelListeners: {
                    limitValue: {
                        path: "value",
                        listener: "fluid.textfield.limitRange",
                        args: ["{that}", "{change}.value"],
                        priority: "last"
                    }
                }
            }
        }
    },
    modelListeners: {
        validateTextfield: {
            path: "value",
            source: "DOM",
            listener: "fluid.textfield.validateToNumbers",
            args: ["{that}", "{change}.value", "{that}.controller.model.value"],
            priority: "last" // last otherwise we may end up get a old value relayed back into us from another notification
        }
    }
});
/**
 * Sets the model value only if the new value is a valid number, and will reset the textfield to the current model
 * value otherwise.
 *
 * @param {Object} that - The component.
 * @param {String} value - The incoming textual value from the UI
 * @param {Number} oldValue - The previously stored valid numeric value
 */
fluid.textfield.validateToNumbers = function (that, value, oldValue) {
    var isNumber = !isNaN(Number(value));
    if (!isNumber) {
        that.applier.change("value", oldValue);
    }
    // Set the textfield to the latest valid entry.
    // This handles both the cases where an invalid entry was provided, as well as cases where a valid number is
    // rounded. In the case of rounded numbers this ensures that entering a number that rounds to the current
    // set value, doesn't leave the textfield with the unrounded number present.
};

// Note that we don't use a relay here because of FLUID-6701
fluid.textfield.limitRange = function (that, value) {
    var limited = fluid.transforms.limitRange(value, {
        min: that.model.range.min,
        max: that.model.range.max
    });
    that.applier.change("value", limited);
};
