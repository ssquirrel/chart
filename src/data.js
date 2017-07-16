"use strict";

const colors = ["red", "green", "blue", "orange"];

let index = 0;
let filenames = new Map();

let varNames = new Set();
let CSVs = new Map();

exports.files = filenames;
exports.varNames = varNames;

exports.load = function (files) {
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
};

exports.get = function (name) {
    let data = [];

    for (let [file, csv] of CSVs.entries()) {
        let col = csv.get(name);

        if (col)
            data.push({
                name: name,
                color: filenames.get(file),
                unit: col.unit,
                values: col.values
            });
    }

    return data;
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
            values: cols[i]
        };

        csv.set(names[i], col);

        varNames.add(names[i]);
    }

    filenames.set(filename, colors[index++ % colors.length]);
    CSVs.set(filename, csv);
}