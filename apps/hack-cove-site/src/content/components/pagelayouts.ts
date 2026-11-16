import type { ComponentSection } from "./types";

export const pagelayouts: ComponentSection = {
  title: "Page layouts",
  icon: "window",
  description:
    "The whole-page templates: pick the one for the kind of page, and it fixes the width and the rhythm.",
  pages: [
    {
      slug: "list-layout",
      name: "ListLayout",
      summary: "A page that lists things: header, filters, then the items.",
      whenToUse:
        "An index of quotes, builds, members or any other collection; a single record is `DetailLayout`.",
      pairs: ["ListLayout/Rows", "ListLayout/NothingYet"],
      fullPage: "ListLayout/FullPage",
      stories: ["Pages"],
      usage: {
        do: [
          "Put the page's title, `description` and primary `actions` in the header props; `breadcrumbs` and `tabs` go there too.",
          "`filters` sit between the header and the list: a `Fieldset` of pressed-toggle `Button`s in a `ButtonGroup`.",
          "The items are the `children`, one `Card` per item, or a `Table`; the layout spaces them.",
          "Give `empty` an `EmptyState` that says what is missing and what to do next: it shows when there are no children, and with no `empty` an empty list is a blank page.",
        ],
        dont: [
          "Do not build the header and the list by hand with `PageHeader` and `Stack`: the layout is the one right header, filters and list.",
        ],
      },
      accessibility: [
        "The title is the page's `h1`.",
        "`filters` and `children` render as given, so each filter group keeps its own `fieldset` and legend.",
        "`data-*` and `aria-*` go on the list's wrapper.",
      ],
      api: ["ListLayout"],
    },
    {
      slug: "detail-layout",
      name: "DetailLayout",
      summary: "A page about one record: its content beside the facts about it.",
      whenToUse:
        "One quote, build or member, with its content in the main column and its facts in the aside.",
      pairs: ["DetailLayout/Record"],
      fullPage: "DetailLayout/FullPage",
      usage: {
        do: [
          "The record's content is the `children`, in the main two thirds; they are spaced as a `Stack`, so give each block its own `Card`.",
          "The facts about the record go in `aside`, in the third beside it: a `Card` with a `KeyValueList`, a status, the people on it.",
          "Both columns are required: with nothing for the aside, use `ListLayout`.",
          "From `lg` the aside sits beside the content; below it, it stacks under the content.",
          "`sticky` keeps the aside in view from `lg` as a long page scrolls: it sticks under the shell's header, and an aside taller than the room left scrolls inside itself, so its end stays reachable. Leave it off when the aside is ordinary cards that may be taller than the screen; below `lg` it stacks either way.",
          "`asideLabel` names the aside's landmark. Set it when the page has another complementary landmark (a `SidebarLayout` rail, a `FullBleedLayout` panel), so a screen reader can tell them apart. It only names the aside; `DetailLayout` never folds it.",
          "The header props are the same as `ListLayout`: `breadcrumbs`, `title`, `description`, `actions`, `tabs`.",
        ],
      },
      accessibility: [
        "The title is the page's `h1`.",
        "The aside is an `<aside>`, a complementary landmark; the main column is a plain `div`.",
        "In the DOM the content comes first and the aside second, so that is the reading and tab order on every screen.",
        "With `sticky` a scrolling aside is still in the tab order, and a focus ring on a control in it is not cut off at its edge. An aside that scrolls and holds no link, field or button (plain text) takes one tab stop, named by `asideLabel`, so the keyboard can scroll it; an aside with a control in it takes none.",
      ],
      api: ["DetailLayout"],
    },
    {
      slug: "form-layout",
      name: "FormLayout",
      summary: "A page that is one form: header, fields, then the actions.",
      whenToUse: "Creating or editing a record on a page of its own.",
      siblings: [
        {
          slug: "form-row",
          when: "Fields sit side by side inside the form: a `FormGrid`, or a `FormRow` to edit one record on a line.",
        },
        {
          slug: "stack",
          when: 'The form sits in a `Card` on a page that is not the form: `Stack as="form"`.',
        },
        {
          slug: "field-dialog",
          when: "One text value is asked for over the page, such as a new name.",
        },
      ],
      pairs: ["FormLayout/Form"],
      fullPage: "FormLayout/FullPage",
      usage: {
        do: [
          "The fields are the `children`, grouped in `Card`s; the layout spaces them in a reading-width column.",
          'Save and Cancel go in `actions`, at the end of the form: a `type="submit"` Button first, then a ghost Cancel. The header has no `actions` here.',
          "Handle the submit with `onSubmit`: other props go on the `<form>` itself.",
          "A failed submit (the server refused it, no connection) is `error`: an alert directly above the `actions`. An error about one field is that `Field`'s `error`.",
          "A form in a small panel is a `Dialog` or `FieldDialog`; a sign-in is `CenteredLayout`.",
        ],
        dont: ["Do not put Save in the header of a `ListLayout`: that is not a form."],
      },
      accessibility: [
        'The root is a real `<form>`: Enter in a field submits it, and a `type="submit"` Button submits it.',
        "The title is the page's `h1`.",
        "Give each control a `Field`, so every input has a label.",
      ],
      api: ["FormLayout"],
    },
    {
      slug: "prose-layout",
      name: "ProseLayout",
      summary: "A page of text: one reading column with the header inside it.",
      whenToUse: "Privacy, terms, help or any page that is mostly paragraphs.",
      pairs: ["ProseLayout/Article"],
      fullPage: "ProseLayout/FullPage",
      usage: {
        do: [
          "The text is the `children`: `SectionHeading`s and `Text` paragraphs, spaced `md` apart.",
          "`gap` picks another spacing from the same scale (`xs` to `xl`) for the whole page; the default is right for most pages.",
          "The header sits inside the column, so its `actions` stay beside the text.",
          "The `description` is the page's lede, set larger than the paragraphs after it, and the title above it is the strongest text on the page.",
          "`width` is `narrow` (the reading column, the default), `wide` or `full`. Use `wide` for a page that is not long prose, such as pricing, so it does not leave the right third empty; a paragraph and the lede keep their reading measure.",
          "Data or cards in a grid are not prose: use `ListLayout` or `CardGrid`.",
        ],
      },
      accessibility: [
        "The title is the page's `h1`.",
        "Use `SectionHeading` for sections so the outline runs h1 then h2.",
        "`data-*` and `aria-*` go on the column's wrapper.",
      ],
      api: ["ProseLayout"],
    },
    {
      slug: "sidebar-layout",
      name: "SidebarLayout",
      summary: "A rail of links beside the page.",
      whenToUse:
        "A section with several sub-pages, such as settings, where the rail is the way between them.",
      pairs: ["SidebarLayout/Sections"],
      fullPage: "SidebarLayout/FullPage",
      usage: {
        do: [
          'The `aside` is `Tabs` of links with `orientation="vertical"` (the pill rail), one link per section and the current one `selected`.',
          "The `children` are the section's page: its `PageHeader`, then the content.",
          "From `md` the rail is a fixed width beside the page; below it, the rail stacks above the page.",
          "From `md` the rail stays in view under the shell's header as a long page scrolls, with or without `asideLabel`; it is always on, not an option. A rail taller than the screen scrolls inside itself, so its last link is reachable. Below `md` nothing sticks.",
          "The rail has no background or border: it is a list of links on the page.",
          "A long rail sets `asideLabel`: below `md` it folds behind a closed disclosure of that name, so the page comes first on a phone; from `md` it is the same rail. A short rail leaves it out.",
          'Once the page has loaded, a rail that scrolls shows its current link (the one with `aria-current`) in view, with its own thin scrollbar, and the folded disclosure reads `asideLabel` and the current link, such as "All components: Button". Nothing to set; in Astro, hydrate the layout (`client:load`).',
          "Facts about one record go in `DetailLayout`'s aside, not a rail.",
          "A docs site uses `DocsLayout`, which is this rail with the docs page's title, contents list and neighbours fixed.",
        ],
      },
      accessibility: [
        "The rail is an `<aside>` holding the `Tabs`, which is a `<nav>` named by its `label`. `asideLabel` also names the `<aside>`, so a page with a second complementary landmark (a `DetailLayout` aside) can tell them apart.",
        'The current link has `aria-current="page"`.',
        "In the DOM the rail comes first, so it is first in the tab order; folded, the summary is that first stop and the links are skipped until it is opened.",
        "With `asideLabel` the rail is a native `<details>` disclosure: its `<summary>` is the toggle, on the keyboard like any button. From `md` the `<details>` is open for real (after the page loads; before that, and with no JavaScript, the CSS shows it), so the links are in the accessibility tree.",
        "A rail that scrolls itself is still in the tab order, and a focus ring on a link in it is not cut off at the rail's edge. A rail of links has no tab stop of its own; a rail that scrolls and holds no link takes one, named by `asideLabel`.",
      ],
      api: ["SidebarLayout"],
    },
    {
      slug: "docs-layout",
      name: "DocsLayout",
      summary: "A docs page: the docs nav, the title, an On this page list and the way onwards.",
      whenToUse:
        "Every page of a docs site: a nav of grouped pages, an article with its own headings, and previous and next in reading order.",
      pairs: ["DocsLayout/Docs"],
      fullPage: "DocsLayout/FullPage",
      stories: ["DocsLayout"],
      usage: {
        do: [
          "Give `nav` the docs pages in reading order, in groups: each group's `title` over its links, a group with no title at the top. `navLabel` names the rail and the disclosure it folds behind below `md`.",
          "Give `contents` the page's own headings (`id`, `label`, `level` 2 or 3) in order; the layout draws the On this page list, a closed disclosure above the article below `xl` and a sticky column right of it from `xl`. With fewer than two there is no list.",
          "`current` is the id of the heading being read, a value the page passes; a site that follows the reader computes it. Left out, no entry is marked.",
          "Give `previous` and `next` the pages either side in reading order; they are links, not cards, so they add no heading to the outline.",
          "Wrap the article in a `Prose`; its `Section` headings start at `h2` under the layout's `h1`.",
        ],
        dont: [
          "Do not hand-build a contents list or a pager beside a `SidebarLayout`: that is `DocsLayout`.",
          "Never put a scroll spy in the page to mark the list; pass `current`.",
        ],
      },
      accessibility: [
        'The rail is an `<aside>` named `navLabel`; each group is a `<nav>` named by its title (the top group by `navLabel`), and the current page has `aria-current="page"`.',
        "The title is the page's one `h1`.",
        'The On this page list is one `<nav>` named `contentsLabel` at every width, so there is one copy of each link; the entry for `current` has `aria-current="location"`.',
        'Previous and next are one `<nav>` named from `previousLabel` and `nextLabel`; each link\'s name is the word and the page ("Previous: Install").',
      ],
      api: ["DocsLayout"],
    },
    {
      slug: "full-bleed-layout",
      name: "FullBleedLayout",
      summary: "A canvas that fills the width, with an optional panel.",
      whenToUse:
        "A viewer that needs the whole width, such as a snapshot, a canvas or a player; an ordinary page is not.",
      pairs: ["FullBleedLayout/Viewer"],
      fullPage: "FullBleedLayout/FullPage",
      usage: {
        do: [
          "Render it in an `AppShell` with `bleed`; the canvas starts at the left edge of the viewport.",
          "It adds no padding and has no page title; the canvas is the `children`. Set `padded` when the body is not a viewer and should have the other layouts' page padding.",
          "Put the facts about what is shown in `aside`, a `KeyValueList` under an `Overline`. From `lg` the aside is a fixed-width column on the right; below it, it stacks under the canvas.",
          "Omit `aside` when the canvas stands alone.",
          "`asideLabel` names the aside's landmark. Set it when the page has another complementary landmark.",
          "`bar` is a full-width row above the canvas and the panel, such as a viewer's title and its actions in a `Cluster justify=\"between\"`. It is a `StickyBar`: it sticks under the shell's header as the page scrolls; `padded` does not pad it.",
          "A page with a title and content is `ListLayout` or `DetailLayout`.",
        ],
      },
      accessibility: [
        'The `aside` is an `<aside>`, a complementary landmark; give it a heading with `Overline as="h2"`, or name it with `asideLabel`.',
        "The canvas comes first in the DOM, then the panel.",
      ],
      api: ["FullBleedLayout"],
    },
    {
      slug: "centered-layout",
      name: "CenteredLayout",
      summary: "One narrow card, centred on the page.",
      whenToUse: "Sign-in, a landing page, or a not-found or error page.",
      pairs: ["CenteredLayout/Page"],
      fullPage: "CenteredLayout/FullPage",
      usage: {
        do: [
          "Give it a `title` and a `description`; the `children` are the card's content: a `Field` or two and a `Button`.",
          "It is the one layout that does not share the left edge: it is centred, at a fixed offset from the top.",
          "A form inside the app is `FormLayout`, not this.",
          "The ready-made status pages (not found, forbidden, offline, error, maintenance) are already built on it.",
        ],
      },
      accessibility: [
        "The title is the page's `h1`.",
        "The card is a plain `div`, not a landmark; the shell's `main` holds it.",
        "Give each control a `Field`, so every input has a label.",
      ],
      api: ["CenteredLayout"],
    },
  ],
};
