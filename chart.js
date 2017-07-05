"use strict";

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
        if (this.selectedIndex != -1)
            draw(data.get(this.options[this.selectedIndex].innerText));

    });
});

var data = new Map();

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

function draw(y) {
    const canvas = document.getElementById("chart");

    const width = canvas.width;
    const height = canvas.height;

    const left = width * 0.05;
    const bottom = height * 0.8;

    const top = height * 0.2;
    const right = width * 0.95;

    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();

    const startX = left + width * 0.01;
    const startY = bottom - height * 0.1;

    const minY = Math.min.apply(null, y);
    const maxY = Math.max.apply(null, y);

    if (minY == maxY) {
        ctx.moveTo(startX, startY);
        ctx.lineTo(right, startY);
        ctx.stroke();

        return;
    }

    const step = (right - startX) / y.length;

    ctx.moveTo(startX,  getHeight(y[0]));

    for (let i = 1; i < y.length; i++) {
        ctx.lineTo(startX + i * step, getHeight(y[i]));
    }

    ctx.stroke();

    function getHeight(val) {
        return (top - startY) / (maxY - minY) * (val - minY) + startY;
    }

}