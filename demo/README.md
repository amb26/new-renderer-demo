#### "Isomorphic rendering demo", or as we call it, "Queen of Sheba rendering".

To run the demo, from the project root run 

    node demo/demoApp.js
    
And then browse to 

    http://localhost:8085/demoApp
    
You should see two controls:

1. A rendered textfieldSlider with range 0 to 10 with its value set to 7 
2. A textfieldStepper with range 1 to 2 with its value set to 2

These values correspond to the model values recorded on the server, but what is transmitted to the client is 
i) the markup rendered by the server, ii) the model skeleton from the server, iii) the core component tree potentia
(in this case, just the grade name of the root page used for rendering). The initial markup state is correct 
(e.g. the + control on the stepper is disabled) and the UI then usable from that point to continue making modifications. 

The client-side makes a check to ensure that no modifications are made to the markup at startup - any such modifications
will be logged to the console as they happen.

This app is written in a literal style with explicit Kettle handlers for each endpoint. This will eventually be automated
through extending the package.json definitions which are currently used to drive auto-mounting of renderer modules.

There is also a quick "autoTest" mode accessible via 

    node demo/demoApp.js autoTest
    
which will fire up both a server and a plain HTTP client which dumps the markup received from the server to the console.
