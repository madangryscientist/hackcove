# HC-192 · Native phase 0: findings

A throwaway Expo spike: it proves D2 (a token-map resolver) and D3 (a generated theme map) before
phase 1 commits to them. It lives on the `hc-192-spike` branch only. It never reaches `main` or npm.

## Result against the exit test

| Exit | Result |
| --- | --- |
| The generator maps 100% of `palette.json` for every theme | **Yes.** 75/75 for `default`, `catppuccin-mocha` and `thrifty-paper`. `scripts/coverage.test.ts` proves it, and fails on any `theme.css` declaration it drops without listing it. |
| An oklch default renders | **Yes.** The `default` map is converted from Tailwind v4's oklch palette to hex/rgba (`sheet-default.png`). |
| The native shots match Storybook by eye, in both themes | **Yes, with the differences listed below** (fonts, pixel snapping, Expo Go's overlay). |
| iOS | **Skipped.** The iOS Simulator needs a Mac (D14 is open). |

Control heights, read with `onLayout`:

| | Storybook / Expo web | Android (density 2.625) |
| --- | --- | --- |
| Button sm / md / lg | 26 / 38 / 46 | 25.90 / 38.10 / 45.71 (68 / 100 / 120 px) |
| Input sm / md | 26 / 38 | 26.29 / 38.48 (69 / 101 px) |

## Run it

The emulator is the user-space SDK at `~/Android/Sdk`, AVD `hc192`. No sudo is needed.

```bash
npm install                 # outside the bun workspace on purpose: spike/ is not in "workspaces"
bun run generate            # themes/*/theme.css (glob) + Tailwind's oklch palette → src/generated/themes.json
bun run harvest             # renders ui's own components (react-dom/server) → src/generated/tables.json
bun run test                # coverage + resolver tests (15)
npx expo start --android    # Expo Go; deep link: exp://10.0.2.2:8081/--/?theme=<name>&page=<a|b>
npx expo start --web        # http://localhost:8081/?theme=<name>&page=<a|b>
```

## What the spike changes in the plan

### D2: the resolver

1. **The resolver works, and it is small.** `resolve.ts` is 237 lines. The four components use a closed
   set of about 90 classes. An unknown class throws, so nothing renders unstyled without notice. The plan's
   estimate of about 400 lines (with tests) holds.
2. **The "no bare `flex`" rule is unnecessary.** The resolver maps `flex` to `flexDirection: row`, which
   is what CSS does, so the web tables need no `flex flex-row` rewrite. **The risk to test for instead:
   precedence.** Tailwind applies utilities in stylesheet order, not in class-string order. A resolver
   that merges in string order gets `flex-col flex` wrong. Phase 1 should merge in a fixed property
   precedence (`flex` < `flex-col`/`flex-row`), not in string order.
3. **`em` letter-spacing does not need a ban.** `tracking-*` resolves to `em × fontSize` at resolve time,
   which is exact. Remove it from D2's banned list.
4. **The resolver can split tables into box and text by itself.** It sends each property to a `box`
   (View) style or a `text` (Text) style. That stands in for CSS inheritance: a Button's `text-sm
   text-violet-50` reaches its label. Phase 1.0's plan to split every core table into `{box, text, icon}`
   by hand is mostly unnecessary. Only `icon` needs its own slot (the colour of an SVG, F6). This removes
   a chunk of the 1.0 refactor and its risk to the web's byte-identical check.
5. **The state slots work:** `hover:` → pressed (plus hovered on web), `focus-visible:` → focused,
   `disabled:` → disabled, `placeholder:` → `placeholderTextColor`.
   - The web-only classes have to be listed and dropped: `transition`, `cursor-*`, `scroll-mt-*`,
     `target:`, `[&…]`, `*:`, `relative`, `z-*`, `underline-offset-*`, `max-w-[Nch]`. Each drop is named
     in the code, so the closed set stays checkable.
6. **`inline-flex` has no RN equivalent for shrinking to content.** In RN the parent decides: a Button in
   a column Stack stretches unless the Stack sets `alignItems`. Mapping `inline-flex` to `alignSelf`
   broke row alignment (the `Edit` link sat too high), so it maps to `flexDirection: row` only. **F3 has to
   own this:** native Stack and Cluster set `alignItems` the way web flow would.

### D3: the generator

1. **A theme is more than per-utility remaps.** Mocha has a compound rule,
   `.disabled\:opacity-50:disabled:is(.bg-violet-600, .bg-emerald-600, .bg-red-600)`, which flattens a
   disabled solid Button. D3 step 3 ("for every utility, emit…") misses it. The generator emits
   `compounds: [{utility, requiresAny, style}]`, and the resolver applies them to the slot. **The
   `theme.native.json` schema needs this, and a theme test should fail on a selector the generator cannot
   express**, as the spike's `unmapped` check does.
2. **The oklch → sRGB conversion needs no dependency.** It is about 30 lines in-house; `culori` is not
   needed, even as a dev dependency. 86 of Tailwind's colours fall outside sRGB, 17 of them used by
   22 palette utilities (`bg-red-600`, `text-emerald-700`, …). They are clipped per channel (what Chromium does on an sRGB screen). On a P3 screen the web shows
   those slightly more saturated than native. That is a known, accepted difference; the parity manifest
   should record it.
3. **A font stack does not port.** `--font-sans: Inter, ui-sans-serif, …` means nothing on Android, so
   the spike sends no `fontFamily` there and gets Roboto. D3 step 5 should emit **one native family name
   per weight file**, loaded by `expo-font` (F2), not the CSS stack. A theme that wants Inter on native
   ships or names the font files.
4. **The base colour reaches text through context.** A theme's scope rule (`.thrifty-paper { color: … }`)
   has no cascade on native. The spike carries `base.color` and `base.backgroundColor` in the map, and
   `ThemeProvider` passes them on as `baseText`. This confirms F2's `TextStyleContext`.

### F2: text

- **Nested Text works for inline emphasis** (`Invoice <strong>INV-204</strong>`).
- **A border on a heading needs a wrapping View.** `SectionHeading rule` puts its border on a View
  around the Text: when a typography table carries box properties, the role renders a View. The resolver's
  box/text split drives this automatically.
- **px line heights reproduce the web exactly** on Expo web.

### F9: control heights

- **Explicit heights are not needed.** With px line heights, `padding + lineHeight + border` gives
  26/38/46 exactly on web, as CSS does. F9's premise that "RN does not derive height the same way" is
  wrong for these controls. Keep the heights in core as a **test oracle**, not as a style.
- **Android snaps to physical pixels.** At density 2.625, 38 dp is 99.75 px, which rounds to 100 px
  (Button) or 101 px (Input, a TextInput). `includeFontPadding: false` made no difference. This is
  unavoidable at fractional densities. **The native PixelSlash and metrics checks need ±1 physical px
  tolerance on sizes.**
- `hitSlop` brings every target to 44 without changing the drawn height, as D9 planned.

### D4: Expo, and the gallery

- **Current versions are well past the plan's floor.** Expo SDK 58 / RN 0.88.1 / React 19.3 are current,
  and the New Architecture is the only architecture. D4's "SDK 54+ / RN 0.81+" floor is fine, but write
  the real target into phase 1.
- **Metro does not resolve ui's `.js` specifiers to `.tsx` sources** (invariant 4). The spike sidesteps
  this by rendering ui's components through `react-dom/server` and harvesting their class strings as
  JSON. **Phase 1 must either have native consume core's built `dist/`, or give Metro a resolver for
  `.js` → `.ts(x)`.** Budget half a day for it.
- **Expo Go is enough to develop, not to capture.** Deep links (`exp://…/--/?theme=&page=`) plus
  `adb exec-out screencap` capture without driving a UI. But Expo Go draws a floating dev-tools button
  in every shot, and opens its dev menu on a cold start. **PixelSlash captures need a dev build or a
  release build of the gallery** (`expo-dev-client` or `expo run:android`). That is a 1.3/1.4 item.
- Expo Go installs itself on a `google_apis` image; no Play Store needed. The user-space SDK runs
  headless with no sudo.
- `create-expo-app` scaffolds an `AGENTS.md` ("Expo has changed — do not trust your training data").
  The spike deleted it, and the `.claude/settings.json` (it enables an `expo@claude-plugins-official` plugin) it scaffolds beside it. Phase 1 should decide whether its content belongs in the repo's own AGENTS.md
  for `packages/native`.

### Visual differences by eye (the sheets)

- **Fonts:** Roboto on Android against the system/Inter stack on web. This is the biggest visible
  difference; it goes away with F2's `expo-font`.
- **Layout:** Storybook's stories are centred in a fitted layout, while the spike lays them out at the
  phone's width, so Cards and Inputs are wider on native. Width is not a resolver difference.
- **Colours, borders, radii, shadows and disabled states** match in all three themes, including Mocha's
  flattened disabled solid Button (the compound rule).

## Effort, against the plan

- **Phase 0** was estimated at about a week; it took about a day. Most of the time went on tooling: the
  SDK, the AVD, Expo Go, and capture.
- **F1:** the 3 weeks for phase 1 look right, or slightly generous. The generator is 302 lines and the
  resolver 237, both with tests. Moving them into core and the theme packages is about 2-3 days, compound
  rules and the precedence fix included.
- **Phase 1.0** shrinks if the box/text split is automatic (point 4 under D2): no hand split of every
  table.
- **New work the plan does not list:**
  - a Metro `.js` resolver, or native consuming `dist` (½ day);
  - a gallery dev build for clean captures (1 day);
  - ±1 px tolerance in the native size metrics;
  - the compound-rule schema in `theme.native.json`;
  - native font files per theme (a decision for each theme).

## Dependencies added (this branch only)

- **Runtime:** `expo ~58.0.22`, `expo-status-bar ~58.0.4`, `react 19.3.0`, `react-dom 19.3.0`,
  `react-native 0.88.1`, `react-native-web ^0.21.4`, `@expo/metro-runtime ~58.0.16`.
- **Dev:** `@types/react ~19.3.0`, `typescript ~6.0.3`.
- **Outside the repo** (user space, no sudo):
  - the Android SDK command-line tools, emulator, platform-tools and a `google_apis` x86_64 system image
    in `~/Android/Sdk`;
  - the AVD `hc192`;
  - Temurin 17 via mise;
  - Expo Go on the emulator.
