import { overlayPages } from "./overlays";
import { loadingPage } from "./loading";
import type { ComponentSection } from "./types";

export const feedback: ComponentSection = {
  title: "Feedback",
  icon: "bell",
  description: "Status, notices and the layers over the page.",
  pages: [
    {
      slug: "callout",
      name: "Callout",
      summary: "A tinted notice in the page, with an optional title and action.",
      whenToUse: "A message the reader should see in the page, without being made to answer it.",
      siblings: [
        { slug: "card", when: "A block of content has a status: a `Card` with `tone`." },
        {
          slug: "empty-state",
          when: "There is nothing here yet, and the message offers the first step.",
        },
        {
          slug: "status-pages",
          when: "The whole route cannot show: not found, failed, offline, down or not allowed.",
        },
      ],
      pairs: ["Callout/Tone", "Callout/Action", "Callout/Retry"],
      usage: {
        do: [
          "Pick the `tone` by how much the message matters: `neutral` (the default) for a note, `info` for something worth knowing, `positive` for a result, `warn` for a thing to check before going on, `danger` for a failure or something that cannot be undone. Keep `danger` for the real failure.",
          "Add a `title` for a short bold lead-in; the body carries the detail.",
          'Put the one action in `actions`, at the end of the row: a `Button size="sm"` or a `TextLink stretch`, which makes the whole callout the click target.',
          "`banner` is the flat strip at the top of a `Card flush`; do not use it anywhere else. In a page's column (a `FullBleedLayout`, padded or not) the notice is a plain Callout, first in the column's `Stack`.",
          'A section that failed to load is a `Callout tone="danger"` with a `title` that says what failed and one `Button` in `actions` that tries again. A whole page that failed is an `ErrorPage`.',
          "A block of content that has a status is a `Card` with `tone`; a Callout is the message.",
          'A short confirmation that should not move the page ("Saved", "Copied") is a `Toast`. A message that must be answered before the reader goes on is a `Dialog`; a field\'s own error is the `error` of its `Field`; a submit\'s failure in a `Dialog` or `FormLayout` is its `error`.',
          '`align="center"` centres the title and body, for a success that stands alone; with `actions` only the text is centred. `start` is the default.',
        ],
      },
      accessibility: [
        '`danger` is `role="alert"` and `warn` is `role="status"`, so a screen reader announces them when they appear; the other tones have no role. The tone is also colour and text, so say what happened in the words.',
        "A `title` is a bold paragraph, not a heading, so it adds nothing to the heading outline.",
        "Buttons and links in `actions` keep their own focus ring and keyboard behaviour.",
      ],
      api: ["Callout"],
      types: ["Tone"],
    },
    {
      slug: "toast",
      name: "Toast",
      summary: "A short notice over the bottom of the page, from a list the app holds.",
      whenToUse:
        "A confirmation or an offer that should not move the page: Saved, Copied, Update available.",
      pairs: ["Toast/Saved", "Toast/Action"],
      usage: {
        do: [
          "Mount one `ToastRegion` at the root of the app, beside `AppShell`, and hold the list in state: add a `Toast` to show it, and drop it by `id` in `onDismiss`.",
          "Each toast is a `title`, an optional `body` line and a `tone` (`neutral`, the default, `info`, `positive`, `warn` or `danger`), on the same surfaces as a `Callout`.",
          'A `neutral`, `info` or `positive` toast with no `actions` leaves on its own after five seconds, paused while the pointer is over it or focus is in it. One action goes in `actions` as a `Button size="sm"`; a toast with `actions`, or a `warn` or `danger` one, stays until it is dismissed.',
          "A toast raised while a `Dialog` or `Drawer` is open sits under it, and can be read and dismissed once it closes.",
          "Anything the reader must keep, such as a token shown once, is a `Callout` in the page. A failure that must be answered is a `Dialog`, and a field's error is its `Field`'s.",
        ],
      },
      accessibility: [
        'The region is a landmark named by `label` ("Notifications") with a polite `role="status"` inside, in the page before the first toast, so each new toast is read once and the focus does not move.',
        'Each toast\'s close button is named by `dismissLabel` ("Dismiss").',
        "The hide pauses on hover and on focus, and under `prefers-reduced-motion` it still leaves at the same moment, with no fade.",
      ],
      api: ["ToastRegion"],
      types: ["Toast"],
    },
    {
      slug: "empty-state",
      name: "EmptyState",
      summary: "What a page or list shows when there is nothing in it yet.",
      whenToUse:
        "A whole page or list with no content yet: say what belongs here and offer the first step.",
      siblings: [
        { slug: "callout", when: "There is content, and a line or two about it must be seen." },
        { slug: "status-pages", when: "The route itself cannot show, not just its content." },
      ],
      pairs: ["EmptyState/NextStep", "EmptyState/Inline"],
      usage: {
        do: [
          "Give it a `title`, one `Text` that says what belongs here, and the first step as `actions`, with the primary `Button` first.",
          "For a get-started list, put `Steps` after the `Text` in the children.",
          "The title's heading level comes from where it sits: an `h2` on the page, an `h3` in a `Section`, so the outline does not skip or repeat; `level` sets it by hand and the look does not change.",
          "On its own it draws a dashed frame round itself; inside a `Card` the card is the frame. `icon` sets one of the library's icons above the title.",
          'It is the one empty look. Give it to the part\'s `empty` slot (`ListLayout`, `CardGrid`, `ChatThread`, `TableBody`, `Timeline`, a `Stack as="ul"`), which shows it when the part has no children: `empty={<EmptyState title="No invoices yet." />}` everywhere.',
          'The slot picks the size: one muted line (`size="sm"`, no heading) in a `TableBody`, a `Timeline` or a `Stack as="ul"`; the titled block (`md`) on a page, in a `CardGrid` or a `ChatThread`. `size` sets it by hand.',
          '`padding="inset"` pads all four sides, for an EmptyState in a `Card flush`, whose body has no padding of its own; the default pads above and below.',
        ],
        dont: [
          "Do not leave it as a title alone: a page with nothing in it and nothing to do is a dead end.",
        ],
      },
      accessibility: [
        "At `md` an EmptyState is a `<section>` named by its `title`, which is an `h2` unless `level` says otherwise, so it is a landmark region a screen reader can jump to.",
        "At `sm` it is a plain block whose title is a paragraph, so a table cell or a list adds no heading or region to the outline.",
        "The actions are ordinary buttons and links, in reading order after the explanation.",
      ],
      api: ["EmptyState"],
    },
    loadingPage,
    ...overlayPages,
    {
      slug: "page-fade",
      name: "PageFade",
      summary: "The content area of a page, cross-faded when the route changes.",
      whenToUse: "A site where the frame stays put and only the content between pages should fade.",
      pairs: ["PageFade/ChangingArea", "PageFade/Transition"],
      usage: {
        do: [
          "Wrap what changes between pages, once per page, and leave the header and footer outside it.",
          "Start the change inside a view transition: `startPageTransition(() => setPage(next))` for a state change, or the router's own option (TanStack Router `viewTransition`, React Router's `viewTransition`, Astro's `ClientRouter`). Without one nothing fades.",
          "Leave `name` off: the whole page cross-fades and the frame, the same on both pages, looks still.",
          "Give a `name` only to a second region that must fade apart from the page, and only one no taller than the screen: a named region is captured at its full height. Each named one on a page needs its own `name`, and it is a stacking context, so portal an overlay inside it to the body.",
        ],
      },
      accessibility: [
        "A PageFade is a plain `<div>` with no role, so it changes nothing for assistive technology.",
        "Under `prefers-reduced-motion: reduce` the content swaps with no fade, and `startPageTransition` just runs the update.",
        "Where the browser has no View Transitions it is a plain `<div>` and the content swaps.",
      ],
      api: ["PageFade"],
      functions: [
        {
          name: "startPageTransition",
          text: "runs a synchronous state change inside a view transition, so a PageFade cross-fades; call it from an event handler.",
        },
      ],
    },
    {
      slug: "morph",
      name: "Morph",
      summary:
        "An element that grows into its counterpart on the next page, and shrinks back on Back.",
      whenToUse:
        "A card or thumbnail that opens into its own page, where the reader should see the one become the other.",
      pairs: ["Morph/UniqueName", "Morph/Transition"],
      usage: {
        do: [
          'Wrap the card in the grid and the element on the detail page, each with the same `name` and the record\'s id as `item`: `<Morph name="shop" item={shop.id}>`.',
          "The same `name` and `item` may appear only once on a page. Two on one page and the browser skips the morph, so a list passes each record's own id.",
          "Start the change inside a view transition: `startPageTransition(() => setOpen(id))` for a state change, or the router's own option (TanStack Router `defaultViewTransition: true` on `createRouter`, or `viewTransition` on a `Link`; React Router's `viewTransition`, Astro's `ClientRouter`). Without one nothing morphs.",
          "The destination's Morph must be in the page when the navigation lands: a route that shows a pending component first has nothing to morph into.",
          "Inside a `PageFade` the rest of the page cross-fades while the card morphs over it.",
          "Portal an overlay such as a dropdown to the body: the morphing element is a stacking context, so an overlay inside it cannot rise above a sticky header outside it.",
          "A Morph far below the fold carries no transition name until it scrolls near, so a long list costs only what is on screen.",
        ],
      },
      accessibility: [
        "A Morph is a plain `<div>` with no role, so it changes nothing for assistive technology.",
        "Under `prefers-reduced-motion: reduce` the element swaps with no animation, and `startPageTransition` just runs the update.",
        "Where the browser has no View Transitions it is a plain `<div>` and the content swaps.",
      ],
      api: ["Morph"],
    },
    {
      slug: "navigation-progress",
      name: "NavigationProgress",
      summary: "A thin bar across the top of the page while a route change is loading.",
      whenToUse:
        "A page load of unknown length: show at once that the click did something, until the next page renders.",
      pairs: ["NavigationProgress/Pending"],
      usage: {
        do: [
          'Render it once per app, beside the page frame, and pass `loading` from the router\'s pending state: with TanStack Router, `loading={useRouterState({ select: (s) => s.status === "pending" })}`. It has no router dependency.',
          "There is nothing to configure: it draws the bar while `loading` is true and nothing while it is false. The bar is invisible for its first 150ms, so a fast navigation shows nothing.",
          "It is fixed to the top edge of the viewport and overlays the header, so nothing on the page moves. Pair it with `PageFade`: the bar says the page is loading, and the fade swaps the content when it arrives.",
          "A task with a known length and a value is a `ProgressBar`, not this.",
        ],
      },
      accessibility: [
        'While shown it is `role="progressbar"` named by `label` ("Loading page" by default) and has no `aria-valuenow`, so it reads as an indeterminate progress bar. When hidden it is not in the page.',
        "Under `prefers-reduced-motion: reduce` it is a still, full-width bar with no slide.",
        "It takes no pointer events, so it never covers a control in the header.",
      ],
      api: ["NavigationProgress"],
    },
  ],
};
