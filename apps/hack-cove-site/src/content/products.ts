/* The home page's words and its products, apart from site.ts so each file stays short. */

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
  /** Real terminal output, shown in place of a screenshot for a product that has none. */
  sample?: { label: string; lines: string[] };
  /** What it does, a few short points from the product's own docs: shown on a product with its own block. */
  features?: string[];
};

const slashSite = "https://slashslash.build/developers";

/** The home page's cards, shipped first, then in development, then coming. */
export const products: Product[] = [
  {
    slug: "ui",
    name: "Hack Cove UI",
    status: "available",
    kind: "Component library",
    pitch:
      "Our opinionated React component library, fully integrated with its themes. This site is built with it.",
    action: { label: "Read the docs", href: "/ui/", external: false },
    features: [
      "Components and themes are made together: switch the theme and the whole site changes, with no component edits.",
      "No component takes a class or a style, so you compose the parts and the look stays right.",
      "Three themes, Catppuccin Mocha, Catppuccin Latte and Thrifty Paper, each checked for WCAG AA contrast.",
      "Whole pages for errors, not found and offline, and a loading skeleton in every component's real shape.",
      "MIT licensed, on npm as @hackcove/ui-react.",
    ],
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
    features: [
      "Shoots Main and Branch with Playwright, or takes PNGs you already have, and writes a report of what changed.",
      "A perceptual diff tells anti-aliasing and sub-pixel noise apart from a real change.",
      "Runs on your machine, for free. A shot leaves it only when you ask.",
      "A review server you run holds each build for a person to accept or reject, and reports a GitHub check.",
    ],
    image: {
      src: "/home/pixelslash.webp",
      alt: "A PixelSlash review server build of Hack Cove UI: 178 changed shots to review, a progress bar with Review next and Accept all, and the first changed shots cropped to what moved, each with its theme, size and the AI judge's verdict.",
    },
  },
  {
    slug: "toggleslash",
    name: "ToggleSlash",
    status: "available",
    kind: "Feature switches",
    pitch: "It keeps track of feature switches, so you know what turning one on will do.",
    action: { label: "Read more on slashslash.build", href: slashSite, external: true },
    features: [
      "Run it yourself: a server keeps your switches, a toggleslash command manages them, and a TypeScript SDK reads them in your app.",
      "Every change to a switch goes into an audit trail.",
      "Daily counts show how often each variation is served, never who received it.",
      "A dashboard to switch, target and read the history of each one.",
    ],
    sample: {
      label: "Real output, from slashslash.build",
      lines: [
        "$ toggleslash flags create new-checkout --project shop",
        "created flag new-checkout in shop",
        "$ toggleslash flags on new-checkout --project shop --env production",
        "flag new-checkout is on in production (version 2)",
        "$ toggleslash flags history new-checkout --project shop",
        "2026-11-05T14:40:10Z  toggled  flag_config new-checkout/production",
        "2026-11-05T14:39:55Z  created  flag new-checkout",
      ],
    },
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

/** The top of the home page, above the cards. */
export const home = {
  overline: "Products",
  title: "Software we make, and the tools we make it with.",
  lead: "A component library, a visual review tool and feature switches you can use today, a flaky test spotter on the way, and ThriftLoop, a home for South Africa's second-hand shops.",
  /** How the slash tools fit together, after slashslash.build: each answers one question about a change. */
  fit: {
    overline: "How they fit",
    title: "One question each, about every change.",
    lead: "Software teams check the code they change. Nobody checks what customers will see. Each slash tool answers one question about a change, before it goes live.",
    questions: [
      {
        question: "Does the page look different?",
        product: "PixelSlash",
        answer: "It takes a picture of every changed page before and after, and marks what moved.",
      },
      {
        question: "What switches on, and for whom?",
        product: "ToggleSlash",
        answer: "Every switch, who turned it on and when, and how often each variation is served.",
      },
      {
        question: "Can we trust the test results?",
        product: "FlakeSlash",
        answer:
          "It will find checks that fail and pass on the same code, so a red light means something again.",
      },
    ],
  },
  coming: { overline: "On the way", title: "What we are building next." },
};
