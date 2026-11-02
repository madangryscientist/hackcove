/** A built Storybook's `index.json`, read for what a capture of some of its titles takes. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// PixelSlash shoots a story with this tag once, at the globals' defaults, not once per theme.
const ONCE_TAG = "pixelslash-once";

export type StoryIndex = Map<string, { stories: number; once: number }>;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A story entry's title and whether it is shot once; `undefined` for a docs entry. */
function storyOf(entry: unknown): { title: string; once: boolean } | undefined {
  if (!isRecord(entry) || entry["type"] !== "story" || typeof entry["title"] !== "string")
    return undefined;
  const tags = entry["tags"];
  return { title: entry["title"], once: Array.isArray(tags) && tags.includes(ONCE_TAG) };
}

/** Per story title in a built Storybook: how many stories, and how many are shot once. */
export function indexOf(staticDir: string): StoryIndex {
  const path = join(staticDir, "index.json");
  if (!existsSync(path)) throw new Error(`${path} is missing: build Storybook first`);
  const index: unknown = JSON.parse(readFileSync(path, "utf8"));
  const entries = isRecord(index) && isRecord(index["entries"]) ? index["entries"] : {};
  const titles: StoryIndex = new Map();
  for (const story of Object.values(entries).map(storyOf)) {
    if (story === undefined) continue;
    const counts = titles.get(story.title) ?? { stories: 0, once: 0 };
    counts.stories += 1;
    if (story.once) counts.once += 1;
    titles.set(story.title, counts);
  }
  return titles;
}

/** The shots `titles` in `themes` themes take in the Storybook `index` describes. */
export function shotsOf(index: StoryIndex, titles: string[], themes: number): number {
  let shots = 0;
  for (const title of titles) {
    const counts = index.get(title);
    if (counts !== undefined) shots += (counts.stories - counts.once) * themes + counts.once;
  }
  return shots;
}
