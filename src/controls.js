///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ControlPositions = {
    tl: 'tl',
    tr: 'tr',
    bl: 'bl',
    br: 'br',
    mt: 'mt',
    mb: 'mb'
};
var Control = (function () {
    function Control(container, el, handlerEl) {
        this.container = container;
        this.type = 'Control';
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
    /**
     * set position relative to parent
     * @param x
     * @param y
     */
    Control.prototype.setPosition = function (x, y) {
        switch (this.element.type) {
            case 'circle':
                this.element.attr({ cx: x, cy: y });
                break;
            case 'g':
                var localmatrix = this.element.transform().localMatrix, invert = localmatrix.invert(), absX = x / localmatrix.a, absY = y / localmatrix.d;
                //cancel the previous translation then do the new one
                this.element.attr({ transform: localmatrix.translate(invert.e, invert.f).translate(absX, absY) });
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
            case 'g':
                var bbox = this.element.getBBox(), width = bbox.width, scaleX = this.element.transform().localMatrix.a, absWidth = width / scaleX, newScaleX = w / absWidth;
                this.element.attr({
                    transform: this.element.transform().localMatrix.scale(1 / scaleX, 1).scale(newScaleX, 1)
                });
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
            case 'g':
                var bbox = this.element.getBBox(), height = bbox.height, scaleY = this.element.transform().localMatrix.d, absHeight = height / scaleY, newScaleY = h / absHeight;
                this.element.attr({
                    transform: this.element.transform().localMatrix.scale(1, 1 / scaleY).scale(1, newScaleY)
                });
                break;
            default:
                this.element.attr({ height: h });
                break;
        }
    };
    Control.prototype.getWidth = function () {
        return this.element.getBBox().width;
    };
    Control.prototype.getHeight = function () {
        return this.element.getBBox().height;
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
        this.type = 'ScaleControl';
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
        var scale = 1 + (dx + dy) / 100;
        if (scale < 0.2)
            scale = 0.2;
        if (scale > 10)
            scale = 10;
        var el = this.scalableEl;
        el.attr({
            transform: el.data('origTransform').local + (el.data('origTransform').local ? "S" : "s") + scale
        });
        this.container.placeControls();
        _super.prototype.onDragmove.call(this, dx, dy, x, y, event);
        this.container.getControllableOptions().onchange(null, null, null, null, scale);
    };
    ScaleControl.prototype.onDragstart = function (x, y, event) {
        this.scalableEl.data('origTransform', this.scalableEl.transform());
        _super.prototype.onDragstart.call(this, x, y, event);
        this.container.getControllableOptions().ondragstart();
    };
    return ScaleControl;
})(Control);
var RotationControl = (function (_super) {
    __extends(RotationControl, _super);
    function RotationControl() {
        _super.apply(this, arguments);
        this.type = 'RotationControl';
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
     * @param event
     */
    RotationControl.prototype.onDragmove = function (dx, dy, x, y, event) {
        var el = this.rotatableEl;
        var scale = Math.round(this.container.getControllableOptions().getZoomRatio() * 100) / 100;
        var scalableBBox = this.container.scalableGroup.group.getBBox();
        var p1 = this.element.getBBox();
        var p2 = { x: p1.x + dx * scale, y: p1.y + dy * scale };
        var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        var rotate = 'rotate(' + angle + ' ' + scalableBBox.cx + ' ' + scalableBBox.cy + ')';
        var matrix = el.data('origTransform').localMatrix.rotate(-el.attr('angle'), scalableBBox.cx, scalableBBox.cy);
        matrix.rotate(angle, scalableBBox.cx, scalableBBox.cy);
        el.attr({
            transform: matrix,
            angle: angle
        });
        _super.prototype.onDragmove.call(this, dx, dy, x, y, event);
        this.container.getControllableOptions().onchange(null, null, null, angle, null);
    };
    RotationControl.prototype.onDragstart = function (x, y, event) {
        var el = this.rotatableEl;
        el.data('origTransform', el.transform());
        this.container.getControllableOptions().ondragstart();
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