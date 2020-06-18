
"use strict";

function runTests() {
    $(".render-target").html("Rendered");
}

$(document).ready(function () {
    $("#run-tests").click(runTests);
});
