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
Snap.plugin(function (Snap, Element: Snap.Element, Paper: Snap.Paper, global) {

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
        if(isNaN(angle)) {
            angle = 0;
            throw "Error: angle is not a valid number";
        }
        var theta = Snap.rad(angle),
            bbox = this.getBBox();
        currentWidth = currentWidth || bbox.width; //width without rotation
        currentHeight = currentHeight || bbox.height; //height without rotation

        // If width is negative, make positive. Fixes path selection issue
        if (currentWidth < 0) {
            currentWidth = Math.abs(currentWidth);
        }
        if (currentHeight < 0) {
            currentHeight = Math.abs(currentHeight);
        }

        var _hypotenuse = Math.sqrt(
                Math.pow(currentWidth / 2, 2) +
                Math.pow(currentHeight / 2, 2)),

            _angle = Math.atan(
                isFinite(currentHeight / currentWidth)
                    ? currentHeight / currentWidth
                    : 0),

        // offset added for rotate and scale actions
            offsetX = Math.cos(_angle + theta) * _hypotenuse,
            offsetY = Math.sin(_angle + theta) * _hypotenuse,
            sinTh = Math.sin(theta),
            cosTh = Math.cos(theta),
            wh = new Snap.Point(currentWidth, currentHeight),
            tl = new Snap.Point(bbox.cx - offsetX, bbox.cy - offsetY),
            tr = new Snap.Point(tl.x + (wh.x * cosTh),   tl.y + (wh.x * sinTh)),
            bl = new Snap.Point(tl.x - (wh.y * sinTh),   tl.y + (wh.y * cosTh)),
            mt = new Snap.Point(tl.x + (wh.x/2 * cosTh), tl.y + (wh.x/2 * sinTh)),
            br  = new Snap.Point(tr.x - (wh.y * sinTh),   tr.y + (wh.y * cosTh)),
            ml  = new Snap.Point(tl.x - (wh.y/2 * sinTh), tl.y + (wh.y/2 * cosTh)),
            mr  = new Snap.Point(tr.x - (wh.y/2 * sinTh), tr.y + (wh.y/2 * cosTh)),
            mb  = new Snap.Point(bl.x + (wh.x/2 * cosTh), bl.y + (wh.x/2 * sinTh)),
            mtr = new Snap.Point(mt.x, mt.y);

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

    Element.prototype.globalToLocal = function (globalPoint: SVGPoint): SVGPoint {
        var globalToLocal = this.node.getTransformToElement(this.paper.node).inverse();
        globalToLocal.e = globalToLocal.f = 0;
        return globalPoint.matrixTransform(globalToLocal);
    };

    Element.prototype.getCursorPoint = function (x, y) {
        if (!this.paper) return;
        var svgel = document.createElement('svg');

        var pt= this.paper.node.createSVGPoint();
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
    Element.prototype._setCornerCoords = function(angle) {
        if(!this.controlOptions) {
            this._setDefaultOptions();
        }
        var coords = this.oCoords,
            theta = Snap.rad(angle),
            newTheta = Snap.rad(45 - angle),
            cornerHypotenuse = Math.sqrt(2 * Math.pow(this.controlOptions.cornerSize, 2)) / 2,
            cosHalfOffset = cornerHypotenuse * Math.cos(newTheta),
            sinHalfOffset = cornerHypotenuse * Math.sin(newTheta),
            sinTh = Math.sin(theta),
            cosTh = Math.cos(theta);

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
    Element.prototype.drawControls = function() {
        var container: Container  = this.data('containerObject');
		container.placeControls();
    };


    /**
     *
     * @param controlName
     * @private
     */
    Element.prototype._removeControl = function (controlName) {
        if(!this._controls) {
            this._controls = {};
        }
        if(!!this._controls[controlName]) {
            this._controls[controlName].rect.remove();
        }
        this._controls[controlName] = null;
    };

    /**
     * Returns true if the specified control is visible, false otherwise.
     * @param {String} controlName The name of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @returns {Boolean} true if the specified control is visible, false otherwise
     */
    Element.prototype.isControlVisible = function(controlName) {
        return this._getControlsVisibility()[controlName];
    };

    /**
     * Sets the visibility of the specified control.
     * @param {String} controlName The name of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @param {Boolean} visible true to set the specified control visible, false otherwise
     * @return {fabric.Object} thisArg
     * @chainable
     */
    Element.prototype.setControlVisible = function(controlName, visible) {
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
    Element.prototype.setControlsVisibility = function(options) {
        options || (options = { });

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
    Element.prototype._getControlsVisibility = function() {
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
    Element.prototype._removeControls = function() {
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
    Element.prototype._setDefaultOptions = function() {
        this.controlOptions = {
            padding: 0,
            transparentCorners: false,
            cornerSize: 10,
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
            }
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
    Element.prototype.translateToCenterPoint = function(point, originX, originY) {
        var cx = point.x,
            cy = point.y,
            strokeWidth = this.stroke ? this.strokeWidth : 0;

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
    Element.prototype.translateToOriginPoint = function(center, originX, originY) {
        var x = center.x,
            y = center.y,
            strokeWidth = this.stroke ? this.strokeWidth : 0;

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
    Element.prototype.getCenterPoint = function() {
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
    Element.prototype.setPositionByOrigin = function(pos, originX, originY) {
        var center = this.translateToCenterPoint(pos, originX, originY),
            position = this.translateToOriginPoint(center, this.originX, this.originY);

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
    Element.prototype.controllable = function(onSelection) {
        var container = null;
        if(this.hasClass('elementContainer')) {
            var scalable = new ScalableGroup(this.paper, Snap(this.node.children[0])),
                controls = new ControlsGroup(this.paper, Snap(this.node.children[1]));
            container = new Container(this.paper, onSelection, this);
            //container = this;
            container.reload();
        }
        else {
            var scalable: ScalableGroup = new ScalableGroup(this.paper),
                controls: ControlsGroup= new ControlsGroup(this.paper);
            container = new Container(this.paper, onSelection);

            scalable.append(this);
            container.setScalableGroup(scalable);
            container.setControlsGroup(controls);
        }
  
        controls.addControl(ControlPositions.br, new ScaleControl(container, container.group) );
        controls.addControl(ControlPositions.tl, new RotationControl(container, container.group) );

       return container;
    },

        Element.prototype.hideControls = function() {
            //TODO
        },

    /**
     * Plugin desactivation
     * Removes the elementControls group
     */
    Element.prototype.uncontrollable = function() {
        //this._control.remove();
        //this._control = null;
    },


    function Point (x, y) {
        this.x = x;
        this.y = y;
    }

    Snap.Point = fabric.Point;

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
        rotatePoint: function(point, origin, radians) {
            var sin = Math.sin(radians),
                cos = Math.cos(radians);

            point.subtractEquals(origin);

            var rx = point.x * cos - point.y * sin,
                ry = point.x * sin + point.y * cos;

            return new fabric.Point(rx, ry).addEquals(origin);
        },
    };

    Snap.Container = Container;

    function merge (obj1, obj2) {
        for (var attrname in obj2) {
            obj1[attrname] = obj2[attrname];
        }
    };
});
