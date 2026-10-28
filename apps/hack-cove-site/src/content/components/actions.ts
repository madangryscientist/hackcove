import type { ComponentSection } from "./types";

export const actions: ComponentSection = {
  title: "Actions",
  description: "Things a person presses.",
  pages: [
    {
      slug: "button",
      name: "Button",
      summary: "The action a person takes on a view.",
      whenToUse: "An action that changes something in place: save, cancel, delete, retry.",
      pairs: [
        "Button/OnePrimary",
        "Button/DisabledReason",
        "Button/Navigate",
        "Button/Destructive",
        "ButtonGroup/Row",
      ],
      usage: [
        'Put one primary Button in a view. The other actions use `variant="outline"`, `"ghost"` or `"link"`; `variant="dashed"` is the full-width "add another" row at the foot of a list.',
        "Group the actions in a `ButtonGroup`, so the row spaces and wraps the same everywhere; `end` pushes one item, such as a Back link, to the far side, and `label` names the group.",
        "Say why a button cannot be pressed with `disabledReason`; use `busy` while the work is in flight.",
        "Going to another page is a `ButtonLink`, not a Button.",
        'A destructive action is `tone="danger"`, an accept is `tone="positive"`; `size="sm"` is for a button inside a row or a card header, `size="lg"` for the one action of a hero or a sign-in form.',
        "`pressed` makes a toggle; `busyLabel` replaces the label while `busy`.",
        "An icon-only action is an `IconButton`, not a Button holding a glyph.",
      ],
      accessibility: [
        'A Button is a native `<button>` and defaults to `type="button"`, so it never submits a form by accident.',
        "`disabledReason` disables the button and sets the reason as its `title`, so a pointer user sees why.",
        "`busy` sets `aria-busy` and disables the button until the work is done.",
        "Every Button has a focus ring from the component, so the keyboard focus is always visible.",
      ],
      api: ["Button", "ButtonLink", "ButtonGroup"],
      functions: [
        {
          name: "buttonClass",
          text: "The Button's look as a class string, for a router link that has to look like a Button when `ButtonLink`'s `render` cannot draw it.",
        },
      ],
    },
    {
      slug: "icon-button",
      name: "IconButton",
      summary: "A square button for one icon.",
      whenToUse: "An action with a familiar icon and no room for a word: delete, settings, alerts.",
      pairs: ["IconButton/Label", "IconButton/Badge", "IconButton/Navigate"],
      usage: [
        "Always give the `label`: it is the accessible name and the tooltip, and the icon is only decoration.",
        '`variant="ghost"` is the quiet one for a row or a toolbar; `tone="danger"` is for delete and clear.',
        "`size` is `sm` (26px) inside a row or a chip, `md` (default, 38px, the height of a `Button`) or `lg` beside a large `Button`.",
        "An unread count is `badge`, never part of the label; it is not shown at 0.",
        "Going to another page is `href` (or `render` for the app's router link), which draws the same button as a link.",
        "An action that needs a word is a `Button`.",
      ],
      accessibility: [
        "`label` is set as `aria-label` and `title`; with a `badge` it reads `Alerts, 3`.",
        "The badge itself is `aria-hidden`, so the count is read once, through the name.",
        'As a button it defaults to `type="button"`; with `href` or `render` it is a real link, and `external` opens a new tab with `rel="noreferrer"`.',
        "It has the component's focus ring.",
      ],
      api: ["IconButton"],
    },
    {
      slug: "icon",
      name: "Icon",
      summary: "Sizes and tones one `<svg>` glyph.",
      whenToUse:
        "A glyph beside text or inside a control: a flag in a row, a camera in a Button, a mark in a card.",
      pairs: ["Icon/Icon"],
      usage: [
        "Put a bare `<svg>` (with a `viewBox`, no size or colour classes) in an `Icon`; it fills the box.",
        "`size` is `sm` (14px), `md` (16px, the default) or `lg` (20px).",
        "`tone` is a text tone (`muted`, `positive`, `warn`, `danger`, `info`); `inherit`, the default, takes the colour of the text around it, so draw the glyph with `currentColor`.",
        "An icon that is a button is an `IconButton`.",
      ],
      accessibility: [
        "An Icon is decorative and `aria-hidden` by default: the text beside it says what it means.",
        'An icon that carries meaning on its own takes a `label`, which makes it `role="img"` with that name.',
      ],
      api: ["Icon"],
    },
    {
      slug: "copy-button",
      name: "CopyButton",
      summary: "Copies a string to the clipboard.",
      whenToUse: "A value the page already shows that a reader will paste elsewhere.",
      pairs: ["CopyButton/Clipboard"],
      usage: [
        "`text` is what is copied; the label swaps to `copiedLabel` once it is on the clipboard.",
        'Name what is copied in `label` and `copiedLabel` (`"Copy token"`, `"Token copied"`) when the page has more than one.',
        "A command or token in its own box is a `CopyLine`, which carries this button.",
        "Do not write the clipboard call by hand in a `Button`.",
      ],
      accessibility: [
        'A native `<button>` with `type="button"` and a focus ring from the component.',
        "The label text is the accessible name and changes to `copiedLabel` after the copy.",
        "A refused or missing clipboard leaves the label unchanged; nothing is announced.",
      ],
      api: ["CopyButton"],
    },
    {
      slug: "copy-line",
      name: "CopyLine",
      summary: "One line of mono text with a copy button.",
      whenToUse: "A command or token a reader pastes elsewhere.",
      pairs: ["CopyLine/Command", "CopyLine/Block"],
      usage: [
        "Give the whole line as `text`; the box shows it and the button copies it.",
        "Several lines are a `CodeBlock`; `CopyLine` is one line.",
        "A long token wraps inside the box.",
        "`disabled` disables the button, for a line shown before the page is interactive.",
      ],
      accessibility: [
        "The text is a `<code>` element, so a reader can select it by hand as well.",
        "The button is a `CopyButton`: a native button labelled `copy`, then `copied`.",
      ],
      api: ["CopyLine"],
    },
    {
      slug: "colour-scheme-toggle",
      name: "ColourSchemeToggle",
      summary: "The light and dark switch.",
      whenToUse: "A site that offers both schemes: one toggle in the header or controls.",
      pairs: ["ColourSchemeToggle/Switch", "ColourSchemeToggle/Schemes"],
      usage: [
        "Use one `ColourSchemeToggle` per site. It switches `<html>` between light and dark and remembers the choice in `localStorage`.",
        "`size` is `sm`, `md` (default) or `lg`, the same squares as `IconButton`.",
        "Put `colourSchemeScript` inline in `<head>`, so the stored or system scheme is on `<html>` before first paint and neither scheme flashes the other. It knows only the `dark` class.",
        'A light theme with a class of its own passes `schemes`, as in `schemes={{ light: "my-light", dark: "dark" }}`; render the same class on `<html>` on the server with `schemeClass`, and leave the head script out.',
        "An app that knows the scheme on the server (from a cookie) passes `initial`, sets `store={false}` and persists from `onChange`. It then leaves the head script out.",
        "Do not build a switch from your own buttons; the functions below are what the toggle itself calls.",
      ],
      accessibility: [
        "It is an `IconButton` named `Switch to dark theme` or `Switch to light theme`, so the name says the action, and the icon is `aria-hidden`.",
        "The icon shown is the scheme you would switch to: the moon on a light page, the sun on a dark one. It follows the class on `<html>` through CSS, so it is right on the first frame.",
        "`applyColourScheme` also sets `color-scheme` on `<html>`, so native controls and scrollbars follow.",
      ],
      api: ["ColourSchemeToggle"],
      functions: [
        {
          name: "applyColourScheme",
          text: "Puts a scheme on `<html>`: its class, the other scheme's class taken off, and `color-scheme`.",
        },
        {
          name: "schemeClass",
          text: "The class a scheme puts on `<html>`, for the server to render so the first paint is right; empty for the default light scheme.",
        },
        {
          name: "colourSchemeScript",
          text: "A string of JavaScript to inline in `<head>` before first paint: applies the stored scheme, else the system one.",
        },
        {
          name: "readColourScheme",
          text: "The stored choice, else the system preference, with a fallback (default light) when neither is available, as on the server.",
        },
        {
          name: "storeColourScheme",
          text: "Remembers a scheme in `localStorage` for the next visit; a storage error is swallowed.",
        },
      ],
    },
  ],
};
