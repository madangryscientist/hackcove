import type { ComponentSection } from "./types";

export const actions: ComponentSection = {
  title: "Actions",
  icon: "pointer",
  description: "Things a person presses.",
  pages: [
    {
      slug: "button",
      name: "Button",
      summary: "The action a person takes on a view.",
      whenToUse: "An action that changes something in place: save, cancel, delete, retry.",
      siblings: [
        {
          slug: "fieldset",
          when: "Toggles that filter a list: a `Fieldset` round a `ButtonGroup` of pressed `Button`s, one per facet.",
        },
        { slug: "text-link", when: "The link is a destination in running text." },
      ],
      pairs: [
        "Button/OnePrimary",
        "Button/DisabledReason",
        "Button/Navigate",
        "Button/Destructive",
        "ButtonGroup/Row",
      ],
      stories: ["ButtonCount", "ButtonTooltip"],
      usage: {
        do: [
          'Put one primary Button in a view. The other actions use `variant="outline"`, `"ghost"` or `"link"`; `variant="dashed"` is the full-width "add another" row at the foot of a list.',
          "Group the actions in a `ButtonGroup`, so the row spaces and wraps the same everywhere; `end` pushes one item, such as a Back link, to the far side, and `label` names the group.",
          "Say why a button cannot be pressed with `disabledReason`; use `busy` while the work is in flight.",
          "Going to another page is a `Button` with `href`: a real `<a>` with the same look, drawn by the app's router link through `LinkProvider`.",
          'A destructive action is `tone="danger"`, an accept is `tone="positive"`; `size="sm"` is for a button inside a row or a card header, `size="lg"` for the one action of a hero or a sign-in form.',
          '`pressed` makes a toggle. `busy` disables it while the work is in flight, and `busy="Saving"` also shows that label: one prop, `busy={saving && "Saving"}`.',
          '`count` puts a number chip after the label, for how many are behind the button (the splits of a row, the comments on a thread): `<Button variant="ghost" size="sm" count={3}>Splits</Button>`. A button that opens something also takes `aria-expanded`, and `aria-controls` for what it opens; the caller owns that state.',
          "An icon-only action is an `IconButton`, not a Button holding a glyph.",
          '`variant="link"` is only for a `<button>`, an action, that sits in running text. A destination in text is a `TextLink`, and one that must look like a button is a `Button` with `href`.',
        ],
      },
      accessibility: [
        'A Button is a native `<button>` and defaults to `type="button"`, so it never submits a form by accident.',
        "`disabledReason` blocks the button with `aria-disabled` and keeps it in the tab order, so a keyboard reaches it; a click, Enter and Space do nothing, and the reason shows as a tooltip on hover, keyboard focus and a tap, read out as the button's description. In a browser without CSS anchor positioning the reason is its native `title`.",
        "`busy` sets `aria-busy` and disables the button until the work is done.",
        "Every Button has a focus ring from the component, so the keyboard focus is always visible.",
        "The `count` chip is part of the button's name: `Splits, 3` (a `count` of 0 is shown as `Splits, 0`). Pass `aria-expanded` on a button that opens something, so a screen reader hears whether it is open.",
      ],
      api: ["Button", "ButtonGroup"],
    },
    {
      slug: "icon-button",
      name: "IconButton",
      summary: "A square button for one icon.",
      whenToUse: "An action with a familiar icon and no room for a word: delete, settings, alerts.",
      pairs: [
        "IconButton/Label",
        "IconButton/Badge",
        "IconButton/Navigate",
        "IconButton/DisabledReason",
      ],
      usage: {
        do: [
          "Always give the `label`: it is the accessible name and the tooltip, and the icon is only decoration.",
          '`variant="ghost"` is the quiet one for a row or a toolbar; `tone="danger"` is for delete and clear.',
          "`size` is `sm` (26px) inside a row or a chip, `md` (default, 38px, the height of a `Button`) or `lg` beside a large `Button`.",
          "An unread count is `count`, never part of the label; it is not shown at 0. The icon is `icon`, a name from the `Icon` set, never a child.",
          "Going to another page is `href` (through the app's `LinkProvider`), which draws the same button as a link.",
          "Say why it cannot be pressed with `disabledReason`: the reason becomes its tooltip in place of the label.",
          "An action that needs a word is a `Button`.",
          "A row of several icon buttons is a `Menu`: one main action in view, the rest behind it.",
        ],
      },
      accessibility: [
        "`label` is set as `aria-label`, and shows as a tooltip above the button on hover and on keyboard focus (the native `title` in a browser without CSS anchor positioning); with a `count` it reads `Alerts, 3`. The tooltip repeats the name, so it is hidden from a screen reader.",
        "The badge itself is `aria-hidden`, so the count is read once, through the name.",
        'As a button it defaults to `type="button"`; with `href` it is a real link, and `external` opens a new tab with `rel="noreferrer"`.',
        "`disabledReason` sets `aria-disabled` and keeps the button in the tab order; a click, Enter and Space do nothing, and the reason shows as a tooltip on hover, keyboard focus and a tap, read out as its description (the native `title` without CSS anchor positioning).",
        "It has the component's focus ring.",
      ],
      api: ["IconButton"],
    },
    {
      slug: "menu",
      name: "Menu",
      summary: "A button that opens a short list of actions.",
      whenToUse:
        "A row, card or header with more actions than fit: put the one main action in view and the rest in a Menu.",
      pairs: ["Menu/Overflow", "Menu/Destructive"],
      usage: {
        do: [
          "Keep the one main action in view as a `Button` and put the rest in one `Menu` beside it; a row of several icon buttons is a `Menu`.",
          "`items` is data: each a `label` with `onSelect`, or a link with `href` (through the app's `LinkProvider`; `external` opens a new tab). `icon` adds a leading glyph from the `Icon` set and `disabled` dims one.",
          'A destructive item is `tone="danger"` and goes last, so it is never the first thing the arrows reach.',
          'The default trigger is a ghost three-dot button named by `label`; `trigger="button"` is an outline button reading `label`, for a menu whose name is worth a word ("Export"). `size="sm"` inside a row or a card header.',
          "In a `ListRow` with `revealOnHover`, the row keeps its actions shown while the menu is open.",
        ],
        dont: [
          "Never put the only action of a row in a `Menu`: one action is a `Button` or an `IconButton`.",
          "Do not hide a reason in the menu: an item that cannot be chosen says why in its label or on the page.",
        ],
      },
      accessibility: [
        "The trigger is a button with `aria-haspopup` and `aria-expanded`, named by `label`; the menu takes the same name.",
        "Enter, Space or ArrowDown open it on the first item, ArrowUp on the last; the arrows, Home, End and a typed letter move; Enter chooses; Escape closes it, and focus goes back to the trigger.",
        'A link item is a real link with `role="menuitem"`; a disabled item is skipped by the arrows.',
        "Inside a `Dialog` the menu opens in the dialog, so it is not inert, and Escape closes only the menu.",
      ],
      api: ["Menu"],
    },
    {
      slug: "icon",
      name: "Icon",
      summary: "The library's own icons, and a sizer and toner for one `<svg>` glyph.",
      whenToUse:
        "A glyph beside text or inside a control: a flag in a row, a camera in a Button, or a feature icon (`name` at `feature` size) that stands for an idea.",
      pairs: ["Icon/Icon"],
      usage: {
        do: [
          "`name` picks one of the library's icons, all on one grid and one stroke: `diff`, `baseline`, `review`, `ci`, `self-host`, `privacy`, `capture`, `branch`, `theme`, `speed`, `search`, `chevron-right`, `chevron-down`, `close`, `external-link`, `settings`, `bell`, `check`, `plus`, `more`, `grid`, `window`, `type`, `card`, `pointer`, `field`, `table`, `compass`, `page` and `briefcase`. Each is named for its idea or action, not a product. Prefer one to drawing your own.",
          "For a glyph the set lacks, put a bare `<svg>` (with a `viewBox`, no size or colour classes) in an `Icon`; it fills the box.",
          "`size` is `sm` (14px), `md` (16px, the default), `lg` (20px) or `feature` (32px), for an icon that stands for an idea on its own. A feature card takes its icon through `Card`'s `icon`.",
          "`tone` is a text tone (`muted`, `accent`, `info`, `positive`, `warn`, `danger`); left out, the icon takes the colour of the text around it, so draw the glyph with `currentColor`.",
          "An icon that is a button is an `IconButton`.",
        ],
      },
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
      siblings: [
        { slug: "copy-line", when: "The text to copy is one line, such as a command." },
        {
          slug: "code",
          when: "The text to copy is a block of code: `CodeBlock copy`, or `CodeExample copy` in docs.",
        },
      ],
      pairs: ["CopyButton/Clipboard"],
      usage: {
        do: [
          "`text` is what is copied; `copiedLabel` shows in place of the label for two seconds once it is on the clipboard.",
          'Name what is copied in `label` and `copiedLabel` (`"Copy token"`, `"Token copied"`) when the page has more than one.',
          "A command or token in its own box is a `CopyLine`, which carries this button.",
          "Place a `CopyButton` yourself only when neither a `CopyLine` nor `copy` on a `CodeBlock` or `CodeExample` fits.",
          "On a page rendered to static HTML and never hydrated, inline `copyScript` once, as `colourSchemeScript` is: every `CopyButton`, `CopyLine`, and `CodeBlock` or `CodeExample` with `copy` then works. A hydrated button copies for itself and the script stays out of its way.",
        ],
        dont: ["Do not write the clipboard call by hand in a `Button`."],
      },
      accessibility: [
        'A native `<button>` with `type="button"` and a focus ring from the component.',
        "The accessible name is always `label`. A copy shows `copiedLabel` for two seconds and a polite status region beside the button announces it, again on every copy.",
        "A refused or missing clipboard leaves the label unchanged; nothing is announced.",
      ],
      api: ["CopyButton"],
      functions: [
        {
          name: "copyScript",
          text: "A string of JavaScript to inline once on a page rendered to static HTML: one click listener on `document` that makes every copy button work without hydration.",
        },
      ],
    },
    {
      slug: "copy-line",
      name: "CopyLine",
      summary: "One line of mono text with a copy button.",
      whenToUse: "A command or token a reader pastes elsewhere.",
      siblings: [
        {
          slug: "copy-button",
          when: "Neither a line nor a code block fits, so the button is placed by hand.",
        },
        { slug: "code", when: "The text is a block of several lines: `CodeBlock copy`." },
      ],
      pairs: ["CopyLine/Command", "CopyLine/Block"],
      usage: {
        do: [
          "Give the whole line as `text`; the box shows it and the button copies it.",
          "Several lines are a `CodeBlock`; `CopyLine` is one line.",
          "A long token wraps inside the box.",
          "`disabled` disables the button, for a line shown before the page is interactive.",
        ],
      },
      accessibility: [
        "The text is a `<code>` element, so a reader can select it by hand as well.",
        "The button is a `CopyButton`: a native button named `Copy`, whose status region announces `Copied` after each copy.",
      ],
      api: ["CopyLine"],
    },
    {
      slug: "colour-scheme-toggle",
      name: "ColourSchemeToggle",
      summary: "The light and dark switch.",
      whenToUse: "A site that offers both schemes: one toggle in the header or controls.",
      pairs: ["ColourSchemeToggle/Switch", "ColourSchemeToggle/Schemes"],
      usage: {
        do: [
          "Use one `ColourSchemeToggle` per site. It switches `<html>` between light and dark and remembers the choice in `localStorage`.",
          "`size` is `sm`, `md` (default) or `lg`, the same squares as `IconButton`.",
          "Put `colourSchemeScript` inline in `<head>`, so the stored or system scheme is on `<html>` before first paint and neither scheme flashes the other. It knows only the `dark` class.",
          'A light theme with a class of its own passes `schemes`, as in `schemes={{ light: "my-light", dark: "dark" }}`; render the same class on `<html>` on the server with `schemeClass`, and leave the head script out.',
          "An app that knows the scheme on the server (from a cookie) passes it as `defaultValue`, sets `store={false}` and persists from `onChange`. It then leaves the head script out.",
        ],
        dont: [
          "Do not build a switch from your own buttons; the functions below are what the toggle itself calls.",
        ],
      },
      accessibility: [
        "It is a button named `Switch to dark theme` or `Switch to light theme`, so the name says the action, and the icon is `aria-hidden`. The name follows the class on `<html>` through CSS before hydration, with no script; only the tooltip waits for the client.",
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
