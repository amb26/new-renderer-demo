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

/********************
 * Textfield Slider *
 ********************/

fluid.defaults("fluid.textfieldSlider", {
    gradeNames: ["fluid.newRendererComponent"],
    resources: {
        template: {
            path: "%fluid-textfield-controls/src/html/TextfieldSlider.html"
        }
    },
    selectors: {
        textfield: ".flc-textfieldSlider-field",
        slider: ".flc-textfieldSlider-slider"
    },
    components: {
        textfield: {
            type: "fluid.textfield.withRangeController",
            container: "{that}.dom.textfield",
            options: {
                model: {
                    messages: "{textfieldSlider}.model.messages"
                },
                components: {
                    controller: {
                        options: {
                            scale: "{textfieldSlider}.options.scale",
                            model: {
                                value: "{textfieldSlider}.model.value",
                                step: "{textfieldSlider}.model.step",
                                range: "{textfieldSlider}.model.range"
                            }
                        }
                    }
                }
            }
        },
        slider: {
            type: "fluid.slider",
            container: "{textfieldSlider}.dom.slider",
            options: {
                model: "{textfieldSlider}.model",
                modelRelay: {
                    ariaLabelledBy: {
                        target: "dom.container.attr.aria-labelledby",
                        source: "{textfieldSlider}.options.ariaLabelledBy"
                    }
                }
            }
        }
    },
    // ariaLabelledBy, scale
    styles: {
        container: "fl-textfieldSlider fl-focus"
    },
    model: {
        value: null,
        step: 1.0,
        range: {
            min: 0,
            max: 100
        }
        // messages: { label }
    },
    modelRelay: {
        containerStyle: {
            target: "dom.container.class",
            // We can't write "args" here since it will be assumed to be a model-oriented relay. Too hard to fix in DataBinding
            // to "look ahead".
            source: "{that}.options.styles.container",
            func: "fluid.transforms.parseClasses"
        }
    }
});

fluid.defaults("fluid.slider", {
    gradeNames: ["fluid.viewComponent"],
    parentMarkup: true,
    model: {
        // value: Numeric value
        // stringValue: Value taken from slider UI
    },
    invokers: {
        pullModel: "fluid.slider.pullModel({that})"
    },
    modelRelay: {
        stringValue: {
            target: "value",
            singleTransform: {
                type: "fluid.transforms.stringToNumber",
                input: "{that}.model.stringValue"
            }
        },
        min: {
            target: "dom.container.attr.min",
            source: "range.min"
        },
        max: {
            target: "dom.container.attr.max",
            source: "range.max"
        },
        step: {
            target: "dom.container.attr.step",
            source: "step"
        },
        value: {
            target: "dom.container.attr.value",
            source: "value"
        },
        type: {
            source: "", // TODO: Axe this
            target: "dom.container.attr.type",
            func: () => "range"
        }
    },
    listeners: {
        "onCreate.bindSlideEvt": {
            "this": "{that}.container",
            "method": "on",
            "args": ["input", "{that}.pullModel"]
        },
        "onCreate.bindRangeChangeEvt": {
            "this": "{that}.container",
            "method": "on",
            "args": ["change", "{that}.pullModel"]
        }
    },
    modelListeners: {
        "value": {
            "this": "{that}.container",
            "method": "val",
            args: ["{change}.value"],
            excludeSource: "init"
        }
    }
});

fluid.slider.pullModel = function (that) {
    var value = that.container.val();
    that.applier.change("stringValue", value);
};
