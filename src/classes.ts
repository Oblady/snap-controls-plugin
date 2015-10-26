///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="controls.ts" />

interface ControllableOptions {
    onselect?(el: Snap.Element):void;
    onunselect?(el: Snap.Element):void;
    onchange?(el: Snap.Element):void;
    getZoomRatio?(): number;
}

class GroupPrototype {

    paper: Snap.Paper;
    group: Snap.Element;

    init(paper: Snap.Paper, groupClass?: string, snapGroup?: Snap.Element):void {
        this.paper = paper;
        this.group = snapGroup || this.paper.group();
		this.group.paper = paper;
        this.group.addClass(groupClass);
    }

    append(element):void {
        this.group.append(element);
    }

    appendGroup(element):void {
        this.group.append(element.group);
    }


    getControllableOptions(): ControllableOptions {
        return this.options;
    }

    constructor(protected options: ControllableOptions, paper: Snap.Paper, groupClass: string, snapGroup?: Snap.Element) {
        this.init(paper, groupClass, snapGroup);
    }
};

/**
 *
 * @param paper
 * @constructor
 */
class ScalableGroup extends GroupPrototype
{
    constructor(protected options: ControllableOptions, paper: Snap.Paper, SnapGroup?: Snap.Element) {
        super(options, paper, 'elementScalable', SnapGroup);

        var altMoveDrag = function(xxdx: number, xxdy: number, ax: number, ay: number, ev) {

            var container: Snap.Element = this.parent();

            if (!container.paper) {
                return;
            }

            var tdx: number, tdy: number;
            var cursorPoint:SVGPoint = container.getCursorPoint(ax, ay);
            var pt:SVGPoint = container.paper.node.createSVGPoint();

            pt.x = cursorPoint.x - container.data('op').x;
            pt.y = cursorPoint.y - container.data('op').y;

            var localPt = container.globalToLocal(pt);

            var initialMtx = container.transform().localMatrix.clone();
            if(container.type == 'svg') {
                container.attr({'x': localPt.x});
                container.attr({'y': localPt.y});
            }
            container.transform(container.data('ot').toTransformString() + "t" + [localPt.x, localPt.y]);


            var mtx = container.transform().localMatrix.clone();
            var diffX = mtx.e - initialMtx.e;
            var diffY =  initialMtx.f - mtx.f;

        }

        var altStartDrag = function(x, y, ev) {
            var container = this.parent();
            container.data('ibb', container.getBBox());
            container.data('op', container.getCursorPoint(x, y));
            container.data('ot', container.transform().localMatrix);
        }

        this.group.drag(altMoveDrag, altStartDrag, function() {});
    }
}



interface IControlInstance {
    position: string;
    control: Control; 
}
/**
 *
 * @param paper
 * @constructor
 */
class ControlsGroup extends GroupPrototype
{
    controls: IControlInstance[] = [];
    constructor(protected options: ControllableOptions, paper: Snap.Paper, SnapGroup?: Snap.Element) {
        super(options, paper, 'elementControls', SnapGroup);
		this.drawBorder();

    }

	drawBorder() {
        var rect = this.group.select('.controlsBorder');
        if(!rect) {
            rect = this.group.paper.rect(0,0,0,0);
            rect.toggleClass("controlsBorder",true);
			this.group.append(rect);
        } 
	}

    cleanControls():void {
		this.controls = [];
		var els = this.group.selectAll('*');
		for (var i=0; i<els.length; i++) {
			els[i].remove();
		}
		this.drawBorder();
    }

    addControl(position: string, control: Control) {
        this.controls.push({position: position, control: control});
        return this;
    }

    setControlsVisibility(visibility: boolean) {
        for (var i=0; i<this.controls.length; i++) {
            this.controls[i].control.toggleVisibility(visibility);
        }

        var opacity = (visibility)?1:0;
        this.group.attr({opacity: opacity});
    }
}

/**
 *
 * @param paper
 * @param snapGroup
 * @constructor
 */
class Container extends GroupPrototype
{
    controlsGroup: ControlsGroup;
    scalableGroup: ScalableGroup;


    setScalableGroup(scalable: ScalableGroup):Container {
        this.scalableGroup = scalable;
        this.appendGroup(scalable);
        return this;
    }

    setControlsGroup (controls: ControlsGroup) {
        this.controlsGroup = controls;
        this.appendGroup(controls);
        return this;
    }


    hideControls() {
        this.options.onunselect(this.group);
        this.controlsGroup.setControlsVisibility(false);
    }

	placeControls() {
		var container = this;
        var controls = this.controlsGroup.controls;
        //var baseVal =  (this.node.transform.baseVal.length) ? this.node.transform.baseVal.getItem(0) : null;

		var bbox = this.scalableGroup.group.getBBox();

        container.controlsGroup.setControlsVisibility(true);
        var border = container.controlsGroup.group.select('.controlsBorder');
        border.attr({x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height});

        for(var i=0; i<controls.length; i++) {
            var pos: string = controls[i].position;
            var control: Control = controls[i].control;

            var left: number;
            var top: number;
			var width = 10;
            switch(pos) {
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
            }
			control.setPosition(left, top);
        }


        this.options.onselect(this.group);
	}

    constructor(protected options: ControllableOptions, paper: Snap.Paper, snapGroup?: Snap.Element) {
        super(options, paper, 'elementContainer', snapGroup);

		var self=this;
		this.group.mousedown(function() {
            self.options.onselect(this);
			self.placeControls();	
		});
    }

    reload () {
        //initialize();
    }


}
