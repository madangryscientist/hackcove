# The /ui docs site against eight reference sites, November 2026

Reviewed 2026-11-10 for the ticket "hackcove: review the /ui docs site against other UI framework sites". Nothing in `apps/hack-cove-site` or the components was changed. The only deliverables are this file, the screenshots and one ticket per gap.

## How this was done

- Sites: hack-cove.com/ui/ (ours), ui.shadcn.com, radix-ui.com, mantine.dev, chakra-ui.com, mui.com, tailwindcss.com/plus, park-ui.com, react-spectrum.adobe.com (redirects to react-aria.adobe.com).
- One component page per site, the Button page (Radix: Themes Button), plus each landing page. Everything is a public page. Nobody signed in, and no personal browser profile was used.
- Measurements and feature checks came from the T3 preview browser (`preview_evaluate`). Screenshots were taken with the repo's headless Playwright Chromium instead of the T3 preview, because the preview cannot capture a snapshot here (approved deviation). Shots are at 1440x900 and 390x844, with a full-page shot of each component page at 1440.
- Screenshots live outside the repo, in `~/dev/hackcove-research/docs-site-comparison-2026-11/`, because the repo is public and these are other people's sites. This file names each one by filename.
- A cell that says "not checked" was not checked. Nothing here is filled in from what a site is known for.
- Retries: Tailwind Plus redirected every URL to its login page, was retried once in a fresh tab with no sign-in, and is recorded as login-walled. No other site refused.

## Comparison table

"Yes" means seen on the page or in a probe. "No" means looked for and not found. Our column is Hack Cove.

| Criterion | Hack Cove | shadcn/ui | Radix | Mantine | Chakra | MUI | Tailwind Plus | Park UI | React Aria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Docs search field | No | Yes | No | Yes | Yes | Yes | Not checked | Yes | Yes |
| Search shortcut | No | Yes (toggled) | No | Shown, not confirmed | Yes (opened) | Yes (opened) | Not checked | Shown, not tried | Shown, not confirmed |
| Live preview | Static, inert | Live | Live | Live, with controls | Live | Live | Not checked | Live | Live, with controls |
| Copy button on code | No | Yes | Yes | Yes | Yes | Yes | Not checked | Yes | Yes |
| Copy or view page as Markdown | No | Copy Page | View as Markdown | LLM docs link | Copy Page | View as Markdown | Not checked | Copy Page | Copy for LLM |
| Per page `.md` URL works | No (HTML, 200) | Yes | Yes | No (404) | No (404) | Yes | Not checked | No (404) | Yes |
| Root `/llms.txt` | No (HTML, 200) | Yes, 12 KB | No (404) | Yes, 47 KB, plus llms-full | Yes, 1 KB, plus llms-full | No (404) | Not checked | No (404) | Yes, 40 KB |
| `/sitemap.xml` | No (HTML, 200) | Yes | No | Yes | No | No | Not checked | Yes | No |
| Unknown URL gives a 404 | No (200, home page) | Yes | Yes | Yes | Yes | Yes | Not checked | Yes | Yes |
| On this page list | No | Yes | Yes (Quick nav) | Yes | Yes | Yes | Not checked | Yes | Yes |
| Previous and next links | No | Yes | No | No | Yes | No | Not checked | Yes | No |
| Do and don't | Yes | Not seen | Not seen | Not seen | Not seen | Not seen | Not checked | Not seen | Not seen |
| Accessibility section | Yes (heading) | Text only | Text only | Text only | Text only | Text only | Not checked | Text only | Yes (heading) |
| Anatomy section on the Button page | No | No | No | No | No | No | Not checked | No | No |
| Props listing | Yes (API section) | Table | Table | Separate Props tab | Table | API section | Not checked | Table | Tables |
| Theme control in the docs | Light/dark toggle | Light/dark toggle, Create link | Light/dark toggle, Themes link | Light/dark toggle | Light/dark toggle | Settings drawer | Not checked | Light/dark toggle | Theme select on the example |
| Follows OS dark on first load | Yes | Yes | Yes | No (stayed light) | Yes | Yes | Not checked | Yes | Yes |
| Horizontal overflow at 390 | No | No | No | No | No | No | Not checked | Yes (605 px wide) | No |
| Page weight, requests | 8 | 125 | 34 | 39 | 60 | 43 | Not checked | 24 | 23 |
| Same origin bytes on the wire | 192 KB | 3.2 MB | 893 KB | 1.0 MB | 4.2 MB | 1.2 MB | Not checked | 684 KB | 674 KB |
| Load event, one sample | 137 ms | 1835 ms | 387 ms | 2840 ms | 1370 ms | 4601 ms | Not checked | 4420 ms | 1947 ms |

