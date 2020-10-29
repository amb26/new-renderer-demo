#### FLUID-5047 new renderer demo

This demonstrates in-progress work implementing the new Infusion renderer which is lightly described at [FLUID-5047](https://issues.fluidproject.org/browse/FLUID-5047).
This project houses several demonstrations and implementations - 

 - Reimplementations of the existing TextfieldSlider, TextfieldStepper and TableOfContents components with identical functionality and near-identical interfaces to those in Infusion trunk
 - Isomorphic rendering demo of the TextfieldSlider at [demo](demo)
 - Test driver for TableOfContents tests in [tableOfContents/test](tableOfContents/test) - see [tableOfContents/README.md](tableOfContents/README.md) for instructions for running
 - Port of standard TableOfContents demo at [tableOfContentsDemo](tableOfContentsDemo)
 - DOM manipulation performance test at [perftest](perftest)

This work is still pretty unstably packaged and relies on patching various framework internals as currently exposed
in the in-progress FLUID-6145 Infusion branch.
