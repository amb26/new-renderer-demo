/*
Copyright 2020 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

"use strict";

fluid.resourceLoader.dumpMounts = function (mountTable) {
    return fluid.transform(mountTable, function (mount) {
        return "%" + mount.moduleName + "/" + mount.suffix;
    }).join(", ");
};

// These two functions taken from KettleStaticMountIndexer.js - presumably need to go into core framework ResourceLoader-browser.js?

fluid.resourceLoader.splitModulePath = function (modulePath) {
    if (modulePath.charAt(0) !== "%") {
        return null;
    }
    var slashPos = modulePath.indexOf("/");
    if (slashPos === -1) {
        slashPos = modulePath.length;
    }
    return {
        moduleName: modulePath.substring(1, slashPos),
        suffix: modulePath.substring(slashPos + 1, modulePath.length)
    };
};

/** Rewrites a module-relative URL of the form %module-name/some/suffix so that it takes the form of an actual
 * URL hosted by some static middleware hosting that module's content in a server's URL space.
 * @param {MountTableEntry[]} mountTable - Array of MountTableEntry records originally from the `kettle.staticMountIndexer` component
 * @param {String} url - A URL to be rewritten, perhaps beginning with a %-qualified module prefix
 * @return {String|Null} If the supplied URL was module-qualified, and it could be resolved, the resolved value is
 * returned, or else null if it could not. If the supplied URL was not module-qualified, it is returned unchanged.
 */
fluid.resourceLoader.rewriteUrl = function (mountTable, url) {
    var parsed = fluid.resourceLoader.splitModulePath(url);
    if (parsed) {
        for (var i = 0; i < mountTable.length; ++i) {
            var mount = mountTable[i];
            if (mount.moduleName === parsed.moduleName && parsed.suffix.startsWith(mount.suffix)) {
                var endSuffix = parsed.suffix.substring(mount.suffix.length);
                return mount.prefix + (endSuffix.startsWith("/") ? "" : "/") + endSuffix;
            }
        }
        return null;
    }
    return url;
};

fluid.resourceLoader.rewriteUrlWithDiagnostic = function (mountTable, url) {
    var rewritten = fluid.resourceLoader.rewriteUrl(mountTable, url);
    if (rewritten === null) {
        fluid.fail("Request for module-relative path " + url +
            " which can't be resolved into a static mount - available module mounts are " +
            fluid.resourceLoader.dumpMounts(mountTable));
    }
    return rewritten;
};
