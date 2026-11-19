/* The PixelSlash page's words, apart from site.ts so each file stays short. */

import type { Claim } from "./claims";

const pixelslashLinks = {
  docs: { label: "Get started", href: "https://pixelslash.dev/docs" },
  github: { label: "GitHub", href: "https://github.com/madangryscientist/pixelslash" },
  site: { label: "pixelslash.dev", href: "https://pixelslash.dev" },
  selfHost: { label: "Self-host guide", href: "https://pixelslash.dev/self-host" },
  pricing: { label: "Pricing", href: "https://pixelslash.dev/pricing" },
  security: { label: "Security and threat model", href: "https://pixelslash.dev/security" },
  playwright: { label: "Playwright docs", href: "https://pixelslash.dev/docs/playwright/" },
};

/** A command or flag in code and what it does for you: a card on the PixelSlash page. */
type Command = { title: string; code: string; text: Claim };

/**
 * The PixelSlash page: what has launched, and nothing that has not. Every sentence about what it does
 * is a `Claim` that cites pixelslash's FACTS.md (test/facts.test.ts).
 */
export const pixelslash = {
  links: pixelslashLinks,
  hero: {
    title: "See what your change did to the page, before you merge it.",
    lead: {
      text: "PixelSlash screenshots your main branch and your branch, sets real change apart from rendering noise, and gives you a report cropped to what moved.",
      facts: [
        "pixelslash/compare-two-urls",
        "pixelslash/perceptual-diff",
        "pixelslash/compare-two-pngs",
      ],
    } satisfies Claim,
    pills: [
      { label: "Source available", tone: "positive" },
      { label: "ELv2", tone: "neutral" },
      { label: "Local first", tone: "accent" },
    ] as const,
    install: "npm i -D @hackcove/pixelslash",
    installNote: {
      text: "The command is pixelslash. It runs on Bun, and npx @hackcove/pixelslash works too.",
      facts: ["pixelslash/npm-cli"],
    } satisfies Claim,
  },
  report: {
    src: "/pixelslash/report.webp",
    alt: "A PixelSlash report for a pricing page: the Main, Branch and Diff shots side by side, cropped to the four changed regions (a new price, a new button and a fuller storage bar), with the changes marked in magenta on the Diff.",
    caption: {
      text: "A real report.html. Four regions changed, so the report shows Main, Branch and the diff cropped to them, lists each region, and leaves the rest of the page out.",
      facts: ["pixelslash/compare-two-pngs", "pixelslash/perceptual-diff"],
    } satisfies Claim,
  },
  how: {
    title: "How it works",
    steps: [
      {
        title: "Capture",
        text: {
          text: "Give it two URLs, main and your branch, and it shoots both with Playwright. Or hand it PNGs you already have.",
          facts: ["pixelslash/compare-two-urls", "pixelslash/compare-two-pngs"],
        },
      },
      {
        title: "Diff",
        text: {
          text: "A perceptual diff tells anti-aliasing, noise and sub-pixel shifts apart from a real change, and groups what is left into regions.",
          facts: ["pixelslash/perceptual-diff"],
        },
      },
      {
        title: "Review",
        text: {
          text: "Open report.html, cropped to each changed region, or upload the build so a person accepts or rejects it.",
          facts: ["pixelslash/compare-two-pngs", "pixelslash/upload-to-review-app"],
        },
      },
    ] satisfies { title: string; text: Claim }[],
  },
  features: {
    title: "What it does",
    items: [
      {
        title: "Every page in one run",
        code: "--routes",
        text: {
          text: "Compares a list of paths in one run, and compare diffs two folders of snapshots.",
          facts: ["pixelslash/many-pages"],
        },
      },
      {
        title: "The same pixels on every runner",
        code: "pixelslash capture",
        text: {
          text: "Shoots inside a pinned image from ghcr, so a commit renders the same in CI as on your laptop.",
          facts: ["pixelslash/pinned-capture-image", "pixelslash/capture-image"],
        },
      },
      {
        title: "No Storybook needed",
        code: "--live-png",
        text: {
          text: "Diff any two pages by URL, or any two PNGs with no browser at all.",
          facts: ["pixelslash/compare-two-urls", "pixelslash/compare-two-pngs"],
        },
      },
      {
        title: "Feedback while you build",
        code: "pixelslash dev",
        text: {
          text: "Re-captures a page or component on every save and diffs it with your last version. Nothing is uploaded.",
          facts: ["pixelslash/dev-mode"],
        },
      },
      {
        title: "A design-system judge",
        code: "--ds",
        text: {
          text: "Checks each shot against your components with a local vision model (mlx or ollama). With no judge installed it says so and invents nothing.",
          facts: ["pixelslash/design-system-judge"],
        },
      },
      {
        title: "A config from a few questions",
        code: "pixelslash init",
        text: {
          text: "Asks about your project and writes pixelslash.config.ts.",
          facts: ["pixelslash/init"],
        },
      },
    ] satisfies Command[],
    playwright: {
      title: "Playwright tests you already have",
      intro: {
        text: "Your own Playwright suite can take the shots, with no capture image needed.",
        facts: ["pixelslash/playwright-helper", "pixelslash/npm-playwright-helper"],
      } satisfies Claim,
      install: "npm i -D @hackcove/pixelslash-playwright",
      example:
        'import { test } from "@playwright/test";\nimport { snapshot } from "@hackcove/pixelslash-playwright";\n\ntest("watch page", async ({ page }) => {\n  await page.goto("/watch/42");\n  await snapshot(page, "watch", { ignore: [".live-count"] });\n});',
      ignore: {
        text: "lives in the test: a PNG has no DOM, so the boxes are measured at the shot.",
        facts: ["pixelslash/playwright-helper", "pixelslash/ignore-and-redact"],
      } satisfies Claim,
      upload: {
        text: "The shots go to pixelslash-snapshots. Send that folder with the pixelslash CLI:",
        facts: ["pixelslash/playwright-helper", "pixelslash/upload-to-review-app"],
      } satisfies Claim,
      command: "pixelslash upload pixelslash-snapshots --server <your-server>",
    },
  },
  ci: {
    title: "Built for CI and for agents",
    intro: {
      text: "Upload each build to a PixelSlash review server, your own, and review the changes in a browser before the merge.",
      facts: [
        "pixelslash/upload-to-review-app",
        "pixelslash/self-host-docker",
        "pixelslash/self-host-cloudflare",
      ],
    } satisfies Claim,
    items: [
      {
        title: "A GitHub check",
        code: "pixelslash upload",
        text: {
          text: "Sends the shots to the server, which diffs them against your default branch, holds the build for review and reports a GitHub check.",
          facts: ["pixelslash/upload-to-review-app", "pixelslash/github-status-and-comment"],
        },
      },
      {
        title: "No merge without a look",
        code: "pixelslash status --wait",
        text: {
          text: "Blocks CI until a person has accepted or rejected the changes.",
          facts: ["pixelslash/block-ci-on-review"],
        },
      },
      {
        title: "Your coding agent can read it",
        code: "pixelslash mcp",
        text: {
          text: "A stdio MCP server, so the agent you already run can read builds and changed shots.",
          facts: ["pixelslash/mcp-server"],
        },
      },
    ] satisfies Command[],
  },
  privacy: {
    title: "Private by default",
    items: [
      {
        text: "It runs on your machine. No screenshot leaves it unless you pass --upload, and then only to the server you name.",
        facts: ["pixelslash/local-unless-upload"],
      },
      {
        text: "An AI judge is opt-in.",
        facts: ["pixelslash/design-system-judge", "pixelslash/server-ai-explanations"],
      },
    ] satisfies Claim[],
  },
  free: {
    title: "Free and source available",
    items: [
      {
        text: "Source available under the Elastic License 2.0, with all of it on GitHub.",
        facts: ["pixelslash/licence", "pixelslash/from-source"],
      },
      {
        text: "Self-host all of it: with Docker, on your own Cloudflare account or on a box on your own network.",
        facts: ["pixelslash/self-host-docker", "pixelslash/self-host-cloudflare"],
      },
    ] satisfies Claim[],
  },
  proof: {
    title: "In use on every Hack Cove UI change",
    text: {
      text: "Hack Cove UI's visual check captures every Storybook story in one theme and every component in each of the others, and uploads it to a PixelSlash project per docs section, where each change is reviewed before it merges.",
      facts: ["pixelslash/upload-to-review-app"],
      repo: [".github/workflows/visual.yml", "apps/storybook/scripts/visual-plan.ts"],
    } satisfies Claim,
    link: { label: "See Hack Cove UI", href: "/ui/" },
  },
  closing: {
    title: "Try it on your own page",
    text: {
      text: "Install the browser once, then point PixelSlash at what is live and at your local change.",
      facts: ["pixelslash/compare-two-urls"],
    } satisfies Claim,
    code: [
      "npx @hackcove/pixelslash install-browser",
      "npx @hackcove/pixelslash --live https://example.com --local http://localhost:3000 --out out",
    ],
  },
};
