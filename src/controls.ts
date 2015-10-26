///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
/////<reference path="canvas.ts" />

var ControlPositions = {
    tl:'tl',
    tr:'tr',
    bl:'bl',
    br:'br',
    mt:'mt'
};

interface IControl {
}


class Control implements IControl {

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

    setPosition(x, y)  {
		switch(this.element.type) {
			case 'circle':
				this.element.attr({cx:x, cy:y});
			break;

			default:
				this.element.attr({x:x, y:y});
			break;
		}
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
            this.visibility != this.visibility;
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
		var scale = 1 + dx / 100;
		if(scale < 0.2) scale = 0.2;
		if(scale > 10) scale = 10;
		var el = this.scalableEl;
        el.attr({
                transform: el.data('origTransform') + (el.data('origTransform') ? "S" : "s") + scale
        });

		this.container.placeControls();
        super.onDragmove(dx, dy, x, y, event);
    }

    onDragstart(x, y, event) {
        this.scalableEl.data('origTransform', this.scalableEl.transform().local);
        super.onDragstart(x, y, event);
    }


}

class RotationControl extends Control {

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
     */
    onDragmove(dx:number, dy:number, x:number, y:number, event) {
		var el = this.rotatableEl;
        var scale = 1;
        var p1 = this.element.getBBox();
        var p2 = {x: p1.x + dx * scale, y: p1.y + dy * scale};
        console.log(p1, p2);
        var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
		//var angle = 1 + dx/2;
        el.attr({
                transform: el.data('origTransform') + (el.data('origTransform') ? "R" : "r") + angle
        });
        super.onDragmove(dx, dy, x, y, event);
    }

    onDragstart(x, y, event) {
		var el = this.rotatableEl;
        el.data('origTransform', el.transform().local);
        super.onDragstart(x, y, event);
    }
}

class DropControl extends Control {

}

class DragControl extends Control {

}
