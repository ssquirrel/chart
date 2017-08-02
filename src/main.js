"use strict";

const data = require("./data.js");
const LineChart = require("./lineChart.js");
const Editor = require("./editor.js");

const width = 460;
const height = 320;

const charts = [new LineChart(width, height), new LineChart(width, height), new LineChart(width, height), new LineChart(width, height)];

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("chooser").addEventListener("change", load);
    document.getElementById("setX").addEventListener("click", setX);
    document.getElementById("setY1").addEventListener("click", setY1);

    let buttons = document.querySelectorAll(".chart-edit");
    let canvases = document.querySelectorAll(".chart");
    for (let i = 0; i < canvases.length; ++i) {
        let canvas = canvases[i];

        charts[i].ctx = canvas.getContext("2d");

        buttons[i].addEventListener("click", function () {
            Editor.show(charts[i]);
        });
    }

    Editor.init(function (chart) {
        chart.draw();
    });

    //charts[0].draw();
});

function load() {
    data.load(this.files).then(() => {
        let select = document.getElementById("source");

        select.innerHTML = "";

        for (let name of data.varNames.values()) {
            let option = document.createElement("option");
            option.innerText = name;

            select.appendChild(option);
        }

        let lengend = document.querySelector(".lengend");
        lengend.innerHTML = "";

        let template = document.getElementById("lengend-template");

        let i = 0;
        for (let [file, color] of data.files.entries()) {
            let type = template.content.querySelector(".lengend-type");
            let text = template.content.querySelector(".lengend-text");

            type.style.borderBottom = `1px solid ${color}`;
            text.firstElementChild.innerText = file;

            let clone = document.importNode(template.content, true);
            lengend.appendChild(clone);

            ++i;
        }

        lengend.parentElement.style.height = `${i * 20 + 40}px`;
    });
}

function setX() {
    let select = document.getElementById("source");

    if (select.selectedIndex == -1)
        return;

    let x = document.getElementById("independent");
    let name = select.options[select.selectedIndex].innerText;

    x.innerHTML = `<option>${name}</option>`;

    chart();
}

function setY1() {
    let select = document.getElementById("source");

    if (select.selectedIndex == -1)
        return;

    let y = document.getElementById("dependent1");
    y.innerHTML = "";

    for (let i = 0; i < select.selectedOptions.length; ++i) {
        let option = document.createElement("option");
        option.innerText = select.selectedOptions[i].innerText;

        y.appendChild(option);
    }

    chart();
}

function chart() {
    const select_x = document.getElementById("independent");
    const select_y = document.getElementById("dependent1");

    if (select_x.length == 0 || select_y.length == 0)
        return;

    const titles = document.getElementsByClassName("chart-title");
    const x = data.get(select_x[0].innerText);

    const newLen = Math.ceil(select_y.length / 2 -
        document.querySelectorAll(".chart-row").length);

    for (let i = 0; i < newLen; ++i)
        createChartRow();

    let i = 0;

    for (; i < select_y.length; ++i) {
        let y = data.get(select_y[i].innerText);

        titles[i].value = y[0].name;

        charts[i].update({
            x: x,
            y: y
        });
    }

    for (; i < charts.length; ++i) {
        const ctx = charts[i].ctx;
        const canvas = ctx.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        titles[i].value = "";
    }

    const lastVisible = Math.floor((select_y.length - 1) / 2);
    const rows = document.querySelectorAll(".chart-row");

    i = 2;
    for (; i <= lastVisible; ++i)
        rows[i].style.display = "block";

    for (; i < rows.length; ++i)
        rows[i].style.display = "none";
}

function createChartRow() {
    const left = new LineChart(width, height);
    const right = new LineChart(width, height);

    charts.push(left, right);

    const row = document.querySelector(".chart-row").cloneNode(true);

    const titles = row.querySelectorAll(".chart-title");
    titles[0].value = "";
    titles[1].value = "";

    const canvas = row.querySelectorAll(".chart");
    left.ctx = canvas[0].getContext("2d");
    right.ctx = canvas[1].getContext("2d");

    const buttons = row.querySelectorAll(".chart-edit");
    buttons[0].addEventListener("click", function () {
        Editor.show(left);
    });
    buttons[1].addEventListener("click", function () {
        Editor.show(right);
    });

    document.getElementById("charts").appendChild(row);
}