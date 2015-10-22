
declare module Snap {

    export interface IPoint extends fabric.IPoint
    {
    }

    export interface Paper {
        node: SVGSVGElement;
    }

    export interface Matrix {
        a: number;
        b: number;
        c: number;
        d: number;
        e: number;
        f: number;
    }

    export interface ICoords {
        x: number;
        y: number;
        transformX: number;
        transformY: number;
        scaleX: number;
        scaleY: number;
    }

    export interface Element {
        groups: Element;
        paper: Paper;
        setOCoords(angle:number, currentWidth?: number, currentHeight?: number): Element;
        prototype: Element;
        angle: number;
        width: number;
        height: number;
        scaleX: number;
        scaleY: number;

        controllable ( onSelectionCallback: () => void ): Element;
        uncontrollable (): void;
        hideControls(): void;

        drawControls(width: number, height: number, options?: Object): void;
        isControlVisible(controlName: string): boolean;
        setControlVisible(controlName: string, visible: boolean): Element;
        setControlsVisibility(controls: Object): Element;
        setPositionByOrigin(position: IPoint, originX: string, originY: string);
        getCoords(): ICoords;
        getCursorPoint(x: number, y:number): SVGPoint;
        globalToLocal(globalPoint: SVGPoint): SVGPoint;
        translateToCenterPoint (point: IPoint, originX: string, originY: string): IPoint;
        translateToOriginPoint (point: IPoint, originX: string, originY: string): IPoint;
        getCenterPoint(): IPoint;


        _getControlsVisibility(): Object;
        _setCornerCoords(angle: number): void;
        _drawControl(controlName: string, fillRect: string, left: number, top:number  ): void;
        _removeControl(controlName: string): void;
        _removeControls(): void;
        _setDefaultOptions(): void;

    }



}
