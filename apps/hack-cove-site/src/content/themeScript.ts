import { SCOPES } from "@hackcove/themes-shared";
import { NONE } from "@hackcove/themes-shared/none";

/** The folder whose scope class is `scope` (the one the page ships with), or `default`. */
export function folderOfScope(scope: string): string {
  return Object.entries(SCOPES).find(([, value]) => value === scope)?.[0] ?? NONE;
}

/**
 * The picker's whole script, as the text Astro inlines in `<head>`. It applies the remembered theme
 * before the first paint, then wires the `<select>`. Nothing else on the site runs JS.
 */
export const themeScript = `
  const scopes = ${JSON.stringify(SCOPES)};
  const none = ${JSON.stringify(NONE)};
  const KEY = "hackcove-theme";
  const root = document.documentElement;
  const apply = (folder) => {
    for (const scope of Object.values(scopes)) root.classList.remove(scope);
    if (scopes[folder]) root.classList.add(scopes[folder]);
  };
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  const known = saved === none || (saved !== null && saved in scopes);
  if (known) apply(saved);
  document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector("[data-theme-picker]");
    if (!select) return;
    if (known) select.value = saved;
    select.addEventListener("change", () => {
      apply(select.value);
      try { localStorage.setItem(KEY, select.value); } catch {}
    });
  });
`;
