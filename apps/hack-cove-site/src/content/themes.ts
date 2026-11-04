/* The themes the /ui/ page lists, read from the repo's `themes/*` folders at build time: one per CSS
   file, so a package that carries two files lists two. No theme is named here: a new CSS file in a
   theme folder shows up on the next build. */

import { THEMES, THEME_SOURCES, themeNames, themeScope } from "@hackcove/themes-shared";
import { PRIMARY_FILE } from "@hackcove/themes-shared/ids";

export type Theme = {
  /** The theme's id: the folder name for a package's `theme.css`, else `<folder>-<file stem>`. */
  id: string;
  /** The folder under `themes/`, e.g. `catppuccin-mocha`. */
  folder: string;
  /** The npm package name, from its `package.json`. */
  name: string;
  /** What a consumer imports: the package name, plus the file when it is not `theme.css`. */
  specifier: string;
  /** The folder as a title for `theme.css` (`Catppuccin Mocha`), the file's stem for any other. */
  title: string;
  description: string;
  /** The class that goes on `<html>`: the first top-level class rule in the theme's CSS file. */
  scopeClass: string;
};

const manifests = import.meta.glob<{ name: string; description: string }>(
  "../../../../themes/*/package.json",
  { eager: true, import: "default" },
);

const folderOf = (path: string) => path.split("/").slice(-2)[0] ?? path;

const manifestOf = (folder: string) =>
  Object.entries(manifests).find(([path]) => folderOf(path) === folder)?.[1];

const titleOf = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const themes: Theme[] = themeNames.flatMap((id) => {
  const source = THEME_SOURCES[id];
  const manifest = source === undefined ? undefined : manifestOf(source.folder);
  if (source === undefined || manifest === undefined) return [];
  const primary = source.file === PRIMARY_FILE;
  return [
    {
      id,
      folder: source.folder,
      name: manifest.name,
      specifier: primary ? manifest.name : `${manifest.name}/${source.file}`,
      title: titleOf(primary ? source.folder : source.file.replace(/\.css$/, "")),
      description: manifest.description,
      scopeClass: themeScope(THEMES[id] ?? "") ?? "",
    },
  ];
});
