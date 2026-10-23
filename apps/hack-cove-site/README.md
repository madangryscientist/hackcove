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
| `Team.tsx` / `Projects.tsx` (was `CaseStudies.tsx`): `<SectionHeading className="mb-4">` + a sibling block | `Section title="…"` (heading plus `gap-4`): pixel-identical. |

## Flagged (b)

| file:line | What it does | Call |
| --- | --- | --- |
| `Hero.tsx:11`, `Projects.tsx:30`, `Contact.tsx:16,25,29`, `LegalPage.tsx:15,38,42`, `Cv.tsx:59,65,90` | `className="link …"` on a bare `<a>`: Mocha's inline link look lives only in the theme CSS | (b) **1818** TextLink / `linkClass` (site needs it too: noted there) |
| `Projects.tsx:28`, `Contact.tsx:24`, `LegalPage.tsx:37`, `Cv.tsx:58,62,86,88` | A wrapping row of links (`flex flex-wrap items-center gap-x-3 text-sm`; on the projects `flex flex-wrap gap-x-4 gap-y-1 text-sm`, no separator) | (b) **1895** InlineLinks |
| `Cv.tsx:104,144,156`, `LegalPage.tsx:35` | A hairline rule under a section heading or above a footer (`border-b/t border-slate-200/70 pb-2/pt-8`) | (b) **1896** Divider and a ruled SectionHeading |
| `Projects.tsx:20`, `Cv.tsx:15` | `<ul className="mt-3 list-disc space-y-1 pl-5">` around a project's details; the same `<ul>` (`mt-2`) around each CV bullet. The project items are `Body as="li"`, so the list is the only hand-styled part | (b) **1826** Video, BulletList and Code (site needs it too: noted there) |
| `SiteShell.tsx:14` | The brand link's `site-header text-base font-bold tracking-tight text-slate-900` | (b) **1824** AppShell header slots (site needs it too: noted there). The `site-header` marker class is for `cv-print.css:27` and goes with **1897** |
| `Hero.tsx:6`, `Projects.tsx:48`, `Team.tsx:40`, `Contact.tsx:11`, `LegalPage.tsx:12`, `Cv.tsx:132` | `max-w-3xl` reading measure on each block; `pb-16 sm:pb-24` between home sections; `mt-12` between CV sections (`Cv.tsx:103,143,155`); `mt-16` above the legal footer (`LegalPage.tsx:35`) | (b) **1838** ProseLayout (site needs it too: noted there; **1825** is the width prop) |
| `Projects.tsx:13,17,20,28`, `Team.tsx:25,29`, `Contact.tsx:14,21`, `Cv.tsx:35,40,46,150` | `mt-0.5 … mt-8` on `Body`/`Caption`/`Subtitle` and on the wrappers between a title, its line and its paragraph; on a project card `mt-2/3/4` between the name row, summary, list and links, and `flex flex-wrap items-center gap-x-3 gap-y-1` for the name beside its status `Pill` | (b) **1899** tight stacks for text blocks |
| `global.css:12-15` | `html { background-color: #000000 }`: the canvas the Mocha cards sit on | (b) **1823** Mocha paints its own canvas (site needs it too: noted there; its canvas is black, not Mantle) |
| `cv-print.css:27-33` | `header:has(.site-header)` hidden and `main > div:has(> .cv)` unpadded on paper, reaching into AppShell/Container's markup | (b) **1897** AppShell and Container print chrome |

## Custom, by design (c)

| file:line | What it is | Why it stays |
| --- | --- | --- |
| `content/site.ts`, `content/cv.ts`, `content/legal.ts` | The copy, the team, the CV data, the privacy and terms text | Content, not style: every word is Jacobus's. |
| `Hero.tsx` (the component; spacing `:8,9,10`) | A landing hero: `Overline`, `Display`, `Lead` and an email link, with a different step between each (`mt-4/6/8`) | One consumer, composed from ui typography. A ui `Hero` waits for a second page that wants one. |
| `Team.tsx` (the component; `:21` `flex items-start gap-4`, `:23` `min-w-0`, `:42` `grid gap-8 sm:grid-cols-2`) | A person row (photo or monogram beside name, role, bio) in a two-up grid inside one `Card` | One consumer. `CardGrid` is tiles at `gap-4` in three column steps; this is people inside a single card. |
| `Projects.tsx` (the component; `:4` the `STATUS` map) | The projects section: one `Card` per `site.projects` entry with `Pill` status (Available = emerald, Coming soon = amber), summary, details and links; renders nothing while the list is empty | Content-driven; composed of `Section`, `Card`, `Pill` and typography. A stack, not `CardGrid`: the section is at the reading measure, and three details per card want the full width. The status map is content wording and tone, not style. |
| `LegalPage.tsx` (the component) | One page for the privacy and terms documents: `PageHeader`, `Section`s, a footer | Content-specific frame around the legal data; composed of ui components apart from the flags above. |
| `Contact.tsx` (the component; `:12` `pt-4 pb-14`) | The page footer: email, legal name, legal links | Content-specific; the padding is the footer's own spacing. |
| `SiteShell.tsx` (the component) | `AppShell` with the site name as the header | Wiring: it supplies the one `header` node. Not a style. |
| `Cv.tsx` (the component; `:27,109` `cv-job`, `:132` `cv`, `:58` `cv-screen-nav`) | The CV as a document: a job block, the `cv` print scope, the nav hidden on paper | One consumer, and a printed resume is not a ui pattern. The class names are print hooks, not styles. |
| `Cv.tsx:28` | A job's title on the left and its dates on the right (`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1`) | CV-specific layout. |
| `Cv.tsx:105,157,159` | `grid gap-10` between jobs; `dl` of skills as `label: items` runs (`grid gap-2`, `flex flex-wrap gap-x-2`) | CV-specific; `KeyValueList` right-aligns values, this is a run-in list. |
| `Cv.tsx:136` | `italic` on the summary paragraph | One paragraph's emphasis in a CV, not a typography role. |
| `Cv.tsx:111` | `mt-3 space-y-2` list of earlier roles | CV-specific list of short entries (not bullets). |
| `cv-print.css:1-25`, `:35-38` | `print-color-adjust: exact`, `@page { size: A4; margin: 14mm }`, white page, `.cv-screen-nav` hidden, `.cv` unconstrained, `.cv-job` kept whole across a page break | The CV prints to A4 and is the source of `public/cv/jacobus.pdf`. Paper size, margin and page breaks are this document's. The header and main rules (`:27-33`) are flagged (b) above. |
| `global.css:1-10` | `@import "tailwindcss"`, the theme import, `@source` over the ui build | Wiring: Tailwind skips `node_modules`, so the app has to point it at the ui build. |
| `layouts/Base.astro:12,19,20` | `dark` and `appShellRootClass` on `<html>`, `color-scheme` and `theme-color` metas | Wiring: `dark` is Mocha's scope class and the metas follow it; `appShellRootClass` is the ui's documented hook. |
| `pages/*.astro`, `astro.config.mjs`, `deploy.sh` | Routes, build and deploy | No styles; plain composition and tooling. |
