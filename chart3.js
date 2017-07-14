"use strict";

(function (window) {
    class Axis {
        constructor(axis) {
            this.update(axis);
        }

        update(axis) {
            const MIN_TICKS = 5;
            const MAX_TICKS = 9;

            let min = axis.min;
            let max = axis.max;
            let interval = axis.interval;
            let ticks = MIN_TICKS;

            let diff = max - min;

            if (interval == 0) {

                for (; ticks < MAX_TICKS; ++ticks) {
                    let count = ticks - 1;

                    interval = findInterval(diff / count);
                    min = Math.floor(min / interval) * interval;
                    max = min + interval * count;

                    if (axis.max >= max || axis.max + interval > max)
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


            this.length = axis.length != undefined ? axis.length : this.length;
            this.title = axis.title != undefined ? axis.title : this.title;
            this.unit = axis.unit != undefined ? axis.unit : this.unit;
            this.data = axis.data != undefined ? axis.data : this.data;
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

            if(this.decimal == 0)
                return val.toString();

            return val.toFixed(this.decimal);
        }

        distance(val) {
            return this.length / (this.max - this.min) * (val - this.min);
        }
    }

    class LineChart {
        constructor(w, h) {
            this.w = w;
            this.h = h;

            this.left = Math.floor(w * 0.15) + 0.5;
            this.bottom = Math.floor(h * 0.85) + 0.5;

            this.top = Math.floor(h * 0.1) + 0.5;
            this.right = Math.floor(w * 0.85) + 0.5;

            this.width = this.right - this.left;
            this.height = this.bottom - this.top;

            /**
             * 
             * @type {CanvasRenderingContext2D} ctx 
             */
            this.ctx = null;

            this.xAxis = new Axis({
                min: 2,
                max: 14,
                interval: 0,
                length: this.width,
                title: "A very good x-title",
            });

            this.yAxis = [new Axis({
                min: 0,
                max: 50,
                interval: 10,
                length: this.height,
                title: "A very good x-title",
            })];
        }

        drawGridY(y, left, right, lable_x) {
            const ctx = this.ctx;

            let lable_len = 0;

            for (let i = 0; i < y.ticks; ++i) {
                let h = this.bottom - Math.round(y.tickPos(i));
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

        drawTitle(axis, x, y) {
            const ctx = this.ctx;

            let unit = axis.unit ? axis.unit : "-";

            ctx.fillText(axis.title + " [" + unit + "]", x, y);
        }

        drawGrid() {
            const ctx = this.ctx;

            const overflow = 4.5;

            const font = "13px sans-serif";

            const lable_x_h = this.bottom + 14;
            const title_x_h = lable_x_h + 15;


            let x = this.xAxis;
            let y = this.yAxis[0];
            let y1 = this.yAxis[1];

            ctx.lineWidth = 1;
            ctx.strokeStyle = "grey";

            ctx.font = font;
            ctx.fillStyle = "black";


            ctx.textAlign = "right";
            ctx.textBaseline = "middle"

            ctx.beginPath();

            let lable_y_len = this.drawGridY(y,
                this.left - overflow,
                this.right,
                this.left - overflow * 1.5);

            let lable_y_len_r = 0;
            if (y1) {
                ctx.textAlign = "left";

                lable_y_len_r = this.drawGridY(y1,
                    this.right,
                    this.right + overflow,
                    this.right + overflow * 1.5);
            }

            ctx.textAlign = "center";
            for (let i = 0; i < x.ticks; ++i) {
                let w = this.left + Math.round(x.tickPos(i));
                ctx.moveTo(w, this.top);
                ctx.lineTo(w, this.bottom + overflow);

                ctx.fillText(x.lable(i), w, lable_x_h);
            }

            this.drawTitle(x, this.left + x.length / 2, title_x_h);

            ctx.rotate(3 * Math.PI / 2);
            ctx.textBaseline = "bottom";
            this.drawTitle(y,
                -(this.top + y.length / 2),
                this.left - overflow * 2.5 - lable_y_len);

            if (y1) {
                ctx.textBaseline = "top";

                this.drawTitle(y1,
                    -(this.top + y.length / 2),
                    this.right + overflow * 2.5 + lable_y_len_r);
            }
            ctx.rotate(-3 * Math.PI / 2);

            ctx.stroke();
        }

        drawLine(yAxis) {
            if (!yAxis.data)
                return;

            const ctx = this.ctx;

            let x = this.xAxis.data[0].values;

            for (let data of yAxis.data) {
                ctx.beginPath();
                ctx.strokeStyle = data.color;

                let y = data.values;

                ctx.moveTo(this.left + this.xAxis.distance(x[0]),
                    this.bottom - yAxis.distance(y[0]));

                for (let i = 1; i < y.length; ++i) {
                    ctx.lineTo(this.left + this.xAxis.distance(x[i]),
                        this.bottom - yAxis.distance(y[i]));
                }

                ctx.stroke();
            }

        }

        draw() {
            const ctx = this.ctx;

            ctx.clearRect(0, 0, this.w, this.h);


            this.drawGrid();

            this.drawLine(this.yAxis[0]);
            if (this.yAxis[1]) {
                ctx.setLineDash([5, 5]);
                this.drawLine(this.yAxis[1]);
                ctx.setLineDash([]);
            }

        }

        update({ x, y, y1 }) {
            this.xAxis = createAxis(this.width, x);
            this.yAxis[0] = createAxis(this.height, y);

            if (y1)
                this.yAxis[1] = createAxis(this.height, y1);
            else
                this.yAxis[1] = null;

            this.draw();
        }
    }

    function createAxis(length, init) {
        return new Axis({
            min: Math.min.apply(null, init.data.map((elem) => {
                return Math.min.apply(null, elem.values);
            })),
            max: Math.max.apply(null, init.data.map((elem) => {
                return Math.max.apply(null, elem.values);
            })),
            interval: 0,
            length: length,
            title: init.title,
            unit: init.data[0].unit,
            data: init.data
        });
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

    window.Axis = Axis;
    window.LineChart = LineChart;
})(window);

let lineChart;

document.addEventListener("DOMContentLoaded", function () {
    let canvas = document.getElementById("chart");
    let ctx = canvas.getContext("2d");

    lineChart = new LineChart(canvas.width, canvas.height);
    lineChart.ctx = ctx;
    lineChart.drawGrid();

    document.getElementById("chooser").addEventListener("change", controller.load);
    document.getElementById("setX").addEventListener("click", controller.set);
    document.getElementById("setY1").addEventListener("click", controller.set);
    document.getElementById("setY2").addEventListener("click", controller.set);
    document.getElementById("applyConfig").addEventListener("click", controller.config);
});

var source = (function () {
    const colors = ["red", "green", "blue", "orange"];

    let index = 0;
    let filenames = new Array(4);

    let varNames = new Set();
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
        varNames: varNames,
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

        chart();
    }

    function selectValues(select, length) {
        let data = [];

        for (let i = 0; i < length; ++i) {
            let option = select[i];

            let color = option.style.color;
            let filename = source.findFilename(color);

            let col = source.data.get(filename).get(option.innerText);

            data.push({
                color: color,
                unit: col.unit,
                values: col.data
            });
        }

        return {
            title: select[0].innerText,
            data: data
        };
    }

    function chart() {
        let selectX = document.getElementById("independent");
        let selectY = document.getElementById("dependent1");


        if (selectX.length > 0 && selectY.length > 0) {
            let y1;

            let selectY1 = document.getElementById("dependent2");
            if (selectY1.length != 0) {
                y1 = selectValues(selectY1, selectY1.length);
            }

            lineChart.update({
                x: selectValues(selectX, 1),
                y: selectValues(selectY, selectY.length),
                y1: y1
            });

            let inputs = document.getElementsByClassName("axisConfig");

            for (let input of inputs)
                input.value = "";

            inputs[0].value = lineChart.xAxis.min;
            inputs[1].value = lineChart.xAxis.max;
            inputs[2].value = lineChart.xAxis.interval;

            inputs[3].value = lineChart.yAxis[0].min;
            inputs[4].value = lineChart.yAxis[0].max;
            inputs[5].value = lineChart.yAxis[0].interval;

            if (y1) {
                inputs[6].value = lineChart.yAxis[1].min;
                inputs[7].value = lineChart.yAxis[1].max;
                inputs[8].value = lineChart.yAxis[1].interval;
            }
        }
    }

    function config() {
        let selectX = document.getElementById("independent");
        let selectY = document.getElementById("dependent1");

        if (selectX.length > 0 && selectY.length > 0) {

            let inputs = document.getElementsByClassName("axisConfig");
            {
                let min = parseFloat(inputs[0].value);
                let max = parseFloat(inputs[1].value);
                let interval = parseFloat(inputs[2].value);

                lineChart.xAxis.update({
                    min: min,
                    max: max,
                    interval: interval
                });
            }

            {
                let min = parseFloat(inputs[3].value);
                let max = parseFloat(inputs[4].value);
                let interval = parseFloat(inputs[5].value);

                lineChart.yAxis[0].update({
                    min: min,
                    max: max,
                    interval: interval
                });
            }

            let selectY1 = document.getElementById("dependent2");
            if (selectY1.length != 0) {
                let min = parseFloat(inputs[6].value);
                let max = parseFloat(inputs[7].value);
                let interval = parseFloat(inputs[8].value);

                lineChart.yAxis[1].update({
                    min: min,
                    max: max,
                    interval: interval
                });
            }


            lineChart.draw();
        }
    }

    return {
        load: load,
        set: set,
        config: config
    }
})();