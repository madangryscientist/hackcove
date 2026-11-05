/* Which theme is the site's light scheme and which its dark one, read from the themes themselves.
   The ui `colourSchemeScript` puts the `dark` class on `<html>`, so the dark scheme is the theme
   scoped under `.dark`. No theme is named here. The light scheme is the last light theme by id: that
   rule has no meaning of its own, it keeps the look the site has, and a new light theme that sorts
   last would take the light scheme, so a change that adds one looks at the site. */

import { colourSchemeScript } from "@hackcove/ui-react";
import type { ColourSchemeClasses } from "@hackcove/ui-react";
import { THEMES, declaresDark, themeNames, themeScope } from "@hackcove/themes-shared";

const isDark = (name: string): boolean => declaresDark(THEMES[name] ?? "");

const scopeOf = (name: string | undefined, missing: string): string => {
  const scope = name === undefined ? undefined : themeScope(THEMES[name] ?? "");
  if (scope === undefined) throw new Error(missing);
  return scope;
};

/** The class each scheme puts on `<html>`: the light theme's scope class and the dark theme's. */
export const schemes: ColourSchemeClasses = {
  light: scopeOf(
    themeNames.findLast((name) => !isDark(name)),
    "The site needs one light theme in themes/.",
  ),
  dark: scopeOf(
    themeNames.find((name) => themeScope(THEMES[name] ?? "") === "dark"),
    'The site needs one dark theme scoped under ".dark" in themes/.',
  ),
};

// `colourSchemeScript` (ui) reads the stored choice, else `prefers-color-scheme`, and sets the
// `dark` class and `color-scheme` on `<html>`. It knows no light class, so this adds the light
// theme's scope class whenever `dark` is off. That is why the dark theme is the one scoped `.dark`.

/**
 * The text Astro inlines in `<head>`: it puts the remembered scheme, else the system one, on
 * `<html>` before the first paint, so a visitor never sees the wrong scheme flash. The
 * `ColourSchemeToggle` island does the rest.
 */
export const colourSchemeHeadScript = `${colourSchemeScript};document.documentElement.classList.toggle(${JSON.stringify(schemes.light)},!document.documentElement.classList.contains("dark"))`;

/**
 * The toggle's label, set from the scheme `<html>` is in. The server renders the toggle for dark, and
 * the head script may switch to light, so the label would otherwise name the wrong switch until the
 * island hydrates. It runs at the end of `<body>`, after the toggle (`data-colour-scheme-toggle`) is
 * in the DOM. The two labels are `ColourSchemeToggle`'s; `docs.spec` checks they still match.
 */
export const colourSchemeLabelScript = `(function(){var b=document.querySelector("[data-colour-scheme-toggle]");if(b)b.setAttribute("aria-label",document.documentElement.classList.contains(${JSON.stringify(schemes.dark)})?"Switch to light theme":"Switch to dark theme")})()`;
