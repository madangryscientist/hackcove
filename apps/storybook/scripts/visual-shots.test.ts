import { deflateSync } from "node:zlib";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAst } from "vite";
import { afterEach, describe, expect, it } from "vitest";
import {
  MAX_SHOT_PIXELS,
  mergeCapture,
  pngSize,
  shotSizes,
  sizeReport,
  visualSkipped,
} from "./visual-shots.js";
import { barrelOf, closureOf } from "./import-graph.js";
import { isRecord } from "./visual-index.js";
import { readRepo } from "./visual-plan.js";

const src = join(import.meta.dirname, "..", "src");
const read = (file: string) => readFileSync(join(src, file), "utf8");
const root = join(import.meta.dirname, "..", "..", "..");
const barrel = join(root, "packages", "ui-react", "src", "index.ts");

/** A PNG with only a header (signature, IHDR) and no pixel data: all `pngSize` reads. */
function headerPng(width: number, height: number) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  const chunk = Buffer.concat([Buffer.from([0, 0, 0, 13]), Buffer.from("IHDR"), ihdr]);
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk,
    deflateSync(Buffer.alloc(0)),
  ]);
}

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function capture(shots: Record<string, [number, number]>) {
  const dir = mkdtempSync(join(process.env["TMPDIR"] ?? tmpdir(), "shots-"));
  dirs.push(dir);
  const snapshots = Object.entries(shots).map(([name, [width, height]]) => {
    mkdirSync(join(dir, name), { recursive: true });
    writeFileSync(join(dir, name, "desktop.png"), headerPng(width, height));
    return { name, file: `${name}/desktop.png` };
  });
  writeFileSync(join(dir, "manifest.json"), JSON.stringify({ version: 1, snapshots }));
  return dir;
}

describe("pngSize and shotSizes", () => {
  it("reads the size from the header and names each shot", () => {
    const dir = capture({ small: [1280, 800], tall: [1280, 38204] });
    expect(pngSize(join(dir, "tall", "desktop.png"))).toEqual({ width: 1280, height: 38204 });
    expect(shotSizes(dir)).toEqual([
      { name: "small", width: 1280, height: 800 },
      { name: "tall", width: 1280, height: 38204 },
    ]);
  });

  it("rejects a file that is not a PNG", () => {
    const dir = capture({});
    writeFileSync(join(dir, "bad.png"), "x".repeat(40));
    expect(() => pngSize(join(dir, "bad.png"))).toThrow("not a PNG");
  });
});

describe("mergeCapture", () => {
  it("moves every shot of one capture into another and lists it in its manifest", () => {
    const into = capture({ "a@theme=one": [1280, 800] });
    const from = capture({ "b@theme=two": [1280, 900], "c@theme=two": [1280, 700] });
    mergeCapture(from, into);
    expect(shotSizes(into).map((shot) => [shot.name, shot.height])).toEqual([
      ["a@theme=one", 800],
      ["b@theme=two", 900],
      ["c@theme=two", 700],
    ]);
    expect(existsSync(from)).toBe(false);
  });

  it("moves a shot's folder once when it holds a PNG per variant", () => {
    const into = capture({});
    const from = capture({ "a@theme=two": [1280, 800] });
    writeFileSync(join(from, "a@theme=two", "mobile.png"), headerPng(390, 900));
    const entry = { name: "a@theme=two", file: "a@theme=two/mobile.png" };
    const manifest = JSON.parse(readFileSync(join(from, "manifest.json"), "utf8"));
    manifest.snapshots.push(entry);
    writeFileSync(join(from, "manifest.json"), JSON.stringify(manifest));
    mergeCapture(from, into);
    expect(shotSizes(into).map((shot) => shot.height)).toEqual([800, 900]);
  });

  it("refuses a shot the capture already has", () => {
    const into = capture({ "a@theme=one": [1280, 800] });
    const from = capture({ "a@theme=one": [1280, 900] });
    expect(() => mergeCapture(from, into)).toThrow("already has a@theme=one");
    expect(pngSize(join(into, "a@theme=one", "desktop.png")).height).toBe(800);
  });
});

