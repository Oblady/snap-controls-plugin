///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="controls.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
        this.group.drag(altMoveDrag, altStartDrag, function () {
        });
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
//# sourceMappingURL=classes.js.map