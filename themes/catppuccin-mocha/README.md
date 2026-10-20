# @hackcove/theme-catppuccin-mocha

The Catppuccin Mocha dark theme for Hack Cove. One CSS file, `theme.css`: it declares the
class-based `dark` variant and, under `.dark`, remaps the Tailwind slate/colour utilities that
`@hackcove/ui` is written against to real Mocha tokens. It also ships a `.link` class.

Status: `0.x`, not yet published to npm. License: undecided (see `LICENSE`).

## Install

```sh
bun add @hackcove/theme-catppuccin-mocha
# peer: tailwindcss ^4
```

## Use

In your global stylesheet, after Tailwind:

```css
@import "tailwindcss";
@import "@hackcove/theme-catppuccin-mocha/theme.css";
```

Put `class="dark"` on `<html>`. The rules are unlayered, so they override Tailwind's layered
utilities.

## Palette

base `#1e1e2e` · mantle `#181825` · crust `#11111b` · surface0 `#313244` · surface1 `#45475a` ·
surface2 `#585b70` · text `#cdd6f4` · subtext1 `#bac2de` · subtext0 `#a6adc8` · overlay1 `#7f849c` ·
green `#a6e3a1` · red `#f38ba8` · yellow `#f9e2af` · blue `#89b4fa` · mauve `#cba6f7`
