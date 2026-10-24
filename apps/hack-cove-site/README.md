# hack-cove-site

The hack-cove.com site (Astro, static, no JS shipped). It is the demo project for Hack Cove: **a
composition of `@hackcove/ui` components under `@hackcove/theme-catppuccin-mocha`, and nothing
special of its own.** Any custom style or component here is a flag, not a fix: it gets a call below,
and a gap in the library is a ticket for Hack Cove UI to add if needed, not a commitment.

Audit: ob 1848, 2026-10-23. Line numbers are the commit that landed it. Every custom style, class
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

## Flagged (b)

| file:line | What it does | Call |
| --- | --- | --- |
| `Projects.tsx`, `Team.tsx`, `Cv.tsx`, `Hero.tsx` | `mt-0.5 … mt-8` on `Body`/`Caption`/`Subtitle`/`Display`/`Lead` where the step is not uniform in its block: a team member's name, role and bio (2px then 8px), a project card's name row, summary, list and links (8, 12, 16px), the hero (16, 24, 32px), a CV job (8, 12px). `xs` is 8px and one gap fits a whole Stack, so none of these fit; a 2px and a 4px step (`mt-0.5`, `mt-1`) would need a `2xs` | (b) **1899** (the `xs` gap landed; a `2xs` waits for a consumer that needs a whole Stack at 2–4px) |
| `Projects.tsx`, `Team.tsx`, `Hero.tsx`, `Cv.tsx` | `pb-16 sm:pb-24` between home sections (a responsive step no `Stack` gap has); `mt-12` between CV sections and the CV's one wrapper `<div>` that lets them keep it (no gap is 48px) | (b) a larger, responsive section gap on `Stack` |
| `global.css:12-15` | `html { background-color: #000000 }`: the canvas the Mocha cards sit on | (b) **1823** Mocha paints its own canvas (site needs it too: noted there; its canvas is black, not Mantle) |

## Custom, by design (c)

| file:line | What it is | Why it stays |
| --- | --- | --- |
| `content/site.ts`, `content/cv.ts`, `content/legal.ts` | The copy, the team, the CV data, the privacy and terms text | Content, not style: every word is Jacobus's. |
| `Hero.tsx` (the component; spacing `:8,9,10`) | A landing hero: `Overline`, `Display`, `Lead` and an email link, with a different step between each (`mt-4/6/8`) | One consumer, composed from ui typography. A ui `Hero` waits for a second page that wants one. |
| `Team.tsx` (the component; `:21` `flex items-start gap-4`, `:23` `min-w-0`, `:42` `grid gap-8 sm:grid-cols-2`) | A person row (photo or monogram beside name, role, bio) in a two-up grid inside one `Card` | One consumer. `CardGrid` is tiles at `gap-4` in three column steps; this is people inside a single card. |
| `Projects.tsx` (the component; `:4` the `STATUS` map) | The projects section: one `Card` per `site.projects` entry with `Pill` status (Available = emerald, Coming soon = amber), summary, details and links; renders nothing while the list is empty | Content-driven; composed of `Section`, `Card`, `Pill` and typography. A stack, not `CardGrid`: the section is at the reading measure, and three details per card want the full width. The status map is content wording and tone, not style. |
| `LegalPage.tsx` (the component) | One page for the privacy and terms documents: `PageHeader`, `Section`s, a footer | Content-specific frame around the legal data; composed of ui components apart from the flags above. |
| `Contact.tsx` (the component; `:12` `pt-4 pb-14`) | The page footer: email, legal name, legal links | Content-specific; the padding is the footer's own spacing. |
| `SiteShell.tsx` (the component) | `AppShell` with the site name in the `brand` slot | Wiring: it supplies the brand and passes `hideChromeInPrint` through. Not a style. |
| `Cv.tsx` (the component; `:27,109` `cv-job`, `:132` `cv`, `:58` `cv-screen-nav`) | The CV as a document: a job block, the `cv` print scope, the nav hidden on paper | One consumer, and a printed resume is not a ui pattern. The class names are print hooks, not styles. |
| `Cv.tsx:28` | A job's title on the left and its dates on the right (`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1`) | CV-specific layout. |
| `Cv.tsx:105,157,159` | `grid gap-10` between jobs; `dl` of skills as `label: items` runs (`grid gap-2`, `flex flex-wrap gap-x-2`) | CV-specific; `KeyValueList` right-aligns values, this is a run-in list. |
| `Cv.tsx:136` | `italic` on the summary paragraph | One paragraph's emphasis in a CV, not a typography role. |
| `Cv.tsx:111` | `mt-3 space-y-2` list of earlier roles | CV-specific list of short entries (not bullets). |
| `cv-print.css` (what is left) | `print-color-adjust: exact`, `@page { size: A4; margin: 14mm }`, white page, `.cv-screen-nav` hidden, `.cv` unconstrained, `.cv-job` kept whole across a page break | The CV prints to A4 and is the source of `public/cv/jacobus.pdf`. Paper size, margin and page breaks are this document's. The header and main rules are gone: `hideChromeInPrint` (ticket 1897) does that. |
| `global.css:1-10` | `@import "tailwindcss"`, the theme import, `@source` over the ui build | Wiring: Tailwind skips `node_modules`, so the app has to point it at the ui build. |
| `layouts/Base.astro:12,19,20` | `dark` and `appShellRootClass` on `<html>`, `color-scheme` and `theme-color` metas | Wiring: `dark` is Mocha's scope class and the metas follow it; `appShellRootClass` is the ui's documented hook. |
| `pages/*.astro`, `astro.config.mjs`, `deploy.sh` | Routes, build and deploy | No styles; plain composition and tooling. |
