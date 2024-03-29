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
    container: "{uiEnhancer}.container",
    prefsMapVariety: "enactor"
});

// A tag grade added to an enactor to signal that it should not be instantiated as part of a preference editor's own
// enactor set
fluid.defaults("fluid.prefs.enactor.excludeFromPrefsEditor", {
    gradeNames: "fluid.component"
});

// A tag grade used to hold selectors which should be ignored by the action of an enactor scanning the DOM for material
// to act on - currently consumed by the SyllabificationEnactor and the TableOfContentsEnactor
fluid.defaults("fluid.prefs.enactor.ignorableSelectorHolder", {
    gradeNames: "fluid.component"
    // ignoreSelectorForEnactor - an enactor receives a selector in this field which marks material in the document to be ignored
});

// Applied to an enactor to encode that it needs a "blocking class" applied to the root element of a preference editor
// in order to prevent leakage of styling applied to the main document
fluid.defaults("fluid.prefs.enactor.withBlockingClass", {
    gradeNames: "fluid.component"
    // blockingClass - a class name which must be applied to the root element of the prefs editor interface to insulate it
});

/**********************************************************************************
 * styleElements
 *
 * Adds or removes the classname to/from the elements based upon the model value.
 * This component is used as a base grade by enhanceInputs
 **********************************************************************************/
fluid.defaults("fluid.prefs.enactor.styleElements", {
    gradeNames: ["fluid.prefs.enactor"],
    cssClass: null,  // Must be supplied by implementors
    elementsToStyle: null,  // Must be supplied by implementors
    invokers: {
        applyStyle: {
            funcName: "fluid.prefs.enactor.styleElements.applyStyle",
            args: ["{arguments}.0", "{arguments}.1"]
        },
        resetStyle: {
            funcName: "fluid.prefs.enactor.styleElements.resetStyle",
            args: ["{arguments}.0", "{arguments}.1"]
        },
        handleStyle: {
            funcName: "fluid.prefs.enactor.styleElements.handleStyle",
            args: ["{arguments}.0", "{that}.options.elementsToStyle", "{that}.options.cssClass", "{that}.applyStyle", "{that}.resetStyle"]
        }
    },
    modelListeners: {
        value: {
            listener: "{that}.handleStyle",
            args: ["{change}.value"],
            namespace: "handleStyle"
        }
    }
});

fluid.prefs.enactor.styleElements.applyStyle = function (elements, cssClass) {
    elements.addClass(cssClass);
};

fluid.prefs.enactor.styleElements.resetStyle = function (elements, cssClass) {
    $(elements, "." + cssClass).addBack().removeClass(cssClass);
};

fluid.prefs.enactor.styleElements.handleStyle = function (value, elements, cssClass, applyStyleFunc, resetStyleFunc) {
    var func = value ? applyStyleFunc : resetStyleFunc;
    func(elements, cssClass);
};

/*******************************************************************************
 * ClassSwapper
 *
 * Has a hash of classes it cares about and will remove all those classes from
 * its container before setting the new class.
 * This component is a base grade for textFont and contrast
 *******************************************************************************/

fluid.defaults("fluid.prefs.enactor.classSwapper", {
    gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
    classes: {},  // Must be supplied by implementors - a map of model values to applied CSS classes
    invokers: {
        clearClasses: {
            funcName: "fluid.prefs.enactor.classSwapper.clearClasses",
            args: ["{that}.container", "{that}.classStr"]
        },
        swap: {
            funcName: "fluid.prefs.enactor.classSwapper.swap",
            args: ["{arguments}.0", "{that}", "{that}.clearClasses"]
        }
    },
    modelListeners: {
        value: {
            listener: "{that}.swap",
            args: ["{change}.value"],
            namespace: "swapClass"
        }
    },
    members: {
        classStr: {
            expander: {
                func: "fluid.prefs.enactor.classSwapper.joinClassStr",
                args: "{that}.options.classes"
            }
        }
    }
});

fluid.prefs.enactor.classSwapper.clearClasses = function (container, classStr) {
    container.removeClass(classStr);
};

fluid.prefs.enactor.classSwapper.swap = function (value, that, clearClassesFunc) {
    clearClassesFunc();
    that.container.addClass(that.options.classes[value]);
};

fluid.prefs.enactor.classSwapper.joinClassStr = function (classes) {
    var classStr = "";

    fluid.each(classes, function (oneClassName) {
        if (oneClassName) {
            classStr += classStr ? " " + oneClassName : oneClassName;
        }
    });
    return classStr;
};


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
        setAdaptation: {
            path: "value",
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
    styles: {
        enabled: ""
    },
    cssProp: "", // Overridden to read original spacing on startup
    cssCustomProp: {
        factor: "",
        size: ""
    },
    invokers: {
        set: {
            funcName: "fluid.prefs.enactor.spacingSetter.set",
            args: ["{that}", "{arguments}.0"]
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
            namespace: "setAdaptationUnit"
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
    }
});

fluid.prefs.enactor.spacingSetter.getSpacing = function (that, cssProp, getTextSizeFn) {
    var current = parseFloat(that.container.css(cssProp));
    var textSize = getTextSizeFn();
    return fluid.roundToDecimal(current / textSize, 2);
};

/**
 * Sets the spacing related classes and CSS custom properties on the component's container.
 * If the application will set the space to its initial value, the "enabled" class and CSS custom properties are
 * removed.
 *
 * @param {fluid.prefs.enactor.spacingSetter} that - An instance of a `fluid.prefs.enactor.spacingSetter` component
 * @param {Number} [units] - (optional) The amount to increase the intial line height by.
 */
fluid.prefs.enactor.spacingSetter.set = function (that, units) {
    units = units || 0;
    var rounded = fluid.roundToDecimal(that.originalSpacing + units, 2);

    that.container.toggleClass(that.options.styles.enabled, true);
    that.container.css(that.options.cssCustomProp.size, rounded + "em");
    that.container.css(that.options.cssCustomProp.factor, units);
};
