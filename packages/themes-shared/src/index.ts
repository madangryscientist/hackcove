import { declaresDark, themeScope } from "./scope.js";
import { themeId } from "./ids.js";

// Every CSS file at the top of themes/ is its own theme. Globbing them means a new theme appears in
// the Storybook toolbar and the docs picker the moment its file exists; nothing here names a theme.
const themeCss = import.meta.glob<string>("../../../themes/*.css", {
  query: "?inline",
  import: "default",
  eager: true,
});

/** Theme id to its CSS text. */
export const THEMES: Record<string, string> = Object.fromEntries(
  Object.entries(themeCss).map(([path, css]) => [themeId(path), css]),
);
export const themeNames = Object.keys(THEMES).toSorted((a, b) => a.localeCompare(b, "en"));

/** Theme id to the class its CSS scopes under (every theme has one). */
export const SCOPES: Record<string, string> = Object.fromEntries(
  Object.entries(THEMES).flatMap(([id, css]) => {
    const scope = themeScope(css);
    return scope === undefined ? [] : [[id, scope]];
  }),
);

export { declaresDark, themeScope };
