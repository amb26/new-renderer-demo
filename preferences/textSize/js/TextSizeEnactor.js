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

/*******************************************************************************
 * textSize
 *
 * Sets the text size on the root element to the multiple provided.
 *******************************************************************************/

// Note that the implementors need to provide the container for this view component
fluid.defaults("fluid.prefs.enactor.textSize", {
    gradeNames: ["fluid.prefs.enactor.textRelatedSizer"],
    preferencesMap: {
        "fluid.prefs.textSize": {
            "model.value": "value"
        }
    },
    styles: {
        enabled: "fl-textSize-enabled"
    },
    cssCustomProp: {
        factor: "--fl-textSize-factor",
        size: "--fl-textSize"
    },
    scale: 1,
    members: {
        root: "@expand:fluid.prefs.enactor.textSize.computeRoot({that}.container)"
    },
    invokers: {
        set: {
            funcName: "fluid.prefs.enactor.textSize.set",
            args: ["{that}", "{arguments}.0", "{that}.getTextSizeInPx"]
        },
        getTextSizeInPx: {
            args: ["{that}.root", "{that}.options.fontSizeMap"]
        }
    }
});

// See tech checkin notes from 2022-07-07 at https://docs.google.com/document/d/1_W89CeZZh69T8NtKzdHQblvuD344Cr3hYlcw1oBNwLc/edit#heading=h.umodf4oiza8d
// Note that a size in rems is taken from the document's html element, not body - https://stackoverflow.com/a/48451850
// Other properties may not be legal to appear on the html element (check this) - in the case the enhancer has targeted
// us at the body element, hop up one element to the body.
/** Given a container element, determine whether text size CSS properties should be set on it or its parent <html> element
 * @param {jQuery} container - The container element
 * @return {jQuery} Either the supplied container element, or its parent <html> element if it is a <body> element
 */
fluid.prefs.enactor.textSize.computeRoot = function (container) {
    return container[0].tagName.toLowerCase() === "body" ? container.closest("html") : container;
};

/**
 * Sets the text size related classes and CSS custom properties of the element specified at `that.root`.
 * If the application will set the text size to its initial value, the "enabled" class and CSS custom properties
 * are removed.
 *
 * @param {fluid.prefs.enactor.textSize} that - An instance of a `fluid.prefs.enactor.textSize` component
 * @param {Number} [factor] - (optional) The amount (multiplier) to increase the intial text size by.
 */
fluid.prefs.enactor.textSize.set = function (that, factor) {
    factor = fluid.roundToDecimal(factor, that.options.scale) || 1;
    // Calculating the initial size here rather than using a members expand because the "font-size"
    // cannot be detected on hidden containers such as separated panel iframe.
    if (!that.initialSize) {
        that.initialSize = that.getTextSizeInPx();
    }

    var targetSize = fluid.roundToDecimal(factor * that.initialSize);
    that.root.addClass(that.options.styles.enabled);
    that.root.css(that.options.cssCustomProp.size, `${targetSize}px`);
    that.root.css(that.options.cssCustomProp.factor, factor);
};
