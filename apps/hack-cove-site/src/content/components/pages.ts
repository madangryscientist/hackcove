import type { ComponentSection } from "./types";

export const pages: ComponentSection = {
  title: "Pages",
  icon: "page",
  description: "Whole-page layouts and the status pages.",
  pages: [
    {
      slug: "status-pages",
      name: "Status pages",
      summary:
        "Whole pages for the states every site has: not found, failed, offline, down, not allowed.",
      whenToUse: "A route that cannot show its content: use the status page that names the state.",
      siblings: [
        { slug: "callout", when: "Only a part of the page failed, and the rest of it shows." },
        { slug: "empty-state", when: "The page works and has nothing in it yet." },
      ],
      pairs: ["StatusPages/PickPage", "StatusPages/ErrorDetail"],
      usage: {
        do: [
          "Pick the page by the state: `NotFound` for a missing page (404), `Forbidden` for a page the reader may not see (403), `ErrorPage` for a failure (500), `Offline` for no connection, `Maintenance` for a site that is down on purpose.",
          "The copy is fixed, so every site reads the same. Change the heading with `title` and the text with children only when the state needs a specific line.",
          'Every page but `Maintenance` links "Back to home", to `LinkProvider`\'s `home` (`/` by default). `Maintenance` has none: home is the site that is down.',
          'Say where home is once, on the provider (`<LinkProvider home="/app">`).',
          '`onRetry` adds a "Try again" button on `ErrorPage` and `Offline`; `actions` replaces it with the buttons that fit, and the home link turns outline beside them.',
          'On `NotFound`, `numeral` draws a large "404" above the title, for a designed 404. Off by default; the digits are fixed.',
          'A button worded differently goes in `actions`: it comes first, and "Back to home" stays beside it. There is no label prop.',
          "On `ErrorPage`, `detail` is a request id or a short message a reader can quote.",
          'A part of a page that failed to load is not an `ErrorPage`: it is a `Callout tone="danger"` with a title and a retry `Button` in its `actions`, and the rest of the page stays.',
          "Render one as the content of an `AppShell`, or on its own in a `Container`.",
        ],
        dont: [
          "Do not offer a retry where trying again cannot help.",
          "Never put a stack trace in `detail`.",
          "Never wire a home link on each page; a page takes no home prop.",
        ],
      },
      accessibility: [
        "Each page is a `CenteredLayout` card, so the title is the page's `h1` and the copy under it is a paragraph.",
        '`detail` is shown in a `CodeBlock` labelled "Error".',
        'The buttons are a `Button` and a `Button` with `href`, with their own focus rings; "Back to home" is a real link.',
        "The pages do not set an HTTP status; send the 404, 403 or 500 from the server.",
      ],
      api: ["NotFound", "Forbidden", "ErrorPage", "Offline", "Maintenance"],
    },
  ],
};
