/*
Copyright 2019-2021 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/
"use strict";

fluid.setLogging(true);

// Full-page "client renderer" which accepts an init block as rendered from the server, which insists that the
// page's markup should correspond to that required, and constructs a matching model skeleton

fluid.defaults("fluid.renderer.client", {
    gradeNames: "fluid.renderer.rootRenderer",
    rootPageGrade: "fluid.clientRootPage"
});

// Note that we will have to create a version of this which only refers to part of a page - rootPage is an essentially empty
// grade and can be used to house the "markupSnapshot" property
fluid.defaults("fluid.clientRootPage", {
    gradeNames: "fluid.rootPage",
    container: "html",
    parentMarkup: true, // We could never render our own exterior document
    members: {
        markupSnapshot: true
    }
});

// Use the table in fluid.resourceLoader.staticMountTable to rewrite "path" resources to "url" resources and load them -
// Presumably this should be eventually made into some more general patten of resource interception
fluid.resourceLoader.loaders.path = function (resourceSpec) {
    var rewritten = fluid.resourceLoader.rewriteUrlWithDiagnostic(fluid.resourceLoader.staticMountTable, resourceSpec.path);
    var specCopy = fluid.censorKeys(resourceSpec, ["path"]);
    specCopy.url = rewritten;
    return fluid.resourceLoader.loaders.XHR(specCopy);
};

fluid.renderer.pathToSkeletonPath = function (segs) {
    var outSegs = [];
    segs.forEach(function (seg) {
        outSegs.push.apply(outSegs, ["options", "components", seg]);
    });
    outSegs.push("model");
    return outSegs;
};

fluid.renderer.modelsToSkeleton = function (models) {
    var togo = {};
    models.forEach(function (modelRec) {
        var skeletonPath = fluid.renderer.pathToSkeletonPath(modelRec.path);
        fluid.set(togo, skeletonPath, modelRec.model);
    });
    return togo;
};

// Client side initBlock "driver" function which accepts the "care package" from the server and uses it to
// reconstruct whatever component tree needs to be built against the already-correct markup. It sets
// "parentMarkup" to true for every component to prevent it from attempting to render again.
// TODO: Note this is obviously faulty since the components may subsequently RE-RENDER.
fluid.renderer.initBlockClientRenderer = function (config) {
    // TODO: In the full Whiteheadian future we will have to invent a new recordType in order to express that this
    // initial model skeleton is not intended to be homeostatic
    var skeletonRecord = {
        recordType: "user",
        options: fluid.renderer.modelsToSkeleton(config.models)
    };
    var lightMergeRecords = fluid.transform(config.lightMerge, function (oneLightMerge) {
        return $.extend({recordType: "user"}, oneLightMerge);
    });
    var renderer = fluid.resolveContext("fluid.renderer");
    var rendererPath = fluid.pathForComponent(renderer)[0];
    var pagePotentia = {
        path: [rendererPath, "rootPage"],
        type: "create",
        records: lightMergeRecords.concat([skeletonRecord])
    };
    var transRec = fluid.registerPotentia(pagePotentia);
    fluid.commitPotentiae(transRec.transactionId);
    transRec.promise.then(function () {
        var rootPage = transRec.outputShadows.find(function (shadow) {
            return fluid.componentHasGrade(shadow.that, "fluid.rootPage");
            rootPage.markupSnapshot = false;
        });
    }, function (err) {
        fluid.log.apply(null, [fluid.logLevel.FAIL, "Error received during client rendering: "].concat([err]));
        throw err;
    });
};

// Singleton instance for every client document - note that in the virtual DOM days we used to create one
// in every instance of initBlockClientRenderer
fluid.renderer.client();
