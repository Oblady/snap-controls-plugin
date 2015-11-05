///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="controls.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
//# sourceMappingURL=classes.js.map