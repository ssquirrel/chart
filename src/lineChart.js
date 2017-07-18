"use strict";

const Axis = require("./axis.js");

module.exports = class LineChart {
    constructor(w, h) {
        this.w = w;
        this.h = h;

        this.left = Math.floor(w * 0.15) + 0.5;
        this.bottom = Math.floor(h * 0.85) + 0.5;

        this.top = Math.floor(h * 0.05) + 0.5;
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
        title: init[0].name,
        unit: init[0].unit,
        data: init
    });
}
