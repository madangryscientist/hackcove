# What makes a good Hack Cove theme

Researched 2026-11-13. Nothing in `themes/`, `packages/` or `apps/` was changed. This file is the only deliverable. It is written for two readers: whoever builds the next theme, and the review panel that judges it. The builder gets numbers to meet. The panel gets questions to ask where a number cannot decide.

## How this was done

- **Sources first, rules second.** Every criterion below names the primary source it came from, with a link and a short quote, or says plainly that no source gave it and the number is a placeholder. Primary means a design system's own documentation or code, a standard, a paper, or an author's own page. Blog posts are used only where they are the author's own page (Ottosson on Oklab, Schoonover on Solarized).
- **Pages that could not be read.** The Material 3 and Material 2 pages, and the HTML of Apple's Human Interface Guidelines, return an empty page to a fetcher because they are rendered in the browser. Apple's text was read from the JSON the page itself loads (`developer.apple.com/tutorials/data/design/human-interface-guidelines/{color,dark-mode}.json`). Material was read from its source repositories instead. Nothing from the Material pages is quoted.
- **Every criterion is marked.** **Measurable** means a number and a method, ready to become a third contract beside the contrast contract (`packages/themes-shared/src/contrastRules.ts`) and the distinction contract (`packages/themes-shared/src/distinction.ts`). **Taste** means a person has to look, and the exact question the panel asks is written down.
- **What the two existing contracts already do** is stated for each criterion as *covered*, *partly covered* or *not covered*. Read from the code, not from memory: the contrast contract holds ink to 4.5:1 on canvas, surface, subtle and inset, held tone text, labels, tints, control edges and focus rings to 4.5:1 or 3:1 on canvas, surface and subtle, and chart colour to 3:1. The distinction contract holds exactly two pairs: the primary and danger fills (OKLab distance 0.12) and the link and danger text (0.09). Its own comment says those bars "come from the site, read at a glance".
- **Scores are computed, not judged.** A throwaway script (not committed) loaded each theme's CSS with `utilitiesOf` and `colourOf`, composited any alpha over the theme's white surface with `composite`, and called `contrastRatio`, `oklab` and `distance` from `packages/themes-shared/src/colour.ts`. It added three things that file does not have: APCA, OKLCH chroma and hue (taken from `oklab`: chroma is the length of the (a, b) pair, hue its angle), and colour vision deficiency simulation. Appendix A lists every colour a role resolves to, so every number can be re-checked by hand, and how.
- **APCA** is the 0.0.98G-4g algorithm with its published constants. The only check run on the implementation is that black on white gives Lc 106.0 and white on black gives Lc -107.9, which matches the "Lc 0 to about 106" the APCA introduction gives. The constants were not re-read against a spec in this session.
- **Colour vision deficiency (CVD)** is simulated with the Machado, Oliveira and Fernandes (2009) matrices at severity 1.0, applied to linear RGB. Severity 1.0 is the worst case (no working cone type); most people with a deficiency have a milder one, so a pair that survives the simulation survives them too.
- **Bars are of three kinds, and each says which.** *Sourced*: a source states the number. *Derived*: a source states a principle and the number follows from it. *Placeholder*: no source gives a number; it was chosen here and must be reviewed. A bar read off the three shipped themes would be circular (a theme cannot fail a bar made from itself), so where a placeholder was chosen with their values in view, that is said.
- **Not checked** means not checked. Section "What was not verified" lists the claims that were looked for and not confirmed.

## The criteria at a glance

Pass/fail columns are at the end of the file in the score table. Here is the shape of the whole.

| # | Criterion | Kind | Existing contracts | Bar or question |
| --- | --- | --- | --- | --- |
| 1 | Text contrast beyond AA | Measurable | Partly: 4.5:1 only | Ink 7:1 and Lc 75 on the page surfaces; muted Lc 60 (advisory) |
| 2 | Contrast ceiling and glare | Measurable and taste | Not covered | Dark theme ink at most Lc 90; no pure `#000` or `#fff` canvas or ink |
| 3 | UI part contrast | Measurable | Covered: 3:1 | Nothing new; Primer's higher level noted in 15 |
| 4 | Surface depth | Measurable | Not covered | Order, step size, evenness, hairline visibility |
| 5 | Text ladder | Measurable | Not covered | Ink and muted at least 0.10 apart in OKLab lightness |
| 6 | Harmony | Measurable and taste | Not covered | Neutral hue coherence, tone lightness band, hue order |
| 7 | Semantic clarity | Measurable | Partly: 2 pairs | Five status inks apart by 0.09; traffic-light pairs under CVD |
| 8 | Restraint | Measurable and taste | Not covered | Chroma caps; the composition question |
| 9 | State consistency | Measurable and taste | Partly: ring on 3 surfaces | Hover direction, size, hue; ring on every surface |
| 10 | Data and code | Measurable and taste | Partly: 3:1 and 4.5:1 | Series apart by 0.09; syntax apart by 0.06 |
| 11 | Comfort over time | Taste, one guard measurable | Not covered | Vibration guard; the two minute reading question |
| 12 | Light and dark | Measurable and taste | Not covered | Lifted dark surfaces; pairing test if a pair is required |
| 13 | Character | Measurable and taste | Not covered | Distance from existing same-polarity themes; the mood in three words |
| 14 | The user base | Taste | Not covered | The panel's first question |
| 15 | Added by the sources | Mixed | Mostly not covered | Colour is not the only signal; contrast levels; symmetry |

## Sources

Links were opened and the quoted text read on 2026-11-13 unless the "not verified" list says otherwise.

