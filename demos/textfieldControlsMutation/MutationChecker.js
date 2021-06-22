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

fluid.demos.checkMutations = function (container) {
    var targetNode = document.querySelector(container);

    // Options for the observer (which mutations to observe)
    var config = { attributes: true, childList: true, subtree: true, attributeOldValue: true };

    var noteMutation = function (message) {
        var newNode = document.createElement("div");
        newNode.textContent = message;
        var report = document.querySelector(".modification-report");
        report.appendChild(newNode);
        report.classList.add("failure");
    };

    // Callback function to execute when mutations are observed
    var callback = function (mutationsList) {
        mutationsList.forEach(function (mutation) {
            if (mutation.type === "childList") {
                noteMutation("A child node has been added or removed.");
            }
            else if (mutation.type === "attributes") {
                // Note that we will always receive notifications even if the DOM is not modified
                // https://github.com/whatwg/dom/issues/520
                var newValue = mutation.target.getAttribute(mutation.attributeName);
                if (newValue !== mutation.oldValue) {
                    noteMutation("The " + mutation.attributeName + " attribute of node " +  mutation.target.outerHTML +
                    " was changed from " + mutation.oldValue + " to " + newValue);
                }
            }
        });
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
    fluid.demos.checkMutationObserver = observer;
    // TODO: Add transaction events to globalInstantiator
    setTimeout(function () {
        var report = document.querySelector(".modification-report");
        if (!report.classList.contains("failure")) {
            report.classList.add("success");
        }
    }, 1000);
};

fluid.demos.disconnectMutationObserver = function () {
    // Later, you can stop observing
    fluid.demos.checkMutationObserver.disconnect();
};
