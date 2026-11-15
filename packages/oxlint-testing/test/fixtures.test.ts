/**
 * The config, proven on planted code. Every line of `fixtures/bad/` that a rule must report ends
 * with `// expect: <rule> [<rule> ...]`, or has it on the line below, on its own. The suite runs the
 * pinned oxlint with the package's config and fails when a marked line is not reported, when
 * anything else is, or when `fixtures/good/` reports at all. oxlint runs once, while the file loads, so no test waits on the child process.
 */
import { copyFileSync, globSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { lint, ownedRules } from "../scripts/lint";

const root = resolve(import.meta.dirname, "..");
const MARK = /\/\/ expect: (.+)$/;

/**
 * `file:line rule` for each rule a fixture line is marked with. A marker on a line of its own marks
 * the line above it, where the formatter moves one that ends an opening line (`if (x) {`).
 */
function marked(file: string): string[] {
  return readFileSync(join(root, file), "utf8")
    .split("\n")
    .flatMap((text, i) => {
      const rules = MARK.exec(text)?.[1]?.trim().split(/\s+/) ?? [];
      const line = text.trimStart().startsWith("//") ? i : i + 1;
      return rules.map((rule) => `${file}:${line} ${rule}`);
    });
}

const badFiles = globSync("fixtures/bad/**/*.{ts,tsx}", { cwd: root }).toSorted();
const hits = lint(["fixtures"], root);
const reported = (prefix: string): string[] =>
  hits
    .filter((hit) => hit.file.startsWith(prefix))
    .map((hit) => `${hit.file}:${hit.line} ${hit.rule}`)
    .toSorted();

// The good built-output check, renamed as a plain test, so the built-output override is what
// clears it: the same code is a DOM test's branches and node walks.
const scratch = mkdtempSync(join(tmpdir(), "oxlint-testing-"));
copyFileSync(join(root, "fixtures/good/dom/pages.built.test.ts"), join(scratch, "pages.test.ts"));
const asPlainTest = lint(["pages.test.ts"], scratch).map((hit) => hit.rule);
rmSync(scratch, { recursive: true, force: true });

describe("fixtures/bad", () => {
  test("reports every marked line and nothing else", () => {
    expect(reported("fixtures/bad/")).toEqual(badFiles.flatMap(marked).toSorted());
  });

  test("every bad fixture plants at least one line", () => {
    expect(badFiles.filter((file) => marked(file).length === 0)).toEqual([]);
  });

  test("every rule the config turns on is planted somewhere", () => {
    const planted = new Set(badFiles.flatMap(marked).map((line) => line.split(" ")[1]));
    expect([...ownedRules()].filter((rule) => !planted.has(rule))).toEqual([]);
  });

  test("each message names the ob-ui-testing rule it enforces", () => {
    const ours = hits.filter((hit) =>
      /^(ui-testing\/|no-restricted-|\w+\/no-restricted-)/.test(hit.rule),
    );
    expect(ours.filter((hit) => !/ob-ui-testing rule \d: /.test(hit.message))).toEqual([]);
  });
});

describe("fixtures/good", () => {
  test("reports nothing", () => {
    expect(reported("fixtures/good/")).toEqual([]);
  });

  test("the built-output override is what clears a built check", () => {
    expect(asPlainTest).toEqual(
      expect.arrayContaining(["vitest/no-conditional-in-test", "ui-testing/no-node-access"]),
    );
  });
});
