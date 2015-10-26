///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
/////<reference path="canvas.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ControlPositions = {
    tl: 'tl',
    tr: 'tr',
    bl: 'bl',
    br: 'br',
    mt: 'mt'
};
var Control = (function () {
    function Control(container, el, handlerEl) {
        this.container = container;
        this.visibility = false;
        this.element = handlerEl || this.getDefaultElement(el);
        this.linkedTo = el;
        this.element.attr({ opacity: 0 });
        this.element.toggleClass('controlItem', true);
        var self = this;
        if (!!this.linkedTo && !el.paper) {
            throw "Error: this.linkedTo.paper is undefined";
        }
        this.element.appendTo(this.linkedTo.select('.elementControls'));
        //this.linkedTo._controls[controlName] = this;
        this.element.drag(this.onDragmove, this.onDragstart, this.onDragend, this, this, this);
        this.element.angle = 0;
        this.initialize();
    }
    Control.prototype.onDragstart = function (x, y, event) {
        this.element.toggleClass('dragging', true);
    };
    Control.prototype.onDragend = function (event) {
        this.element.toggleClass('dragging', false);
    };
    /**
     *
     * @param dx x distance between the control and the mouse
     * @param dy y distance between the control and the mouse
     * @param x
     * @param y
     */
    Control.prototype.onDragmove = function (dx, dy, x, y, event) {
        event.preventDefault();
        // console.log('on drag down', this);
    };
    Control.prototype.setPosition = function (x, y) {
        switch (this.element.type) {
            case 'circle':
                this.element.attr({ cx: x, cy: y });
                break;
            default:
                this.element.attr({ x: x, y: y });
                break;
        }
    };
    Control.prototype.setWidth = function (w) {
        switch (this.element.type) {
            case 'circle':
                this.element.attr({ r: w / 2 });
                break;
            default:
                this.element.attr({ width: w });
                break;
        }
    };
    Control.prototype.setHeight = function (h) {
        switch (this.element.type) {
            case 'circle':
                this.element.attr({ r: h / 2 });
                break;
            default:
                this.element.attr({ height: h });
                break;
        }
    };
    Control.prototype.initialize = function () {
        //do nothing by default
    };
    Control.prototype.getDefaultElement = function (el) {
        return el.rect(0, 0, 20, 20);
    };
    Control.prototype.toggleVisibility = function (force) {
        if ('undefined' !== typeof force) {
            this.visibility = force;
        }
        else {
            this.visibility = !this.visibility;
        }
        var opacity = (this.visibility) ? 1 : 0;
        this.element.attr({ opacity: opacity });
    };
    return Control;
})();
var ScaleControl = (function (_super) {
    __extends(ScaleControl, _super);
    function ScaleControl() {
        _super.apply(this, arguments);
    }
    ScaleControl.prototype.getDefaultElement = function (el) {
        var item = el.rect(0, 0, 20, 20);
        item.toggleClass('scaleControl', true);
        return item;
    };
    ScaleControl.prototype.initialize = function () {
        this.scalableEl = this.container.scalableGroup.group;
    };
    /**
     *
     * @param dx x distance between the control and the mouse
     * @param dy y distance between the control and the mouse
     * @param x
     * @param y
     */
    ScaleControl.prototype.onDragmove = function (dx, dy, x, y, event) {
        var scale = 1 + dx / 100;
        if (scale < 0.2)
            scale = 0.2;
        if (scale > 10)
            scale = 10;
        var el = this.scalableEl;
        el.attr({
            transform: el.data('origTransform') + (el.data('origTransform') ? "S" : "s") + scale
        });
        this.container.placeControls();
        _super.prototype.onDragmove.call(this, dx, dy, x, y, event);
    };
    ScaleControl.prototype.onDragstart = function (x, y, event) {
        this.scalableEl.data('origTransform', this.scalableEl.transform().local);
        _super.prototype.onDragstart.call(this, x, y, event);
    };
    return ScaleControl;
})(Control);
var RotationControl = (function (_super) {
    __extends(RotationControl, _super);
    function RotationControl() {
        _super.apply(this, arguments);
    }
    RotationControl.prototype.getDefaultElement = function (el) {
        var item = el.circle(0, 0, 10);
        item.toggleClass('rotationControl', true);
        return item;
    };
    RotationControl.prototype.initialize = function () {
        this.rotatableEl = this.container.group;
    };
    /**
     *
     * @param dx x distance between the control and the mouse
     * @param dy y distance between the control and the mouse
     * @param x
     * @param y
     */
    RotationControl.prototype.onDragmove = function (dx, dy, x, y, event) {
        var el = this.rotatableEl;
        var scale = Math.round(this.container.getControllableOptions().getZoomRatio());
        var p1 = this.element.getBBox();
        var p2 = { x: p1.x + dx * scale, y: p1.y + dy * scale };
        var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        //var angle = 1 + dx/2;
        el.attr({
            transform: el.data('origTransform') + (el.data('origTransform') ? "R" : "r") + angle
        });
        _super.prototype.onDragmove.call(this, dx, dy, x, y, event);
    };
    RotationControl.prototype.onDragstart = function (x, y, event) {
        var el = this.rotatableEl;
        el.data('origTransform', el.transform().local);
        _super.prototype.onDragstart.call(this, x, y, event);
    };
    return RotationControl;
})(Control);
var DropControl = (function (_super) {
    __extends(DropControl, _super);
    function DropControl() {
        _super.apply(this, arguments);
    }
    return DropControl;
})(Control);
var DragControl = (function (_super) {
    __extends(DragControl, _super);
    function DragControl() {
        _super.apply(this, arguments);
    }
    return DragControl;
})(Control);
//# sourceMappingURL=controls.js.map