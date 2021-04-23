import { clamp, hexToRgb } from './utils.js';

class UtilityCanvas {
    constructor({ canvas = document.createElement('canvas'), width = 1024, height = 1024, parent = null } = {}) {
        this.canvas = canvas;
        this.width = canvas.width = width;
        this.height = canvas.height = height;
        this.ctx = canvas.ctx = canvas.getContext('2d');
        if (parent) parent.appendChild(canvas);
    }

    resize({ width = this.width, height = this.height }) {
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
        return this;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        return this;
    }

    // Settings
    setColor(color = null) {
        if (color) this.ctx.fillStyle = color;
        return this;
    }
    // add cap style, dashed lines, etc.
    setStroke({ thickness = null, color = null } = {}) {
        if (thickness) this.ctx.lineWidth = thickness;
        if (color) this.ctx.strokeStyle = color;
        return this;
    }
    setCompositeOperation(operation) {
        if (UtilityCanvas.COMPOSITE[ operation ]) this.ctx.globalCompositeOperation = UtilityCanvas.COMPOSITE[ operation ];
        else if (operation in Object.values(UtilityCanvas.COMPOSITE)) this.ctx.globalCompositeOperation = operation;
        else console.warn(`Composite operation: '${operation}' does not exist.`);
        return this;
    }

