"use strict";

let callback = null;
let lineChart = null;

exports.init = function (cb) {
    callback = cb;

    document.getElementById("editor-config").addEventListener("click", apply);
    document.getElementById("editor-ok").addEventListener("click", ok);
}

exports.show = function (chart) {
    lineChart = chart;

    lineChart.ctx = document.getElementById("editor-chart").getContext("2d");

    lineChart.draw();

    let configs = document.querySelectorAll(".axis-config");

    for (let input of configs)
        input.value = "";

    configs[0].value = lineChart.xAxis.tick(0);
    configs[1].value = lineChart.xAxis.tick(lineChart.xAxis.ticks - 1);
    configs[2].value = lineChart.xAxis.interval;

    configs[3].value = lineChart.yAxis[0].tick(0);
    configs[4].value = lineChart.yAxis[0].tick(lineChart.yAxis[0].ticks - 1);
    configs[5].value = lineChart.yAxis[0].interval;

    document.getElementById("editor").style.visibility = "visible";
}

function apply() {
    let configs = document.querySelectorAll(".axis-config");
    {
        let min = parseFloat(configs[0].value);
        let max = parseFloat(configs[1].value);
        let interval = parseFloat(configs[2].value);

        lineChart.xAxis.update({
            min: min,
            max: max,
            interval: interval
        });
    }

    {
        let min = parseFloat(configs[3].value);
        let max = parseFloat(configs[4].value);
        let interval = parseFloat(configs[5].value);

        lineChart.yAxis[0].update({
            min: min,
            max: max,
            interval: interval
        });
    }

    lineChart.draw();
}

function ok() {
    document.getElementById("editor").style.visibility = "hidden";

    if (callback) {
        callback(lineChart);
    }
}