import { describe, expect, it } from "vitest";
import {
  composite,
  contrastRatio,
  distance,
  luminance,
  oklab,
  parseColour,
  toHex,
} from "./colour.js";

describe("parseColour", () => {
  it("reads hex in 3, 4, 6 and 8 digits", () => {
    expect(parseColour("#fff")).toEqual({ rgb: [255, 255, 255], alpha: 1 });
    expect(parseColour("#1e1e2e")).toEqual({ rgb: [30, 30, 46], alpha: 1 });
    expect(parseColour("#0000")).toEqual({ rgb: [0, 0, 0], alpha: 0 });
    expect(parseColour("#cba6f780")?.alpha).toBeCloseTo(0.5, 2);
  });

  it("reads rgb() and rgba() in the comma and the space-and-slash syntax", () => {
    expect(parseColour("rgba(243, 139, 168, 0.45)")).toEqual({ rgb: [243, 139, 168], alpha: 0.45 });
    expect(parseColour("rgb(243 139 168 / 45%)")).toEqual({ rgb: [243, 139, 168], alpha: 0.45 });
    expect(parseColour("rgb(10%, 20%, 30%)")?.rgb).toEqual([25.5, 51, 76.5]);
  });

  it("reads hsl() and oklch()", () => {
    const red = parseColour("hsl(0 100% 50%)")?.rgb ?? [];
    expect(red.map(Math.round)).toEqual([255, 0, 0]);
    const white = parseColour("oklch(1 0 0)")?.rgb ?? [];
    expect(white.map(Math.round)).toEqual([255, 255, 255]);
    const black = parseColour("oklch(0 0 0 / .5)");
    expect(black?.rgb.map(Math.round)).toEqual([0, 0, 0]);
    expect(black?.alpha).toBe(0.5);
  });

  it("reads transparent, and is undefined for what it cannot read", () => {
    expect(parseColour("transparent")?.alpha).toBe(0);
    expect(parseColour("var(--x)")).toBeUndefined();
    expect(parseColour("currentColor")).toBeUndefined();
    expect(parseColour("#12")).toBeUndefined();
  });
});

describe("contrast maths", () => {
  it("gives black on white 21:1 and a colour on itself 1:1", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastRatio([30, 30, 46], [30, 30, 46])).toBe(1);
  });

  it("is symmetric and uses the sRGB threshold of 0.04045", () => {
    expect(contrastRatio([119, 119, 119], [255, 255, 255])).toBeCloseTo(4.48, 2);
    expect(contrastRatio([255, 255, 255], [119, 119, 119])).toBeCloseTo(4.48, 2);
    expect(luminance([10, 10, 10])).toBeCloseTo(10 / 255 / 12.92, 6);
  });

  it("composites a translucent colour over a backdrop", () => {
    expect(composite({ rgb: [255, 255, 255], alpha: 0.5 }, [0, 0, 0])).toEqual([
      127.5, 127.5, 127.5,
    ]);
    expect(composite({ rgb: [9, 9, 9], alpha: 1 }, [200, 200, 200])).toEqual([9, 9, 9]);
  });

  it("prints a hex a person can read", () => {
    expect(toHex([30, 30, 46])).toBe("#1e1e2e");
    expect(toHex([300, -4, 127.6])).toBe("#ff0080");
  });
});

describe("OKLab maths", () => {
  it("puts white at full lightness, black at none, and red on its known axes", () => {
    const [wL, wA, wB] = oklab([255, 255, 255]);
    expect(wL).toBeCloseTo(1, 5);
    expect(wA).toBeCloseTo(0, 5);
    expect(wB).toBeCloseTo(0, 5);
    expect(oklab([0, 0, 0])).toEqual([0, 0, 0]);
    const [lightness, a, b] = oklab([255, 0, 0]);
    expect(lightness).toBeCloseTo(0.628, 3);
    expect(a).toBeCloseTo(0.2249, 3);
    expect(b).toBeCloseTo(0.1258, 3);
  });

  it("measures distance as how far apart two colours look", () => {
    expect(distance([30, 30, 46], [30, 30, 46])).toBe(0);
    expect(distance([255, 0, 0], [0, 255, 0])).toBeCloseTo(0.52, 2);
  });
});