    // Fills
    fill(color = null) {
        this.ctx.save();
        this.setColor(color);
        this.ctx.fill();
        this.ctx.restore();
        return this;
    }
    fillColor(color) {
        this.setColor(color);
        this.ctx.fillRect(0, 0, this.width, this.height);
        return this;
    }
    fillTexture(image, preserveAspect = false) {
        if (preserveAspect) return this.fillOrFitTextureWithAspect({ image, fill: preserveAspect === 'fill' });
        else this.ctx.drawImage(image, 0, 0, this.width, this.height);
        return this;
    }
    fillOrFitTextureWithAspect({ 
        image, fill = true, aspect = null, 
        anchors = { x: 'center', y: 'center' }, 
        offset = { x: 0, y: 0 },
        margin = { t: 0, l: 0, r: 0, b: 0 }
    }) {
        aspect = aspect || (image.naturalHeight || image.height) / (image.naturalWidth || image.width);
        if (typeof margin === 'number') margin = { t: margin, l: margin, r: margin, b: margin }
        const { t, l, r, b } = margin;
        const maxWidth = this.width - l - r;
        const maxHeight = this.height - t - b;

        const comparison = aspect / (maxHeight / maxWidth);
        if (comparison === 1) this.ctx.drawImage(image, offset.x + l, offset.y + t, maxWidth, maxHeight);
        else if ((comparison > 1) === fill) {
            // constrain height because image is taller (fit) or wider (fill)
            const height = maxWidth * aspect;
            const yOffset = anchors.y === 'bottom' ? maxHeight - height: 
                anchors.y === 'top' ? 0: (maxHeight - height) / 2;
            this.ctx.drawImage(image, offset.x + l, yOffset + offset.y + t, maxWidth, height);
        }
        else {
            // constrain width because image is wider (fit) or taller (fill)
            const width = maxHeight / aspect;
            const xOffset = anchors.x === 'right' ? maxWidth - width: 
                anchors.x === 'left' ? 0: (maxWidth - width) / 2;
            this.ctx.drawImage(image, xOffset + offset.x + l, offset.y + t, width, maxHeight);
        }
        if (t || l || r || b) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-in';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(t, l, maxWidth, maxHeight);
            this.ctx.restore();
        }
        return this;
    }
    fillBackground({ color = null, image = null, alpha = this.ctx.globalAlpha } = {}) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-over';
        this.ctx.globalAlpha = alpha;
        if (color) this.fillColor(color);
        else if (image) this.ctx.drawImage(image, 0, 0, this.width, this.height);
        this.ctx.restore();
        return this;
    }

    // Stroke
    beginPath() {
        this.ctx.beginPath();
        return this;
    }
    stroke(strokeOptions = {}) {
        this.ctx.save();
        this.setStroke(strokeOptions);
        this.ctx.stroke();
        this.ctx.restore();
        return this;
    }
    closePath() {
        this.ctx.closePath();
        return this;
    }

    // Shapes
    rectangle({ position: { x = 0, y = 0 } = {}, width = this.width, height = this.height, fill = false, stroke = false }) {
        if (fill || stroke) {
            this.ctx.beginPath();
            this.ctx.rect(x, y, width, height);
            this.ctx.closePath();
            if (fill) this.fill(fill);
            if (stroke) this.stroke(stroke);
        }
        else this.ctx.rect(x, y, width, height);
        return this;
    }
    arc({ center: { x, y }, radius, startAngle = 0, endAngle = 2 * Math.PI, cc = false, fill = false, stroke = false }) {
        if (fill || stroke) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, startAngle, endAngle, cc);
            this.ctx.closePath();
            if (fill) this.fill(fill);
            if (stroke) this.stroke(stroke);
        }
        else this.ctx.arc(x, y, radius, startAngle, endAngle, cc);
        return this;
    }
    ellipse({ center: { x, y }, radius: { x: rx, y: ry }, rotation = 0, startAngle = 0, endAngle = 2 * Math.PI, cc = false, fill = false, stroke = false }) {
        if (fill || stroke) {
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, cc);
            this.ctx.closePath();
            if (fill) this.fill(fill);
            if (stroke) this.stroke(stroke);
        }
        else this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, cc);
        return this;
    }
    roundedRectangle({ position: { x = 0, y = 0 }, width = this.width, height = this.height, radius, fill = false, stroke = false }) {
        if (typeof radius === 'number') radius = { tl: radius, tr: radius, bl: radius, br: radius }
        const { tl, tr, bl, br } = radius;
        
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
        if (fill) this.fill(fill);
        if (stroke) this.stroke(stroke);
        return this;
    }
    draw({ points = [], closed = true, fill = false, stroke = false } = {}) {
        if (!Array.isArray(points) || !points.length) return this;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0]);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i]);
        }
        if (closed) {
            this.ctx.closePath();
            if (fill) this.fill(fill);
        }
        if (stroke) this.stroke(stroke);
        return this;
    }
    // TODO: Add other draw types (curves)

    // Textures
    drawTexture({ image, position: { x = 0, y = 0 } = {}, rotation = 0, scale = 1 }) {
        this.ctx.save();
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
    intersect(image) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-in';
        this.ctx.drawImage(image, 0, 0, this.width, this.height);
        this.ctx.restore();
        return this;
    }
    intersectWithRotation(image, rotation) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-in';
        this.draw(image, { x: 0.5, y: 0.5 }, rotation, this.width / (1.414 * image.width));
        this.ctx.restore();
        return this;
    }
    removeTexture({ image, position: { x = 0, y = 0 } = {}, rotation = 0, scale = 1 }) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.globalCompositeOperation = 'destination-out';
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

    chromaKey(color, threshold = 0.01) {
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

    // Import/Export
    download(format = 'image/jpeg', name = 'export.jpg') {
        const link = document.createElement('a');
        link.download = name;
        link.href = this.getDataURL(format);
        link.click();
    }
    getDataURL(format = 'image/jpeg', quality = 1) {
        return this.canvas.toDataURL(format, quality);
    }
    setDataURL(data) {
        const self = this;
        const image = new Image();
        return new Promise(resolve => {
            image.onload = () => {
                self.fillTexture(image);
                resolve();
            }
            image.src = data;
        });
    }
    // TODO: screenshot of current webpage
}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
Object.defineProperty(UtilityCanvas, 'COMPOSITE', {
    value: {
        SOURCE_OVER: 'source-over',
        SOURCE_IN: 'source-in',
        SOURCE_OUT: 'source-out',
        SOURCE_ATOP: 'source-atop',
        DESTINATION_OVER: 'destination-over',
        DESTINATION_IN: 'destination-in',
        DESTINATION_OUT: 'destination-out',
        DESTINATION_ATOP: 'destination-atop',
        LIGHTER: 'lighter',
        COPY: 'copy',
        XOR: 'xor',
        MULTIPLY: 'multiply',
        SCREEN: 'screen',
        OVERLAY: 'overlay',
        DARKEN: 'darken',
        LIGHTEN: 'lighten',
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

window.UtilityCanvas = UtilityCanvas;

export { UtilityCanvas, clamp, hexToRgb }
export default UtilityCanvas