///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
/////<reference path="canvas.ts" />
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
            this.visibility != this.visibility;
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
///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="controls.ts" />
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
        var altMoveDrag = function (xxdx, xxdy, ax, ay, ev) {
            var container = this.parent();
            if (!container.paper) {
                return;
            }
            var tdx, tdy;
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
            var diffX = mtx.e - initialMtx.e;
            var diffY = initialMtx.f - mtx.f;
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
    Container.prototype.hideControls = function () {
        this.options.onunselect(this.group);
        this.controlsGroup.setControlsVisibility(false);
    };
    Container.prototype.placeControls = function () {
        var container = this;
        var controls = this.controlsGroup.controls;
        //var baseVal =  (this.node.transform.baseVal.length) ? this.node.transform.baseVal.getItem(0) : null;
        var bbox = this.scalableGroup.group.getBBox();
        container.controlsGroup.setControlsVisibility(true);
        var border = container.controlsGroup.group.select('.controlsBorder');
        border.attr({ x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height });
        for (var i = 0; i < controls.length; i++) {
            var pos = controls[i].position;
            var control = controls[i].control;
            var left;
            var top;
            var width = 10;
            switch (pos) {
                case ControlPositions.tl:
                    left = bbox.x - width;
                    top = bbox.y - width;
                    break;
                case ControlPositions.tr:
                    left = bbox.x + bbox.width;
                    top = bbox.y;
                    break;
                case ControlPositions.bl:
                    left = bbox.x;
                    top = bbox.y + bbox.height;
                    break;
                case ControlPositions.br:
                    left = bbox.x + bbox.width;
                    top = bbox.y + bbox.height;
                    break;
                case ControlPositions.mt:
                    left = bbox.x + bbox.width / 2;
                    top = bbox.y - width;
                    break;
            }
            control.setPosition(left, top);
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
 * Adaptation of fabric.js (www.fabricjs.com) by Printio (Juriy Zaytsev, Maxim Chernyak) under the MIT Licence.
 * @author Thibaut Selingue <thibaut@oblady.fr>
 */
Snap.plugin(function (Snap, Element, Paper, global) {
    Element.prototype.globalToLocal = function (globalPoint) {
        var globalToLocal = this.node.getTransformToElement(this.paper.node).inverse();
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
     * Requires public properties: width, height, scaleX, scaleY
     * @param width
     * @param height
     * @param {Object} options
     * @return {fabric.Object} thisArg
     * @chainable
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
            options = options || {};
            options.onselect = options.onselect || function () { };
            options.onunselect = options.onunselect || function () { };
            options.onchange = options.onchange || function () { };
            options.getZoomRatio = options.getZoomRatio || function () { console.log('default ratio'); return 1; };
            if (this.hasClass('elementContainer')) {
                var scalable = new ScalableGroup(options, this.paper, Snap(this.node.children[0])), controls = new ControlsGroup(options, this.paper, Snap(this.node.children[1]));
                container = new Container(options, this.paper, this);
                container.setScalableGroup(scalable);
                container.setControlsGroup(controls);
                container.controlsGroup.cleanControls();
            }
            else {
                var scalable = new ScalableGroup(options, this.paper), controls = new ControlsGroup(options, this.paper);
                container = new Container(options, this.paper);
                this.attr({ 'data-controllable': true });
                scalable.append(this);
                container.setScalableGroup(scalable);
                container.setControlsGroup(controls);
            }
            controls.addControl(ControlPositions.br, new ScaleControl(container, container.group));
            controls.addControl(ControlPositions.mt, new RotationControl(container, container.group));
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
        Snap.Point = fabric.Point;
    Snap.Control = Control;
    Snap.Container = Container;
});
//# sourceMappingURL=snap.controls.plugin.js.map