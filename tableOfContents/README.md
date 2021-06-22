### Table of Contents implementation and test cases

This is a replication of the existing Table of Contents test cases which can be run at 
https://build.fluidproject.org/infusion/tests/component-tests/tableOfContents/html/TableOfContents-test.html , lightly rewritten and eliminating those which performed
white-box testing of the "old renderer". As with the "Table of Contents Demo", this configuration uses symbolic includes
and auto-mounts renderer components using `fluid.renderer.autoMountRendererModulesServer`. Note that this also 
patches into the ResourceLoader system to inform the ToC component where its templates are located so there is not
the standard faff of figuring out the path to them.

To run the test cases, from the project root run 

    node tableOfContents/test/driver.js
    
And then browse to 

    http://localhost:8085/test/html/TableOfContents-test.html

A standard jqUnit test run interface should appear and the test should pass.
