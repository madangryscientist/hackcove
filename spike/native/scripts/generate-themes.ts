/**
 * D3 spike: turn every `themes/*\/theme.css` (by glob, no theme named) plus Tailwind's own oklch
 * palette into React Native style maps, one per theme, keyed by the palette.json utility.
 *
 *   bun scripts/generate-themes.ts        writes src/generated/themes.json
 *
 * Read-only on the repo: it reads packages/ui/palette.json, themes/*\/theme.css and tailwindcss's
 * theme.css (through packages/ui's install) and writes only inside spike/native.
 */
import { Glob } from "bun";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "../../..");
const OUT = resolve(import.meta.dir, "../src/generated/themes.json");

export type RNStyle = Record<string, string | number>;
/** A theme rule that a per-utility map cannot hold: `.disabled\:opacity-50:disabled:is(.bg-violet-600, …)`. */
export type Compound = { utility: string; requiresAny: string[]; style: RNStyle };
export type ThemeMap = {
  scheme: "light" | "dark";
  scope: string | null;
  base: { backgroundColor: string | null; color: string | null; fontFamily: string | null };
  utilities: Record<string, RNStyle>;
  compounds: Compound[];
};

/* ---------- palette.json ---------- */

export function readPalette(): string[] {
  const groups = JSON.parse(readFileSync(join(ROOT, "packages/ui/palette.json"), "utf8")) as Record<
    string,
    string[]
  >;
  return [...new Set(Object.values(groups).flat())].sort();
}

/* ---------- colour values ---------- */

const COLOUR = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|transparent)$/i;

function checkColour(value: string, where: string): string {
  if (!COLOUR.test(value)) throw new Error(`${where}: "${value}" is not a colour RN can parse`);
  // One canonical form: lower-case hex, `rgba(r, g, b, a)` (Thrifty writes `rgba( 185, 28, 28, 0.7 )`).
  return value
    .toLowerCase()
    .replace(/\(\s*/, "(")
    .replace(/\s*\)/, ")")
    .replace(/\s*,\s*/g, ", ");
}

/** oklch → sRGB hex, clipped per channel (what Chromium does on an sRGB display). */
export function oklchToHex(
  L: number,
  C: number,
  H: number,
  alpha = 1,
): { hex: string; clipped: boolean } {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  let clipped = false;
  const rgb = lin.map((x) => {
    const g = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    if (g < -0.001 || g > 1.001) clipped = true;
    return Math.round(Math.min(1, Math.max(0, g)) * 255);
  });
  return { hex: toHexOrRgba(rgb as [number, number, number], alpha), clipped };
}

