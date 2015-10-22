///<reference path="../typings/tsd.d.ts" />
///<reference path="plugin.d.ts" />
///<reference path="controls.ts" />


class GroupPrototype {

    paper: Snap.Paper;
    group: Snap.Element;
    onSelection: () => void;

    init(paper: Snap.Paper, groupClass?: string, onSelection?: () => void, snapGroup?: Snap.Element):void {
        this.paper = paper;
        this.group = snapGroup || this.paper.group();
        this.group.addClass(groupClass);
        if(onSelection) {
            this.group.mousedown(onSelection);
        }
    }

    append(element):void {
        this.group.append(element);
    }

    appendGroup(element):void {
        this.group.append(element.group);
    }

    constructor(paper: Snap.Paper, groupClass: string, onSelection?: () => void, snapGroup?: Snap.Element) {
        this.init(paper, groupClass, onSelection, snapGroup);
    }
};

/**
 *
 * @param paper
 * @constructor
 */
class ScalableGroup extends GroupPrototype
{
    constructor(paper: any, SnapGroup?: Snap.Element) {
        super(paper, 'elementScalable', function() {}, SnapGroup);

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

    constructor(paper: any, SnapGroup?: Snap.Element) {
        super(paper, 'elementControls', function() {}, SnapGroup);

        var rect = this.group.rect(0,0,0,0);
        rect.toggleClass("controlsBorder",true);
    }

    addControl(position: string, control: Control) {
        this.controls.push({position: position, control: control});
        return this;
    }
}

/**
 *
 * @param paper
 * @param onSelection
 * @param snapGroup
 * @constructor
 */
class Container extends GroupPrototype
{
    controlsGroup: ControlsGroup;
    scalableGroup: ScalableGroup;

    static onMouseDown (el:Snap.Element) {
        el.drawControls(50, 50);
        //!!el.onSelection && el.onSelection();
    }

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

	placeControls() {
		var container = this;
        var controls = container.controlsGroup.controls;
        //var baseVal =  (this.node.transform.baseVal.length) ? this.node.transform.baseVal.getItem(0) : null;

		var bbox = this.scalableGroup.group.getBBox();

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
	}

    constructor(paper: any, onSelection?: () => void, snapGroup?: Snap.Element) {
        super(paper, 'elementContainer', function() { Container.onMouseDown(this) }, snapGroup);
        this.group.data('containerObject', this);

		var self=this;
		this.group.click(function() {
			self.placeControls();	
		});
    }

    reload () {
        //initialize();
    }


}
