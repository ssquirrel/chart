"use strict";

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("chooser").addEventListener("change", controller.load);
    document.getElementById("setX").addEventListener("click", controller.set);
    document.getElementById("setY1").addEventListener("click", controller.set);
    document.getElementById("setY2").addEventListener("click", controller.set);
});

var source = (function () {
    const COLORS = ["red", "green", "blue", "orange"];

    let index = 0;
    let color = new Map();
    let data = new Map();


    function load(files) {
        return new Promise((resolve, reject) => {
            if (files.length == 0)
                return;

            if (data.size == COLORS.length) {
                alert("enough!")
                return;
            }

            var file = files[0];

            if (data.has(file.name)) {
                alert("This file is already loaded!");
                return;
            }

            var reader = new FileReader();
            reader.addEventListener("load", function () {
                parseCSV(file.name, this.result);
                resolve();
            });

            reader.readAsText(file);
        });
    }

    function parseCSV(filename, result) {
        const IGNORE_FIRST_N = 3;

        let csv = new Map();

        data.set(filename, csv);
        color.set(csv, COLORS[(index++) % COLORS.length]);

        let lines = result.split("\r\n");

        let names = lines[0].split(",");
        let units = lines[1].split(",");

        let cols = (new Array(names.length)).fill([]);

        for (let i = IGNORE_FIRST_N; i < lines.length; i++) {
            var line = lines[i].split(",");

            for (let k = 0; k < line.length; k++) {
                if (cols[k].length != i - IGNORE_FIRST_N)
                    continue;

                if (isNaN(line[k]) || line[k] === "")
                    continue;

                let val = parseFloat(line[k]);

                cols[k].push(val);
            }

        }

        for (let i = 0; i < names.length; ++i) {
            if (cols[i].length == 0)
                continue;

            let col = {
                unit: units[i],
                data: cols[i]
            };

            csv.set(names[i], col);
        }
    }

    return {
        data: data,
        color: color,
        load: load
    }
})();

var controller = (function () {
    function load() {
        source.load(this.files).then(() => {
            let names = new Set();

            for (let csv of source.data.values())
                for (let name of csv.keys())
                    names.add(name);

            populate(document.getElementById("source"), names.keys())
        });

    }

    function populate(select, names) {
        select.innerHTML = "";

        for (let name of names) {
            var option = document.createElement("option");
            option.innerText = name;

            select.appendChild(option);
        }
    }


    let indie = null;
    let dependent1 = null;

    function set() {
        let select = document.getElementById("source");

        if (select.selectedIndex == -1)
            return;

        let dest = null;

        switch (this.id) {
            case "setX":
                dest = document.getElementById("independent");
                break;
            case "setY1":
                dest = document.getElementById("dependent1");
                break;
            case "setY2":
                dest = document.getElementById("dependent2");
                break;
        }

        dest.innerHTML = "";

        let name = select.options[select.selectedIndex].innerText;

        for (let entry of source.data.entries()) {
            if (!(entry[1]).has(name))
                return;

            let option = document.createElement("option");
            option.style.color = source.color.get(entry[1]);
            option.innerText = name;

            dest.appendChild(option);
        }

        chart();
    }

    function chart() {
        let independent = document.getElementById("independent").options;
        let dependent1 = document.getElementById("dependent1").options;
        //let dependent2 = document.getElementById("dependent2").options;

        //if (dependent1.length > 0) {
        if (independent.length > 0 && dependent1.length > 0) {
            let x = source.data.get(independent[0].innerText);
            let y = source.data.get(dependent1[0].innerText);

            /* let x = [];
 
             for (let i = 0; i < y.length; i++)
                 x.push(i);
             */

            let canvas = document.getElementById("chart");
            let ctx = canvas.getContext("2d");

            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            lineChart = new LineChart(ctx);

            lineChart.draw(
                x,
                y
            );

        }
    }

    return {
        load: load,
        set: set
    }
})();

var lineChart;

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function LineChart(ctx) {
    const CANVAS_WIDTH = ctx.canvas.width;
    const CANVAS_HEIGHT = ctx.canvas.height;

    const left = CANVAS_WIDTH * 0.05;
    const bottom = CANVAS_HEIGHT * 0.9;

    const top = CANVAS_HEIGHT * 0.1;
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

        this.xAxis = xAxis;
        this.yAxis = yAxis;

        /*
                for (let i = 0; i < xAxis.interval; i++) {
                    ctx.beginPath();
                    ctx.moveTo(left + i * width / xAxis.interval, top);
                    ctx.lineTo(left + i * width / xAxis.interval, bottom);
                    ctx.stroke();
                }
                */

        ctx.strokeStyle = 'blue';

        ctx.beginPath();
        ctx.moveTo(left + xAxis.distance(x[0]), bottom - yAxis.distance(y[0]));

        for (let i = 1; i < y.length; i++) {
            ctx.lineTo(left + xAxis.distance(x[i]), bottom - yAxis.distance(y[i]));
        }

        ctx.stroke();
    }

    return {
        draw: draw
    };
}

function Axis(length, data) {
    const MIN_INTERVAL = 6;
    const MAX_TICK_LENGTH = 40;

    /*const interval = Math.max(MIN_INTERVAL,
        Math.floor(length / MAX_TICK_LENGTH));*/

    const interval = 6;

    let diff = data.max - data.min;
    let tick = findTick(diff / interval);
    let min = Math.floor(data.min / tick) * tick;
    let max = min + interval * tick;

    function distance(val) {
        return length / (max - min) * (val - min);
    }

    return {
        length: length,
        interval: interval,
        tick: tick,
        min: min,
        max: max,
        distance: distance
    };
}

function findTick(val) {
    const ticks = [1, 2, 5, 10, 25];

    let scale = 1;

    if (val < ticks[0] || val > ticks[ticks.length - 1]) {
        let magnitude = Math.floor(Math.log10(val));

        scale = Math.pow(10, magnitude);
    }

    for (let tick of ticks)
        if (val <= tick * scale)
            return tick * scale;

    throw "no proper tick found!";
}