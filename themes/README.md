# @hackcove/themes

The Hack Cove themes, all in one package. Each theme is one CSS file with its own scope class, and
each remaps the Tailwind slate/colour utilities that `@hackcove/ui-react` is written against to its
own tokens. Each also ships a `.link` class.

| Theme | File | Scope | |
| --- | --- | --- | --- |
| Catppuccin Mocha | `catppuccin-mocha.css` | `.dark` | dark; also declares the class-based `dark` variant |
| Catppuccin Latte | `catppuccin-latte.css` | `.latte` | light |
| Thrifty Paper | `thrifty-paper.css` | `.thrifty-paper` | light: cream paper, ink text, clay accent |

Status: `0.x`. License: MIT.

## Install

```sh
bun add @hackcove/themes
# peer: tailwindcss ^4
```

## Use

In your global stylesheet, after Tailwind, import the theme's file:

```css
@import "tailwindcss";
@import "@hackcove/themes/catppuccin-mocha.css";
```

and put its scope class on `<html>` (`class="dark"` here). Import one theme, or several and switch
the class on `<html>`; the scopes do not overlap. The rules are unlayered, so they override
Tailwind's layered utilities.

The scope paints the canvas, so the cards lift off it and the app needs no page-background rule of
its own. The theme also owns the type faces: it sets `--font-sans` and `--font-mono` on the scope
(Inter, then the system stack; the mono stack starts at `ui-monospace`). It ships no font file, so
Inter shows only where the page loads or the machine has it. `AppShell` paints the canvas
(`bg-gray-50`, which the theme remaps) and sets `font-sans` and the ink, so an app ships no
page-background or font CSS.

## How to add a theme

Add one CSS file here, `<id>.css`. Its file name is the theme's id, and the id never changes once it
has baselines. Nothing else registers it: the package's exports and `files` are globs, and Storybook,
the docs and the e2e all read this folder. `themes.test.ts` is the contract, and it reads every CSS
file here. Run it with `bunx nx run themes:test`. The repo's
[README](https://github.com/madangryscientist/hackcove#how-to-add-a-theme) has the steps.

## Palettes and attribution

### Catppuccin Mocha and Latte

The palettes are [Catppuccin](https://github.com/catppuccin/catppuccin) Mocha and Latte, © 2021 Catppuccin, used under the MIT license. The full notice ships in this package as `NOTICE`, and a one-line credit sits at the top of each CSS file. Tailwind's build drops that comment from a consumer's bundled CSS, so an app that wants the credit visible should add its own. This package's own license (MIT, see `LICENSE`) is separate.

Mocha: base `#1e1e2e` · mantle `#181825` · crust `#11111b` · surface0 `#313244` · surface1 `#45475a` ·
surface2 `#585b70` · text `#cdd6f4` · subtext1 `#bac2de` · subtext0 `#a6adc8` · overlay1 `#7f849c` ·
green `#a6e3a1` · red `#f38ba8` · yellow `#f9e2af` · blue `#89b4fa` · mauve `#cba6f7`

Latte: base `#eff1f5` · mantle `#e6e9ef` · crust `#dce0e8` · surface0 `#ccd0da` · text `#4c4f69` ·
subtext1 `#5c5f77` · subtext0 `#6c6f85` · overlay1 `#8c8fa1` · mauve `#8839ef` · red `#d20f39` ·
green `#40a02b` · yellow `#df8e1d` · blue `#1e66f5`

Latte's accents are strong on white, so its cards are white and lift off the base canvas. Where a
token alone misses the WCAG AA contrast contract (text 4.5:1, controls 3:1), `catppuccin-latte.css`
darkens it just enough, and the rule's comment names the token it started from.

### Thrifty Paper

From Thrifty's light theme. Thrifty has no danger colour of its own, so the red utilities map to a
matching red (danger `#b91c1c`, danger-hover `#991b1b`, danger-soft `#fef2f2`).

canvas `#fdfbf7` · surface `#ffffff` · subtle `#f7f2e9` · line `#ece3d4` · ink `#1c1917` ·
ink-body `#3b342e` · ink-mute `#6b6259` · accent `#c2410c` · accent-hover `#9a3412` ·
accent-soft `#fdf5f0` · positive `#047857` / `#ecfdf5` · warn `#b45309` / `#fffbeb` ·
note `#0f766e` / `#f0fdfa`
