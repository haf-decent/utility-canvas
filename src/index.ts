import { clamp, hexToRgb } from './utils';

type Vector2 = {
    x: number,
    y: number
}

type ContextSettings = {
    color?: (string | CanvasGradient | CanvasPattern),
    strokeOptions?: object,
    alpha?: number,
    operation?: string
}

type OffsetSettings = {
    offset?: Vector2,
    width?: number,
    height?: number
}

class UtilityCanvas {
    el: HTMLCanvasElement;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    static COMPOSITE: { [ key: string ]: string }

    constructor({ canvas = document.createElement('canvas'), width = 1024, height = 1024, parent = null }: { canvas?: HTMLCanvasElement, width?: number, height?: number, parent?: HTMLElement | null } = {}) {
        this.el = canvas;
        this.width = canvas.width = width;
        this.height = canvas.height = height;
        const ctx: (CanvasRenderingContext2D | null) = canvas.getContext('2d');
        if (!ctx) throw new Error('Unable to get canvas context');
        this.ctx = ctx;
        if (parent) parent.appendChild(canvas);
    }

    resize({ width = this.width, height = this.height }: { width?: number, height?: number } = {}) {
        this.width = this.el.width = width;
        this.height = this.el.height = height;

        return this;
    }

    clearRect({ offset: { x = 0, y = 0 } = { x: 0, y: 0 }, width = this.width, height = this.height }: OffsetSettings = {}) {
        this.ctx.clearRect(x, y, width, height);

        return this;
    }

    clear() {
        return this.clearRect();
    }

    setColor(color: (string | CanvasGradient | CanvasPattern) = this.ctx.fillStyle) {
        this.ctx.fillStyle = color;

        return this;
    }

    setStroke({ thickness = this.ctx.lineWidth, color = this.ctx.strokeStyle }: { thickness?: number, color?: (string | CanvasGradient | CanvasPattern) } = {}) {
        this.ctx.lineWidth = thickness;
        this.ctx.strokeStyle = color;
    
        return this;
    }

    setCompositeOperation(operation: string = this.ctx.globalCompositeOperation) {
        if (UtilityCanvas.COMPOSITE[ operation ]) this.ctx.globalCompositeOperation = UtilityCanvas.COMPOSITE[ operation ];
        else if (Object.values(UtilityCanvas.COMPOSITE).includes(operation)) this.ctx.globalCompositeOperation = operation;
        else console.warn(`Composite operation: '${operation}' does not exist.`);
    
        return this;
    }

    setAlpha(alpha: number = this.ctx.globalAlpha) {
        this.ctx.globalAlpha = alpha;
    
        return this;
    }

    _parseSettings(settings?: ContextSettings) {
        if (!settings) return this;
        const { color = undefined, strokeOptions = {}, alpha = undefined, operation = undefined } = settings;
        this.setColor(color);
        this.setStroke(strokeOptions);
        this.setAlpha(alpha);
        this.setCompositeOperation(operation);
    
        return this;
    }


    fill(settings?: ContextSettings) {
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.fill();
        this.ctx.restore();
    
        return this;
    }

    fillRect({ offset: { x = 0, y = 0 } = { x: 0, y: 0 }, width = this.width, height = this.height, ...settings }: OffsetSettings = {}) {
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    
        return this;
    }
    
    fillImage(image: (HTMLImageElement | HTMLCanvasElement), { preserveAspect = false, ...settings }: { preserveAspect?: (string | boolean) } = {}) {
        if (preserveAspect) return this.fillOrFitImage(image, { fill: preserveAspect === 'fill', ...settings });

        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.drawImage(image, 0, 0, this.width, this.height);
        this.ctx.restore();
    
        return this;
    }

