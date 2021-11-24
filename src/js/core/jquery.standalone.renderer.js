/*
 * Definitions in this file taken from:
 *
 * jQuery JavaScript Library v3.3.1
 * http://jquery.com/
 *
 * Extension of jquery.standalone.js to produce server-side mockup of jQuery sufficient for lightweight
 * manipulation of "virtual DOM"
 *
 * Copyright 2011, John Resig
 * Copyright 2018- Raising the Floor - International
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */

"use strict";
// On the client we just include this file until we abolish the real jQuery
// TODO: On the client the renderer's jQueryStandalone diverges from the server one - i.e. we defer to jQuery's extend, etc.
if (!fluid.jQueryStandalone) {
    var jQuery = fluid.jQueryStandalone = function (/* arguments */) {
        return jQuery.constructor.apply(null, arguments);
    };
}

fluid.jQueryStandalone.wrapNode = function (node) {
    var togo = Object.create(fluid.jQueryStandalone.constructor.prototype);
    var array = fluid.makeArray(node);
    array.forEach(function (node, i) {
        togo[i] = array[i];
    });
    togo.length = array.length;
    Object.defineProperties(togo, fluid.jQueryStandalone.properties);
    return togo;
};

fluid.jQueryStandalone.search = function (selector, context) {
    return context; // TODO QUICK HACK
    //fluid.fail("Search is unimplemented");
};

fluid.jQueryStandalone.constructor = function (arg0, arg1) {
    if (fluid.isDOMNode(arg0) || fluid.isArrayable(arg0)) {
        return fluid.jQueryStandalone.wrapNode(arg0);
    } else if (typeof(arg0) === "string" && fluid.isDOMNode(arg1) || fluid.isArrayable(arg1)) {
        return fluid.jQueryStandalone.search(arg0, arg1);
    } else if (fluid.isJQuery(arg0)) {
        return arg0;
    } else {
        fluid.fail("Unrecognised signature to jQueryStandalone.constructor ", arg0, arg1);
    }
};

fluid.jQueryStandalone.constructor.prototype[Symbol.isConcatSpreadable] = true;

var $ = fluid.jQueryStandalone;

fluid.jQueryStandalone.constructor.prototype.jquery = $.jquery || "1.6.1-fluidStandalone-renderer";
// Used only in old-fashioned fluid.container without a context
// TODO: Doesn't seem to be written anywhere else so is presumably meaningless
$.preferredDoc = {};

$.fn = {};

$.fn.forEach = function (jq, fn) {
    for (var i = 0; i < jq.length; ++i) {
        fn(jq[i], i);
    }
};

$.fn.attr = function (jq, attrName, attrVal) {
    if (attrVal === undefined && !fluid.isPlainObject(attrName)) {
        return jq[0].getAttribute(attrName);
    } else {
        jq.forEach(function (node) {
            if (fluid.isPlainObject(attrName)) {
                fluid.each(attrName, function (value, name) {
                    node.setAttribute(name, value);
                });
            } else {
                node.setAttribute(attrName, attrVal);
            }
        });
    }
};

$.fn.removeAttr = function (jq, attrName) {
    jq.forEach(function (node) {
        node.removeAttribute(attrName);
    });
};

$.fn.prop = $.fn.attr;

fluid.jQueryStandalone.valueMap = {
    input: {
        attr: "value"
    }
};

fluid.jQueryStandalone.decodeValueAccessor = function (node) {
    var tagName = node.tagName.toLowerCase();
    var accessor = fluid.jQueryStandalone.valueMap[tagName];
    if (!accessor) {
        fluid.fail("Cannot access value for tag name " + tagName);
    };
    if (accessor.attr) {
        return function (node, value) {
            $.fn.attr($(node), accessor.attr, value);
        };
    } else {
        fluid.fail("Unknown accessor type ", accessor);
    }
};

$.fn.val = function (jq, value) {
    if (value === undefined) {
        var accessor = fluid.jQueryStandalone.decodeValueAccessor(jq[0]);
        return accessor(value);
    } else {
        jq.forEach(function (node) {
            var accessor = fluid.jQueryStandalone.decodeValueAccessor(node);
            accessor(node, value);
        });
    }
};

$.fn.click = $.fn.on = $.fn.change = $.fn.hover = fluid.identity;

fluid.jQueryStandalone.rnothtmlwhite = (/[^\x20\t\r\n\f]+/g);

// Strip and collapse whitespace according to HTML spec
// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
fluid.jQueryStandalone.stripAndCollapse = function (value) {
    var tokens = value.match(fluid.jQueryStandalone.rnothtmlwhite) || [];
    return tokens.join(" ");
};

fluid.jQueryStandalone.classesToArray = function (value) {
    return value.match(fluid.jQueryStandalone.rnothtmlwhite) || [];
};

$.fn.addClass = function (jq, value) {
    console.log("addClass ", value);
    var classes = fluid.jQueryStandalone.classesToArray(value);
    jq.forEach(function (elem) {
        elem.classList.add(...classes);
    });
};

// TODO: needed - text, toggleClass

fluid.jQueryStandalone.properties = fluid.transform($.fn, function (func, propertyName) {
    return {
        get: function () {
            return function () {
                var argList = [this].concat(fluid.makeArray(arguments));
                return $.fn[propertyName].apply(this, argList);
            };
        }
    };
});
