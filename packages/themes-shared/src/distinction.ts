import { distance, toHex, type Rgb } from "./colour.js";
import { colourOf } from "./contrast.js";
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
 * both past the point where the pair reads as one colour.
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
];

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
 * concatenation.
 */
export function distinctionFailures(css: string): string[] {
  const utilities = utilitiesOf(css);
  const failures: string[] = [];
  for (const pair of DISTINCTIONS) {
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
