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

This work is packaged as a set of addons to the current (Infusion 4.x) [main](https://github.com/fluid-project/infusion) branch of Infusion.

You may run the browser tests by opening [all-tests.html](all-tests.html) after hosting this project from the filesystem.

The build script [resolveIncludes.js](resolveIncludes.js) should be run whenever any included scripts or CSS are
changed in a project, or a project is moved around in the filesyste - consult its header contents for details.

There is an in-progress port of the Infusion preferences framework in [preferences](preferences).

Right now the most functional driver demonstrating a prefs editor is at 
[examples/framework/preferences/minimalPreview/index.html](examples/framework/preferences/minimalPreview/index.html).
This fires up a "grouped-style" preference editor with a preview box. Currently three preference panels are functional.
