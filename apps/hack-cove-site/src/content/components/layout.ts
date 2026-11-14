import type { ComponentSection } from "./types";

export const layout: ComponentSection = {
  title: "Layout",
  icon: "grid",
  description: "Where things go on the page: the shell, the width, the spacing between parts.",
  pages: [
    {
      slug: "app-shell",
      name: "AppShell",
      summary: "The page frame: header, optional subnav, main and footer.",
      whenToUse:
        "Every page of an app sits in one `AppShell`; it is the only place the page canvas, the font and the header live.",
      pairs: ["AppShellDocs/Brand", "AppShellDocs/RouterBrand", "AppShellDocs/HideBelow"],
      stories: ["AppShell"],
      usage: [
        "Fill the slots and write no wrapper: `brand`, `nav` (pill `Tabs` of links), `controls` (a picker, a `ColourSchemeToggle`), then an optional `subnav` row and `footer`.",
        '`brand` is an `AppShellBrand`: logo and label in one link. `collapse` leaves only the logo below `sm`. `logoSize` is `sm` (20px), `md` (24px, the default, an `Avatar size="sm"`) or `lg` (32px); an `<img>` or `<svg>` logo fills it.',
        "`AppShellHideBelow` wraps a header control that only matters on a wide screen, such as the viewer's name: hidden below `breakpoint` (`sm`, the default, `md` or `lg`), a centred row from there up.",
        "A bar that sticks under the header at the top of a `bleed` page is a `StickyBar`.",
        "With a router, give `AppShellBrand` a `render` that draws the app's own `<Link>` instead of an `href`.",
        "Header, main and footer each sit in a `Container`, so a page never sets its own width or padding. Do not add a `Container` inside the shell.",
        "`bleed` drops main's `Container` for a layout that needs the whole width (`FullBleedLayout`); `SidebarLayout` needs no `bleed`.",
        "On a phone `nav` and `subnav` fold into one Menu button, so a nav of any length stays reachable with no sideways scroll; `menuLabel` renames the button (`Menu` by default), for a translated app.",
        "`hideChromeInPrint` hides the header and footer and main's padding on paper; screen is unchanged.",
        "`header` is for a node no other slot covers. Prefer `brand`, `nav` and `controls`.",
        "Put `appShellRootClassFor(scheme)` on the app's own `<html>`. `AppShell` never touches `<html>`.",
        "A theme sets the canvas colour and the font, and the shell turns on font smoothing (`antialiased`); the app writes no page background, font or smoothing rule.",
      ],
      accessibility: [
        "The header is a `<header>` (the banner landmark), main is `<main>` and the footer is `<footer>`.",
        "`AppShellBrand` is one link named by its `label`; the logo is `aria-hidden`. With `collapse` the label is visually hidden below `sm` and still names the link.",
        "On a phone `nav` and `subnav` sit behind one Menu button, a native disclosure: it opens with no JavaScript, from the keyboard (Enter or Space) and for a screen reader, Escape closes it and returns to the button, and following a link closes it. The panel is not in the header's flow, so the header is the same height on every page.",
        "From `md` a header row that is wider than the screen (a long nav) scrolls sideways and never wraps; a link that takes focus scrolls into view, and the side with more to reach fades out.",
        "Give `nav` and `subnav` pill `Tabs` of links, so each is a labelled `<nav>`.",
      ],
      api: ["AppShell", "AppShellBrand", "AppShellHideBelow"],
      functions: [
        {
          name: "appShellRootClassFor",
          text: "Everything the app's `<html>` takes from the scheme the server knows: that scheme's class and the class that always reserves the scrollbar, so centred content does not shift between a short page and a long one.",
        },
      ],
    },
    {
      slug: "sticky-bar",
      name: "StickyBar",
      summary: "A full-width bar that sticks under the AppShell header.",
      whenToUse:
        "A page's filters or bulk actions that must stay in reach while a long `bleed` page scrolls.",
      pairs: ["StickyBar/Bar"],
      usage: [
        "Put it first in an `AppShell bleed` page; it spans its parent and sticks just under the shell's header as the page scrolls.",
        'It draws the surface, the bottom line and the padding; its `children` are the row, such as a `Cluster justify="between"` of filters and an action.',
        "`FullBleedLayout`'s `bar` is a `StickyBar`; with that layout, pass the row as `bar` instead.",
        "Write no `sticky` row of your own.",
      ],
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
      usage: [
        "`Container` is the only place the page width (`max-w-6xl`) and side padding are defined; a header, a page and a footer inside one start at the same x.",
        "`AppShell` already wraps its header, main and footer in one. Use `Container` only for a part of a `bleed` shell that spans the page, so its content still keeps the edge.",
        "Never nest a `Container` in a `Container`: the padding doubles.",
        "`as` picks the element: `div` (default), `main`, `header`, `footer`, `section` or `nav`. A `section` or `nav` needs an `aria-label`.",
        "Space inside it with a `Stack`; a `Container` has no vertical padding or gap of its own.",
        "`elementRef` hands over the rendered element, for a parent that measures or scrolls it.",
      ],
      accessibility: [
        "A `Container` adds no role: a `div` is not a landmark. `as` picks `main`, `header`, `footer`, `section` or `nav` when the part should be one.",
        "`aria-*` and `data-*` go on the rendered element.",
      ],
      api: ["Container"],
    },
    {
      slug: "page-header",
      name: "PageHeader",
      summary: "The top of a page: breadcrumbs, title, subtitle, actions and tabs.",
      whenToUse:
        "The first block of every page; it puts the page's first content at the same y on every page.",
      pairs: ["PageHeaderDocs/Slots", "PageHeaderDocs/InStack"],
      stories: ["PageHeader"],
      usage: [
        "Pass `title`, and `subtitle`, `breadcrumbs`, `actions` and `tabs` as needed; never build a title row from a heading and a `Cluster`.",
        "`actions` sit beside the title from `sm` up and under it on a phone: a `Button` or two, one primary.",
        "`breadcrumbs` take a `Breadcrumbs`; `tabs` take pill `Tabs` of links to pages.",
        "Its fixed bottom margin gives every page the same first-block position. As a direct child of a `Stack` it has none and the Stack's `gap` is the only space, so do not wrap it in another element.",
        "One `PageHeader` per page: it holds the page's `<h1>`.",
      ],
      accessibility: [
        "The title is the page's `<h1>`; the subtitle is a paragraph.",
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
      usage: [
        "One `Hero` per page, and only on the landing page: it is the page's top block. Inner pages use `PageHeader`.",
        "Pass `title` and, if it has one, `overline`; put a `Lead` in `children`, then the page's first actions in a `Cluster` if there are any: a primary `Button` and an `outline` or `ghost` one in the default tone, or a `TextLink`. That is the text the theme's contrast check holds over the glow.",
        "Never build the block from an `Overline`, a `Display` and a `Lead` by hand: the hand-built one has no glow and drifts from the one top block.",
        "The glow is always on and takes no prop. Its colours and its strength are the theme's, so a paper theme keeps it faint.",
        "It caps itself at a reading measure at the parent's left edge, and the glow is clipped to it, so a phone never scrolls sideways. Put it as the first child of the page's `Stack`.",
      ],
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
      summary: "A vertical column of blocks a fixed gap apart, and Section for a titled group.",
      whenToUse:
        "Any blocks that follow each other: space is a Stack's `gap`, never a margin on a block.",
      pairs: ["StackDocs/Gap", "StackDocs/SectionTitle", "StackDocs/List"],
      stories: ["Stack"],
      usage: [
        "`gap` is a scale: `xs` between lines of text, `sm` inside a group, `md` (default) between blocks, `lg` between groups, `xl` between a page's top-level blocks (the one responsive page rhythm).",
        "`width` caps the column at the left edge: `narrow` (a reading measure), `wide`, `full`, or `default` for the parent's width. It is never re-centred.",
        '`as` is `div` (default), `section`, `form`, `ul` or `ol`. `as="form"` takes the form props and spaces its fields; `as="ul"` and `as="ol"` draw no markers and their children are `<li>`s.',
        "A titled group is a `Section`: `title`, `actions` beside it, then the blocks, at gap `md` (default). It takes `gap` and `width` as `Stack` does. `rule` draws a hairline under the title row, `actions` included.",
        "`rowFrom` (`sm`, `md` or `lg`) turns the column into a row from that breakpoint and leaves it a column below: a main block beside a side column on a wide screen, stacked on a phone. Put the block that takes the width left in a `ClusterGrow`.",
        "A row that is a row at every width is a `Cluster`, not a Stack.",
      ],
      accessibility: [
        "`Section` is a `<section>` named by its `title` (`aria-labelledby`), so it is a region; with no `title` give it an `aria-label`.",
        'A `Stack` with `as="ul"` or `as="ol"` is a real list: give it an `aria-label` when more than one list is on the page.',
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
      pairs: ["Cluster/FillRow", "Cluster/Buttons", "Cluster/Spacer"],
      usage: [
        "`gap` is `xs` (default), `sm` or `md`, the first steps of the `Stack` scale. Cluster is the one row whose default is not `md`: most rows are a label and its chips, which sit tight.",
        "`align` is the cross axis: `center` (default), `baseline` for mixed text sizes, `start` or `end`. `justify` is the main axis: `start` (default), `between` for the two ends, `end`.",
        "`wrap` lets the items flow onto more lines on a phone; without it the row stays on one line.",
        "Wrap the one item that should fill the row in `ClusterGrow`; it can shrink to nothing, so a long value truncates and the others stay.",
        "An empty `ClusterGrow` is a spacer: what follows it goes to the end.",
        "`ClusterGrow` takes `minWidth` (`sm` 12rem or `md` 17rem) when it must keep a width: in a `Cluster` with `wrap` it then drops under the other items instead of being squashed beside them. A `ClusterGrow` also works inside a `Stack` with `rowFrom`.",
        "A row of buttons is a `ButtonGroup`, which wraps on a phone and can pin an item to the end. Use `Cluster` for every other row.",
        '`justify="between"` is for two items; with more, the middle one floats, so use a spacer.',
        '`as="span"` makes the row a `span`, for inside a paragraph where a `div` is not allowed; its items must then be phrasing content, so no `ClusterGrow`.',
      ],
      accessibility: [
        'A `Cluster` is a `div` (or a `span` with `as="span"`) and adds no role; the reading and tab order is the source order of its children.',
        "`ClusterGrow` is a `div` too: put the labelled control inside it, with its own `aria-label` or `Field`.",
      ],
      api: ["Cluster", "ClusterGrow"],
    },
    {
      slug: "side-column",
      name: "SideColumn",
      summary: "A main area beside a side column of a fixed width.",
      whenToUse:
        "Part of a page that is a main area and a side panel of a known width, such as a thread beside its assistant; a whole page with a header is `DetailLayout`.",
      pairs: ["SideColumn/FixedColumn"],
      stories: ["SideColumn"],
      usage: [
        "`children` are the main area and `aside` is the side column. From `lg` the aside is `asideWidth` wide on the right and the main area takes the room left; below `lg` the aside stacks under the main area.",
        "`asideWidth` is `sm` (18rem) or `md` (24rem, the default). The width is exact, whatever the aside holds; there is no other width.",
        "`asideLabel` is for an aside that should not take a phone's screen: below `lg` it folds, closed, behind a disclosure of that name, and from `lg` it is the same column, always shown, with no toggle. The aside stays mounted while folded, so state inside it is kept. Left out, the aside is always shown. It also names the aside's landmark.",
        "It sets no page width, padding, header or stickiness of its own: put it inside a layout, a `Card` or a panel. Space inside each column with a `Stack`.",
        "A side column that is a share of a page under a `PageHeader` (two thirds and one third) is `DetailLayout`'s `aside`; a rail of links on the left is `SidebarLayout`. A `Stack` with `rowFrom` and a `ClusterGrow` sizes the side by its content, so it is not a fixed column.",
      ],
      accessibility: [
        "The side column is an `<aside>`, a complementary landmark; the main area is a plain `div`. Give the aside a heading, or set `asideLabel`, which also names it, when it needs a name.",
        "In the DOM the main area comes first and the aside second, so that is the reading and tab order on every screen.",
        "With `asideLabel` the aside is a native `<details>` disclosure below `lg`: its `<summary>` is the toggle, on the keyboard like any button. From `lg` the summary is gone and, once the page has loaded, the `<details>` is open for real, so the aside is in the accessibility tree.",
      ],
      api: ["SideColumn"],
    },
    {
      slug: "divider",
      name: "Divider",
      summary: "A hairline rule in the theme's line colour.",
      whenToUse: "One line between a heading and its content, or above a footer.",
      pairs: ["Divider/Footer", "Divider/Cards"],
      usage: [
        "Use it between two parts of a page that are not bordered, such as the content and its footer.",
        "The space around it is the layout's: put it in a `Stack`, never add margin.",
        "Do not draw it between bordered blocks such as `Card`: their borders and the `gap` already separate them.",
        "For a rule under a section title, `SectionHeading` and `Section` have `rule`. For a line between two `Section`s, put a `Divider` between them in their `Stack`.",
      ],
      accessibility: [
        "It is an `<hr>`, which assistive tech announces as a separator. Use it only where the content really changes.",
      ],
      api: ["Divider"],
    },
  ],
};
