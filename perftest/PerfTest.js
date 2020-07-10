/* eslint-env node */

"use strict";

var perftest = fluid.registerNamespace("perftest");

perftest.generateTree = function (n) {
    var root = {
        tagName: "div",
        children: []
    };
    for (var i = 0; i < n; ++i) {
        var newNode = {
            tagName: "span",
            attrs: {
                "class": "class-" + i,
                attr2: "attr2-" + i
            },
            children: [{
                text: "text-" + i
            }]
        };
        root.children.push(newNode);
    }
    return root;
};

perftest.renderNode = function (parent, node) {
    var domNode;
    if (node.text) {
        domNode = document.createTextNode(node.text);
    } else {
        domNode = document.createElement(node.tagName);
        fluid.each(node.attrs, function (value, key) {
            domNode.setAttribute(key, value);
        });
        fluid.each(node.children, function (child) {
            perftest.renderNode(domNode, child);
        });
    }
    parent.appendChild(domNode);
    return node;
};

perftest.renderFragment = function (nodes) {
    var fragment = new DocumentFragment();
    nodes.forEach(function (node) {
        perftest.renderNode(fragment, node);
    });
    return fragment;
};

perftest.renderWithHtml = function (targetNode, tree, size) {
    targetNode.html("");
    var html = fluid.htmlParser.render([tree]);
    targetNode.html(html);
    var nodes = [];
    for (var i = 0; i < size; ++i) {
        nodes[i] = targetNode[0].querySelector(".class-" + i);
    }
    return nodes;
};

perftest.renderWithFragment = function (targetNode, tree) {
    targetNode.html("");
    var fragment = perftest.renderFragment([tree]);
    targetNode[0].appendChild(fragment);
};

perftest.runTest = function (funcName, targetNode, tree, its, size) {
    var now = Date.now();
    for (var i = 0; i < its; ++i) {
        perftest[funcName](targetNode, tree, size);
    }
    var delay = Date.now() - now;
    var per = (delay / its) * 1000;
    console.log(funcName + ": " + its + " its in " + delay + "ms: " + per + "us/it");
    return per;
};

perftest.computeStats = function (times) {
    var sortedTimes = fluid.makeArray(times);
    sortedTimes.sort();
    return {
        min: sortedTimes[0],
        max: sortedTimes[sortedTimes.length - 1],
        median: sortedTimes[Math.round(times.length - 1) / 2]
    };
};

perftest.renderStats = function (stats) {
    return "Minimum: " + stats.min + " Maximum: " + stats.max + " Median: " + stats.median;
};

perftest.runTests = function () {
    var size = 50;
    var its = 2000;
    var reps = 11;
    var tree = perftest.generateTree(size);
    var targetNode = $(".render-target");

    var doRun = function (funcName) {
        var times = [];
        for (var i = 0; i < reps; ++i) {
            times.push(perftest.runTest(funcName, targetNode, tree, its, size));
        }
        var stats = perftest.computeStats(times);
        var renderedStats = perftest.renderStats(stats);
        return {
            times: times,
            stats: stats,
            renderedStats: renderedStats
        };
    };
    var fragResults = doRun("renderWithFragment");
    var htmlResults = doRun("renderWithHtml");
    var prop = htmlResults.stats.median / fragResults.stats.median;

    var rendered = "Timings in microseconds:" +
        "<br/>Fragment rendering: " + fragResults.renderedStats + "<br/>HTML rendering: " + htmlResults.renderedStats +
        "<br/>Fragment rendering " + (prop * 100 - 100).toFixed(2) + "% faster";
    $(".results").html(rendered);
};

$(document).ready(function () {
    $("#run-tests").click(perftest.runTests);
});
