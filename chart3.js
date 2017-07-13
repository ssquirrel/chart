"use strict";


document.addEventListener("DOMContentLoaded", function () {

    let canvas = document.getElementById("chart");
    let ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    lineChart = LineChart(ctx);
    lineChart.drawGrid();
});

/*
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

            if (color.size == COLORS.length) {
                alert("enough!")
                return;
            }

            var file = files[0];
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


        color.set(filename, COLORS[(index++) % COLORS.length]);


        let lines = result.split("\r\n");

        let names = lines[0].split(",");
        let units = lines[1].split(",");

        let cols = [];
        for (let i = 0; i < names.length; i++)
            cols.push([]);

        for (let i = IGNORE_FIRST_N; i < lines.length; ++i) {
            var line = lines[i].split(",");

            for (let k = 0; k < line.length; ++k) {
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

            let map = data.get(names[i]);
            if (!map) {
                map = new Map();
                data.set(names[i], map);
            }

            map.set(filename, col);
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
            let select = document.getElementById("source");

            select.innerHTML = "";

            for (let name of source.data.keys()) {
                var option = document.createElement("option");
                option.innerText = name;

                select.appendChild(option);
            }
        });
    }

    let indie = [];
    let dependent1 = [];
    let dependent2 = [];

    function set() {
        let select = document.getElementById("source");

        if (select.selectedIndex == -1)
            return;

        let dest;
        let selected = [];

        switch (this.id) {
            case "setX":
                dest = document.getElementById("independent");

                indie = selected;
                break;
            case "setY1":
                dest = document.getElementById("dependent1");

                dependent1 = selected;
                break;
            case "setY2":
                dest = document.getElementById("dependent2");
                break;
        }

        let name = select.options[select.selectedIndex].innerText;
        let list = source.data.get(name);

        selected.title = name;

        dest.innerHTML = "";
        for (let [from, data] of list) {
            selected.push({
                data: i.data,
                color: source.color.get(i.from)
            })

            let option = document.createElement("option");
            option.style.color = source.color.get(i.from);
            option.innerText = name;

            dest.appendChild(option);
        }

        chart();
    }

    function chart() {
        if (indie.length > 0 && dependent1.length > 0) {
            /* let x = [];
 
             for (let i = 0; i < y.length; i++)
                 x.push(i);

            let canvas = document.getElementById("chart");
            let ctx = canvas.getContext("2d");

            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            lineChart = new LineChart(ctx);

            lineChart.draw(
                indie,
                dependent1
            );

        }
    }

    return {
        load: load,
        set: set
    }
})();
*/
var lineChart;

class Axis {
    constructor(axis) {
        let min = axis.min;
        let max = axis.max;
        let interval = axis.interval;
        let ticks = 7;

        let diff = max - min;

        if (interval == 0) {
            interval = findInterval(diff / (ticks - 1));
            min = Math.floor(min / ticks) * ticks;
            max = min + interval * ticks;
        }
        else {
            ticks = Math.ceil(diff / interval) + 1;
        }

        this.min = min;
        this.max = max;
        this.interval = interval;
        this.ticks = ticks;

        this.length = axis.length;
        this.title = axis.title;
        this.unit = axis.unit;
        this.data = axis.data;
    }

    tick(idx) {
        if (idx < 0 || idx >= this.ticks)
            throw "max:" + this.ticks + " tried:" + idx;

        let val = this.min + idx * this.interval;

        return val > this.max ? this.max : val;
    }

