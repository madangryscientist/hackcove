import type { ComponentPage } from "./types";

/** The page frame's pages: they open the Layout section of the rail, AppShell then SiteFooter. */
export const framePages: ComponentPage[] = [
  {
    slug: "app-shell",
    name: "AppShell",
    summary: "The page frame: header, optional subnav, main and footer.",
    whenToUse:
      "Every page of an app sits in one `AppShell`; it is the only place the page canvas, the font and the header live.",
    pairs: ["AppShellDocs/Brand", "AppShellDocs/RouterBrand", "AppShellDocs/HideBelow"],
    stories: ["AppShell"],
    usage: {
      do: [
        "Fill the slots and write no wrapper: `brand`, `nav` (pill `Tabs` of links), `controls` (a picker, a `ColourSchemeToggle`), then an optional `subnav` row and `footer`.",
        '`brand` is an `AppShellBrand`: logo and label in one link. `collapse` leaves only the logo below `sm`. `logoSize` is `sm` (20px), `md` (24px, the default, an `Avatar size="sm"`) or `lg` (32px); an `<img>` or `<svg>` logo fills it.',
        'A header control that only matters on a wide screen, such as the viewer\'s name, goes in a `Show from="sm"` (or `md`, `lg`) in `controls`; put a `Cluster` inside it to keep an avatar and a name together.',
        "A bar that sticks under the header at the top of a `bleed` page is a `StickyBar`.",
        "With a router, `AppShellBrand`'s `href` goes through the app's `LinkProvider`, like every link.",
        "Header, main and footer each sit in a `Container`, so a page never sets its own width or padding.",
        "`bleed` drops main's `Container` for a layout that needs the whole width (`FullBleedLayout`); `SidebarLayout` needs no `bleed`.",
        "`controls` stay in the row at every width, so keep them few (a theme toggle, the viewer's avatar). Pickers and actions that do not fit a phone row go in `menuControls`: from `md` they sit in the row after `controls`, and below `md` they are at the top of the Menu.",
        "On a phone `nav` and `subnav` fold into one Menu button, so a nav of any length stays reachable with no sideways scroll; `menuLabel` renames the button (`Menu` by default), for a translated app.",
        "`printChrome={false}` hides the header and footer and main's padding on paper; screen is unchanged.",
        '`density="compact"` is the one type step an app may set, once, here: text, headings and controls one step down everywhere inside, for a dense app. A site leaves it out and reads at 16px.',
        "`header` is for a node no other slot covers. Prefer `brand`, `nav` and `controls`.",
        "Put `appShellRootClassFor(scheme)` on the app's own `<html>`. `AppShell` never touches `<html>`.",
        "A theme sets the canvas colour and the font, and the shell turns on font smoothing (`antialiased`); the app writes no page background, font or smoothing rule.",
      ],
      dont: ["Do not add a `Container` inside the shell."],
    },
    accessibility: [
      "The header is a `<header>` (the banner landmark), main is `<main>` and the footer is `<footer>`.",
      "`AppShellBrand` is one link named by its `label`; the logo is `aria-hidden`. With `collapse` the label is visually hidden below `sm` and still names the link.",
      "On a phone `nav` and `subnav` sit behind one Menu button, a native disclosure: it opens with no JavaScript, from the keyboard (Enter or Space) and for a screen reader, Escape closes it and returns to the button, and following a link closes it. The panel is not in the header's flow, so the header is the same height on every page.",
      "`menuControls` render once, in the Menu below `md` and in the row from `md`, so a field keeps its value and its label names one control. A crowded `controls` clips beside the Menu button, never over it, so the nav stays reachable.",
      "From `md` a header row that is wider than the screen (a long nav) scrolls sideways and never wraps; a link that takes focus scrolls into view, and the side with more to reach fades out.",
      "Give `nav` and `subnav` pill `Tabs` of links, so each is a labelled `<nav>`.",
    ],
    api: ["AppShell", "AppShellBrand"],
    functions: [
      {
        name: "appShellRootClassFor",
        text: "Everything the app's `<html>` takes from the scheme the server knows: that scheme's class and the class that always reserves the scrollbar, so centred content does not shift between a short page and a long one.",
      },
    ],
  },
  {
    slug: "site-footer",
    name: "SiteFooter",
    summary: "A site's footer: the brand, a contact line, the site's links and the fine print.",
    whenToUse:
      "The footer of a marketing site or a docs site, in `AppShell`'s `footer` slot. An app with no footer leaves the slot empty.",
    pairs: ["SiteFooter/Footer"],
    stories: ["SiteFooter"],
    usage: {
      do: [
        "Put it in `AppShell`'s `footer` slot: `<AppShell footer={<SiteFooter ... />}>`.",
        "`brand` is the site's mark, linked to `brandHref` (`/` by default) and named by `brandLabel`. `children` is the contact line beside it, at body size.",
        "`links` are the site's own pages (Privacy, Terms, GitHub, a mail address), one wrapping row; `external` opens one in a new tab. `notes` are lines of fine print under them (a licence, a legal name, a credit), one paragraph each.",
        "Links go through the app's `LinkProvider`, like every link.",
      ],
      dont: [
        "Do not add link columns, a newsletter form or social icons: a site footer is this and nothing else.",
      ],
    },
    accessibility: [
      "It is not a `<footer>`: `AppShell` draws the one `contentinfo` landmark around its slot, so the page has exactly one.",
      "The brand is one link named by `brandLabel`, or by its own text.",
      "The links are a list, so a screen reader counts them.",
    ],
    api: ["SiteFooter"],
  },
];
