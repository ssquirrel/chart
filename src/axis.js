"use strict";

module.exports = class Axis {
    constructor(axis) {
        this.min = 0;
        this.max = 0;
        this.interval = 0;
        this.ticks = 0;
        this.precision = 0;
        this.length = 0;
        this.title = 0;
        this.data = null;

        this.update(axis);
    }

    update(axis) {
        const diff = axis.max - axis.min;

        if (axis.interval != 0) {
            this.min = axis.min;
            this.max = axis.max;
            this.interval = axis.interval;
            this.ticks = Math.ceil(diff / axis.interval) + 1;

            this.precision =
                Math.max(decimal(this.min), decimal(this.max));
        }
        else {
            const MIN_TICKS = 5;
            const MAX_TICKS = 9;

            for (let ticks = MIN_TICKS; ticks < MAX_TICKS; ++ticks) {
                let count = ticks - 1;

                let interval = findInterval(diff / count);
                let min = Math.floor(axis.min / interval) * interval;
                let max = min + interval * count;

                if (Math.abs(max - axis.max) <= interval) {
                    this.min = min;
                    this.max = max;
                    this.interval = interval;
                    this.ticks = ticks;
                    this.precision = decimal(this.interval);

                    if (max < axis.max) {
                        this.max += interval;
                        this.ticks += 1;
                    }

                    break;
                }
            }

        }

        this.length = axis.length !== undefined ? axis.length : this.length;
        this.title = axis.title !== undefined ? axis.title : this.title;
        this.data = axis.data !== undefined ? axis.data : this.data;
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

        return val.toFixed(this.precision);
    }

    distance(val) {
        return this.length / (this.max - this.min) * (val - this.min);
    }
};

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

function decimal(num) {
    if (Number.isInteger(num))
        return 0;

    let str = num.toString();
    return str.length - str.indexOf(".") - 1;
}