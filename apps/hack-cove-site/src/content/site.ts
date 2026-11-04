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

export type Status = "available" | "coming-soon";

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
      "Open-source visual review: see what your change did to the page before you merge. Free, MIT, local first.",
    cta: "About PixelSlash",
    description:
      "PixelSlash is an open-source visual review tool: it screenshots your main branch and your branch, sets real change apart from rendering noise, and shows a report cropped to what moved. Free, MIT, on npm.",
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
        language: "bash" as const,
        code: "bun add @hackcove/ui-react @hackcove/theme-catppuccin-mocha",
      },
      {
        text: "Import the theme in your CSS, after Tailwind, and point Tailwind at the components' build, since it skips node_modules:",
        label: "css",
        language: "css" as const,
        code: [
          '@import "tailwindcss";',
          '@import "@hackcove/theme-catppuccin-mocha/theme.css";',
          '@source "../node_modules/@hackcove/ui-react/dist";',
        ],
      },
      {
        text: "Put the theme's class on <html>. The class for each theme is listed below.",
      },
      {
        text: "Browser support is the web platform as of the Baseline digest of August 2026: current Chrome and Edge (131+), Firefox (143+) and Safari (18.4+, macOS and iOS). Older browsers and polyfills are not supported.",
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
      { label: "npm", href: "https://www.npmjs.com/package/@hackcove/ui-react" },
    ],
  },
  components: {
    title: "Components",
    intro: "Every component in @hackcove/ui-react has a page, in these groups.",
  },
  docs: {
    title: "Component docs",
    status: "available" as const,
    text: "Every component has a page. Each leads with the one right way to use it and its Do and Don't, then the usage rules, accessibility and every prop. /ui/llms.txt is the same content as plain text, for agents.",
    links: [{ label: "llms.txt", href: "/ui/llms.txt" }],
  },
};

const pixelslashLinks = {
  docs: { label: "Get started", href: "https://pixelslash.dev/docs" },
  github: { label: "GitHub", href: "https://github.com/madangryscientist/pixelslash" },
  site: { label: "pixelslash.dev", href: "https://pixelslash.dev" },
  selfHost: { label: "Self-host guide", href: "https://pixelslash.dev/self-host" },
  pricing: { label: "Pricing", href: "https://pixelslash.dev/pricing" },
  security: { label: "Security and threat model", href: "https://pixelslash.dev/security" },
};

/** The PixelSlash page: what has launched, and nothing that has not (HC-190). */
const pixelslash = {
  links: pixelslashLinks,
  hero: {
    title: "See what your change did to the page, before you merge it.",
    lead: "PixelSlash screenshots your main branch and your branch, sets real change apart from rendering noise, and gives you a report cropped to what moved.",
    pills: [
      { label: "Open source", tone: "emerald" },
      { label: "MIT", tone: "slate" },
      { label: "Local first", tone: "violet" },
    ] as const,
    install: "npm i -D @hackcove/pixelslash",
    installNote:
      "The command is pixelslash. It runs on Bun, and npx @hackcove/pixelslash works too.",
  },
  report: {
    src: "/pixelslash/report.png",
    width: 1100,
    height: 400,
    alt: "A PixelSlash report for one changed card: the Main, Branch and Diff shots side by side, each cropped to the changed region, with the change marked in magenta on the Diff.",
    caption:
      "A real report.html. One card changed, so the report shows Main, Branch and the diff of that region, and nothing else.",
  },
  how: {
    title: "How it works",
    steps: [
      {
        title: "Capture",
        text: "Give it two URLs, main and your branch, and it shoots both with Playwright. Or hand it PNGs you already have.",
      },
      {
        title: "Diff",
        text: "A perceptual diff tells anti-aliasing, noise and sub-pixel shifts apart from a real change, and groups what is left into regions.",
      },
      {
        title: "Review",
        text: "Open report.html, cropped to each changed region, or upload the build so a person accepts or rejects it.",
      },
    ],
  },
  features: {
    title: "What it does",
    items: [
      {
        title: "Every page in one run",
        code: "--routes",
        text: "Compares a list of paths in one run, and compare diffs two folders of snapshots.",
      },
      {
        title: "The same pixels on every runner",
        code: "pixelslash capture",
        text: "Shoots inside a pinned image from ghcr, so a commit renders the same in CI as on your laptop.",
      },
      {
        title: "No Storybook needed",
        code: "--live-png",
        text: "Diff any two pages by URL, or any two PNGs with no browser at all.",
      },
      {
        title: "Feedback while you build",
        code: "pixelslash dev",
        text: "Re-captures a page or component on every save and diffs it with your last version. Nothing is uploaded.",
      },
      {
        title: "A design-system judge",
        code: "--ds",
        text: "Checks each shot against your components with a local vision model (mlx or ollama) or a hosted one. With no judge installed it says so and invents nothing.",
      },
      {
        title: "A config from a few questions",
        code: "pixelslash init",
        text: "Asks about your project and writes pixelslash.config.ts.",
      },
    ],
  },
  ci: {
    title: "Built for CI and for agents",
    intro:
      "Upload each build to a PixelSlash review server, your own, and review the changes in a browser before the merge.",
    items: [
      {
        title: "A GitHub check",
        code: "pixelslash upload",
        text: "Sends the shots to the server, which diffs them against your default branch, holds the build for review and reports a GitHub check.",
      },
      {
        title: "No merge without a look",
        code: "pixelslash check",
        text: "Blocks CI until a person has accepted or rejected the changes.",
      },
      {
        title: "Your coding agent can read it",
        code: "pixelslash mcp",
        text: "A stdio MCP server, so the agent you already run can read builds, changed shots and flakes.",
      },
    ],
  },
  privacy: {
    title: "Private by default",
    items: [
      "It runs on your machine. No screenshot leaves it unless you pass --upload, and then only to the server you name.",
      "An AI judge is opt-in, and it sees only the crops of a changed region, never the whole page.",
    ],
  },
  free: {
    title: "Free and open source",
    items: [
      "MIT licensed, with the code on GitHub.",
      "Self-host all of it: with Docker, on your own Cloudflare account or on a box on your own network.",
      "Paid hosting is planned, not available yet. No feature will ever sit behind a paid plan.",
    ],
  },
  proof: {
    title: "In use on every Hack Cove UI change",
    text: "Hack Cove UI's visual check captures every Storybook story in every theme and uploads it to a PixelSlash project per docs section, where each change is reviewed before it merges.",
    link: { label: "See Hack Cove UI", href: "/ui/" },
  },
  closing: {
    title: "Try it on your own page",
    text: "Install the browser once, then point PixelSlash at what is live and at your local change.",
    code: [
      "npx @hackcove/pixelslash install-browser",
      "npx @hackcove/pixelslash --live https://example.com --local http://localhost:3000 --out out",
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
