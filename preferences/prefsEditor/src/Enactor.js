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

fluid.defaults("fluid.prefs.enactor", {
    gradeNames: ["fluid.modelComponent", "fluid.prefs.withPreferencesMap"],
    prefsMapVariety: "enactor"
});

/*******************************************************************************
 * Functions shared by textSize and lineSpace
 *******************************************************************************/

/**
 * return "font-size" in px
 * @param {Object} container - The container to evaluate.
 * @param {Object} fontSizeMap - The mapping between the font size string values ("small", "medium" etc) to px values.
 * @return {Number} - The size of the container, in px units.
 */
fluid.prefs.enactor.getTextSizeInPx = function (container, fontSizeMap) {
    var fontSize = container.css("font-size");

    if (fontSizeMap[fontSize]) {
        fontSize = fontSizeMap[fontSize];
    }

    // return fontSize in px
    return parseFloat(fontSize);
};

/*******************************************************************************
 * textRelatedSizer
 *
 * Provides an abstraction for enactors that need to adjust sizes based on
 * a text size value from the DOM. This could include things such as:
 * font-size, line-height, letter-spacing, and etc.
 *******************************************************************************/
 // Descendents: textSize, lineSpace (directly) letterSpace, wordSpace (via spacingSetter)

fluid.defaults("fluid.prefs.enactor.textRelatedSizer", {
    gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
    fontSizeMap: {},  // must be supplied by implementors
    invokers: {
        set: "fluid.notImplemented", // must be supplied by a concrete implementation
        getTextSizeInPx: {
            funcName: "fluid.prefs.enactor.getTextSizeInPx",
            args: ["{that}.container", "{that}.options.fontSizeMap"]
        }
    },
    modelListeners: {
        value: {
            listener: "{that}.set",
            args: ["{change}.value"],
            namespace: "setAdaptation"
        }
    }
});

/*******************************************************************************
 * spacingSetter
 *
 * Sets the css spacing value on the container to the number of units to
 * increase the space by. If a negative number is provided, the space between
 * will decrease. Setting the value to 1 or unit to 0 will use the default.
 *******************************************************************************/
 // Descendents: letterSpace, wordSpace

fluid.defaults("fluid.prefs.enactor.spacingSetter", {
    gradeNames: ["fluid.prefs.enactor.textRelatedSizer"],
    members: {
        originalSpacing: {
            expander: {
                func: "{that}.getSpacing"
            }
        }
    },
    cssProp: "",
    invokers: {
        set: {
            funcName: "fluid.prefs.enactor.spacingSetter.set",
            args: ["{that}", "{that}.options.cssProp", "{arguments}.0"]
        },
        getSpacing: {
            funcName: "fluid.prefs.enactor.spacingSetter.getSpacing",
            args: ["{that}", "{that}.options.cssProp", "{that}.getTextSizeInPx"]
        }
    },
    modelListeners: {
        unit: {
            listener: "{that}.set",
            args: ["{change}.value"],
            namespace: "setAdaptation"
        },
        // Replace default model listener, because `value` needs be transformed before being applied.
        // The `unit` model value should be used for setting the adaptation.
        value: {
            listener: "fluid.identity",
            namespace: "setAdaptation"
        }
    },
    modelRelay: {
        source: "value",
        target: "unit",
        namespace: "toUnit",
        func: x => fluid.roundToDecimal(x - 1, 1)
        /*
        singleTransform: {
            type: "fluid.transforms.round",
            scale: 1,
            input: {
                transform: {
                    "type": "fluid.transforms.linearScale",
                    "offset": -1,
                    "input": "{that}.model.value"
                }
            }
        }*/
    }
});

fluid.prefs.enactor.spacingSetter.getSpacing = function (that, cssProp, getTextSizeFn) {
    var current = parseFloat(that.container.css(cssProp));
    var textSize = getTextSizeFn();
    return fluid.roundToDecimal(current / textSize, 2);
};

fluid.prefs.enactor.spacingSetter.set = function (that, cssProp, units) {
    var targetSize = that.originalSpacing;

    if (units) {
        targetSize = targetSize + units;
    }

    // setting the style value to "" will remove it.
    var spacingSetter = targetSize ?  fluid.roundToDecimal(targetSize, 2) + "em" : "";
    that.container.css(cssProp, spacingSetter);
};
