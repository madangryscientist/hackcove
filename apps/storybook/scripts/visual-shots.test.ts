import { deflateSync } from "node:zlib";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MAX_SHOT_PIXELS, pngSize, shotSizes, sizeReport, visualSkipped } from "./visual-shots.js";

const src = join(import.meta.dirname, "..", "src");
const read = (file: string) => readFileSync(join(src, file), "utf8");

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
