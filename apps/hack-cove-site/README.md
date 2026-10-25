# hack-cove-site

The hack-cove.com site (Astro, static). It ships no JS except one inline script on the `/ui/` docs
pages: the theme picker (the one exception, below). It is the demo project for Hack Cove: **a
composition of `@hackcove/ui` components under `@hackcove/theme-catppuccin-mocha`, and nothing
special of its own.** Any custom style or component here is a flag, not a fix: it gets a call below,
and a gap in the library is a ticket for Hack Cove UI to add if needed, not a commitment.

Audit: ob 1848, 2026-10-23, extended for the three sections in HC-93 and the `/ui/` component docs in HC-94 (below). Line numbers are the commit that landed it. Every custom style, class
string and component in `src/` is listed, each with one of three calls:

- **(a)** already in `@hackcove/ui`: swapped in (the "Swapped" section).
- **(b)** should become a ui component or token: its own hackcove ticket, linked, or an open ask that
  already covers it (with a note there that the site needs it too).
- **(c)** genuinely content-specific: it stays, and the "Custom, by design" section says why.

## Swapped (a)

| Was | Now |
| --- | --- |
| `global.css`: `* { box-sizing }`, `body { margin }`, `html { -webkit-text-size-adjust }` | Removed: Tailwind's preflight sets all three. The built pages are byte-identical in screenshots. (`body { min-height }` is not preflight's: `AppShell`'s `min-h-dvh` covers it.) |
| `global.css`: `body { font-family: ui-sans-serif, system-ui, … }` | Removed: it repeats Tailwind's default sans stack. |
| `Team.tsx`: a hand-written monogram `<span>` (slate circle, one initial) and the `initials()` helper in `content/site.ts` | `Avatar` from `@hackcove/ui` (coloured circle, two letters), `size="xl"` (56px) for the whole grid so a photo and a monogram never mix sizes. The look changes: coloured by name, two letters. |
| `Team.tsx` / `Cv.tsx`: a hand-written round photo `<img className="h-14/h-24 w-… shrink-0 rounded-full object-cover">` | `Avatar` with `src`: `xl` (56px) for the team, `2xl` (96px) for the CV portrait. |
| `Hero.tsx`, `Projects.tsx`, `Contact.tsx`, `LegalPage.tsx`, `Cv.tsx`: `className="link"` on a bare `<a>` (Mocha's inline link look lived only in the theme CSS) | `TextLink` from `@hackcove/ui` (ticket 1818): the same mauve, weight 500 and lavender hover, from stock utilities. The theme's `.link` stays as an alias |
| `Contact.tsx`, `LegalPage.tsx`, `Cv.tsx`, `Projects.tsx`: a wrapping `flex flex-wrap gap-x-3 text-sm` row of links with a hand-placed `Caption` dot or bullet | `InlineLinks` (ticket 1895): `separator` `·`, `•` or `none`, `aria-hidden`, held to its link so a wrap never strands one. The project links row goes from `gap-x-4` to `gap-x-3` |
| `Cv.tsx`, `LegalPage.tsx`: a hairline rule under a section heading (`mb-4 border-b border-slate-200/70 pb-2`) or above the footer (`border-t border-slate-200/70`) | `SectionHeading rule` and `Divider` (ticket 1896): the same colour and spacing. The footer's `mt-16` and `pt-8` stay, flagged below with the other spacing |
| `Cv.tsx`, `Projects.tsx`: `<ul className="… list-disc space-y-1 pl-5">` around each CV bullet and each project's details | `BulletList` (ticket 1826). The `mt-2`/`mt-3` above it stays, flagged below |
| `SiteShell.tsx`: the brand link's `site-header text-base font-bold tracking-tight text-slate-900` | `AppShell` `brand` slot (ticket 1824), which owns the brand type. The `site-header` marker class is gone |
| `cv-print.css`: `header:has(.site-header)` hidden and `main > div:has(> .cv)` unpadded on paper | `AppShell` `hideChromeInPrint` (ticket 1897), set on the CV page only. The CV prints to the same three A4 pages, pixel-identical; the other pages now print their header, since the old rule hid it everywhere |
| `Team.tsx` / `Projects.tsx` (was `CaseStudies.tsx`): `<SectionHeading className="mb-4">` + a sibling block | `Section title="…"` (heading plus `gap-4`): pixel-identical. |
| `Projects.tsx`, `Team.tsx`, `Contact.tsx`, `LegalPage.tsx`, `Cv.tsx`: a hand-set `max-w-3xl` on each block | `Section width="narrow"`, `Stack width="narrow"` and `ProseLayout` (tickets 1825, 1838): the same `max-w-3xl`, left-aligned. `LegalPage` and `Cv` are `ProseLayout` (header inside the column, as before); the CV keeps its `cv` print class on it. All eight captures (home, CV, privacy, terms at 375 and 1280) and the CV print are pixel-identical |
| `Hero.tsx` | `max-w-3xl` on the `<header>` | `Stack width="narrow"` around an unchanged `<header>`: the Overline is an inline span, and as a flex item it would lose its line box and move the hero up 8px |
| `Contact.tsx`, `LegalPage.tsx`: `mt-2` between a heading and its line, and between the legal name and its links; `mt-8` between those groups | `Stack gap="xs"` and `gap="lg"` (ticket 1899): pixel-identical. The legal footer's `mt-16` above the `Divider` is now the Stack's `lg` plus `mt-8` |
| `StatusCard.tsx`: a hand-written `flex flex-wrap items-center gap-x-3 gap-y-1` row with a status `Pill` beside the title, and `mt-2`/`mt-3`/`mt-4` between summary, list and links (HC-94) | `Card title status={<Pill/>}` (HC-121) around a `Stack gap="sm"` body |
| `UiPage.tsx`: `pb-12 sm:pb-16` and `pb-16 sm:pb-24` between blocks of the page (HC-94) | `Stack gap="section"` (HC-121) around the page's top-level blocks |
| `UiPage.tsx`: one `Code` per line, each in a `Body` paragraph, for the install steps (HC-94) | `CodeBlock lines` (HC-121): wrapping and static |

## Flagged (b)

| file:line | What it does | Call |
| --- | --- | --- |
| `Projects.tsx`, `Team.tsx`, `Cv.tsx`, `Hero.tsx` | `mt-0.5 … mt-8` on `Body`/`Caption`/`Subtitle`/`Display`/`Lead` where the step is not uniform in its block: a team member's name, role and bio (2px then 8px), a project card's name row, summary, list and links (8, 12, 16px), the hero (16, 24, 32px), a CV job (8, 12px). `xs` is 8px and one gap fits a whole Stack, so none of these fit; a 2px and a 4px step (`mt-0.5`, `mt-1`) would need a `2xs` | (b) **1899** (the `xs` gap landed; a `2xs` waits for a consumer that needs a whole Stack at 2–4px) |
| `DocsFrame.tsx` | The component list in `SidebarLayout`'s rail is a `NavTabs` row: a wrapping, horizontal pill row, not a vertical list. | (b) **ask for hackcove:** a vertical nav for `SidebarLayout` rails. |
| `src/docs/Example.tsx` | A live `Example` is static HTML (server-rendered, no hydration), so the site stays JS-free: an interactive story (the `Tabs` ones) shows its first state and does not respond. The `CodeBlock` under it has no copy button, so `Example` has none either. | (b) **ask for hackcove:** a `CodeBlock` with a copy control, if docs want one; a live preview needs client JS, so it stays out unless a component ask says otherwise. |
| `Hero.tsx`, `SectionCards.tsx`, `Projects.tsx`, `CvLink.tsx`, `PixelSlashPage.tsx`, `Team.tsx` | `pb-8`, `pb-12 sm:pb-16` and `pb-16 sm:pb-24` between the blocks of the home, Contracting and PixelSlash pages. `Stack gap="section"` is `gap-12 sm:gap-16`, a smaller and different rhythm than these (64/96px between Explore and Projects), so swapping them would move the live pages. | (b) **left as is** until a page-rhythm ticket picks the spacing with before/after captures at 375 and 1280. |
| `ComponentPage.tsx` `PageHeader` | `PageHeader`'s fixed `mb-8` adds to the `Stack gap="section"` the page uses for its rhythm, so the header sits a little further from the first section than the sections from each other. | (b) **ask for hackcove:** a `PageHeader` that takes no margin of its own inside a `Stack` (`PageHeaderContent` is not exported; `PageTitle` is deprecated). |

## Custom, by design (c)

| file:line | What it is | Why it stays |
| --- | --- | --- |
| `content/site.ts`, `content/cv.ts`, `content/legal.ts` | The copy, the team, the CV data, the privacy and terms text | Content, not style: every word is Jacobus's. |
| `Hero.tsx` (the component) | A landing hero: `Overline` and `Display` (HC-93 moved the intro and email to Contracting) | One consumer, composed from ui typography. A ui `Hero` waits for a second page that wants one. |
| `Team.tsx` (the component; `:21` `flex items-start gap-4`, `:23` `min-w-0`, `:42` `grid gap-8 sm:grid-cols-2`) | A person row (photo or monogram beside name, role, bio) in a two-up grid inside one `Card` | One consumer. `CardGrid` is tiles at `gap-4` in three column steps; this is people inside a single card. |
| `Projects.tsx`, `StatusCard.tsx` (the components; the `STATUS` map) | The projects section: one `StatusCard` per `site.projects` entry (a `Card` with `Pill` status: Available and In use = emerald, Coming soon = amber), summary, details and links; renders nothing while the list is empty. The PixelSlash blocks use the same card. | Content-driven; composed of `Section`, `Card`, `Pill` and typography. A stack, not `CardGrid`: the section is at the reading measure, and the details want the full width. The status map is content wording and tone, not style. |
| `SiteNav.tsx`, `SectionCards.tsx`, `PageIntro.tsx`, `CvLink.tsx`, `UiPage.tsx`, `PixelSlashPage.tsx` (HC-93) | The header nav (`NavTabs`, `aria-current` on the current section), the home cards (`Card` in `CardGrid`), and the pages of the three sections | Composition of ui components over `site.sections`, `site.ui` and `site.pixelslash`; the only classes are the spacing flagged above. |
| `content/themes.ts`, `vitest.config.ts` (HC-93) | The theme list on `/ui/`, read from `themes/*/package.json` and `theme.css` at build time; a vitest setting that lets the tests read those `theme.css` files as text | Wiring: no theme is named in code, so a new theme folder shows up on the next build. The glob and the scope class rule (`themeScope`) live in the private `@hackcove/themes-shared` (`packages/themes-shared`), which Storybook uses too. |
| `components/ThemePicker.tsx`, `content/themeScript.ts`, `layouts/Base.astro` (`docs`) (HC-94) | The `/ui/` header's theme picker: a `Select` listing `default` and every `themes/*` folder, every theme's CSS inlined, and **one inline script** that applies the remembered scope class to `<html>` before first paint and swaps it on change | **The one JS exception.** Every other page ships none (the build has no `<script>` on home, Contracting or PixelSlash). The script is the picker's whole behaviour; no theme is named in it. |
| `components/ComponentPage.tsx`, `DocsFrame.tsx`, `pages/ui/*`, `content/components.ts`, `src/docs/*` (HC-94) | The component docs: a page per component (the one right way and its Do/Don't first, then Usage, Accessibility, API) from `content/components.ts`; `Example`, `DoDont` and `Props` building blocks; `/ui/llms.txt` for agents | Composition of ui components. `Example` renders a real story (`composeStories`) and shows its source in `CodeBlock`; `DoDont` pairs stories named `DoX` / `DontX`; `Props` reads the generated `src/generated/props.json` (react-docgen-typescript over `packages/ui`, gitignored, rebuilt by the Nx `props` target; `className` and `style` are left out, since the components take them only to refuse to restyle). `llms.txt` is built from the same sources, and the tests fail on a stale file or a story that does not resolve. |
| `scripts/`, `e2e/`, `playwright.config.ts` (HC-94) | `generate-props.ts`, and the Playwright layer that serves `dist`, flips every theme on the four pilot pages and checks `llms.txt` | Tooling; `bunx nx e2e hack-cove-site`. |
| `LegalPage.tsx` (the component) | One page for the privacy and terms documents: `PageHeader`, `Section`s, a footer | Content-specific frame around the legal data; composed of ui components apart from the flags above. |
| `Contact.tsx` (the component; `:12` `pt-4 pb-14`) | The page footer: email, legal name, legal links | Content-specific; the padding is the footer's own spacing. |
| `SiteShell.tsx` (the component) | `AppShell` with the site name in the `brand` slot and `SiteNav` in `nav` | Wiring: it supplies the brand and nav and passes `hideChromeInPrint` through. Not a style. |
| `Cv.tsx` (the component; `:27,109` `cv-job`, `:132` `cv`, `:58` `cv-screen-nav`) | The CV as a document: a job block, the `cv` print scope, the nav hidden on paper | One consumer, and a printed resume is not a ui pattern. The class names are print hooks, not styles. |
| `Cv.tsx:28` | A job's title on the left and its dates on the right (`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1`) | CV-specific layout. |
| `Cv.tsx:105,157,159` | `grid gap-10` between jobs; `dl` of skills as `label: items` runs (`grid gap-2`, `flex flex-wrap gap-x-2`) | CV-specific; `KeyValueList` right-aligns values, this is a run-in list. |
| `Cv.tsx:136` | `italic` on the summary paragraph | One paragraph's emphasis in a CV, not a typography role. |
| `Cv.tsx:111` | `mt-3 space-y-2` list of earlier roles | CV-specific list of short entries (not bullets). |
| `cv-print.css` (what is left) | `print-color-adjust: exact`, `@page { size: A4; margin: 14mm }`, white page, `.cv-screen-nav` hidden, `.cv` unconstrained, `.cv-job` kept whole across a page break | The CV prints to A4 and is the source of `public/cv/jacobus.pdf`. Paper size, margin and page breaks are this document's. The header and main rules are gone: `hideChromeInPrint` (ticket 1897) does that. |
| `global.css` | `@import "tailwindcss"`, the theme import, `@source` over the ui build and over `apps/storybook/src` | Wiring: Tailwind skips `node_modules`, so the app has to point it at the ui build; the docs render the stories, whose own layout classes need scanning too. |
| `layouts/Base.astro` | `dark` and `appShellRootClass` on `<html>`, `color-scheme` and `theme-color` metas | Wiring: `dark` is Mocha's scope class and the metas follow it (the docs picker swaps it); `appShellRootClass` is the ui's documented hook. |
| `pages/*.astro`, `astro.config.mjs`, `deploy.sh` | Routes, build and deploy | No styles; plain composition and tooling. |