    distance(val) {
        return this.length / (this.max - this.min) * (val - this.min);
    }
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function LineChart(ctx) {
    const CANVAS_WIDTH = ctx.canvas.width;
    const CANVAS_HEIGHT = ctx.canvas.height;

    const left = Math.floor(CANVAS_WIDTH * 0.15) + 0.5;
    const bottom = Math.floor(CANVAS_HEIGHT * 0.85) + 0.5;

    const top = Math.floor(CANVAS_HEIGHT * 0.1) + 0.5;
    const right = Math.floor(CANVAS_WIDTH * 0.85) + 0.5;

    const width = right - left;
    const height = bottom - top;

    const font = "13px sans-serif";

    const title_x_h = bottom + 30;
    const lable_x_h = bottom + 15;

    let xAxis = new Axis({
        min: 0,
        max: 50,
        interval: 10,
        length: width,
        title: "A very good x-title"
    });

    let yAxis = [new Axis({
        length: height,
        min: 0,
        max: 50,
        interval: 10,
        title: "A very good y-title"
    })];

    function drawGrid() {
        const overflow_v = 4.5;
        const overflow_h = -4.5;

        let x = xAxis;
        let y = yAxis[0];

        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";

        ctx.font = font;
        ctx.fillStyle = "black";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle"

        let lable_y_len = 0;

        for (let i = 0; i < y.ticks; ++i) {
            let val = y.tick(i)
            let h = bottom - Math.round(y.distance(val));
            ctx.moveTo(left + overflow_h, h);
            ctx.lineTo(right, h);

            ctx.fillText(val, left + overflow_h, h);

            let len = ctx.measureText(val).width;
            if (len > lable_y_len)
                lable_y_len = len;
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";



        for (let i = 0; i < x.ticks; ++i) {
            let val = x.tick(i);
            let w = left + Math.round(x.distance(val));
            ctx.moveTo(w, top);
            ctx.lineTo(w, bottom + overflow_v);

            ctx.fillText(val, w, lable_x_h);
        }

        ctx.fillText(x.title, left + x.length / 2, title_x_h);

        ctx.rotate(3 * Math.PI / 2);
        ctx.fillText(y.title, -(top + y.length / 2), left - lable_y_len + overflow_h * 3);
        ctx.rotate(-3 * Math.PI / 2);

        ctx.stroke();
    }

    return {
        drawGrid: drawGrid
    }
}
/*
    function applyToAll(all, func) {
        let results = [];

        for (let arr of all)
            results.push(func.apply(null, arr.data));

        return func.apply(null, results);
    }

    function draw(indie, dependent1) {
        let xAxis = Axis(width, {
            min: Math.min.apply(null, indie[0].data),
            max: Math.max.apply(null, indie[0].data)
        });

        let yAxis = Axis(height, {
            min: applyToAll(dependent1, Math.min),
            max: applyToAll(dependent1, Math.max)
        });

        this.xAxis = xAxis;
        this.yAxis = yAxis;

        
                for (let i = 0; i < xAxis.interval; i++) {
                    ctx.beginPath();
                    ctx.moveTo(left + i * width / xAxis.interval, top);
                    ctx.lineTo(left + i * width / xAxis.interval, bottom);
                    ctx.stroke();
                }
                

        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";

        ctx.beginPath();

        for (let i = 0; i <= xAxis.interval; ++i) {
            ctx.moveTo(left + 0.5 + Math.floor(i * xAxis.length / xAxis.interval), top);
            ctx.lineTo(left + 0.5 + Math.floor(i * xAxis.length / xAxis.interval), bottom + 3);
        }

        for (let i = 0; i <= yAxis.interval; ++i) {
            ctx.moveTo(left - 3, bottom + 0.5 - Math.floor(i * yAxis.length / yAxis.interval));
            ctx.lineTo(right, bottom + 0.5 - Math.floor(i * yAxis.length / yAxis.interval));
        }

        ctx.stroke();

        ctx.save();
        ctx.rotate(3 * Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText(dependent1.title, -CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.05);
        ctx.restore();

        ctx.textAlign = "center";
        for (let i = 0; i <= xAxis.interval; ++i) {
            ctx.fillText(xAxis.min + xAxis.tick * i,
                left + i * xAxis.length / xAxis.interval,
                CANVAS_HEIGHT * 0.9);
        }

        ctx.fillText(indie.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.95);
        ctx.textAlign = "start";

        for (let { data: y, color } of dependent1) {
            let x = indie[0].data;

            ctx.strokeStyle = color;

            ctx.beginPath();
            ctx.moveTo(left + xAxis.distance(x[0]), bottom - yAxis.distance(y[0]));

            for (let i = 1; i < y.length; i++) {
                ctx.lineTo(left + xAxis.distance(x[i]), bottom - yAxis.distance(y[i]));
            }

            ctx.stroke();
        }
    }

    return {
        draw: draw
    };
}
*/

function findInterval(val) {
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
