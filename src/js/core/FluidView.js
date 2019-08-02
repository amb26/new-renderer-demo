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

    fluid.defaults("fluid.viewComponent", {
        gradeNames: ["fluid.modelComponent"],
        argumentMap: {
            container: 0,
            options: 1
        },
        members: {
            container: "@expand:fluid.containerForViewComponent({that}, {that}.options.container)",
            dom: "@expand:fluid.initDomBinder({that}, {that}.options.selectors, {that}.container)"
        },
        mergePolicy: {
            "members.container": "replace"
        }
    });

    // unsupported, NON-API function
    fluid.dumpSelector = function (selectable) {
        return typeof (selectable) === "string" ? selectable :
            selectable.selector ? selectable.selector : "";
    };

    fluid.checkTryCatchParameter = function () {
        var location = window.location || { search: "", protocol: "file:" };
        var GETparams = location.search.slice(1).split("&");
        return fluid.find(GETparams, function (param) {
            if (param.indexOf("notrycatch") === 0) {
                return true;
            }
        }) === true;
    };

    fluid.notrycatch = fluid.checkTryCatchParameter();


    /**
     * Wraps an object in a jQuery if it isn't already one. This function is useful since
     * it ensures to wrap a null or otherwise falsy argument to itself, rather than the
     * often unhelpful jQuery default of returning the overall document node.
     *
     * @param {Object} obj - the object to wrap in a jQuery
     * @param {jQuery} [userJQuery] - the jQuery object to use for the wrapping, optional - use the current jQuery if absent
     * @return {jQuery} - The wrapped object.
     */
    fluid.wrap = function (obj, userJQuery) {
        userJQuery = userJQuery || $;
        return ((!obj || obj.jquery) ? obj : userJQuery(obj));
    };

    /**
     * If obj is a jQuery, this function will return the first DOM element within it. Otherwise, the object will be returned unchanged.
     *
     * @param {jQuery} obj - The jQuery instance to unwrap into a pure DOM element.
     * @return {Object} - The unwrapped object.
     */
    fluid.unwrap = function (obj) {
        return obj && obj.jquery ? obj[0] : obj;
    };

    // FLUID-6148: Patched for server
    // TODO: fudged - it should really be able to expect to know whether it expects a real DOM container or a template
    // one, but this requires propagating pretty fine-grained expectations through fluid.container and probably
    // unifying it with the DOM binder, etc.
    fluid.isDOMNode = function (obj) {
        return fluid.isTemplateDOMNode(obj) || fluid.isBrowserDOMNode(obj);
    };

    fluid.isTemplateDOMNode = function (obj) {
        return obj && obj.tagName;
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
        if (userJQuery) {
            containerSpec = fluid.unwrap(containerSpec);
        }
        var container = fluid.wrap(containerSpec === "/" ? "html" : containerSpec, userJQuery);
        if (fallible && (!container || container.length === 0)) {
            return null;
        }
        // FLUID-6148: TODO: This should really apply fluid.isJQuery but in the long term we don't want such pollution
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
        // FLUID-6148: Patched to fetch document from server's jQuery
        container.context = container.context || containerSpec.ownerDocument || (userJQuery || $).preferredDoc || document;

        return container;
    };

    /* Expect that jQuery selector query has resulted in a non-empty set of
     * results. If none are found, this function will fail with a diagnostic message,
     * with the supplied message prepended.
     */
    fluid.expectFilledSelector = function (result, message) {
        if (result && result.length === 0 && result.jquery) {
            fluid.fail(message + ": selector \"" + result.selector + "\" with name " + result.selectorName +
                       " returned no results in context " + fluid.dumpEl(result.context));
        }
    };

    fluid.containerForViewComponent = function (that, containerSpec) {
        var container = fluid.container(containerSpec);
        fluid.expectFilledSelector(container, "Error instantiating viewComponent at path \"" + fluid.pathForComponent(that));
        return container;
    };

    /**
     * Creates a new DOM Binder instance for the specified component and mixes it in.
     *
     * @param {Object} that - The component instance to attach the new DOM Binder to.
     * @param {Object} selectors - a collection of named jQuery selectors
     * @return {DOM binder} - The DOM binder for the component.
     */
    // Note that whilst this is not a properly public function, it has been bound to in a few stray places such as Undo.js and
    // Panels.js - until we can finally reform these sites we need to keep this signature stable as well as the bizarre side-effects
    fluid.initDomBinder = function (that, selectors/*, container */) {
        console.log("initDomBinder faultily called for " + fluid.pathForComponent(that).join("."));
        that.dom = fluid.createDomBinder(that.container, selectors || that.options.selectors || {});
        that.locate = that.dom.locate;
        return that.dom;
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
