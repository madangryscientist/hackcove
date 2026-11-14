import { deflateSync } from "node:zlib";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  MAX_SHOT_PIXELS,
  mergeCapture,
  pngSize,
  shotSizes,
  sizeReport,
  visualSkipped,
} from "./visual-shots.js";

const src = join(import.meta.dirname, "..", "src");
const read = (file: string) => readFileSync(join(src, file), "utf8");
const barrel = join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "packages",
  "ui-react",
  "src",
  "index.ts",
);

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

/** `Gallery.tsx` and every file it imports from `src/` or `src/layout/`, transitively. */
function galleryFiles(): string[] {
  const folders = new Set([src, join(src, "layout")]);
  const seen = new Set<string>();
  const queue = [join(src, "Gallery.tsx")];
  while (queue.length > 0) {
    const file = queue.pop();
    if (file === undefined || seen.has(file)) continue;
    seen.add(file);
    for (const [, spec = ""] of readFileSync(file, "utf8").matchAll(
      /\bfrom\s*["'](\.[^"']+)["']/g,
    )) {
      const base = resolve(dirname(file), spec).replace(/\.js$/, "");
      const found = [`${base}.tsx`, `${base}.ts`, base].find(
        (path) => /\.tsx?$/.test(path) && existsSync(path),
      );
      if (found !== undefined && folders.has(dirname(found))) queue.push(found);
    }
  }
  return [...seen];
}

describe("the Gallery sections", () => {
  // Every theme but the reference one is shot in these sections only, so a component missing here
  // would never be seen in those themes. The Gallery is made of `gallerySections` alone.
  it("render every component @hackcove/ui-react exports", () => {
    const components = exportedComponents();
    expect(components.length).toBeGreaterThan(50);
    const text = galleryFiles()
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    const missing = components.filter((name) => !new RegExp(`<${name}[\\s>/]`).test(text));
    expect(missing).toEqual([]);
  });
});
