### Table of Contents simple client-side rendering demo

This is a simple replication of the existing Table of Contents demo hosted at 
https://build.fluidproject.org/infusion/demos/tableOfContents/ for the rewrite of the ToC component using the new
renderer. The only elaboration is that the demo's includes are written out in symbolic form, e.g.

        <script type="text/javascript" src="../../node_modules/infusion/src/lib/jquery/core/js/jquery.js"></script>

rather than being expressed using literal filesystem paths. This is achieved using the `fluid.renderer.autoMountRendererModulesServer`
grade which automatically mounts all loaded renderer modules into the URL space of a Kettle server.

To run the demo, from the project root run 

    node dmos/tableOfContents/DemoApp.js
    
And then browse to 

    http://localhost:8085/DemoPage.html

You should see a UI identical to the one in the build project's demo, minus the styling and framing of the 
"Overview Panel".
