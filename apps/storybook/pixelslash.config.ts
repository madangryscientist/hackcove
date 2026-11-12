/**
 * PixelSlash capture config for `nx run storybook:visual`: one desktop variant of the stories and
 * themes the script picked, or every story under every theme on a bare run. Read by a pixelslash
 * checkout (see scripts/visual.ts), which runs from its own directory, so every path here is
 * absolute.
 */
import { join } from "node:path";
import { themeFiles } from "@hackcove/themes-shared/files";
import { visualSkipped } from "./scripts/visual-shots.js";

// Same list as the toolbar: one id per CSS file in themes/.
const themes = themeFiles(join(import.meta.dirname, "..", "..", "themes")).map((theme) => theme.id);

/** A JSON array of strings from the environment, or `undefined` when unset. */
function listFrom(name: string): string[] | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  const list: unknown = JSON.parse(raw);
  if (!Array.isArray(list) || !list.every((item) => typeof item === "string"))
    throw new Error(`${name} is not a JSON array of strings`);
  return list;
}

// The script names the stories by meta title. PixelSlash reads `include` as globs, so a title's
// glob characters are escaped to match only itself.
const include = listFrom("VISUAL_INCLUDE")?.map((title) =>
  title.replaceAll(/[[\]{}*?!\\]/g, "\\$&"),
);
const selected = listFrom("VISUAL_THEMES") ?? themes;

// The script points this at the checkout's build, or at the baseline worktree's, and picks the port
// it serves on (free at run time, so two runs do not collide). 6008 is the fallback for a bare run.
const staticDir = process.env["VISUAL_STATIC_DIR"] ?? join(import.meta.dirname, "storybook-static");
const port = process.env["VISUAL_PORT"] ?? "6008";
const url = `http://127.0.0.1:${port}`;

// How many shots one capture takes at once. The script sets it from VISUAL_PARALLEL so that groups
// run side by side (nx --parallel) times workers fit the CPUs; unset (a bare run, `pixelslash dev`)
// it is PixelSlash's own default.
const concurrency = process.env["VISUAL_CONCURRENCY"];

export default {
  ...(concurrency === undefined ? {} : { concurrency: Number(concurrency) }),
  start: {
    command: `STATIC_DIR='${staticDir}' PORT=${port} bun '${join(import.meta.dirname, "e2e", "serve.ts")}'`,
    readyUrl: `${url}/iframe.html`,
  },
  // The one-page Overviews are for people and too tall for one shot (HC-216, PS-323); their
  // sections (Overview / Gallery sections, Overview / All themes sections) are shot instead.
  storybook: {
    url,
    globals: { theme: selected },
    exclude: visualSkipped,
    ...(include === undefined ? {} : { include }),
  },
  variants: [{ name: "desktop", viewport: { width: 1280, height: 720 } }],
  // PS-230: pixelslash cannot pause or seek media, so the <video>'s loading spinner is captured at a
  // random rotation and every shot with a video flakes (ui-video-*, overview-gallery,
  // overview-all-themes). The selector is measured on the live page at capture time, so it covers
  // exactly the <video> element (not its card), in every theme and on every shot that has one, and
  // every other pixel is still compared.
  ignore: ["video"],
};
