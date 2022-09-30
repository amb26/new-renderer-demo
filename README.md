# FLUID-5047 new renderer demo

This demonstrates in-progress work implementing the new Infusion renderer which is lightly described at
[FLUID-5047](https://issues.fluidproject.org/browse/FLUID-5047).
This project houses several demonstrations and implementations -

- Reimplementations of the existing [Switch](switch), [TextfieldSlider](textfieldControl/src/js/TextfieldSlider.js),
[TextfieldStepper](textfieldControl/src/js/TextfieldStepper.js) and [TableOfContents](tableOfContents) components with identical
functionality and near-identical interfaces to those in Infusion trunk
- Isomorphic rendering demo of the TextfieldSlider at [demos/textfieldControlsMutation](demos/textfieldControlsMutation)
- Port of standard TableOfContents demo at [demos/tableOfContents](demos/tableOfContents)
- DOM manipulation performance test at [perftest](perftest)

This work is packaged as a set of addons to the current (Infusion 4.x) [main](https://github.com/fluid-project/infusion)
branch of Infusion.

You may run the browser tests by opening [all-tests.html](all-tests.html) after hosting this project from the filesystem.

The build script [resolveIncludes.js](resolveIncludes.js) should be run whenever any included scripts or CSS are
changed in a project, or a project is moved around in the filesyste - consult its header contents for details.

There is an in-progress port of the Infusion preferences framework in [preferences](preferences).

## Component Demos

Standard demos of components are available at:

### Switch Component Demo

[demos/switch](demos/switch)

### Textfield Controls demo

[demos/textfieldControls](demos/textfieldControls)

## Preferences Framework Demos

[demos/prefsFramework](demos/prefsFramework) - Demonstrates external addition of a "simplify" enactor and panel,
as well as conditional activation of the selfVoicing panel depending on browser TTS support.

[demos/uiOptions](demos/uiOptions) - Demonstrates the "out of the box" UIOptions configuration with the standard
six panels, with minimal configuration.

[examples/framework/preferences/minimalPreview/index.html](examples/framework/preferences/withPreview/index.html).
This fires up a "grouped-style" preferences editor with a preview box. Features the "starter" six panels - issue
with text size enactor which does not act on the preview. 

[examples/framework/preferences/fullPagePanelStyle/index.html](examples/framework/preferences/fullPagePanelStyle/index.html) -
This fires up a "separated panel" style preferences editor with no preview and the same six panels as before,
only with an auto-generated overall template that is produced simply from a "lookahead" at what panels are configured.
This demonstration differs from the previous one only through swapping out a few grade names.

A full demonstration of the "sliding panel with separated panel" configuration, which is the most
widely deployed UIOptions configuration, is at [examples/framework/preferences/slidingPanel/index.html](examples/framework/preferences/slidingPanel/index.html).

A variant of the previous demo showing all 12 implemented panels, rather than just the "starter" set of 6, is at
[examples/framework/preferences/slidingPanelAll/index.html](examples/framework/preferences/slidingPanelAll/index.html).
This also demonstrates in-place localisation - by activating the localisation preference, the prefs framework interface
will localise itself when reopened.

Coming soon - test cases!

