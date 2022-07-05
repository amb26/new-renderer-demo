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
        root: {
            expander: {
                "this": "{that}.container",
                "method": "closest", // ensure that the correct document is being used. i.e. in an iframe
                "args": ["html"]
            }
        }
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
    // cannot be detected on hidden containers such as separated paenl iframe.
    if (!that.initialSize) {
        that.initialSize = that.getTextSizeInPx();
    }

    if (that.initialSize && factor !== 1) {
        var targetSize = fluid.roundToDecimal(factor * that.initialSize);
        that.container.addClass(that.options.styles.enabled);
        that.container.css(that.options.cssCustomProp.size, `${targetSize}px`);
        that.container.css(that.options.cssCustomProp.factor, factor);
    } else {
        that.container.removeClass(that.options.styles.enabled);
        that.container.css(that.options.cssCustomProp.size, "");
        that.container.css(that.options.cssCustomProp.factor, "");
    }
};
