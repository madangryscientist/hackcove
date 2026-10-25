/**
 * PixelSlash capture config for `nx run storybook:visual`: every story under every theme, one
 * desktop variant. Read by a pixelslash checkout (see scripts/visual.ts), which runs from its own
 * directory, so every path here is absolute.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { NONE } from "@hackcove/themes-shared/none";

// Same list as the toolbar: the no-theme value, then one value per folder under themes/.
const themesDir = join(import.meta.dirname, "..", "..", "themes");
const themes = readdirSync(themesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

// The script points this at the checkout's build, or at the baseline worktree's, and picks the port
// it serves on (free at run time, so two runs do not collide). 6008 is the fallback for a bare run.
const staticDir = process.env["VISUAL_STATIC_DIR"] ?? join(import.meta.dirname, "storybook-static");
const port = process.env["VISUAL_PORT"] ?? "6008";
const url = `http://127.0.0.1:${port}`;

export default {
  start: {
    command: `STATIC_DIR='${staticDir}' PORT=${port} bun '${join(import.meta.dirname, "e2e", "serve.ts")}'`,
    readyUrl: `${url}/iframe.html`,
  },
  storybook: { url, globals: { theme: [NONE, ...themes] } },
  variants: [{ name: "desktop", viewport: { width: 1280, height: 720 } }],
};