    fillOrFitImage(image: (HTMLImageElement | HTMLCanvasElement), { 
        fill = true, 
        aspect = null, 
        anchors: { x: ax = 'center', y: ay = 'center' } = {}, 
        offset: { x = 0, y = 0 } = {},
        margin = { t: 0, l: 0, r: 0, b: 0 },
        ...settings
    }: {
        fill?: boolean, 
        aspect?: (number | null), 
        anchors?: { x?: string, y?: string }, 
        offset?: { x?: number, y?: number }, 
        margin?: (number | { t?: number, l?: number, r?: number, b?: number })
    } = {}) {
        aspect = aspect || (image.height || (<HTMLImageElement>image).naturalHeight) / (image.width || (<HTMLImageElement>image).naturalWidth);
        if (typeof margin === 'number') margin = { t: margin, l: margin, r: margin, b: margin };
        const { t = 0, l = 0, r = 0, b = 0 } = margin;
        const maxWidth = this.width - l - r;
        const maxHeight = this.height - t - b;
    
        this.ctx.save();
        this._parseSettings(settings);
        const comparison = aspect / (maxHeight / maxWidth);
        if (comparison === 1) this.ctx.drawImage(image, x + l, y + t, maxWidth, maxHeight);
        else if ((comparison > 1) === fill) {
            // constrain height because image is taller (fit) or wider (fill)
            const height = maxWidth * aspect;
            const yOffset = ay === 'bottom' ? maxHeight - height: 
                ay === 'top' ? 0: (maxHeight - height) / 2;
            this.ctx.drawImage(image, x + l, yOffset + y + t, maxWidth, height);
        }
        else {
            // constrain width because image is wider (fit) or taller (fill)
            const width = maxHeight / aspect;
            const xOffset = ax === 'right' ? maxWidth - width: 
                ax === 'left' ? 0: (maxWidth - width) / 2;
            this.ctx.drawImage(image, xOffset + x + l, y + t, width, maxHeight);
        }
        this.ctx.restore();
    
        return this;
    }

    fillPattern(image: (HTMLImageElement | HTMLCanvasElement), {
        repeat = null, 
        stagger = null, 
        rotation = 0,
        offset: { x = 0, y = 0 } = { x: 0, y: 0 },
        margin: { x: mx = 0, y: my = 0 } = { x: 0, y: 0 }, 
        anchors: { x: ax = 'center', y: ay = 'center' } = {},
        ...settings
    }: {
        repeat?: (Vector2 | null),
        stagger?: (string | null),
        rotation?: number,
        offset?: Vector2,
        margin?: Vector2,
        anchors?: { x?: string, y?: string }
    } = {}) {
        const rotatedWidth = Math.abs(Math.cos(rotation) * this.width) + Math.abs(Math.sin(rotation) * this.height);
        const rotatedHeight = Math.abs(Math.cos(rotation) * this.height) + Math.abs(Math.sin(rotation) * this.width);
        repeat = repeat || {
            x: rotatedWidth / ((image.width || (<HTMLImageElement>image).naturalWidth) + mx),
            y: rotatedHeight / ((image.height || (<HTMLImageElement>image).naturalHeight) + my)
        }
        const size = { x: this.width / repeat.x, y: this.height / repeat.y };
    
        if (ax === 'center') x -= (Math.ceil(repeat.x) * size.x + mx - rotatedWidth) / 2;
        else if (ax === 'right') x -= Math.ceil(repeat.x) * size.x + mx - rotatedWidth;
        if (ay === 'center') y -= (Math.ceil(repeat.y) * size.y + my - rotatedHeight) / 2;
        else if (ay === 'bottom') y -= Math.ceil(repeat.y) * size.y + my - rotatedHeight;
        // for rotated patterns, extend repeats past width/height bounds
        const extend = {
            x: Math.ceil(repeat.x * rotatedWidth / (2 * this.width)),
            y: Math.ceil(repeat.y * rotatedHeight / (2 * this.height))
        }
    
        this.ctx.save();
        this._parseSettings(settings);
        if (rotation) {
            this.ctx.translate(this.width / 2, this.height / 2);
            this.ctx.rotate(rotation);
            this.ctx.translate(-rotatedWidth / 2, -rotatedHeight / 2);
        }
        for (let i = -extend.x; i < repeat.x + extend.x; i++) {
            let offsetX = x + mx + i * size.x;
            let offsetY = y + my;
            if (stagger && stagger === 'y' && i % 2) offsetY -= size.y / 2;
            for (let j = -extend.y; j < repeat.y + extend.y; j++) {
                this.ctx.drawImage(
                    image, 
                    (stagger && stagger === 'x' && j % 2) ? offsetX - size.x / 2: offsetX, 
                    offsetY + j * size.y, 
                    size.x - mx, 
                    size.y - my
                );
            }
        }
        this.ctx.restore();
    
        return this;
    }

    beginPath() {
        this.ctx.beginPath();
    
        return this;
    }

    stroke(settings?: ContextSettings) {
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.stroke();
        this.ctx.restore();
    
        return this;
    }

    closePath() {
        this.ctx.closePath();
    
        return this;
    }


