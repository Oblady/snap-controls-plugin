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
		this.initialize();
    }
}


class ScaleControl extends Control {
    type: string = 'ScaleControl';
	scalableEl: Snap.Element;
    isHomothetic: boolean;
    getDefaultElement(el:Snap.Element): Snap.Element {
        var item = el.rect(0, 0, 20, 20);
        item.toggleClass('scaleControl', true);
        return item;
    }

    constructor (protected container:Container,  el:Snap.Element, isHomothetic: boolean, handlerEl?: Snap.Element) {
        super(container, el, handlerEl);
        this.isHomothetic = isHomothetic;
    }

	initialize () {
		this.scalableEl = this.container.scalableGroup.group;
        this.scalableEl.data('ow', this.scalableEl.getBBox().width); //original width
        this.scalableEl.data('oh', this.scalableEl.getBBox().height); //original height
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
        var el = this.scalableEl;
        if(this.isHomothetic) {
            var newScale = 1 + (dx+dy) / 100;
            if(newScale < 0.2) newScale = 0.2;
            if(newScale > 10) newScale = 10;
            var scale = {x: newScale, y: newScale};
            el.attr({
                transform: el.data('origTransform').local + (el.data('origTransform').local ? "S" : "s") + newScale
            });
        }
		else {
            var ow = el.data('ow'), //original width
                oh = el.data('oh'); //original height
            var scale = ScaleControl.getNewScale(ow, oh, dx, dy),
                scaleX: number = scale.x,
                scaleY: number = scale.y;
            if(scaleX < 0.2) scaleX = 0.2;
            if(scaleX > 10) scaleX = 10;
            if(scaleY < 0.2) scaleY = 0.2;
            if(scaleY > 10) scaleY = 10;
            el.attr({
                transform: el.data('origTransform').local + "S" + scaleX + ',' + scaleY
            });
        }

		this.container.placeControls();
        super.onDragmove(dx, dy, x, y, event);
        this.container.getControllableOptions().onchange(null, null, null, null, scale);
    }

    /**
     * Calculates a new scale when given original dimensions of the element and the distance of the pointer from the control
     * @param w
     * @param h
     * @param dx
     * @param dy
     * @returns {{x: number, y: number}}
     */
    static getNewScale(w:number, h:number, dx:number, dy:number) : {x: number; y: number} {
        return {
            x: (w + dx) / w,
            y: (h + dy) / h
        }
    }

    onDragstart(x, y, event) {
        event.preventDefault();
        this.scalableEl.data('origTransform', this.scalableEl.transform());
        super.onDragstart(x, y, event);
        this.container.getControllableOptions().ondragstart();
    }


}

class RotationControl extends Control {

    type: string = 'RotationControl';
	rotatableEl: Snap.Element;
    onDragMove$: any;
    correcAngle: number;

    getDefaultElement(el:Snap.Element): Snap.Element {
        var item = el.circle(0, 0, 10);
        item.toggleClass('rotationControl', true);
        return item;
    }

	initialize () {
		this.rotatableEl = this.container.group;

        this.onDragMove$ = new Rx.Subject();

        var i=0;
        this.onDragMove$.throttle(75).subscribe((data) => {
            this.doDragMove(data.dx, data.dy, data.x, data.y, data.event);
        });
	}

    doDragMove (dx:number, dy:number, x:number, y:number, event) {

        event.preventDefault();
		var el = this.rotatableEl;
        var scale = Math.round(this.container.getControllableOptions().getZoomRatio()*100)/100;

        var x: number = (event.clientX);
        var y: number = (event.clientY);

        var correcAngle = this.correcAngle;
        var scalableBBox = this.container.scalableGroup.group.getBBox();
        var p1 = el.node.getBoundingClientRect();
        p1.cx = p1.width/2 + p1.left;
        p1.cy = p1.height/2 + p1.top;
    
        //test si trop proche.
        var AB = Math.abs(y-p1.cy);
        var BC = Math.abs(x-p1.cx);

        var hyp = Math.sqrt(AB*AB + BC*BC);
        if(hyp<20)return;

        var angle: number = (Math.atan2(y - p1.cy, x - p1.cx)  * 180 / Math.PI) + correcAngle;

        var r = (angle - ( parseFloat(el.attr('angle'), 10) || 0) );

        var matrix = el.transform().localMatrix.rotate(r, scalableBBox.cx, scalableBBox.cy);
        el.transform(matrix);
        el.attr({
                transform: matrix,
                angle: angle
        });
        super.onDragmove(dx, dy, x, y, event);
        this.container.getControllableOptions().onchange(null, null, null, angle, null);
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
        this.onDragMove$.onNext({dx: dx, dy:dy, x:x, y:y, event:event});
        //this.doDragMove(dx, dy, x, y, event);
    }

    onDragstart(x, y, event) {
        event.preventDefault();

        var controllerRect = this.element.node.getBoundingClientRect();
        var controllerCenter = {cx: controllerRect.width/2 + controllerRect.left, cy:controllerRect.height/2 + controllerRect.top); 

        var x: number = (event.clientX);
        var y: number = (event.clientY);


		var el = this.rotatableEl;
        var p1 = el.node.getBoundingClientRect();
        p1.cx = p1.width/2 + p1.left;
        p1.cy = p1.height/2 + p1.top;

        var mouseAngle = (Math.atan2(y - p1.cy, x - p1.cx)  * 180 / Math.PI);
        var controllerAngle = (Math.atan2(controllerCenter.cy - p1.cy, controllerCenter.cx - p1.cx)  * 180 / Math.PI);

        var is90 = +90; //that is if the controller is centered above the element ton control. May break things if the controller is placed elsewhere… :-/
        
        //Add a correction for prevent a little “jump” caused by the mouse event is not in the same place as the controller center
        this.correcAngle = mouseAngle - controllerAngle + is90 ;

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
