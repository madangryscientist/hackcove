import type { ComponentPage } from "./types";

/** The Loading page: how every part waits for its data. Its own file, as the Feedback list is long. */
export const loadingPage: ComponentPage = {
  slug: "loading",
  name: "Loading",
  summary:
    "A part waiting for its data draws its own shape: what it knows as itself, the rest as bones.",
  whenToUse:
    "Data that is on its way: give the layout or the part `loading` and keep the tree it draws with data.",
  pairs: ["Loading/Wait", "Loading/Page"],
  stories: ["Loading"],
  usage: {
    do: [
      'Set `loading` on the page layout, or on the one part that waits, and render the same tree you render with data: `<StatTile loading={q.isPending} label="Revenue" value={q.data?.revenue} />`. There is no separate skeleton component to keep in step.',
      "One rule for every part: what it has is drawn, and an empty slot (`null`, `undefined`, `false`, an empty string or array) is a bone of that slot's shape. A caption you know stays; the figure you are fetching is a bone. A part whose value is a number (`Badge`, the bars and charts) is all bone while loading, since 0 is a value.",
      "A part with nothing in it draws a fixed set of bones of its children's shape: a `ListLayout` with no records a `Card` of three row bones, a `CardGrid` one `Card` of bones per column (three for `auto`), a `Table` whose `TableBody` has no rows five rows with one bone per column, a `Card` three lines of text and a `flush` `Card` three `ListRow` bones, a `Timeline` three items, a `KeyValueList` three rows, a `MetaList` three items, an `AvatarStack` three avatars, a `Legend` three entries, a paragraph three lines and a heading one. There is no count to set.",
      "A picture with no `src` while loading (`Image`, `MediaTile`) is a bone of its shape, not the placeholder, which means there is no picture. A `TrendChart` keeps its frame, bucket names and key, and its plot is a bone.",
      "A part's own `loading` wins; left out, it takes the nearest loading layout's or part's, so one `loading` on a layout reaches everything inside. `loading={false}` opts a part out inside a loading page.",
      "Loading beats empty: while `loading`, an empty slot is a bone, never the `empty` state.",
      "Three words, three meanings: `loading` is data not here yet (a skeleton); `busy` is an action in flight on a control (`Button`, `Switch`, `ChatComposer`); `streaming` is content arriving piece by piece (`ChatMessage`). `NavigationProgress loading` is the bar for a page change, not a skeleton.",
      "Take `loading`. Page layouts, each the owner of its page's wait, passing it to everything inside, the header too: `PageHeader`, `ListLayout`, `DetailLayout`, `FormLayout`, `ProseLayout`, `SidebarLayout` (its canvas; the rail is navigation), `FullBleedLayout`, `CenteredLayout` and `CardGrid`. Text: `Text`, `Lead`, `Caption`, `Overline`, `Display`, `PageHeading`, `SectionHeading`, `SubsectionHeading` and `Markdown`. Data and content: `StatTile`, `KeyValueList`, `KeyValue`, `Badge`, `Pill`, `MetaList`, `Card`, `Table` and `TableCell` (`TableHead`, `TableBody`, `TableRow`, `TableFoot`, `TableGroupRow` and `TableHeaderCell` wait with their table), `ListRow`, `Timeline`, `TimelineItem`, `Avatar`, `AvatarStack`, `Image`, `MediaTile`, `ProgressBar`, `SplitBar`, `StackedBar`, `Legend` and `TrendChart`. Forms: `Field` and `FormRowField` draw their label and a bone the height of their control (read from the density around them, so a `sm` card's is `sm`), and `Checkbox`, `Switch`, `RadioGroup` with `Radio`, and `DateField` draw their labels with the box, track, circles or field as bones.",
      "Draw as themselves, by design. Actions and navigation are known before the data: `Button`, `ButtonGroup`, `IconButton`, `CopyButton`, `CopyLine`, `ColourSchemeToggle`, `Menu`, `Tabs`, `SegmentedControl`, `Breadcrumbs`, `Pagination`, `TextLink`, `SiteSearch` and `TableExpandCell`; an action that needs the data says why it waits with `disabledReason`. Bare controls hold the caller's own state, and a fetched value waits in its `Field` or `FormRowField`: `Input`, `Select`, `Textarea`, `FileDrop`, `DateRangePicker`, `Fieldset`, `InlineEdit` and `TableEditCell`. Frames and primitives have no data of their own, and what they hold draws its own bones: `AppShell`, `AppShellBrand`, `Container`, `Stack`, `Section`, `Cluster`, `ClusterGrow`, `SideColumn`, `StickyBar`, `Show`, `ScrollStrip`, `FormGrid`, `FormRow`, `Divider`, `Icon`, `Kbd`, `Code`, `Prose`, `BulletList`, `BulletItem`, `Steps`, `Step`, `Hero`, `SiteFooter`, `Callout`, `EmptyState`, `Disclosure` and `LinkProvider`. Overlays open on an action and their contents draw bones: `Dialog`, `Drawer`, `BottomSheet`, `Lightbox`, `FieldDialog` and `ToastRegion`. Static copy and authored code: `ErrorPage`, `NotFound`, `Forbidden`, `Offline`, `Maintenance`, `CodeBlock` and `CodeExample`. In flight on their own terms: `ChatThread`, `ChatMessage` (`streaming`), `ChatComposer` (`busy`), `NavigationProgress`, `PageFade`, `Morph` and `Video` (the browser's poster). `RegionFrame` and `OutlineRegion` pass `loading` to their `<img>` as the native attribute. `SortableList`, `SortableItem` and `SortableSection` need their items to reorder; `ListRow` bones stand in. `DocsLayout` has no loading page yet.",
    ],
    dont: [
      'Do not build a grey box by hand or write a "Loading..." `Text`: it drops the captions the reader could already see, and the page jumps when the data lands.',
      "Do not hold a skeleton on screen for a minimum time or behind a delay: the part draws what `loading` says, the moment it says it.",
    ],
  },
  accessibility: [
    'The part whose own `loading` is set is the owner: its root has `aria-busy="true"` and holds one visually hidden text, `loadingLabel` ("Loading" by default). Parts that inherit draw bones only, so one wait is one busy region and one announcement.',
    "Every bone is `aria-hidden`. A part keeps its role and accessible name while it loads: a heading is still its heading, a `Table` still its table named by its caption.",
    "Bones pulse only when the reader allows motion: under `prefers-reduced-motion: reduce` they are still.",
  ],
  api: [],
};
