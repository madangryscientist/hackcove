import { SCOPES, themeNames } from "@hackcove/themes-shared";
import { THEME_KEY } from "./themeKey.js";

/** The folder whose scope class is `scope` (the one the page ships with), or the first theme. */
export function folderOfScope(scope: string): string {
  return Object.entries(SCOPES).find(([, value]) => value === scope)?.[0] ?? themeNames[0] ?? "";
}

/**
 * The text Astro inlines in `<head>`: it applies the remembered theme before the first paint, so a
 * chosen theme does not flash the site's own. The picker island does the rest.
 */
export const themeScript = `
  const scopes = ${JSON.stringify(SCOPES)};
  let saved = null;
  try { saved = localStorage.getItem(${JSON.stringify(THEME_KEY)}); } catch {}
  if (saved !== null && saved in scopes) {
    const root = document.documentElement;
    for (const scope of Object.values(scopes)) root.classList.remove(scope);
    root.classList.add(scopes[saved]);
  }
`;
