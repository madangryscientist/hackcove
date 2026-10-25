import { NONE } from "./none.js";
import { themeScope } from "./scope.js";

// Every folder under themes/ ships a theme.css. Globbing them means a new theme appears in the
// Storybook toolbar and the docs picker the moment its folder exists; nothing here names a theme.
const themeCss = import.meta.glob<string>("../../../themes/*/theme.css", {
  query: "?inline",
  import: "default",
  eager: true,
});

/** Folder name to theme.css text. */
export const THEMES: Record<string, string> = Object.fromEntries(
  Object.entries(themeCss).map(([path, css]) => [path.split("/").at(-2) ?? path, css]),
);
export const themeNames = Object.keys(THEMES).toSorted();

/** Folder name to the class its theme.css scopes under (`default` has none). */
export const SCOPES: Record<string, string> = Object.fromEntries(
  Object.entries(THEMES).flatMap(([folder, css]) => {
    const scope = themeScope(css);
    return scope === undefined ? [] : [[folder, scope]];
  }),
);

export { NONE, themeScope };
