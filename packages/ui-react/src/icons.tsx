import type { ReactElement, ReactNode } from "react";

/**
 * The icon set: one grammar, drawn here and nowhere else. Every icon sits on a 24-unit grid with
 * two units of padding (its ink lives in 2..22), is drawn as an outline with a 1.5 stroke, round
 * caps and round joins, and never fills: `GLYPH` below is the only place those are set, so an
 * icon's own shapes carry no `fill`, `stroke` or `stroke-width` (`Icon.test.tsx` holds them to
 * that). A name is the idea or action the icon stands for, not a product.
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
  "search",
  "chevron-right",
  "chevron-down",
  "close",
  "external-link",
  "settings",
  "bell",
  "check",
  "plus",
] as const;

/** The names of the icon set: feature ideas, then UI glyphs. */
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
  /** Finding something: a magnifying glass, a circle with its handle to the lower right. */
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 20.5 20.5" />
    </>
  ),
  /** A link or next step: an open chevron pointing right. */
  "chevron-right": <path d="m9 5.5 6.5 6.5L9 18.5" />,
  /** A disclosure or menu: an open chevron pointing down. */
  "chevron-down": <path d="m5.5 9 6.5 6.5L18.5 9" />,
  /** Dismiss: two strokes crossing in an X. */
  close: <path d="m5.5 5.5 13 13M18.5 5.5l-13 13" />,
  /** Leaves the site: a box open at its top right, with an arrow out to the top right. */
  "external-link": (
    <>
      <path d="M10.5 6H7a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3.5" />
      <path d="M14 4h6v6M20 4l-9.5 9.5" />
    </>
  ),
  /** Preferences: a cog, a ring of teeth round a hole. */
  settings: (
    <>
      <path d="M10.59 5.35L10.75 3.09L13.25 3.09L13.41 5.35A6.8 6.8 0 0 1 15.7 6.3L17.42 4.81L19.19 6.58L17.7 8.3A6.8 6.8 0 0 1 18.65 10.59L20.91 10.75L20.91 13.25L18.65 13.41A6.8 6.8 0 0 1 17.7 15.7L19.19 17.42L17.42 19.19L15.7 17.7A6.8 6.8 0 0 1 13.41 18.65L13.25 20.91L10.75 20.91L10.59 18.65A6.8 6.8 0 0 1 8.3 17.7L6.58 19.19L4.81 17.42L6.3 15.7A6.8 6.8 0 0 1 5.35 13.41L3.09 13.25L3.09 10.75L5.35 10.59A6.8 6.8 0 0 1 6.3 8.3L4.81 6.58L6.58 4.81L8.3 6.3A6.8 6.8 0 0 1 10.59 5.35Z" />
      <circle cx="12" cy="12" r="2.75" />
    </>
  ),
  /** Notifications: a bell with its clapper. */
  bell: (
    <>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4s2-1.5 2-6.5Z" />
      <path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  /** Done or selected: a single tick. */
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  /** Add or create: two strokes crossing, upright. */
  plus: <path d="M12 5v14M5 12h14" />,
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
