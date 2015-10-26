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
        options = options || {};
        options.onselect = options.onselect || function() {};
        options.onunselect = options.onunselect || function() {};
        options.onchange = options.onchange || function() {};
        
        if(this.hasClass('elementContainer')) {
			console.log('reloading');

            var scalable = new ScalableGroup(options, this.paper, Snap(this.node.children[0])),
                controls = new ControlsGroup(options, this.paper, Snap(this.node.children[1]));
            container = new Container(options, this.paper, this);
            container.setScalableGroup(scalable);
            container.setControlsGroup(controls);
            container.controlsGroup.cleanControls();
        } else {
            var scalable: ScalableGroup = new ScalableGroup(options, this.paper),
                controls: ControlsGroup= new ControlsGroup(options, this.paper);
            container = new Container(options, this.paper);
            this.attr({'data-controllable':true});

            scalable.append(this);
            container.setScalableGroup(scalable);
            container.setControlsGroup(controls);

        }

		controls.addControl(ControlPositions.br, new ScaleControl(container, container.group) );
		controls.addControl(ControlPositions.mt, new RotationControl(container, container.group) );
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

    Snap.Point = fabric.Point;
    Snap.Control = Control;
    Snap.Container = Container;
});