describe("sizeReport", () => {
  it("fails a shot over the limit, naming it, and warns on one near it", () => {
    const report = sizeReport([
      { name: "ok", width: 1280, height: 6000 },
      { name: "near", width: 1280, height: 15000 },
      { name: "edge", width: 1280, height: 19140 },
      { name: "over", width: 1280, height: 19141 },
      { name: "huge", width: 1280, height: 38204 },
    ]);
    expect(report.over).toEqual(["huge is 1280x38204 = 48.9 Mpx", "over is 1280x19141 = 24.5 Mpx"]);
    expect(report.near).toEqual(["edge is 1280x19140 = 24.5 Mpx", "near is 1280x15000 = 19.2 Mpx"]);
  });

  it("puts the limit at 19140px tall for the 1280px viewport", () => {
    expect(Math.floor(MAX_SHOT_PIXELS / 1280)).toBe(19140);
  });
});

describe("the sliced Overview captures", () => {
  const sections = [...read("Gallery.tsx").matchAll(/\bid: "([a-z-]+)"/g)].map((m) => m[1]);
  const sliced = (file: string) =>
    [...read(file).matchAll(/= slice\("([a-z-]+)"\)/g)].map((m) => m[1]);

  it("has gallery sections", () => {
    expect(sections.length).toBeGreaterThan(1);
    expect(new Set(sections).size).toBe(sections.length);
  });

  it.each(["GallerySections.stories.tsx", "AllThemesSections.stories.tsx"])(
    "%s has a story for every gallery section, in order",
    (file) => {
      expect(sliced(file)).toEqual(sections);
    },
  );

  it("skips the two one-page Overviews, which still exist for people", () => {
    expect(visualSkipped).toEqual(["overview--gallery", "overview--all-themes"]);
    expect(read("overview.stories.tsx")).toMatch(/export const Gallery\b/);
    expect(read("overview.stories.tsx")).toMatch(/export const AllThemes\b/);
  });
});

/**
 * The component names `@hackcove/ui-react` exports: the value names of its barrel's `export { … }`
 * lines that start with a capital, so types, hooks and helper functions are left out.
 */
function exportedComponents(): string[] {
  return [...readFileSync(barrel, "utf8").matchAll(/\bexport\s*\{([^}]*)\}/g)]
    .flatMap(([, names = ""]) => names.split(","))
    .map((name) => name.trim())
    .filter((name) => name !== "" && !name.startsWith("type "))
    .map((name) => name.split(/\s+as\s+/).at(-1) ?? name)
    .filter((name) => /^[A-Z]/.test(name));
}

const GALLERY = "apps/storybook/src/Gallery.tsx";
/** Where `Gallery.tsx` stops building sections: the two wrappers that render them are not shot. */
const WRAPPERS = "export function Gallery(";
const STORYBOOK_SRC = "apps/storybook/src/";

/** Every JSX tag name in an ESTree node: strings, templates, regexes and comments hold none. */
function tagsOf(node: unknown, into: Set<string>): Set<string> {
  if (Array.isArray(node)) for (const child of node) tagsOf(child, into);
  else if (isRecord(node)) {
    const { type, name } = node;
    if (type === "JSXOpeningElement" && isRecord(name) && typeof name["name"] === "string")
      into.add(name["name"]);
    for (const child of Object.values(node)) tagsOf(child, into);
  }
  return into;
}

/**
 * The JSX tags `Gallery.tsx` renders up to its wrappers, and every file under `src/` it imports
 * renders, transitively, read from each file's parsed syntax tree. The library's own files are left
 * out: a component one of them renders inside another is not one the Gallery shows.
 */
async function galleryTags(): Promise<Set<string>> {
  const { read: readFile } = await readRepo(root);
  const gallery = readFile(GALLERY) ?? "";
  expect(gallery).toContain(WRAPPERS);
  const tags = new Set<string>();
  for (const file of closureOf(GALLERY, readFile, barrelOf(readFile))) {
    if (!file.startsWith(STORYBOOK_SRC)) continue;
    const text = (file === GALLERY ? gallery.split(WRAPPERS)[0] : readFile(file)) ?? "";
    tagsOf(parseAst(text, { lang: file.endsWith(".tsx") ? "tsx" : "ts" }), tags);
  }
  return tags;
}

describe("the Gallery sections", () => {
  // Every theme but the reference one is shot in these sections only, so a component missing here
  // would never be seen in those themes. The Gallery is made of `gallerySections` alone.
  it("render every component @hackcove/ui-react exports", async () => {
    const components = exportedComponents();
    expect(components.length).toBeGreaterThan(50);
    const tags = await galleryTags();
    const missing = components.filter((name) => !tags.has(name));
    expect(missing).toEqual([]);
  });
});
