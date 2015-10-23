var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GroupPrototype = (function () {
    function GroupPrototype(paper, groupClass, onSelection, snapGroup) {
        this.init(paper, groupClass, function () { }, snapGroup);
    }
    GroupPrototype.prototype.init = function (paper, groupClass, onSelection, snapGroup) {
        this.paper = paper;
        this.group = snapGroup || this.paper.group();
        this.group.addClass(groupClass);
        this.group.mousedown(onSelection);
    };
    GroupPrototype.prototype.append = function (element) {
        this.group.append(element);
    };
    GroupPrototype.prototype.appendGroup = function (element) {
        this.group.append(element.group);
    };
    return GroupPrototype;
})();
;
/**
 *
 * @param paper
 * @constructor
 */
var Scalable = (function (_super) {
    __extends(Scalable, _super);
    function Scalable(paper, SnapGroup) {
        _super.call(this, paper, 'elementScalable', function () { }, SnapGroup);
    }
    return Scalable;
})(GroupPrototype);
/**
 *
 * @param paper
 * @constructor
 */
var Controls = (function (_super) {
    __extends(Controls, _super);
    function Controls(paper, SnapGroup) {
        _super.call(this, paper, 'elementControls', function () { }, SnapGroup);
    }
    return Controls;
})(GroupPrototype);
/**
 *
 * @param paper
 * @param onSelection
 * @param snapGroup
 * @constructor
 */
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(paper, onSelection, snapGroup) {
        _super.call(this, paper, 'elementContainer', onSelection, snapGroup);
        var altMoveDrag = function (xxdx, xxdy, ax, ay) {
            if (!this.paper) {
                return;
            }
            var tdx, tdy;
            var cursorPoint = this.getCursorPoint(ax, ay);
            var pt = this.paper.node.createSVGPoint();
            pt.x = cursorPoint.x - this.data('op').x;
            pt.y = cursorPoint.y - this.data('op').y;
            var localPt = this.globalToLocal(pt);
            var initialMtx = this.transform().localMatrix.clone();
            if (this.type == 'svg') {
                this.attr('x', localPt.x);
                this.attr('y', localPt.y);
            }
            this.transform(this.data('ot').toTransformString() + "t" + [localPt.x, localPt.y]);
            if (!!this.configurateur)
                this.configurateur.removeAllBorders();
            this.addBorder();
            var mtx = this.transform().localMatrix.clone();
            var diffX = mtx.e - initialMtx.e;
            var diffY = initialMtx.f - mtx.f;
            var others = this.getLinkedElements();
            for (var j = 0; j < others.length; j++) {
                var item = others[j];
                var el = Snap(item);
                var initMtx = el.transform().localMatrix;
                initMtx.e = initMtx.e - diffX;
                initMtx.f = initMtx.f - diffY;
                if (el.type == 'svg') {
                    el.attr({ 'x': initMtx.e });
                    el.attr({ 'y': initMtx.f });
                }
                el.transform(initMtx.toTransformString());
            }
        };
        var altStartDrag = function (x, y, ev) {
            this.data('ibb', this.getBBox());
            this.data('op', this.getCursorPoint(x, y));
            this.data('ot', this.transform().localMatrix);
        };
        this.group.drag(altMoveDrag, altStartDrag, function () { });
    }
    Container.prototype.reload = function () {
        //initialize();
    };
    Container.prototype.onMouseDown = function () {
        //this.drawControls();
        !!this.onSelection && this.onSelection();
    };
    return Container;
})(GroupPrototype);
///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="classes.ts" />
/**
 * Plugin for Snap SVG.
 * Adds methods to the Element class to get anchor controls and coordinates of corners.
 * Adaptation of fabric.js (www.fabricjs.com) by Printio (Juriy Zaytsev, Maxim Chernyak) under the MIT Licence.
 * @author Thibaut Selingue <thibaut@oblady.fr>
 */
