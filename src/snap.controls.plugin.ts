///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="controls.ts" />
///<reference path="classes.ts" />

/**
 * Plugin for Snap SVG.
 * Adds methods to the Element class to get anchor controls and coordinates of corners.
 * @author Oblady
 */
Snap.plugin(function (Snap, Element: Snap.Element, Paper: Snap.Paper, global) {

    //Element.prototype.setWidth = function(w:number) {
    //    switch(this.type) {
    //        case 'circle':
    //            this.attr({r:w/2});
    //            break;
    //        case 'g':
    //            var bbox = this.getBBox(), width = bbox.width,
    //                scaleX = (this.transform().localMatrix.a || 1),
    //                absWidth = width / scaleX,
    //                newScaleX = w/(absWidth || 1);
    //            this.attr({
    //                transform: this.transform().localMatrix.scale(1/scaleX, 1).scale(newScaleX,1)
    //            });
    //            break;
    //
    //        default:
    //            this.attr({width:w});
    //            break;
    //    }
    //};
    //
    //Element.prototype.setHeight = function(h:number) {
    //    switch(this.type) {
    //        case 'circle':
    //            this.attr({r:h/2});
    //            break;
    //
    //        case 'g':
    //            var bbox = this.getBBox(), height = bbox.height,
    //                scaleY = (this.transform().localMatrix.d || 1),
    //                absHeight = height / scaleY,
    //                newScaleY = h/(absHeight || 1);
    //            this.attr({
    //                transform: this.transform().localMatrix.scale(1, 1/scaleY).scale(1, newScaleY)
    //            });
    //            break;
    //
    //        default:
    //            this.attr({height:h});
    //            break;
    //    }
    //};

    Element.prototype.globalToLocal = function (globalPoint: SVGPoint): SVGPoint {

        /**
         * @see https://groups.google.com/forum/#!topic/jointjs/qIKIiJCEClI and https://www.chromestatus.com/feature/5736166087196672
         * Act as a polyfill for SVGGraphicsElement.getTransformToElement as chrome deprecated it in v48.
         */
        var globalToLocal = this.paper.node.getScreenCTM().inverse().multiply(this.node.getScreenCTM()).inverse();

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
     * Draws corners of an object's bounding box.
     */
    Element.prototype.drawControls = function() {
        var container: Container  = this.data('containerObject');
        if(!!container) {
            container.placeControls();
        }
    };

    Element.prototype.hideControls = function() {
        var container: Container  = this.data('containerObject');
        if(container) {
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
    Element.prototype.controllable = function(options?: ControllableOptions): Container {
        var container = null;
        var self = this;
        options = options || {};
        options.onselect = options.onselect || function() {};
        options.onunselect = options.onunselect || function() {};
        options.onchange = options.onchange || function() {};
        options.ondragstart = options.ondragstart || function() {};
        options.onzoom = options.onzoom || function() {
                //TODO: call placeControls() for each container
            };
        options.getZoomRatio = options.getZoomRatio || function() {return 1;};
        options.getRotateControl = options.getRotateControl || function() {
                var item = self.paper.circle(0, 0, 10);
                item.toggleClass('rotationControl', true);
                return item;
            };
        options.getScaleControl = options.getScaleControl || function() {
                var item = self.paper.rect(0, 0, 10);
                item.toggleClass('scaleControl', true);
                return item;
            };
        options.getControlWidth = options.getControlWidth || function() {
                return 20 / (options.getZoomRatio());
            };
        options.getControlHeight = options.getControlHeight || function()  {
                return 20 / (options.getZoomRatio());
            };
        options.getRotateControlOffset = options.getRotateControlOffset || function() {
                return options.getControlHeight();
            };
        options.getIsHomotheticScaling = options.getIsHomotheticScaling || function() {
                return true;
            };
        if(this.hasClass('elementContainer')) {
            var scalable = new ScalableGroup(options, this.paper, Snap(this.node.children[0])),
                controls = new ControlsGroup(options, this.paper, Snap(this.node.children[1]));
            container = new Container(options, this.paper, this);
            container.setScalableGroup(scalable);
            container.setControlsGroup(controls);
            container.setOriginalGroup(Snap(scalable.group.node.children[0]));
            container.controlsGroup.cleanControls();
        } else {
            var scalable: ScalableGroup = new ScalableGroup(options, this.paper),
                controls: ControlsGroup= new ControlsGroup(options, this.paper);
            container = new Container(options, this.paper);
            this.attr({'data-controllable':true});

            scalable.append(this);
            container.setScalableGroup(scalable);
            container.setControlsGroup(controls);
            container.setOriginalGroup(this);

        }

		controls.addControl(ControlPositions.br, new ScaleControl(container, container.group, options.getIsHomotheticScaling(), options.getScaleControl()));
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
    Element.prototype.uncontrollable = function() {
        //this._control.remove();
        //this._control = null;
    },

    Snap.Control = Control;
    Snap.Container = Container;
});
