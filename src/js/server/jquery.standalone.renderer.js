var fluid_3_0_0 = fluid_3_0_0 || {};
var fluid = fluid || fluid_3_0_0;

fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";
    // We are here - how to return the "node" in a manner that retains DOM-like affordances, e.g.
    // the ability to index descendents, find parents, etc - 
    fluid.jQueryStandalone.constructor = function (node) {
        return fluid.makeArray(node);
        // TODO: We need to support at minimum, functioning attr, prop, addClass, removeClass, val
        // and dummy "on", "click"
    };
})(jQuery, fluid_3_0_0);
