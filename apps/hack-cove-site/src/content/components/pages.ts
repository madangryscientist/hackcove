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
      pairs: ["StatusPages/PickPage", "StatusPages/ErrorDetail"],
      usage: {
        do: [
          "Pick the page by the state: `NotFound` for a missing page (404), `Forbidden` for a page the reader may not see (403), `ErrorPage` for a failure (500), `Offline` for no connection, `Maintenance` for a site that is down on purpose.",
          "The copy is fixed, so every site reads the same. Change the heading with `title` and the text with children only when the state needs a specific line.",
          '`homeHref` adds a "Back to home" button, drawn by the app\'s router link through `LinkProvider`.',
          '`onRetry` adds a "Try again" button on `ErrorPage` and `Offline`; `action` replaces it with the one action that fits, and the home link turns outline beside it. Do not offer a retry where trying again cannot help.',
          'On `NotFound`, `numeral` draws a large "404" above the title, for a designed 404. Off by default; the digits are fixed.',
          'A button worded differently is `action` with no `homeHref`, so there is no "Back to home" link. There is no label prop.',
          "On `ErrorPage`, `detail` is a request id or a short message a reader can quote. Never a stack trace.",
          "Render one as the content of an `AppShell`, or on its own in a `Container`.",
        ],
        dont: [
          "Do not offer a retry where trying again cannot help.",
          "Never put a stack trace in `detail`.",
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
