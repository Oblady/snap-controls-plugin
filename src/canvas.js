///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
var Canvas = (function () {
    function Canvas() {
    }
    /**
     * @private
     */
    Canvas.prototype._getOriginFromCorner = function (target, corner) {
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
    };
    Canvas.prototype.getActionFromCorner = function (target, corner) {
        var action = 'drag';
        if (corner) {
            action = (corner === 'ml' || corner === 'mr') ? 'scaleX' : (corner === 'mt' || corner === 'mb') ? 'scaleY' : corner === 'mtr' ? 'rotate' : 'scale';
        }
        return action;
    };
    /**
     * @param {Snap.Object} target
     */
    Canvas.prototype.setupCurrentTransform = function (dx, dy, x, y, target, corner, options) {
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
    };
    /**
     * Translates object by "setting" its left/top
     * @private
     * @param {Number} x pointer's x coordinate
     * @param {Number} y pointer's y coordinate
     */
    Canvas.prototype._translateObject = function (x, y) {
        var target = this._currentTransform.target, options = this._currentTransform.options;
        if (!options.lockMovementX) {
            target.attr({ 'left': x - this._currentTransform.offsetX });
        }
        if (!options.lockMovementY) {
            target.attr({ 'top': y - this._currentTransform.offsetY });
        }
    };
    /**
     * Scales object by invoking its scaleX/scaleY methods
     * @private
     * @param {Number} x pointer's x coordinate
     * @param {Number} y pointer's y coordinate
     * @param {String} by Either 'x' or 'y' - specifies dimension constraint by which to scale an object.
     *                    When not provided, an object is scaled by both dimensions equally
     */
    Canvas.prototype._scaleObject = function (x, y, by) {
        var t = this._currentTransform, target = t.target, lockScalingX = t.options.lockScalingX, lockScalingY = t.options.lockScalingY, lockScalingFlip = t.options.lockScalingFlip;
        if (lockScalingX && lockScalingY) {
            return;
        }
        // Get the constraint point
        var constraintPosition = target.translateToOriginPoint(target.getCenterPoint(), t.originX, t.originY);
        console.log(constraintPosition);
        //localMouse = target.toLocalPoint(new fabric.Point(x, y), t.originX, t.originY);
        //this._setLocalMouse(localMouse, t);
        // Actually scale the object
        this._setObjectScale({ x: x, y: y }, t, lockScalingX, lockScalingY, by, lockScalingFlip);
        // Make sure the constraints apply
        //target.setPositionByOrigin(constraintPosition, t.originX, t.originY);
    };
    /**
     * Resets the current transform to its original values and chooses the type of resizing based on the event
     * @private
     * @param {Event} e Event object fired on mousemove
     */
    Canvas.prototype._resetCurrentTransform = function (e) {
        var t = this._currentTransform;
        t.target.attr({
            scaleX: t.original.scaleX,
            scaleY: t.original.scaleY,
            left: t.original.left,
            top: t.original.top
        });
        //todo
        if (this._shouldCenterTransform(e, t.target)) {
            if (t.action === 'rotate') {
                //todo
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
    };
    /**
     * @private
     */
    Canvas.prototype._setObjectScale = function (localMouse, transform, lockScalingX, lockScalingY, by, lockScalingFlip) {
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
    };
    /**
     * @private
     */
    Canvas.prototype._flipObject = function (transform) {
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
    };
    /**
     * @private
     */
    Canvas.prototype._performTransformAction = function (transform, pointer) {
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
    };
    /**
     * @private
     */
    Canvas.prototype._onScale = function (transform, x, y) {
        transform.currentAction = 'scale';
        this._scaleObject(x, y, 'equally');
    };
    /**
     * @private
     */
    Canvas.prototype._scaleObjectEqually = function (localMouse, target, transform) {
        var dist = localMouse.y + localMouse.x, strokeWidth = target.stroke ? target.strokeWidth : 0, lastDist = (target.height + (strokeWidth / 2)) * transform.original.scaleY + (target.width + (strokeWidth / 2)) * transform.original.scaleX;
        // We use transform.scaleX/Y instead of target.scaleX/Y
        // because the object may have a min scale and we'll loose the proportions
        transform.newScaleX = transform.original.scaleX * dist / lastDist;
        transform.newScaleY = transform.original.scaleY * dist / lastDist;
        target.setScaleX(transform.newScaleX);
        target.setScaleY(transform.newScaleY);
    };
    return Canvas;
})();
;
//# sourceMappingURL=canvas.js.map