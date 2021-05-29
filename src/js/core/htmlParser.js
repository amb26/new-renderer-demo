/*
Copyright 2021 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.htmlParser");

    /** Parse the supplied markup into a DOM element. If the markup has a single root node, this is signalled by
     * setting `hasRoot` to `true`, and that node will be returned. Otherwise, setting `hasRoot` to false will
     * instead return a DocumentFragment that has the parsed markup as children.
     * @param {String} template - The markup to be parsed
     * @param {Boolean} hasRoot - If `true`, the returned node will be the (assumed) single root node of the supplied markup,
     * otherwise the return will be a DocumentFragment hosting the entire markup's nodes
     * @return {Element} The parsed markup as a tree of nodes
     */
    fluid.htmlParser.parseMarkup = function (template, hasRoot) {
        var fragment;
        if (fluid.serverDocumentParser) {
            fragment = fluid.serverDocumentParser(template);
        } else {
            fragment = document.createRange().createContextualFragment(template);
        }
        return hasRoot ? fragment.firstElementChild : fragment;
    };

    fluid.htmlParser.parseNode = function (node) {
        return node.cloneNode(true);
    };

    /** Parse into a DOM fragment either a markup template as a string or a template expressed as an already
     * existing DOM node.
     * @param {String|Element} template - The template to be parsed
     * @param {Object} options - Options including
     *    {Boolean} hasRoot
     *    {Object} selectors
     * @return {Object} options - A parsed structure including members
     *    {Node} node
     *    {Object} matchedSelectors
     */
    // options:
    //    selectors: String [selectorName] -> String[selector]
    //    hasRoot: Boolean
    fluid.htmlParser.parse = function (template, options) {
        var defaults = {
            selectors: {},
            hasRoot: true
        };
        var that = {
            template: template,
            options: fluid.extend({}, defaults, options)
        };
        // see https://stackoverflow.com/a/25214113 - use another method on the server
        that.element = fluid.isDOMNode(template) ? fluid.htmlParser.parseNode(template) :
            fluid.htmlParser.parseMarkup(template, that.options.hasRoot);
        that.matchedSelectors = fluid.transform(that.options.selectors, function (selector) {
            return selector === "/" ? that.element : that.element.querySelectorAll(selector);
        });

        return that;
    };

    fluid.htmlParser.render = function (element) {
        return element.outerHTML;
    };

})(jQuery, fluid_3_0_0);
