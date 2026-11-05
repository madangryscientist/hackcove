import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { themeId } from "./ids.js";

/** One theme on disk: `themes/<id>.css`, its id, and its CSS text. */
export type ThemeFile = { id: string; css: string };

/**
 * Every theme under `themesDir`: each `*.css` file at its top, sorted by id. The Node side of the
 * `themes/*.css` glob in `index.ts` (Storybook's Vite build), for the e2e, the visual check and the
 * docs' tests. It names no theme.
 */
export function themeFiles(themesDir: string): ThemeFile[] {
  return readdirSync(themesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
    .map((entry) => ({
      id: themeId(entry.name),
      css: readFileSync(join(themesDir, entry.name), "utf8"),
    }))
    .toSorted((a, b) => a.id.localeCompare(b.id, "en"));
}
