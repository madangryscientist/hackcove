/**
 * A theme is one CSS file in a `themes/<folder>/` package, and its id is how every reader (the
 * Storybook toolbar, `data-theme`, the snapshot names, the e2e) refers to it. A package's main file,
 * `theme.css`, keeps the folder's name as its id, so the ids that existed before a package could
 * carry more than one file did not change. Any other file `<name>.css` is `<folder>-<name>`.
 */

/** The file a package's main theme lives in; its id is the folder's name. */
export const PRIMARY_FILE = "theme.css";

/** The id of the theme in `file` (a bare file name, `theme.css`) of `folder`. */
export function themeId(folder: string, file: string): string {
  return file === PRIMARY_FILE ? folder : `${folder}-${file.replace(/\.css$/, "")}`;
}

/** The folder and file of a path ending `<folder>/<file>.css`, with the theme's id. */
export function parseThemePath(path: string): { folder: string; file: string; id: string } {
  const [folder = path, file = ""] = path.split("/").slice(-2);
  return { folder, file, id: themeId(folder, file) };
}
