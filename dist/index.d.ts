import { clamp, hexToRgb } from './utils';
declare type Vector2<T = number> = {
    x: T;
    y: T;
};
declare type OptionalVector2<T = number> = {
    x?: T;
    y?: T;
};
declare type Margin = number | {
    t?: number;
    l?: number;
    r?: number;
    b?: number;
};
declare type Corner = number | {
    tl?: number;
    tr?: number;
    bl?: number;
    br?: number;
};
declare type Anchors = {
    x?: 'left' | 'center' | 'right';
    y?: 'top' | 'center' | 'bottom';
};
declare type Aspect = 'fill' | 'fit' | boolean;
declare type PolylinePoints = [number, number][];
declare type ArcSettings = {
    center?: Vector2;
    radius?: number;
    startAngle?: 0;
    endAngle?: number;
    cc?: boolean;
};
declare type EllipseSettings = Omit<ArcSettings, 'radius'> & {
    radius?: Vector2;
    rotation?: number;
};
declare type CanvasFill = string | CanvasGradient | CanvasPattern;
declare type CanvasImage = HTMLImageElement | HTMLCanvasElement;
declare type StrokeSettings = {
    thickness?: number;
    color?: CanvasFill;
};
declare type FillOrStroke = {
    fill?: boolean;
    stroke?: boolean;
};
declare type ContextSettings = {
    color?: CanvasFill;
    strokeSettings?: StrokeSettings;
    alpha?: number;
    operation?: string;
};
declare type SizeSettings = {
    width?: number;
    height?: number;
};
declare type OffsetSettings = SizeSettings & {
    offset?: OptionalVector2;
};
declare type PolygonSettings = {
    sides: number;
    sideLength?: number;
    radius?: number;
    center?: OptionalVector2;
    rotation?: number;
    closed?: boolean;
};
declare class UtilityCanvas {
    el: HTMLCanvasElement;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    static COMPOSITE: {
        [key: string]: GlobalCompositeOperation;
    };
    constructor({ canvas, width, height, parent }?: SizeSettings & {
        canvas?: HTMLCanvasElement;
        parent?: HTMLElement | null;
    });
    resize({ width, height }?: SizeSettings): this;
    clearRect({ offset: { x, y }, width, height }?: OffsetSettings): this;
    clear(): this;
    setColor(color?: CanvasFill): this;
    setStroke({ thickness, color }?: StrokeSettings): this;
    setCompositeOperation(operation?: (string | GlobalCompositeOperation)): this;
    setAlpha(alpha?: number): this;
    _parseSettings(settings?: ContextSettings): this;
    fill(settings?: ContextSettings): this;
    fillRect({ offset: { x, y }, width, height, ...settings }?: OffsetSettings): this;
    fillImage(image: CanvasImage, { preserveAspect, ...settings }?: {
        preserveAspect?: Aspect;
    }): this;
    fillOrFitImage(image: CanvasImage, { fill, aspect, anchors: { x: ax, y: ay }, offset: { x, y }, margin, ...settings }?: {
        fill?: boolean;
        aspect?: (number | null);
        anchors?: Anchors;
        offset?: OptionalVector2;
        margin?: Margin;
    }): this;
    fillImagePattern(image: CanvasImage, { repeat, stagger, rotation, offset: { x, y }, margin: { x: mx, y: my }, anchors: { x: ax, y: ay }, ...settings }?: {
        repeat?: Vector2;
        stagger?: ('x' | 'y');
        rotation?: number;
        offset?: OptionalVector2;
        margin?: OptionalVector2;
        anchors?: Anchors;
    }): this;
    beginPath(): this;
    stroke(settings?: ContextSettings): this;
    closePath(): this;
    rect({ offset: { x, y }, width, height, fill, stroke, ...settings }: OffsetSettings & FillOrStroke): this;
    arc({ center: { x, y }, radius, startAngle, endAngle, cc, fill, stroke, ...settings }: FillOrStroke & ArcSettings): this;
    ellipse({ center: { x, y }, radius: { x: rx, y: ry }, rotation, startAngle, endAngle, cc, fill, stroke, ...settings }: FillOrStroke & EllipseSettings): this;
    roundedRectangle({ offset: { x, y }, width, height, radius, fill, stroke, ...settings }: OffsetSettings & FillOrStroke & {
        radius: Corner;
    }): this;
    polyline(points?: PolylinePoints, { closed, fill, stroke, ...settings }?: FillOrStroke & {
        closed?: boolean;
    }): this;
    polygon({ sides, sideLength, radius, center: { x, y }, rotation, closed, ...settings }: PolygonSettings): this;
    rectangle({ width, height, center: { x, y }, rotation, closed, ...settings }: Omit<PolygonSettings, 'sides' | 'radius' | 'sideLength'> & {
        width: number;
        height: number;
    }): this;
    drawImage(image: CanvasImage, { center: { x, y }, rotation, scale, ...settings }?: {
        center?: Vector2;
        rotation?: number;
        scale?: number;
    }): this;
    drawImageWithDimensions(image: CanvasImage, { width, height, center: { x, y }, rotation, ...settings }: {
        width: number;
        height: number;
        center?: Vector2;
        rotation?: number;
    }): this;
    chromaKey(color: (string | {
        r: number;
        g: number;
        b: number;
    }), threshold?: number): this;
    download(format?: string, name?: string): void;
    getDataURL(format?: string, quality?: number): string;
    setDataURL(data: string): Promise<unknown>;
}
export { UtilityCanvas, clamp, hexToRgb };
export default UtilityCanvas;