Tailwind Plus: every URL, including the landing page and the UI blocks pages, redirected to the sign-in form (`tailwindplus-login-wall-1440.png`, `tailwindplus-login-wall-390.png`). Only the login wall was seen, so every Tailwind Plus cell is "not checked".

## Landing and overview

Ours: `/ui/` lands directly on the Getting started page. There is no hero and no component overview (`hackcove-landing-1440.png`, `hackcove-landing-390.png`). The company home page, `hack-cove.com`, is a separate marketing page (`hackcove-unknown-url-1440.png` shows it, because unknown URLs fall back to it).

Rivals open on a product page with a headline, two buttons and a collage of live components: shadcn (`shadcn-landing-1440.png`), Radix (`radix-landing-1440.png`), Park UI (`parkui-landing-1440.png`), React Aria (`reactaria-landing-1440.png`, with labelled callouts naming the components in a sample screen). Mobile landing shots for all of them are `<site>-landing-390.png`. The Mantine, Chakra and MUI landing shots (`mantine-landing-1440.png`, `chakra-landing-1440.png`, `mui-landing-1440.png`) were taken too; MUI shows an announcement banner and a cookie prompt, Chakra a promo banner and a Sponsor button. Ours is a docs entry point only. Whether `/ui/` should get a component overview is a design question I did not find evidence to settle, so it is not ticketed.

## Navigation and sidebar

Ours has a left rail of section headings and component links on desktop (`hackcove-component-1440.png`), and a Menu button plus an "All components" select on a phone (`hackcove-component-390.png`, `hackcove-mobile-menu-390.png`). No right hand column: the 1440 page leaves a wide empty gutter beside the text.

Rivals all pair the left rail with a right hand "On this page" list on a component page: shadcn, Radix (Quick nav), Mantine, Chakra, MUI, Park UI and React Aria (`shadcn-component-1440.png`, `radix-component-1440.png`, `mantine-component-1440.png`, `chakra-component-1440.png`, `mui-component-1440.png`, `parkui-component-1440.png`, `reactaria-component-1440.png`). shadcn, Chakra and Park UI also have previous and next links (arrow buttons beside the title on shadcn). Ours has neither. This is the gap "On this page" and previous/next.

## Search

Ours has no search. Six of the seven rivals that could be checked have a search field in the header, with a keyboard shortcut shown (⌘K or Ctrl+K). The shortcut was confirmed to open a palette on shadcn, Chakra and MUI. On Mantine, Park UI and React Aria the shortcut is displayed, and a synthetic key press did not open anything, so those are "shown, not confirmed". Radix Themes has no search on the page checked. With about 79 component pages in our rail, finding one means scanning the rail. See the ticket on docs search.

## Component page anatomy

Ours has 11 headings on the Button page, including Do and Don't pairs, an Accessibility section and an API section (`hackcove-component-1440.png`, `hackcove-component-1440-full.png`). Each example shows the rendered component with its source. Do and don't pairs are the one thing none of the rivals show. The Accessibility section is on ours and on React Aria; Radix, Mantine and MUI only mention accessibility in running text.

Gaps seen on ours:

- The example preview is static and inert, with no copy button on its source (`hackcove-component-1440.png`).
- Dialog, Drawer and FieldDialog show only their trigger button, never the open panel (`hackcove-dialog-1440.png`). The site README already lists this.
- No anatomy section. None of the nine Button pages has one. Radix Primitives pages do, but those are compound primitives, which ours are not (see "Not worth copying").

Live previews with control panels exist on Mantine and React Aria (`mantine-component-1440.png`, `reactaria-component-1440.png`); not wanted here (see "Not worth copying"). Variants are shown on every site.

## Theme switching and how themes are shown

Ours has a light/dark toggle only. That is a decision, not a gap: the site header's theme picker was replaced by a light/dark toggle on request (ticket "Site: replace the header theme picker with a light/dark toggle"). All seven rivals checked have a colour mode control. Beyond that, shadcn links a "Create" customiser, Radix links Themes, MUI has a settings drawer (seen in the page controls, not opened), React Aria puts a Theme select on the example itself. None of that fits a library that fixes the look.

