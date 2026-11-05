import type { ReactElement, ReactNode } from "react";

/**
 * The icon set: one grammar, drawn here and nowhere else. Every icon sits on a 24-unit grid with
 * two units of padding (its ink lives in 2..22), is drawn as an outline with a 1.5 stroke, round
 * caps and round joins, and never fills: `GLYPH` below is the only place those are set, so an
 * icon's own shapes carry no `fill`, `stroke` or `stroke-width` (`Icon.test.tsx` holds them to
 * that). A name is the idea the icon stands for, not a product.
 */
const NAMES = [
  "diff",
  "baseline",
  "review",
  "ci",
  "self-host",
  "privacy",
  "capture",
  "branch",
  "theme",
  "speed",
] as const;

/** The names of the icon set, one per idea. */
export type IconName = (typeof NAMES)[number];

const GLYPHS: Record<IconName, ReactNode> = {
  /** Before and after, side by side: a minus on the left, a plus on the right. */
  diff: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M12 4.5v15M6.5 12h3M14.5 12h3M16 10.5v3" />
    </>
  ),
  /** The approved picture to compare against: a frame holding a sun over hills. */
  baseline: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m3.5 17 5-4.5 3.5 3 3-2.5 5.5 4" />
    </>
  ),
  /** Looking something over: an eye. */
  review: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  /** A pipeline that comes round and passes: a loop with a tick in it. */
  ci: (
    <>
      <path d="M20 12a8 8 0 1 1-2.34-5.66M13.8 6.34h3.86V2.5" />
      <path d="m8.8 12.2 2.2 2.2 4.2-4.6" />
    </>
  ),
  /** Your own machine: two stacked servers with their lights. */
  "self-host": (
    <>
      <rect x="3" y="4" width="18" height="6.5" rx="2" />
      <rect x="3" y="13.5" width="18" height="6.5" rx="2" />
      <path d="M7 7.25h.01M7 16.75h.01M11 7.25h6M11 16.75h6" />
    </>
  ),
  /** Kept to yourself: a closed padlock. */
  privacy: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
    </>
  ),
  /** Taking a screenshot: viewfinder corners round a lens. */
  capture: (
    <>
      <path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16" />
      <circle cx="12" cy="12" r="3.25" />
    </>
  ),
  /** A line of work that splits off and comes back: a branch joining its trunk. */
  branch: (
    <>
      <circle cx="6" cy="5.5" r="2.5" />
      <circle cx="6" cy="18.5" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <path d="M6 8v8M18 10.5c0 3.2-2.4 4.5-6 4.5H6" />
    </>
  ),
  /** The look of a site, which a theme swaps: a drop of colour. */
  theme: (
    <path d="M12 3.5S5.75 9.9 5.75 14.25a6.25 6.25 0 0 0 12.5 0C18.25 9.9 12 3.5 12 3.5ZM9 14.5a3 3 0 0 0 3 3" />
  ),
  /** Fast: a bolt. */
  speed: <path d="M13.25 3 5 13.5h6.25L10.75 21 19 10.5h-6.25Z" />,
};

/** The icon `name` as an `<svg>`: the set's one grid, stroke, caps and joins, drawn in `currentColor`. */
export function iconGlyph(name: IconName): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS[name]}
    </svg>
  );
}

/** Every icon name, for tests. Not exported from the package. */
export const ICON_NAMES: readonly IconName[] = NAMES;
