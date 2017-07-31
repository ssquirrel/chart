"use strict";

const Axis = require("./axis.js");

module.exports = class LineChart {
    constructor(w, h) {
        this.w = w;
        this.h = h;

        this.left = Math.floor(w * 0.15) + 0.5;
        this.bottom = Math.floor(h * 0.85) + 0.5;

        this.top = Math.floor(h * 0.05) + 0.5;
        this.right = Math.floor(w * 0.9) + 0.5;

        this.width = this.right - this.left;
        this.height = this.bottom - this.top;

        /**
         * 
         * @type {CanvasRenderingContext2D} ctx 
         */
        this.ctx = null;

        this.xAxis = new Axis({
            min: 0.0125,
            max: 0.1,
            interval: 0.0125,
            length: this.width,
            title: "A very good x-title",
        });

        this.yAxis = [new Axis({
            min: 0,
            max: 6,
            interval: 1,
            length: this.height,
            title: "A very good x-title",
        })];
    }

    drawGrid() {
        const overflow = 4;

        const ctx = this.ctx;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";

        ctx.beginPath();

        let x = this.xAxis;
        for (let i = 0; i < x.ticks; ++i) {
            let w = this.left + Math.round(x.tickPos(i));
            ctx.moveTo(w, this.top);
            ctx.lineTo(w, this.bottom + overflow);
        }

        let y = this.yAxis[0];
        for (let i = 0; i < y.ticks; ++i) {
            let h = this.bottom - Math.round(y.tickPos(i));
            ctx.moveTo(this.left - overflow, h);
            ctx.lineTo(this.right, h);
        }

        const DIGIT_WIDTH = ctx.measureText("0").width;
        const INTERVAL_x = this.width / (x.ticks - 1);
        const INTERVAL_y = this.left - 30;
        const max_d_x = Math.floor(INTERVAL_x / DIGIT_WIDTH);
        const max_d_y = Math.floor(INTERVAL_y / DIGIT_WIDTH);

        let xLabels = this.xAxis.getLabels(max_d_x);
        let yLabels = this.yAxis[0].getLabels(max_d_y);

        ctx.textAlign = "right";
        ctx.textBaseline = "middle"
        for (let i = 0; i < y.ticks; ++i) {
            let h = this.bottom - Math.round(y.tickPos(i));
            ctx.fillText(yLabels[i], this.left - overflow * 1.5, h);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "top"
        for (let i = 0; i < x.ticks; ++i) {
            let w = this.left + Math.round(x.tickPos(i));
            ctx.fillText(xLabels[i], w, this.bottom + overflow);
        }

        ctx.fillText(x.title, this.left + x.length / 2, this.bottom + 20);

        ctx.rotate(3 * Math.PI / 2);
        ctx.textBaseline = "bottom";

        let yLabelLen = 0;
        for (let str of yLabels)
            yLabelLen = Math.max(yLabelLen, ctx.measureText(str).width);

        ctx.fillText(y.title,
            -(this.top + y.length / 2),
            this.left - overflow * 2.5 - yLabelLen);
        ctx.rotate(-3 * Math.PI / 2);


        ctx.stroke();
    }

    posX(val) {
        return this.left + this.xAxis.distance(val);
    }

    posY1(val) {
        return this.bottom - this.yAxis[0].distance(val);
    }

    drawLine(yAxis) {
        if (!yAxis.data)
            return;

        const ctx = this.ctx;
        const xAxis = this.xAxis;
        const xValues = xAxis.data[0].values;

        ctx.fillStyle = "white";

        for (let { values: yValues, color } of yAxis.data) {
            ctx.strokeStyle = color;

            ctx.beginPath();

            ctx.moveTo(this.posX(xValues[0]),
                this.posY1(yValues[0]));

            for (let i = 1; i < yValues.length; ++i)
                ctx.lineTo(this.posX(xValues[i]),
                    this.posY1(yValues[i]));

            ctx.stroke();


            for (let i = 0; i < yValues.length; ++i) {
                ctx.beginPath();

                ctx.arc(this.posX(xValues[i]), this.posY1(yValues[i]),
                    5, 0, 2 * Math.PI);

                ctx.fill();
                ctx.stroke();
            }

        }

    }

    draw() {
        const ctx = this.ctx;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.w, this.h);


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
};

function createAxis(length, init) {
    return new Axis({
        min: Math.min.apply(null, init.map((elem) => {
            return Math.min.apply(null, elem.values);
        })),
        max: Math.max.apply(null, init.map((elem) => {
            return Math.max.apply(null, elem.values);
        })),
        interval: 0,
        length: length,
        title: `${init[0].name} [${init[0].unit ? init[0].unit : '-'}]`,
        data: init
    });
}