Light and dark themselves: ours renders a warm paper look in light and Catppuccin Mocha (about #181825) in dark (`hackcove-component-1440.png`, `hackcove-component-1440-dark.png`). Rival dark shots are `<site>-component-1440-dark.png`.

## Getting started and install

Ours: one install command, `bun add @hackcove/ui-react @hackcove/themes`, then the CSS imports and the `@source` line (`hackcove-landing-1440.png`). shadcn offers Command and Manual tabs with pnpm, npm, yarn and bun tabs under them (`shadcn-component-1440.png`). Park UI offers CLI and Manual tabs (`parkui-component-1440.png`). Chakra shows the import (`chakra-component-1440.png`). For Radix, Mantine, MUI and React Aria the install step was not checked; only the Button pages were compared. Package manager tabs are an options catalogue and are not wanted.

## Copy to clipboard

Ours has no copy control on the docs page. The Button page probe found no copy button at all. Every rival checked has one on code blocks: shadcn, Radix, Mantine, Chakra, MUI, Park UI and React Aria (copy icons in `shadcn-component-1440.png`, `chakra-component-1440.png`, `parkui-component-1440.png`, `reactaria-component-1440.png`). The library already has the piece: `CodeExample` and `CodeBlock` take a `copy` prop, and the site's `src/docs/Example.tsx` does not pass it. See the ticket on copy buttons.

## Dark mode

Under an OS dark preference, ours rendered dark on first load, as did shadcn, Radix, Chakra, MUI, Park UI and React Aria (pixel samples of the `-dark` shots, and the page's own classes). Mantine stayed light in both the probe and its dark shot (`mantine-component-1440-dark.png`, `mantine-component-390-dark.png`). No gap on our side.

## Mobile

At 390 wide, ours has no horizontal page overflow. Navigation is a Menu button and an "All components" select above the title (`hackcove-component-390.png`, `hackcove-mobile-menu-390.png`). Our code samples are clipped at the right edge and scroll sideways inside their box (`hackcove-component-390.png`). The probe counted 3 small tap targets on our page. Other sites' counts came from earlier probes whose size threshold was not re-checked, so treat them as rough: shadcn 7, Radix 26, Mantine 45, Chakra 2, MUI 27, React Aria 22; Park UI not recorded.

Park UI overflows sideways on a phone: the page was 605 px wide in a 390 px viewport (`parkui-component-390.png`). Rival phone shots are `<site>-component-390.png`, and the dark ones `<site>-component-390-dark.png`.

Nothing to file for mobile layout; the code clipping is folded into the copy ticket's acceptance.

## Page speed

One measure, taken the same way on every page: the page's own `PerformanceNavigationTiming` and `PerformanceResourceTiming` entries, read in the T3 preview browser, one load per page. The numbers in the comparison table are the number of requests, the encoded bytes of same-origin resources, and the load event time.

Caveats, all of which matter: it is one sample, from one machine on one network, at one time. The preview viewport reported 1280 wide when asked for 1440, so layout dependent loading may differ slightly. The tab was hidden, so there is no first paint or largest paint number. Cross-origin sizes are unreadable, so they are excluded (MUI loads 6 cross-origin requests, including an ad script; Park UI and Chakra load an analytics script). Some of the rivals' resources may have been served from a cache I warmed on an earlier visit. `www.hack-cove.com` does not resolve, so there is no cold twin of our site either. Treat the ranking as indicative: ours is the lightest by a wide margin (8 requests, 192 KB, 137 ms), which is expected for a static Astro page with one script island. Tailwind Plus: not checked.

## Agent readable docs

This is the criterion where the project's aim matters most: sites built by agents.

- Ours: `/ui/llms.txt` exists and is one 306 KB plain text file built from the same sources as the pages. `/llms.txt` returns an HTML page with a 200 status. There is no per page Markdown: `/ui/button.md` and `/ui/button/index.md` also return the HTML page with a 200 status. No "copy as Markdown" control.
- shadcn: `/llms.txt` (12 KB), per page `.md`, a Copy Page control and an "MCP Server" link on the page.
- Radix: no `/llms.txt`, but per page `.md` and a View as Markdown link.
- Mantine: `/llms.txt` (47 KB) and `/llms-full.txt` (4.9 MB), and an "LLM documentation" link on the page; per page `.md` returned 404.
- Chakra: `/llms.txt` (1 KB) and `/llms-full.txt` (2.2 MB), a Copy Page control, an "Agent Skills" tip on the page; per page `.md` returned 404.
- MUI: per page `.md` and View as Markdown; no `/llms.txt`.
- Park UI: Copy Page control only.
- React Aria: `/llms.txt` (40 KB), per page `.md`, Copy for LLM.

Our one large file is the odd one out: it is not an index and not at the root where tools look. See the ticket on per page Markdown and a root index.

## Unknown URLs, sitemap and robots

Every unknown path on ours returns the home page with a 200 status, including `/ui/no-such-page/`, `/sitemap.xml` and `/robots.txt` (`hackcove-unknown-url-1440.png`). That is a soft 404: crawlers and agents are told the page exists. All seven rivals checked return a 404 for a path that does not exist. Three serve a `sitemap.xml` (shadcn, Mantine, Park UI); Radix, Chakra, MUI and React Aria returned 404 for it. See the ticket on the 404, sitemap and robots.

## Ranked gaps

Each is a ticket in project hackcove, title prefix `docs-site:`. Rank 1 matters most for the project's aim, a site built by agents with props and nothing else.

1. **A Markdown page for every component, a root `/llms.txt` index, and a View as Markdown link.** Four rivals serve per page `.md`; four serve a root `/llms.txt`; ours serves neither. Only a plain link, no client JS.
2. **A real 404, `sitemap.xml` and `robots.txt`.** Ours tells crawlers every URL exists. The root `/llms.txt` and `.md` probes above only look like they work because of the same fallback.
3. **A copy button on every code example.** Seven of seven rivals have one, the component already supports it, and the site does not use it. Check the code at 390 wide.
4. **Search the docs with a keyboard shortcut.** Six of seven rivals have it; ours has about 79 pages in a rail.
5. **"On this page" and previous/next.** Seven of seven rivals list the page's sections; three have previous/next. Ours has a wide empty gutter at 1440.
6. **Show Dialog, Drawer and FieldDialog open in their previews.** Known on the site README; confirmed in `hackcove-dialog-1440.png`.

Already covered, not ticketed again: syntax highlighting of code in docs (the open ticket "skill: add syntax highlighting to Hack Cove code"), custom CSS in consumers (the open ticket "Zero custom CSS: audit consumers for remaining custom CSS/Tailwind and file the components that would remove it"), a search input component (the open ticket "Search input: Input with search affordance and clear button"), a combobox (the open ticket "Combobox: text input with filtered suggestions"). The docs search ticket should build on those two when they land, or use the same primitives.

## Not worth copying

No tickets for these. Each conflicts with a fixed look, one way to do a thing, or no styling escape hatch.

- **Open in v0, Open in Chat, Open in Stackblitz on every example** (shadcn, MUI, Chakra). It sends readers to an editor outside the system. The one way is install and props.
- **Framework or styling tabs on an example** (React Aria's Vanilla CSS and Tailwind tabs, shadcn's Base UI, React Aria and Radix UI tabs). We ship one implementation.
- **Live prop playgrounds with control panels** (Mantine, React Aria). They invite exploring options. Our props are few and fixed; Do and Don't pairs say which to use.
- **Styles API, recipes and "Adding a new variant" sections** (Mantine, Chakra). They document the customisation we refuse to offer.
- **Theme builders and customisers** (shadcn Create, MUI settings drawer, Radix Themes, React Aria Theme select). The look is fixed by the theme files, and the header toggle is light and dark by decision.
- **Package manager tabs** (shadcn, Park UI). The docs use Bun, one command. Whether that is the right call for npm users is a decision for Jacobus, not a rival feature to copy.
- **Banners, ads, sponsor buttons and cookie prompts** (MUI's cookie prompt and ad script, Chakra's promo banner and Sponsor button, Park UI's analytics). Noise.
- **A version dropdown** (Mantine, Chakra, MUI). Nothing before 1.0 is served in parallel.
- **Separate Documentation, Props and Styles API tabs** (Mantine). Props stay on the component page.
- **Anatomy diagrams** (Radix Primitives, React Aria's landing callouts). They explain compound parts. Our components are configured through props, so there is no tree of parts to draw.
- **An MCP server for the docs.** shadcn links one; Chakra and MUI have pages about one in their navigation (seen, not tried). Per page Markdown and a root `/llms.txt` give an agent the same text with nothing to run. Revisit if agents cannot use those.
- **Heavy JavaScript.** shadcn loads about 2.8 MB and Chakra about 3.9 MB of encoded script on one component page. Ours is a static page and one island.
