/* The themes the /ui/ page lists, read from the repo's `themes/*` folders at build time. No theme is
   named here: a new folder with a `package.json` and a `theme.css` shows up on the next build. */

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
const stylesheets = import.meta.glob<string>("../../../../themes/*/theme.css", {
  eager: true,
  query: "?raw",
  import: "default",
});

const folderOf = (path: string) => path.split("/").slice(-2)[0] ?? path;

const titleOf = (folder: string) =>
  folder
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** The class of the first top-level `.<class> { … }` rule, which is how each theme names its scope.
    The same rule as `themeScope` in `apps/storybook/.storybook/scope.ts`: comments out, then a rule
    that starts a line or follows `;` or `}`. */
export const scopeClassOf = (css: string): string | undefined =>
  /(?:^|[;}])\s*\.([\w-]+)\s*\{/.exec(css.replace(/\/\*[\s\S]*?\*\//g, ""))?.[1];

const cssByFolder = new Map(
  Object.entries(stylesheets).map(([path, css]) => [folderOf(path), css]),
);

export const themes: Theme[] = Object.entries(manifests)
  .map(([path, manifest]) => {
    const folder = folderOf(path);
    return {
      folder,
      name: manifest.name,
      title: titleOf(folder),
      description: manifest.description,
      scopeClass: scopeClassOf(cssByFolder.get(folder) ?? "") ?? "",
    };
  })
  .toSorted((a, b) => a.folder.localeCompare(b.folder));
