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

/* global fluid, jqUnit */

(function ($) {
    "use strict";
    jqUnit.module("Switch Tests");

    fluid.defaults("fluid.tests.switchUI", {
        gradeNames: ["fluid.switchUI"],
        model: {
            strings: {
                "label": "Aria label"
            },
            dom: {
                control: {
                    attrs: {
                        // typically only one of these will be set, but have both here for the tests
                        "aria-label": "{that}.model.strings.label",
                        "aria-labelledby": "label"                        
                    }
                }
            }
        }
    });

    fluid.tests.switchUI.assertState = function (that, state) {
        jqUnit.assertEquals("The model state is set correctly", state, that.model.enabled);
        jqUnit.assertEquals("The aria-checked state is specified correctly", state.toString(), that.locate("control").attr("aria-checked"));
    };

    fluid.tests.switchUI.assertInit = function (that) {
        var control = that.locate("control");
        jqUnit.assertEquals("The switch role is added", "switch", control.attr("role"));
        jqUnit.assertEquals("The aria-label is set", that.model.strings.label, control.attr("aria-label"));
        jqUnit.assertEquals("The aria-labelledby is set", "label", control.attr("aria-labelledby"));
        jqUnit.assertEquals("The on text is set", that.model.strings.on, that.locate("on").text());
        jqUnit.assertEquals("The off text is set", that.model.strings.off, that.locate("off").text());
    };

    fluid.tests.switchUI.makeSwitch = function (enabled) {
        var togo = fluid.promise();
        var that = fluid.tests.switchUI(".flc-switchUI", {
            model: {
                enabled: enabled
            },
            listeners: {
                onCreate: function (that) {
                    togo.resolve(that);
                }
            }
        });
        return togo;
    };

    jqUnit.test("Test Init - enabled", async function () {
        var that = await fluid.tests.switchUI.makeSwitch(true);
        fluid.tests.switchUI.assertInit(that);
        fluid.tests.switchUI.assertState(that, true);
    });

    jqUnit.test("Test Init - not enabled", async function () {
        var that = await fluid.tests.switchUI.makeSwitch(false);
        fluid.tests.switchUI.assertInit(that);
        fluid.tests.switchUI.assertState(that, false);
    });

    jqUnit.test("Toggle State - Click", async function () {
        var that = await fluid.tests.switchUI.makeSwitch(false);

        that.locate("control").trigger("click");
        fluid.tests.switchUI.assertState(that, true);

        that.locate("control").trigger("click");
        fluid.tests.switchUI.assertState(that, false);
    });
})(jQuery);
