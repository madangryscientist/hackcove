/* ---------------------------------------------------------------------------
   The site's content, in one typed place.
   ---------------------------------------------------------------------------
   Every word on hack-cove.com comes from Jacobus, so it lives here as data
   rather than being scattered through markup: editing copy means editing this
   file, and nothing else. The one exception is the theme list on /ui/, read from
   themes/* at build time and never written here. The optional slots (a person's
   `bio` / `photo`, and a project's `links`) are seams: they can be filled in later
   without touching a component.
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

export type Status = "available" | "in-use" | "coming-soon";

export type Project = {
  slug: string;
  name: string;
  status: Status;
  summary: string;
  /** A short list under the summary. */
  details: string[];
  /** Only public places: leave a private repo or an unlaunched site out. */
  links?: { label: string; href: string }[];
};

/** One of the three sections: a card on the home page, a tab in the header and a page of its own. */
export type Section = {
  slug: "contracting" | "ui" | "pixelslash";
  /** The page's path, with its trailing slash. */
  href: string;
  /** The page title and the card heading. */
  name: string;
  /** The header tab. */
  navLabel: string;
  /** The card on the home page. */
  summary: string;
  /** The card's link. */
  cta: string;
  /** Other paths that belong to this section, so its tab stays current there. */
  alsoPaths?: string[];
  /** The page's meta description. */
  description: string;
};

const projects: Project[] = [
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

const sections: Section[] = [
  {
    slug: "contracting",
    href: "/contracting/",
    name: "Contracting",
    navLabel: "Contracting",
    summary: "Design and engineering for small businesses, focusing on prototyping.",
    cta: "About contracting",
    alsoPaths: ["/cv/"],
    description:
      "Hack Cove designs and engineers software for small businesses, focusing on prototyping.",
  },
  {
    slug: "ui",
    href: "/ui/",
    name: "Hack Cove UI",
    navLabel: "UI",
    summary:
      "Our opinionated React component library, fully integrated with its themes. This site is built with it.",
    cta: "About Hack Cove UI",
    description:
      "Hack Cove UI is an opinionated, strict React UI library, fully integrated with its theming.",
  },
  {
    slug: "pixelslash",
    href: "/pixelslash/",
    name: "PixelSlash",
    navLabel: "PixelSlash",
    summary:
      "Visual checks for every change. It runs on every Hack Cove UI change; a public release is coming soon.",
    cta: "About PixelSlash",
    description:
      "PixelSlash screenshots your main branch and your branch, compares them, and shows only what really changed.",
  },
];

/** One section by its slug, for the page that is that section. */
export function sectionOf(slug: Section["slug"]): Section {
  const section = sections.find((s) => s.slug === slug);
  if (!section) throw new Error(`No section "${slug}" in site.sections`);
  return section;
}

const ui = {
  /** Under the page title. */
  subtitle: "An opinionated UI library that is fully integrated with its theming.",
  intro: [
    "Hack Cove UI is strict on purpose. It fixes the look and feel, so a site built with it, by people or by agents, looks good every time. It is not an extensible framework with every option.",
    "The components and the themes are designed together. Every theme remaps every palette utility the components use, and the library's tests enforce it for each theme. Switching theme reskins a whole site with no component change, and there is nothing to configure.",
    "The aim is a site built only from Hack Cove components, configured through props, with no custom CSS or Tailwind.",
  ],
  install: {
    title: "Install",
    steps: [
      {
        text: "Add the components and a theme. React, React DOM and Tailwind CSS v4 are peers.",
        code: "bun add @hackcove/ui @hackcove/theme-catppuccin-mocha",
      },
      {
        text: "Import the theme in your CSS, after Tailwind, and point Tailwind at the components' build, since it skips node_modules:",
        code: [
          '@import "tailwindcss";',
          '@import "@hackcove/theme-catppuccin-mocha/theme.css";',
          '@source "../node_modules/@hackcove/ui/dist";',
        ],
      },
      {
        text: "Put the theme's class on <html>. The class for each theme is listed below.",
      },
    ],
  },
  themes: {
    title: "Themes",
    intro:
      "Each theme is its own package: one CSS file that remaps the components' colours under its own class.",
    scopeLabel: "Class on <html>",
  },
  links: {
    title: "Find it",
    items: [
      { label: "GitHub", href: "https://github.com/madangryscientist/hackcove" },
      { label: "npm", href: "https://www.npmjs.com/package/@hackcove/ui" },
    ],
  },
  docs: {
    title: "Component docs",
    status: "coming-soon" as const,
    text: "Documentation for each component is coming soon.",
  },
};

const pixelslash = {
  subtitle:
    "Visual checks for every change: it screenshots the main branch and your branch, compares them, and shows only what really changed.",
  today: {
    title: "Today",
    status: "in-use" as const,
    items: [
      "Screenshots of the main branch and your branch, for URLs or Storybook stories, across themes and viewports.",
      "A perceptual diff that labels anti-aliasing, noise and sub-pixel shifts, and shows only the real changes, in regions.",
      "An HTML report cropped to the change.",
      "pixelslash dev re-captures one page or story on every save and diffs it with your last iteration, while you build.",
      "A design-system check by a vision model that runs locally (mlx or ollama), so nothing leaves your machine.",
      "A pinned capture image, so the same commit renders the same pixels anywhere.",
      "In use on every Hack Cove UI change.",
    ],
  },
  comingSoon: {
    title: "Coming soon",
    status: "coming-soon" as const,
    items: [
      "A public release. PixelSlash is not published yet, so there is nothing to install.",
      "CI review that can block a merge until a change is reviewed, and hosted review.",
      "Uploads to a PixelSlash server.",
    ],
  },
};

const contracting = {
  cv: { text: "Jacobus's CV", href: "/cv/" },
};

export const site = {
  name: "Hack Cove",
  legalName: "Hack Cove (Pty) Ltd",
  url: "https://hack-cove.com",

  /** The hero line. */
  tagline: "Hack Cove builds software for small businesses.",

  /** What we actually do: under the Contracting title. */
  intro: "We design and engineer, focusing on prototyping.",

  contactEmail: "hello@hack-cove.com",

  team: [
    { name: "Jacobus", role: "Engineer" },
    { name: "Erin", role: "Design Engineer" },
    { name: "Silindile", role: "Client Service agent" },
  ] satisfies Person[],

  /** The three sections, in the order of the home cards and the header tabs. */
  sections,

  /** Shown on the home page under the section cards; the block renders nothing when empty. */
  projects,

  contracting,
  ui,
  pixelslash,
};
