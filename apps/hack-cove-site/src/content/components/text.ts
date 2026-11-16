import type { ComponentSection } from "./types";

export const text: ComponentSection = {
  title: "Text",
  icon: "type",
  description: "Headings, body copy, links, code and the small text parts.",
  pages: [
    {
      slug: "headings",
      name: "Headings",
      summary: "The four heading roles, each with its size and weight fixed.",
      whenToUse:
        "Any title on a page: the public headline, the page title, a section, a subsection.",
      pairs: ["Headings/Scale", "Headings/Hero"],
      stories: ["typography"],
      usage: {
        do: [
          "A page has one title: `PageHeading` for an app page, `Display` for the headline of a public page. A `PageHeader` already draws the `PageHeading` and its `description`, so use it for the top of a page.",
          "Name the parts of a page with `SectionHeading`; `rule` puts the hairline under it, with the space either side built in.",
          "Name what is inside a part with `SubsectionHeading`: `size` `sm` is a form-group caption, `md` (default) a card title in a header bar, `lg` a drawer title. `truncate` cuts one that is too long for its column to a single line.",
          "Put a `Lead` under a `Display`, and a `Text` under any other heading. `Dialog` and `Drawer` draw their own title from their `title`.",
          "Pick the heading for its place in the outline, never for its size. `Display` is not a big `SectionHeading`.",
          "Each heading has its own fixed ink and takes no colour. A heading's meaning is carried by its words, not a colour.",
          "`as` changes the element, only to keep the outline in order, and never the look.",
          "`description` on a `SectionHeading` is a muted line under it that says more; it is not part of the heading's name.",
        ],
      },
      accessibility: [
        "Each heading renders a real heading element: `Display` and `PageHeading` an `h1`, `SectionHeading` an `h2`, `SubsectionHeading` an `h3`.",
        "`as` swaps the element and keeps the look, so the outline can follow the page without a visual change.",
        "`id`, `aria-*` and `data-*` go on the heading element.",
        "`Dialog` and `Drawer` draw their title as a `SectionHeading` and name themselves by it; an `EmptyState` does the same.",
      ],
      api: ["Display", "PageHeading", "SectionHeading", "SubsectionHeading"],
      types: ["SubsectionHeadingSize"],
    },
    {
      slug: "prose",
      name: "Prose",
      summary:
        "The long-form type scale for a docs page or an article: body 16, h4 16 semibold, h3 20 and h2 24.",
      whenToUse:
        "The body of a docs page or an article, where a reader scans headings. An app screen never uses it.",
      pairs: ["Prose/Docs"],
      stories: ["Prose"],
      usage: {
        do: [
          "Wrap the body of a docs page or an article in `Prose`, inside a `ProseLayout`, a `SidebarLayout` or anywhere else. `ProseLayout` takes no prop for it.",
          'Write the page with the usual parts: `SectionHeading` is the h2, `SubsectionHeading` the h3 and `SubsectionHeading size="sm"` (as `h4`) the h4, `Text` the paragraph. Inside `Prose` they take the long-form sizes; nothing else about them changes.',
          "`Callout` text, `BulletList` items, inline `Code` and a `TextLink` follow the body size. `Caption`, `Overline`, `Table`, `CodeBlock` and the form controls keep theirs.",
          "A `Dialog`, `Drawer` or `EmptyState` inside `Prose` looks as it does on any app screen.",
          "The sizes are fixed: `Prose` has no size to choose.",
        ],
        dont: [
          "Never use `Prose` on an app screen. A dashboard, a form or a list keeps the app sizes.",
        ],
      },
      accessibility: [
        "`Prose` renders a `div` and adds nothing to the page outline or to what a screen reader announces.",
        "The heading elements are unchanged: pick `as` to keep the outline in order, as everywhere else.",
        "`id`, `aria-*` and `data-*` go on the `div`.",
      ],
      api: ["Prose"],
    },
    {
      slug: "body-text",
      name: "Body text",
      summary:
        "Running text, emphasis, fine print, labels and the empty note, each with its size and weight fixed.",
      whenToUse:
        "Every run of text that is not a heading: a paragraph, a supporting line, a note, a label, the line in an empty Card.",
      pairs: [
        "BodyText/Paragraph",
        "BodyText/Meaning",
        "BodyText/Labels",
        "ui/EmptyNote",
        "ui/EmptyView",
      ],
      usage: {
        do: [
          'Set a paragraph in `Text`, a `<p>`. Inside a row, a cell or a sentence it is `Text as="span"`. A block of it stops at a readable line length.',
          'Emphasise a run with `Text strong` inside the `Text`: font-medium in the primary ink. Use `Caption` for fine print and metadata, `Caption as="span"` inside a row.',
          "Put a `Text` under a heading and `Lead` under a `Display`. `Overline` is the small all-caps label above a group, not a title.",
          "A Card, a table or a list with nothing in it yet takes an `EmptyState` in its `empty` slot, which draws it as one muted line there; a muted `Text` is not an empty state.",
          "`tone` is the one ink prop: `neutral`, the default, the role's own ink; `muted` and `accent` for the hierarchy of the text; and `positive`, `warn`, `danger` or `info` for what a run means. The words still say it, so colour is never the only signal.",
          '`numeric` sets tabular figures so a column of amounts lines up and `mono` the monospace face for an id or a path. `lines` (1 to 4) on `Text` or `Caption` shows at most that many lines and ends in an ellipsis: `lines={1}` cuts a run where its box ends, `lines={3}` clamps a long description. A "Show all" is your own state: `lines={open ? undefined : 3}` beside a `Button`.',
          '`align` sets a run at `start`, `center` or `end` of its block, for a table header or a right-hand column. `minWidth="amount"` on `Text` fixes a width and right-aligns a money figure in it, so a column of amounts lines up.',
          "`italic` on `Text` or `Caption` sets a muted hint or a caption in italic. `breakWords` breaks a long unbroken string, such as a URL or a token, at the edge of its box.",
          "`preserveNewlines` on `Text` keeps the line breaks of text a person typed, such as a note.",
        ],
        dont: [
          "Never write a bare `<p>`, `<span>`, `<strong>` or `<small>`: they carry none of the theme's type scale or colour.",
        ],
      },
      accessibility: [
        "`Text`, `Caption` and `Lead` render a `p`, and `Overline` a `span`. `as` changes the element: a `span` for `Text` or `Caption` inside a row or a sentence, an `li`, or a `label` for an `Overline` with `htmlFor`.",
        '`Overline` is a label, not a heading: it adds nothing to the page outline. A small section title is `Section size="sm"`, not `Overline as="h2"`.',
        "`lines` sets the full text as the `title` when the content is plain text, so a pointer user can read what was cut. Give a `title` of your own when the content is not.",
        "A `tone` changes only the colour. The wording has to carry the meaning.",
      ],
      api: ["Text", "Caption", "Overline", "Lead"],
      types: ["TextAlign", "TextLines", "TextMinWidth", "TextTone"],
    },
    {
      slug: "code",
      name: "Code",
      summary: "Inline code in a sentence, and a block of code to read or copy.",
      whenToUse:
        "A command, name or path inside a sentence is `Code`; several lines of code are a `CodeBlock`.",
      siblings: [
        {
          slug: "copy-button",
          when: "Neither a `CopyLine` nor `copy` on a `CodeBlock` or `CodeExample` fits.",
        },
        { slug: "copy-line", when: "The text to copy is one line, such as an install command." },
      ],
      pairs: ["Code/Inline", "CodeBlock/Snippet"],
      usage: {
        do: [
          "Use `Code` for one short run inside a sentence. It takes the text colour and size around it, and keeps no line breaks.",
          "Use `CodeBlock` for several lines. Give the text as `children`, or as `lines` with one entry per line.",
          "`label` names the language or file (`bash`, `css`) in a caption above the code; `language` says what to colour, from `tsx`, `ts`, `js`, `json`, `bash`, `console`, `css`, `html` and `yaml`.",
          "A shell session is `console`: a line starting with `$ ` is a command, coloured as bash, and every other line is output. With `copy`, only the commands are copied, without the `$ `.",
          "A line a reader copies is a `CopyLine`, not a one-line `CodeBlock`. A rendered part shown with its code is a `CodeExample`.",
          "Without a `language` the code is one colour (`text`), which suits an error or a log.",
          'A long line wraps, so a command is never cut off and still copies as one line. `overflow="scroll"` keeps lines whole and scrolls them sideways under a thin scrollbar in the theme\'s colour, for code whose layout matters.',
          "`copy` adds a copy button beside the code. It needs client JS; on a page rendered to static HTML, inline `copyScript` once (see CopyButton).",
        ],
      },
      accessibility: [
        "`Code` renders a `<code>`. `CodeBlock` renders a `<figure>` with the code in `<pre><code>`, so the line breaks are kept.",
        "`label` is the `<figcaption>`, which names the figure.",
        "`CodeBlock` takes `aria-*` and `data-*` on its figure.",
      ],
      api: ["Code", "CodeBlock"],
      types: ["CodeLanguage"],
    },
    {
      slug: "code-example",
      name: "CodeExample",
      summary: "A rendered example with the code that makes it, in one frame.",
      whenToUse: "Documentation that shows a part and its source together.",
      pairs: ["CodeExample/Preview"],
      usage: {
        do: [
          "Put the rendered part in `children` and its source in `code`, a string with the newlines kept.",
          "`caption` is one note on the example, the last band of the frame.",
          "Side by side in a grid, each frame is its own height, so do not pad the previews to match.",
          "A wide preview or a long line of code scrolls inside the frame under a thin themed scrollbar; it does not widen the page.",
          "`copy` adds a button beside the code that copies the code, not the preview. It needs client JS; on a page rendered to static HTML, inline `copyScript` once (see CopyButton).",
          "Inside a `Prose` the preview stays on the app scale, so the part looks as it does on an app screen; the caption is outside it.",
          "Only for documentation. A command to copy is a `CopyLine`, and code alone is a `CodeBlock`.",
        ],
      },
      accessibility: [
        "A `<figure>` holds the preview and the code in `<pre><code>`; `caption` is its `<figcaption>`.",
        "`aria-*` and `data-*` go on the figure.",
      ],
      api: ["CodeExample"],
    },
    {
      slug: "kbd",
      name: "Kbd",
      summary: "A keyboard key, drawn as a keycap.",
      whenToUse: "A key or a shortcut the reader presses: `Esc`, `?`, `⌘S`.",
      pairs: ["Kbd/Key"],
      usage: {
        do: [
          "Use `Kbd` for a key the reader presses, in a sentence or as the shortcut on a `Button`.",
          "A command or a name is `Code`, never `Kbd`.",
        ],
      },
      accessibility: [
        "`Kbd` renders a `<kbd>` element, which marks the text as keyboard input.",
        "Its border takes the colour of the text around it, so it reads on plain text and on a filled button.",
      ],
      api: ["Kbd"],
    },
    {
      slug: "markdown",
      name: "Markdown",
      summary: "A small, safe renderer for a summary written in markdown.",
      whenToUse: "Text that arrives as markdown, such as an agent's summary, shown on a page.",
      pairs: ["Markdown/Summary"],
      usage: {
        do: [
          "Pass the markdown as `md`. It renders `##` as a label heading, `###` as a subheading, lines starting `- ` or `* ` as bullets, `**bold**` and plain paragraphs.",
          "Nothing else is supported: no `#` title, numbered list, link, code span, table or HTML. Those show as plain text.",
          "The text becomes React nodes and never HTML, so untrusted text cannot inject markup.",
          "Text you write yourself is not markdown: use `Text`, `BulletList` and the heading components.",
        ],
      },
      accessibility: [
        "`##` renders an `h2` and `###` an `h3`, bullets render a `ul` with `li`s, bold a `strong` and a paragraph a `p`.",
        "The headings start at `h2`, so the page needs its own `h1` above.",
        "`aria-*` and `data-*` go on the root.",
      ],
      api: ["Markdown"],
    },
    {
      slug: "text-link",
      name: "TextLink",
      summary: "A link in the accent colour, inside a sentence or on its own.",
      whenToUse:
        "A link that sits in text. A link that must look like a button is a `Button` with `href`.",
      siblings: [
        { slug: "button", when: "The link must look like a button: a `Button` with `href`." },
      ],
      pairs: ["TextLink/InSentence", "TextLink/External", "TextLink/Router", "TextLink/Stretch"],
      usage: {
        do: [
          "Use `TextLink` for every link in running text.",
          '`external` is for another site: it opens a new tab with `rel="noreferrer"`.',
          "In an app with a router, set the router's `<Link>` once on a `LinkProvider` and give each `TextLink` its `href`. The library has no router.",
          'Set the adapter once, at the router. TanStack Router: `InnerWrap: ({ children }) => <LinkProvider link={(p) => <Link to="." {...p} />}>{children}</LinkProvider>` on `createRouter` (`to="."` satisfies the typed `to`; the `href` wins). React Router: `<LinkProvider link={({ href, ...p }) => <Link to={href} {...p} />}>`. Astro: no provider.',
          '`home` on the same `LinkProvider` is where every status page\'s "Back to home" goes, `/` by default (`home="https://example.com"` with no `link` for a home on another site). A provider inside another keeps what it does not set.',
          "Only an in-app path (`/quotes?page=2#top`) reaches the adapter; `external`, `https:`, `mailto:`, `#hash` and a relative path are a plain `<a>`.",
          "`size` pins the type size to `sm`, `md` or `lg`; left out, the link takes the size of its text. `mono` sets the monospace face for a path or an id.",
          '`tone` gives the link a meaning\'s colour (`warn`, `danger`, `positive`, `info`, `muted`), underlined on hover. Use it for a link that is the message, like "3 failed".',
          "`stretch` makes the nearest `relative` ancestor the click target: a `Card` or a `TableRow`. Put it on the one link in that row; any other link or button in the row sits above it and is clickable on its own.",
        ],
        dont: [
          "Never write a bare `<a>` for a link in running text.",
          "Never a render prop or a wrapper component per link. Every part that links (`Button`, `Card`, `ListRow`, `Tabs`, `Breadcrumbs` and the rest) takes `href` and goes through the same `LinkProvider`.",
        ],
      },
      accessibility: [
        "A `TextLink` is a native `<a>`, so it is in the tab order and opens with Enter.",
        "It has a focus ring from the component, so the keyboard focus is always visible.",
        '`external` sets `target="_blank"` and `rel="noreferrer"`.',
        "Every anchor prop (`aria-*`, `download`, `title`, a handler) goes on the `<a>`; the app's `LinkProvider` adapter receives them as well.",
      ],
      api: ["TextLink", "LinkProvider"],
      types: ["LinkAdapter", "LinkAdapterProps", "TextLinkSize"],
    },
    {
      slug: "bullet-list",
      name: "BulletList",
      summary:
        "A bulleted list with the discs, indent and gap built in; each item is a `BulletItem`.",
      whenToUse: "Items that read as a list of points: what changed, what to bring.",
      siblings: [
        { slug: "steps", when: "The items are a sequence the reader follows in order." },
        { slug: "timeline", when: "The items are a history, each with when it happened." },
      ],
      pairs: ["BulletList/Items"],
      usage: {
        do: [
          "Give a `BulletList` `BulletItem` children: each is an `<li>` in the body text.",
          "Steps a reader follows in order are a `BulletList ordered`: a numbered `<ol>` with the same indent and gap.",
          "Items that have a label and a value are a `KeyValueList`; a list of records is a `Table` or a `ListRow`.",
        ],
        dont: ["Never type a hyphen into a paragraph to make a list."],
      },
      accessibility: [
        "A `BulletList` renders a `<ul>` (an `<ol>` with `ordered`), so a screen reader announces a list and the number of items.",
        "`id`, `aria-*` and `data-*` go on the list, or on one item.",
      ],
      api: ["BulletList", "BulletItem"],
    },
    {
      slug: "meta-list",
      name: "MetaList",
      summary: "A wrapping row of facts or links in muted small text, joined by a dot.",
      whenToUse:
        "The facts about a record under its title (branch, SHA, date), or a footer's row of links (Privacy, Terms, Contact).",
      siblings: [
        { slug: "table", when: "Many records with the same columns, to read across and compare." },
        {
          slug: "key-value-list",
          when: "One record's fields, one per line, each label beside its value.",
        },
        { slug: "list-row", when: "Each item is a thing to open, on a row of its own." },
      ],
      pairs: ["MetaList/Facts", "MetaList/Footer"],
      usage: {
        do: [
          "Each child is one item: text, a `Code` or a `TextLink`.",
          "`separator` is `·` (default), `•` or `none`.",
          "An item never breaks inside itself; the row wraps between items.",
          "`mono` sets the whole row in the monospace face, for ids and paths.",
          "A labelled fact is a `KeyValueList`.",
        ],
        dont: [
          "Never type the separators yourself: they wrap onto the end of a line and a screen reader reads them.",
        ],
      },
      accessibility: [
        "A `MetaList` renders a `<ul>` with an `<li>` per item.",
        "The separators are `aria-hidden` and lead every item but the first, held to their item so a wrap never leaves one at the end of a line.",
        "Each link keeps its own focus ring; the row adds no extra tab stop.",
        "`aria-*` and `data-*` go on the list.",
      ],
      api: ["MetaList"],
      types: ["MetaListSeparator"],
    },
  ],
};
