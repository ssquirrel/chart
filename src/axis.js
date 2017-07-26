"use strict";

module.exports = class Axis {
    constructor(axis) {
        this.min = 0;
        this.max = 0;
        this.interval = 0;
        this.ticks = 0;
        this.precision = 3;
        this.length = 0;
        this.title = 0;
        this.data = null;

        this.update(axis);
    }

    update(axis) {
        const diff = axis.max - axis.min;

        if (diff === 0) {
            if (axis.max !== 0) {
                this.min = 0;
                this.max = axis.max * 2;
                this.interval = axis.max;
            }
            else {
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
            this.ticks = Math.round(diff / axis.interval) + 1;
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

                    if (max < axis.max) {
                        this.max += interval;
                        this.ticks += 1;
                    }

                    break;
                }
            }

        }

        this.precision = axis.precision !== undefined ? axis.precision : this.precision;
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

    getLabels(digits) {
        let useExponential = false;

        for (let i = 0; i < this.ticks; ++i) {
            let val = this.tick(i);

            if (val === 0)
                continue;

            let N = Math.abs(orderOfMagnitude(val));

            if (val > 1)
                //123
                N += 1;
            else if (val < -1)
                //-123
                N += 2;
            else
                N = removePaddingZeros(val.toFixed(N + this.precision)).length;

            if (N > digits) {
                useExponential = true;
                break;
            }
        }

        let result = [];

        if (useExponential) {
            for (let i = 0; i < this.ticks; ++i) {
                let val = this.tick(i);

                if (val === 0) {
                    result.push("0");
                    continue;
                }

                let abs = Math.abs(val);
                if (abs >= 1 && abs <= 10) {
                    result.push(Math.trunc(val).toString());
                    continue;
                }

                let exp = orderOfMagnitude(val);

                let expStr = expToString(exp);

                let baseStr = (val / Math.pow(10, exp)).toFixed(15);

                let baseLen = digits - expStr.length - 1;//plus sign takes a digit's space

                if (val > 0)
                    baseLen = baseLen > 2 ? Math.min(this.precision + 2, baseLen) : 1;
                else
                    baseLen = baseLen > 3 ? Math.min(this.precision + 3, baseLen) : 2;

                result.push(removePaddingZeros(baseStr.substring(0, baseLen)) +
                    "\u00D7" +
                    expStr);
            }
        }
        else {
            for (let i = 0; i < this.ticks; ++i) {
                let val = this.tick(i);

                result.push(removePaddingZeros(val.toFixed(this.precision)));
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

function removePaddingZeros(str) {
    let i = str.length - 1;

    for (; i >= 0; --i)
        if (str[i] !== '0')
            break;

    if (str[i] === '.')
        return str.substring(0, i);

    return str.substring(0, i + 1);
}

function roundTo(num, digit) {
    let pow = Math.pow(10, digit);
    return Math.round(num * pow) / pow;
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

    return "10" + expStr;
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
