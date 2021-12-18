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

jqUnit.module("SlidingPanel Tests");

fluid.registerNamespace("fluid.tests.slidingPanel");

fluid.tests.slidingPanelMessages = {
    "showTextAriaLabel": "+ Show Display Preferences",
    "hideTextAriaLabel": "- Hide"
};

fluid.tests.createSlidingPanel = function (options) {
    var commonOptions = {
        model: {
            messages: fluid.tests.slidingPanelMessages
        }
    };
    return fluid.slidingPanel(".flc-slidingPanel", $.extend(true, commonOptions, options));
};

fluid.tests.slidingPanel.assertAria = function (that, state) {
    var button = that.locate("toggleButton");
    var panel = that.locate("panel");

    jqUnit.assertEquals("Show/hide button has the button role", "button", button.attr("role"));
    jqUnit.assertEquals("Show/hide button has correct aria-pressed", "" + state, button.attr("aria-pressed"));
    jqUnit.assertEquals("Show/hide button has correct aria-controls", panel.attr("id"), button.attr("aria-controls"));
    jqUnit.assertEquals("Show/hide button has correct aria-expanded", "" + state, button.attr("aria-expanded"));
    jqUnit.assertEquals("Panel has the group role", "group", panel.attr("role"));
    jqUnit.assertEquals("Panel has the correct aria-label", that.model.messages.panelLabel, panel.attr("aria-label"));

    var buttonLabel = that.locate("toggleButtonLabel");
    jqUnit.assertEquals("Button label has correct aria-label", fluid.tests.slidingPanelMessages[state ? "hideTextAriaLabel" : "showTextAriaLabel"],
        buttonLabel.attr("aria-label"));
    jqUnit.assertEquals("Button label has correct text", that.model.messages[state ? "hideText" : "showText"],
        buttonLabel.text());
};

jqUnit.test("Test Init", function () {
    jqUnit.expect(9);
    var slidingPanel = fluid.tests.createSlidingPanel();

    jqUnit.assertTrue("The sliding panel is initialised", slidingPanel);
    fluid.tests.slidingPanel.assertAria(slidingPanel, false);
});

jqUnit.asyncTest("Show Panel", function () {
    jqUnit.expect(10);
    var slidingPanel = fluid.tests.createSlidingPanel();
    slidingPanel.events.afterStateChange.addListener(function () {
        var toggleButton = slidingPanel.locate("toggleButton");
        var panel = slidingPanel.locate("panel");

        jqUnit.assertEquals("Show panel", "block", panel.css("display"));
        jqUnit.assertEquals("Show panel button text", slidingPanel.model.messages.hideText, toggleButton.text());
        fluid.tests.slidingPanel.assertAria(slidingPanel, true);

        jqUnit.start();
    });
    slidingPanel.applier.change("isShowing", true);
});

jqUnit.asyncTest("Hide Panel", function () {
    jqUnit.expect(10);
    var slidingPanel = fluid.tests.createSlidingPanel({
        model: {
            isShowing: true
        }
    });

    slidingPanel.events.afterStateChange.addListener(function () {
        jqUnit.assertEquals("Hide panel", "none", slidingPanel.locate("panel").css("display"));
        jqUnit.assertEquals("Hide panel button text", slidingPanel.model.messages.showText, slidingPanel.locate("toggleButton").text());
        fluid.tests.slidingPanel.assertAria(slidingPanel, false);
        jqUnit.start();
    });

    slidingPanel.applier.change("isShowing", false);
});
