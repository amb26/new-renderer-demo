### Textfield Controls Client-Side Demo

This is a simple replication of the existing Textfield Controls demo hosted at 
https://build-infusion.fluidproject.org/demos/textfieldcontrol/ for the rewrite of the textfield controls components using the new
renderer. Since this is a serverless demo, includes are written out in the old literal style, but this is not
anticipated to be a common use pattern. Due to the lack of a server side, the `fluid.resourceLoader.staticMountTable`
needs to be written out inline in the code so that the component can locate its templates. It's imagined that in 
other serverless contexts, some kind of rollup or webpack plugin will take responsibility for these.

To see the demo, browse to [index.html](index.html) using some form of static hosting.

You should see a UI identical to the one in the build project's demo, minus the styling and framing of the 
"Overview Panel".
