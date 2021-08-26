declare const clamp: (val: number, min: number, max: number) => number;
declare const hexToRgb: (hex: string) => {
    r: number;
    g: number;
    b: number;
} | null;
export { clamp, hexToRgb };
