/* ---------------------------------------------------------------------------
   The site's content, in one typed place.
   ---------------------------------------------------------------------------
   Every word on hack-cove.com comes from Jacobus, so it lives here as data
   rather than being scattered through markup: editing copy means editing this
   file, and nothing else. The one exception is the theme list on /ui/, read from
   themes/*.css at build time and never written here. The optional slots (a person's
   `bio` / `photo`, and a product's `image`) are seams: they can be filled in later
   without touching a component.
   --------------------------------------------------------------------------- */

import type { IconName } from "@slashsuite/ui-react";
import { pixelslash } from "./pixelslash";
import { home, products } from "./products";
import { ui } from "./ui";

export type { Product, Status } from "./products";

export type Person = {
  /** First name only: how the team is introduced on this site. */
  name: string;
  role: string;
  /** A line or two, in their own words. Omitted until they've written it. */
  bio?: string;
  /** Path under public/, e.g. "/team/erin.jpg". Falls back to an initial monogram. */
  photo?: string;
};

/** One of the three sections: a tab in the header and a page of its own. */
export type Section = {
  slug: "contracting" | "ui" | "pixelslash";
  /** The page's path, with its trailing slash. */
  href: string;
  /** The page title and the card heading. */
  name: string;
  /** The header tab. */
  navLabel: string;
  /** The section's icon. */
  icon: IconName;
  /** One line on what the section is. */
  summary: string;
  /** The link text into the section. */
  cta: string;
  /** The page's meta description. */
  description: string;
};

const sections: Section[] = [
  {
    slug: "contracting",
    icon: "briefcase",
    href: "/contracting/",
    name: "Contracting",
    navLabel: "Contracting",
    summary: "Design and engineering for small businesses, focusing on prototyping.",
    cta: "About contracting",
    description:
      "Hack Cove designs and engineers software for small businesses, focusing on prototyping.",
  },
  {
    slug: "ui",
    icon: "theme",
    href: "/ui/",
    name: "UISlash",
    navLabel: "UI",
    summary:
      "Our opinionated React component library, fully integrated with its themes. This site is built with it.",
    cta: "About UISlash",
    description:
      "UISlash is an opinionated, strict React UI library, fully integrated with its theming.",
  },
  {
    slug: "pixelslash",
    icon: "diff",
    href: "/pixelslash/",
    name: "PixelSlash",
    navLabel: "PixelSlash",
    summary:
      "Visual review: see what your change did to the page before you merge. Free, source available, local first.",
    cta: "About PixelSlash",
    description:
      "PixelSlash is a visual review tool: it screenshots your main branch and your branch, sets real change apart from rendering noise, and shows a report cropped to what moved. Free, source available under the Elastic License 2.0, on npm.",
  },
];

/** A header tab: a section, or a page that is a tab without being a section (the CV). */
export type NavTab = Pick<Section, "navLabel" | "href">;

/** The header tabs, in order: the three sections, then the CV. */
const nav: NavTab[] = [...sections, { navLabel: "CV", href: "/cv/" }];

/** One section by its slug, for the page that is that section. */
export function sectionOf(slug: Section["slug"]): Section {
  const section = sections.find((s) => s.slug === slug);
  if (!section) throw new Error(`No section "${slug}" in site.sections`);
  return section;
}

const contracting = {
  cv: { text: "Jacobus's CV", href: "/cv/" },
};

export const site = {
  name: "Hack Cove",
  legalName: "Hack Cove (Pty) Ltd",
  url: "https://hack-cove.com",

  /** The meta description and the home page's title. */
  tagline: "Hack Cove builds software for small businesses.",

  /** What we actually do: under the Contracting title. */
  intro: "We design and engineer, focusing on prototyping.",

  contactEmail: "hello@hack-cove.com",

  team: [
    { name: "Jacobus", role: "Engineer" },
    { name: "Erin", role: "Design Engineer" },
    { name: "Silindile", role: "Client Service agent" },
  ] satisfies Person[],

  /** The three sections, in the order of the header tabs. */
  sections,

  /** The header tabs: the sections, then the CV. */
  nav,

  /** The top of the home page, above the cards. */
  home,

  /** The home page's cards, in order. */
  products,

  contracting,
  ui,
  pixelslash,
};
