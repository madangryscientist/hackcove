import type { ComponentPage } from "./types";

/** The Loading page: how every part waits for its data. Its own file, as the Feedback list is long. */
export const loadingPage: ComponentPage = {
  slug: "loading",
  name: "Loading",
  summary:
    "A part waiting for its data draws its own shape: what it knows as itself, the rest as bones.",
  whenToUse:
    "Data that is on its way: give the layout or the part `loading` and keep the tree it draws with data.",
  pairs: ["Loading/Wait"],
  stories: ["Loading"],
  usage: {
    do: [
      'Set `loading` on the page layout, or on the one part that waits, and render the same tree you render with data: `<StatTile loading={q.isPending} label="Revenue" value={q.data?.revenue} />`. There is no separate skeleton component to keep in step.',
      "One rule for every part: what it has is drawn, and an empty slot (`null`, `undefined`, `false`, an empty string or array) is a bone of that slot's shape. A caption you know stays; the figure you are fetching is a bone. A part whose value is a number (`Badge`, the bars and charts) is all bone while loading, since 0 is a value.",
      "A part with nothing in it draws a fixed set of bones of its children's shape: a `KeyValueList` three rows, a `MetaList` three items, a paragraph three lines and a heading one. There is no count to set.",
      "A part's own `loading` wins; left out, it takes the nearest loading layout's or part's, so one `loading` on a layout reaches everything inside. `loading={false}` opts a part out inside a loading page.",
      "Loading beats empty: while `loading`, an empty slot is a bone, never the `empty` state.",
      "Three words, three meanings: `loading` is data not here yet (a skeleton); `busy` is an action in flight on a control (`Button`, `Switch`, `ChatComposer`); `streaming` is content arriving piece by piece (`ChatMessage`). `NavigationProgress loading` is the bar for a page change, not a skeleton.",
      "Typography (`Text`, `Lead`, `Caption`, `Overline`, `Display`, `PageHeading`, `SectionHeading`, `SubsectionHeading`), `Markdown`, `StatTile`, `KeyValueList`, `KeyValue`, `Badge`, `Pill` and `MetaList` take `loading`.",
      "Actions and navigation (`Button`, `IconButton`, `Tabs`, `Breadcrumbs`, `TextLink`, `SiteSearch` and the rest) are known before the data, so they draw as themselves; an action that needs the data says why it waits with `disabledReason`. Bare controls (`Input`, `Select`, `Textarea`, `FileDrop`), frames and primitives (`AppShell`, `Container`, `Stack`, `Section`, `Cluster`, `Callout`, `EmptyState`), overlays, the status pages and authored code draw as themselves too: what they hold draws its own bones.",
    ],
    dont: [
      'Do not build a grey box by hand or write a "Loading..." `Text`: it drops the captions the reader could already see, and the page jumps when the data lands.',
      "Do not hold a skeleton on screen for a minimum time or behind a delay: the part draws what `loading` says, the moment it says it.",
    ],
  },
  accessibility: [
    'The part whose own `loading` is set is the owner: its root has `aria-busy="true"` and holds one visually hidden text, `loadingLabel` ("Loading" by default). Parts that inherit draw bones only, so one wait is one busy region and one announcement.',
    "Every bone is `aria-hidden`. A part keeps its role and accessible name while it loads: a heading is still its heading.",
    "Bones pulse only when the reader allows motion: under `prefers-reduced-motion: reduce` they are still.",
  ],
  api: [],
};
