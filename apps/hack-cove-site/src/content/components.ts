/* ---------------------------------------------------------------------------
   The component docs, as data: the words on /ui/<slug>/ and in /ui/llms.txt.
   ---------------------------------------------------------------------------
   Both read this file, so they cannot drift. The code and the Do/Don't examples are never
   written here: `pairs` name stories in apps/storybook/src, and the props are
   read from packages/ui. A page says one right way and what not to do; it has no recipe for
   extending a component and no styling escape hatch.
   --------------------------------------------------------------------------- */

export type ComponentPage = {
  /** The page's path segment: /ui/<slug>/. */
  slug: string;
  name: string;
  /** Under the page title. */
  summary: string;
  /** One sentence for llms.txt and the page: when this component is the right one. */
  whenToUse: string;
  /** Do/Don't pairs, `<File>/<Topic>`: the stories `Do<Topic>` and `Dont<Topic>`. The first is the one right way. */
  pairs: string[];
  usage: string[];
  accessibility: string[];
  /** The components whose props the API table lists. */
  api: string[];
};

export const componentPages: ComponentPage[] = [
  {
    slug: "button",
    name: "Button",
    summary: "The action a person takes on a view.",
    whenToUse: "An action that changes something in place: save, cancel, delete, retry.",
    pairs: ["Button/OnePrimary", "Button/DisabledReason", "Button/Navigate"],
    usage: [
      'Put one primary Button in a view. The other actions use `variant="outline"`, `"ghost"` or `"link"`; `variant="dashed"` is the full-width "add another" row at the foot of a list.',
      "Group the actions in a `ButtonGroup`, so the row spaces and wraps the same everywhere.",
      "Say why a button cannot be pressed with `disabledReason`; use `busy` while the work is in flight.",
      "Going to another page is a `ButtonLink`, not a Button.",
      'A destructive action is `tone="danger"`; `size="sm"` is for a button inside a row or a card header.',
    ],
    accessibility: [
      'A Button is a native `<button>` and defaults to `type="button"`, so it never submits a form by accident.',
      "`disabledReason` disables the button and sets the reason as its `title`, so a pointer user sees why.",
      "`busy` sets `aria-busy` and disables the button until the work is done.",
      "Every Button has a focus ring from the component, so the keyboard focus is always visible.",
    ],
    api: ["Button", "ButtonLink", "ButtonGroup"],
  },
  {
    slug: "card",
    name: "Card",
    summary: "A bordered panel that groups one thing on a page.",
    whenToUse: "A titled block of related content: a record, a status, a list, an empty state.",
    pairs: ["Card/Status", "Card/Spacing"],
    usage: [
      "Name the Card with `title`; add a `count` or a `status` and they sit beside the title.",
      "`actions` sit at the far end of the header; use `bar` to put the header in a tinted strip.",
      "Space several Cards with a `Stack` or a `CardGrid`; never stack them with nothing between.",
      "`flush` is for a table that runs edge to edge, and it needs a `bar` for its title.",
      "`footer` is a strip across the bottom for the card's own actions or a total; it stays at the foot of a stretched card in a `CardGrid`.",
      '`CardGrid` takes `columns` 2, 3 or 4, or `columns="auto"` with `minWidth` `sm` or `md` to fill by width; `align="start"` stops cards stretching to the tallest in their row.',
      "`dashed` is the empty state.",
    ],
    accessibility: [
      "A Card is a `<section>` by default and its `title` names it; `as` picks another element, e.g. `article`.",
      "`id`, `data-*` and `aria-*` go on the root element.",
    ],
    api: ["Card", "CardGrid"],
  },
  {
    slug: "tabs",
    name: "Tabs",
    summary: "Switch a view in place, or move between pages.",
    whenToUse: "Tabs switch a panel on the same page. A row of links to other pages is NavTabs.",
    pairs: ["Tabs/SwitchView", "Tabs/SwitchPage", "Tabs/Count"],
    usage: [
      "`Tabs` switches a view in place; the caller owns `value` and `onChange`, and the panel sits right under the row.",
      "Going to another page is `NavTabs`: links, so the URL, the back button and a new tab all work.",
      "A `count` sits muted after the label and is read as part of the tab's name.",
      '`variant="pill"` fills the current tab, for under a `PageHeader`.',
      "A disabled tab keeps a `title` as the reason.",
    ],
    accessibility: [
      "The row is a tab list named by `label`; the arrow keys, Home and End move between the tabs, and a disabled tab is skipped.",
      'Give the panel `role="tabpanel"` and a tab `controls` that points at its `id`.',
      "In `NavTabs` the current link gets `aria-current`.",
    ],
    api: ["Tabs", "NavTabs"],
  },
];

export function componentPageOf(slug: string): ComponentPage {
  const page = componentPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`No component page "${slug}" in componentPages`);
  return page;
}
