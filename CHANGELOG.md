## 0.1.9 (2026-10-28)

### 🚀 Features

- **ui:** Icon, logo size, Card badge, ListRow pointer, FullBleedLayout bar, strong warn border (HC-159) ([eccaa55](https://github.com/madangryscientist/hackcove/commit/eccaa55))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.2.10 (2026-10-28)

### 🚀 Features

- **ui:** Icon, logo size, Card badge, ListRow pointer, FullBleedLayout bar, strong warn border (HC-159) ([eccaa55](https://github.com/madangryscientist/hackcove/commit/eccaa55))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.5.1 (2026-10-28)

### 🚀 Features

- **ui:** Icon, logo size, Card badge, ListRow pointer, FullBleedLayout bar, strong warn border (HC-159) ([eccaa55](https://github.com/madangryscientist/hackcove/commit/eccaa55))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.5.0 (2026-10-27)

### 🚀 Features

- ⚠️  **ui:** one size scale, sm/md/lg with md the default (HC-160) ([#12](https://github.com/madangryscientist/hackcove/pull/12))

### ⚠️  Breaking Changes

- **ui:** one size scale, sm/md/lg with md the default (HC-160)  ([#12](https://github.com/madangryscientist/hackcove/pull/12))
  one size scale, sm/md/lg with md the default.
    TextLink size="xs"               -> size="sm"
    TextLink size="sm"               -> size="md"
    SubsectionHeading size="base"    -> size="md" (now the default)
    Stack/Section/PageLayout gap="section" -> gap="xl"
    SubsectionHeading default sm     -> md (pin size="sm" for the old look)
    Section gap default sm           -> md (pin gap="sm")
    Cluster gap default sm           -> xs (pin gap="sm")
    ProgressBar default sm           -> md (pin size="sm")
    SplitBar, StackedBar default lg  -> md (pin size="lg")
    Avatar md 28px                   -> 32px
    IconButton, ColourSchemeToggle 36px -> 38px (md)
    NavTabs, Tabs pill 32px          -> 38px (md)
  See packages/ui/MIGRATING.md.
  State: landable
  Gated by the planner on 80fce05: typecheck, lint, 261 tests, build, format, pack-check, e2e 42, PixelSlash visual 309 changed / 34 new / 2 removed (read: md defaults, nav tabs align with the header controls at 38px)."
  M	apps/hack-cove-site/README.md
  M	apps/hack-cove-site/src/components/ComponentPage.tsx
  M	apps/hack-cove-site/src/components/PageIntro.tsx
  M	apps/hack-cove-site/src/components/UiPage.tsx
  M	apps/hack-cove-site/src/content/components/actions.ts
  M	apps/hack-cove-site/src/content/components/content.ts
  M	apps/hack-cove-site/src/content/components/data.ts
  M	apps/hack-cove-site/src/content/components/forms.ts
  M	apps/hack-cove-site/src/content/components/layout.ts
  M	apps/hack-cove-site/src/content/components/navigation.ts
  M	apps/hack-cove-site/src/content/components/pagelayouts.ts
  M	apps/hack-cove-site/src/content/components/text.ts
  M	apps/hack-cove-site/src/pages/contracting.astro
  M	apps/hack-cove-site/src/pages/index.astro
  M	apps/hack-cove-site/src/pages/pixelslash.astro
  M	apps/hack-cove-site/src/pages/ui/index.astro
  M	apps/storybook/src/Button.stories.tsx
  M	apps/storybook/src/Card.stories.tsx
  M	apps/storybook/src/Checkbox.stories.tsx
  M	apps/storybook/src/Cluster.stories.tsx
  M	apps/storybook/src/ColourSchemeToggle.stories.tsx
  M	apps/storybook/src/DatePicker.stories.tsx
  M	apps/storybook/src/Dialog.stories.tsx
  M	apps/storybook/src/EmptyState.stories.tsx
  M	apps/storybook/src/FileDrop.stories.tsx
  M	apps/storybook/src/GalleryLayout.tsx
  M	apps/storybook/src/GalleryLinks.tsx
  M	apps/storybook/src/GalleryText.tsx
  M	apps/storybook/src/IconButton.stories.tsx
  M	apps/storybook/src/Input.stories.tsx
  M	apps/storybook/src/ListRow.stories.tsx
  M	apps/storybook/src/NavTabs.stories.tsx
  M	apps/storybook/src/ProgressBar.stories.tsx
  M	apps/storybook/src/RadioGroup.stories.tsx
  M	apps/storybook/src/SegmentedControl.stories.tsx
  M	apps/storybook/src/Select.stories.tsx
  M	apps/storybook/src/SplitBar.stories.tsx
  M	apps/storybook/src/StackedBar.stories.tsx
  M	apps/storybook/src/Tabs.stories.tsx
  M	apps/storybook/src/TextLink.stories.tsx
  M	apps/storybook/src/Textarea.stories.tsx
  M	apps/storybook/src/ToggleChip.stories.tsx
  M	apps/storybook/src/layout/CardGrid.stories.tsx
  M	apps/storybook/src/layout/Stack.stories.tsx
  M	apps/storybook/src/typography.stories.tsx
  A	packages/ui/MIGRATING.md
  M	packages/ui/README.md
  M	packages/ui/src/Avatar.test.tsx
  M	packages/ui/src/Avatar.tsx
  M	packages/ui/src/Button.tsx
  M	packages/ui/src/Card.tsx
  M	packages/ui/src/Checkbox.tsx
  M	packages/ui/src/Cluster.test.tsx
  M	packages/ui/src/Cluster.tsx
  M	packages/ui/src/ColourSchemeToggle.tsx
  M	packages/ui/src/DateField.tsx
  M	packages/ui/src/DatePicker.tsx
  M	packages/ui/src/Dialog.tsx
  M	packages/ui/src/FileDrop.tsx
  M	packages/ui/src/IconButton.tsx
  M	packages/ui/src/InputShell.tsx
  M	packages/ui/src/ListRow.tsx
  M	packages/ui/src/NavTabs.test.tsx
  M	packages/ui/src/NavTabs.tsx
  M	packages/ui/src/PageHeader.test.tsx
  M	packages/ui/src/PageLayouts.tsx
  M	packages/ui/src/ProgressBar.test.tsx
  M	packages/ui/src/ProgressBar.tsx
  M	packages/ui/src/RadioGroup.tsx
  M	packages/ui/src/SearchInput.tsx
  M	packages/ui/src/SegmentedControl.tsx
  M	packages/ui/src/SplitBar.test.tsx
  M	packages/ui/src/SplitBar.tsx
  M	packages/ui/src/Stack.test.tsx
  M	packages/ui/src/Stack.tsx
  M	packages/ui/src/StackedBar.test.tsx
  M	packages/ui/src/StackedBar.tsx
  M	packages/ui/src/Tabs.tsx
  M	packages/ui/src/TextLink.test.tsx
  M	packages/ui/src/TextLink.tsx
  M	packages/ui/src/ToggleChip.tsx
  M	packages/ui/src/control.ts
  M	packages/ui/src/index.ts
  M	packages/ui/src/linkForms.test.tsx
  A	packages/ui/src/size.test.tsx
  A	packages/ui/src/size.ts
  M	packages/ui/src/typography.test.tsx
  M	packages/ui/src/typography.tsx

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.1.8 (2026-10-27)

This was a version bump only for theme-thrifty-paper to align it with other projects, there were no code changes.

## 0.2.9 (2026-10-27)

### 🩹 Fixes

- **HC-148:** a disabled solid Button reads flat, not washed out ([61d4d91](https://github.com/madangryscientist/hackcove/commit/61d4d91))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.4.5 (2026-10-27)

### 🚀 Features

- **ui:** links and buttons inside a linked row or card (HC-152) ([95db8ed](https://github.com/madangryscientist/hackcove/commit/95db8ed))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.1.7 (2026-10-27)

### 🚀 Features

- **ui:** small prop gaps from the pixelslash adoption (HC-151) ([f10eb6f](https://github.com/madangryscientist/hackcove/commit/f10eb6f))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.2.8 (2026-10-27)

### 🚀 Features

- **ui:** small prop gaps from the pixelslash adoption (HC-151) ([f10eb6f](https://github.com/madangryscientist/hackcove/commit/f10eb6f))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.4.4 (2026-10-27)

### 🚀 Features

- **ui:** small prop gaps from the pixelslash adoption (HC-151) ([f10eb6f](https://github.com/madangryscientist/hackcove/commit/f10eb6f))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.4.3 (2026-10-27)

### 🚀 Features

- **ui:** RadioGroup and Disclosure parts (HC-150) ([d9df25d](https://github.com/madangryscientist/hackcove/commit/d9df25d))
- **HC-149:** colour code samples, full-page layout examples, docs pages wrap less ([05ec236](https://github.com/madangryscientist/hackcove/commit/05ec236))

### ❤️ Thank You

- Jacobus @madangryscientist

## 0.4.2 (2026-10-26)

### 🚀 Features

- **HC-147:** CopyLine can be disabled ([3d58765](https://github.com/madangryscientist/hackcove/commit/3d58765))
- **HC-145:** a docs page for every exported component ([71a5c55](https://github.com/madangryscientist/hackcove/commit/71a5c55))

### 🩹 Fixes

- **HC-146:** a ButtonGroup in a Card footer spans it, so end reaches the far edge ([e2e20fd](https://github.com/madangryscientist/hackcove/commit/e2e20fd))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.1.6 (2026-10-26)

### 🚀 Features

- **HC-143:** Themes set the page canvas and the font ([2d033a9](https://github.com/madangryscientist/hackcove/commit/2d033a9))
- **HC-136:** Button tone="positive" and pressed; IconButton ghost and danger; TextLink tone ([ab3c0ae](https://github.com/madangryscientist/hackcove/commit/ab3c0ae))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.4.1 (2026-10-26)

### 🚀 Features

- **HC-143:** Themes set the page canvas and the font ([2d033a9](https://github.com/madangryscientist/hackcove/commit/2d033a9))
- **HC-142:** EmptyState and numbered Steps ([b93d0d8](https://github.com/madangryscientist/hackcove/commit/b93d0d8))
- **HC-141:** ListRow selected, a static row with leading, trailing and actions, revealOnHover ([d14c9cd](https://github.com/madangryscientist/hackcove/commit/d14c9cd))
- **HC-140:** StackedBar with Legend, and a TableRow status stripe ([ff39c38](https://github.com/madangryscientist/hackcove/commit/ff39c38))
- **HC-139:** MetaList, a muted row of facts joined by ·, with a mono option ([5a32824](https://github.com/madangryscientist/hackcove/commit/5a32824))
- **OB-131:** CardGrid columns="auto" and align="start"; Card footer slot ([355e580](https://github.com/madangryscientist/hackcove/commit/355e580))
- **HC-137:** href on Card, IconButton and Pill ([0f9d376](https://github.com/madangryscientist/hackcove/commit/0f9d376))
- **HC-136:** Button tone="positive" and pressed; IconButton ghost and danger; TextLink tone ([ab3c0ae](https://github.com/madangryscientist/hackcove/commit/ab3c0ae))
- **HC-134:** Stack as="form" | "ul" | "ol" ([0939ae9](https://github.com/madangryscientist/hackcove/commit/0939ae9))
- **HC-133:** FormRow, an inline-edit row with proportional widths and a trailing action; FormGrid and Field span="full" ([c81bf4c](https://github.com/madangryscientist/hackcove/commit/c81bf4c))
- **HC-132:** Cluster, a horizontal row layout part with a ClusterGrow child ([6223466](https://github.com/madangryscientist/hackcove/commit/6223466))
- **HC-131:** width="fill" on Input, Select and Textarea; align="end" on Input ([3b16fbf](https://github.com/madangryscientist/hackcove/commit/3b16fbf))
- **HC-130:** tone, numeric, mono and truncate on the inline text roles; size and mono on TextLink ([abe6000](https://github.com/madangryscientist/hackcove/commit/abe6000))

### 🩹 Fixes

- **HC-135:** every component passes data-* and aria-* through; TableHeaderCell srLabel ([6944dcc](https://github.com/madangryscientist/hackcove/commit/6944dcc))
- **HC-129:** declare @types/react and @types/react-dom as optional peers of ui ([c870e81](https://github.com/madangryscientist/hackcove/commit/c870e81))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.4.0 (2026-10-25)

### 🚀 Features

- ⚠️  **HC-128:** remove every className and style escape hatch from @hackcove/ui ([7389a45](https://github.com/madangryscientist/hackcove/commit/7389a45))

### ⚠️  Breaking Changes

- **HC-128:** remove every className and style escape hatch from @hackcove/ui  ([7389a45](https://github.com/madangryscientist/hackcove/commit/7389a45))
  `className` and `style` are removed from every component exported from
  `@hackcove/ui`, and from the HTML props each one spreads. Replacements for consumers (pixelslash,
  omnibus, advisor-quotes): `<Badge className="absolute …">` → `<Badge corner />`; the `border-t`
  classes on a `ListRow` → `<ListRow divided>`; `Input`/`Select`/`Textarea` width classes → the
  `width` prop (`xs`, `sm`, `md`, `lg`, `auto`); `Checkbox`, `FileDrop`, `InlineLinks`, `FilterGroup`,
  `Divider`, `BulletList`, `Code`, `TextLink`, `Table`, `ColourSchemeToggle`, `ProseLayout`
  layout or spacing classes → wrap the component in your own element, or drop the look. Pass the
  `*Class` helpers' strings to your own element if you render it yourself.
  Gated on land: bun install; nx run-many typecheck lint test build; format:check; pack-check; nx e2e storybook; storybook:visual 10 changed, 497 unchanged, 0 new, 0 removed vs origin/main.
  State: landable
  Approved by Jacobus 2026-10-23 (visual: 10 changed vs main, read: plain BulletList now its own default (larger, darker; story's text-sm slate-600 className gone), Badge corner identical, Input w-24 example dropped, Overview/Gallery reflow, video spinner noise. Gate 3/3 green at 7732248.).

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.1.5 (2026-10-25)

This was a version bump only for theme-thrifty-paper to align it with other projects, there were no code changes.

## 0.3.0 (2026-10-25)

### 🚀 Features

- **HC-118:** Table totals, group rows, cell tones and truncation ([5da6461](https://github.com/madangryscientist/hackcove/commit/5da6461))
- **HC-119:** Input prefix, Card tones, small sizes, Callout link and a collapsing AppShell brand ([7dd1cf7](https://github.com/madangryscientist/hackcove/commit/7dd1cf7))
- **HC-114:** error and status pages: not found, error, offline, forbidden, maintenance ([44e8a8a](https://github.com/madangryscientist/hackcove/commit/44e8a8a))
- **HC-117:** TableRow tone, dashed Button, item data-* and a toggle first frame ([f16997e](https://github.com/madangryscientist/hackcove/commit/f16997e))
- ⚠️  **HC-122:** record SidebarLayout's bare, stacking rail as breaking ([fc692ad](https://github.com/madangryscientist/hackcove/commit/fc692ad))
- **HC-116:** date picker stories inside Dialog and Drawer; keep the calendar unclipped in a Dialog ([03e0152](https://github.com/madangryscientist/hackcove/commit/03e0152))
- **HC-121:** add CodeBlock, Card status and Stack gap="section" ([1a11e15](https://github.com/madangryscientist/hackcove/commit/1a11e15))

### 🩹 Fixes

- **HC-123:** make the default search input work: value, clear and icon ([5c614b1](https://github.com/madangryscientist/hackcove/commit/5c614b1))
- **HC-125:** Table row hover and dividers use utilities every theme remaps ([c1e53fd](https://github.com/madangryscientist/hackcove/commit/c1e53fd))
- **HC-92:** keep the Checkbox box its size when a centred label wraps ([2bf9bfb](https://github.com/madangryscientist/hackcove/commit/2bf9bfb))

### ⚠️  Breaking Changes

- **HC-122:** record SidebarLayout's bare, stacking rail as breaking  ([fc692ad](https://github.com/madangryscientist/hackcove/commit/fc692ad))
  SidebarLayout's rail is bare (no fill, no border, no fixed height) and stacks
  under md; its canvas shrinks so a wide table scrolls inside it.
  Gated on land: bun install; nx run-many typecheck lint test build; format:check; pack-check; nx e2e storybook; storybook:visual 4 changed (video and overview noise), 684 unchanged vs origin/main.
  State: landable

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.2.7 (2026-10-25)

### 🚀 Features

- **HC-91:** ColourSchemeToggle rest props and store opt-out, Checkbox align start, LinkRenderProps spreads onto a router Link ([4945bba](https://github.com/madangryscientist/hackcove/commit/4945bba))
- **HC-90:** Tabs pill variant, counts, and disabled items and groups for Tabs and SegmentedControl ([b7fa4dc](https://github.com/madangryscientist/hackcove/commit/b7fa4dc))
- **HC-89:** Table rest props, plain variant and secondary cell; Card rest props and dashed="filled" ([dccbe5e](https://github.com/madangryscientist/hackcove/commit/dccbe5e))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.2.6 (2026-10-25)

### 🚀 Features

- **HC-88:** AppShellBrand, appShellRootClassFor and controls that do not shrink ([4e9e0d2](https://github.com/madangryscientist/hackcove/commit/4e9e0d2))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.1.4 (2026-10-25)

### 🚀 Features

- **HC-68:** size and width on Input, Select, Textarea; Checkbox sm and bare; FileDrop; date external error; toggle schemes and initial ([aa70e99](https://github.com/madangryscientist/hackcove/commit/aa70e99))
- **ob 1861:** Pill violet and sky tones and a round shape; Badge, a small red count ([51f5058](https://github.com/madangryscientist/hackcove/commit/51f5058))
- **ob 1856:** Button sm, danger and link look; ButtonGroup and ButtonLink; router-link render seam on NavTabs, Breadcrumbs, TextLink; TextLink stretch (1820, 1817) ([3463fe5](https://github.com/madangryscientist/hackcove/commit/3463fe5))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.2.5 (2026-10-25)

### 🚀 Features

- **HC-74:** PageFade content fade between pages; KeyValueList values at the start ([09f9f26](https://github.com/madangryscientist/hackcove/commit/09f9f26))
- **HC-46:** Table family with a stretched row link; Timeline for a status history ([61c513c](https://github.com/madangryscientist/hackcove/commit/61c513c))
- **HC-65:** Tabs and SegmentedControl for in-page switching; Drawer slide-over ([31a1489](https://github.com/madangryscientist/hackcove/commit/31a1489))
- **HC-68:** size and width on Input, Select, Textarea; Checkbox sm and bare; FileDrop; date external error; toggle schemes and initial ([aa70e99](https://github.com/madangryscientist/hackcove/commit/aa70e99))
- **HC-69:** Card flush, bar and dashed forms; Callout actions and banner; ListRow ([db07ec6](https://github.com/madangryscientist/hackcove/commit/db07ec6))
- **ob 1853:** StatTile for a headline figure; ProgressBar and SplitBar ([04bf933](https://github.com/madangryscientist/hackcove/commit/04bf933))
- **ob 1861:** Pill violet and sky tones and a round shape; Badge, a small red count ([51f5058](https://github.com/madangryscientist/hackcove/commit/51f5058))
- **ob 1856:** Button sm, danger and link look; ButtonGroup and ButtonLink; router-link render seam on NavTabs, Breadcrumbs, TextLink; TextLink stretch (1820, 1817) ([3463fe5](https://github.com/madangryscientist/hackcove/commit/3463fe5))

### 🩹 Fixes

- **HC-74:** PageFade takes a name so two can share a page; a skipped transition is handled ([b1a1b9a](https://github.com/madangryscientist/hackcove/commit/b1a1b9a))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.1.3 (2026-10-24)

### 🚀 Features

- **ob 1818:** TextLink / linkClass and InlineLinks; the site adopts both ([46aefa9](https://github.com/madangryscientist/hackcove/commit/46aefa9))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.2.4 (2026-10-24)

### 🚀 Features

- **ob 1838:** ProseLayout, Stack width and xs gap; the site adopts them ([9f80d1c](https://github.com/madangryscientist/hackcove/commit/9f80d1c))
- **ob 1824:** AppShell brand/nav/controls slots and hideChromeInPrint; the site adopts both ([1b9dc42](https://github.com/madangryscientist/hackcove/commit/1b9dc42))
- **ob 1896:** Divider, ruled SectionHeading, Video, BulletList, Code, Body preserveNewlines, SubsectionHeading sizes; the site adopts them ([b92ae30](https://github.com/madangryscientist/hackcove/commit/b92ae30))
- **ob 1818:** TextLink / linkClass and InlineLinks; the site adopts both ([46aefa9](https://github.com/madangryscientist/hackcove/commit/46aefa9))
- **ob 1894:** Avatar takes a photo (src) and xl/2xl sizes; the site uses it ([ff31587](https://github.com/madangryscientist/hackcove/commit/ff31587))
- **ob 1845:** AppShell rows fade the side that still scrolls ([4c92fcd](https://github.com/madangryscientist/hackcove/commit/4c92fcd))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.1.2 (2026-10-23)

### 🩹 Fixes

- **ob 1800:** thrifty-paper: meet WCAG contrast on the 0.2.3 date controls ([890ae03](https://github.com/madangryscientist/hackcove/commit/890ae03))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.1.1 (2026-10-23)

### 🚀 Features

- **ob 1778:** DatePicker and DateField on react-aria-components ([7e3f25e](https://github.com/madangryscientist/hackcove/commit/7e3f25e))
- **ob 1765:** Avatar, initialsOf and avatarColourClass in @hackcove/ui ([c8ec5ec](https://github.com/madangryscientist/hackcove/commit/c8ec5ec))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.2.3 (2026-10-23)

### 🚀 Features

- **ob 1780:** Page layouts: List, Detail, Form, CardGrid, Sidebar, FullBleed, Centered ([76dae79](https://github.com/madangryscientist/hackcove/commit/76dae79))
- **ob 1778:** DatePicker and DateField on react-aria-components ([7e3f25e](https://github.com/madangryscientist/hackcove/commit/7e3f25e))
- **ob 1779:** Layout foundation: AppShell, Container, PageHeader, Stack + no-jump e2e ([7d08661](https://github.com/madangryscientist/hackcove/commit/7d08661))
- **ob 1777:** ColourSchemeToggle and a pre-paint colourSchemeScript in @hackcove/ui ([dd8294b](https://github.com/madangryscientist/hackcove/commit/dd8294b))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.2.2 (2026-10-22)

### 🚀 Features

- **ob 1765:** Avatar, initialsOf and avatarColourClass in @hackcove/ui ([c8ec5ec](https://github.com/madangryscientist/hackcove/commit/c8ec5ec))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.1.0 (2026-10-22)

### 🚀 Features

- **ob 1748:** Dialog and FieldDialog on the native <dialog> in @hackcove/ui ([7cfd80f](https://github.com/madangryscientist/hackcove/commit/7cfd80f))
- **ob 1603:** the @hackcove/ui palette, enforced from both sides ([3463adf](https://github.com/madangryscientist/hackcove/commit/3463adf))
- **ob 1591:** thrifty-paper light theme; each theme scopes under its own class ([4f63523](https://github.com/madangryscientist/hackcove/commit/4f63523))

### ❤️ Thank You

- Jacobus Langner @madangryscientist

## 0.2.1 (2026-10-22)

### 🚀 Features

- **ob 1748:** Dialog and FieldDialog on the native <dialog> in @hackcove/ui ([7cfd80f](https://github.com/madangryscientist/hackcove/commit/7cfd80f))
- **ob 1747:** Button blocked and busy states (disabledReason, busy, busyLabel) ([56c7d18](https://github.com/madangryscientist/hackcove/commit/56c7d18))
- **ob 1749:** CopyButton and CopyLine in @hackcove/ui ([5107826](https://github.com/madangryscientist/hackcove/commit/5107826))
- **ob 1751:** KeyValueList, KeyValue and Kbd in @hackcove/ui ([9238d2a](https://github.com/madangryscientist/hackcove/commit/9238d2a))
- **ob 1750:** Breadcrumbs and crumbLinkClass in @hackcove/ui ([cca8fa2](https://github.com/madangryscientist/hackcove/commit/cca8fa2))

### 🩹 Fixes

- **ob 1764:** dim plain-text parent breadcrumbs ([0aa9c07](https://github.com/madangryscientist/hackcove/commit/0aa9c07))

### ❤️ Thank You

- Jacobus Langner @madangryscientist