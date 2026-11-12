/* The words of the Hack Cove UI page (/ui/), apart from site.ts so each file stays short. */

export const ui = {
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
        code: "bun add @hackcove/ui-react @hackcove/themes",
      },
      {
        text: "Import the theme in your CSS, after Tailwind, and point Tailwind at the components' build, since it skips node_modules:",
        label: "css",
        language: "css" as const,
        code: [
          '@import "tailwindcss";',
          '@import "@hackcove/themes/catppuccin-mocha.css";',
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
      "Each theme is one CSS file that remaps the components' colours under its own class, and all of them are in one package.",
    themeLabel: "Theme",
    importLabel: "Import",
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
