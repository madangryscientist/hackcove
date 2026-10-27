import type { ComponentSection } from "./types";

export const layout: ComponentSection = {
  title: "Layout",
  description: "Where things go on the page: the shell, the width, the spacing between parts.",
  pages: [
    {
      slug: "app-shell",
      name: "AppShell",
      summary: "The page frame: header, optional subnav, main and footer.",
      whenToUse:
        "Every page of an app sits in one `AppShell`; it is the only place the page canvas, the font and the header live.",
      pairs: ["AppShellDocs/Brand", "AppShellDocs/RouterBrand"],
      usage: [
        "Fill the slots and write no wrapper: `brand`, `nav` (a `NavTabs`), `controls` (a picker, a `ColourSchemeToggle`), then an optional `subnav` row and `footer`.",
        "`brand` is an `AppShellBrand`: logo and label in one link. `collapse` leaves only the logo below `sm`.",
        "With a router, give `AppShellBrand` a `render` that draws the app's own `<Link>` instead of an `href`.",
        "Header, main and footer each sit in a `Container`, so a page never sets its own width or padding. Do not add a `Container` inside the shell.",
        "`bleed` drops main's `Container` for a layout that needs the whole width (`FullBleedLayout`); `SidebarLayout` needs no `bleed`.",
        "`hideChromeInPrint` hides the header and footer and main's padding on paper; screen is unchanged.",
        "`header` is for a node no other slot covers. Prefer `brand`, `nav` and `controls`.",
        "Put `appShellRootClassFor(scheme)` on the app's own `<html>`. `AppShell` never touches `<html>`.",
        "A theme sets the canvas colour and the font; the app writes no page background or font rule.",
      ],
      accessibility: [
        "The header is a `<header>` (the banner landmark), main is `<main>` and the footer is `<footer>`.",
        "`AppShellBrand` is one link named by its `label`; the logo is `aria-hidden`. With `collapse` the label is visually hidden below `sm` and still names the link.",
        "A header row that is wider than the screen (a long nav) scrolls sideways and never wraps; a link that takes focus scrolls into view, and the side with more to reach fades out.",
        "Give `nav` and `subnav` a `NavTabs` so each is a labelled `<nav>`.",
      ],
      api: ["AppShell", "AppShellBrand"],
      functions: [
        {
          name: "appShellRootClass",
          text: "The class for the app's own `<html>` that always reserves the scrollbar, so centred content does not shift between a short page and a long one.",
        },
        {
          name: "appShellRootClassFor",
          text: "Everything the app's `<html>` takes from the scheme the server knows: that scheme's class and `appShellRootClass`, joined.",
        },
      ],
    },
    {
      slug: "container",
      name: "Container",
      summary: "The one content edge: every page's width and side padding.",
      whenToUse:
        "Content outside an `AppShell`, such as a band in a `bleed` shell, that must start at the same x as the page.",
      pairs: ["ContainerDocs/OneEdge"],
      usage: [
        "`Container` is the only place the page width (`max-w-6xl`) and side padding are defined; a header, a page and a footer inside one start at the same x.",
        "`AppShell` already wraps its header, main and footer in one. Use `Container` only for a part of a `bleed` shell that spans the page, so its content still keeps the edge.",
        "Never nest a `Container` in a `Container`: the padding doubles.",
        "`as` picks the element: `div` (default), `main`, `header`, `footer`, `section` or `nav`. A `section` or `nav` needs an `aria-label`.",
        "Space inside it with a `Stack`; a `Container` has no vertical padding or gap of its own.",
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
      usage: [
        "Pass `title`, and `subtitle`, `breadcrumbs`, `actions` and `tabs` as needed; never build a title row from a heading and a `Cluster`.",
        "`actions` sit beside the title from `sm` up and under it on a phone: a `Button` or two, one primary.",
        "`breadcrumbs` take a `Breadcrumbs`; `tabs` take a `NavTabs` (links to pages).",
        "Its fixed bottom margin gives every page the same first-block position. As a direct child of a `Stack` it has none and the Stack's `gap` is the only space, so do not wrap it in another element.",
        "One `PageHeader` per page: it holds the page's `<h1>`.",
      ],
      accessibility: [
        "The title is the page's `<h1>`; the subtitle is a paragraph.",
        '`Breadcrumbs` is a `<nav>` named Breadcrumb, with the last crumb marked `aria-current="page"`. Give `NavTabs` a `label`.',
        "On a narrow screen the actions move below the title.",
      ],
      api: ["PageHeader"],
    },
    {
      slug: "stack",
      name: "Stack",
      summary: "A vertical column of blocks a fixed gap apart, and Section for a titled group.",
      whenToUse:
        "Any blocks that follow each other: space is a Stack's `gap`, never a margin on a block.",
      pairs: ["StackDocs/Gap", "StackDocs/SectionTitle", "StackDocs/List"],
      usage: [
        "`gap` is a scale: `xs` between lines of text, `sm` inside a group, `md` (default) between blocks, `lg` between groups, `section` between a page's top-level blocks (the one responsive page rhythm).",
        "`width` caps the column at the left edge: `narrow` (a reading measure), `wide`, `full`, or `default` for the parent's width. It is never re-centred.",
        '`as` is `div` (default), `section`, `form`, `ul` or `ol`. `as="form"` takes the form props and spaces its fields; `as="ul"` and `as="ol"` draw no markers and their children are `<li>`s.',
        "A titled group is a `Section`: `title`, `actions` beside it, then the blocks, at gap `sm`. It takes `gap` and `width` as `Stack` does.",
        "A row of items is a `Cluster`, not a Stack.",
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
        "`gap` is `xs`, `sm` (default) or `md`, the first steps of the `Stack` scale.",
        "`align` is the cross axis: `center` (default), `baseline` for mixed text sizes, `start` or `end`. `justify` is the main axis: `start` (default), `between` for the two ends, `end`.",
        "`wrap` lets the items flow onto more lines on a phone; without it the row stays on one line.",
        "Wrap the one item that should fill the row in `ClusterGrow`; it can shrink to nothing, so a long value truncates and the others stay.",
        "An empty `ClusterGrow` is a spacer: what follows it goes to the end.",
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
      slug: "divider",
      name: "Divider",
      summary: "A hairline rule in the theme's line colour.",
      whenToUse: "One line between a heading and its content, or above a footer.",
      pairs: ["Divider/Footer", "Divider/Cards"],
      usage: [
        "Use it between two parts of a page that are not bordered, such as the content and its footer.",
        "The space around it is the layout's: put it in a `Stack`, never add margin.",
        "Do not draw it between bordered blocks such as `Card`: their borders and the `gap` already separate them.",
        "For a rule under a section title, `SectionHeading` has `rule`.",
      ],
      accessibility: [
        "It is an `<hr>`, which assistive tech announces as a separator. Use it only where the content really changes.",
      ],
      api: ["Divider"],
    },
  ],
};
