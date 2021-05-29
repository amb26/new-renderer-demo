/**
 * Mutation Checker
 *
 * Copyright 2019 Raising The Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * You may obtain a copy of the License at
 * https://github.com/fluid-project/kettle/blob/master/LICENSE.txt
 */

/* eslint-env node */

"use strict";

fluid.demos.checkMutations = function () {
    var targetNode = document.getElementsByTagName("body")[0];

    // Options for the observer (which mutations to observe)
    var config = { attributes: true, childList: true, subtree: true, attributeOldValue: true };

    // Callback function to execute when mutations are observed
    var callback = function (mutationsList) {
        mutationsList.forEach(function (mutation) {
            if (mutation.type === "childList") {
                console.log("A child node has been added or removed.");
            }
            else if (mutation.type === "attributes") {
                console.log("The " + mutation.attributeName + " attribute of node ", mutation.target, 
                " was changed from " + mutation.oldValue + " to " + mutation.target.getAttribute(mutation.attributeName));
            }
        });
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
    fluid.demos.checkMutationObserver = observer;
};

fluid.demos.disconnectMutationObserver = function () {
    // Later, you can stop observing
    fluid.demos.checkMutationObserver.disconnect();
};
