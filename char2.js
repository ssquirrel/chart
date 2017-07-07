"use strict";

class Rect {
    /**
     * 
     * @param {number} top 
     * @param {number} right 
     * @param {number} bottom 
     * @param {number} left 
     */
    constructor(top, right, bottom, left) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
}

class Axis {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.length = 0;
        this.min = 0;
        this.max = 0;
        this.title = "";
        this.unit = "";
    }

    set data(data) {
        alert(data.length);
    }
}

class LineChart {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Rect} rect 
     */
    constructor(ctx, rect) {
        this.ctx = ctx;
        this.rect = rect;

        let xAxis = new Axis();
        xAxis.x = rect.left;
        xAxis.y = rect.bottom;
        xAxis.length = rect.right - rect.left;

        let yAxis = new Axis();
        yAxis.x = rect.left;
        yAxis.y = rect.bottom;
        yAxis.length = rect.bottom - rect.top;

        this.xAxis = xAxis;
        this.yAxes = [yAxis];
    }

    /**
     * 
     * @param {number[]} arr 
     */
    setX(arr) {
        let [min, max] = findMinAndMax(arr);
    }

    render() {

    }

    /**
     * 
     * @param {number[]} arr 
     */
    static findMinAndMax(arr) {
        let min = arr[0];
        let max = arr[0];

        for (let val of arr) {
            if (val > max)
                max = val;
            if (val < min)
                min = val;
        }

        return [min, max];
    }
}