#### DOM bulk manipulation performance test app

A simple "automounted" app which exposes a very plain UI initiating tests of different strategies for performing bulk
DOM manipulation - 

1. Node-by-node construction of an out-of-document DocumentFragment inserted into the document using node.appendChild
2. Construction of a single text string holding the markup, inserted into the document using node.innerHTML

To run the app, from the project root run 

    node perftest/perfTestApp.js
    
And then browse to 

    http://localhost:8085/PerfTest.html

A "Run Tests" button will be rendered. Pressing this will initiate the test run which will log progress to the console
of individual fixtures. After about 20 seconds a markup summary like the following will appear:

    Timings in microseconds:
    Fragment rendering: Minimum: 247 Maximum: 430.5 Median: 312
    HTML rendering: Minimum: 380 Maximum: 436 Median: 406
    Fragment rendering 30.13% faster
    
This verifies that contrary to the received wisdom on numerous blogs, on modern browsers the fragment rendering approach
is superior. Due to various other inefficiencies, the performance advantage will be greater than the figure reported
by the raw test timings.

Also note analysis on https://stackoverflow.com/questions/43401497/why-is-documentfragment-no-faster-than-repeated-dom-access
and also https://github.com/facebook/react/issues/11171