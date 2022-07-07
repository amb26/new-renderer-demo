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

## Preferences Framework Demos

Right now the most functional driver demonstrating a prefs editor is at
[examples/framework/preferences/minimalPreview/index.html](examples/framework/preferences/withPreview/index.html).
This fires up a "grouped-style" preferences editor with a preview box. The starter six panels are now functional,
with an issue with the text size enactor which currently spills out of its preview container.

The 2nd most functional driver is
[examples/framework/preferences/fullPagePanelStyle/index.html](examples/framework/preferences/fullPagePanelStyle/index.html) -
This fires up a "separated panel" style preferences editor with no preview and the same six panels as before,
only with an auto-generated overall template that is produced simply from a "lookahead" at what panels are configured.
This demonstration differs from the previous one only through swapping out a few grade names.

A full demonstration of the "sliding panel with separated panel" configuration, which is the most
widely deployed UIOptions configuration, is at [examples/framework/preferences/slidingPanel/index.html](examples/framework/preferences/slidingPanel/index.html).
Whilst this is technically functional, there is a lot of "spillover" of preference application into the editor UI itself,
since I have made this integration looking ahead to the "iframeless model" where we will be able to use CSS custom
variables for scoping. The enactor strategies for these will need updates in order to allow the prefs editior and
preview UIs to be insulated from changes in the parent document.

A variant of the previous demo showing all currently implemented panels, rather than just the "starter" set of 6, is at
[examples/framework/preferences/slidingPanelAll/index.html](examples/framework/preferences/slidingPanelAll/index.html).

The following panels are roughly ported but untested/nonfunctional - captions, localization,
self voicing, syllabification.

Coming soon - test cases!
