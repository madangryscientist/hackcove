import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { themeFiles } from "./files.js";

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function themesDir(files: Record<string, string>): string {
  const root = mkdtempSync(join(process.env["TMPDIR"] ?? tmpdir(), "themes-"));
  roots.push(root);
  for (const [path, css] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), css);
  }
  return root;
}

describe("themeFiles", () => {
  it("lists every top-level .css file of every folder, sorted by id", () => {
    const dir = themesDir({
      "b/theme.css": ".b{}",
      "a/theme.css": ".a{}",
      "a/other.css": ".o{}",
      "a/package.json": "{}",
      "a/nested/deep.css": ".d{}",
    });
    expect(themeFiles(dir).map((t) => [t.id, t.folder, t.file, t.css])).toEqual([
      ["a", "a", "theme.css", ".a{}"],
      ["a-other", "a", "other.css", ".o{}"],
      ["b", "b", "theme.css", ".b{}"],
    ]);
  });

  it("throws on two files that share an id", () => {
    const dir = themesDir({ "a/theme.css": ".a{}", "a-b/theme.css": ".x{}", "a/b.css": ".y{}" });
    expect(() => themeFiles(dir)).toThrow(/share the id a-b/);
  });
});
