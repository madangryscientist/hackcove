/**
 * A theme is one CSS file at the top of `themes/`, and its id is how every reader (the Storybook
 * toolbar, `data-theme`, the snapshot names, the e2e) refers to it: the file name without `.css`.
 */

/** The id of the theme at `path`, a bare file name or a path ending in one. */
export function themeId(path: string): string {
  return (path.split("/").at(-1) ?? path).replace(/\.css$/, "");
}
