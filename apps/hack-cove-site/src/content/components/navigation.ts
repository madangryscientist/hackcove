import type { ComponentSection } from "./types";

export const navigation: ComponentSection = {
  title: "Navigation",
  description: "Moving between pages and views.",
  pages: [
    {
      slug: "tabs",
      name: "Tabs",
      summary: "Switch a view in place, or move between pages.",
      whenToUse: "Tabs switch a panel on the same page. A row of links to other pages is NavTabs.",
      pairs: ["Tabs/SwitchView", "Tabs/SwitchPage", "Tabs/Count", "NavTabs/Rail"],
      usage: [
        "`Tabs` switches a view in place; the caller owns `value` and `onChange`, and the panel sits right under the row.",
        "Going to another page is `NavTabs`: links, so the URL, the back button and a new tab all work.",
        "A `count` sits muted after the label and is read as part of the tab's name.",
        '`variant="pill"` fills the current tab, for under a `PageHeader`.',
        "A disabled tab keeps a `title` as the reason.",
        '`NavTabs` with `orientation="vertical"` is the rail of a `SidebarLayout`: one link per line.',
      ],
      accessibility: [
        "The row is a tab list named by `label`; the arrow keys, Home and End move between the tabs, and a disabled tab is skipped.",
        'Give the panel `role="tabpanel"` and a tab `controls` that points at its `id`.',
        'A tab is a `button` with `role="tab"` and `aria-selected`; only the current tab is in the tab order, and the arrow keys move and choose.',
        '`NavTabs` is a `<nav>` named by `label`; the current link gets `aria-current="page"`.',
      ],
      api: ["Tabs", "NavTabs"],
      functions: [
        {
          name: "navTabClass",
          text: "The classes of one NavTabs pill (current or not, disabled drops the hover fill), for a router link that has to look like a tab.",
        },
      ],
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
        "Breadcrumbs show a hierarchy. Peer sections are `NavTabs`.",
        "Each crumb truncates, so a long name does not widen the row.",
        "Put the trail in the `breadcrumbs` slot of a `PageHeader`.",
      ],
      accessibility: [
        '`<nav aria-label="Breadcrumb">` around an ordered list.',
        'The last item has `aria-current="page"` and is never a link.',
        "The `/` separators are `aria-hidden`.",
      ],
      api: ["Breadcrumbs"],
      functions: [
        {
          name: "crumbLinkClass",
          text: "The classes of a crumb that links, for a router link drawn outside `render`.",
        },
      ],
    },
  ],
};
