/**
 * Colour maths for the contrast contract: parse a CSS colour, composite it, measure WCAG contrast.
 * No dependency; a theme's colours are hex, rgb(), hsl() or oklch(), with or without alpha.
 */

/** Red, green and blue, each 0 to 255. */
export type Rgb = readonly [number, number, number];
/** A parsed colour: its channels and its alpha (0 transparent to 1 opaque). */
export type Colour = { rgb: Rgb; alpha: number };

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

/** `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`; a minifier turns `rgba(…, .5)` into the last. */
function parseHex(value: string): Colour | undefined {
  const digits = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(value)?.[1];
  if (digits === undefined) return undefined;
  const full = digits.length <= 4 ? digits.replace(/./g, "$&$&") : digits;
  const byte = (at: number): number => Number.parseInt(full.slice(at, at + 2), 16);
  return { rgb: [byte(0), byte(2), byte(4)], alpha: full.length === 8 ? byte(6) / 255 : 1 };
}

/** A channel written as a number or a percentage, scaled to `full`. */
function scaled(token: string, full: number): number {
  return token.endsWith("%") ? (Number.parseFloat(token) / 100) * full : Number.parseFloat(token);
}

function alphaOf(token: string | undefined): number {
  return token === undefined ? 1 : clamp(scaled(token, 1), 0, 1);
}

function fromHsl(hue: number, saturation: number, lightness: number): Rgb {
  const chroma = (n: number): number => {
    const k = (n + hue / 30) % 12;
    const a = saturation * Math.min(lightness, 1 - lightness);
    return (lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
  };
  return [chroma(0), chroma(8), chroma(4)];
}

const toGamma = (linear: number): number =>
  255 * (linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055);

function fromOklch(lightness: number, chroma: number, hue: number): Rgb {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const [red = 0, green = 0, blue = 0] = linear.map((c) => clamp(toGamma(clamp(c, 0, 1)), 0, 255));
  return [red, green, blue];
}

function parseFunction(name: string, args: string[]): Colour | undefined {
  const [first = "", second = "", third = "", alpha] = args;
  if (name === "rgb" || name === "rgba") {
    const channel = (token: string): number => clamp(scaled(token, 255), 0, 255);
    return {
      rgb: [channel(first), channel(second), channel(third)],
      alpha: alphaOf(alpha),
    };
  }
  if (name === "hsl" || name === "hsla") {
    const hue = ((Number.parseFloat(first) % 360) + 360) % 360;
    return {
      rgb: fromHsl(hue, scaled(second, 1), scaled(third, 1)),
      alpha: alphaOf(alpha),
    };
  }
  if (name === "oklch") {
    return {
      rgb: fromOklch(scaled(first, 1), scaled(second, 0.4), Number.parseFloat(third)),
      alpha: alphaOf(alpha),
    };
  }
  return undefined;
}

/**
 * Parse a CSS colour: hex (3, 4, 6 or 8 digits), `rgb()`/`rgba()`, `hsl()`/`hsla()` and `oklch()`,
 * in the comma or the space-and-slash syntax, and `transparent`. `undefined` for anything else, so
 * the caller can say which colour it could not read instead of passing it unmeasured.
 */
export function parseColour(value: string): Colour | undefined {
  const text = value.trim().toLowerCase();
  if (text === "transparent") return { rgb: [0, 0, 0], alpha: 0 };
  const hex = parseHex(text);
  if (hex) return hex;
  const call = /^([a-z]+)\(([^()]*)\)$/.exec(text);
  if (!call) return undefined;
  const args = (call[2] ?? "")
    .replace("/", " ")
    .trim()
    .split(/[\s,]+/);
  return parseFunction(call[1] ?? "", args);
}

/** `colour` painted over an opaque `backdrop`: the colour the eye sees. */
export function composite(colour: Colour, backdrop: Rgb): Rgb {
  const mix = (at: 0 | 1 | 2): number =>
    colour.rgb[at] * colour.alpha + backdrop[at] * (1 - colour.alpha);
  return [mix(0), mix(1), mix(2)];
}

/** WCAG 2.x relative luminance. */
export function luminance(rgb: Rgb): number {
  const [red = 0, green = 0, blue = 0] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** WCAG contrast ratio of two opaque colours, 1 to 21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [high = 0, low = 0] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

/** `#rrggbb` for an opaque colour, for a message a person reads. */
export function toHex(rgb: Rgb): string {
  return `#${rgb
    .map((c) =>
      Math.round(clamp(c, 0, 255))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
