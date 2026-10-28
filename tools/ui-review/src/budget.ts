import { splitDiff } from "./diff.js";

/**
 * Longest diff the prompt carries. The model's time is spent on the reference and on thinking, not
 * on this many characters of diff, but the prompt must stay a size one reply can cover.
 */
export const MAX_DIFF_CHARS = 60_000;

export type Left = { path: string; reason: "generated" | "over the size limit" };

const GENERATED = [
  /(?:^|\/)(?:dist|build|\.astro|\.next|coverage)\//,
  /(?:^|\/)(?:bun\.lockb?|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|Cargo\.lock|poetry\.lock|uv\.lock)$/,
  /(?:^|\/)(?:props\.json|llms\.txt)$/,
  /\.(?:snap|map)$/,
  /\.min\.(?:js|css)$/,
];

const SOURCE = /\.(?:tsx?|jsx?|mjs|cjs|astro|vue|svelte)$/;

/** A file the model should not spend the prompt on: built output, a lockfile, a snapshot. */
export function isGenerated(path: string): boolean {
  return GENERATED.some((pattern) => pattern.test(path));
}

const addedLines = (text: string): number =>
  text.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++")).length;

/**
 * The part of `diff` that goes to the model, within `max` characters, and what was left out.
 * Generated files go first. The rest are taken whole, source files before markup and style, and
 * the largest additions first, each only if it still fits, so a few big files cannot starve the
 * rest and no file is cut in the middle. The kept files stay in the diff's own order.
 */
export function fitDiff(diff: string, max = MAX_DIFF_CHARS): { diff: string; left: Left[] } {
  const left: Left[] = [];
  const files = splitDiff(diff).flatMap((file) => {
    if (!isGenerated(file.path)) return [{ ...file, added: addedLines(file.text) }];
    left.push({ path: file.path, reason: "generated" });
    return [];
  });
  const ranked = files
    .map((file, order) => ({ ...file, order, source: SOURCE.test(file.path) }))
    .toSorted((a, b) => Number(b.source) - Number(a.source) || b.added - a.added);
  const kept: typeof ranked = [];
  let used = 0;
  for (const file of ranked) {
    if (used + file.text.length > max)
      left.push({ path: file.path, reason: "over the size limit" });
    else {
      kept.push(file);
      used += file.text.length;
    }
  }
  return {
    diff: kept
      .toSorted((a, b) => a.order - b.order)
      .map((file) => file.text)
      .join(""),
    left,
  };
}

/** The lines that say what the model did not see, for the step summary and the comment. */
export function leftLines(left: readonly Left[], show = 30): string[] {
  if (left.length === 0) return [];
  const rows = left.slice(0, show).map((file) => `- \`${file.path}\` (${file.reason})`);
  const more = left.length - rows.length;
  return [
    `Not reviewed by the model: ${left.length} file${left.length === 1 ? "" : "s"} left out of what it was sent.`,
    "",
    ...rows,
    ...(more > 0 ? [`- and ${more} more`] : []),
  ];
}
