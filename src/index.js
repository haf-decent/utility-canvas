import { clamp, hexToRgb } from './utils.js';

function UtilityCanvas({ canvas = document.createElement('canvas'), width = 1024, height = 1024, parent = null } = {}) {
    this.el = canvas;
    this.width = canvas.width = width;
    this.height = canvas.height = height;
    this.ctx = canvas.ctx = canvas.getContext('2d');
    if (parent) parent.appendChild(canvas);
}

UtilityCanvas.prototype.resize = function({ width = this.width, height = this.height }) {
    this.width = this.el.width = width;
    this.height = this.el.height = height;

    return this;
}

UtilityCanvas.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    return this;
}

// Settings
UtilityCanvas.prototype._parseSettings = function(settings) {
    if (!settings) return this;
    const { color = null, strokeOptions = {}, alpha = null, operation = null } = settings;
    this.setColor(color);
    this.setStroke(strokeOptions);
    this.setAlpha(alpha);
    this.setCompositeOperation(operation);

    return this;
}

UtilityCanvas.prototype.setColor = function(color = this.ctx.fillStyle) {
    this.ctx.fillStyle = color;

    return this;
}

UtilityCanvas.prototype.setStroke = function({ thickness = this.ctx.lineWidth, color = this.ctx.strokeStyle } = {}) {
    this.ctx.lineWidth = thickness;
    this.ctx.strokeStyle = color;

    return this;
}

UtilityCanvas.prototype.setCompositeOperation = function(operation = this.ctx.globalCompositeOperation) {
    if (UtilityCanvas.COMPOSITE[ operation ]) this.ctx.globalCompositeOperation = UtilityCanvas.COMPOSITE[ operation ];
    else if (operation in Object.values(UtilityCanvas.COMPOSITE)) this.ctx.globalCompositeOperation = operation;
    else console.warn(`Composite operation: '${operation}' does not exist.`);

    return this;
}

UtilityCanvas.prototype.setAlpha = function(alpha = this.ctx.globalAlpha) {
    this.ctx.globalAlpha = alpha;

    return this;
}

// Fills
UtilityCanvas.prototype.fill = function(settings) {
    this.ctx.save();
    this._parseSettings(settings);
    this.ctx.fill();
    this.ctx.restore();

    return this;
}

UtilityCanvas.prototype.fillRect = function({ offset: { x = 0, y = 0 } = {}, width = this.width, height = this.height, ...settings } = {}) {
    this.ctx.save();
    this._parseSettings(settings);
    this.ctx.fillRect(x, y, width, height);
    this.ctx.restore();

    return this;
}

UtilityCanvas.prototype.fillColor = function(settings) {
    return this.fillRect(settings);
}

UtilityCanvas.prototype.fillImage = function(image, { preserveAspect = false, ...settings } = {}) {
    if (preserveAspect) return this.fillOrFitImage(image, { fill: preserveAspect === 'fill', ...settings });
    else {
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.drawImage(image, 0, 0, this.width, this.height);
        this.ctx.restore();
    }

    return this;
}

UtilityCanvas.prototype.fillOrFitImage = function(image, { 
    fill = true, aspect = null, 
    anchors: { x: ax = 'center', y: ay = 'center' } = {}, 
    offset: { x = 0, y = 0 } = {},
    margin = { t: 0, l: 0, r: 0, b: 0 },
    ...settings
} = {}) {
    aspect = aspect || (image.naturalHeight || image.height) / (image.naturalWidth || image.width);
    if (typeof margin === 'number') margin = { t: margin, l: margin, r: margin, b: margin }
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
    // if (t || l || r || b) {
    //     this.ctx.globalCompositeOperation = 'destination-in';
    //     this.ctx.fillStyle = '#ffffff';
    //     this.ctx.fillRect(t, l, maxWidth, maxHeight);
    // }
    this.ctx.restore();

    return this;
}

// Stroke
UtilityCanvas.prototype.beginPath = function() {
    this.ctx.beginPath();

    return this;
}

