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
        let idx = charts.indexOf(chart);

        charts[idx].ctx = document.querySelectorAll(".chart")[idx].getContext("2d");

        charts[idx].draw();
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

    for (let i = 0; i < 4 && i < select.selectedOptions.length; ++i) {
        let option = document.createElement("option");
        option.innerText = select.selectedOptions[i].innerText;

        y.appendChild(option);
    }

    chart();
}

function chart() {
    let select_x = document.getElementById("independent");
    let select_y = document.getElementById("dependent1");

    if (select_x.length == 0 || select_y.length == 0)
        return;

    let titles = document.getElementsByClassName("chart-title");
    let x = data.get(select_x[0].innerText);

    let i = 0;

    for (; i < select_y.length && i < 4; ++i) {
        let y = data.get(select_y[i].innerText);

        titles[i].value = y[0].name;

        charts[i].update({
            x: x,
            y: y
        });
    }

    for (; i < 4; ++i) {
        const ctx = charts[i].ctx;
        const canvas = ctx.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        titles[i].value = "";
    }
}