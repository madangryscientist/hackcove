import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { themeId } from "./ids.js";

/** One theme on disk: `themes/<folder>/<file>`, its id, and its CSS text. */
export type ThemeFile = { id: string; folder: string; file: string; css: string };

/**
 * Every theme under `themesDir`: each `*.css` file at the top of each theme folder, sorted by id.
 * The Node side of the `themes/*\/*.css` glob in `index.ts` (Storybook's Vite build), for the
 * e2e, the visual check and the docs' tests. It names no theme, and it throws on two files that
 * would share an id.
 */
export function themeFiles(themesDir: string): ThemeFile[] {
  const found = readdirSync(themesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((folder) =>
      readdirSync(join(themesDir, folder.name), { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
        .map((entry) => ({
          id: themeId(folder.name, entry.name),
          folder: folder.name,
          file: entry.name,
          css: readFileSync(join(themesDir, folder.name, entry.name), "utf8"),
        })),
    )
    .toSorted((a, b) => a.id.localeCompare(b.id, "en"));
  const ids = found.map((theme) => theme.id);
  const clash = ids.find((id, i) => ids.indexOf(id) !== i);
  if (clash !== undefined) throw new Error(`Two theme files share the id ${clash}.`);
  return found;
}
