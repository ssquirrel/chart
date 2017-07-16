"use strict";

module.exports = class Axis {
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

        if (this.decimal == 0)
            return val.toString();

        return val.toFixed(this.decimal);
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
