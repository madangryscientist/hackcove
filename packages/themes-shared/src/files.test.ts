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
  it("lists every top-level .css file, sorted by id, and nothing else", () => {
    const dir = themesDir({
      "b.css": ".b{}",
      "a.css": ".a{}",
      "package.json": "{}",
      "nested/deep.css": ".d{}",
    });
    expect(themeFiles(dir).map((t) => [t.id, t.css])).toEqual([
      ["a", ".a{}"],
      ["b", ".b{}"],
    ]);
  });
});
