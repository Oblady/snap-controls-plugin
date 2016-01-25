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
                var localmatrix = this.element.transform().localMatrix, invert = localmatrix.invert(), absX = x / (localmatrix.a || 1), absY = y / (localmatrix.d || 1), invertX = invert.e || 0, invertY = invert.f || 0;
                //cancel the previous translation then do the new one
                this.element.attr({ transform: localmatrix.translate(invertX, invertY).translate(absX, absY) });
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
                var bbox = this.element.getBBox(), width = bbox.width, scaleX = (this.element.transform().localMatrix.a || 1), absWidth = width / scaleX, newScaleX = w / (absWidth || 1);
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
                var bbox = this.element.getBBox(), height = bbox.height, scaleY = (this.element.transform().localMatrix.d || 1), absHeight = height / scaleY, newScaleY = h / (absHeight || 1);
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
        event.preventDefault();
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
        event.preventDefault();
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
        event.preventDefault();
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
        event.preventDefault();
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
///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="controls.ts" />
var Matrix = Snap.Matrix;
var GroupPrototype = (function () {
    function GroupPrototype(options, paper, groupClass, snapGroup) {
        this.options = options;
        this.init(paper, groupClass, snapGroup);
    }
    GroupPrototype.prototype.init = function (paper, groupClass, snapGroup) {
        this.paper = paper;
        this.group = snapGroup || this.paper.group();
        this.group.paper = paper;
        this.group.addClass(groupClass);
    };
    GroupPrototype.prototype.append = function (element) {
        this.group.append(element);
    };
    GroupPrototype.prototype.appendGroup = function (element) {
        this.group.append(element.group);
    };
    GroupPrototype.prototype.getControllableOptions = function () {
        return this.options;
    };
    return GroupPrototype;
})();
;
/**
 *
 * @param paper
 * @constructor
 */
var ScalableGroup = (function (_super) {
    __extends(ScalableGroup, _super);
    function ScalableGroup(options, paper, SnapGroup) {
        _super.call(this, options, paper, 'elementScalable', SnapGroup);
        this.options = options;
        var self = this;
        var altMoveDrag = function (xxdx, xxdy, ax, ay, ev) {
            var container = this.parent();
            if (!container.paper) {
                return;
            }
            var cursorPoint = container.getCursorPoint(ax, ay);
            var pt = container.paper.node.createSVGPoint();
            pt.x = cursorPoint.x - container.data('op').x;
            pt.y = cursorPoint.y - container.data('op').y;
            var localPt = container.globalToLocal(pt);
            var initialMtx = container.transform().localMatrix.clone();
            if (container.type == 'svg') {
                container.attr({ 'x': localPt.x });
                container.attr({ 'y': localPt.y });
            }
            container.transform(container.data('ot').toTransformString() + "t" + [localPt.x, localPt.y]);
            var mtx = container.transform().localMatrix.clone();
            self.getControllableOptions().onchange(self.group, initialMtx, mtx, null, null);
        };
        var altStartDrag = function (x, y, ev) {
            var container = this.parent();
            container.data('ibb', container.getBBox());
            container.data('op', container.getCursorPoint(x, y));
            container.data('ot', container.transform().localMatrix);
        };
        this.group.drag(altMoveDrag, altStartDrag, function () { });
    }
    return ScalableGroup;
})(GroupPrototype);
/**
 *
 * @param paper
 * @constructor
 */
