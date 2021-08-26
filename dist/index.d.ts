import { clamp, hexToRgb } from './utils';
declare type Vector2 = {
    x: number;
    y: number;
};
declare type ContextSettings = {
    color?: (string | CanvasGradient | CanvasPattern);
    strokeOptions?: object;
    alpha?: number;
    operation?: string;
};
declare type OffsetSettings = {
    offset?: Vector2;
    width?: number;
    height?: number;
};
declare class UtilityCanvas {
    el: HTMLCanvasElement;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    static COMPOSITE: {
        [key: string]: string;
    };
    constructor({ canvas, width, height, parent }?: {
        canvas?: HTMLCanvasElement;
        width?: number;
        height?: number;
        parent?: HTMLElement | null;
    });
    resize({ width, height }?: {
        width?: number;
        height?: number;
    }): this;
    clearRect({ offset: { x, y }, width, height }?: OffsetSettings): this;
    clear(): this;
    setColor(color?: (string | CanvasGradient | CanvasPattern)): this;
    setStroke({ thickness, color }?: {
        thickness?: number;
        color?: (string | CanvasGradient | CanvasPattern);
    }): this;
    setCompositeOperation(operation?: string): this;
    setAlpha(alpha?: number): this;
    _parseSettings(settings?: ContextSettings): this;
    fill(settings?: ContextSettings): this;
    fillRect({ offset: { x, y }, width, height, ...settings }?: OffsetSettings): this;
    fillImage(image: (HTMLImageElement | HTMLCanvasElement), { preserveAspect, ...settings }?: {
        preserveAspect?: (string | boolean);
    }): this;
    fillOrFitImage(image: (HTMLImageElement | HTMLCanvasElement), { fill, aspect, anchors: { x: ax, y: ay }, offset: { x, y }, margin, ...settings }?: {
        fill?: boolean;
        aspect?: (number | null);
        anchors?: {
            x?: string;
            y?: string;
        };
        offset?: {
            x?: number;
            y?: number;
        };
        margin?: (number | {
            t?: number;
            l?: number;
            r?: number;
            b?: number;
        });
    }): this;
    fillPattern(image: (HTMLImageElement | HTMLCanvasElement), { repeat, stagger, rotation, offset: { x, y }, margin: { x: mx, y: my }, anchors: { x: ax, y: ay }, ...settings }?: {
        repeat?: (Vector2 | null);
        stagger?: (string | null);
        rotation?: number;
        offset?: Vector2;
        margin?: Vector2;
        anchors?: {
            x?: string;
            y?: string;
        };
    }): this;
    beginPath(): this;
    stroke(settings?: ContextSettings): this;
    closePath(): this;
    rectangle({ offset: { x, y }, width, height, fill, stroke, ...settings }: {
        offset?: Vector2;
        width?: number;
        height?: number;
        fill?: boolean;
        stroke?: boolean;
    }): this;
    arc({ center: { x, y }, radius, startAngle, endAngle, cc, fill, stroke, ...settings }: {
        center?: Vector2;
        radius?: number;
        startAngle?: 0;
        endAngle?: number;
        cc?: boolean;
        fill?: boolean;
        stroke?: boolean;
    }): this;
    ellipse({ center: { x, y }, radius: { x: rx, y: ry }, rotation, startAngle, endAngle, cc, fill, stroke, ...settings }: {
        center?: Vector2;
        radius?: Vector2;
        rotation?: number;
        startAngle?: 0;
        endAngle?: number;
        cc?: boolean;
        fill?: boolean;
        stroke?: boolean;
    }): this;
    roundedRectangle({ offset: { x, y }, width, height, radius, fill, stroke, ...settings }: {
        offset?: Vector2;
        width?: number;
        height?: number;
        radius: (number | {
            tl: number;
            tr: number;
            bl: number;
            br: number;
        });
        fill?: boolean;
        stroke?: boolean;
    }): this;
    polygon(points?: [number, number][], { closed, fill, stroke, ...settings }?: {
        closed?: boolean;
        fill?: boolean;
        stroke?: boolean;
    }): this;
    drawImage(image: (HTMLImageElement | HTMLCanvasElement), { position: { x, y }, rotation, scale, ...settings }?: {
        position?: Vector2;
        rotation?: number;
        scale?: number;
    }): this;
    drawImageWithDimensions(image: (HTMLImageElement | HTMLCanvasElement), { width, height, position: { x, y }, rotation, ...settings }: {
        width: number;
        height: number;
        position?: Vector2;
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
