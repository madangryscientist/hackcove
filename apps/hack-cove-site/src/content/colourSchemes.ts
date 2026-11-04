/* Which theme is the site's light scheme and which its dark one, read from the themes themselves: a
   dark theme declares `@custom-variant dark` in its theme.css. No theme is named here. With more than
   one of either, the first by folder order is used (`themeNames` is sorted). */

import { colourSchemeScript } from "@hackcove/ui-react";
import type { ColourSchemeClasses } from "@hackcove/ui-react";
import { THEMES, declaresDark, themeNames, themeScope } from "@hackcove/themes-shared";

const firstScope = (dark: boolean): string => {
  const folder = themeNames.find((name) => declaresDark(THEMES[name] ?? "") === dark);
  const scope = folder === undefined ? undefined : themeScope(THEMES[folder] ?? "");
  if (scope === undefined) {
    throw new Error(`The site needs one ${dark ? "dark" : "light"} theme in themes/*.`);
  }
  return scope;
};

/** The class each scheme puts on `<html>`: the light theme's scope class and the dark theme's. */
export const schemes: ColourSchemeClasses = { light: firstScope(false), dark: firstScope(true) };

// `colourSchemeScript` (ui) reads the stored choice, else `prefers-color-scheme`, and sets the
// `dark` class and `color-scheme` on `<html>`. It knows no light class, so this adds the light
// theme's scope class whenever `dark` is off. That needs the dark theme to be scoped under `.dark`.
if (schemes.dark !== "dark") {
  throw new Error(`The dark theme must be scoped under .dark, not .${schemes.dark}.`);
}

/**
 * The text Astro inlines in `<head>`: it puts the remembered scheme, else the system one, on
 * `<html>` before the first paint, so a visitor never sees the wrong scheme flash. The
 * `ColourSchemeToggle` island does the rest.
 */
export const colourSchemeHeadScript = `${colourSchemeScript};document.documentElement.classList.toggle(${JSON.stringify(schemes.light)},!document.documentElement.classList.contains("dark"))`;
