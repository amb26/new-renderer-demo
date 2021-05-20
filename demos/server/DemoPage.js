fluid.defaults("fluid.demos.demoPage", {
    gradeNames: "fluid.rootPage",
    resources: {
        template: {
            path: "%fluid-renderer-demo/DemoPage.html"
        }
    },
    selectors: {
        textfieldSlider: ".flc-textfieldSlider",
        textfieldStepper: ".flc-textfieldStepper"
    },
    components: {
        textfieldSlider: {
            type: "fluid.textfieldSlider",
            container: "{demoPage}.dom.textfieldSlider",
            options: {
                attrs: {
                    "aria-label": "{that}.options.strings.label"
                },
                strings: {
                    "label": "Textfield Slider"
                },
                model: {
                    value: 7,
                    step: 1,
                    range: {
                        min: 0,
                        max: 10
                    }
                },
                scale: 0
            }
        },
        textfieldStepper: {
            type: "fluid.textfieldStepper",
            container: "{demoPage}.dom.textfieldStepper",
            options: {
                attrs: {
                    "aria-label": "{that}.options.strings.label"
                },
                strings: {
                    "label": "Textfield Stepper"
                },
                model: {
                    value: 2,
                    step: 0.1,
                    range: {
                        min: 1,
                        max: 2
                    }
                },
                scale: 1
            }
        }
    }
});
