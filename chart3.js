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

        this.decimal = 0;
        if (!Number.isInteger(interval))
            this.decimal = Math.abs(Math.floor(Math.log10(interval)));

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

    tickPos(idx) {
        return this.distance(this.tick(idx));
    }

    lable(idx) {
        let val = this.tick(idx);

        return val.toFixed(this.decimal);
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

    let xAxis = new Axis({
        min: 600,
        max: 1200,
        interval: 100,
        length: width,
        title: "A very good x-title"
    });

    let yAxis = [new Axis({
        min: 1,
        max: 1.5,
        interval: 0.1,
        length: height,
        title: "A very good x-title"
    }), new Axis({
        min: 1,
        max: 4,
        interval: 0.5,
        length: height,
        title: "T_DEVF_Bypasss_IOH"
    })];

    function drawGridY(y, left, right, lable_x) {
        let lable_len = 0;

        for (let i = 0; i < y.ticks; ++i) {
            let h = bottom - Math.round(y.tickPos(i));
            ctx.moveTo(left, h);
            ctx.lineTo(right, h);

            let lable = y.lable(i);

            ctx.fillText(lable, lable_x, h);

            let len = ctx.measureText(lable).width;
            if (len > lable_len)
                lable_len = len;
        }

        return lable_len;
    }

    function drawGrid() {
        const overflow = 4.5;

        const font = "13px sans-serif";

        const lable_y_offset = 2.5;

        const lable_x_h = bottom + 14;
        const title_x_h = lable_x_h + 15;


        let x = xAxis;
        let y = yAxis[0];
        let y1 = yAxis[1];

        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";

        ctx.font = font;
        ctx.fillStyle = "black";


        ctx.textAlign = "right";
        ctx.textBaseline = "middle"

        let lable_y_len = drawGridY(y,
            left - overflow,
            right,
            left - overflow - lable_y_offset);

        let lable_y_len_r = 0;
        if (y1) {
            ctx.textAlign = "left";

            lable_y_len_r = drawGridY(y1,
                right,
                right + overflow,
                right + overflow + lable_y_offset);
        }

        ctx.textAlign = "center";
        for (let i = 0; i < x.ticks; ++i) {
            let w = left + Math.round(x.tickPos(i));
            ctx.moveTo(w, top);
            ctx.lineTo(w, bottom + overflow);

            ctx.fillText(x.lable(i), w, lable_x_h);
        }

        ctx.fillText(x.title, left + x.length / 2, title_x_h);


        ctx.rotate(3 * Math.PI / 2);
        ctx.textBaseline = "bottom";
        ctx.fillText(y.title,
            -(top + y.length / 2),
            left - overflow - lable_y_len - lable_y_offset * 2);

        if (y1) {
            ctx.textBaseline = "top";

            ctx.fillText(y1.title,
                -(top + y.length / 2),
                right + overflow + lable_y_len_r + lable_y_offset * 2);
        }
        ctx.rotate(-3 * Math.PI / 2);

        ctx.stroke();
    }

    return {
        drawGrid: drawGrid
    }
}

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
