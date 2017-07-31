"use strict";

module.exports = class Axis {
    constructor(axis) {
        this.min = 0;
        this.max = 0;
        this.interval = 0;
        this.ticks = 0;
        this.accuracy = 10;
        this.length = 0;
        this.title = 0;
        this.data = null;

        this.update(axis);
    }

    update(axis) {
        const diff = axis.max - axis.min;

        if (diff === 0) {
            if (axis.max > 0) {
                this.min = 0;
                this.max = axis.max * 2;
                this.interval = axis.max;
            } else if (axis.max < 0) {
                this.min = axis.max * 2;
                this.max = 0;
                this.interval = -axis.max;
            } else {
                this.min = -1;
                this.max = 1;
                this.interval = 1;
            }

            this.ticks = 3;
        }
        else if (axis.interval != 0) {
            this.min = axis.min;
            this.max = axis.max;
            this.interval = axis.interval;

            let ticks = Math.ceil(diff / this.interval);

            if (this.interval * (ticks - 1) >= diff * 0.999)
                this.ticks = ticks;
            else
                this.ticks = ticks + 1;

        }
        else {
            const MIN_TICKS = 5;
            const MAX_TICKS = 9;

            for (let ticks = MIN_TICKS; ticks <= MAX_TICKS; ++ticks) {
                let count = ticks - 1;

                let interval = findInterval(diff / count);
                let min = Math.floor(axis.min / interval) * interval;
                let max = min + interval * count;

                this.min = min;
                this.max = max;
                this.interval = interval;
                this.ticks = ticks;

                if (Math.abs(max - axis.max) <= interval)
                    break;
            }

            if (this.max < axis.max) {
                this.max = this.min + this.interval * this.ticks;
                this.ticks += 1;
            }
        }

        this.accuracy = axis.accuracy !== undefined ? axis.accuracy : this.accuracy;
        this.length = axis.length !== undefined ? axis.length : this.length;
        this.title = axis.title !== undefined ? axis.title : this.title;
        this.data = axis.data !== undefined ? axis.data : this.data;
    }

    tick(idx) {
        if (idx < 0 || idx >= this.ticks)
            throw "max:" + this.ticks + " tried:" + idx;

        if (idx === this.ticks - 1)
            return this.max;

        return this.min + idx * this.interval;
    }

    getLabel(idx) {
        let val = this.tick(idx);

        return removePaddingZeros(val.toFixed(this.accuracy));
    }

    getLabels(len) {
        const vals = [];

        for (let i = 0; i < this.ticks; ++i)
            vals.push(this.tick(i));


        let full = [];

        for (let val of vals) {
            if (val === 0) {
                full.push("0");
                continue;
            }

            let N = orderOfMagnitude(val);

            let str = removePaddingZeros(val.toFixed(this.accuracy));

            if ((N >= 5 && str.length > len) ||
                (N <= -4 && str.length > len))
                return vals.map(val => toExpoential(val, this.accuracy, len));

            full.push(str);
        }

        return full;
    }

    tickPos(idx) {
        return this.distance(this.tick(idx));
    }

    distance(val) {
        return this.length / (this.max - this.min) * (val - this.min);
    }
};

const SUPERSCRIPT_MINUS = '\u207B';

const TIMES = "\u00D7";

const SUPERSCRIPT_NUMBERS = ["\u2070",
    "\u00B9",
    "\u00B2",
    "\u00B3",
    "\u2074",
    "\u2075",
    "\u2076",
    "\u2077",
    "\u2078",
    "\u2079"];

const TOLERANCE = Math.pow(10, -15);

function compareFloats(a, b) {
    return Math.abs(a - b) <= TOLERANCE;
}

function toExpoential(val, acc, len) {
    if (val === 0)
        return '0';

    let abs = Math.abs(val);
    if (abs >= 1 && abs <= 10)
        return Math.trunc(val).toString();

    let N = orderOfMagnitude(val);

    let expStr = expToString(N);

    let baseStr = (val / Math.pow(10, N)).toFixed(acc);

    let baseLen = len - expStr.length;

    if (val > 0)
        baseLen = baseLen > 2 ? Math.min(acc + 2, baseLen) : 1;
    else
        baseLen = baseLen > 3 ? Math.min(acc + 3, baseLen) : 2;

    return removePaddingZeros(baseStr.substring(0, baseLen)) + expStr;
}

function removePaddingZeros(str) {
    let i = str.length - 1;

    for (; i >= 0; --i)
        if (str[i] !== '0')
            break;

    if (str[i] === '.')
        return str.substring(0, i);

    return str.substring(0, i + 1);
}

function expToString(exp) {
    let expStr = "";

    if (exp < 0)
        expStr += SUPERSCRIPT_MINUS;

    let digits = [];
    let abs = Math.abs(exp);
    while (abs > 0) {
        digits.push(abs % 10)
        abs = Math.floor(abs / 10);
    }

    for (let i = digits.length - 1; i >= 0; --i)
        expStr += SUPERSCRIPT_NUMBERS[digits[i]];

    return TIMES + "10" + expStr;
}

function orderOfMagnitude(val) {
    if (val < 0)
        val = Math.abs(val);

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
