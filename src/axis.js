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

    getLabels(max) {
        let useExponential = false;

        for (let i = 0; i < this.ticks; ++i) {
            let abs = Math.abs(this.tick(i));

            if (abs > 1) {
                let integralPart = Math.floor(abs);

                let N = orderOfMagnitude(integralPart);

                if (N > max) {
                    useExponential = true;
                    break;
                }
            }
            else {
                let n = orderOfMagnitude(abs);

                if (Math.abs(n) > max) {
                    useExponential = true;
                    break;
                }
            }
        }

        let result = [];

        if (useExponential) {

            for (let i = 0; i < this.ticks; ++i) {
                let val = this.tick(i);
                let abs = Math.abs(val);

                if (val == 0 || (abs > 1 && abs < 10)) {
                    result.push(val.toString());
                    continue;
                }

                let rounded = Math.round(val * Math.pow(10, this.precision)) / Math.pow(10, this.precision);

                let [base, exp] = rounded.toExponential().split("e");

                let len = max - (exp.length - exp[0] === "+" ? 1 : 0);

                base = base.substring(0, len);

                result.push(base + "\u00D7" + "10" + getEx(exp));
            }
        }



        return result;
    }

    tickPos(idx) {
        return this.distance(this.tick(idx));
    }

    distance(val) {
        return this.length / (this.max - this.min) * (val - this.min);
    }
};

const TIMES = "\u00D7";

const SUPERSCRIPTS = ["\u2070",
    "\u00B9",
    "\u00B2",
    "\u00B3",
    "\u2074",
    "\u2075",
    "\u2076",
    "\u2077",
    "\u2078",
    "\u2079"];

function getEx(str) {
    let exp = "";

    if (str[0] === "-")
        exp += "\u207B";

    for (let i = 1; i < str.length; ++i) {
        exp += SUPERSCRIPTS[str[i].charCodeAt(0) - '0'.charCodeAt(0)];
    }

    return exp;
}

function orderOfMagnitude(val) {
    return Math.floor(Math.log10(val));
}

function findInterval(val) {
    const ticks = [1, 2, 5, 10, 25];

    let scale = 1;

    if (val < ticks[0] || val > ticks[ticks.length - 1]) {
        scale = Math.pow(10, orderOfMagnitude(val));
    }

    for (let tick of ticks)
        if (val <= tick * scale)
            return tick * scale;

    throw "no proper tick found!";
}

function decimal(num) {
    if (Number.isInteger(num))
        return 0;

    let str = num.toFixed(15);
    let i = str.length - 1;

    for (; i >= 0; --i) {
        if (str.charCodeAt(i) != '0'.charCodeAt(0))
            break;
    }

    return i - 1;
}


