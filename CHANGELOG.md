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