function toHexOrRgba([r, g, b]: [number, number, number], alpha: number): string {
  if (alpha >= 1) return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`;
}

/* ---------- Tailwind's default palette ---------- */

export function tailwindThemeCss(): string {
  return readFileSync(join(ROOT, "packages/ui/node_modules/tailwindcss/theme.css"), "utf8");
}

/** `--color-<name>: …` from Tailwind's theme.css, as sRGB triples. */
export function tailwindColours(): {
  colours: Map<string, [number, number, number]>;
  clipped: string[];
} {
  const colours = new Map<string, [number, number, number]>();
  const clipped: string[] = [];
  for (const m of tailwindThemeCss().matchAll(/--color-([a-z]+(?:-\d+)?):\s*([^;]+);/g)) {
    const [, name, raw] = m as unknown as [string, string, string];
    const value = raw.trim();
    const ok = /^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+|none)\)$/.exec(value);
    if (ok) {
      const res = oklchToHex(
        Number(ok[1]) / 100,
        Number(ok[2]),
        ok[3] === "none" ? 0 : Number(ok[3]),
      );
      if (res.clipped) clipped.push(name);
      colours.set(name, hexToRgb(res.hex));
    } else if (/^#[0-9a-f]{3,6}$/i.test(value)) {
      colours.set(name, hexToRgb(value));
    } else {
      throw new Error(`tailwind --color-${name}: unhandled value ${value}`);
    }
  }
  return { colours, clipped };
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Which RN style property a colour utility's prefix sets. */
const COLOUR_PROP: Record<string, string> = {
  bg: "backgroundColor",
  text: "color",
  border: "borderColor",
  outline: "outlineColor",
  accent: "accentColor",
};

/** Parse `[variant:]prefix-colour[/alpha]` into its parts. */
export function parseColourUtility(utility: string) {
  const m = /^(?:([a-z-]+):)?(bg|text|border|outline|accent)-([a-z]+(?:-\d+)?)(?:\/(\d+))?$/.exec(
    utility,
  );
  if (!m) throw new Error(`not a colour utility: ${utility}`);
  return {
    variant: m[1] ?? null,
    prop: COLOUR_PROP[m[2]!]!,
    colour: m[3]!,
    alpha: m[4] === undefined ? 1 : Number(m[4]) / 100,
  };
}

/** The `default` map: every palette utility in Tailwind's own colours. */
export function defaultMap(palette: string[]): { map: ThemeMap; clipped: string[] } {
  const { colours, clipped } = tailwindColours();
  const utilities: Record<string, RNStyle> = {};
  for (const utility of palette) {
    const { prop, colour, alpha } = parseColourUtility(utility);
    const rgb = colours.get(colour);
    if (!rgb) throw new Error(`default: no Tailwind colour "${colour}" for ${utility}`);
    utilities[utility] = { [prop]: toHexOrRgba(rgb, alpha) };
  }
  return {
    map: {
      scheme: "light",
      scope: null,
      base: { backgroundColor: "#ffffff", color: null, fontFamily: null },
      utilities,
      compounds: [],
    },
    clipped: [...new Set(clipped)].sort(),
  };
}

/* ---------- a theme.css ---------- */

const CSS_TO_RN: Record<string, string> = {
  "background-color": "backgroundColor",
  color: "color",
  "border-color": "borderColor",
  "outline-color": "outlineColor",
  "accent-color": "accentColor",
  opacity: "opacity",
  "font-weight": "fontWeight",
};
/** Declarations a native map has no use for (web-only, or carried elsewhere). Listed, so nothing is dropped silently. */
const WEB_ONLY = new Set([
  "transition",
  "text-underline-offset",
  "color-scheme",
  "font-family",
  "--font-mono",
  "--font-sans",
]);

function declarations(body: string, where: string, unmapped: Set<string>): RNStyle {
  const style: RNStyle = {};
  for (const decl of body.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl
      .slice(i + 1)
      .replace(/\s+/g, " ")
      .trim();
    if (!prop) continue;
    const rn = CSS_TO_RN[prop];
    if (rn === undefined) {
      if (!WEB_ONLY.has(prop)) unmapped.add(`${where} { ${prop} }`);
      continue;
    }
    if (rn === "opacity") style[rn] = Number(value);
    else if (rn === "fontWeight") style[rn] = value;
    else style[rn] = checkColour(value, `${where} ${prop}`);
  }
  return style;
}

const unescape = (s: string) => s.replace(/\\(.)/g, "$1");

export function parseTheme(css: string, file: string): { map: ThemeMap; unmapped: string[] } {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const scheme = /@custom-variant\s+dark\b/.test(src) ? "dark" : "light";
  const unmapped = new Set<string>();
  const utilities: Record<string, RNStyle> = {};
  const compounds: Compound[] = [];
  let scope: string | null = null;
  const base: ThemeMap["base"] = { backgroundColor: null, color: null, fontFamily: null };

  for (const rule of src.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    const selectorList = rule[1]!.trim();
    const body = rule[2]!;
    if (scope === null) {
      const first = /^\.([\w-]+)$/.exec(selectorList);
      if (!first) throw new Error(`${file}: the first rule is not the scope rule: ${selectorList}`);
      scope = first[1]!;
      const d = declarations(body, `${file} .${scope}`, unmapped);
      base.backgroundColor = (d.backgroundColor as string) ?? null;
      base.color = (d.color as string) ?? null;
      const font = /--font-sans:([^;]+);/.exec(body);
      base.fontFamily = font ? font[1]!.replace(/\s+/g, " ").trim() : null;
      continue;
    }
    for (const selector of selectorList.split(/,(?![^(]*\))/).map((s) => s.trim())) {
      const m = new RegExp(`^\\.${scope}\\s+\\.((?:\\\\.|[\\w-])+)(.*)$`).exec(selector);
      if (!m) {
        unmapped.add(`${file}: selector ${selector}`);
        continue;
      }
      const utility = unescape(m[1]!);
      const rest = m[2]!;
      const style = declarations(body, `${file} ${selector}`, unmapped);
      const is = /:is\(([^)]*)\)/.exec(rest);
      if (is) {
        compounds.push({
          utility,
          requiresAny: is[1]!.split(",").map((c) => unescape(c.trim().replace(/^\./, ""))),
          style,
        });
      } else {
        utilities[utility] = { ...utilities[utility], ...style };
      }
    }
  }
  if (scope === null) throw new Error(`${file}: no scope rule`);
  return { map: { scheme, scope, base, utilities, compounds }, unmapped: [...unmapped] };
}

/** Every theme folder, by glob. */
export function readThemes(): { name: string; css: string; file: string }[] {
  const glob = new Glob("themes/*/theme.css");
  return [...glob.scanSync({ cwd: ROOT })].sort().map((file) => ({
    name: basename(dirname(file)),
    css: readFileSync(join(ROOT, file), "utf8"),
    file,
  }));
}

export function generate() {
  const palette = readPalette();
  const def = defaultMap(palette);
  const themes: Record<string, ThemeMap> = { default: def.map };
  const unmapped: string[] = [];
  for (const t of readThemes()) {
    const parsed = parseTheme(t.css, t.file);
    themes[t.name] = parsed.map;
    unmapped.push(...parsed.unmapped);
  }
  return { palette, themes, unmapped, clipped: def.clipped };
}

if (import.meta.main) {
  const { palette, themes, unmapped, clipped } = generate();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ palette, themes }, null, 2) + "\n");
  for (const [name, map] of Object.entries(themes)) {
    const missing = palette.filter((u) => !(u in map.utilities));
    console.log(
      `${name.padEnd(18)} scope=${String(map.scope).padEnd(14)} ${map.scheme}  ` +
        `${palette.length - missing.length}/${palette.length} palette utilities` +
        (map.compounds.length ? `, ${map.compounds.length} compound rule(s)` : "") +
        (missing.length ? `  MISSING: ${missing.join(" ")}` : ""),
    );
  }
  if (unmapped.length) console.log("not carried to native:\n  " + unmapped.join("\n  "));
  console.log(`Tailwind colours outside sRGB (clipped): ${clipped.length}`);
  console.log(`wrote ${OUT}`);
}
