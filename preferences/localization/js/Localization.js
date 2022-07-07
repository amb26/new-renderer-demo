/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

fluid.defaults("fluid.prefs.schemas.localization", {
    gradeNames: ["fluid.prefs.schema"],
    schema: {
        "fluid.prefs.localization": {
            "type": "string",
            "default": "",
            "enum": ["", "en", "en_CA", "en_US", "fr", "es", "fa", "pt_BR"],
            "enumLabels": [
                "localization-default",
                "localization-en",
                "localization-fr",
                "localization-es",
                "localization-fa",
                "localization-pt_BR"
            ]
        }
    }
});
