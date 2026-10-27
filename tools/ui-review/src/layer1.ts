import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Context } from "./context.js";
import { parseDiff } from "./diff.js";
import { selectPaths } from "./glob.js";
import { reviewFile, type Finding, type ReviewFile } from "./rules.js";

/** App code worth reviewing when the caller names no paths. */
export const DEFAULT_PATHS = [
  "**/*.{tsx,jsx,ts,js,mjs,astro,vue,svelte,html,mdx,css,scss,sass,less,pcss}",
  "!**/node_modules/**",
  "!**/dist/**",
  "!.hackcove/**",
];

/** `git diff` of what `head` adds on top of the merge base with `base`. */
export function gitDiff(cwd: string, base: string, head: string, context: number): string {
  return execFileSync(
    "git",
    [
      "-c",
      "core.quotepath=false",
      "diff",
      `--unified=${context}`,
      "--no-color",
      "--no-ext-diff",
      "--diff-filter=AM",
      `${base}...${head}`,
    ],
    { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
}

/** Layer 1 over a diff: the files `globs` select, their added lines, `read` for a file's new text. */
export function reviewDiff(
  diff: string,
  globs: readonly string[],
  ctx: Context,
  read: (path: string) => string | undefined,
): Finding[] {
  const files = parseDiff(diff);
  const selected = new Set(
    selectPaths(
      files.map((file) => file.path),
      globs,
    ),
  );
  return files
    .filter((file) => selected.has(file.path))
    .map((file): ReviewFile => ({ ...file, content: read(file.path) }))
    .flatMap((file) => reviewFile(file, ctx))
    .toSorted((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
}

export type CheckOptions = {
  cwd: string;
  base: string;
  head: string;
  globs: readonly string[];
  ctx: Context;
};

/** Layer 1 over a checked-out change: `head` is the working tree's commit. */
export function checkChange({ cwd, base, head, globs, ctx }: CheckOptions): Finding[] {
  const read = (path: string) => {
    const full = join(cwd, path);
    return existsSync(full) ? readFileSync(full, "utf8") : undefined;
  };
  return reviewDiff(
    gitDiff(cwd, base, head, 0),
    globs.length === 0 ? DEFAULT_PATHS : globs,
    ctx,
    read,
  );
}