Snap.plugin(function (Snap, Element, Paper, global) {
    /**
     * Sets corner position coordinates based on current angle, width and height.
     * If currentWidth and currentHeight are undefined and the element is rotated, calculated coords will be invalid.
     * @param angle
     * @param currentWidth optional
     * @param currentHeight optional
     * @return {Element} thisArg
     * @chainable
     */
    Element.prototype['setOCoords'] = function (angle, currentWidth, currentHeight) {
        if (isNaN(angle)) {
            angle = 0;
            throw "Error: angle is not a valid number";
        }
        var theta = Snap.rad(angle), bbox = this.getBBox();
        currentWidth = currentWidth || bbox.width; //width without rotation
        currentHeight = currentHeight || bbox.height; //height without rotation
        // If width is negative, make positive. Fixes path selection issue
        if (currentWidth < 0) {
            currentWidth = Math.abs(currentWidth);
        }
        if (currentHeight < 0) {
            currentHeight = Math.abs(currentHeight);
        }
        var _hypotenuse = Math.sqrt(Math.pow(currentWidth / 2, 2) +
            Math.pow(currentHeight / 2, 2)), _angle = Math.atan(isFinite(currentHeight / currentWidth)
            ? currentHeight / currentWidth
            : 0), 
        // offset added for rotate and scale actions
        offsetX = Math.cos(_angle + theta) * _hypotenuse, offsetY = Math.sin(_angle + theta) * _hypotenuse, sinTh = Math.sin(theta), cosTh = Math.cos(theta), wh = new Snap.Point(currentWidth, currentHeight), tl = new Snap.Point(bbox.cx - offsetX, bbox.cy - offsetY), tr = new Snap.Point(tl.x + (wh.x * cosTh), tl.y + (wh.x * sinTh)), bl = new Snap.Point(tl.x - (wh.y * sinTh), tl.y + (wh.y * cosTh)), mt = new Snap.Point(tl.x + (wh.x / 2 * cosTh), tl.y + (wh.x / 2 * sinTh)), br = new Snap.Point(tr.x - (wh.y * sinTh), tr.y + (wh.y * cosTh)), ml = new Snap.Point(tl.x - (wh.y / 2 * sinTh), tl.y + (wh.y / 2 * cosTh)), mr = new Snap.Point(tr.x - (wh.y / 2 * sinTh), tr.y + (wh.y / 2 * cosTh)), mb = new Snap.Point(bl.x + (wh.x / 2 * cosTh), bl.y + (wh.x / 2 * sinTh)), mtr = new Snap.Point(mt.x, mt.y);
        this.oCoords = {
            // corners
            tl: tl, tr: tr, br: br, bl: bl,
            // middle
            ml: ml, mt: mt, mr: mr, mb: mb,
            // rotating point
            mtr: mtr
        };
        this.originX = 'left';
        this.originY = 'top';
        // set coordinates of the draggable boxes in the corners used to scale/rotate the image
        this._setCornerCoords && this._setCornerCoords(angle);
        return this;
    };
    Element.prototype.getCursorPoint = function (x, y) {
        if (!this.paper)
            return;
        var pt = new SVGSVGElement().createSVGPoint();
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(this.paper.node.getScreenCTM().inverse());
    };
    /**
     * Sets the coordinates of the draggable boxes in the corners of
     * the image used to scale/rotate it.
     * Used by setOCoords.
     * @private
     */
    Element.prototype._setCornerCoords = function (angle) {
        if (!this.controlOptions) {
            this._setDefaultOptions();
        }
        var coords = this.oCoords, theta = Snap.rad(angle), newTheta = Snap.rad(45 - angle), cornerHypotenuse = Math.sqrt(2 * Math.pow(this.controlOptions.cornerSize, 2)) / 2, cosHalfOffset = cornerHypotenuse * Math.cos(newTheta), sinHalfOffset = cornerHypotenuse * Math.sin(newTheta), sinTh = Math.sin(theta), cosTh = Math.cos(theta);
        coords.tl.corner = {
            tl: {
                x: coords.tl.x - sinHalfOffset,
                y: coords.tl.y - cosHalfOffset
            },
            tr: {
                x: coords.tl.x + cosHalfOffset,
                y: coords.tl.y - sinHalfOffset
            },
            bl: {
                x: coords.tl.x - cosHalfOffset,
                y: coords.tl.y + sinHalfOffset
            },
            br: {
                x: coords.tl.x + sinHalfOffset,
                y: coords.tl.y + cosHalfOffset
            }
        };
        coords.tr.corner = {
            tl: {
                x: coords.tr.x - sinHalfOffset,
                y: coords.tr.y - cosHalfOffset
            },
            tr: {
                x: coords.tr.x + cosHalfOffset,
                y: coords.tr.y - sinHalfOffset
            },
            br: {
                x: coords.tr.x + sinHalfOffset,
                y: coords.tr.y + cosHalfOffset
            },
            bl: {
                x: coords.tr.x - cosHalfOffset,
                y: coords.tr.y + sinHalfOffset
            }
        };
        coords.bl.corner = {
            tl: {
                x: coords.bl.x - sinHalfOffset,
                y: coords.bl.y - cosHalfOffset
            },
            bl: {
                x: coords.bl.x - cosHalfOffset,
                y: coords.bl.y + sinHalfOffset
            },
            br: {
                x: coords.bl.x + sinHalfOffset,
                y: coords.bl.y + cosHalfOffset
            },
            tr: {
                x: coords.bl.x + cosHalfOffset,
                y: coords.bl.y - sinHalfOffset
            }
        };
        coords.br.corner = {
            tr: {
                x: coords.br.x + cosHalfOffset,
                y: coords.br.y - sinHalfOffset
            },
            bl: {
                x: coords.br.x - cosHalfOffset,
                y: coords.br.y + sinHalfOffset
            },
            br: {
                x: coords.br.x + sinHalfOffset,
                y: coords.br.y + cosHalfOffset
            },
            tl: {
                x: coords.br.x - sinHalfOffset,
                y: coords.br.y - cosHalfOffset
            }
        };
        coords.ml.corner = {
            tl: {
                x: coords.ml.x - sinHalfOffset,
                y: coords.ml.y - cosHalfOffset
            },
            tr: {
                x: coords.ml.x + cosHalfOffset,
                y: coords.ml.y - sinHalfOffset
            },
            bl: {
                x: coords.ml.x - cosHalfOffset,
                y: coords.ml.y + sinHalfOffset
            },
            br: {
                x: coords.ml.x + sinHalfOffset,
                y: coords.ml.y + cosHalfOffset
            }
        };
        coords.mt.corner = {
            tl: {
                x: coords.mt.x - sinHalfOffset,
                y: coords.mt.y - cosHalfOffset
            },
            tr: {
                x: coords.mt.x + cosHalfOffset,
                y: coords.mt.y - sinHalfOffset
            },
            bl: {
                x: coords.mt.x - cosHalfOffset,
                y: coords.mt.y + sinHalfOffset
            },
            br: {
                x: coords.mt.x + sinHalfOffset,
                y: coords.mt.y + cosHalfOffset
            }
        };
        coords.mr.corner = {
            tl: {
                x: coords.mr.x - sinHalfOffset,
                y: coords.mr.y - cosHalfOffset
            },
            tr: {
                x: coords.mr.x + cosHalfOffset,
                y: coords.mr.y - sinHalfOffset
            },
            bl: {
                x: coords.mr.x - cosHalfOffset,
                y: coords.mr.y + sinHalfOffset
            },
            br: {
                x: coords.mr.x + sinHalfOffset,
                y: coords.mr.y + cosHalfOffset
            }
        };
        coords.mb.corner = {
            tl: {
                x: coords.mb.x - sinHalfOffset,
                y: coords.mb.y - cosHalfOffset
            },
            tr: {
                x: coords.mb.x + cosHalfOffset,
                y: coords.mb.y - sinHalfOffset
            },
            bl: {
                x: coords.mb.x - cosHalfOffset,
                y: coords.mb.y + sinHalfOffset
            },
            br: {
                x: coords.mb.x + sinHalfOffset,
                y: coords.mb.y + cosHalfOffset
            }
        };
        coords.mtr.corner = {
            tl: {
                x: coords.mtr.x - sinHalfOffset + (sinTh * this.controlOptions.rotatingPointOffset),
                y: coords.mtr.y - cosHalfOffset - (cosTh * this.controlOptions.rotatingPointOffset)
            },
            tr: {
                x: coords.mtr.x + cosHalfOffset + (sinTh * this.controlOptions.rotatingPointOffset),
                y: coords.mtr.y - sinHalfOffset - (cosTh * this.controlOptions.rotatingPointOffset)
            },
            bl: {
                x: coords.mtr.x - cosHalfOffset + (sinTh * this.controlOptions.rotatingPointOffset),
                y: coords.mtr.y + sinHalfOffset - (cosTh * this.controlOptions.rotatingPointOffset)
            },
            br: {
                x: coords.mtr.x + sinHalfOffset + (sinTh * this.controlOptions.rotatingPointOffset),
                y: coords.mtr.y + cosHalfOffset - (cosTh * this.controlOptions.rotatingPointOffset)
            }
        };
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
    Element.prototype.drawControls = function (width, height, options) {
        if (!options) {
            if (!this.controlOptions) {
                this._setDefaultOptions();
            }
        }
        else {
            this.controlOptions = options;
        }
        if (!this.controlOptions.hasControls)
            return this;
        var size = this.controlOptions.cornerSize, size2 = size / 2, strokeWidth2 = ~~(this.controlOptions.strokeWidth / 2), // half strokeWidth rounded down
        left = 0, top = 0, scaleX = this.node.transform.baseVal.getItem(0).matrix.a, scaleY = this.node.transform.baseVal.getItem(0).matrix.d, paddingX = this.controlOptions.padding / scaleX, paddingY = this.controlOptions.padding / scaleY, scaleOffsetY = size2 / scaleX, scaleOffsetX = size2 / scaleY, scaleOffsetSizeX = (size2 - size) / scaleX, scaleOffsetSizeY = (size2 - size) / scaleY, fillRect = !this.controlOptions.transparentCorners;
        //ctx.lineWidth = 1 / Math.max(this.scaleX, this.scaleY);
        //
        //ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        //ctx.strokeStyle = ctx.fillStyle = this.cornerColor;
        // top-left
        this._drawControl('tl', fillRect, left - scaleOffsetX - strokeWidth2 - paddingX, top - scaleOffsetY - strokeWidth2 - paddingY);
        // top-right
        this._drawControl('tr', fillRect, left + width - scaleOffsetX + strokeWidth2 + paddingX, top - scaleOffsetY - strokeWidth2 - paddingY);
        // bottom-left
        this._drawControl('bl', fillRect, left - scaleOffsetX - strokeWidth2 - paddingX, top + height + scaleOffsetSizeY + strokeWidth2 + paddingY);
        // bottom-right
        this._drawControl('br', fillRect, left + width + scaleOffsetSizeX + strokeWidth2 + paddingX, top + height + scaleOffsetSizeY + strokeWidth2 + paddingY);
        if (!this.controlOptions.lockUniScaling) {
            // middle-top
            this._drawControl('mt', fillRect, left + width / 2 - scaleOffsetX, top - scaleOffsetY - strokeWidth2 - paddingY);
            // middle-bottom
            this._drawControl('mb', fillRect, left + width / 2 - scaleOffsetX, top + height + scaleOffsetSizeY + strokeWidth2 + paddingY);
            // middle-right
            this._drawControl('mr', fillRect, left + width + scaleOffsetSizeX + strokeWidth2 + paddingX, top + height / 2 - scaleOffsetY);
            // middle-left
            this._drawControl('ml', fillRect, left - scaleOffsetX - strokeWidth2 - paddingX, top + height / 2 - scaleOffsetY);
        }
        // middle-top-rotate
        if (this.controlOptions.hasRotatingPoint) {
            this._drawControl('mtr', fillRect, left + width / 2 - scaleOffsetX, this.flipY
                ? (top + height + (this.controlOptions.rotatingPointOffset / scaleY) - this.controlOptions.cornerSize / scaleX / 2 + strokeWidth2 + paddingY)
                : (top - (this.controlOptions.rotatingPointOffset / scaleY) - this.controlOptions.cornerSize / scaleY / 2 - strokeWidth2 - paddingY));
        }
        //ctx.restore();
        return this;
    };
    /**
     * @private
     */
    Element.prototype._drawControl = function (control, strokeOrFillRect, left, top) {
        var sizeX = this.controlOptions.cornerSize / this.node.transform.baseVal.getItem(0).matrix.a, sizeY = this.controlOptions.cornerSize / this.node.transform.baseVal.getItem(0).matrix.d;
        if (this.isControlVisible(control)) {
            this._removeControl(control);
            new Snap.Control(control, left, top, sizeX, sizeY, this);
        }
    };
    /**
     *
     * @param controlName
     * @private
     */
    Element.prototype._removeControl = function (controlName) {
        if (!this._controls) {
            this._controls = {};
        }
        if (!!this._controls[controlName]) {
            this._controls[controlName].rect.remove();
        }
        this._controls[controlName] = null;
    };
    /**
     * Returns true if the specified control is visible, false otherwise.
     * @param {String} controlName The name of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @returns {Boolean} true if the specified control is visible, false otherwise
     */
    Element.prototype.isControlVisible = function (controlName) {
        return this._getControlsVisibility()[controlName];
    };
    /**
     * Sets the visibility of the specified control.
     * @param {String} controlName The name of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @param {Boolean} visible true to set the specified control visible, false otherwise
     * @return {fabric.Object} thisArg
     * @chainable
     */
    Element.prototype.setControlVisible = function (controlName, visible) {
        this._getControlsVisibility()[controlName] = visible;
        return this;
    };
    /**
     * Sets the visibility state of object controls.
     * @param {Object} [options] Options object
     * @param {Boolean} [options.bl] true to enable the bottom-left control, false to disable it
     * @param {Boolean} [options.br] true to enable the bottom-right control, false to disable it
     * @param {Boolean} [options.mb] true to enable the middle-bottom control, false to disable it
     * @param {Boolean} [options.ml] true to enable the middle-left control, false to disable it
     * @param {Boolean} [options.mr] true to enable the middle-right control, false to disable it
     * @param {Boolean} [options.mt] true to enable the middle-top control, false to disable it
     * @param {Boolean} [options.tl] true to enable the top-left control, false to disable it
     * @param {Boolean} [options.tr] true to enable the top-right control, false to disable it
     * @param {Boolean} [options.mtr] true to enable the middle-top-rotate control, false to disable it
     * @return {fabric.Object} thisArg
     * @chainable
     */
    Element.prototype.setControlsVisibility = function (options) {
        options || (options = {});
        for (var p in options) {
            this.setControlVisible(p, options[p]);
        }
        return this;
    };
    /**
     * Returns the instance of the control visibility set for this object.
     * @private
     * @returns {Object}
     */
    Element.prototype._getControlsVisibility = function () {
        if (!this._controlsVisibility) {
            this._controlsVisibility = {
                tl: true,
                tr: true,
                br: true,
                bl: true,
                ml: true,
                mt: true,
                mr: true,
                mb: true,
                mtr: true
            };
        }
        return this._controlsVisibility;
    };
    /**
     * Deletes all the controls
     * @private
     */
    Element.prototype._removeControls = function () {
        for (var key in this._controls) {
            if (this._controls.hasOwnProperty(key)) {
                this._removeControl(key);
            }
        }
    };
    /**
     *
     * @private
     */
    Element.prototype._setDefaultOptions = function () {
        this.controlOptions = {
            padding: 0,
            transparentCorners: false,
            cornerSize: 40,
            strokeWidth: 2,
            hasControls: true,
            lockUniScaling: false,
            hasRotatingPoint: false,
            rotatingPointOffset: 10,
            lockScalingX: false,
            lockScalingY: false,
            lockScalingFlip: false
        };
    };
    Element.prototype.getCoords = function () {
        var res = null;
        if (!!this.node) {
            res = {
                x: this.node.x ? (this.node.x.baseVal[0] ? this.node.x.baseVal[0].value : this.node.x.baseVal.value) : 0,
                y: this.node.y ? (this.node.y.baseVal[0] ? this.node.y.baseVal[0].value : this.node.y.baseVal.value) : 0,
                transformX: this.node.transform.baseVal.numberOfItems > 0 ? this.node.transform.baseVal.getItem(0).matrix.e : 0,
                transformY: this.node.transform.baseVal.numberOfItems > 0 ? this.node.transform.baseVal.getItem(0).matrix.f : 0,
                scaleX: this.node.transform.baseVal.numberOfItems > 0 ? this.node.transform.baseVal.getItem(0).matrix.a : 1,
                scaleY: this.node.transform.baseVal.numberOfItems > 0 ? this.node.transform.baseVal.getItem(0).matrix.d : 1
            };
        }
        return res;
    };
    /**
     * Translates the coordinates from origin to center coordinates (based on the object's dimensions)
     * @param {fabric.Point} point The point which corresponds to the originX and originY params
     * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
     * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
     * @return {fabric.Point}
     */
    Element.prototype.translateToCenterPoint = function (point, originX, originY) {
        var cx = point.x, cy = point.y, strokeWidth = this.stroke ? this.strokeWidth : 0;
        if (originX === 'left') {
            cx = point.x + (this.width + strokeWidth * this.scaleX) / 2;
        }
        else if (originX === 'right') {
            cx = point.x - (this.width + strokeWidth * this.scaleX) / 2;
        }
        if (originY === 'top') {
            cy = point.y + (this.height + strokeWidth * this.scaleY) / 2;
        }
        else if (originY === 'bottom') {
            cy = point.y - (this.height + strokeWidth * this.scaleY) / 2;
        }
        // Apply the reverse rotation to the point (it's already scaled properly)
        return fabric.util.rotatePoint(new fabric.Point(cx, cy), point, Snap.rad(this.angle));
    },
        /**
         * Translates the coordinates from center to origin coordinates (based on the object's dimensions)
         * @param {fabric.Point} point The point which corresponds to center of the object
         * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
         * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
         * @return {fabric.Point}
         */
        Element.prototype.translateToOriginPoint = function (center, originX, originY) {
            var x = center.x, y = center.y, strokeWidth = this.stroke ? this.strokeWidth : 0;
            // Get the point coordinates
            if (originX === 'left') {
                x = center.x - (this.width + strokeWidth * this.scaleX) / 2;
            }
            else if (originX === 'right') {
                x = center.x + (this.width + strokeWidth * this.scaleX) / 2;
            }
            if (originY === 'top') {
                y = center.y - (this.height + strokeWidth * this.scaleY) / 2;
            }
            else if (originY === 'bottom') {
                y = center.y + (this.height + strokeWidth * this.scaleY) / 2;
            }
            // Apply the rotation to the point (it's already scaled properly)
            return fabric.util.rotatePoint(new fabric.Point(x, y), center, Snap.rad(this.angle));
        },
        /**
         * Returns the real center coordinates of the object
         * @return {fabric.Point}
         */
        Element.prototype.getCenterPoint = function () {
            var coords = this.getCoords();
            var leftTop = new fabric.Point(coords.transformX, coords.transformY);
            return this.translateToCenterPoint(leftTop, this.originX, this.originY);
        },
        /**
         * Sets the position of the object taking into consideration the object's origin
         * @param {fabric.Point} point The new position of the object
         * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
         * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
         * @return {void}
        */
        Element.prototype.setPositionByOrigin = function (pos, originX, originY) {
            var center = this.translateToCenterPoint(pos, originX, originY), position = this.translateToOriginPoint(center, this.originX, this.originY);
            this.setTransformX(position.x);
            this.setTransformY(position.y);
        },
        /**
         * Plugin initialisation
         * Creates a new container group
         * Adds a new scalable group to the container
         * Adds a new controls group to the container
         * Adds the current element to the scalable group
         * Adds controls to the controls group
         */
        Element.prototype.controllable = function (onSelection) {
            var container = null;
            if (this.hasClass('elementContainer')) {
                var scalable = new Scalable(this.paper, Snap(this.node.children[0])), controls = new Controls(this.paper, Snap(this.node.children[1]));
                container = new Container(this.paper, onSelection, this);
                console.log('reload');
                //container = this;
                container.reload();
            }
            else {
                var scalable = new Scalable(this.paper), controls = new Controls(this.paper);
                container = new Container(this.paper, onSelection);
                scalable.append(this);
                container.appendGroup(scalable);
                container.appendGroup(controls);
            }
            return container;
        },
        Element.prototype.hideControls = function () {
            //TODO
        },
        /**
         * Plugin desactivation
         * Removes the elementControls group
         */
        Element.prototype.uncontrollable = function () {
            //this._control.remove();
            //this._control = null;
        },
        function Point(x, y) {
            this.x = x;
            this.y = y;
        };
    Snap.Point = fabric.Point;
    function Canvas() { }
    Canvas.prototype = {
        /**
         * @private
         */
        _getOriginFromCorner: function (target, corner) {
            var origin = {
                x: target.originX,
                y: target.originY
            };
            if (corner === 'ml' || corner === 'tl' || corner === 'bl') {
                origin.x = 'right';
            }
            else if (corner === 'mr' || corner === 'tr' || corner === 'br') {
                origin.x = 'left';
            }
            if (corner === 'tl' || corner === 'mt' || corner === 'tr') {
                origin.y = 'bottom';
            }
            else if (corner === 'bl' || corner === 'mb' || corner === 'br') {
                origin.y = 'top';
            }
            return origin;
        },
        getActionFromCorner: function (target, corner) {
            var action = 'drag';
            if (corner) {
                action = (corner === 'ml' || corner === 'mr')
                    ? 'scaleX'
                    : (corner === 'mt' || corner === 'mb')
                        ? 'scaleY'
                        : corner === 'mtr'
                            ? 'rotate'
                            : 'scale';
            }
            return action;
        },
        /**
         * @param {Snap.Object} target
         */
        setupCurrentTransform: function (dx, dy, x, y, target, corner, options) {
            if (!target) {
                return;
            }
            var action = this.getActionFromCorner(target, corner), origin = this._getOriginFromCorner(target, corner), coords = target.getCoords(), scaleX = coords.scaleX, scaleY = coords.scaleY, left = coords.transformX, top = coords.transformY;
            console.log(target, scaleX);
            console.log(corner, origin);
            this._currentTransform = {
                options: options,
                target: target,
                action: action,
                scaleX: scaleX,
                scaleY: scaleY,
                offsetX: dx,
                offsetY: dy,
                originX: origin.x,
                originY: origin.y,
                ex: x,
                ey: y,
                left: left,
                top: top,
                theta: Snap.rad(target.angle),
                width: parseFloat(target.attr('initialwidth')) * scaleX,
                height: parseFloat(target.attr('initialheight')) * scaleY,
                mouseXSign: 1,
                mouseYSign: 1
            };
            target.width = this._currentTransform.width;
            target.height = this._currentTransform.height;
            target.scaleX = this._currentTransform.scaleX;
            target.scaleY = this._currentTransform.scaleY;
            this._currentTransform.original = {
                options: options,
                left: left,
                top: top,
                scaleX: scaleX,
                scaleY: scaleY,
                originX: origin.x,
                originY: origin.y
            };
            //this._resetCurrentTransform(e);
        },
        /**
         * Translates object by "setting" its left/top
         * @private
         * @param {Number} x pointer's x coordinate
         * @param {Number} y pointer's y coordinate
         */
        _translateObject: function (x, y) {
            var target = this._currentTransform.target, options = this._currentTransform.options;
            if (!options.lockMovementX) {
                target.set('left', x - this._currentTransform.offsetX);
            }
            if (!options.lockMovementY) {
                target.set('top', y - this._currentTransform.offsetY);
            }
        },
        /**
         * Scales object by invoking its scaleX/scaleY methods
         * @private
         * @param {Number} x pointer's x coordinate
         * @param {Number} y pointer's y coordinate
         * @param {String} by Either 'x' or 'y' - specifies dimension constraint by which to scale an object.
         *                    When not provided, an object is scaled by both dimensions equally
         */
        _scaleObject: function (x, y, by) {
            var t = this._currentTransform, target = t.target, lockScalingX = t.options.lockScalingX, lockScalingY = t.options.lockScalingY, lockScalingFlip = t.options.lockScalingFlip;
            if (lockScalingX && lockScalingY) {
                return;
            }
            // Get the constraint point
            //TODO
            var constraintPosition = target.translateToOriginPoint(target.getCenterPoint(), t.originX, t.originY);
            console.log(constraintPosition);
            //localMouse = target.toLocalPoint(new fabric.Point(x, y), t.originX, t.originY);
            //this._setLocalMouse(localMouse, t);
            // Actually scale the object
            this._setObjectScale({ x: x, y: y }, t, lockScalingX, lockScalingY, by, lockScalingFlip);
            // Make sure the constraints apply
            //target.setPositionByOrigin(constraintPosition, t.originX, t.originY);
        },
        /**
         * Resets the current transform to its original values and chooses the type of resizing based on the event
         * @private
         * @param {Event} e Event object fired on mousemove
         */
        _resetCurrentTransform: function (e) {
            var t = this._currentTransform;
            t.target.set({
                scaleX: t.original.scaleX,
                scaleY: t.original.scaleY,
                left: t.original.left,
                top: t.original.top
            });
            if (this._shouldCenterTransform(e, t.target)) {
                if (t.action === 'rotate') {
                    this._setOriginToCenter(t.target);
                }
                else {
                    if (t.originX !== 'center') {
                        if (t.originX === 'right') {
                            t.mouseXSign = -1;
                        }
                        else {
                            t.mouseXSign = 1;
                        }
                    }
                    if (t.originY !== 'center') {
                        if (t.originY === 'bottom') {
                            t.mouseYSign = -1;
                        }
                        else {
                            t.mouseYSign = 1;
                        }
                    }
                    t.originX = 'center';
                    t.originY = 'center';
                }
            }
            else {
                t.originX = t.original.originX;
                t.originY = t.original.originY;
            }
        },
        /**
         * @private
         */
        _setObjectScale: function (localMouse, transform, lockScalingX, lockScalingY, by, lockScalingFlip) {
            var target = transform.target, forbidScalingX = false, forbidScalingY = false, strokeWidth = target.stroke ? target.strokeWidth : 0, options = transform.options;
            transform.newScaleX = localMouse.x / (target.width + strokeWidth / 2);
            transform.newScaleY = localMouse.y / (target.height + strokeWidth / 2);
            console.log(transform.newScaleX, transform.newScaleY);
            if (lockScalingFlip && transform.newScaleX <= 0 && transform.newScaleX < target.scaleX) {
                forbidScalingX = true;
            }
            if (lockScalingFlip && transform.newScaleY <= 0 && transform.newScaleY < target.scaleY) {
                forbidScalingY = true;
            }
            if (by === 'equally' && !lockScalingX && !lockScalingY) {
                forbidScalingX || forbidScalingY || this._scaleObjectEqually(localMouse, target, transform);
            }
            else if (!by) {
                forbidScalingX || lockScalingX || target.setScaleX(transform.newScaleX);
                forbidScalingY || lockScalingY || target.setScaleY(transform.newScaleY);
            }
            else if (by === 'x' && !options.lockUniScaling) {
                forbidScalingX || lockScalingX || target.setScaleX(transform.newScaleX);
            }
            else if (by === 'y' && !options.lockUniScaling) {
                forbidScalingY || lockScalingY || target.setScaleY(transform.newScaleY);
            }
            forbidScalingX || forbidScalingY || this._flipObject(transform, by);
        },
        /**
         * @private
         */
        _flipObject: function (transform) {
            if (transform.newScaleX < 0) {
                if (transform.originX === 'left') {
                    transform.originX = 'right';
                }
                else if (transform.originX === 'right') {
                    transform.originX = 'left';
                }
            }
            if (transform.newScaleY < 0) {
                if (transform.originY === 'top') {
                    transform.originY = 'bottom';
                }
                else if (transform.originY === 'bottom') {
                    transform.originY = 'top';
                }
            }
        },
        /**
         * @private
         */
        _performTransformAction: function (transform, pointer) {
            var x = pointer.x, y = pointer.y, target = transform.target, action = transform.action;
            if (action === 'rotate') {
                this._rotateObject(x, y);
            }
            else if (action === 'scale') {
                this._onScale(transform, x, y);
            }
            else if (action === 'scaleX') {
                this._scaleObject(x, y, 'x');
            }
            else if (action === 'scaleY') {
                this._scaleObject(x, y, 'y');
            }
            //else {
            //    this._translateObject(x, y);
            //    this._fire('moving', target, e);
            //    this.setCursor(this.moveCursor);
            //}
        },
        /**
         * @private
         */
        _onScale: function (transform, x, y) {
            transform.currentAction = 'scale';
            this._scaleObject(x, y, 'equally');
        },
        /**
         * @private
         */
        _scaleObjectEqually: function (localMouse, target, transform) {
            var dist = localMouse.y + localMouse.x, strokeWidth = target.stroke ? target.strokeWidth : 0, lastDist = (target.height + (strokeWidth / 2)) * transform.original.scaleY +
                (target.width + (strokeWidth / 2)) * transform.original.scaleX;
            // We use transform.scaleX/Y instead of target.scaleX/Y
            // because the object may have a min scale and we'll loose the proportions
            transform.newScaleX = transform.original.scaleX * dist / lastDist;
            transform.newScaleY = transform.original.scaleY * dist / lastDist;
            target.setScaleX(transform.newScaleX);
            target.setScaleY(transform.newScaleY);
        }
    };
    var canvas = new Canvas();
    function Control(controlName, left, top, width, height, el) {
        var self = this;
        function onMouseDown(e) {
        }
        /**
         *
         * @param dx x distance between the control and the mouse
         * @param dy y distance between the control and the mouse
         * @param x
         * @param y
         */
        function onMouseMove(dx, dy, x, y) {
            canvas.setupCurrentTransform(dx, dy, x, y, self.linkedTo, controlName, self.linkedTo.controlOptions);
            //console.log(canvas._currentTransform);
            canvas._performTransformAction(canvas._currentTransform, { x: x, y: y });
        }
        function onMouseUp(e) {
            //self.linkedTo.drag(); //TODO attacher la méthode de drag d'origine
        }
        this.linkedTo = el;
        var drag = self.linkedTo.drag;
        this.controlName = controlName;
        if (!!this.linkedTo && !el.paper) {
            throw "Error: this.linkedTo.paper is undefined";
        }
        this.rect = this.linkedTo.paper.rect(left, top, width, height);
        this.rect.appendTo(this.linkedTo);
        this.linkedTo._controls[controlName] = this;
        this.rect.drag(onMouseMove, onMouseDown, onMouseUp);
        this.rect.angle = 0;
        //this.rect.drag(null, onStart); //TODO brancher les méthodes de drag
        this.rect.mousedown(function () {
            self.linkedTo.undrag();
        });
        //this.rect.mousemove(onMouseMove);
        //this.rect.mouseup(onMouseUp);
        //var dragfunc = this.linkedTo.drag.clone();
    }
    Snap.Control = Control;
    Snap.Control.utils = {
        /**
         * Rotates `point` around `origin` with `radians`
         * @static
         * @memberOf fabric.util
         * @param {fabric.Point} The point to rotate
         * @param {fabric.Point} The origin of the rotation
         * @param {Number} The radians of the angle for the rotation
         * @return {fabric.Point} The new rotated point
         */
        rotatePoint: function (point, origin, radians) {
            var sin = Math.sin(radians), cos = Math.cos(radians);
            point.subtractEquals(origin);
            var rx = point.x * cos - point.y * sin, ry = point.x * sin + point.y * cos;
            return new fabric.Point(rx, ry).addEquals(origin);
        }
    };
    Snap.Container = Container;
    function merge(obj1, obj2) {
        for (var attrname in obj2) {
            obj1[attrname] = obj2[attrname];
        }
    }
    ;
});
