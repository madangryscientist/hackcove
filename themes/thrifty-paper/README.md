# @hackcove/theme-thrifty-paper

The Thrifty Paper light theme for Hack Cove: cream paper, ink text, clay accent. One CSS file,
`theme.css`: under `.thrifty-paper` it remaps the Tailwind slate/colour utilities that
`@hackcove/ui` is written against to Thrifty's light tokens. It also ships a `.link` class.

Status: `0.x`, published on npm. License: MIT.

## Install

```sh
bun add @hackcove/theme-thrifty-paper
# peer: tailwindcss ^4
```

## Use

In your global stylesheet, after Tailwind:

```css
@import "tailwindcss";
@import "@hackcove/theme-thrifty-paper/theme.css";
```

Put `class="thrifty-paper"` on `<html>`. The scope paints the cream canvas and the ink text; the
rules are unlayered, so they override Tailwind's layered utilities. The theme is light, so it
declares no `dark` variant.

The theme also owns the type faces: it sets `--font-sans` and `--font-mono` on the scope (Inter, then
the system stack; the mono stack starts at `ui-monospace`). It ships no font file, so Inter shows
only where the page loads or the machine has it. `AppShell` paints the canvas (`bg-gray-50`, which
the theme remaps to the cream canvas) and sets `font-sans` and the ink, so an app ships no
page-background or font CSS.

## Palette

From Thrifty's light theme. Thrifty has no danger colour, so the red utilities keep Tailwind's own.

canvas `#fdfbf7` · surface `#ffffff` · subtle `#f7f2e9` · line `#ece3d4` · ink `#1c1917` ·
ink-body `#3b342e` · ink-mute `#6b6259` · accent `#c2410c` · accent-hover `#9a3412` ·
accent-soft `#fdf5f0` · positive `#047857` / `#ecfdf5` · warn `#b45309` / `#fffbeb` ·
note `#0f766e` / `#f0fdfa`
