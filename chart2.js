"use strict";

class Axis {
    constructor(length) {
        this.x = 0;
        this.y = 0;
        this.length = length;

        const MIN_UNIT_COUNT = 6;
        const MAX_UNIT_LENGTH = 20;

        this.count = Math.max(MIN_UNIT_COUNT,
            Math.floor(this.length / MAX_UNIT_LENGTH));

        this.min = 0;
        this.max = 0;

        this.data = [0];
    }

    setData(data) {
        this.data = data;

        let min = Math.min.apply(null, data);
        let max = Math.max.apply(null, data);
        let diff = max - min;

        let scales = [0.01, 0.5, 0.25, 0.1, 1, 5, 10, 25, 50, 100];

        for (let scale of scales)
            if (diff <= scale * this.count) {
                this.min = Math.floor(min / scale) * scale;
                this.max = this.min + this.count * scale;

                return true;
            }

        alert("no proper scale found!");

        return false;
    }

    distance(idx) {
        return this.length * this.data[idx] / (this.max - this.min)
            - this.length * this.min / (this.max - this.min);
    }
}

class LineChart {
    constructor(ctx, rect) {
        this.ctx = ctx;
        this.rect = rect;

        let xAxis = new Axis(rect.right - rect.left);
        xAxis.x = rect.left;
        xAxis.y = rect.bottom;

        let yAxis = new Axis(rect.bottom - rect.top);
        yAxis.x = rect.left;
        yAxis.y = rect.bottom;

        this.xAxis = xAxis;
        this.yAxis = yAxis;
        //this.yAxes = [yAxis];
    }

    draw() {
        const step = this.xAxis.length / this.yAxis.data.length;

        this.ctx.beginPath();
        this.ctx.moveTo(this.xAxis.x, this.yAxis.distance(0));

        for (let i = 1; i < this.yAxis.data.length; i++) {
            this.ctx.lineTo(this.xAxis.x + i * step, this.yAxis.distance(i));
        }

        this.ctx.stroke();
    }
}

var data = new Map();

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("chooser").addEventListener("change", function () {
        var files = this.files;

        if (files.length == 0)
            return;

        var file = files[0];

        var reader = new FileReader();
        reader.addEventListener("load", function () {
            parseCSV(this.result);

            populateXY(document.getElementById("dependent"), data.keys());
        });

        reader.readAsText(file);
    });

    document.getElementById("dependent").addEventListener("change", function () {
        const canvas = document.getElementById("chart");

        const width = canvas.width;
        const height = canvas.height;

        const left = width * 0.05;
        const bottom = height * 0.8;

        const top = height * 0.2;
        const right = width * 0.95;

        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);


        let lineChart = new LineChart(ctx,
            {
                left: canvas.width * 0.05,
                bottom: canvas.height * 0.8,
                top: canvas.height * 0.2,
                right: canvas.width * 0.95,
            })


        if (lineChart.yAxis.setData(data.get(this.options[this.selectedIndex].innerText)))
            lineChart.draw();
    });
});



function parseCSV(result) {
    var lines = result.split("\r\n");

    var names = lines[0].split(",");

    var cols = [];

    for (let i = 0; i < names.length; i++)
        cols.push([]);

    for (let i = 2; i < lines.length; i++) {
        var line = lines[i].split(",");

        for (let k = 0; k < line.length; k++) {
            if (cols[k].length != i - 2)
                continue;

            if (isNaN(line[k]) || line[k] === "")
                continue;

            let val = parseFloat(line[k]);

            if (val > 0)
                cols[k].push(val);
        }

    }

    for (let i = 0; i < names.length; i++)
        if (cols[i].length != 0)
            data.set(names[i], cols[i]);

}

function populateXY(select, names) {
    select.innerHTML = "";

    for (let name of names) {
        var option = document.createElement("option");
        option.innerText = name;

        select.appendChild(option);
    }
}
