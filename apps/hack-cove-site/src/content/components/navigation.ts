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
      siblings: [
        {
          slug: "segmented-control",
          when: "One value is picked from two to five, and no panel switches under the row.",
        },
        {
          slug: "fieldset",
          when: "Toggles that can be on together narrow a list: pressed `Button`s in a `Fieldset`, one per facet.",
        },
      ],
      pairs: [
        "Tabs/SwitchView",
        "Tabs/SwitchPage",
        "Tabs/Count",
        "TabsReason/DisabledReason",
        "TabsLinks/Rail",
      ],
      usage: {
        do: [
          "`Tabs` switches a view in place; the caller owns `value` and `onChange`, and the panel sits right under the row.",
          "Going to another page is link items (`href`, and `selected` on the current one): links, so the URL, the back button and a new tab all work.",
          "A `count` sits muted after the label and is read as part of the tab's name.",
          'Across, tabs are always underline, under a `PageHeader` too. `orientation="vertical"` is the pill rail, the current tab filled, for a `SidebarLayout` aside, and only the rail takes `size`.',
          "`size` (`sm`, `md` the default, `lg`) sets the vertical rail on the control scale, so it lines up with a `Button` of the same size; the underline row has one size.",
          "A tab that cannot be chosen yet takes a `disabledReason` that says why.",
          'Pill links with `orientation="vertical"` are the rail of a `SidebarLayout`: one link per line.',
        ],
      },
      accessibility: [
        "The row is a tab list named by `label`; the arrow keys, Home and End move between the tabs, and a `disabled` tab is skipped.",
        "A tab with `disabledReason` is `aria-disabled`: the arrow keys reach it and choose nothing, and the reason shows as a tooltip on hover, keyboard focus and a tap, read out as its description (the native `title` without CSS anchor positioning).",
        'Give the panel `role="tabpanel"` and a tab `controls` that points at its `id`.',
        'A tab is a `button` with `role="tab"` and `aria-selected`; only the current tab is in the tab order, and the arrow keys move and choose.',
        'Link items form a `<nav>` named by `label`; the current link gets `aria-current="page"`.',
      ],
      api: ["Tabs"],
      types: ["Tab"],
    },
    {
      slug: "breadcrumbs",
      name: "Breadcrumbs",
      summary: "Where this page sits in the hierarchy.",
      whenToUse:
        "A page several levels deep that needs a way back up: org, project, build, snapshot.",
      pairs: ["Breadcrumbs/Trail", "Breadcrumbs/Hierarchy"],
      usage: {
        do: [
          "Give the trail in order, parents first. A parent that links is `{ label, href }`, drawn through the app's `LinkProvider` for an in-app path; the last crumb is the current page, plain text.",
          "Breadcrumbs show a hierarchy. Peer sections are `Tabs` of links.",
          "Each crumb truncates, so a long name does not widen the row.",
          "Put the trail in the `breadcrumbs` slot of a `PageHeader`.",
        ],
      },
      accessibility: [
        '`<nav aria-label="Breadcrumb">` around an ordered list.',
        'The last item has `aria-current="page"` and is never a link.',
        "The `/` separators are `aria-hidden`.",
      ],
      api: ["Breadcrumbs"],
      types: ["Crumb"],
    },
    {
      slug: "pagination",
      name: "Pagination",
      summary: "Page links for a long list.",
      whenToUse:
        "A list split into pages that the reader moves through: a directory, search results, an archive.",
      pairs: ["Pagination/Links"],
      stories: ["PaginationStates"],
      usage: {
        do: [
          "Give `pageHref` the URL of a page; the page lives in the URL, so back, a new tab and a shared link work. Each link goes through the app's `LinkProvider`.",
          "`page` is the page shown, from 1, and `pageCount` how many there are; a stale page past the end draws the last one, and a single page draws nothing.",
          "One Pagination under the list; a long list may add one above it too, each with its own `label`.",
          'The count line ("21 to 40 of 312") is a `Caption` beside it, not part of it.',
          "`previousLabel`, `nextLabel` and `pageLabel` carry the words for another language.",
        ],
      },
      accessibility: [
        'A `<nav>` named by `label`. Every page is a link, and the current one has `aria-current="page"`.',
        "Previous on the first page and Next on the last are plain text, not links, so there is no dead stop in the tab order.",
        'The gaps (`…`) are `aria-hidden`. Below `sm` the numbers give way to `pageLabel` ("Page 4 of 12") between Previous and Next.',
      ],
      api: ["Pagination"],
    },
    {
      slug: "site-search",
      name: "SiteSearch",
      summary: "Find a page by name, from a header button or Ctrl+K.",
      whenToUse:
        "A site with more pages than a reader can scan in its nav: a docs site, an app with many sections.",
      pairs: ["SiteSearch/Header"],
      usage: {
        do: [
          "Put one `SiteSearch` in `AppShell`'s `controls`, on every page, and pass every page as `items`: `{ label, description, href, keywords }`.",
          '`label` names the button and titles the dialog: say what is searched ("Search components"). `resultsLabel` names the list of matches, "Results" by default, for an app in another language.',
          "Give `items` in the nav's order: results of the same rank keep it.",
          "`keywords` are other names a page answers to (the exports it documents); they match but are not shown.",
          "A result ranks by the name starting with the text, then the name containing it, then a keyword, then the description.",
          "From `sm` up the button reads Search with its key (Ctrl K, or ⌘ K on a Mac); below `sm` it is the search icon alone.",
          "It searches names, not page text, and needs no service.",
        ],
      },
      accessibility: [
        "Ctrl+K or Cmd+K opens it from anywhere on the page; the button carries `aria-keyshortcuts`.",
        "It opens a `Dialog` titled by `label` with focus in the search field; Esc closes it and focus goes back to where it was.",
        "Enter opens the first result. ArrowDown moves from the field to the results and ArrowUp and ArrowDown move between them; they are links, so Tab reaches them too.",
        'A polite live region reads the result count as you type ("3 results").',
      ],
      api: ["SiteSearch"],
      types: ["SiteSearchItem"],
    },
  ],
};
