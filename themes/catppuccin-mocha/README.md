# @hackcove/theme-catppuccin-mocha

The Catppuccin Mocha dark theme for Hack Cove. One CSS file, `theme.css`: it declares the
class-based `dark` variant and, under `.dark`, remaps the Tailwind slate/colour utilities that
`@hackcove/ui` is written against to real Mocha tokens. It also ships a `.link` class.

Status: `0.x`, published to npm. License: MIT.

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

## Palette and attribution

The palette is [Catppuccin](https://github.com/catppuccin/catppuccin) Mocha, © 2021 Catppuccin, used under the MIT license. The full notice ships in this package as `NOTICE`, and a one-line credit sits at the top of `theme.css`. Tailwind's build drops that comment from a consumer's bundled CSS, so an app that wants the credit visible should add its own. This package's own license (MIT, see `LICENSE`) is separate.

base `#1e1e2e` · mantle `#181825` · crust `#11111b` · surface0 `#313244` · surface1 `#45475a` ·
surface2 `#585b70` · text `#cdd6f4` · subtext1 `#bac2de` · subtext0 `#a6adc8` · overlay1 `#7f849c` ·
green `#a6e3a1` · red `#f38ba8` · yellow `#f9e2af` · blue `#89b4fa` · mauve `#cba6f7`
