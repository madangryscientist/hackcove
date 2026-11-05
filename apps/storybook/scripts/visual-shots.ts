/**
 * What the visual run shoots, and how big a shot may be.
 *
 * PixelSlash ends a build at errored on a shot over 24.5 Mpx (PS-323), which is 19140px tall at the
 * 1280px viewport. Overview / Gallery and Overview / All themes are one page each, for people, and
 * grow with every component, so the run shoots them in slices (Overview / Gallery sections and
 * Overview / All themes sections, one story per `gallerySections` entry) and skips the two pages.
 */
import { existsSync, openSync, readFileSync, readSync, closeSync } from "node:fs";
import { join } from "node:path";
import { isRecord } from "./visual-index.js";

/** PixelSlash's limit for one shot, in pixels (PS-323). */
export const MAX_SHOT_PIXELS = 24_500_000;

/** A shot this share of the limit is reported, so a section is split before it fails. */
export const NEAR_LIMIT = 0.75;

/** Story ids the run does not shoot: the one-page Overviews, shot as their sections instead. */
export const visualSkipped = ["overview--gallery", "overview--all-themes"];

export type ShotSize = { name: string; width: number; height: number };

const PNG_SIGNATURE = "89504e470d0a1a0a";

/** A PNG's pixel size, read from its IHDR header (no decode, so a 50 Mpx shot is as cheap as a small one). */
export function pngSize(path: string): { width: number; height: number } {
  const header = Buffer.alloc(24);
  const fd = openSync(path, "r");
  try {
    readSync(fd, header, 0, 24, 0);
  } finally {
    closeSync(fd);
  }
  if (header.subarray(0, 8).toString("hex") !== PNG_SIGNATURE)
    throw new Error(`${path} is not a PNG`);
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

/** One manifest entry's shot name and PNG path (relative to the capture dir), or undefined if it names none. */
function shotFile(snapshot: unknown): { name: string; file: string } | undefined {
  if (!isRecord(snapshot)) return undefined;
  const { name, file } = snapshot;
  return typeof name === "string" && typeof file === "string" ? { name, file } : undefined;
}

/** Every shot in a PixelSlash capture dir (`manifest.json` and the PNGs it names), with its size. */
export function shotSizes(dir: string): ShotSize[] {
  const manifest: unknown = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
  const snapshots = isRecord(manifest) ? manifest["snapshots"] : undefined;
  if (!Array.isArray(snapshots)) throw new Error(`${dir}/manifest.json lists no snapshots`);
  return snapshots.flatMap((snapshot: unknown): ShotSize[] => {
    const shot = shotFile(snapshot);
    if (shot === undefined) return [];
    const path = join(dir, shot.file);
    if (!existsSync(path)) throw new Error(`${path} is in the manifest but not on disk`);
    return [{ name: shot.name, ...pngSize(path) }];
  });
}

const megapixels = (shot: ShotSize) => ((shot.width * shot.height) / 1e6).toFixed(1);

/** The tallest shot first: what the limit will bite on next. */
const byArea = (a: ShotSize, b: ShotSize) => b.width * b.height - a.width * a.height;

/**
 * What a capture's sizes say: `over` is one line per shot past the limit (a run that has any
 * fails), `near` one per shot within `NEAR_LIMIT` of it (a warning to split a section).
 */
export function sizeReport(shots: ShotSize[]): { over: string[]; near: string[] } {
  const line = (shot: ShotSize) =>
    `${shot.name} is ${shot.width}x${shot.height} = ${megapixels(shot)} Mpx`;
  const area = (shot: ShotSize) => shot.width * shot.height;
  const sorted = shots.toSorted(byArea);
  return {
    over: sorted.filter((shot) => area(shot) > MAX_SHOT_PIXELS).map(line),
    near: sorted
      .filter((shot) => area(shot) <= MAX_SHOT_PIXELS && area(shot) > MAX_SHOT_PIXELS * NEAR_LIMIT)
      .map(line),
  };
}
