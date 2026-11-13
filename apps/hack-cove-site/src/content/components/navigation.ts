import type { ComponentSection } from "./types";

export const navigation: ComponentSection = {
  title: "Navigation",
  icon: "compass",
  description: "Moving between pages and views.",
  pages: [
    {
      slug: "tabs",
      name: "Tabs",
      summary: "Switch a view in place, or move between pages.",
      whenToUse:
        "Tabs switch a panel on the same page. A row of links to other pages is `Tabs` with link items.",
      pairs: ["Tabs/SwitchView", "Tabs/SwitchPage", "Tabs/Count", "TabsLinks/Rail"],
      usage: [
        "`Tabs` switches a view in place; the caller owns `value` and `onChange`, and the panel sits right under the row.",
        'Going to another page is `variant="pill"` with link items (`href` or `render`, and `active` on the current one): links, so the URL, the back button and a new tab all work.',
        "A `count` sits muted after the label and is read as part of the tab's name.",
        '`variant="pill"` fills the current tab, for under a `PageHeader`.',
        "`size` (`sm`, `md` the default, `lg`) sets a pill row on the control scale, so they line up with a `Button` of the same size.",
        "A disabled tab keeps a `title` as the reason.",
        'Pill links with `orientation="vertical"` are the rail of a `SidebarLayout`: one link per line.',
      ],
      accessibility: [
        "The row is a tab list named by `label`; the arrow keys, Home and End move between the tabs, and a disabled tab is skipped.",
        'Give the panel `role="tabpanel"` and a tab `controls` that points at its `id`.',
        'A tab is a `button` with `role="tab"` and `aria-selected`; only the current tab is in the tab order, and the arrow keys move and choose.',
        'Link items form a `<nav>` named by `label`; the current link gets `aria-current="page"`.',
      ],
      api: ["Tabs"],
    },
    {
      slug: "breadcrumbs",
      name: "Breadcrumbs",
      summary: "Where this page sits in the hierarchy.",
      whenToUse:
        "A page several levels deep that needs a way back up: org, project, build, snapshot.",
      pairs: ["Breadcrumbs/Trail", "Breadcrumbs/Hierarchy"],
      usage: [
        "Give the trail in order, parents first. A parent that links is `{ label, href }` (or `{ label, render }` for the app's router link); the last crumb is the current page, plain text.",
        "Breadcrumbs show a hierarchy. Peer sections are pill `Tabs` of links.",
        "Each crumb truncates, so a long name does not widen the row.",
        "Put the trail in the `breadcrumbs` slot of a `PageHeader`.",
      ],
      accessibility: [
        '`<nav aria-label="Breadcrumb">` around an ordered list.',
        'The last item has `aria-current="page"` and is never a link.',
        "The `/` separators are `aria-hidden`.",
      ],
      api: ["Breadcrumbs"],
    },
    {
      slug: "site-search",
      name: "SiteSearch",
      summary: "Find a page by name, from a header button or Ctrl+K.",
      whenToUse:
        "A site with more pages than a reader can scan in its nav: a docs site, an app with many sections.",
      pairs: ["SiteSearch/Header"],
      usage: [
        "Put one `SiteSearch` in `AppShell`'s `controls`, on every page, and pass every page as `items`: `{ label, description, href, keywords }`.",
        '`label` names the button and titles the dialog: say what is searched ("Search components").',
        "Give `items` in the nav's order: results of the same rank keep it.",
        "`keywords` are other names a page answers to (the exports it documents); they match but are not shown.",
        "A result ranks by the name starting with the text, then the name containing it, then a keyword, then the description.",
        "From `sm` up the button reads Search with its key (Ctrl K, or ⌘ K on a Mac); below `sm` it is the search icon alone.",
        "It searches names, not page text, and needs no service.",
      ],
      accessibility: [
        "Ctrl+K or Cmd+K opens it from anywhere on the page; the button carries `aria-keyshortcuts`.",
        "It opens a `Dialog` titled by `label` with focus in the search field; Esc closes it and focus goes back to where it was.",
        "Enter opens the first result. ArrowDown moves from the field to the results and ArrowUp and ArrowDown move between them; they are links, so Tab reaches them too.",
        'A polite live region reads the result count as you type ("3 results").',
      ],
      api: ["SiteSearch"],
    },
  ],
};