    rectangle({ 
        offset: { x = 0, y = 0 } = { x: 0, y: 0 }, 
        width = this.width, height = this.height, 
        fill = false, stroke = false, 
        ...settings 
    }: { offset?: Vector2, width?: number, height?: number, fill?: boolean, stroke?: boolean }) {
        this.ctx.save();
        this._parseSettings(settings);
        const { color = undefined, strokeOptions = undefined }: ContextSettings = settings;
        if (fill || stroke || color || strokeOptions) {
            this.ctx.beginPath();
            this.ctx.rect(x, y, width, height);
            this.ctx.closePath();
            if (fill || color) this.fill();
            if (stroke || strokeOptions) this.stroke();
        }
        else this.ctx.rect(x, y, width, height);
        this.ctx.restore();
    
        return this;
    }

    arc({
        center: { x = this.width / 2, y = this.height / 2 } = { x: this.width / 2, y: this.height / 2 }, 
        radius = Math.min(this.width, this.height) / 2, 
        startAngle = 0, endAngle = 2 * Math.PI, cc = false, 
        fill = false, stroke = false, 
        ...settings 
    }: { center?: Vector2, radius?: number, startAngle?: 0, endAngle?: number, cc?: boolean, fill?: boolean, stroke?: boolean }) {
        this.ctx.save();
        this._parseSettings(settings);
        const { color = undefined, strokeOptions = undefined }: ContextSettings = settings;
        if (fill || stroke || color || strokeOptions) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, startAngle, endAngle, cc);
            this.ctx.closePath();
            if (fill || color) this.fill();
            if (stroke || strokeOptions) this.stroke();
        }
        else this.ctx.arc(x, y, radius, startAngle, endAngle, cc);
        this.ctx.restore();
    
        return this;
    }

    ellipse({ 
        center: { x = this.width / 2, y = this.height / 2 } = { x: this.width / 2, y: this.height / 2 }, 
        radius: { x: rx = this.width / 2, y: ry = this.height / 2 } = { x: this.width / 2, y: this.height / 2 },
        rotation = 0, startAngle = 0, endAngle = 2 * Math.PI, cc = false, 
        fill = false, stroke = false,
        ...settings 
    }: { center?: Vector2, radius?: Vector2, rotation?: number, startAngle?: 0, endAngle?: number, cc?: boolean, fill?: boolean, stroke?: boolean }) {
        this.ctx.save();
        this._parseSettings(settings);
        const { color = undefined, strokeOptions = undefined }: ContextSettings = settings;
        if (fill || stroke || color || strokeOptions) {
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, cc);
            this.ctx.closePath();
            if (fill || color) this.fill();
            if (stroke || strokeOptions) this.stroke();
        }
        else this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, cc);
        this.ctx.restore();
    
        return this;
    }

    roundedRectangle({ 
        offset: { x = 0, y = 0 } = { x: 0, y: 0 }, 
        width = this.width, height = this.height, radius, 
        fill = false, stroke = false,
        ...settings
    }: { offset?: Vector2, width?: number, height?: number, radius: (number | { tl: number, tr: number, bl: number, br: number }), fill?: boolean, stroke?: boolean }) {
        if (typeof radius === 'number') radius = { tl: radius, tr: radius, bl: radius, br: radius };
        const { tl, tr, bl, br } = radius;
        
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.beginPath();
        this.ctx.moveTo(x + tl, y);
        this.ctx.lineTo(x + width - tr, y);
        // TR
        this.ctx.arc(x + width - tr, y + tr, tr, Math.PI / 2, 0);
        this.ctx.lineTo(x + width, y + height - br);
        // BR
        this.ctx.arc(x + width - br, y + height - br, br, 0, Math.PI / 2);
        this.ctx.lineTo(x + bl, y + height);
        // BL
        this.ctx.arc(x + bl, y + height - bl, bl, -Math.PI / 2, -Math.PI);
        this.ctx.lineTo(x, y + tl);
        // TL
        this.ctx.arc(x + tl, y + tl, tl, Math.PI, Math.PI / 2);
        this.ctx.closePath();
        const { color = undefined, strokeOptions = undefined }: ContextSettings = settings;
        if (fill || color) this.fill();
        if (stroke || strokeOptions) this.stroke();
        this.ctx.restore();
    
        return this;
    }

    polygon(
        points: [ number, number ][] = [], 
        { closed = true, fill = false, stroke = false, ...settings }: { closed?: boolean, fill?: boolean, stroke?: boolean } = {}
    ) {
        if (!Array.isArray(points) || !points.length) return this;
    
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.beginPath();
        this.ctx.moveTo(...points[0]);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(...points[i]);
        }
        const { color = undefined, strokeOptions = undefined }: ContextSettings = settings;
        if (closed || fill || color) {
            this.ctx.closePath();
            if (fill || color) this.fill();
        }
        if (stroke || strokeOptions) this.stroke();
        this.ctx.restore();
    
        return this;
    }

    // TODO: Add other draw types (curves)


    drawImage(
        image: (HTMLImageElement | HTMLCanvasElement), 
        { position: { x = 0, y = 0 } = { x: 0, y: 0 }, rotation = 0, scale = 1, ...settings }: { position?: Vector2, rotation?: number, scale?: number } = {}
    ) {
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(
            image, 
            -image.width * scale / 2, 
            -image.height * scale / 2, 
            image.width * scale, 
            image.height * scale
        );
        this.ctx.restore();
    
        return this;
    }

    drawImageWithDimensions(
        image: (HTMLImageElement | HTMLCanvasElement), 
        { width, height, position: { x = 0, y = 0 } = { x: 0, y: 0 }, rotation = 0, ...settings }: { width: number, height: number, position?: Vector2, rotation?: number }
    ) {
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
        this.ctx.restore();
    
        return this;
    }


    chromaKey(color: (string | { r: number, g: number, b: number }), threshold: number = 0.01) {
        const rgb = (typeof color === 'string') ? hexToRgb(color): color;
        if (!rgb) {
            console.error(`Invalid color value: ${color}`);
            return this;
        }
        threshold = 3 * 255 * 255 * Math.pow(clamp(threshold, 0.01, 1), 2);
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        let distSq;
        for (let i = 0; i < imageData.data.length; i += 4) {
            distSq = Math.pow(imageData.data[i] - rgb.r, 2) + Math.pow(imageData.data[i + 1] - rgb.g, 2) + Math.pow(imageData.data[i + 2] - rgb.b, 2);
            if (distSq <= threshold) imageData.data[i + 3] = 0;
        }
        this.ctx.putImageData(imageData, 0, 0);
        return this;
    }

    download(format: string = 'image/jpeg', name: string = 'export.jpg') {
        const link = document.createElement('a');
        link.href = this.getDataURL(format);
        link.download = name;
        link.click();
    }

    getDataURL(format: string = 'image/jpeg', quality: number = 1) {
        return this.el.toDataURL(format, quality);
    }
    
    setDataURL(data: string) {
        const self = this;
        const image = new Image();
        return new Promise((resolve: Function) => {
            image.onload = () => {
                self.fillImage(image);
                resolve();
            }
            image.src = data;
        });
    }

    // TODO: screenshot of current webpage
}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
// I've added my own, more self-descriptive name for some operations
Object.defineProperty(UtilityCanvas, 'COMPOSITE', {
    value: {
        SOURCE_OVER: 'source-over',
        OVERWRITE: 'source-over',
        SOURCE_IN: 'source-in',
        INTERSECT_REPLACE: 'source-in',
        SOURCE_OUT: 'source-out',
        AVOID_REPLACE: 'source-out',
        SOURCE_ATOP: 'source-atop',
        INTERSECT_ALPHA: 'source-atop',
        DESTINATION_OVER: 'destination-over',
        BEHIND: 'destination-over',
        DESTINATION_IN: 'destination-in',
        MASK: 'destination-in',
        DESTINATION_OUT: 'destination-out',
        REMOVE: 'destination-out',
        DESTINATION_ATOP: 'destination-atop',
        MASK_BEHIND: 'destination-atop',
        LIGHTER: 'lighter',
        ADD: 'lighter',
        COPY: 'copy',
        REPLACE: 'copy',
        XOR: 'xor',
        MULTIPLY: 'multiply',
        SCREEN: 'screen',
        DIVIDE: 'screen',
        OVERLAY: 'overlay',
        EXAGGERATE: 'overlay',
        DARKEN: 'darken',
        MIN: 'darken',
        LIGHTEN: 'lighten',
        MAX: 'lighten',
        COLOR_DODGE: 'color-dodge',
        COLOR_BURN: 'color-burn',
        HARD_LIGHT: 'hard-light',
        SOFT_LIGHT: 'soft-light',
        DIFFERENCE: 'difference',
        EXCLUSION: 'exclusion',
        HUE: 'hue',
        SATURATION: 'saturation',
        COLOR: 'color',
        LUMINOSITY: 'luminosity'
    },
    writable: false,
    enumerable: true
});

(<any>window).UtilityCanvas = UtilityCanvas;

export { UtilityCanvas, clamp, hexToRgb }
export default UtilityCanvas