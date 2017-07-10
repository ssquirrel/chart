"use strict";

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("chooser").addEventListener("change", controller.handler);
});

var controller = (function () {
    let a=1;

    function handler() {
        alert(this  +" "+a);
    }

    return {
        handler: handler
    }
})();

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function LineChart(ctx) {
    const CANVAS_WIDTH = ctx.canvas.width;
    const CANVAS_HEIGHT = ctx.canvas.height;

    const left = CANVAS_WIDTH * 0.05;
    const bottom = CANVAS_HEIGHT * 0.8;

    const top = CANVAS_HEIGHT * 0.2;
    const right = CANVAS_WIDTH * 0.95;

    const width = right - left;
    const height = bottom - top;

    function draw(x, y) {
        let xAxis = Axis(width, {
            min: Math.min.apply(null, x),
            max: Math.max.apply(null, x)
        });

        let yAxis = Axis(height, {
            min: Math.min.apply(null, y),
            max: Math.max.apply(null, y)
        });

        ctx.beginPath();
        ctx.moveTo(xAxis.distance(x[0]), yAxis.distance(y[0]));

        for (let i = 1; i < y.length; i++) {
            ctx.lineTo(xAxis.distance(x[i]), yAxis.distance(y[i]));
        }

        ctx.stroke();
    }

    return {
        draw: draw
    };
}

function Axis(length, data) {
    const MIN_INTERVAL = 5;
    const MAX_TICK_LENGTH = 30;

    const interval = Math.max(MIN_INTERVAL,
        Math.floor(length / MAX_TICK_LENGTH));

    let diff = data.max - data.min;
    let scale = findScale(diff / count);
    let min = Math.floor(min / scale) * scale;
    let max = min + count * scale;

    function distance(val) {
        return length / (min - max) * (val - max);
    }

    return {
        length: length,
        interval: interval,
        min: min,
        max: max,
        distance: distance
    };
}

function findScale(val) {
    const scales = [0.01, 0.5, 0.25, 0.1, 1, 5, 10, 25, 50, 100];

    for (let scale of scales)
        if (val <= scale)
            return scale;

    throw "no proper scale found!";
}