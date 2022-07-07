"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToRgb = exports.clamp = exports.UtilityCanvas = void 0;
var utils_1 = require("./utils");
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return utils_1.clamp; } });
Object.defineProperty(exports, "hexToRgb", { enumerable: true, get: function () { return utils_1.hexToRgb; } });
var UtilityCanvas = /** @class */ (function () {
    function UtilityCanvas(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.canvas, canvas = _c === void 0 ? document.createElement('canvas') : _c, _d = _b.width, width = _d === void 0 ? 1024 : _d, _e = _b.height, height = _e === void 0 ? 1024 : _e, _f = _b.parent, parent = _f === void 0 ? null : _f;
        this.el = canvas;
        this.width = canvas.width = width;
        this.height = canvas.height = height;
        var ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('Unable to get canvas context');
        this.ctx = ctx;
        if (parent)
            parent.appendChild(canvas);
    }
    UtilityCanvas.prototype.resize = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.width, width = _c === void 0 ? this.width : _c, _d = _b.height, height = _d === void 0 ? this.height : _d;
        this.width = this.el.width = width;
        this.height = this.el.height = height;
        return this;
    };
    UtilityCanvas.prototype.clearRect = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.offset, _d = _c === void 0 ? {} : _c, _e = _d.x, x = _e === void 0 ? 0 : _e, _f = _d.y, y = _f === void 0 ? 0 : _f, _g = _b.width, width = _g === void 0 ? this.width : _g, _h = _b.height, height = _h === void 0 ? this.height : _h;
        this.ctx.clearRect(x, y, width, height);
        return this;
    };
    UtilityCanvas.prototype.clear = function () {
        return this.clearRect();
    };
    UtilityCanvas.prototype.setColor = function (color) {
        if (color === void 0) { color = this.ctx.fillStyle; }
        this.ctx.fillStyle = color;
        return this;
    };
    UtilityCanvas.prototype.setStroke = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.thickness, thickness = _c === void 0 ? this.ctx.lineWidth : _c, _d = _b.color, color = _d === void 0 ? this.ctx.strokeStyle : _d;
        this.ctx.lineWidth = thickness;
        this.ctx.strokeStyle = color;
        return this;
    };
    UtilityCanvas.prototype.setCompositeOperation = function (operation) {
        if (operation === void 0) { operation = this.ctx.globalCompositeOperation; }
        if (UtilityCanvas.COMPOSITE[operation])
            this.ctx.globalCompositeOperation = UtilityCanvas.COMPOSITE[operation];
        else if (Object.values(UtilityCanvas.COMPOSITE).includes(operation))
            this.ctx.globalCompositeOperation = operation;
        else
            console.warn("Composite operation: '".concat(operation, "' does not exist."));
        return this;
    };
    UtilityCanvas.prototype.setAlpha = function (alpha) {
        if (alpha === void 0) { alpha = this.ctx.globalAlpha; }
        this.ctx.globalAlpha = alpha;
        return this;
    };
    UtilityCanvas.prototype._parseSettings = function (settings) {
        if (!settings)
            return this;
        var _a = settings.color, color = _a === void 0 ? undefined : _a, _b = settings.strokeSettings, strokeSettings = _b === void 0 ? undefined : _b, _c = settings.alpha, alpha = _c === void 0 ? undefined : _c, _d = settings.operation, operation = _d === void 0 ? undefined : _d;
        return this
            .setColor(color)
            .setStroke(strokeSettings)
            .setAlpha(alpha)
            .setCompositeOperation(operation);
    };
    UtilityCanvas.prototype.fill = function (settings) {
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.fill();
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.fillRect = function (_a) {
        if (_a === void 0) { _a = {}; }
        var _b = _a.offset, _c = _b === void 0 ? {} : _b, _d = _c.x, x = _d === void 0 ? 0 : _d, _e = _c.y, y = _e === void 0 ? 0 : _e, _f = _a.width, width = _f === void 0 ? this.width : _f, _g = _a.height, height = _g === void 0 ? this.height : _g, settings = __rest(_a, ["offset", "width", "height"]);
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.fillImage = function (image, _a) {
        if (_a === void 0) { _a = {}; }
        var _b = _a.preserveAspect, preserveAspect = _b === void 0 ? false : _b, settings = __rest(_a, ["preserveAspect"]);
        if (preserveAspect)
            return this.fillOrFitImage(image, __assign({ fill: typeof preserveAspect === 'boolean'
                    ? preserveAspect
                    : preserveAspect === 'fill' }, settings));
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.drawImage(image, 0, 0, this.width, this.height);
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.fillOrFitImage = function (image, _a) {
        if (_a === void 0) { _a = {}; }
        var _b = _a.fill, fill = _b === void 0 ? true : _b, _c = _a.aspect, aspect = _c === void 0 ? null : _c, _d = _a.anchors, _e = _d === void 0 ? {} : _d, _f = _e.x, ax = _f === void 0 ? 'center' : _f, _g = _e.y, ay = _g === void 0 ? 'center' : _g, _h = _a.offset, _j = _h === void 0 ? {} : _h, _k = _j.x, x = _k === void 0 ? 0 : _k, _l = _j.y, y = _l === void 0 ? 0 : _l, _m = _a.margin, margin = _m === void 0 ? { t: 0, l: 0, r: 0, b: 0 } : _m, settings = __rest(_a, ["fill", "aspect", "anchors", "offset", "margin"]);
        if (!aspect)
            aspect = (image.height || image.naturalHeight) / (image.width || image.naturalWidth);
        if (typeof margin === 'number')
            margin = { t: margin, l: margin, r: margin, b: margin };
        var _o = margin.t, t = _o === void 0 ? 0 : _o, _p = margin.l, l = _p === void 0 ? 0 : _p, _q = margin.r, r = _q === void 0 ? 0 : _q, _r = margin.b, b = _r === void 0 ? 0 : _r;
        var maxWidth = this.width - l - r;
        var maxHeight = this.height - t - b;
        this.ctx.save();
        this._parseSettings(settings);
        var comparison = aspect / (maxHeight / maxWidth);
        if (comparison === 1)
            this.ctx.drawImage(image, x + l, y + t, maxWidth, maxHeight);
        else if ((comparison > 1) === fill) {
            // constrain height because image is taller (fit) or wider (fill)
            var height = maxWidth * aspect;
            var yOffset = ay === 'bottom'
                ? maxHeight - height
                : ay === 'top'
                    ? 0
                    : (maxHeight - height) / 2;
            this.ctx.drawImage(image, x + l, yOffset + y + t, maxWidth, height);
        }
        else {
            // constrain width because image is wider (fit) or taller (fill)
            var width = maxHeight / aspect;
            var xOffset = ax === 'right'
                ? maxWidth - width
                : ax === 'left'
                    ? 0
                    : (maxWidth - width) / 2;
            this.ctx.drawImage(image, xOffset + x + l, y + t, width, maxHeight);
        }
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.fillImagePattern = function (image, _a) {
        if (_a === void 0) { _a = {}; }
        var _b = _a.repeat, repeat = _b === void 0 ? undefined : _b, _c = _a.stagger, stagger = _c === void 0 ? undefined : _c, _d = _a.rotation, rotation = _d === void 0 ? 0 : _d, _e = _a.offset, _f = _e === void 0 ? {} : _e, _g = _f.x, x = _g === void 0 ? 0 : _g, _h = _f.y, y = _h === void 0 ? 0 : _h, _j = _a.margin, _k = _j === void 0 ? {} : _j, _l = _k.x, mx = _l === void 0 ? 0 : _l, _m = _k.y, my = _m === void 0 ? 0 : _m, _o = _a.anchors, _p = _o === void 0 ? {} : _o, _q = _p.x, ax = _q === void 0 ? 'center' : _q, _r = _p.y, ay = _r === void 0 ? 'center' : _r, settings = __rest(_a, ["repeat", "stagger", "rotation", "offset", "margin", "anchors"]);
        var rotatedWidth = Math.abs(Math.cos(rotation) * this.width) + Math.abs(Math.sin(rotation) * this.height);
        var rotatedHeight = Math.abs(Math.cos(rotation) * this.height) + Math.abs(Math.sin(rotation) * this.width);
        repeat = repeat || {
            x: rotatedWidth / ((image.width || image.naturalWidth) + mx),
            y: rotatedHeight / ((image.height || image.naturalHeight) + my)
        };
        var size = {
            x: this.width / repeat.x,
            y: this.height / repeat.y
        };
        if (ax === 'center')
            x -= (Math.ceil(repeat.x) * size.x + mx - rotatedWidth) / 2;
        else if (ax === 'right')
            x -= Math.ceil(repeat.x) * size.x + mx - rotatedWidth;
        if (ay === 'center')
            y -= (Math.ceil(repeat.y) * size.y + my - rotatedHeight) / 2;
        else if (ay === 'bottom')
            y -= Math.ceil(repeat.y) * size.y + my - rotatedHeight;
        // for rotated patterns, extend repeats past width/height bounds
        var extend = {
            x: Math.ceil(repeat.x * rotatedWidth / (2 * this.width)),
            y: Math.ceil(repeat.y * rotatedHeight / (2 * this.height))
        };
        this.ctx.save();
        this._parseSettings(settings);
        if (rotation) {
            this.ctx.translate(this.width / 2, this.height / 2);
            this.ctx.rotate(rotation);
            this.ctx.translate(-rotatedWidth / 2, -rotatedHeight / 2);
        }
        for (var i = -extend.x; i < repeat.x + extend.x; i++) {
            var offsetX = x + mx + i * size.x;
            var offsetY = y + my;
            if (stagger && stagger === 'y' && i % 2)
                offsetY -= size.y / 2;
            for (var j = -extend.y; j < repeat.y + extend.y; j++) {
                this.ctx.drawImage(image, (stagger && stagger === 'x' && j % 2)
                    ? offsetX - size.x / 2
                    : offsetX, offsetY + j * size.y, size.x - mx, size.y - my);
            }
        }
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.beginPath = function () {
        this.ctx.beginPath();
        return this;
    };
    UtilityCanvas.prototype.stroke = function (settings) {
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.stroke();
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.closePath = function () {
        this.ctx.closePath();
        return this;
    };
    UtilityCanvas.prototype.rect = function (_a) {
        var _b = _a.offset, _c = _b === void 0 ? { x: 0, y: 0 } : _b, _d = _c.x, x = _d === void 0 ? 0 : _d, _e = _c.y, y = _e === void 0 ? 0 : _e, _f = _a.width, width = _f === void 0 ? this.width : _f, _g = _a.height, height = _g === void 0 ? this.height : _g, _h = _a.fill, fill = _h === void 0 ? false : _h, _j = _a.stroke, stroke = _j === void 0 ? false : _j, settings = __rest(_a, ["offset", "width", "height", "fill", "stroke"]);
        this.ctx.save();
        this._parseSettings(settings);
        var _k = settings.color, color = _k === void 0 ? undefined : _k, _l = settings.strokeSettings, strokeSettings = _l === void 0 ? undefined : _l;
        if (fill || stroke || color || strokeSettings) {
            this.ctx.beginPath();
            this.ctx.rect(x, y, width, height);
            this.ctx.closePath();
            if (fill || color)
                this.fill();
            if (stroke || strokeSettings)
                this.stroke();
        }
        else
            this.ctx.rect(x, y, width, height);
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.arc = function (_a) {
        var _b = _a.center, _c = _b === void 0 ? { x: this.width / 2, y: this.height / 2 } : _b, _d = _c.x, x = _d === void 0 ? this.width / 2 : _d, _e = _c.y, y = _e === void 0 ? this.height / 2 : _e, _f = _a.radius, radius = _f === void 0 ? Math.min(this.width, this.height) / 2 : _f, _g = _a.startAngle, startAngle = _g === void 0 ? 0 : _g, _h = _a.endAngle, endAngle = _h === void 0 ? 2 * Math.PI : _h, _j = _a.cc, cc = _j === void 0 ? false : _j, _k = _a.fill, fill = _k === void 0 ? false : _k, _l = _a.stroke, stroke = _l === void 0 ? false : _l, settings = __rest(_a, ["center", "radius", "startAngle", "endAngle", "cc", "fill", "stroke"]);
        this.ctx.save();
        this._parseSettings(settings);
        var _m = settings.color, color = _m === void 0 ? undefined : _m, _o = settings.strokeSettings, strokeSettings = _o === void 0 ? undefined : _o;
        if (fill || stroke || color || strokeSettings) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, startAngle, endAngle, cc);
            this.ctx.closePath();
            if (fill || color)
                this.fill();
            if (stroke || strokeSettings)
                this.stroke();
        }
        else
            this.ctx.arc(x, y, radius, startAngle, endAngle, cc);
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.ellipse = function (_a) {
        var _b = _a.center, _c = _b === void 0 ? { x: this.width / 2, y: this.height / 2 } : _b, _d = _c.x, x = _d === void 0 ? this.width / 2 : _d, _e = _c.y, y = _e === void 0 ? this.height / 2 : _e, _f = _a.radius, _g = _f === void 0 ? { x: this.width / 2, y: this.height / 2 } : _f, _h = _g.x, rx = _h === void 0 ? this.width / 2 : _h, _j = _g.y, ry = _j === void 0 ? this.height / 2 : _j, _k = _a.rotation, rotation = _k === void 0 ? 0 : _k, _l = _a.startAngle, startAngle = _l === void 0 ? 0 : _l, _m = _a.endAngle, endAngle = _m === void 0 ? 2 * Math.PI : _m, _o = _a.cc, cc = _o === void 0 ? false : _o, _p = _a.fill, fill = _p === void 0 ? false : _p, _q = _a.stroke, stroke = _q === void 0 ? false : _q, settings = __rest(_a, ["center", "radius", "rotation", "startAngle", "endAngle", "cc", "fill", "stroke"]);
        this.ctx.save();
        this._parseSettings(settings);
        var _r = settings.color, color = _r === void 0 ? undefined : _r, _s = settings.strokeSettings, strokeSettings = _s === void 0 ? undefined : _s;
        if (fill || stroke || color || strokeSettings) {
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, cc);
            this.ctx.closePath();
            if (fill || color)
                this.fill();
            if (stroke || strokeSettings)
                this.stroke();
        }
        else
            this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, cc);
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.roundedRectangle = function (_a) {
        var _b = _a.offset, _c = _b === void 0 ? {} : _b, _d = _c.x, x = _d === void 0 ? 0 : _d, _e = _c.y, y = _e === void 0 ? 0 : _e, _f = _a.width, width = _f === void 0 ? this.width : _f, _g = _a.height, height = _g === void 0 ? this.height : _g, radius = _a.radius, _h = _a.fill, fill = _h === void 0 ? false : _h, _j = _a.stroke, stroke = _j === void 0 ? false : _j, settings = __rest(_a, ["offset", "width", "height", "radius", "fill", "stroke"]);
        if (typeof radius === 'number')
            radius = { tl: radius, tr: radius, bl: radius, br: radius };
        var _k = radius.tl, tl = _k === void 0 ? 0 : _k, _l = radius.tr, tr = _l === void 0 ? 0 : _l, _m = radius.bl, bl = _m === void 0 ? 0 : _m, _o = radius.br, br = _o === void 0 ? 0 : _o;
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
        var _p = settings.color, color = _p === void 0 ? undefined : _p, _q = settings.strokeSettings, strokeSettings = _q === void 0 ? undefined : _q;
        if (fill || color)
            this.fill();
        if (stroke || strokeSettings)
            this.stroke();
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.polyline = function (points, _a) {
        var _b, _c;
        if (points === void 0) { points = []; }
        if (_a === void 0) { _a = {}; }
        var _d = _a.closed, closed = _d === void 0 ? false : _d, _e = _a.fill, fill = _e === void 0 ? false : _e, _f = _a.stroke, stroke = _f === void 0 ? false : _f, settings = __rest(_a, ["closed", "fill", "stroke"]);
        if (points.length < 2) {
            console.warn('Polyline not built: points array must have at least 2 points');
            return this;
        }
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.beginPath();
        (_b = this.ctx).moveTo.apply(_b, points[0]);
        for (var i = 1; i < points.length; i++) {
            (_c = this.ctx).lineTo.apply(_c, points[i]);
        }
        var _g = settings.color, color = _g === void 0 ? undefined : _g, _h = settings.strokeSettings, strokeSettings = _h === void 0 ? undefined : _h;
        if (closed || fill || color) {
            this.ctx.closePath();
            if (fill || color)
                this.fill();
        }
        if (stroke || strokeSettings)
            this.stroke();
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.polygon = function (_a) {
        var sides = _a.sides, _b = _a.sideLength, sideLength = _b === void 0 ? undefined : _b, _c = _a.radius, radius = _c === void 0 ? undefined : _c, _d = _a.center, _e = _d === void 0 ? {} : _d, _f = _e.x, x = _f === void 0 ? this.width / 2 : _f, _g = _e.y, y = _g === void 0 ? this.height / 2 : _g, _h = _a.rotation, rotation = _h === void 0 ? 0 : _h, _j = _a.closed, closed = _j === void 0 ? true : _j, settings = __rest(_a, ["sides", "sideLength", "radius", "center", "rotation", "closed"]);
        if (!sideLength && !radius) {
            console.warn('Error creating polygon: sideLength or radius must be specified');
            return this;
        }
        var r = radius || sideLength * Math.sin(Math.PI / sides);
        var points = [];
        for (var i = 0; i < sides; i++) {
            var angle = rotation + i * 2 * Math.PI / sides;
            points.push([
                x + r * Math.sin(angle),
                y + r * Math.cos(angle)
            ]);
        }
        return this.polyline(points, __assign({ closed: closed }, settings));
    };
    UtilityCanvas.prototype.rectangle = function (_a) {
        var width = _a.width, height = _a.height, _b = _a.center, _c = _b === void 0 ? {} : _b, _d = _c.x, x = _d === void 0 ? this.width / 2 : _d, _e = _c.y, y = _e === void 0 ? this.height / 2 : _e, _f = _a.rotation, rotation = _f === void 0 ? 0 : _f, _g = _a.closed, closed = _g === void 0 ? true : _g, settings = __rest(_a, ["width", "height", "center", "rotation", "closed"]);
        var r = Math.sqrt((width / 2) ^ 2 + (height / 2) ^ 2);
        var angle = Math.atan2(width, height);
        var reflectAngle = Math.PI - angle;
        var points = [];
        for (var i = 0; i < 4; i++) {
            var currAngle = rotation + Math.floor(i / 2) * Math.PI + i % 2 ? reflectAngle : angle;
            points.push([
                x + r * Math.sin(currAngle),
                y + r * Math.cos(currAngle)
            ]);
        }
        return this.polyline(points, __assign({ closed: closed }, settings));
    };
    UtilityCanvas.prototype.drawImage = function (image, _a) {
        if (_a === void 0) { _a = {}; }
        var _b = _a.center, _c = _b === void 0 ? { x: 0, y: 0 } : _b, _d = _c.x, x = _d === void 0 ? 0 : _d, _e = _c.y, y = _e === void 0 ? 0 : _e, _f = _a.rotation, rotation = _f === void 0 ? 0 : _f, _g = _a.scale, scale = _g === void 0 ? 1 : _g, settings = __rest(_a, ["center", "rotation", "scale"]);
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale);
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.drawImageWithDimensions = function (image, _a) {
        var width = _a.width, height = _a.height, _b = _a.center, _c = _b === void 0 ? { x: 0, y: 0 } : _b, _d = _c.x, x = _d === void 0 ? 0 : _d, _e = _c.y, y = _e === void 0 ? 0 : _e, _f = _a.rotation, rotation = _f === void 0 ? 0 : _f, settings = __rest(_a, ["width", "height", "center", "rotation"]);
        this.ctx.save();
        this._parseSettings(settings);
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
        this.ctx.restore();
        return this;
    };
    UtilityCanvas.prototype.chromaKey = function (color, threshold) {
        if (threshold === void 0) { threshold = 0.01; }
        var rgb = (typeof color === 'string') ? (0, utils_1.hexToRgb)(color) : color;
        if (!rgb) {
            console.error("Invalid color value: ".concat(color));
            return this;
        }
        threshold = 3 * 255 * 255 * Math.pow((0, utils_1.clamp)(threshold, 0.01, 1), 2);
        var imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        var distSq;
        for (var i = 0; i < imageData.data.length; i += 4) {
            distSq = Math.pow(imageData.data[i] - rgb.r, 2) + Math.pow(imageData.data[i + 1] - rgb.g, 2) + Math.pow(imageData.data[i + 2] - rgb.b, 2);
            if (distSq <= threshold)
                imageData.data[i + 3] = 0;
        }
        this.ctx.putImageData(imageData, 0, 0);
        return this;
    };
    UtilityCanvas.prototype.download = function (format, name) {
        if (format === void 0) { format = 'image/jpeg'; }
        if (name === void 0) { name = 'export.jpg'; }
        var link = document.createElement('a');
        link.href = this.getDataURL(format);
        link.download = name;
        link.click();
    };
    UtilityCanvas.prototype.getDataURL = function (format, quality) {
        if (format === void 0) { format = 'image/jpeg'; }
        if (quality === void 0) { quality = 1; }
        return this.el.toDataURL(format, quality);
    };
    UtilityCanvas.prototype.setDataURL = function (data) {
        var self = this;
        var image = new Image();
        return new Promise(function (resolve) {
            image.onload = function () {
                self.fillImage(image);
                resolve();
            };
            image.src = data;
        });
    };
    return UtilityCanvas;
}());
exports.UtilityCanvas = UtilityCanvas;
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
window.UtilityCanvas = UtilityCanvas;
exports.default = UtilityCanvas;
