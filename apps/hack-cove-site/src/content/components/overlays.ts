import type { ComponentPage } from "./types";

/** The modal and docked layers over the page: they sit in the Feedback section of the rail, after Loading. */
export const overlayPages: ComponentPage[] = [
  {
    slug: "dialog",
    name: "Dialog",
    summary: "A modal that stops the page for one question.",
    whenToUse: "A confirmation or a short form the reader must answer before they go on.",
    siblings: [
      { slug: "drawer", when: "A record or a long form is worked on beside the page." },
      { slug: "field-dialog", when: "Only one text value is asked for." },
      {
        slug: "bottom-sheet",
        when: "Content sits over a map or a canvas that must stay usable: not modal.",
      },
      { slug: "lightbox", when: "One photo or video is shown at full size." },
    ],
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
    siblings: [
      { slug: "dialog", when: "A question, or a short form, must be answered before going on." },
      {
        slug: "bottom-sheet",
        when: "Content sits over a map or a canvas that must stay usable: not modal.",
      },
      { slug: "field-dialog", when: "Only one text value is asked for." },
    ],
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
    siblings: [
      { slug: "dialog", when: "A question must be answered before going on: modal." },
      { slug: "drawer", when: "A record or a long form, modal, beside the page." },
    ],
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
    siblings: [
      { slug: "media-tile", when: "The pictures are shown in the page, as tiles to open." },
      { slug: "dialog", when: "A question or a form, not a picture." },
    ],
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
    siblings: [
      { slug: "form-layout", when: "The form has several fields and a page of its own." },
      { slug: "dialog", when: "More than one field, or a question with no field." },
      { slug: "drawer", when: "A record or a long form with several fields." },
    ],
    pairs: ["FieldDialog/OneField"],
    usage: {
      do: [
        "Render it only while it is open, and give every string it shows: `title`, `label`, `placeholder`, `hint`, `emptyReason`, `submit` and `busyLabel`, and a `description` under the title when the question needs a sentence.",
        "`onSubmit` gets the trimmed value and returns a promise. Resolving closes the dialog; rejecting shows the error message under the field and keeps the dialog open.",
        "More than one field is a `Dialog` with `onSubmit` holding its `Field`s, or a `Drawer`.",
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
];
