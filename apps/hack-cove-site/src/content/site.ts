/* ---------------------------------------------------------------------------
   The site's content, in one typed place.
   ---------------------------------------------------------------------------
   Every word on hack-cove.com comes from Jacobus, so it lives here as data
   rather than being scattered through markup: editing copy means editing this
   file, and nothing else. The optional slots (a person's `bio` / `photo`, and a
   project's `links`) are seams: they can be filled in later without touching a
   component.
   --------------------------------------------------------------------------- */

export type Person = {
  /** First name only — how the team is introduced on this site. */
  name: string;
  role: string;
  /** A line or two, in their own words. Omitted until they've written it. */
  bio?: string;
  /** Path under public/, e.g. "/team/erin.jpg". Falls back to an initial monogram. */
  photo?: string;
};

export type Project = {
  slug: string;
  name: string;
  status: "available" | "coming-soon";
  summary: string;
  /** A short list under the summary. */
  details: string[];
  /** Only public places: leave a private repo or an unlaunched site out. */
  links?: { label: string; href: string }[];
};

const projects: Project[] = [
  {
    slug: "hack-cove-ui",
    name: "Hack Cove UI",
    status: "available",
    summary:
      "Our open-source design system: React components for Tailwind CSS v4, with each theme as its own package. This site is built with it.",
    details: [
      "@hackcove/ui on npm, MIT licensed.",
      "App shell, page layouts, forms, dialogs and a date picker.",
      "Two themes so far: Catppuccin Mocha (dark) and Thrifty Paper (light).",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/madangryscientist/hackcove" },
      { label: "npm", href: "https://www.npmjs.com/package/@hackcove/ui" },
    ],
  },
  {
    slug: "pixelslash",
    name: "PixelSlash",
    status: "coming-soon",
    summary:
      "Visual checks for every change: it screenshots the main branch and your branch, compares them, and shows only what really changed.",
    details: [
      "Tells real changes apart from anti-aliasing, noise and sub-pixel shifts.",
      "Can check a page against a design system with a vision model that runs locally, so nothing leaves your machine.",
      "Runs as a command-line tool and over Storybook; every Hack Cove UI change goes through it.",
    ],
  },
  {
    slug: "thriftloop",
    name: "ThriftLoop",
    status: "coming-soon",
    summary: "A home for South Africa's thrift, charity and second-hand shops.",
    details: [
      "Started as a map of Cape Town's thrift shops, with opening hours and an open-now filter.",
      "Shops will claim their listing, sell stock online and run clearance events.",
      "Growing from Cape Town to the whole country.",
    ],
  },
];

export const site = {
  name: "Hack Cove",
  legalName: "Hack Cove (Pty) Ltd",
  url: "https://hack-cove.com",

  /** The hero line. */
  tagline: "Hack Cove builds software for small businesses.",

  /** What we actually do. */
  intro: "We design and engineer, focusing on prototyping.",

  contactEmail: "hello@hack-cove.com",

  team: [
    { name: "Jacobus", role: "Engineer" },
    { name: "Erin", role: "Design Engineer" },
    { name: "Silindile", role: "Client Service agent" },
  ] satisfies Person[],

  /** Shown between the hero and the team; the section renders nothing when empty. */
  projects,
};
