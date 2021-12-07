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

// Note that fontSizeMap is defined simply inline on the enactor, rather than on the UIEnhancer, since it is not
// shared with panels
// However it feels like there should be a generalised ability for a panel to look up the enhancer for a
// particular preference. What if it needed to get at "cssCustomProp" etc?


/*******************************************************************************
 * lineSpace
 *
 * Sets the line space on the container to the multiple provided.
 *******************************************************************************/

fluid.defaults("fluid.prefs.enactor.lineSpace", {
    gradeNames: ["fluid.prefs.enactor.textRelatedSizer"],
    preferencesMap: {
        "fluid.prefs.lineSpace": {
            "model.value": "value"
        }
    },
    styles: {
        enabled: "fl-lineSpace-enabled"
    },
    cssCustomProp: {
        factor: "--fl-lineSpace-factor",
        size: "--fl-lineSpace"
    },
    fontSizeMap: { // For some reason, this used to be in "aux schema"
        "xx-small": "9px",
        "x-small": "11px",
        "small": "13px",
        "medium": "15px",
        "large": "18px",
        "x-large": "23px",
        "xx-large": "30px"
    },
    scale: 1,
    invokers: {
        set: { // This is an override from textRelatedSizer
            funcName: "fluid.prefs.enactor.lineSpace.set",
            args: ["{that}", "{arguments}.0"]
        },
        getLineHeight: {
            funcName: "fluid.prefs.enactor.lineSpace.getLineHeight",
            args: "{that}.container"
        },
        getLineHeightMultiplier: {
            funcName: "fluid.prefs.enactor.lineSpace.getLineHeightMultiplier",
            args: [{expander: {func: "{that}.getLineHeight"}}, {expander: {func: "{that}.getTextSizeInPx"}}]
        }
    }
});

// Get the line-height of an element
// In IE8 and IE9 this will return the line-height multiplier
// In other browsers it will return the pixel value of the line height.
fluid.prefs.enactor.lineSpace.getLineHeight = function (container) {
    return container.css("line-height");
};

// Interprets browser returned "line-height" value, either a string "normal", a number with "px" suffix or "undefined"
// into a numeric value in em.
// Return 0 when the given "lineHeight" argument is "undefined" (http://issues.fluidproject.org/browse/FLUID-4500).
fluid.prefs.enactor.lineSpace.getLineHeightMultiplier = function (lineHeight, fontSize) {
    // Needs a better solution. For now, "line-height" value "normal" is defaulted to 1.2em
    // according to https://developer.mozilla.org/en/CSS/line-height
    if (lineHeight === "normal") {
        return 1.2;
    }

    return fluid.roundToDecimal(parseFloat(lineHeight) / fontSize, 2);
};

/**
 * Sets the line space related classes and CSS custom properties on the component's container.
 * If the application will set the line height to its initial value, the "enabled" class and CSS custom properties
 * are removed.
 *
 * @param {fluid.prefs.enactor.lineSpace} that - An instance of a `fluid.prefs.enactor.lineSpace` component
 * @param {Number} [factor] - (Optional) The amount (multiplier) to increase the intial line height by.
 */
fluid.prefs.enactor.lineSpace.set = function (that, factor) {
    var container = that.container,
        cssCustomProp = that.options.cssCustomProp;
    factor = fluid.roundToDecimal(factor, that.options.scale) || 1;
    // Calculating the lineHeightMultiplier here rather than using a members expand because the "line-height"
    // cannot be detected on hidden containers such as separated panel iframe.
    if (!that.lineHeightMultiplier) {
        that.lineHeightMultiplier = that.getLineHeightMultiplier();
    }

    if (that.lineHeightMultiplier && factor !== 1) {
        var targetLineSpace = fluid.roundToDecimal(factor * that.lineHeightMultiplier, 2);
        container.addClass(that.options.styles.enabled);
        container.css(cssCustomProp.size, targetLineSpace);
        container.css(cssCustomProp.factor, factor);
    } else {
        container.removeClass(that.options.styles.enabled);
        container.css(cssCustomProp.size, "");
        container.css(cssCustomProp.factor, "");
    }
};
