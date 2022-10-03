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

/** Look up all messages in a supplied source array in a message bundle
 * @param {String[]} sourceArray - The array of keys to be looked up
 * @param {Object<String, String>} messages - The message bundle the keys are to be looked up in
 * @return {String[]} The `sourceArray` elements indirected into `messages`
 */
fluid.transforms.messageLookup = function (sourceArray, messages) {
    return sourceArray.map(function (key) {
        return messages && messages[key] || "[Message string for key " + key + " not found]";
    });
};

/***********************************************
 * Base grade panel
 ***********************************************/

fluid.defaults("fluid.prefs.panel", {
    gradeNames: ["fluid.newRendererComponent", "fluid.messageLoader", "fluid.prefs.withPreferencesMap"],
    prefsMapVariety: "panel",
    selectors: { // Note that all of this material used to be repeated inline in all the old panel variants
        header: ".flc-prefsEditor-header",
        label: ".flc-prefsEditor-label",
        description: ".flc-prefsEditor-description"
    },
    resourceOptions: {
        defaultLocale: "{fluid.prefs.localeHolder}.options.defaultLocale"
    },
    templateHasRoot: false,
    modelRelay: {
        label: {
            source: "messages.label",
            target: "dom.label.text"
        },
        labelId: {
            source: "{that}.options.labelId",
            target: "dom.label.id"
        },
        descr: {
            source: "messages.description",
            target: "dom.description.text"
        },
        locale: {
            source: "{fluid.prefs.localeHolder}.model.locale",
            target: "resourceLoader.locale"
        }
    },
    labelId: "@expand:fluid.allocateGuid()"
});


/*******************************************
 * A base grade for switch adjuster panels *
 *******************************************/

fluid.defaults("fluid.prefs.panel.switchAdjuster", {
    gradeNames: ["fluid.prefs.panel"],
    // preferences maps should map model values to "model.value"
    // model: {value: true/false}
    selectors: {
        switchContainer: ".flc-prefsEditor-switch"
    },
    components: {
        switchUI: {
            type: "fluid.switchUI",
            container: "{that}.dom.switchContainer",
            options: {
                parentMarkup: true,
                model: {
                    enabled: "{fluid.prefs.panel.switchAdjuster}.model.value",
                    messages: {
                        on: "{switchAdjuster}.model.messages.switchOn",
                        off: "{switchAdjuster}.model.messages.switchOff"
                    }
                },
                modelRelay: {
                    ariaLabelledBy: {
                        target: "{switchUI}.model.dom.control.attr.aria-labelled-by",
                        source: "{switchAdjuster}.options.labelId"
                    }
                }
            }
        }
    }
});

fluid.defaults("fluid.prefs.panel.localisedEnumLabels", {
    modelRelay: {
        lookupLabels: {
            target: "optionLabels",
            func: "fluid.transforms.messageLookup",
            args: ["{panel}.model.enumLabels", "{panel}.model.messages"]
        }
    }
});

/************************************************
 * A base grade for themePicker adjuster panels *
 ************************************************/

fluid.defaults("fluid.prefs.panel.themePicker", {
    gradeNames: ["fluid.prefs.panel", "fluid.prefs.panel.localisedEnumLabels"],
    model: {
        // optionValues: String[] produced by subclass, consumed by select control
        // enumLabels: String[] produced by subclass
        // optionLabels: String[] produced by relay from optionValues, consumed by select control
    },
    modelRelay: {
        produceRows: {
            target: "rowSource",
            func: "fluid.prefs.panel.produceThemeRows",
            args: ["{that}.model.optionValues", "{that}.model.optionLabels", "{that}.options.classes", "{that}.options.styles.defaultThemeLabel"]
        }
    },
    selectors: {
        themeRow: ".flc-prefsEditor-theme-row"
    },
    styles: {
        defaultThemeLabel: "fl-prefsEditor-themePicker-defaultThemeLabel"
    },
    dynamicComponents: {
        row: {
            type: "fluid.prefs.panel.themeRow",
            container: "{that}.dom.themeRow",
            sources: "{that}.model.rowSource",
            options: {
                rowClass: "{source}.rowClass",
                model: {
                    // Under the supplied markup model, each radio button is bound to the same model state via fluid.value's decoding
                    value: "{themePicker}.model.value",
                    rowValue: "{source}.rowValue",
                    rowLabel: "{source}.rowLabel",
                    rowClasses: "{source}.rowClasses"
                }
            }
        }
    }
    /* Markup disused and is sourced from template - retained here to retain strategy comments
    markup: {
        // Aria-hidden needed on fl-preview-A and Display 'a' created as pseudo-content in css to prevent AT from reading out display 'a' on IE, Chrome, and Safari
        // Aria-hidden needed on fl-crossout to prevent AT from trying to read crossout symbol in Safari
        label: "<span class=\"fl-preview-A\" aria-hidden=\"true\"></span><span class=\"fl-hidden-accessible\">%theme</span><div class=\"fl-crossout\" aria-hidden=\"true\"></div>"
    }*/
});

