import { join } from "node:path";
import { loadContext } from "../src/context.js";
import { reviewDiff } from "../src/layer1.js";

/** The real component list and palette of this checkout, so no fixture lists a component. */
export const ctx = loadContext(join(import.meta.dirname, "..", "..", ".."));

export type Change = { path: string; isNew?: boolean; lines: string[]; start?: number };

/** A unified diff (zero context) that adds `lines` to each file. */
export function diffOf(...changes: Change[]): string {
  return changes
    .map(({ path, isNew = false, lines, start = 1 }) =>
      [
        `diff --git a/${path} b/${path}`,
        ...(isNew
          ? ["new file mode 100644", "index 0000000..1111111"]
          : ["index 2222222..3333333 100644"]),
        isNew ? "--- /dev/null" : `--- a/${path}`,
        `+++ b/${path}`,
        `@@ -${isNew ? "0,0" : `${start - 1},0`} +${start},${lines.length} @@`,
        ...lines.map((line) => `+${line}`),
      ].join("\n"),
    )
    .join("\n");
}

/** Layer 1 over a diff; `files` holds the new text of the files the JSX rule reads. */
export function run(diff: string, files: Record<string, string> = {}, globs: string[] = []) {
  return reviewDiff(diff, globs, ctx, (path) => files[path]);
}
