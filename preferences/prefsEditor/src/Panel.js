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

fluid.prefs.stringLookup = function (messageResolver, stringArrayIndex) {
    var that = {id: fluid.allocateGuid()};
    that.singleLookup = function (value) {
        var looked = messageResolver.lookup([value]);
        return fluid.get(looked, "template");
    };
    that.multiLookup = function (values) {
        return fluid.transform(values, function (value) {
            return that.singleLookup(value);
        });
    };
    that.lookup = function (value) {
        var values = fluid.get(stringArrayIndex, value) || value;
        var lookupFn = fluid.isArrayable(values) ? "multiLookup" : "singleLookup";
        return that[lookupFn](values);
    };
    that.resolvePathSegment = that.lookup;
    return that;
};

/***********************************************
 * Base grade panel
 ***********************************************/

fluid.defaults("fluid.prefs.panel", {
    gradeNames: ["fluid.newRendererComponent", "fluid.messageLoader", "fluid.prefs.withPreferencesMap"],
    prefsMapVariety: "panel"
});


/*******************************************
 * A base grade for switch adjuster panels *
 *******************************************/

fluid.defaults("fluid.prefs.panel.switchAdjuster", {
    gradeNames: ["fluid.prefs.panel"],
    // preferences maps should map model values to "model.value"
    // model: {value: ""}
    selectors: {
        header: ".flc-prefsEditor-header",
        switchContainer: ".flc-prefsEditor-switch",
        label: ".flc-prefsEditor-label",
        description: ".flc-prefsEditor-description"
    },
    selectorsToIgnore: ["header", "switchContainer"],
    components: {
        switchUI: {
            type: "fluid.switchUI",
            container: "{that}.dom.switchContainer",
            createOnEvent: "afterRender",
            options: {
                strings: {
                    on: "{fluid.prefs.panel.switchAdjuster}.msgLookup.switchOn",
                    off: "{fluid.prefs.panel.switchAdjuster}.msgLookup.switchOff"
                },
                model: {
                    enabled: "{fluid.prefs.panel.switchAdjuster}.model.value"
                },
                attrs: {
                    "aria-labelledby": {
                        expander: {
                            funcName: "fluid.allocateSimpleId",
                            args: ["{fluid.prefs.panel.switchAdjuster}.dom.description"]
                        }
                    }
                }
            }
        }
    },
    protoTree: {
        label: {messagekey: "label"},
        description: {messagekey: "description"}
    }
});

/************************************************
 * A base grade for themePicker adjuster panels *
 ************************************************/

fluid.defaults("fluid.prefs.panel.themePicker", {
    gradeNames: ["fluid.prefs.panel"],
    mergePolicy: {
        "controlValues.theme": "replace",
        "stringArrayIndex.theme": "replace"
    },
    // The controlValues are the ordered set of possible modelValues corresponding to each theme option.
    // The order in which they are listed will determine the order they are presented in the UI.
    // The stringArrayIndex contains the ordered set of namespaced strings in the message bundle.
    // The order must match the controlValues in order to provide the proper labels to the theme options.
    controlValues: {
        theme: [] // must be supplied by the integrator
    },
    stringArrayIndex: {
        theme: [] // must be supplied by the integrator
    },
    selectID: "{that}.id", // used for the name attribute to group the selection options
    listeners: {
        "afterRender.style": "{that}.style"
    },
    selectors: {
        themeRow: ".flc-prefsEditor-themeRow",
        themeLabel: ".flc-prefsEditor-theme-label",
        themeInput: ".flc-prefsEditor-themeInput",
        label: ".flc-prefsEditor-themePicker-label",
        description: ".flc-prefsEditor-themePicker-descr"
    },
    styles: {
        defaultThemeLabel: "fl-prefsEditor-themePicker-defaultThemeLabel"
    },
    repeatingSelectors: ["themeRow"],
    protoTree: {
        label: {messagekey: "label"},
        description: {messagekey: "description"},
        expander: {
            type: "fluid.renderer.selection.inputs",
            rowID: "themeRow",
            labelID: "themeLabel",
            inputID: "themeInput",
            selectID: "{that}.options.selectID",
            tree: {
                optionnames: "${{that}.msgLookup.theme}",
                optionlist: "${{that}.options.controlValues.theme}",
                selection: "${value}"
            }
        }
    },
    markup: {
        // Aria-hidden needed on fl-preview-A and Display 'a' created as pseudo-content in css to prevent AT from reading out display 'a' on IE, Chrome, and Safari
        // Aria-hidden needed on fl-crossout to prevent AT from trying to read crossout symbol in Safari
        label: "<span class=\"fl-preview-A\" aria-hidden=\"true\"></span><span class=\"fl-hidden-accessible\">%theme</span><div class=\"fl-crossout\" aria-hidden=\"true\"></div>"
    },
    invokers: {
        style: {
            funcName: "fluid.prefs.panel.themePicker.style",
            args: [
                "{that}.dom.themeLabel",
                "{that}.msgLookup.theme",
                "{that}.options.markup.label",
                "{that}.options.controlValues.theme",
                "default",
                "{that}.options.classnameMap.theme",
                "{that}.options.styles.defaultThemeLabel"
            ]
        }
    }
});

// Random mixture of string templating and post-hoc DOM manipulation - the only string templating is to reach into the nested
// span to slap %theme in there
// TODO: Convert to integral rendering to "label" - looks like there is only expected to be one
fluid.prefs.panel.themePicker.style = function (labels, strings, markup, theme, defaultThemeName, style, defaultLabelStyle) {
    fluid.each(labels, function (label, index) {
        label = $(label);

        var themeValue = strings[index];
        label.html(fluid.stringTemplate(markup, {
            theme: themeValue
        }));

        var labelTheme = theme[index];
        if (labelTheme === defaultThemeName) {
            label.addClass(defaultLabelStyle);
        }
        label.addClass(style[labelTheme]);
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
        header: ".flc-prefsEditor-header",
        textfieldStepperContainer: ".flc-prefsEditor-textfieldStepper",
        label: ".flc-prefsEditor-label",
        descr: ".flc-prefsEditor-descr"
    },
    components: {
        textfieldStepper: {
            type: "fluid.textfieldStepper",
            container: "{that}.dom.textfieldStepperContainer",
            options: {
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
    },
    labelId: "@expand:fluid.allocateGuid()",
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
            target: "dom.desc.text"
        }
    }
});
