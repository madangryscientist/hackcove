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

import type { IconName } from "@hackcove/ui-react";
import { ui } from "./ui";

export type Person = {
  /** First name only — how the team is introduced on this site. */
  name: string;
  role: string;
  /** A line or two, in their own words. Omitted until they've written it. */
  bio?: string;
  /** Path under public/, e.g. "/team/erin.jpg". Falls back to an initial monogram. */
  photo?: string;
};

/** How far along a product is: its label and the tone of its pill. */
export type Status = "available" | "early-development" | "coming-soon";

/** One card on the home page: a product, its status, its pitch, and the one action that links out. */
export type Product = {
  slug: string;
  name: string;
  status: Status;
  /** The one-line pitch, from the product's own source. */
  pitch: string;
  /** The card's one action. Left out while the product has no site of its own. */
  action?: { label: string; href: string; external: boolean };
  /** What kind of thing it is, in a word or two: the label over a product that has its own block. */
  kind?: string;
  /** A real screenshot. Left out where none exists: the card shows no picture rather than a made-up one. */
  image?: { src: string; alt: string };
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
  /** Other paths that belong to this section, so its tab stays current there. */
  alsoPaths?: string[];
  /** The page's meta description. */
  description: string;
};

const slashSite = "https://slashslash.build/developers";

/** The home page's cards, shipped first, then in development, then coming. */
const products: Product[] = [
  {
    slug: "ui",
    name: "Hack Cove UI",
    status: "available",
    kind: "Component library",
    pitch:
      "Our opinionated React component library, fully integrated with its themes. This site is built with it.",
    action: { label: "Read the docs", href: "/ui/", external: false },
    image: {
      src: "/home/hack-cove-ui.webp",
      alt: "The same Hack Cove UI components twice, side by side: in the light Catppuccin Latte theme and the dark Catppuccin Mocha theme.",
    },
  },
  {
    slug: "pixelslash",
    name: "PixelSlash",
    status: "available",
    kind: "Visual review",
    pitch: "See what your change did to the page.",
    action: { label: "Visit pixelslash.dev", href: "https://pixelslash.dev", external: true },
    image: {
      src: "/home/pixelslash.webp",
      alt: "PixelSlash comparing two versions of a billing page: Main left of the slash, Branch right of it, with boxes around the regions that changed.",
    },
  },
  {
    slug: "toggleslash",
    name: "ToggleSlash",
    status: "early-development",
    pitch: "It keeps track of feature switches, so you know what turning one on will do.",
    action: { label: "Read more on slashslash.build", href: slashSite, external: true },
  },
  {
    slug: "flakeslash",
    name: "FlakeSlash",
    status: "early-development",
    pitch: "It spots automated checks that pass and fail at random, so a failure means something.",
    action: { label: "Read more on slashslash.build", href: slashSite, external: true },
  },
  {
    slug: "thriftloop",
    name: "ThriftLoop",
    status: "coming-soon",
    pitch: "A home for South Africa's thrift, charity and second-hand shops.",
  },
];

const sections: Section[] = [
  {
    slug: "contracting",
    icon: "briefcase",
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
    icon: "theme",
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

/** One section by its slug, for the page that is that section. */
export function sectionOf(slug: Section["slug"]): Section {
  const section = sections.find((s) => s.slug === slug);
  if (!section) throw new Error(`No section "${slug}" in site.sections`);
  return section;
}

const pixelslashLinks = {
  docs: { label: "Get started", href: "https://pixelslash.dev/docs" },
  github: { label: "GitHub", href: "https://github.com/madangryscientist/pixelslash" },
  site: { label: "pixelslash.dev", href: "https://pixelslash.dev" },
  selfHost: { label: "Self-host guide", href: "https://pixelslash.dev/self-host" },
  pricing: { label: "Pricing", href: "https://pixelslash.dev/pricing" },
  security: { label: "Security and threat model", href: "https://pixelslash.dev/security" },
  playwright: { label: "Playwright docs", href: "https://pixelslash.dev/docs/playwright/" },
};

/** The PixelSlash page: what has launched, and nothing that has not (HC-190). */
const pixelslash = {
  links: pixelslashLinks,
  hero: {
    title: "See what your change did to the page, before you merge it.",
    lead: "PixelSlash screenshots your main branch and your branch, sets real change apart from rendering noise, and gives you a report cropped to what moved.",
    pills: [
      { label: "Source available", tone: "emerald" },
      { label: "ELv2", tone: "slate" },
      { label: "Local first", tone: "violet" },
    ] as const,
    install: "npm i -D @hackcove/pixelslash",
    installNote:
      "The command is pixelslash. It runs on Bun, and npx @hackcove/pixelslash works too.",
  },
  report: {
    src: "/pixelslash/report.webp",
    width: 1600,
    height: 920,
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
    playwright: {
      title: "Playwright tests you already have",
      intro: "Your own Playwright suite can take the shots, with no capture image needed.",
      install: "npm i -D @hackcove/pixelslash-playwright",
      example:
        'import { test } from "@playwright/test";\nimport { snapshot } from "@hackcove/pixelslash-playwright";\n\ntest("watch page", async ({ page }) => {\n  await page.goto("/watch/42");\n  await snapshot(page, "watch", { ignore: [".live-count"] });\n});',
      ignore: "lives in the test: a PNG has no DOM, so the boxes are measured at the shot.",
      upload: "The shots go to pixelslash-snapshots. Send that folder with the pixelslash CLI:",
      command: "pixelslash upload pixelslash-snapshots --server <your-server>",
    },
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
    title: "Free and source available",
    items: [
      "Source available under the Elastic License 2.0, with all of it on GitHub.",
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

  /** The top of the home page, above the cards. */
  home: {
    overline: "Products",
    title: "Software we make, and the tools we make it with.",
    lead: "A component library and a visual review tool you can use today, two more developer tools on the way, and ThriftLoop, a home for South Africa's second-hand shops.",
    coming: { overline: "On the way", title: "What we are building next." },
  },

  /** The home page's cards, in order. */
  products,

  contracting,
  ui,
  pixelslash,
};
