# FLUID-5047 new renderer demo

This demonstrates in-progress work implementing the new Infusion renderer which is lightly described at
[FLUID-5047](https://issues.fluidproject.org/browse/FLUID-5047).
This project houses several demonstrations and implementations -

- Reimplementations of the existing Switch, TextfieldSlider, TextfieldStepper and TableOfContents components with identical
functionality and near-identical interfaces to those in Infusion trunk
- Isomorphic rendering demo of the TextfieldSlider at [demo](demo)
- Test driver for TableOfContents tests in [tableOfContents/test](tableOfContents/test) -
see [tableOfContents/README.md](tableOfContents/README.md) for instructions for running
- Port of standard TableOfContents demo at [tableOfContentsDemo](tableOfContentsDemo)
- DOM manipulation performance test at [perftest](perftest)

This work is packaged as a set of addons to the current (Infusion 4.x) main branch of Infusion.

You may run the browser tests by opening [all-tests.html](all-tests.html) after hosting this project from the filesystem.

The build script [resolveIncludes.js](resolveIncludes.js) should be run whenever any included scripts or CSS are
changed in a project, or a project is moved around in the filesyste - consult its header contents for details.

There is an in-progress port of the Infusion preferences framework in [preferences](preferences)
