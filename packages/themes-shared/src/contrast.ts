import { composite, contrastRatio, parseColour, toHex, type Colour, type Rgb } from "./colour.js";
import { EXEMPTIONS, rulesFor, type Palette, type Rule } from "./contrastRules.js";
import { utilitiesOf, type Declarations } from "./utilities.js";

export { EXEMPTIONS, TEXT_BAR, UI_BAR, type Palette } from "./contrastRules.js";

const PROPERTIES: readonly (readonly [RegExp, string])[] = [
  [/^bg-/, "background-color"],
  [/^text-/, "color"],
  [/^border-/, "border-color"],
  [/^outline-/, "outline-color"],
  [/^accent-/, "accent-color"],
];

/** The CSS property a palette utility sets, from its own name (`hover:bg-x` → `background-color`). */
export function propertyOf(utility: string): string | undefined {
  const base = utility.slice(utility.lastIndexOf(":") + 1);
  return PROPERTIES.find(([pattern]) => pattern.test(base))?.[1];
}

/** Read the colour a theme gives a utility; throws a message naming the utility if it cannot. */
function colourOf(utilities: Map<string, Declarations>, utility: string): Colour {
  const property = propertyOf(utility);
  const value = property === undefined ? undefined : utilities.get(utility)?.[property];
  if (value === undefined) throw new Error(`${utility}: the theme sets no ${property ?? "colour"}`);
  const colour = parseColour(value);
  if (!colour) throw new Error(`${utility}: cannot read the colour "${value}"`);
  return colour;
}

/** A background a pair is measured on: how to name it, and the opaque colour the eye sees. */
type Backdrop = { label: string; rgb: Rgb };

/** A stack laid over a base surface, bottom layer first. A solid first layer needs no base. */
function backdropsOf(
  utilities: Map<string, Declarations>,
  stack: string[],
  bases: string[],
): Backdrop[] {
  const layers = stack.map((utility) => colourOf(utilities, utility));
  const paint = (start: Rgb, from: number): Rgb =>
    layers.slice(from).reduce((under, layer) => composite(layer, under), start);
  const first = layers[0];
  if (first?.alpha === 1) return [{ label: stack.join(" + "), rgb: paint(first.rgb, 1) }];
  return bases.map((base) => ({
    label: `${stack.join(" + ")} over ${base}`,
    rgb: paint(colourOf(utilities, base).rgb, 0),
  }));
}

/** Two decimals, rounded down, so "4.50:1" is never printed for a ratio that missed 4.5. */
const shown = (ratio: number): string => (Math.floor(ratio * 100) / 100).toFixed(2);

/** The failing pairs of one foreground over every backdrop of a rule. */
function measureOne(utilities: Map<string, Declarations>, rule: Rule, fg: string): string[] {
  const ink = colourOf(utilities, fg);
  const backdrops = rule.on.flatMap((stack) => backdropsOf(utilities, stack, rule.base));
  return backdrops.flatMap((backdrop) => {
    const seen = composite(ink, backdrop.rgb);
    const ratio = contrastRatio(seen, backdrop.rgb);
    if (ratio >= rule.bar) return [];
    return [
      `${rule.name}: ${fg} ${toHex(seen)} on ${backdrop.label} ${toHex(backdrop.rgb)} is ${shown(ratio)}:1, needs ${rule.bar}:1`,
    ];
  });
}

const measure = (utilities: Map<string, Declarations>, rule: Rule): string[] =>
  rule.fg.flatMap((fg) => measureOne(utilities, rule, fg));

/** Palette utilities that no rule measures and no exemption lists: a gap in the contract. */
function unmeasured(palette: Palette, rules: Rule[]): string[] {
  const covered = new Set(rules.flatMap((rule) => [...rule.fg, ...rule.on.flat()]));
  return Object.entries(palette).flatMap(([role, utilities]) =>
    utilities
      .filter((utility) => !covered.has(utility))
      .filter(
        (utility) =>
          !EXEMPTIONS.some((e) => (e.role === "any" || e.role === role) && e.match.test(utility)),
      )
      .map(
        (utility) =>
          `${role}: ${utility} has no contrast rule; measure it in contrastRules.ts or exempt it with a reason`,
      ),
  );
}

/**
 * Every pair of the contrast contract the theme CSS breaks, one readable line each: the rule, the
 * foreground utility and colour, the background and its colour, the ratio and the bar. Empty when
 * the theme is green. `palette` is `packages/ui-react/palette.json`; `css` is the theme's text, not
 * a path, so a theme split over several files is checked from their concatenation.
 */
export function contrastFailures(css: string, palette: Palette): string[] {
  const utilities = utilitiesOf(css);
  const rules = rulesFor(palette);
  const failures = unmeasured(palette, rules);
  for (const rule of rules) {
    try {
      failures.push(...measure(utilities, rule));
    } catch (error) {
      failures.push(`${rule.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return failures;
}