var ControlsGroup = (function (_super) {
    __extends(ControlsGroup, _super);
    function ControlsGroup(options, paper, SnapGroup) {
        _super.call(this, options, paper, 'elementControls', SnapGroup);
        this.options = options;
        this.controls = [];
        this.drawBorder();
    }
    ControlsGroup.prototype.drawBorder = function () {
        var rect = this.group.select('.controlsBorder');
        if (!rect) {
            rect = this.group.paper.rect(0, 0, 0, 0);
            rect.toggleClass("controlsBorder", true);
            this.group.append(rect);
        }
    };
    ControlsGroup.prototype.cleanControls = function () {
        this.controls = [];
        var els = this.group.selectAll('*');
        for (var i = 0; i < els.length; i++) {
            els[i].remove();
        }
        this.drawBorder();
    };
    ControlsGroup.prototype.addControl = function (position, control) {
        this.controls.push({ position: position, control: control });
        return this;
    };
    ControlsGroup.prototype.setControlsVisibility = function (visibility) {
        for (var i = 0; i < this.controls.length; i++) {
            this.controls[i].control.toggleVisibility(visibility);
        }
        var opacity = (visibility) ? 1 : 0;
        this.group.attr({ opacity: opacity });
    };
    return ControlsGroup;
})(GroupPrototype);
/**
 *
 * @param paper
 * @param snapGroup
 * @constructor
 */
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(options, paper, snapGroup) {
        _super.call(this, options, paper, 'elementContainer', snapGroup);
        this.options = options;
        var self = this;
        this.group.mousedown(function () {
            self.options.onselect(this);
            self.placeControls();
        });
    }
    Container.prototype.setScalableGroup = function (scalable) {
        this.scalableGroup = scalable;
        this.appendGroup(scalable);
        return this;
    };
    Container.prototype.setControlsGroup = function (controls) {
        this.controlsGroup = controls;
        this.appendGroup(controls);
        return this;
    };
    Container.prototype.setOriginalGroup = function (originalGroup) {
        this.originalGroup = originalGroup;
    };
    Container.prototype.getOriginalGroup = function () {
        return this.originalGroup;
    };
    Container.prototype.hideControls = function () {
        this.options.onunselect(this.group);
        this.controlsGroup.setControlsVisibility(false);
    };
    /**
     * Sets the controls position and size
     */
    Container.prototype.placeControls = function () {
        var x, y, rotationControlOffset, middle, bottom, top, left, right, pos, control, container, controls, border, bbox;
        container = this;
        controls = this.controlsGroup.controls;
        bbox = this.scalableGroup.group.getBBox();
        container.controlsGroup.setControlsVisibility(true);
        border = container.controlsGroup.group.select('.controlsBorder');
        border.attr({ x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height });
        for (var i = 0; i < controls.length; i++) {
            pos = controls[i].position;
            control = controls[i].control;
            control.setWidth(this.getControllableOptions().getControlWidth());
            control.setHeight(this.getControllableOptions().getControlHeight());
            x = 0;
            y = 0;
            rotationControlOffset = this.getControllableOptions().getRotateControlOffset();
            middle = bbox.x + bbox.width / 2 - (control.element.type === 'circle' ? 0 : (control.getWidth() / 2));
            bottom = bbox.y + bbox.height + ((control.type === 'RotationControl') ? rotationControlOffset : 0);
            top = bbox.y - control.getHeight() - ((control.type === 'RotationControl') ? rotationControlOffset : 0);
            left = bbox.x;
            right = bbox.x + bbox.width;
            switch (pos) {
                case ControlPositions.tl:
                    x = left;
                    y = top;
                    break;
                case ControlPositions.tr:
                    x = right;
                    y = top;
                    break;
                case ControlPositions.bl:
                    x = left;
                    y = bottom;
                    break;
                case ControlPositions.br:
                    x = right;
                    y = bottom;
                    break;
                case ControlPositions.mt:
                    x = middle;
                    y = top;
                    break;
                case ControlPositions.mb:
                    x = middle;
                    y = bottom;
                    break;
            }
            control.setPosition(x, y);
        }
        this.options.onselect(this.group);
    };
    Container.prototype.reload = function () {
        //initialize();
    };
    return Container;
})(GroupPrototype);
///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="controls.ts" />
///<reference path="classes.ts" />
/**
 * Plugin for Snap SVG.
 * Adds methods to the Element class to get anchor controls and coordinates of corners.
 * @author Oblady
 */
