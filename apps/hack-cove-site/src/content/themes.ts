/* The themes the /ui/ page lists, read from the repo's `themes/` package at build time: one per CSS
   file. No theme is named here: a new CSS file there shows up on the next build. */

import { THEMES, themeNames, themeScope } from "@hackcove/themes-shared";

export type Theme = {
  /** The theme's id: its file name without `.css`. */
  id: string;
  /** What a consumer imports. */
  specifier: string;
  /** The id as a title. */
  title: string;
  /** The class that goes on `<html>`: the first top-level class rule in the theme's CSS file. */
  scopeClass: string;
};

const titleOf = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const themes: Theme[] = themeNames.map((id) => ({
  id,
  specifier: `@hackcove/themes/${id}.css`,
  title: titleOf(id),
  scopeClass: themeScope(THEMES[id] ?? "") ?? "",
}));
