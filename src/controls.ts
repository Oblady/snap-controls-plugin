///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />

var ControlPositions = {
    tl:'tl',
    tr:'tr',
    bl:'bl',
    br:'br',
    mt:'mt',
    mb:'mb'
};

interface IControl {
}


class Control implements IControl {

    type: string = 'Control';
    visibility: boolean = false;
    linkedTo: Snap.Element;
    element: Snap.Element;

    onDragstart(x:number, y:number, event) {
        this.element.toggleClass('dragging', true);
    }

    onDragend(event) {
        this.element.toggleClass('dragging', false);
    }

    /**
     *
     * @param dx x distance between the control and the mouse
     * @param dy y distance between the control and the mouse
     * @param x
     * @param y
     */
    onDragmove(dx, dy, x, y, event) {
        event.preventDefault();
       // console.log('on drag down', this);
    }

    /**
     * set position relative to parent
     * @param x
     * @param y
     */
    setPosition(x, y)  {
		switch(this.element.type) {
			case 'circle':
				this.element.attr({cx:x, cy:y});
			break;

            case 'g':
                var localmatrix = this.element.transform().localMatrix,
                    invert = localmatrix.invert(),
                    absX = x/(localmatrix.a || 1),
                    absY = y/(localmatrix.d || 1),
                    invertX = invert.e || 0,
                    invertY = invert.f || 0;
                //cancel the previous translation then do the new one
                this.element.attr({transform: localmatrix.translate(invertX, invertY).translate(absX, absY)});
            break;

			default:
				this.element.attr({x:x, y:y});
			break;
		}
    }

    setWidth(w:number) {
        switch(this.element.type) {
            case 'circle':
                this.element.attr({r:w/2});
                break;
            case 'g':
                var bbox = this.element.getBBox(), width = bbox.width,
                    scaleX = (this.element.transform().localMatrix.a || 1),
                    absWidth = width / scaleX,
                    newScaleX = w/(absWidth || 1);
                this.element.attr({
                    transform: this.element.transform().localMatrix.scale(1/scaleX, 1).scale(newScaleX,1)
                });
                break;

            default:
                this.element.attr({width:w});
                break;
        }
    }

    setHeight(h:number) {
        switch(this.element.type) {
            case 'circle':
                this.element.attr({r:h/2});
                break;

            case 'g':
                var bbox = this.element.getBBox(), height = bbox.height,
                    scaleY = (this.element.transform().localMatrix.d || 1),
                    absHeight = height / scaleY,
                    newScaleY = h/(absHeight || 1);
                this.element.attr({
                    transform: this.element.transform().localMatrix.scale(1, 1/scaleY).scale(1, newScaleY)
                });
                break;

            default:
                this.element.attr({height:h});
                break;
        }
    }

    getWidth() :number {
        return this.element.getBBox().width;
    }

    getHeight() :number {
        return this.element.getBBox().height;
    }

	initialize() {
		//do nothing by default
	}

    getDefaultElement(el:Snap.Element): Snap.Element {
        return el.rect(0, 0, 20, 20);
    }


    toggleVisibility(force?: boolean) {
        if('undefined' !== typeof force) {
            this.visibility = force;
        } else {
            this.visibility = !this.visibility;
        }
        var opacity = (this.visibility) ? 1 : 0;
        this.element.attr({opacity: opacity});
    }

    constructor (protected container:Container,  el:Snap.Element, handlerEl?: Snap.Element) {

        this.element = handlerEl || this.getDefaultElement(el);
        this.linkedTo = el;

        this.element.attr({opacity:0});

        this.element.toggleClass('controlItem', true);

        var self = this;

        if(!!this.linkedTo && !el.paper) {
            throw "Error: this.linkedTo.paper is undefined";
        }

        this.element.appendTo(this.linkedTo.select('.elementControls'));
        //this.linkedTo._controls[controlName] = this;
        this.element.drag(this.onDragmove, this.onDragstart, this.onDragend, this, this, this);
        this.element.angle = 0;

		this.initialize();
    }
}


class ScaleControl extends Control {
    type: string = 'ScaleControl';
	scalableEl: Snap.Element;
    getDefaultElement(el:Snap.Element): Snap.Element {
        var item = el.rect(0, 0, 20, 20);
        item.toggleClass('scaleControl', true);
        return item;
    }

	initialize () {
		this.scalableEl = this.container.scalableGroup.group;
	}

    /**
     *
     * @param dx x distance between the control and the mouse
     * @param dy y distance between the control and the mouse
     * @param x
     * @param y
     */
    onDragmove(dx, dy, x, y, event) {
		var scale = 1 + (dx+dy) / 100;
		if(scale < 0.2) scale = 0.2;
		if(scale > 10) scale = 10;
		var el = this.scalableEl;
        el.attr({
                transform: el.data('origTransform').local + (el.data('origTransform').local ? "S" : "s") + scale
        });

		this.container.placeControls();
        super.onDragmove(dx, dy, x, y, event);
        this.container.getControllableOptions().onchange(null, null, null, null, scale);
    }

    onDragstart(x, y, event) {
        this.scalableEl.data('origTransform', this.scalableEl.transform());
        super.onDragstart(x, y, event);
        this.container.getControllableOptions().ondragstart();
    }


}

class RotationControl extends Control {

    type: string = 'RotationControl';
	rotatableEl: Snap.Element;

    getDefaultElement(el:Snap.Element): Snap.Element {
        var item = el.circle(0, 0, 10);
        item.toggleClass('rotationControl', true);
        return item;
    }

	initialize () {
		this.rotatableEl = this.container.group;
	}

    /**
     *
     * @param dx x distance between the control and the mouse
     * @param dy y distance between the control and the mouse
     * @param x
     * @param y
     * @param event
     */
    onDragmove(dx:number, dy:number, x:number, y:number, event) {
		var el = this.rotatableEl;
        var scale = Math.round(this.container.getControllableOptions().getZoomRatio()*100)/100;
        var scalableBBox = this.container.scalableGroup.group.getBBox();
        var p1 = this.element.getBBox();
        var p2 = {x: p1.x + dx * scale, y: p1.y + dy * scale};
        var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        var rotate = 'rotate(' + angle + ' '  + scalableBBox.cx + ' ' + scalableBBox.cy +')';
        var matrix = el.data('origTransform').localMatrix.rotate(-el.attr('angle'), scalableBBox.cx, scalableBBox.cy);
        matrix.rotate(angle, scalableBBox.cx, scalableBBox.cy);
        el.attr({
                transform: matrix,
                angle: angle
        });
        super.onDragmove(dx, dy, x, y, event);
        this.container.getControllableOptions().onchange(null, null, null, angle, null);
    }

    onDragstart(x, y, event) {
		var el = this.rotatableEl;
        el.data('origTransform', el.transform());
        this.container.getControllableOptions().ondragstart();
        super.onDragstart(x, y, event);
    }
}

class DropControl extends Control {

}

class DragControl extends Control {

}
