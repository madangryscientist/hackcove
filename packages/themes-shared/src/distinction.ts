import { distance, toHex, type Rgb } from "./colour.js";
import { colourOf } from "./contrast.js";
import type { Palette } from "./contrastRules.js";
import { utilitiesOf, type Declarations } from "./utilities.js";

/**
 * The distinction contract: pairs of palette colours a reader has to tell apart. It is the companion
 * of the contrast contract, and asks a different question. Contrast asks whether one colour is strong
 * enough against the colour painted underneath it. Distinction asks whether two colours that are
 * never painted on each other still read as two: the primary button beside the destructive one, a
 * link beside a warning. Measured by role and by pair, never by a theme's name, and in OKLab, whose
 * distance follows what the eye sees.
 */

/** One pair of palette utilities that must read as two colours, and the distance it clears. */
type Distinction = {
  name: string;
  from: string;
  to: string;
  bar: number;
  why: string;
};

/**
 * The bars come from the site, read at a glance: 0.12 between two fills and 0.09 between two inks,
 * both past the point where the pair reads as one colour. A loading bone (the `skeleton` role) needs
 * only 0.05 from what it sits on: it is a quiet shape, not a colour with a meaning.
 */
const DISTINCTIONS: readonly Distinction[] = [
  {
    name: "primary and danger fills",
    from: "bg-violet-600",
    to: "bg-red-600",
    bar: 0.12,
    why: "the primary button sits beside the destructive one, and must not share its hue",
  },
  {
    name: "link and danger text",
    from: "text-violet-600",
    to: "text-red-700",
    bar: 0.09,
    why: "a link must not read as a warning",
  },
  ...(
    [
      ["canvas", "bg-gray-50"],
      ["surface", "bg-white"],
      ["subtle strip", "bg-slate-50"],
    ] as const
  ).map(([where, under]) => ({
    name: `loading bone on the ${where}`,
    from: "bg-slate-200",
    to: under,
    bar: 0.05,
    why: "a loading bone must read as a shape on the page, the card and a tinted strip",
  })),
];

/**
 * Every pair of the palette's `categorical` role, at the fill bar: a chart's categories have no
 * meaning but their colour, so any two of them must read as two. Read from the role, never listed.
 */
function categoricalPairs(palette: Palette): Distinction[] {
  const scale = palette["categorical"] ?? [];
  return scale.flatMap((from, i) =>
    scale.slice(i + 1).map((to) => ({
      name: `categories cat${i + 1} and cat${scale.indexOf(to) + 1}`,
      from,
      to,
      bar: 0.12,
      why: "two categories of a chart must read as two colours",
    })),
  );
}

/** The colour a theme gives a utility, which a pair of tones must set opaque to be measured. */
function opaqueColourOf(utilities: Map<string, Declarations>, utility: string): Rgb {
  const colour = colourOf(utilities, utility);
  if (colour.alpha < 1) throw new Error(`${utility}: a tone pair must be an opaque colour`);
  return colour.rgb;
}

/** Three decimals, rounded down, so a distance that missed its bar is never printed at the bar. */
const shown = (value: number): string => (Math.floor(value * 1000) / 1000).toFixed(3);

/** How far apart a theme puts a pair of palette utilities, in OKLab. */
export function distanceOf(css: string, from: string, to: string): number {
  const utilities = utilitiesOf(css);
  return distance(opaqueColourOf(utilities, from), opaqueColourOf(utilities, to));
}

/**
 * Every pair of the distinction contract the theme CSS fails, one readable line each: the pair, both
 * utilities and colours, the distance and the bar. Empty when the theme tells its tones apart.
 * `css` is the theme's text, not a path, so a theme split over several files is checked from their
 * concatenation. `palette` is `packages/ui-react/palette.json`, whose `categorical` role adds a
 * pair for every two of its colours.
 */
export function distinctionFailures(css: string, palette: Palette): string[] {
  const utilities = utilitiesOf(css);
  const failures: string[] = [];
  for (const pair of [...DISTINCTIONS, ...categoricalPairs(palette)]) {
    try {
      const from = opaqueColourOf(utilities, pair.from);
      const to = opaqueColourOf(utilities, pair.to);
      const apart = distance(from, to);
      if (apart >= pair.bar) continue;
      failures.push(
        `${pair.name}: ${pair.from} ${toHex(from)} and ${pair.to} ${toHex(to)} are ${shown(apart)} apart in OKLab, needs ${pair.bar} (${pair.why})`,
      );
    } catch (error) {
      failures.push(`${pair.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return failures;
}
