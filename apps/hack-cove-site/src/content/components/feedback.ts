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
      pairs: ["Callout/Tone", "Callout/Action"],
      usage: {
        do: [
          "Pick the `tone` by how much the message matters: `neutral` for a note, `info` (the default) for something worth knowing, `positive` for a result, `warn` for a thing to check before going on, `danger` for a failure or something that cannot be undone. Keep `danger` for the real failure.",
          "Add a `title` for a short bold lead-in; the body carries the detail.",
          'Put the one action in `actions`, at the end of the row: a `Button size="sm"` or a `TextLink stretch`, which makes the whole callout the click target.',
          "`banner` is the flat strip at the top of a `Card flush`; do not use it anywhere else. In a page's column (a `FullBleedLayout`, padded or not) the notice is a plain Callout, first in the column's `Stack`.",
          'A short confirmation that should not move the page ("Saved", "Copied") is a `Toast`. A message that must be answered before the reader goes on is a `Dialog`; a field\'s own error is the `error` of its `Field`; a submit\'s failure in a `Dialog` or `FormLayout` is its `error`.',
        ],
      },
      accessibility: [
        '`danger` is `role="alert"` and `warn` is `role="status"`, so a screen reader announces them when they appear; the other tones have no role. The tone is also colour and text, so say what happened in the words.',
        "A `title` is a bold paragraph, not a heading, so it adds nothing to the heading outline.",
        "Buttons and links in `actions` keep their own focus ring and keyboard behaviour.",
      ],
      api: ["Callout"],
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
    },
    {
      slug: "empty-state",
      name: "EmptyState",
      summary: "What a page or list shows when there is nothing in it yet.",
      whenToUse:
        "A whole page or list with no content yet: say what belongs here and offer the first step.",
      pairs: ["EmptyState/NextStep", "EmptyState/Inline"],
      usage: {
        do: [
          "Give it a `title`, one `Text` that says what belongs here, and the first step as `actions`, with the primary `Button` first.",
          "For a get-started list, put `Steps` after the `Text` in the children.",
          "The title's heading level comes from where it sits: an `h2` on the page, an `h3` in a `Section`, so the outline does not skip or repeat; `level` sets it by hand and the look does not change.",
          "On its own it draws a dashed frame round itself; inside a `Card` the card is the frame. `icon` sets one of the library's icons above the title.",
          'One muted line inside a card, for an empty table or list, is `Text tone="muted"`, not an EmptyState.',
        ],
        dont: [
          "Do not leave it as a title alone: a page with nothing in it and nothing to do is a dead end.",
        ],
      },
      accessibility: [
        "An EmptyState is a `<section>` named by its `title`, which is an `h2` unless `level` says otherwise, so it is a landmark region a screen reader can jump to.",
        "The actions are ordinary buttons and links, in reading order after the explanation.",
      ],
      api: ["EmptyState"],
    },
    {
      slug: "dialog",
      name: "Dialog",
      summary: "A modal that stops the page for one question.",
      whenToUse: "A confirmation or a short form the reader must answer before they go on.",
      pairs: ["Dialog/Confirm", "Dialog/Notice", "Dialog/Form"],
      stories: ["DialogScroll"],
      usage: {
        do: [
          "Render it only while it is open: `{open && <Dialog … onClose={() => setOpen(false)} />}`. It opens itself on mount.",
          'A `title` that names the action, a `description` with the consequence, and the actions in `footer`: Cancel as `variant="ghost"` first, then the one action, `tone="danger"` when it destroys something.',
          '`width="sm"` is a short list; `md`, the default, holds a form; `lg` (640px) is a wider form or a table.',
          'A form is the Dialog\'s own `onSubmit`: the body, the error and the footer are one form, so the footer\'s `Button type="submit"` and Enter in a field submit it, with no form id and no `form` attribute. The footer is Cancel (`variant="ghost"`), then the one submit button. With `onSubmit`, put no `<form method="dialog">` in the footer: it would nest a form.',
          "An error about one field is that `Field`'s `error`. An error about the whole submit (the server refused it, a conflict, no connection) is the Dialog's `error`: an alert between the body and the footer, beside the button that was pressed however tall the body is.",
          "A tall body scrolls inside the dialog, which is never taller than the screen: the title, the description and the footer stay on screen, so the actions are always in reach. There is nothing to set.",
          '`width="full"` fills the whole screen, for a player or media that needs the room. The body takes the height between the title and the footer and scrolls if it is taller. A full-screen Dialog has no backdrop to click, so put a close button on a `<form method="dialog">` in the `footer`. A single photo or video is a `Lightbox`.',
          "One text field is a `FieldDialog`. A record or a long form is a `Drawer`. A message that needs no answer is a `Callout` in the page, or a `Toast` when it should not move the page.",
          'It fades and slides in, and out again on close, but a `<dialog>` only animates out while it is still in the DOM. So `onClose` is called once the exit has finished: put `setOpen(false)` there and nowhere else. Esc, the backdrop and a `<form method="dialog">` close it that way already. Your own Cancel or action button closes it by calling `.close()` on its `<dialog>`, which a click handler finds with `event.currentTarget.closest("dialog")`. A button that calls `setOpen(false)` itself unmounts the dialog at once, and it vanishes with no exit animation.',
          'After async work (a save), keep the `<dialog>` from the event before the `await` (`const dialog = event.currentTarget.closest("dialog")`) and call `dialog?.close()` when it resolves.',
        ],
      },
      accessibility: [
        "A Dialog is the browser's own `<dialog>` opened with `showModal()`: the page behind goes inert, focus stays inside it and Esc closes it.",
        "The fade and slide are switched off under `prefers-reduced-motion: reduce`, and then it closes at once.",
        "It is named by its `title`, an `h2`, through `aria-labelledby`.",
        'A click on the backdrop closes it, and so does a submit of a `<form method="dialog">`; every close calls `onClose`.',
        "The browser focuses the first focusable element in it when it opens; put `autoFocus` on the button that should have focus first.",
        "A tall body that holds nothing focusable, such as plain text, takes a tab stop so the arrow keys can scroll it. A tall form keeps its first focus on its first field.",
      ],
      api: ["Dialog"],
    },
    {
      slug: "drawer",
      name: "Drawer",
      summary: "A modal panel that slides in from the right edge.",
      whenToUse:
        "A record or a form the reader works on beside the page, with actions that stay in view.",
      pairs: ["Drawer/Record", "Drawer/Footer"],
      usage: {
        do: [
          "Render it only while it is open: `{open && <Drawer … onClose={() => setOpen(false)} />}`. It opens itself on mount.",
          "Use it for a record to read or edit, or a form with several fields; a yes-or-no question is a `Dialog`.",
          "The actions go in `footer`, pinned under the body, which scrolls between the header and the footer.",
          "`width` is `sm`, `md` (the default) or `lg`; choose by the content, `sm` for one field and `lg` for a table. `description` is a muted line under the title, as on a `Dialog`.",
          "Set `closeLabel` to the reader's language when the page is not in English.",
          'It slides out again on close, but only while it is still in the DOM, so `onClose` is called once the exit has finished: put `setOpen(false)` there and nowhere else. Esc, the scrim and the close button close it that way already. A Cancel or Save button in the `footer` closes it by calling `.close()` on its `<dialog>`, which a click handler finds with `event.currentTarget.closest("dialog")`. A button that calls `setOpen(false)` itself unmounts the drawer at once, with no exit animation. After async work, keep the `<dialog>` from the event before the `await` and call `.close()` when it resolves.',
        ],
      },
      accessibility: [
        "A Drawer is the browser's own `<dialog>` opened with `showModal()`: the page behind goes inert, focus stays inside it and Esc closes it.",
        "It is named by its `title`, an `h2`, through `aria-labelledby`.",
        'The header\'s close button is an `IconButton` named by `closeLabel` ("Close" by default); a click on the scrim closes it too.',
        "Closing, or unmounting it, hands focus back to the element that opened it.",
        "The slide in and out is switched off under `prefers-reduced-motion: reduce`, and then it closes at once.",
      ],
      api: ["Drawer"],
    },
    {
      slug: "bottom-sheet",
      name: "BottomSheet",
      summary:
        "A non-modal panel docked to the bottom edge, at snap heights, over a map or a canvas.",
      whenToUse:
        "A list or details over a full-screen view (a map, a canvas) that must stay usable behind it.",
      pairs: ["BottomSheet/Header"],
      usage: {
        do: [
          "Put it in a positioned parent (`relative`) that holds the full-screen view; it docks to that parent's bottom edge, full width on a phone and a panel at the start edge from `md` up.",
          "Hold `snap` in your state and set it in `onSnapChange`: `<BottomSheet snap={snap} onSnapChange={setSnap} …>`.",
          'List `snaps` lowest first, at least two: a number from 0 to 1 is a share of the parent\'s height, a `"120px"` string is pixels.',
          "The heading and a count go in `header`, never first in the body, so they stay put while the list scrolls.",
          "Pad the map camera by the height `onHeightChange` reports, so a pin is never hidden under the sheet.",
          "A record or a form that stops the page is a `Drawer`; a question is a `Dialog`.",
          "Render the first snap first: the server render, and a page with no JavaScript, show a static panel at it.",
        ],
      },
      accessibility: [
        "It is a region named by `label`.",
        "The handle is a button named by `label`, with `aria-expanded` and `aria-controls` on the body. Enter and Space step through the snaps, and Escape inside the sheet returns it to the first.",
        "Nothing behind it is inert, and focus is never trapped or moved.",
        "The settle between snaps is switched off under `prefers-reduced-motion: reduce`.",
        "The body scrolls on its own and never scrolls the page.",
      ],
      api: ["BottomSheet"],
    },
    {
      slug: "lightbox",
      name: "Lightbox",
      summary: "A full-screen viewer for one photo or video, on a dark scrim.",
      whenToUse: "Showing a photo or a video at full size, and stepping through a set of them.",
      pairs: ["Lightbox/Viewer"],
      usage: {
        do: [
          "Render it only while it is open: `{open && <Lightbox … onClose={() => setOpen(false)} />}`. It opens itself on mount.",
          "Pass one `<img>` or `<video>` as its children, with no classes: the Lightbox scales it down to fit the screen and keeps its shape.",
          "`label` names it for a screen reader. `title` and `meta` are lines above the media (who posted it, and when); `caption` is the text under it.",
          "To step through a set, pass `onPrevious` and `onNext`: each shows its button and binds its arrow key. Leave `onPrevious` out on the first item and `onNext` on the last.",
          "The scrim is near-black with light text in every theme, light themes included, so a photo reads as it would in any viewer.",
          "It fades out on close while it is still in the DOM, so `onClose` is called once the fade has finished: put `setOpen(false)` there and nowhere else. Esc, the scrim and the close button close it that way already.",
        ],
        dont: ["Do not draw your own scrim for media; a question about a photo is a `Dialog`."],
      },
      accessibility: [
        "A Lightbox is the browser's own `<dialog>` opened with `showModal()`: the page behind goes inert, focus stays inside it and Esc closes it.",
        "It is named by `label` through `aria-label`; give the `<img>` its own `alt`.",
        "The close, previous and next buttons are named Close, Previous and Next (`closeLabel`, `previousLabel` and `nextLabel` for another language), and keep a light focus ring that shows on the dark scrim in every theme.",
        "A click on the scrim around the media closes it; a click on the media or its text does not.",
        "Closing, or unmounting it, hands focus back to the element that opened it. The fade is switched off under `prefers-reduced-motion: reduce`.",
      ],
      api: ["Lightbox"],
    },
    {
      slug: "field-dialog",
      name: "FieldDialog",
      summary: "A Dialog that asks for one text value.",
      whenToUse: "Asking for a single name or value: new project, rename, a label.",
      pairs: ["FieldDialog/OneField"],
      usage: {
        do: [
          "Render it only while it is open, and give every string it shows: `title`, `label`, `placeholder`, `hint`, `emptyReason`, `submit` and `busyLabel`, and a `description` under the title when the question needs a sentence.",
          "`onSubmit` gets the trimmed value and returns a promise. Resolving closes the dialog; rejecting shows the error message under the field and keeps the dialog open.",
          "More than one field is a `Dialog` with a `FormRow` or `Field`s, or a `Drawer`.",
        ],
      },
      accessibility: [
        "It is a `Dialog`: native `<dialog>`, page behind inert, focus kept inside, Esc closes, named by its `title`.",
        "The input has focus when it opens and is named by `label`.",
        "While the field is empty the submit button is disabled and its `emptyReason` is the button's title and the field's hint.",
        'While `onSubmit` is pending the button is busy (`aria-busy`); a rejection shows in the field\'s error line, which is `role="alert"`.',
      ],
      api: ["FieldDialog"],
    },
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
