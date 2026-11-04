import { declaresDark, themeScope } from "./scope.js";
import { PRIMARY_FILE, parseThemePath } from "./ids.js";

// Every folder under themes/ ships one or more CSS files, each its own theme. Globbing them means a
// new theme appears in the Storybook toolbar and the docs picker the moment its file exists;
// nothing here names a theme.
const themeCss = import.meta.glob<string>("../../../themes/*/*.css", {
  query: "?inline",
  import: "default",
  eager: true,
});

const parsed = Object.entries(themeCss).map(([path, css]) => ({ ...parseThemePath(path), css }));

/** Theme id to its CSS text. A package's `theme.css` has the folder's name as its id. */
export const THEMES: Record<string, string> = Object.fromEntries(
  parsed.map(({ id, css }) => [id, css]),
);
export const themeNames = Object.keys(THEMES).toSorted((a, b) => a.localeCompare(b, "en"));

/** Theme id to the folder and file its CSS lives in. */
export const THEME_SOURCES: Record<string, { folder: string; file: string }> = Object.fromEntries(
  parsed.map(({ id, folder, file }) => [id, { folder, file }]),
);

/** The themes that are a package's main file, `theme.css`: one per package, in id order. */
export const primaryThemeNames = themeNames.filter(
  (id) => THEME_SOURCES[id]?.file === PRIMARY_FILE,
);

/** Theme id to the class its CSS scopes under (every theme has one). */
export const SCOPES: Record<string, string> = Object.fromEntries(
  Object.entries(THEMES).flatMap(([id, css]) => {
    const scope = themeScope(css);
    return scope === undefined ? [] : [[id, scope]];
  }),
);

export { declaresDark, themeScope };
