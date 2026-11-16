import { framePages } from "./frame";
import type { ComponentSection } from "./types";

export const layout: ComponentSection = {
  title: "Layout",
  icon: "grid",
  description: "Where things go on the page: the shell, the width, the spacing between parts.",
  pages: [
    ...framePages,
    {
      slug: "sticky-bar",
      name: "StickyBar",
      summary: "A full-width bar that sticks under the AppShell header.",
      whenToUse:
        "A page's filters or bulk actions that must stay in reach while a long `bleed` page scrolls.",
      pairs: ["StickyBar/Bar"],
      usage: {
        do: [
          "Put it first in an `AppShell bleed` page; it spans its parent and sticks just under the shell's header as the page scrolls.",
          'It draws the surface, the bottom line and the padding; its `children` are the row, such as a `Cluster justify="between"` of filters and an action.',
          "`FullBleedLayout`'s `bar` is a `StickyBar`; with that layout, pass the row as `bar` instead.",
          "Write no `sticky` row of your own.",
        ],
      },
      accessibility: [
        "It is a plain `<div>`, not a landmark; it sits in the page's `<main>` and its controls keep their own names.",
        "`aria-*` and `data-*` props go on the root element.",
      ],
      api: ["StickyBar"],
    },
    {
      slug: "container",
      name: "Container",
      summary: "The one content edge: every page's width and side padding.",
      whenToUse:
        "Content outside an `AppShell`, such as a band in a `bleed` shell, that must start at the same x as the page.",
      pairs: ["ContainerDocs/OneEdge"],
      stories: ["Container"],
      usage: {
        do: [
          "`Container` is the only place the page width (`max-w-6xl`) and side padding are defined; a header, a page and a footer inside one start at the same x.",
          "`AppShell` already wraps its header, main and footer in one. Use `Container` only for a part of a `bleed` shell that spans the page, so its content still keeps the edge.",
          "`as` picks the element: `div` (default), `main`, `header`, `footer`, `section` or `nav`. A `section` or `nav` needs an `aria-label`.",
          "Space inside it with a `Stack`; a `Container` has no vertical padding or gap of its own.",
          "`ref` reaches the rendered element, for a parent that measures or scrolls it.",
        ],
        dont: ["Never nest a `Container` in a `Container`: the padding doubles."],
      },
      accessibility: [
        "A `Container` adds no role: a `div` is not a landmark. `as` picks `main`, `header`, `footer`, `section` or `nav` when the part should be one.",
        "`aria-*` and `data-*` go on the rendered element.",
      ],
      api: ["Container"],
    },
    {
      slug: "page-header",
      name: "PageHeader",
      summary: "The top of a page: breadcrumbs, title, description, actions and tabs.",
      whenToUse:
        "The first block of every page but a landing page, which opens with a `Hero`; it puts the page's first content at the same y on every page.",
      pairs: ["PageHeaderDocs/Slots", "PageHeaderDocs/InStack"],
      stories: ["PageHeader"],
      usage: {
        do: [
          "Pass `title`, and `description`, `breadcrumbs`, `actions` and `tabs` as needed; never build a title row from a heading and a `Cluster`.",
          "`actions` sit beside the title from `sm` up and under it on a phone: a `Button` or two, one primary.",
          "`breadcrumbs` take a `Breadcrumbs`; `tabs` take pill `Tabs` of links to pages.",
          "Its fixed bottom margin gives every page the same first-block position. As a direct child of a `Stack` it has none and the Stack's `gap` is the only space, so do not wrap it in another element.",
          "One `PageHeader` per page: it holds the page's `<h1>`. A landing page has a `Hero` in its place.",
        ],
      },
      accessibility: [
        "The title is the page's `<h1>`; the description is a paragraph.",
        '`Breadcrumbs` is a `<nav>` named Breadcrumb, with the last crumb marked `aria-current="page"`. Give the `Tabs` a `label`.',
        "On a narrow screen the actions move below the title.",
      ],
      api: ["PageHeader"],
    },
    {
      slug: "hero",
      name: "Hero",
      summary:
        "A landing page's top block: an overline, the display title and the lede, over a slow glow.",
      whenToUse:
        "The first block of a site's landing page, and nowhere else: every other page opens with a `PageHeader`.",
      pairs: ["HeroDocs/Landing", "HeroDocs/InnerPage"],
      stories: ["Hero"],
      usage: {
        do: [
          "One `Hero` per page, and only on the landing page: it is the page's top block. Inner pages use `PageHeader`.",
          "Pass `title` and, if it has one, `overline`; put a `Lead` in `children`, then the page's first actions in a `Cluster` if there are any: a primary `Button` and an `outline` or `ghost` one in the default tone, or a `TextLink`. That is the text the theme's contrast check holds over the glow.",
          "The glow is always on and takes no prop. Its colours and its strength are the theme's, so a paper theme keeps it faint.",
          "It caps itself at a reading measure at the parent's left edge, and the glow is clipped to it, so a phone never scrolls sideways. Put it as the first child of the page's `Stack`.",
        ],
        dont: [
          "Never build the block from an `Overline`, a `Display` and a `Lead` by hand: the hand-built one has no glow and drifts from the one top block.",
        ],
      },
      accessibility: [
        "The title is the page's `<h1>`, in a `<header>` with the overline.",
        'The glow is `aria-hidden="true"` and takes no pointer; the text sits above it and holds AA contrast over it in every theme.',
        "The glow drifts only under `prefers-reduced-motion: no-preference`; with reduced motion it stands still. It is plain markup and CSS, so it renders on the server and needs no script.",
      ],
      api: ["Hero"],
    },
    {
      slug: "stack",
      name: "Stack",
      summary:
        "A vertical column of blocks a fixed gap apart, and Section for a titled group, large or small.",
      whenToUse:
        "Any blocks that follow each other: space is a Stack's `gap`, never a margin on a block.",
      pairs: [
        "StackDocs/Gap",
        "StackDocs/SectionTitle",
        "StackDocs/List",
        "StackDocs/Width",
        "StackDocs/Align",
        "StackDocs/Divided",
        "StackDocs/SmallSection",
        "StackDocs/LandingSection",
      ],
      stories: ["Stack"],
      usage: {
        do: [
          "`gap` is a scale: `xs` between lines of text, `sm` inside a group, `md` between blocks, `lg` between groups, `xl` between a page's top-level blocks (the one responsive page rhythm). Left out, it comes from where the Stack sits: `xs` inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow`, `md` on the page.",
          "`width` caps the column at the left edge: `compact` (one card or one picture's column), `narrow` (a reading measure), `wide`, `full`, or `default` for the parent's width. It is never re-centred. A width cap on any one block is a `Stack` around it: `<Stack width=\"compact\"><Card>...</Card></Stack>`.",
          '`align="start"` keeps each child at its own width: a `Button` under a form\'s fields. Left out, every child spans the column.',
          "`divided` draws a line between each pair of children and sets them touching, with no gap: rows that carry their own padding, such as `ListRow`s in a `Card flush`. For space and a line between blocks, put a `Divider` in the Stack.",
          '`as` is `div` (default), `section`, `form`, `ul` or `ol`. `as="form"` takes the form props and spaces its fields; `as="ul"` and `as="ol"` draw no markers and their children are `<li>`s.',
          "A titled group is a `Section`: `title`, `actions` beside it, then the blocks, spaced as a `Stack`. It takes `gap` and `width` as `Stack` does. `rule` draws a hairline under the title row, `actions` included. Its title is an `h2` on the page, one level below the section that holds it, and a `Card` or `EmptyState` inside it is one below that; `level` sets it by hand.",
          'A small titled group (a panel\'s "Flaky" block, a card\'s "Ignore areas") is `Section size="sm"`: a small all-caps title, its blocks `xs` apart, `actions` at the end of the title row.',
          "`rowFrom` (`sm`, `md` or `lg`) turns the column into a row from that breakpoint and leaves it a column below: a main block beside a side column on a wide screen, stacked on a phone. Put the block that takes the width left in a `ClusterGrow`.",
          "A row that is a row at every width is a `Cluster`, not a Stack.",
          "`overline` puts a small label above a `Section`'s title, in the same `<header>`, and `description` a line under it that is not part of the heading's name.",
          'A landing page\'s section under the `Hero` is `Section size="lg"` and nothing else: a mono `overline` kicker, the title at display size, `description` as a `Lead`, then `actions` as its calls to action, the opening capped at the reading measure at the left edge and the blocks `lg` apart. A feature card in it is a `Card href icon titleStyle="name"` in a `CardGrid`; text beside code is a `SideColumn`.',
        ],
        dont: [
          "Never build a landing section from an `Overline`, a `Display` and a `Lead` by hand: it is unnamed and drifts from every other one.",
          'Do not build a small titled group from `Stack as="section"` and an `Overline as="h2"`: it is unnamed and its gap is a guess. It is `Section size="sm"`.',
        ],
      },
      accessibility: [
        "`Section` is a `<section>` named by its `title` (`aria-labelledby`), so it is a region; with no `title` give it an `aria-label`.",
        'A `Stack` with `as="ul"` or `as="ol"` is a real list: give it an `aria-label` when more than one list is on the page. `as="ul" divided` is still a list; the lines are only drawn.',
        '`as="form"` is a `<form>`; give it an `aria-label` or let a heading name it.',
        "A `div` Stack adds no role.",
      ],
      api: ["Stack", "Section"],
    },
    {
      slug: "cluster",
      name: "Cluster",
      summary:
        "A horizontal row a fixed gap apart, and ClusterGrow for the item that takes the room left.",
      whenToUse:
        "Items in a line that are not buttons: a label beside a value, an input beside its actions, a row of pills.",
      pairs: ["Cluster/FillRow", "Cluster/Buttons", "Cluster/Spacer", "Cluster/List"],
      usage: {
        do: [
          "`gap` is `xs`, `sm` (default) or `md`, the first steps of the `Stack` scale. Cluster is the one row whose default is not `md`: the items of a row sit closer than the blocks of a column.",
          "`align` is the cross axis: `center` (default), `baseline` for mixed text sizes, `start` or `end`. `justify` is the main axis: `start` (default), `between` for the two ends, `end`.",
          "The items flow onto more lines when the row runs out of room; `wrap={false}` keeps them on one line.",
          "Wrap the one item that should fill the row in `ClusterGrow`; it can shrink to nothing, so a long value truncates and the others stay.",
          "An empty `ClusterGrow` is a spacer: what follows it goes to the end.",
          "`ClusterGrow` takes `minWidth` (`sm` 12rem or `md` 17rem) when it must keep a width: in a `Cluster` that wraps it then drops under the other items instead of being squashed beside them. A `ClusterGrow` also works inside a `Stack` with `rowFrom`.",
          "A row of buttons is a `ButtonGroup`, which wraps on a phone and can pin an item to the end. Use `Cluster` for every other row.",
          '`justify="between"` is for two items; with more, the middle one floats, so use a spacer.',
          '`as="span"` makes the row a `span`, for inside a paragraph where a `div` is not allowed; its items must then be phrasing content, so no `ClusterGrow`.',
          '`as="ul"` or `as="ol"` makes a wrapping row of like things (tags, chips) a list. Write each item as an `<li>`, as in a `Stack` list; the Cluster does not wrap them, and a `ClusterGrow` does not belong in a list.',
        ],
      },
      accessibility: [
        'A `Cluster` is a `div` (or a `span` with `as="span"`) and adds no role; the reading and tab order is the source order of its children.',
        "A `ul` or `ol` Cluster is a list a screen reader counts; give it an `aria-label` when more than one list is on the page.",
        "`ClusterGrow` is a `div` too: put the labelled control inside it, with its own `aria-label` or `Field`.",
      ],
      api: ["Cluster", "ClusterGrow"],
    },
    {
      slug: "side-column",
      name: "SideColumn",
      summary: "A main area beside a side column: the one two-column split.",
      whenToUse:
        "Any main area beside a side panel, such as a thread beside its assistant or a record beside its facts; a whole page with a header is `DetailLayout`, which is this split under a `PageHeader`.",
      pairs: ["SideColumn/FixedColumn"],
      stories: ["SideColumn"],
      usage: {
        do: [
          "`children` are the main area and `aside` is the side column. From `lg` the aside is `asideWidth` wide on the right and the main area takes the room left; below `lg` the aside stacks under the main area.",
          "`asideWidth` is `sm` (18rem), `md` (24rem, the default) or `third` (one third of the row, the main area two thirds). `sm` and `md` are exact, whatever the aside holds; there is no other width.",
          "`sticky` keeps the aside in view from `lg` as a long page scrolls: it sticks under the header and, when it is taller than the screen, scrolls itself.",
          "`asideLabel` is for an aside that should not take a phone's screen: below `lg` it folds, closed, behind a disclosure of that name, and from `lg` it is the same column, always shown, with no toggle. The aside stays mounted while folded, so state inside it is kept. Left out, the aside is always shown. It also names the aside's landmark.",
          "It sets no page width, padding or header of its own: put it inside a layout, a `Card` or a panel. Space inside each column with a `Stack`.",
          '`DetailLayout`\'s aside is a `SideColumn asideWidth="third"`, so a split inside a page that wants the thirds is `SideColumn asideWidth="third"`, never a `CardGrid`. A rail of links on the left is `SidebarLayout`. A `Stack` with `rowFrom` and a `ClusterGrow` sizes the side by its content, so it is not a fixed column.',
        ],
      },
      accessibility: [
        "The side column is an `<aside>`, a complementary landmark; the main area is a plain `div`. Give the aside a heading, or set `asideLabel`, which also names it, when it needs a name.",
        "In the DOM the main area comes first and the aside second, so that is the reading and tab order on every screen.",
        "A `sticky` aside that is taller than the screen and holds no link or field takes a tab stop of its own, named by `asideLabel`, so the keyboard can scroll it.",
        "With `asideLabel` the aside is a native `<details>` disclosure below `lg`: its `<summary>` is the toggle, on the keyboard like any button. From `lg` the summary is gone and, once the page has loaded, the `<details>` is open for real, so the aside is in the accessibility tree.",
      ],
      api: ["SideColumn"],
    },
    {
      slug: "card-grid",
      name: "CardGrid",
      summary: "A responsive grid of cards or tiles.",
      whenToUse:
        "Several cards or `StatTile`s of the same weight that should sit side by side on a wide screen.",
      pairs: ["CardGrid/Tiles", "CardGrid/Auto"],
      fullPage: "CardGrid/FullPage",
      usage: {
        do: [
          "Use `columns` 2, 3 or 4 when you know how many; it is one column on a phone, two from `sm` and `columns` from `lg`.",
          'Use `columns="auto"` when the count varies: it fits as many per row as the width allows, none narrower than `minWidth` (`md`, the default, or `sm`).',
          'Every tile in a `CardGrid` is one width. A main card beside a narrower one is a `SideColumn` (`asideWidth="third"` for two thirds and one third), not a grid.',
          '`align="start"` keeps each card its own height; by default every card stretches to the tallest in its row.',
          "`CardGrid` goes inside a page layout; it sets no page width of its own.",
          "A single column of blocks is a `Stack`, not a one-column `CardGrid`.",
          '`as="ul"` makes the grid a list and wraps each child in a list item, for a set of like tiles a screen reader should count. The look is the same.',
        ],
      },
      accessibility: [
        'The grid is a plain `div` with no role: the cards keep their own order and semantics. With `as="ul"` it is a list, and each child is a list item.',
        "The order is the DOM order, so the tab order follows the reading order.",
      ],
      api: ["CardGrid"],
    },
    {
      slug: "show",
      name: "Show",
      summary: "Shows its content only from a width up, or only below it.",
      whenToUse:
        "Content that only fits a wide screen, and its narrow-screen form: a table from `sm`, a stack of cards below it.",
      pairs: ["Show/Swap"],
      stories: ["Show"],
      usage: {
        do: [
          'Content that only fits a wide screen is in a `Show from`; its narrow-screen form is in a `Show below` at the same breakpoint: `<Show below="sm">{cards}</Show><Show from="sm">{table}</Show>`.',
          "Give exactly one of `from` or `below`, each `sm`, `md` or `lg`. There is no default: the reader sees the rule.",
          '`as="span"` inside phrasing content: a run in a `<p>`, a `Kbd` hint in a button row.',
          "The wrapper adds no box, so its children sit in the parent's row, grid or `Stack` and the parent's gap spaces them. To keep two items together, put a `Cluster` inside the `Show`.",
          "Hidden content stays mounted, so two `Show`s of one stateful panel mount it twice. A panel shown at every width that folds on a phone is a `SideColumn asideLabel`, not two `Show`s.",
        ],
        dont: [
          "Never write `hidden sm:block` or `sm:hidden` in an app: the breakpoint is a `Show`.",
        ],
      },
      accessibility: [
        "Hidden is `display: none`: the content is out of the accessibility tree and the tab order, so a table hidden on a phone is not read out there.",
        "The reading order is the source order; `Show` moves nothing.",
        "It is CSS only, the same markup on the server and the client, so it works before the page hydrates and with no script.",
      ],
      api: ["Show"],
    },
    {
      slug: "divider",
      name: "Divider",
      summary: "A hairline rule in the theme's line colour.",
      whenToUse: "One line between a heading and its content, or above a footer.",
      pairs: ["Divider/Footer", "Divider/Cards"],
      usage: {
        do: [
          "Use it between two parts of a page that are not bordered, such as the content and its footer.",
          "The space around it is the layout's: put it in a `Stack`, never add margin.",
          "For a rule under a section title, `SectionHeading` and `Section` have `rule`. For a line between two `Section`s, put a `Divider` between them in their `Stack`.",
          "Rows with a line between each and no gap (a list of `ListRow`s) are a `Stack divided`, not a `Divider` after every row.",
        ],
        dont: [
          "Do not draw it between bordered blocks such as `Card`: their borders and the `gap` already separate them.",
        ],
      },
      accessibility: [
        "It is an `<hr>`, which assistive tech announces as a separator. Use it only where the content really changes.",
      ],
      api: ["Divider"],
    },
  ],
};
