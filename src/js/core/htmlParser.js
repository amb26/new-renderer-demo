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
    // Note that on the server we will use https://www.npmjs.com/package/linkedom
    fluid.registerNamespace("fluid.htmlParser");

    fluid.htmlParser.parseMarkup = function (template, hasRoot) {
        var fragment = document.createRange().createContextualFragment(template);
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
        that.node = fluid.isDOMNode(template) ? fluid.htmlParser.parseNode(template) :
            fluid.htmlParser.parseMarkup(template, that.options.hasRoot);
        that.matchedSelectors = fluid.transform(that.options.selectors, function (selector) {
            return selector === "/" ? that.node : that.node.querySelectorAll(selector);
        });

        return that;
    };

})(jQuery, fluid_3_0_0);
