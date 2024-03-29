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

/* global jqUnit */

"use strict";


jqUnit.module("TextfieldSlider Tests");

fluid.defaults("fluid.tests.textfieldSlider", {
    gradeNames: ["fluid.textfieldSlider"],
    ariaLabelledBy: "label-nativeHTML",
    model: {
        messages: {
            label: "Aria self-labeling"
        }
    },
    components: {
        slider: {
            options: {
                gradeNames: ["fluid.directAriaLabel"]
            }
        },
        textfield: {
            options: {
                gradeNames: "fluid.directAriaLabel"
            }
        }
    }
});

jqUnit.test("Test Init", function () {
    jqUnit.expect(10);

    var test = function (that) {
        fluid.tests.textfieldControl.assertRangeControlledTextfieldInit(that.textfield, options);

        var slider = that.locate("slider");
        jqUnit.assertEquals("The value now should be " + options.model.value, options.model.value, +slider.val());
        jqUnit.assertEquals("The max should be " + options.model.range.max, options.model.range.max, +slider.attr("max"));
        jqUnit.assertEquals("The min should be " + options.model.range.min, options.model.range.min, +slider.attr("min"));
        jqUnit.assertEquals("Slider has user-supplied aria-label value", that.model.messages.label, slider.attr("aria-label"));
        jqUnit.assertEquals("Slider has user-supplied aria-labelledby value", that.options.ariaLabelledBy, slider.attr("aria-labelledby"));
    };

    var options = {
        model: {
            value: 15,
            range: {
                min: 10,
                max: 20
            }
        },
        listeners: {
            "onCreate.test": test
        }
    };
    fluid.tests.textfieldSlider(".fl-textfield-slider", options);

});

fluid.tests.textfieldSlider.assertTextfieldEntry = function (valToTest, expected, that) {
    fluid.tests.textfieldControl.assertTextfieldEntry(valToTest, expected, that, that.locate("textfield"));
    jqUnit.assertEquals("Slider value should be " + expected, expected, +that.locate("slider").val());
};

fluid.tests.textfieldSlider.assertSliderEntry = function (valToTest, expected, that) {
    that.slider.container.val(valToTest).trigger("change");
    jqUnit.assertEquals("Textfield value should be " + expected, expected, +that.locate("textfield").val());
    jqUnit.assertEquals("Model value should be " + expected, expected, that.model.value);
};

fluid.each(fluid.tests.textfieldControl.testCases, function (currentCase) {
    jqUnit.asyncTest("textfield - " + currentCase.message, function () {
        var that = fluid.tests.textfieldSlider(".fl-textfield-slider", currentCase.componentOptions);
        that.events.onCreate.then(function () {
            fluid.each(currentCase.tests, function (currentTest) {
                fluid.tests.textfieldSlider.assertTextfieldEntry(currentTest.input, currentTest.expected, that);
            });
            jqUnit.start();
        });
    });
});

// override the invalid test case to update the tests because the
// expected value for the slider in an invalid input is different
// than the textfield entry.
fluid.tests.textfieldSlider.testCases = fluid.copy(fluid.tests.textfieldControl.testCases);
fluid.tests.textfieldSlider.testCases.invalid.tests = [
    {input: "aaa", expected: 0},
    {input: null, expected: 0}
];

fluid.each(fluid.tests.textfieldSlider.testCases, function (currentCase) {
    jqUnit.asyncTest("slider - " + currentCase.message, function () {
        var that = fluid.tests.textfieldSlider(".fl-textfield-slider", currentCase.componentOptions);
        that.events.onCreate.then(function () {
            fluid.each(currentCase.tests, function (currentTest) {
                fluid.tests.textfieldSlider.assertSliderEntry(currentTest.input, currentTest.expected, that);
            });
            jqUnit.start();
        });
    });
});