| Source | What it gave | Short quote or finding |
| --- | --- | --- |
| [Radix Colors, understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) | A 12 step scale where each step has one job | Steps 1 and 2 are "designed for app backgrounds and subtle component backgrounds"; steps 11 and 12 "are guaranteed to Lc 60 and Lc 90 APCA contrast ratio on top of a step 2 background" |
| [Radix Colors, composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) | Tinted greys | Choose "the gray scale which is saturated with the hue closest to your accent hue"; "be careful when using saturated grays for your app background, especially in dark mode" |
| [Apple HIG, Color](https://developer.apple.com/design/human-interface-guidelines/color) | Colour is not the only signal; restraint; increased contrast | "Avoid relying solely on color to differentiate between objects, indicate interactivity, or communicate essential information"; high contrast "can also cause visual discomfort if people's eyes have adjusted to low light or darkness" |
| [Apple HIG, Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | Dark is not inverted; lifted surfaces; a text bar | "no lower than 4.5:1", and "strive for a contrast ratio of 7:1, especially in small text"; dark colours "aren't necessarily inversions of their light counterparts"; "Soften the color of white backgrounds" |
| [Atlassian, color](https://atlassian.design/foundations/color) | A two level contrast bar; semantic colour is reserved | "Must pass 4.5:1: Text smaller than 24px"; 3:1 for "text 24px or larger"; "Don't use an accent when the color has semantic meaning"; "Pair selected colors with another visual cue" |
| [Atlassian, color palette](https://atlassian.design/foundations/color/color-palette) | Light and dark mirror each other | "if a button color is 700 in light theme, it will be 400 in dark theme"; "Using symmetry is a great place to start" |
| [IBM Carbon, color](https://carbondesignsystem.com/elements/color/overview/) and [usage](https://carbondesignsystem.com/elements/color/usage/) | Layering; sparing colour; focus | "In the light themes, layers alternate between White and Gray 10"; "In the dark themes, layers become one step lighter with each added layer"; "Additional colors are used sparingly and purposefully"; focus states "must pass 3:1". Dark mode is "highly encouraged", not required |
| [IBM Carbon, data visualisation palettes](https://carbondesignsystem.com/data-visualization/color-palettes/) | A categorical sequence ordered by neighbour contrast | The sequence is "carefully curated to maximize contrast between neighboring colors"; "Multiple gradients are often inaccessible and are discouraged" |
| [GitHub Primer primitives](https://github.com/primer/primitives) (`scripts/themes.config.ts`, `scripts/colorContrast.config.ts`) | A theme set with contrast levels and colour blind siblings | Themes: light, light-tritanopia, light-colorblind, light-high-contrast, dark, dark-dimmed, dark-tritanopia, dark-colorblind, dark-high-contrast. Contrast config: text 4.5 and border 3 by default, text 7 and border 4.5 in high contrast. CI check "A11y contrast check" |
| [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) and [Material Components Android, Color.md](https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md) | Tones, contrast levels, surface steps | Contrast is computed from L* tone (`ratioOfTones`); `contrast_curve.ts` defines levels -1.0, 0.0, 0.5, 1.0; surface container tones are 100, 98, 96, 94, 92, 90 (light) and 4, 6, 10, 12, 17, 22 (dark) |
| [APCA introduction](https://git.apcacontrast.com/documentation/APCAeasyIntro.html) and [Why APCA](https://git.apcacontrast.com/documentation/WhyAPCA.html) (Myndex) | A second contrast measure | Lc 0 to about 106. "Lc 90 is the preferred minimum for columns of body text"; Lc 75 for body text no smaller than 18px/400; Lc 60 for 24px/400 or 16px/700; Lc 45 for headlines; Lc 15 is the floor for non-text. "Dark Mode Maximum: Lc -90 for large fonts (preliminary)". "WCAG 2.x contrast cannot provide useful guidance when designing 'dark mode'". The pages say their opinions "may or may not reflect those of the W3 or AGWG" |
| [WCAG 3.0 Working Draft](https://www.w3.org/TR/wcag-3.0/) | Status of the successor | "W3C Working Draft 10 September 2026"; "WCAG 3 does not replace WCAG 2" |
| WCAG 2.2 Understanding pages: [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) | The standard bars | 4.5:1 (large text 3:1); 7:1 (large 4.5:1); 3:1 for UI parts; colour is not the only visual means; focus appearance (AAA) asks a 2 CSS px perimeter and a 3:1 change. None says anything about contrast being too high |
| [Catppuccin style guide](https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md) and [README](https://github.com/catppuccin/catppuccin) | What the roles mean in two of our three themes | Blue is links, green is success, yellow is warnings, red is errors; Overlay 2 is selection; "Legibility always comes first, so please use your own judgement". The project "aims to be the middle ground between low and high-contrast themes" |
| [Ottosson, a perceptual colour space](https://bottosson.github.io/posts/oklab/) and [Evil Martians on OKLCH](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) | Why lightness and chroma steps are measured in OKLab and OKLCH | Oklab L is "perceived lightness"; an HSV gradient is "quite uneven" in lightness across hues; OKLCH has "consistent lightness for our eyes, unlike L in hsl()" |
| [Machado, Oliveira and Fernandes 2009](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html) | The CVD simulation matrices | Protan, deutan and tritan matrices at severity 0 to 1; the 1.0 matrices are in the script (Appendix A, "How to re-check") |
| [Colour Blind Awareness](https://www.colourblindawareness.org/colour-blindness/) and [NEI](https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness) | How many readers | "approximately 1 in 12 men (8%) and 1 in 200 women" |
| [Datawrapper, colours in data visualisation](https://www.datawrapper.de/blog/colors) | Few colours; lightness carries under CVD | "If you need more than seven colors in a chart, consider using another chart type"; palettes that vary in lightness stay distinguishable for readers with a deficiency |
| [NN/g, dark mode](https://www.nngroup.com/articles/dark-mode/) | Dark is not simply better | "in users with normal vision, light mode leads to better performance most of the time"; "as we get older, we become more susceptible to glare" |
| Buchner and Baumgartner 2007, *Ergonomics* 50(7):1036 to 1063 ([PMID 17510822](https://pubmed.ncbi.nlm.nih.gov/17510822/)) | Polarity and legibility | Proofreading was consistently better with dark text on a light ground than the reverse, whatever the ambient light, and "colour contrast (red text on green background) could not compensate for a lack of luminance contrast" |
| Cauquil et al. 2009, *Neuropsychologia* 47(12):2677 ([PMID 19442677](https://pubmed.ncbi.nlm.nih.gov/19442677/)); Ozolinsh and Muizniece 2015, *Front Psychol* 6:337 ([doi 10.3389/fpsyg.2015.00337](https://doi.org/10.3389/fpsyg.2015.00337)) | Chromostereopsis, the vibration of saturated opposite hues | "ocular chromatic aberrations usually make red appear closer to the viewer than blue" |
| [Solarized](https://ethanschoonover.com/solarized/) (Schoonover) | Softer contrast with hue kept; symmetric light and dark | "Black text on white from a computer display is akin to reading a book in direct sunlight and tires the eye"; the dark base is `#002b36`, not black; lightness differences are symmetric between the two modes |

## 1. Text contrast beyond AA

**Why a reader needs it.** AA (4.5:1) is the floor at which a person with typical vision can read small text under good conditions. A developer reading documentation for an hour, or a clerk reading a table of figures on an older screen, is not under good conditions. Apple states the floor and the aim in one sentence: "no lower than 4.5:1", and "strive for a contrast ratio of 7:1, especially in small text". WCAG 1.4.6 names 7:1 as AAA.

**What the contracts do.** Partly covered. The contrast contract holds every ink to 4.5:1 on canvas, surface, subtle and inset. Nothing asks for more.

**Measurable. Three bars.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 1a. Ink (`text-slate-900`) is at least 7:1 on canvas, surface and subtle. **The gate** | `contrastRatio` | Derived (Apple's 7:1 for small text; WCAG 1.4.6) |
| 1b. The same pairs reach at least Lc 75 in magnitude (the size of Lc, since a dark theme's Lc is negative). Reported, not a gate | APCA | Derived, advisory (Lc 75 is the APCA minimum for body text at 18px/400) |
| 1c. Muted text (`text-slate-500`) reaches at least Lc 60 in magnitude on the same three. Reported, not a gate | APCA | Derived, advisory (Radix guarantees Lc 60 for its low-contrast text step) |

**Large text.** The contract has no large-text rule, though its comment on `UI_BAR` says 3:1 is "WCAG 2.x AA for large text": every ink pair is held to the stricter 4.5:1, so large text passes whenever ink does. WCAG 1.4.3 allows 3:1 for large text, Atlassian's guidance sets large at 24px, and APCA asks Lc 60 for 24px/400 and Lc 45 for headlines. No separate bar is proposed, because a looser bar for headings would be a lower floor than the one the contract already holds. Against APCA's large figures the shipped muted inks read Lc 52.3 or more (Mocha), 66.7 or more (Latte) and 72.4 or more (thrifty-paper), so all three clear Lc 45 and only Mocha misses Lc 60 (that is 1c again).

Why these three surfaces and not inset: inset is a hover and pressed fill, so ink must hold there (the contract does) but the page is not read on it.

**Scores.** Mocha passes 1a (minimum 8.69 on subtle) and 1b (minimum Lc 76.1) and misses 1c (Lc 52.3 on subtle, 57.0 on canvas). Latte misses 1a and 1b narrowly (ink on subtle is 6.57:1 and Lc 74.6) and passes 1c. thrifty-paper passes all three with a wide margin (minimum 15.68:1, Lc 96.9, muted Lc 72.4). The full table is at the end.

**Where WCAG 2 and APCA disagree, in our own data.** Mocha's muted text on canvas is 7.89:1, higher than Latte's 5.27:1. APCA reverses them: Lc 57.0 for Mocha, 71.4 for Latte. That is APCA's point: the same ratio is harder to read as light text on a dark ground than the reverse. See "Open question: APCA".

## 2. Contrast ceiling and glare

**Why a reader needs it.** Too much contrast tires and, in the dark, dazzles. Apple: high contrast "can also cause visual discomfort if people's eyes have adjusted to low light or darkness". Solarized says the same of black on white. NN/g adds that "as we get older, we become more susceptible to glare".

**What the sources do not give.** No source gives a ceiling for a light theme. The WCAG pages say nothing on too much contrast. Buchner and Baumgartner found dark text on a light ground read better than the reverse, so a high-contrast light theme is not a fault on the evidence. The only numeric ceiling is APCA's, and only for dark mode: "Lc -90 for large fonts (preliminary)". The Why APCA page says "less than Lc 90", so the two APCA pages are not worded the same.

**What the contracts do.** Not covered. The contrast contract has floors only.

**Measurable.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 2a. In a dark theme, ink on canvas, surface and subtle is at most Lc 90 in magnitude | APCA | Sourced for large fonts, extended here to all ink; preliminary |
| 2b. Canvas and ink are not pure `#000000` or `#ffffff` | `toHex` of the resolved colour | Derived (Solarized; Apple, "Soften the color of white backgrounds") |

All three themes pass 2b. Mocha passes 2a (largest magnitude Lc 80.8). 2a does not apply to the two light themes.

**Taste. The panel asks:** "Read a screenful of documentation, then a dense table, for two minutes each. Does the text glare, or do your eyes tire before the end?" thrifty-paper is the case to look at hardest: its ink on the white surface is 17.49:1 and Lc 104.3, two points under pure black on white (Lc 106). No source says that is too much. Latte and thrifty-paper both use a pure white `#ffffff` surface for cards. 2b allows it (the card is not the canvas); the panel decides whether it dazzles beside the softer canvas.

## 3. UI part contrast

**Why a reader needs it.** A button edge, a checkbox, a chart bar or a focus ring that cannot be seen cannot be used. WCAG 1.4.11 asks 3:1 against the adjacent colour. Atlassian: "3:1 ... Any UI essential to understanding the experience". Carbon: "Focus states ... must pass 3:1".

**What the contracts do.** Covered. The contrast contract holds the neutral control edge (`border-slate-300`), each tone's control edge, the focus ring and native control colour, the invalid field edge and the chart colour to 3:1 on canvas, surface and subtle. Nothing new is proposed here. The one gap, the focus ring on inset and on the tinted surfaces, is in criterion 9. Past-AA levels for UI parts are in criterion 15.

## 4. Surface depth

**Why a reader needs it.** The page, a card on it, a table band inside the card and a pressed control must read as layers without anyone drawing a box round each. Carbon builds this on layers: "In the dark themes, layers become one step lighter with each added layer". Apple's dark mode has base colours that are "dimmer" and elevated colours that are "brighter". Radix gives steps 1 and 2 to the page and "subtle component backgrounds", and 3 to 5 to component states.

**Mapping our roles to Radix's steps.** This mapping is this document's reading, not Radix's. canvas is step 1; surface and subtle are steps 2 and 3 (page level fill and the raised band); inset is steps 4 and 5 (hover, pressed); `border-slate-200` is step 6 (subtle border); `border-slate-300` is step 7 or 8 (an interactive edge); the accent fill is step 9 and its hover is step 10; `text-*-700` is step 11 and ink is step 12.

**What the contracts do.** Not covered. They measure each colour against text on it, never the surfaces against each other.

**Measurable.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 4a. Order. Dark: canvas, surface, subtle, inset each lighter than the last (OKLab L). Light: surface at least as light as canvas, then subtle and inset each darker | OKLab L | Sourced (Carbon, Apple, Material's surface tone steps, which rise in dark and fall in light) |
| 4b. Each adjacent step (canvas to surface, surface to subtle, subtle to inset) is at least 0.02 apart in OKLab distance | `distance` | Placeholder. Material's surface steps are 2 to 5 L* apart (a few hundredths of OKLab lightness). 0.02 is the low end of that |
| 4c. The three containment steps (surface, subtle, inset) are even: the larger of the two gaps is at most 2.5 times the smaller | `distance` | Placeholder, chosen with the three themes in view (their ratios are 1.9, 2.4 and 1.1) |
| 4d. The hairline (`border-slate-200`) is visible but quiet on canvas, surface, subtle and inset: between 1.1:1 and 3:1 | `contrastRatio` | Placeholder. 3:1 is where a hairline starts to be a control edge; 1.1:1 is where it stops being seen |

**Scores.** All three pass 4a. Mocha passes 4b (smallest step 0.028), 4c and 4d. Latte passes 4b (0.028), 4c (2.4, close to the cap) and 4d. thrifty-paper fails 4b (canvas to surface is 0.013) and fails 4d: its hairline is `#ece3d4`, the same colour as its inset fill, so a bordered thing on inset has no edge (1.00:1).

## 5. Text ladder

**Why a reader needs it.** Ink and muted text are how a page says "this first, that second". If they are almost the same colour the hierarchy has to come from size alone. Radix builds the ladder in: step 12 is guaranteed Lc 90 and step 11 Lc 60, a gap of 30 Lc.

**What the contracts do.** Not covered. Both ink and muted need 4.5:1 and no more.

**Measurable.** 5a. Ink (`text-slate-900`) and muted (`text-slate-500`) differ by at least 15 Lc on canvas (APCA magnitudes). Placeholder. Radix's guaranteed Lc 90 and Lc 60 steps are 30 Lc apart, but a 30 bar would fail all three shipped themes, so 15 was chosen with them in view; the OKLab lightness gap is reported beside it, not barred, because it does not track Lc (see the scores).

**Scores.** Mocha 23.8 Lc (OKLab L gap 0.128), pass. thrifty-paper 24.4 Lc (0.286), pass. Latte 7.9 Lc (0.068), fail: its `text-slate-900`, 700, 600, 500 and 400 resolve to `#4c4f69`, `#5c5f77`, `#5c5f77`, `#616277` and `#64677d`, a lightness spread of 0.084 across five names. The Catppuccin style guide gives Text, Subtext 1 and Subtext 0 for this job; the theme has used them close together. thrifty-paper maps `text-slate-500` and `text-slate-400` to the same colour (`#6b6259`), so it has three levels, not four.

## 6. Harmony

**Why a reader needs it.** A palette whose colours are chosen by eye drifts: one status brighter than the rest, a grey that is warm in one place and cool in another. Ottosson and Evil Martians give the reason to measure in OKLab and OKLCH: their lightness and chroma follow what the eye sees, where HSL does not. Material builds a palette by tone (same tone, same lightness) for the same reason. Radix says to tint the greys toward the accent.

**What the contracts do.** Not covered.

**Measurable.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 6a. Neutral hue coherence. Every neutral with OKLCH chroma of 0.01 or more (the page surfaces, line, edge and the four ink steps) has a hue within 15 degrees of the mean hue of those neutrals; or none has chroma of 0.01 | OKLCH | Derived (Radix: tint the greys one way). The 15 degrees is a placeholder |
| 6b. The six tone inks (`text-*-700` of accent, positive, warn, danger, info, sky) share a lightness band: their OKLab L spans at most 0.20 | OKLab L | Placeholder. Material's tone idea gives the principle, not the width |
| 6c. Hue order. Danger, warn and positive inks run in that order around the hue circle, each at least 25 degrees from the next | OKLCH hue | Derived (the Catppuccin style guide: red errors, yellow warnings, green success). The 25 degrees is a placeholder |

**Scores.** All three pass 6a (largest deviation 6, 11 and 11 degrees), 6b (spans 0.164, 0.036 and 0.178) and 6c (hues 3, 87, 143 for Mocha; 20, 66, 142 for Latte; 21, 49, 166 for thrifty-paper; the closest pair is thrifty-paper's danger and warn at 28 degrees).

**Report, not pass or fail.** The neutral tint against the accent hue, after Radix's advice: Mocha neutrals at 278 degrees and accent at 305 (27 apart); Latte 276 and 297 (21); thrifty-paper 74 and 37 (37). All are analogous. **Taste. The panel asks:** "Do the greys and the accent look like one family, or did the greys come from somewhere else?"

## 7. Semantic clarity

**Why a reader needs it.** A status colour is a message: this saved, this needs care, this failed. If two statuses, or a status and the accent, read as one colour, the message is lost. About 1 in 12 men and 1 in 200 women have a colour vision deficiency, so "apart" must also hold for them. Atlassian: "Don't use an accent when the color has semantic meaning". Datawrapper: palettes that differ in lightness stay distinguishable for readers with a deficiency.

**What the contracts do.** Partly covered. The distinction contract holds two pairs in all: one pair of fills (`bg-violet-600` against `bg-red-600`, 0.12) and one pair of inks (`text-violet-600` against `text-red-700`, 0.09). Of the ten ink pairs among the five status roles, that is one; 7a measures the other nine and moves the link side of that one from `-600` to `-700` (the same colour in all three themes). Nothing is simulated for CVD.

**Measurable.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 7a. The five inks (`text-*-700` of accent, positive, warn, danger, info) are pairwise at least 0.09 apart in OKLab | `distance` | Placeholder carried over from the existing contract's ink bar. Sky is left out: it is a presentational role (links and code attributes), not a status |
| 7b. The three fills (accent, positive, danger, `bg-*-600`) are pairwise at least 0.12 apart | `distance` | Placeholder carried over from the existing fill bar |
| 7c. Seven pairs a reader meets together, read under protan, deutan and tritan simulation, are at least 0.05 apart: four ink pairs (positive and danger, warn and danger, positive and warn, accent and danger) and three fill pairs (accent and positive, accent and danger, positive and danger) | Machado matrices at severity 1.0, then `distance` | Placeholder. No source gives a number; 0.05 was chosen as about half the existing 0.09 bar, because the simulation removes most of the hue difference and lightness has to carry the rest |

**Scores.** Mocha passes 7a by the smallest margin possible (accent and info are 0.0905) and 7b (smallest 0.125, accent and danger). Latte passes both with room (smallest 0.139 and 0.309). thrifty-paper fails 7a: its info colour is teal (`#0f766e`, hue 186) and its positive is green (`#047857`, hue 166), 0.039 apart; it passes 7b (smallest 0.186). On 7c, Mocha fails one cell (positive and warn under protan, 0.029). Latte fails five of the 21 cells (inks: positive and danger under deutan 0.035; warn and danger under deutan 0.016; positive and warn under protan 0.043 and deutan 0.026; fills: positive and danger under deutan 0.016). Mocha's fills pass (smallest 0.107). thrifty-paper passes all (smallest 0.079, positive and warn inks under protan), because its danger is a dark wine (OKLab L 0.377 against 0.508 for its green) and lightness carries the pair. Latte's red and green are the same lightness (0.515 and 0.495), and under deutan simulation they collapse. Each pair of numbers is in Appendix B.

## 8. Restraint

**Why a reader needs it.** Colour is a signal because most of the page does not have any. Apple: "Use color sparingly". Carbon: "Additional colors are used sparingly and purposefully". Radix warns: "be careful when using saturated grays for your app background, especially in dark mode".

**What the contracts do.** Not covered.

**Measurable.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 8a. The big areas (canvas, surface, subtle, inset) have OKLCH chroma of at most 0.04 | OKLCH | Placeholder; Radix gives the caution, not the number |
| 8b. The status tints (`bg-*-50`) have chroma of at most 0.05 | OKLCH | Placeholder |
| 8c. The tone inks have chroma of at most 0.20 | OKLCH | Placeholder, chosen so that a neon accent fails |

**Scores.** All three pass 8a (Mocha 0.033 at most) and 8b (Mocha 0.044 at most). Latte fails 8c: its accent ink is `#8035e1` with chroma 0.239, and its danger ink (0.201) is also just over; info (0.197) is just under. The 0.20 cap is a placeholder set between Latte's own inks, so it is a line drawn through that theme; read it as "Latte is the loudest", not as a sourced limit. Mocha's largest is 0.130 and thrifty-paper's 0.146.

**Taste. The panel asks:** "Squint at a typical page. Is the accent the loudest thing on it, and is there one loud thing, or four?"

## 9. State consistency

**Why a reader needs it.** Hover, pressed, selected, focus and disabled are how a person knows a control answers them. If hover on the primary button goes darker and hover on the danger button goes teal, people stop trusting the signal. Atlassian: "Pair selected colors with another visual cue".

**What the contracts do.** Partly covered. The focus ring is held to 3:1 on canvas, surface and subtle. The hover fills (`hover:bg-*-700`) are held for their label contrast. Nothing checks that hovers agree with one another, and the ring is not checked on inset or on the tinted `-50` surfaces.

**Measurable.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 9a. The hover fills of accent, positive and danger (`bg-X-600` to `hover:bg-X-700`) each move lightness the same way, by between 0.02 and 0.10 in OKLab L, and keep their hue within 15 degrees | OKLCH | Placeholder. The principle is that hover is the same colour, adjusted |
| 9b. The accent focus ring is at least 3:1 on canvas, surface, subtle, inset and the five tinted surfaces | `contrastRatio` | Sourced (WCAG 1.4.11; Carbon) |

**Scores.** thrifty-paper passes 9a: all three hovers darken by 0.059 to 0.084 and the hue moves 1 degree at most. Mocha fails 9a: the positive hover is lightness 0.001 away and 40 degrees round the hue circle (green `#a6e3a1` to teal `#94e2d5`), and the accent hover moves 27 degrees (mauve to lavender). Latte fails 9a: positive moves 61 degrees (green `#338621` to teal `#178289`) and 0.006 in lightness, and accent 23 degrees (violet to blue). Both Catppuccin themes took their hover from a neighbouring named palette colour. All three pass 9b (smallest: Mocha 5.25, Latte 4.09, thrifty-paper 4.07).

**Taste. The panel asks:** "Tab through a form, hover each button, press one, select a row, disable a field. Is each state recognisable without reading its label, and does the same state look the same on every control?"

## 10. Data and code

**Why a reader needs it.** Charts and code blocks are where a theme meets the densest colour use. A chart's series must be told apart. Syntax colours must be readable and must not shout. Carbon curates its categorical sequence "to maximize contrast between neighboring colors". Datawrapper: "If you need more than seven colors in a chart, consider using another chart type".

**What the library uses today.** `StackedBar` has seven series tones: `text-slate-500`, `text-blue-700`, `text-emerald-700`, `text-amber-700`, `text-red-700`, `text-neutral-500` and `text-purple-700`. `CodeText` has seven syntax inks: comment `text-slate-500`, keyword `text-violet-700`, tag `text-red-700`, attribute `text-sky-700`, string `text-emerald-700`, number `text-amber-700` and function `text-blue-700`, on the `bg-slate-50` of `CodeBlock`. There is no sequential (ordered) colour scale in the library.

**What the contracts do.** Partly covered. Chart colour is held to 3:1 (the `viz` role lists two utilities; the others are checked as tone text). Syntax inks are held to 4.5:1 as tone text and ink. Whether the series differ from each other is not measured.

**Measurable.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 10a. The seven series tones are pairwise at least 0.09 apart | `distance` | Placeholder, from the ink bar |
| 10b. The seven syntax inks are pairwise at least 0.06 apart | `distance` | Placeholder. Lower than 10a because a token is also told by its position and its shape, and a chart segment is told by little else |
| 10c. Syntax inks reach 4.5:1 on `bg-slate-50` (already covered); report the lowest Lc | `contrastRatio`, APCA | Covered; Lc is advisory |

**Scores.** 10a: Latte passes (smallest 0.117). Mocha fails (0.075, `text-slate-500` against `text-blue-700`). thrifty-paper fails (0.039, blue-700, which is teal there, against emerald-700). 10b: Mocha passes (0.075) and Latte passes (0.086). thrifty-paper fails (0.039). 10c: Mocha 5.43:1 (lowest Lc 50.8), Latte 4.77:1 (Lc 65.6), thrifty-paper 4.50:1, exactly at the bar (Lc 66.6).

**Under CVD.** The smallest pair across the seven series, per theme, is Mocha 0.012 (protan; blue and purple), Latte 0.016 (deutan; amber and red) and thrifty-paper 0.004 (deutan; slate and emerald). All three fall under 0.05. That is expected of seven hue-coded series, and is why the answer is a component rule, not a theme bar: a chart that must be read under CVD labels its series (criterion 15, colour is not the only signal). `StackedBar` does so in part (read from `StackedBar.tsx`): every segment carries a `label` and the bar's `aria-label` speaks them, so a screen reader gets the series, but the visible `Legend` is opt-in (`legend` defaults to false), so a sighted reader with a colour vision deficiency gets the labels only where the consumer turns it on.

**Taste. The panel asks:** "Open a code block and a stacked bar. Is the code calm, with the comment quieter than the code and nothing neon? Can you tell every bar segment from its neighbours without the legend?" And, if a sequential scale is ever added: Carbon discourages "Multiple gradients", so there is one, and lightness runs one way.

## 11. Comfort over time

**Why a reader needs it.** A theme is looked at for hours. Three separate things tire: glare (criterion 2), pure saturated opposite hues side by side, and a dark theme that is too dim or too sharp. Cauquil et al. report that "ocular chromatic aberrations usually make red appear closer to the viewer than blue"; Ozolinsh and Muizniece measure the colour difference at which this appears on flat displays. Buchner and Baumgartner found that "colour contrast (red text on green background) could not compensate for a lack of luminance contrast".

**What the contracts do.** Not covered.

**Measurable, one guard.** 11a. No label, ink or fill pair that appears together has both colours at OKLCH chroma 0.12 or more, hues 150 degrees or more apart, and lightness within 0.25 of each other. Placeholder; the papers give the effect, not a cut-off. **No shipped theme trips it.** The pairs that appear (a near-white or near-black label on a fill; a tone ink on its tint, whose chroma is 0.044 or less) cannot. The guard is there for a future theme that puts a saturated ink on a saturated fill. It is weak, and the panel's question is the real test.

**Taste. The panel asks:** "Use it for two minutes of reading. Do any two colours seem to shimmer where they meet? Is the dark theme comfortable in a dim room?"

## 12. Light and dark

**Why a reader needs it.** Apple: dark-mode colours "aren't necessarily inversions of their light counterparts". Surfaces lift in a dark theme and fall in a light one (criterion 4). NN/g adds that "in users with normal vision, light mode leads to better performance most of the time" while dark helps some readers, so a site that offers both serves more people. Atlassian: "Using symmetry is a great place to start", and flips each tone ("700 in light theme ... 400 in dark theme"). Schoonover keeps lightness differences symmetric between his two modes.

**What the contracts do.** Not covered. A dark theme must declare `@custom-variant dark`; nothing else about polarity is checked.

**Measurable.**

| Bar | Method | Kind of bar |
| --- | --- | --- |
| 12a. A dark theme's surfaces lift (criterion 4a) | OKLab L | Sourced |
| 12b. If a theme ships as a light and dark pair: accent hue within 15 degrees, status hues (positive, warn, danger, info) each within 25 degrees, neutral tint hue within 20 degrees, and the hue order of criterion 6c kept | OKLCH | Placeholder, see "Open question: light and dark pair" |

**Scores.** Mocha passes 12a. Reported, no bar: Mocha's five status inks (accent, positive, warn, danger, info) carry 0.62 of Latte's mean chroma, so the dark theme is quieter, as Apple would expect; the ink to canvas lightness gap is 0.66 in Mocha, 0.52 in Latte and 0.77 in thrifty-paper, so the two light themes are not equally symmetric with Mocha.

**Taste. The panel asks:** "Put the dark theme next to the light one. Does it look like the same brand in another light, or like the first theme with its colours flipped?"

## 13. Character

**Why a reader needs it.** The library fixes the look so agents reliably build good looking sites. A near-copy of an existing theme adds a maintenance cost and no choice. No source here gives a number; this is a project decision.

**What the contracts do.** Not covered.

**Measurable.** 13a. Against each existing theme of the same polarity, the mean OKLab distance over thirteen roles (canvas, surface, subtle, inset, hairline, ink, muted, accent fill, and the accent, positive, warn, danger and info inks) is at least 0.10, and at most three roles are closer than 0.03. Placeholder. **It rests on one data point**: Latte against thrifty-paper is the only same-polarity pair we have (mean distance 0.121, one role within 0.03), and the two light themes' shared near-white neutrals set the floor. The dark and light pairs are 0.435 (Mocha and Latte) and 0.480 (Mocha and thrifty-paper). The next theme will make the bar more meaningful.

**Taste. The panel asks:** "Describe the mood in three words. Are they words you would not use for an existing theme?"

## 14. The user base

**Why a reader needs it.** A theme is judged for people, not for a spec. The libraries serve two groups, and a theme that suits one and fails the other is not good.

- **Developers reading documentation.** Long sessions, code blocks, small monospace type, often in a dim room, often on a dark theme. They need comfort over time (criterion 11), calm syntax colour (10) and a dark theme that is not harsh (2, 12).
- **People using small business apps.** Forms, tables of figures, status badges, money. A wide age range, mixed screens, and a real share with a colour vision deficiency (1 in 12 men). They need clear ink on every surface (1), status that survives CVD (7), and state they can tell without reading (9).

**Taste. This is the panel's first question, asked before any other:** "Is this theme good for a developer reading docs for an hour, and for a clerk working a table of invoices on an older screen? If it is only good for one, say which, and fail it."

## 15. What the sources add

These were not in the brief. They came out of the reading.

- **Colour is not the only signal.** Apple, Atlassian and WCAG 1.4.1 all say it. It is mostly a component rule (status text or an icon beside the colour; chart series labelled), not a theme bar, so it belongs in component review. **Taste. The panel asks:** "Cover the colours with your hand. Is the meaning of every status, chart and selected row still readable?" WCAG 1.4.1 adds that a light green and a dark red can pass by lightness alone, which is what thrifty-paper's wine danger does and Latte's does not.
- **Contrast levels.** Primer ships a default level (text 4.5, border 3) and a high-contrast level (text 7, border 4.5) as separate themes; Material defines contrast levels -1.0, 0.0, 0.5 and 1.0; Apple asks for "increased-contrast variants". Our themes are all at the default level; none meets the high level for edges (neutral control edge on subtle: Mocha 3.40, Latte 3.00, thrifty-paper 3.04). Recommended as a later piece of work, not a bar on a new theme.
- **Colour blind sibling themes.** Primer ships tritanopia and colour-blind variants. What exactly they change was not confirmed from a primary page (see "What was not verified"), so this is a pointer, not a recommendation.
- **Symmetry.** Atlassian and Solarized. Folded into criterion 12.

## Score table

Every measurable criterion, for every shipped theme. **P** is pass, **F** is fail, **n/a** does not apply. The number is the worst case the bar looks at. The colours behind each number are in Appendix A; the pair by pair CVD numbers are in Appendix B.

| Criterion and bar | Mocha (dark) | Latte (light) | thrifty-paper (light) |
| --- | --- | --- | --- |
| 1a. Ink at least 7:1 on canvas, surface, subtle | P, 8.69 | F, 6.57 | P, 15.68 |
| 1b. Ink at least Lc 75 on the same three (advisory) | P, Lc 76.1 | F, Lc 74.6 | P, Lc 96.9 |
| 1c. Muted at least Lc 60 (advisory) | F, Lc 52.3 | P, Lc 66.7 | P, Lc 72.4 |
| 2a. Dark ink at most Lc 90 | P, Lc 80.8 | n/a | n/a |
| 2b. Canvas and ink not pure black or white | P | P | P |
| 4a. Surface order | P | P | P |
| 4b. Adjacent surface steps at least 0.02 | P, 0.028 | P, 0.028 | F, 0.013 |
| 4c. Containment steps even, at most 2.5 | P, 1.9 | P, 2.4 | P, 1.1 |
| 4d. Hairline between 1.1:1 and 3:1 on four surfaces | P, 1.17 to 1.92 | P, 1.17 to 1.54 | F, 1.00 on inset |
| 5a. Ink and muted at least 15 Lc apart on canvas | P, 23.8 | F, 7.9 | P, 24.4 |
| 6a. Neutral hue within 15 degrees of its mean | P, 6 | P, 11 | P, 11 |
| 6b. Tone ink lightness span at most 0.20 | P, 0.164 | P, 0.036 | P, 0.178 |
| 6c. Danger, warn, positive hue order, 25 degrees apart | P, 3, 87, 143 | P, 20, 66, 142 | P, 21, 49, 166 |
| 7a. Five status inks pairwise at least 0.09 | P, 0.0905 | P, 0.139 | F, 0.039 |
| 7b. Three fills pairwise at least 0.12 | P, 0.125 | P, 0.309 | P, 0.186 |
| 7c. Traffic light ink and fill pairs under CVD at least 0.05 | F, 0.029 (1 cell) | F, 0.016 (5 cells) | P, 0.079 |
| 8a. Surface chroma at most 0.04 | P, 0.033 | P, 0.012 | P, 0.022 |
| 8b. Tint chroma at most 0.05 | P, 0.044 | P, 0.015 | P, 0.021 |
| 8c. Tone ink chroma at most 0.20 | P, 0.130 | F, 0.239 | P, 0.146 |
| 9a. Hover direction, size and hue | F, 27 and 40 degrees | F, 23 and 61 degrees | P |
| 9b. Focus ring at least 3:1 on every surface and tint | P, 5.25 | P, 4.09 | P, 4.07 |
| 10a. Seven series pairwise at least 0.09 | F, 0.075 | P, 0.117 | F, 0.039 |
| 10b. Seven syntax inks pairwise at least 0.06 | P, 0.075 | P, 0.086 | F, 0.039 |
| 10c. Syntax ink at least 4.5:1 (covered) | P, 5.43 | P, 4.77 | P, 4.50 |
| 11a. Vibration guard | P | P | P |
| 12a. Dark surfaces lift | P | n/a | n/a |
| 13a. Distance from same-polarity themes | n/a | P, 0.121 (one close role) | P, 0.121 (one close role) |

**What each theme gets right, and where it would fail.**

- **Catppuccin Mocha** gets the dark theme right: surfaces lift in even steps, the neutrals share one cool tint, ink is soft (Lc 81 at most, never pure white), status colours are well apart in normal vision and its fills clear the existing 0.12 bar. It would fail on muted text (Lc 52 to 57), on a hover that turns green into teal, on positive and warn under protan simulation, on the series (slate and blue only 0.075 apart), and on accent against info, which passes the 0.09 bar by 0.0005.
- **Catppuccin Latte** gets the pastel light look and a calm lightness band right: its tones all sit at the same lightness, and its hairlines and surfaces are tidy. It would fail on contrast (ink only 6.0 to 8.0:1, Lc 69 to 88), on its text ladder (five ink names inside 0.084 of lightness), on saturation (accent chroma 0.239), and above all on CVD: its red and green are equally light, so under deutan simulation they are 0.016 apart as fills.
- **thrifty-paper** gets contrast, the text ladder, the hover and the CVD pairs right: the strongest ink, a wine danger lighter and darker than its green, hovers that all darken by the same amount. It would fail on its surfaces (the white card on `#fdfbf7` is only 0.013 apart, and its hairline vanishes on inset), and on two status pairs: info is teal and sits 0.039 from the green, which also makes its chart and syntax palettes collapse.

## Open question: does APCA earn a place beside WCAG 2?

**Recommendation: yes, as an advisory second measure, never as a gate, apart from the dark-theme ceiling.** Reasons:

1. **WCAG 2 is blind where we need to look.** It cannot tell light text on a dark ground from dark on light. In our own data, Mocha's muted text on canvas is 7.89:1 and Latte's is 5.27:1, yet APCA scores them Lc 57 and Lc 71. Anyone judging by the ratio alone would pick the wrong one. The APCA authors say it directly: "WCAG 2.x contrast cannot provide useful guidance when designing 'dark mode'".
2. **It gives a ladder and a ceiling.** Radix guarantees steps 11 and 12 at Lc 60 and Lc 90. It is the only measure in the sources with a dark-theme ceiling (criterion 2a).
3. **But it is not a standard.** WCAG 3 is a "Working Draft" and "does not replace WCAG 2". The APCA pages say their opinions "may or may not reflect those of the W3 or AGWG". The dark-mode ceiling is marked "preliminary" and the two APCA pages word it differently. A hard gate on a number that may change would force theme rewrites when it does.
4. **Cost is low.** The function is a dozen lines and needs no dependency.

So: compute Lc beside the ratio in the third contract, fail on the ratio (1a), fail on 2a alone among the Lc figures (WCAG 2 has no ceiling, and the figure is preliminary, so treat a 2a miss as a question for the panel until the source firms it up), and print the Lc for the rest (1b, 1c, 5a). Revisit when WCAG 3 names its contrast method. I did not re-read the WCAG 3 contrast section in this session and so cannot say what it currently proposes.

## Open question: should a new theme be a light and dark pair?

**Recommendation: yes, require it, with the pairing test of 12b, and let the maintainers decide.** Reasons:

1. **The site already assumes a pair.** `apps/hack-cove-site/src/content/colourSchemes.ts` takes the dark scheme from the theme scoped `.dark` and the light scheme as "the last light theme by id", and the colour scheme toggle swaps them. That pairs thrifty-paper with Mocha today, and the numbers say they are not a pair: accent hues 93 degrees apart (orange against mauve), status hues up to 73 degrees apart, neutral tints 156 degrees apart (warm against cool). Latte and Mocha are a pair by the same test: accent 8 degrees, status 21 degrees, neutral tint 2 degrees. So the site's present light and dark are two themes sharing a toggle.
2. **Readers need both.** NN/g: light is better for most people with normal vision, dark helps some, and ageing eyes suffer more glare. A developer in a dim room and a clerk in an office both need to be served.
3. **Against.** Carbon calls dark mode "highly encouraged", not required, and a pair doubles the work and the review. A single-polarity theme is still worth having where there is a real brand reason.
4. **The cost of the rule is small if it is a test.** 12b is six hue checks (accent, four status hues, neutral tint) and the hue order. A theme file would be tested against its declared partner.

The pairing numbers are placeholders chosen here; the thing to decide is whether a pair is required, not whether 15 or 20 degrees is right.

## What was not verified

- **Material 3 and Material 2 pages** were not readable. Their tone to contrast figures and the dark-theme `#121212` and 15.8:1 figure were not confirmed and are not cited. The surface tone steps and contrast levels come from the source repositories.
- **What Primer's colour blind themes change** (a red and green swap was assumed) was not confirmed from a primary page. Only the theme names and contrast config were.
- **The Okabe and Ito palette values** were not confirmed from the page and are not used.
- **WCAG 3's contrast method** was not re-read. This file does not say what it proposes.
- **No source gave a numeric ceiling for too much contrast in a light theme.** A claim that very high contrast causes halation for people with astigmatism was looked for and not found in a primary source.
- **Hanenberg's syntax highlighting study** and the Piepenbrock 2013 paper on polarity were not read.
- **All the 'placeholder' bars** were not tested on real readers. They separate the shipped themes sensibly; that is all that has been shown.
- **CVD simulation** is a model at severity 1.0, not a test with people.

## Appendix A. The colours behind the scores

Each cell is the colour the theme gives the utility, after compositing any alpha over the white surface. A theme sets a role by remapping a stock Tailwind utility, so the rows are named by utility.

| Role | Utility | Mocha | Latte | thrifty-paper |
| --- | --- | --- | --- | --- |
| canvas | `bg-gray-50` | `#181825` | `#eff1f5` | `#fdfbf7` |
| surface | `bg-white` | `#1e1e2e` | `#ffffff` | `#ffffff` |
| subtle | `bg-slate-50` | `#313244` | `#e6e9ef` | `#f7f2e9` |
| inset | `bg-slate-100` | `#3b3d50` | `#dce0e8` | `#ece3d4` |
| hairline | `border-slate-200` | `#45475a` | `#ccd0da` | `#ece3d4` |
| control edge | `border-slate-300` | `#7f849c` | `#828597` | `#948a7c` |
| ink | `text-slate-900` | `#cdd6f4` | `#4c4f69` | `#1c1917` |
| ink, second | `text-slate-700` | `#bac2de` | `#5c5f77` | `#3b342e` |
| muted | `text-slate-500` | `#a6adc8` | `#616277` | `#6b6259` |
| faint | `text-slate-400` | `#969cb5` | `#64677d` | `#6b6259` |
| accent fill | `bg-violet-600` | `#cba6f7` | `#8839ef` | `#c2410c` |
| accent hover | `hover:bg-violet-700` | `#b4befe` | `#5e6dd1` | `#9a3412` |
| accent ink | `text-violet-700` | `#cba6f7` | `#8035e1` | `#9a3412` |
| accent label | `text-violet-50` | `#11111b` | `#ffffff` | `#ffffff` |
| accent tint | `bg-violet-50` | `#36314a` | `#f8f3fe` | `#fdf5f0` |
| positive fill | `bg-emerald-600` | `#a6e3a1` | `#338621` | `#047857` |
| positive hover | `hover:bg-emerald-700` | `#94e2d5` | `#178289` | `#065f46` |
| positive ink | `text-emerald-700` | `#a6e3a1` | `#2a7421` | `#047857` |
| positive tint | `bg-emerald-50` | `#30383d` | `#f4f9f2` | `#ecfdf5` |
| warn ink | `text-amber-700` | `#f9e2af` | `#8c591d` | `#b45309` |
| warn tint | `bg-amber-50` | `#3a373f` | `#fdf8f1` | `#fffbeb` |
| danger fill | `bg-red-600` | `#f38ba8` | `#d20f39` | `#7a1220` |
| danger hover | `hover:bg-red-700` | `#eba0ac` | `#d43f4d` | `#5f0e1a` |
| danger ink | `text-red-700` | `#f38ba8` | `#c00f33` | `#7a1220` |
| danger tint | `bg-red-50` | `#33293a` | `#fcf1f3` | `#fdf2f4` |
| info ink | `text-blue-700` | `#89b4fa` | `#1e5bd4` | `#0f766e` |
| info tint | `bg-blue-50` | `#2c3249` | `#f2f6fe` | `#f0fdfa` |
| sky ink | `text-sky-700` | `#89dceb` | `#046b96` | `#1e6a8f` |
| sky tint | `bg-sky-50` | `#2c3747` | `#f0fafd` | `#eff6fa` |
| chart neutral | `text-neutral-500` | `#7f849c` | `#828597` | `#8f857b` |
| chart purple | `text-purple-700` | `#cba6f7` | `#8839ef` | `#7e3fb0` |

Note that the role names and the colours disagree by design: `violet` is the accent, `blue` is info, and each theme chooses what those mean (thrifty-paper's accent is burnt orange and its info is teal).

**Computed values worth re-checking.**

| Value | Mocha | Latte | thrifty-paper |
| --- | --- | --- | --- |
| Ink on canvas, WCAG / Lc | 12.14 / -80.8 | 7.06 / 79.3 | 16.92 / 102.0 |
| Ink on surface | 11.34 / -80.0 | 7.99 / 87.7 | 17.49 / 104.3 |
| Ink on subtle | 8.69 / -76.1 | 6.57 / 74.6 | 15.68 / 96.9 |
| Ink on inset | 7.37 / -72.8 | 6.04 / 69.3 | 13.74 / 88.4 |
| Muted on canvas | 7.89 / -57.0 | 5.27 / 71.4 | 5.78 / 77.6 |
| Muted on subtle | 5.65 / -52.3 | 4.90 / 66.7 | 5.36 / 72.4 |
| Surface OKLab L: canvas, surface, subtle, inset | 0.216, 0.243, 0.324, 0.366 | 0.958, 1.000, 0.933, 0.906 | 0.989, 1.000, 0.963, 0.919 |
| Adjacent step distances | 0.028, 0.081, 0.042 | 0.043, 0.067, 0.028 | 0.013, 0.040, 0.045 |
| Hairline on canvas, surface, subtle, inset | 1.92, 1.80, 1.38, 1.17 | 1.37, 1.54, 1.27, 1.17 | 1.23, 1.27, 1.14, 1.00 |
| Tone ink L, C, h: accent | 0.787, 0.119, 305 | 0.530, 0.239, 297 | 0.470, 0.143, 37 |
| positive | 0.858, 0.109, 143 | 0.495, 0.138, 142 | 0.508, 0.105, 166 |
| warn | 0.919, 0.070, 87 | 0.510, 0.099, 66 | 0.555, 0.146, 49 |
| danger | 0.756, 0.130, 3 | 0.515, 0.201, 20 | 0.377, 0.137, 21 |
| info | 0.766, 0.111, 260 | 0.510, 0.197, 262 | 0.511, 0.086, 186 |
| sky | 0.847, 0.083, 210 | 0.499, 0.105, 235 | 0.497, 0.092, 235 |
| Hover, accent / positive / danger: change in L, hue moved | +0.029, 27 / +0.001, 40 / +0.026, 6 | +0.018, 23 / +0.006, 61 / +0.038, 0 | -0.084, 1 / -0.076, 1 / -0.059, 1 |

**How to re-check by hand.**

- *WCAG ratio.* Linearise each channel (`c/255`, then `((c+0.055)/1.055)^2.4` if above 0.04045, else `c/12.92`); luminance is `0.2126 R + 0.7152 G + 0.0722 B`; the ratio is `(L1 + 0.05) / (L2 + 0.05)`, lighter first. Mocha ink `#cdd6f4` on canvas `#181825` gives 12.14.
- *APCA Lc.* Luminance `Y = 0.2126729 R^2.4 + 0.7151522 G^2.4 + 0.0721750 B^2.4` on `c/255`; below 0.022, add `(0.022 - Y)^1.414`. For dark text on a lighter ground: `(Ybg^0.56 - Ytxt^0.57) * 1.14`. For light text on a darker ground: `(Ybg^0.65 - Ytxt^0.62) * 1.14`. Drop the result to zero if its magnitude is under 0.1; otherwise subtract (or add, for light on dark) 0.027 and multiply by 100.
- *OKLab, OKLCH, distance.* `oklab()` in `colour.ts` (Ottosson's matrices). Chroma is `sqrt(a^2 + b^2)`; hue is `atan2(b, a)` in degrees; the distance is the straight line distance between two (L, a, b) points.
- *CVD.* Linearise as above, multiply the (R, G, B) vector by the Machado 1.0 matrix, convert back to gamma, then measure. Matrices (row by row): protan `[0.152286, 1.052583, -0.204868]`, `[0.114503, 0.786281, 0.099216]`, `[-0.003882, -0.048116, 1.051998]`; deutan `[0.367322, 0.860646, -0.227968]`, `[0.280085, 0.672501, 0.047413]`, `[-0.011820, 0.042940, 0.968881]`; tritan `[1.255528, -0.076749, -0.178779]`, `[-0.078411, 0.930809, 0.147602]`, `[0.004733, 0.691367, 0.303900]`. The source page labels the third matrix "Tritanomaly"; it was read here as tritan at severity 1.0.

## Appendix B. Status inks under simulation

OKLab distance between each pair of tone inks, normal vision then protan, deutan and tritan. A value in **bold** is under the bar: 0.09 in the normal vision column, 0.05 under simulation. Bold is shown for every row, but only the rows named in 7a and 7c count toward a bar.

**Mocha**

| Pair | Normal | Protan | Deutan | Tritan |
| --- | --- | --- | --- | --- |
| accent and positive | 0.236 | 0.210 | 0.174 | 0.119 |
| accent and warn | 0.223 | 0.219 | 0.219 | 0.138 |
| accent and danger | 0.125 | 0.117 | 0.113 | 0.134 |
| accent and info | 0.090 | **0.012** | **0.032** | 0.119 |
| positive and warn | 0.110 | **0.029** | 0.066 | 0.121 |
| positive and danger | 0.247 | 0.200 | 0.107 | 0.239 |
| positive and info | 0.209 | 0.202 | 0.203 | 0.107 |
| warn and danger | 0.216 | 0.222 | 0.172 | 0.196 |
| warn and info | 0.237 | 0.210 | 0.251 | 0.209 |
| danger and info | 0.189 | 0.123 | 0.131 | 0.246 |
| info and sky | 0.117 | 0.116 | 0.108 | 0.087 |

**Latte**

| Pair | Normal | Protan | Deutan | Tritan |
| --- | --- | --- | --- | --- |
| accent and positive | 0.371 | 0.308 | 0.283 | 0.116 |
| accent and warn | 0.312 | 0.305 | 0.295 | 0.122 |
| accent and danger | 0.293 | 0.281 | 0.287 | 0.239 |
| accent and info | 0.139 | **0.029** | **0.024** | 0.095 |
| positive and warn | 0.150 | **0.043** | **0.026** | 0.180 |
| positive and danger | 0.298 | 0.129 | **0.035** | 0.301 |
| positive and info | 0.293 | 0.281 | 0.273 | 0.066 |
| warn and danger | 0.150 | 0.089 | **0.016** | 0.125 |
| warn and info | 0.293 | 0.279 | 0.288 | 0.196 |
| danger and info | 0.341 | 0.260 | 0.280 | 0.315 |
| info and sky | 0.114 | 0.112 | 0.105 | **0.032** |

**thrifty-paper**

| Pair | Normal | Protan | Deutan | Tritan |
| --- | --- | --- | --- | --- |
| accent and positive | 0.227 | 0.144 | 0.081 | 0.271 |
| accent and warn | 0.090 | 0.096 | 0.088 | 0.086 |
| accent and danger | 0.101 | 0.107 | 0.101 | 0.085 |
| accent and info | 0.225 | 0.160 | 0.115 | 0.272 |
| positive and warn | 0.219 | 0.079 | 0.115 | 0.267 |
| positive and danger | 0.265 | 0.234 | 0.126 | 0.276 |
| positive and info | **0.039** | **0.037** | **0.035** | **0.007** |
| warn and danger | 0.191 | 0.202 | 0.189 | 0.169 |
| warn and info | 0.221 | 0.112 | 0.146 | 0.266 |
| danger and info | 0.258 | 0.238 | 0.141 | 0.277 |
| info and sky | **0.075** | 0.070 | 0.069 | **0.019** |

Criterion 7c reads four of these rows (positive and danger, warn and danger, positive and warn, accent and danger) and the three fill pairs of the table below them. Criterion 7a reads the first ten rows of each table (the five inks) against 0.09. The info and sky row is shown because sky is held out of 7a, and it is the one thing the distinction between info and sky depends on.