fluid.defaults("fluid.prefs.panel.themeRow", {
    gradeNames: "fluid.newRendererComponent",
    parentMarkup: true,
    selectors: {
        themeName: ".flc-prefsEditor-theme-name",
        input: ".flc-prefsEditor-theme-input",
        label: ".flc-prefsEditor-theme-label"
    },
    model: {
        // value
        // rowValue
        // rowLabel
        // rowClasses
    },
    modelRelay: {
        inputId: {
            source: "{that}.id",
            target: "dom.input.id"
        },
        inputValueAttr: {
            source: "rowValue",
            target: "dom.input.attr.value"
        },
        value: {
            source: "value",
            target: "dom.input.value"
        },
        labelFor: {
            source: "{that}.id",
            target: "dom.label.attr.for"
        },
        labelText: {
            source: "rowLabel",
            target: "dom.themeName.text"
        },
        labelStyle: {
            value: true,
            target: {
                segs: ["dom", "label", "class", "{that}.options.rowClass"]
            }
        }
        /*  labelStyle: { // Commented out - if we try to relay a block of "class" we end up erasing the whole target
            // See https://issues.fluidproject.org/browse/FLUID-6208 - claims this is not implemented but surely is for FLUID-5585
            source: "rowClasses",
            target: "dom.label.class"
        }*/
    }
});

fluid.prefs.panel.produceThemeRows = function (optionValues, optionLabels, classes/*, defaultClass*/) {
    return optionValues.map(function (value, index) {
        return {
            rowValue: value,
            rowLabel: optionLabels && optionLabels[index],
            rowClass: classes[value]
            // rowClasses: fluid.arrayToHash(fluid.makeArray(classes[value]).concat(value === "default" ? defaultClass : []))
        };
    });
};

/******************************************************
 * A base grade for textfield stepper adjuster panels *
 ******************************************************/

fluid.defaults("fluid.prefs.panel.stepperAdjuster", {
    gradeNames: ["fluid.prefs.panel"],
    // preferences maps should map model values to "model.value"
    // model: {value: ""}
    selectors: {
        textfieldStepperContainer: ".flc-prefsEditor-textfieldStepper"
    },
    components: {
        textfieldStepper: {
            type: "fluid.textfieldStepper",
            container: "{that}.dom.textfieldStepperContainer",
            options: {
                parentMarkup: true, // All the panels we have override the stepper markup with their own to add icons
                model: {
                    value: "{stepperAdjuster}.model.value",
                    range: {
                        min: "{stepperAdjuster}.options.range.min",
                        max: "{stepperAdjuster}.options.range.max"
                    },
                    step: "{stepperAdjuster}.options.step",
                    messages: {
                        increase: "{stepperAdjuster}.model.messages.increaseLabel",
                        decrease: "{stepperAdjuster}.model.messages.decreaseLabel"
                    }
                },
                modelRelay: {
                    ariaLabelledBy: {
                        target: "{textfield}.model.dom.container.attr.aria-labelled-by",
                        source: "{stepperAdjuster}.options.labelId"
                    }
                },
                scale: 1
            }
        }
    }
});
