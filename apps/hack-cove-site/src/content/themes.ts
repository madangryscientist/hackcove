/* The themes the /ui/ page lists, read from the repo's `themes/*` folders at build time. No theme is
   named here: a new folder with a `package.json` and a `theme.css` shows up on the next build. */

import { THEMES, themeScope } from "@hackcove/themes-shared";

export type Theme = {
  /** The folder under `themes/`, e.g. `catppuccin-mocha`. */
  folder: string;
  /** The npm package name, from its `package.json`. */
  name: string;
  /** The folder as a title: `Catppuccin Mocha`. */
  title: string;
  description: string;
  /** The class that goes on `<html>`: the first top-level class rule in `theme.css`. */
  scopeClass: string;
};

const manifests = import.meta.glob<{ name: string; description: string }>(
  "../../../../themes/*/package.json",
  { eager: true, import: "default" },
);

const folderOf = (path: string) => path.split("/").slice(-2)[0] ?? path;

const titleOf = (folder: string) =>
  folder
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const themes: Theme[] = Object.entries(manifests)
  .map(([path, manifest]) => {
    const folder = folderOf(path);
    return {
      folder,
      name: manifest.name,
      title: titleOf(folder),
      description: manifest.description,
      scopeClass: themeScope(THEMES[folder] ?? "") ?? "",
    };
  })
  .toSorted((a, b) => a.folder.localeCompare(b.folder));
