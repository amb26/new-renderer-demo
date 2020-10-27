/*
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2010-2016 OCAD University
Copyright 2012-2014 Raising the Floor - US
Copyright 2014-2016 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/** This file contains functions which depend on the presence of a DOM document
 *  and which depend on the contents of Fluid.js **/
// Forked version suitable for use on the server

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";


    // FLUID-6148: Patched for server
    // TODO: fudged - it should really be able to expect to know whether it expects a real DOM container or a template
    // one, but this requires propagating pretty fine-grained expectations through fluid.container and probably
    // unifying it with the DOM binder, etc.
    fluid.isDOMNode = function (obj) {
        return fluid.isTemplateDOMNode(obj) || fluid.isBrowserDOMNode(obj);
    };

    fluid.isTemplateDOMNode = function (obj) {
        return fluid.isPlainObject(obj) && obj.tagName;
    };

    fluid.isBrowserDOMNode = function (obj) {
        return obj && typeof (obj.nodeType) === "number";
    };

    /**
     * Fetches a single container element and returns it as a jQuery.
     *
     * @param {String|jQuery|element} containerSpec - an id string, a single-element jQuery, or a DOM element specifying a unique container
     * @param {Boolean} fallible - <code>true</code> if an empty container is to be reported as a valid condition
     * @param {jQuery} [userJQuery] - the jQuery object to use for the wrapping, optional - use the current jQuery if absent
     * @return {jQuery} - A single-element jQuery container.
     */
    fluid.container = function (containerSpec, fallible, userJQuery) {
        if (!containerSpec) {
            fluid.fail("fluid.container argument is empty");
        }
        var selector = containerSpec.selector || containerSpec;
        if (userJQuery) { // Probably in case we want to swap some existing jQuery for another one - e.g. cross iFrames - check logic
            containerSpec = fluid.unwrap(containerSpec);
        }
        // FLUID-5047: Patched here to support "/" container
        var container = fluid.wrap(containerSpec === "/" ? "html" : containerSpec, userJQuery);
        if (fallible && (!container || container.length === 0)) {
            return null;
        }
        // FLUID-5047: Removed check for container.jquery
        // TODO: This should really apply fluid.isJQuery but in the long term we don't want such pollution
        if (!container || container.length !== 1) {
            if (typeof (containerSpec) !== "string") {
                containerSpec = container.selector;
            }
            var count = container.length !== undefined ? container.length : 0;
            var extraMessage = container.selectorName ? " with selector name " + container.selectorName +
                " in context " + fluid.dumpEl(containerSpec.context) : "";
            fluid.fail((count > 1 ? "More than one (" + count + ") container elements were"
                    : "No container element was") + " found for selector " + containerSpec + extraMessage );
        }
        if (!fluid.isDOMNode(container[0])) {
            fluid.fail("fluid.container was supplied a non-jQueryable element");
        }

        // To address FLUID-5966, manually adding back the selector and context properties that were removed from jQuery v3.0.
        // ( see: https://jquery.com/upgrade-guide/3.0/#breaking-change-deprecated-context-and-selector-properties-removed )
        // In most cases the "selector" property will already be restored through the DOM binder;
        // however, when a selector or pure jQuery element is supplied directly as a component's container, we need to add them
        // if it is possible to infer them. This feature is rarely used but is crucial for the prefs framework infrastructure
        // in Panels.js fluid.prefs.subPanel.resetDomBinder
        container.selector = selector;
        // FLUID-5047: Patched to fetch document from server's jQuery and its "preferredDoc"
        // TODO: doesn't seem to be written anywhere
        container.context = container.context || containerSpec.ownerDocument || (userJQuery || $).preferredDoc || document;

        return container;
    };

    // TODO: identical to core framework version
    fluid.containerForViewComponent = function (that, containerSpec) {
        var container = fluid.container(containerSpec);
        fluid.expectFilledSelector(container, "Error instantiating viewComponent at path \"" + fluid.pathForComponent(that));
        return container;
    };

    fluid.allocateSimpleIdBrowser = fluid.allocateSimpleId;

    fluid.allocateSimpleId = function (element) {
        return fluid.isTemplateDOMNode(element) ?
           fluid.allocateSimpleIdTemplate(element) : fluid.allocateSimpleIdBrowser(element);
    };

    /*
     * Allocate an id to the supplied element if it has none already, by a simple
     * scheme resulting in ids "fluid-id-nnnn" where nnnn is an increasing integer.
     */
    fluid.allocateSimpleIdTemplate = function (element) {
        element = fluid.unwrap(element);
        if (!element || fluid.isPrimitive(element)) {
            return null;
        }

        if (!element.attrs.id) {
            var simpleId = "fluid-id-" + fluid.allocateGuid();
            element.attrs.id = simpleId;
        }
        return element.attrs.id;
    };

})(jQuery, fluid_3_0_0);
