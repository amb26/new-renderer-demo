/*
Copyright 2019-2021 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

(function ($, fluid) {
    "use strict";

    fluid.setLogging(true);

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

    fluid.renderer.clientRendererPath = "clientRenderer";

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
        var pagePotentia = {
            path: [fluid.renderer.clientRendererPath, "rootPage"],
            type: "create",
            records: lightMergeRecords.concat([skeletonRecord])
        };
        var transRec = fluid.registerPotentia(pagePotentia);
        fluid.commitPotentiae(transRec.transactionId);
        transRec.promise.then(null, function (err) {
            fluid.log.apply(null, [fluid.logLevel.FAIL, "Error received during client rendering: "].concat([err]));
            throw err;
        });
    };

})(jQuery, fluid_3_0_0);
