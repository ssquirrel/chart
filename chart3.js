"use strict";

document.addEventListener("DOMContentLoaded", function () {
    let canvas = document.getElementById("chart");
    let ctx = canvas.getContext("2d");


    (new LineChart(ctx)).drawGrid();

    document.getElementById("chooser").addEventListener("change", controller.load);
    document.getElementById("setX").addEventListener("click", controller.set);
    document.getElementById("setY1").addEventListener("click", controller.set);
    document.getElementById("setY2").addEventListener("click", controller.set);
});

var source = (function () {
    const colors = ["red", "green", "blue", "orange"];

    let index = 0;
    let filenames = new Array(4);

    let units = new Map();
    let CSVs = new Map();


    function load(files) {
        return new Promise((resolve, reject) => {
            if (files.length == 0)
                return;

            if (CSVs.size == colors.length) {
                alert("enough!")
                return;
            }

            let file = files[0];

            if (CSVs.has(file.name)) {
                alert("This file is already loaded!");
                return;
            }

            let reader = new FileReader();
            reader.addEventListener("load", function () {
                parseCSV(file.name, this.result);
                resolve();
            });

            reader.readAsText(file);
        });
    }

    function parseCSV(filename, result) {
        const IGNORE_FIRST_N = 3;

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

        let csv = new Map();

        for (let i = 0; i < names.length; ++i) {
            if (cols[i].length == 0)
                continue;

            let col = {
                unit: units[i],
                data: cols[i]
            };

            csv.set(names[i], col);

            varNames.add(names[i]);
        }

        filenames[index++ % colors.length] = filename;
        CSVs.set(filename, csv);
    }

    function findColor(filename) {
        let idx = filenames.indexOf(filename);

        return colors[idx];
    }

    function findFilename(color) {
        let idx = colors.indexOf(color);

        return filenames[idx];
    }

    return {
        varNames: filenames,
        data: CSVs,
        findColor: findColor,
        findFilename: findFilename,
        load: load
    }
})();

var controller = (function () {
    function load() {
        source.load(this.files).then(() => {
            let select = document.getElementById("source");

            select.innerHTML = "";

            for (let name of source.varNames.values()) {
                var option = document.createElement("option");
                option.innerText = name;

                select.appendChild(option);
            }
        });
    }

    function set() {
        let select = document.getElementById("source");

        if (select.selectedIndex == -1)
            return;

        let dest;

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

        let name = select.options[select.selectedIndex].innerText;

        dest.innerHTML = "";

        for (let [filename, csv] of source.data) {
            if (!csv.has(name))
                continue;

            let option = document.createElement("option");
            option.style.color = source.findColor(filename);
            option.innerText = name;

            dest.appendChild(option);
        }

        //chart();
    }

    function selectValues(select, length) {
        let result = [];

        for (let i; i < length; ++i) {
            let option = select[i];

            let color = option.style.color;
            let filename = source.findFilename(color);

            result.push({
                color: color,
                values: source.data.get(filename).get(option.innerText)
            });
        }

        return result;
    }

    function chart() {
        let selectX = document.getElementById("independent");
        let selectY = document.getElementById("dependent1");


        if (selectX.length > 0 && selectY.length > 0) {
            let y1;

            let selectY1 = document.getElementById("dependent2");
            if (selectY1.length != 0) {
                y1 = {
                    title: selectY[0].innerText,
                    data: selectValues(selectY1, selectY1.length)
                };
            }

            let canvas = document.getElementById("chart");
            let ctx = canvas.getContext("2d");

            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            (new LineChart(ctx)).draw({
                x: {
                    title: selectX[0].innerText,
                    data: selectValues(selectX, 1)
                },
                y: {
                    title: selectY[0].innerText,
                    data: selectValues(selectY, selectY.length)
                },
                y1: y1
            });
        }

    }

    return {
        load: load,
        set: set
    }
})();

class Axis {
    constructor(axis) {
        const MIN_TICKS = 5;
        const MAX_TICKS = 9;

        let min = axis.min;
        let max = axis.max;
        let interval = axis.interval;
        let ticks = MIN_TICKS;

        let diff = max - min;

        if (interval == 0) {

            for (; ticks < MAX_TICKS; ++ticks){
                let count = ticks - 1;

                interval = findInterval(diff / count);
                min = Math.floor(min / interval) * interval;
                max = min + interval * count;

                if(axis.max >= max || axis.max + interval > max)
                    break;
            }


            if (max < axis.max) {
                max += interval;
                ++ticks;
            }
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
        min: 2,
        max: 14,
        interval: 0,
        length: width,
        title: "A very good x-title",
    });

    let yAxis = [new Axis({
        min: 130.5,
        max: 138.5,
        interval: 0,
        length: height,
        title: "A very good x-title",
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

    function drawTitle(axis, x, y) {
        let unit = axis.unit ? axis.unit : "-";

        ctx.fillText(axis.title + "[" + unit + "]", x, y);
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

        drawTitle(x, left + x.length / 2, title_x_h);

        ctx.rotate(3 * Math.PI / 2);
        ctx.textBaseline = "bottom";
        drawTitle(y,
            -(top + y.length / 2),
            left - overflow - lable_y_len - lable_y_offset * 2);

        if (y1) {
            ctx.textBaseline = "top";

            drawTitle(y1,
                -(top + y.length / 2),
                right + overflow + lable_y_len_r + lable_y_offset * 2);
        }
        ctx.rotate(-3 * Math.PI / 2);

        ctx.stroke();
    }

    function createAxis(init) {
        return new Axis({
            min: Math.min.apply(null, init.data.map((elem) => {
                return Math.min.apply(elem.values);
            })),
            max: Math.max.apply(null, init.data.map((elem) => {
                return Math.max.apply(elem.values);
            })),
            interval: 0,

        });
    }

    function draw({ x, y, y1 }) {
        xAxis = new Axis({
            min: Math.min.apply(null, x.data.map((elem) => {
                return Math.min.apply(elem.values);
            })),
            max: 50,
            interval: 10,
            length: width,
            title: "A very good x-title",
        });


    }

    return {
        draw: draw,
        drawGrid: drawGrid
    };
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