Snap.plugin(function (Snap, Element, Paper, global) {
    Element.prototype.globalToLocal = function (globalPoint) {
        /**
         * @see https://groups.google.com/forum/#!topic/jointjs/qIKIiJCEClI and https://www.chromestatus.com/feature/5736166087196672
         * Act as a polyfill for SVGGraphicsElement.getTransformToElement as chrome deprecated it in v48.
         */
        var globalToLocal = this.paper.node.getScreenCTM().inverse().multiply(this.getScreenCTM()).inverse();
        globalToLocal.e = globalToLocal.f = 0;
        return globalPoint.matrixTransform(globalToLocal);
    };
    Element.prototype.getCursorPoint = function (x, y) {
        if (!this.paper)
            return;
        var svgel = document.createElement('svg');
        var pt = this.paper.node.createSVGPoint();
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(this.paper.node.getScreenCTM().inverse());
    };
    /**
     * Draws corners of an object's bounding box.
     */
    Element.prototype.drawControls = function () {
        var container = this.data('containerObject');
        container.placeControls();
    };
    Element.prototype.hideControls = function () {
        var container = this.data('containerObject');
        if (container) {
            container.hideControls();
        }
    },
        /**
         * Plugin initialisation
         * Creates a new container group
         * Adds a new scalable group to the container
         * Adds a new controls group to the container
         * Adds the current element to the scalable group
         * Adds controls to the controls group
         */
        Element.prototype.controllable = function (options) {
            var container = null;
            var self = this;
            options = options || {};
            options.onselect = options.onselect || function () { };
            options.onunselect = options.onunselect || function () { };
            options.onchange = options.onchange || function () { };
            options.ondragstart = options.ondragstart || function () { };
            options.onzoom = options.onzoom || function () {
                //TODO: call placeControls() for each container
            };
            options.getZoomRatio = options.getZoomRatio || function () { return 1; };
            options.getRotateControl = options.getRotateControl || function () {
                var item = self.paper.circle(0, 0, 10);
                item.toggleClass('rotationControl', true);
                return item;
            };
            options.getScaleControl = options.getScaleControl || function () {
                var item = self.paper.rect(0, 0, 10);
                item.toggleClass('scaleControl', true);
                return item;
            };
            options.getControlWidth = options.getControlWidth || function () {
                return 20 / (options.getZoomRatio());
            };
            options.getControlHeight = options.getControlHeight || function () {
                return 20 / (options.getZoomRatio());
            };
            options.getRotateControlOffset = options.getRotateControlOffset || function () {
                return options.getControlHeight();
            };
            if (this.hasClass('elementContainer')) {
                var scalable = new ScalableGroup(options, this.paper, Snap(this.node.children[0])), controls = new ControlsGroup(options, this.paper, Snap(this.node.children[1]));
                container = new Container(options, this.paper, this);
                container.setScalableGroup(scalable);
                container.setControlsGroup(controls);
                container.setOriginalGroup(Snap(scalable.group.node.children[0]));
                container.controlsGroup.cleanControls();
            }
            else {
                var scalable = new ScalableGroup(options, this.paper), controls = new ControlsGroup(options, this.paper);
                container = new Container(options, this.paper);
                this.attr({ 'data-controllable': true });
                scalable.append(this);
                container.setScalableGroup(scalable);
                container.setControlsGroup(controls);
                container.setOriginalGroup(this);
            }
            controls.addControl(ControlPositions.br, new ScaleControl(container, container.group, options.getScaleControl()));
            controls.addControl(ControlPositions.mt, new RotationControl(container, container.group, options.getRotateControl()));
            container.group.data('containerObject', container);
            controls.group.data('containerObject', container);
            scalable.group.data('containerObject', container);
            this.data('containerObject', container);
            return container;
        },
        /**
         * Plugin desactivation
         * Removes the elementControls group
         */
        Element.prototype.uncontrollable = function () {
            //this._control.remove();
            //this._control = null;
        },
        Snap.Control = Control;
    Snap.Container = Container;
});
//# sourceMappingURL=snap.controls.plugin.js.map