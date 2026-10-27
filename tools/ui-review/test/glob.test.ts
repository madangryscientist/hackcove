import { expect, it } from "vitest";
import { parseDiff } from "../src/diff.js";
import { selectPaths } from "../src/glob.js";
import { diffOf } from "./fixtures.js";

it("selects by include and exclude globs", () => {
  const paths = ["src/a.tsx", "src/deep/b.astro", "dist/c.tsx", "README.md", "node_modules/x/y.js"];
  expect(selectPaths(paths, ["**/*.{tsx,astro}", "!dist/**", "!**/node_modules/**"])).toEqual([
    "src/a.tsx",
    "src/deep/b.astro",
  ]);
  expect(selectPaths(paths, [])).toEqual(paths);
});

it("reads added lines with their new line numbers from a diff with context", () => {
  const diff = [
    "diff --git a/src/a.tsx b/src/a.tsx",
    "index 1..2 100644",
    "--- a/src/a.tsx",
    "+++ b/src/a.tsx",
    "@@ -3,4 +3,5 @@",
    " keep",
    "-gone",
    "+new one",
    " keep",
    "+++ a line that starts with plus signs",
    " end",
    "diff --git a/old.ts b/old.ts",
    "deleted file mode 100644",
    "--- a/old.ts",
    "+++ /dev/null",
    "@@ -1 +0,0 @@",
    "-x",
  ].join("\n");
  expect(parseDiff(diff)).toEqual([
    {
      path: "src/a.tsx",
      isNew: false,
      added: [
        { line: 4, text: "new one" },
        { line: 6, text: "++ a line that starts with plus signs" },
      ],
    },
  ]);
  expect(parseDiff(diffOf({ path: "x.tsx", isNew: true, lines: ["a"] }))[0]?.isNew).toBe(true);
});
