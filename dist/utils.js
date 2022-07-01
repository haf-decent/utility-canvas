"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToRgb = exports.clamp = void 0;
const clamp = (val, min, max) => Math.min(Math.max(min, val), max);
exports.clamp = clamp;
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
exports.hexToRgb = hexToRgb;