UtilityCanvas.prototype.stroke = function(settings) {
    this.ctx.save();
    this._parseSettings(settings);
    this.ctx.stroke();
    this.ctx.restore();

    return this;
}

UtilityCanvas.prototype.closePath = function() {
    this.ctx.closePath();

    return this;
}

// Shapes
UtilityCanvas.prototype.rectangle = function({ 
    offset: { x = 0, y = 0 } = {}, width = this.width, height = this.height, 
    fill = false, stroke = false, 
    ...settings 
}) {
    this.ctx.save();
    this._parseSettings(settings);
    if (fill || stroke) {
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.closePath();
        if (fill) this.fill(fill);
        if (stroke) this.stroke(stroke);
    }
    else this.ctx.rect(x, y, width, height);
    this.ctx.restore();

    return this;
}

UtilityCanvas.prototype.arc = function({
    center: { x = this.width / 2, y = this.height / 2 } = {}, radius = Math.min(this.width, this.height) / 2, 
    startAngle = 0, endAngle = 2 * Math.PI, cc = false, 
    fill = false, stroke = false, 
    ...settings 
}) {
    this.ctx.save();
    this._parseSettings(settings);
    if (fill || stroke) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, startAngle, endAngle, cc);
        this.ctx.closePath();
        if (fill) this.fill(fill);
        if (stroke) this.stroke(stroke);
    }
    else this.ctx.arc(x, y, radius, startAngle, endAngle, cc);
    this.ctx.restore();

    return this;
}

UtilityCanvas.prototype.ellipse = function({ 
    center: { x, y }, radius: { x: rx, y: ry }, rotation = 0, 
    startAngle = 0, endAngle = 2 * Math.PI, cc = false, 
    fill = false, stroke = false,
    ...settings 
}) {
    this.ctx.save();
    this._parseSettings(settings);
    if (fill || stroke) {
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, cc);
        this.ctx.closePath();
        if (fill) this.fill(fill);
        if (stroke) this.stroke(stroke);
    }
    else this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, cc);
    this.ctx.restore();

    return this;
}

UtilityCanvas.prototype.roundedRectangle = function({ 
    offset: { x = 0, y = 0 } = {}, width = this.width, height = this.height, radius, 
    fill = false, stroke = false,
    ...settings
}) {
    if (typeof radius === 'number') radius = { tl: radius, tr: radius, bl: radius, br: radius }
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
    if (fill) this.fill(fill);
    if (stroke) this.stroke(stroke);
    this.ctx.restore();

    return this;
}

UtilityCanvas.prototype.polygon = function(points = [], { closed = true, fill = false, stroke = false, ...settings } = {}) {
    if (!Array.isArray(points) || !points.length) return this;

    this.ctx.save();
    this._parseSettings(settings);
    this.ctx.beginPath();
    this.ctx.moveTo(points[0]);
    for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i]);
    }
    if (closed || fill) {
        this.ctx.closePath();
        if (fill) this.fill(fill);
    }
    if (stroke) this.stroke(stroke);
    this.ctx.restore();

    return this;
}

// TODO: Add other draw types (curves)

// Images
UtilityCanvas.prototype.drawImage = function(image, { position: { x = 0, y = 0 } = {}, rotation = 0, scale = 1, ...settings }) {
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

UtilityCanvas.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    return this;
}

UtilityCanvas.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    return this;
}

// Shaders
UtilityCanvas.prototype.chromaKey = function(color, threshold = 0.01) {
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
UtilityCanvas.prototype.download = function(format = 'image/jpeg', name = 'export.jpg') {
    const link = document.createElement('a');
    link.href = this.getDataURL(format);
    link.download = name;
    link.click();
}

UtilityCanvas.prototype.getDataURL = function(format = 'image/jpeg', quality = 1) {
    return this.el.toDataURL(format, quality);
}

UtilityCanvas.prototype.setDataURL = function(data) {
    const self = this;
    const image = new Image();
    return new Promise(resolve => {
        image.onload = () => {
            self.fillImage(image);
            resolve();
        }
        image.src = data;
    });
}

// TODO: screenshot of current webpage

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