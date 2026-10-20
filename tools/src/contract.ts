import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";

type PackageJson = {
  name: string;
  version: string;
  license?: string;
  exports?: Record<string, unknown>;
  files?: string[];
  peerDependencies?: Record<string, string>;
};

const SCOPE = "@hackcove/";
// A whole package name; "@hackcove/theme-*" and "@hackcove/theme-<name>" are placeholders, not names.
const SCOPED_NAME = /@[a-z0-9-]+\/[a-z0-9]+(?:-[a-z0-9]+)*(?![\w*<-])/g;

const readPackage = (dir: string): PackageJson =>
  JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));

/** Every publishable package name in the workspace: one per folder under packages/ and themes/. */
export function workspaceNames(root: string): string[] {
  return ["packages", "themes"].flatMap((group) =>
    readdirSync(join(root, group), { withFileTypes: true })
      .filter(
        (entry) => entry.isDirectory() && existsSync(join(root, group, entry.name, "package.json")),
      )
      .map((entry) => readPackage(join(root, group, entry.name)).name),
  );
}

/** Scoped names a markdown file mentions that no package in this workspace has. */
export function unknownNames(file: string, root: string): string[] {
  const known = new Set([...workspaceNames(root), `${SCOPE}tools`, `${SCOPE}storybook`]);
  return [...new Set(readFileSync(file, "utf8").match(SCOPED_NAME) ?? [])].filter(
    (name) => !known.has(name),
  );
}

/** What every publishable package here must be, whether it is a component package or a theme. */
export function describePackage(dir: string): void {
  const root = join(dir, "..", "..");
  const pkg = readPackage(dir);
  describe(`package ${basename(dir)}`, () => {
    it("starts at 0.x under the @hackcove scope", () => {
      expect(pkg.name.startsWith(SCOPE)).toBe(true);
      expect(pkg.version).toMatch(/^0\.\d+\.\d+$/);
    });

    it("points at a LICENSE file and ships only what it exports", () => {
      expect(existsSync(join(dir, "LICENSE"))).toBe(true);
      expect(pkg.license).toBe("SEE LICENSE IN LICENSE");
      expect(pkg.files?.length).toBeGreaterThan(0);
    });

    it("documents itself, naming only packages that exist in this workspace", () => {
      const readme = join(dir, "README.md");
      expect(existsSync(readme)).toBe(true);
      expect(readFileSync(readme, "utf8")).toContain(pkg.name);
      expect(unknownNames(readme, root)).toEqual([]);
    });
  });
}

/** What a theme folder must be so Storybook and consumers can pick it up with no edits. */
export function describeTheme(dir: string): void {
  const pkg = readPackage(dir);
  const css = readFileSync(join(dir, "theme.css"), "utf8");
  describePackage(dir);
  describe(`theme ${basename(dir)}`, () => {
    it("is named after its folder: @hackcove/theme-<folder>", () => {
      expect(pkg.name).toBe(`${SCOPE}theme-${basename(dir)}`);
    });

    it("exports theme.css, and every file it ships exists", () => {
      expect(Object.keys(pkg.exports ?? {})).toEqual(expect.arrayContaining(["./theme.css"]));
      expect(pkg.files).toContain("theme.css");
      expect((pkg.files ?? []).filter((file) => !existsSync(join(dir, file)))).toEqual([]);
    });

    it("declares the class-based dark variant and scopes its remaps under .dark", () => {
      expect(css).toContain("@custom-variant dark");
      expect(css).toMatch(/^\.dark\s/m);
    });

    it("leaves the Tailwind import to the consumer", () => {
      const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
      expect(code).not.toMatch(/@import\s+["']tailwindcss/);
      expect(pkg.peerDependencies?.["tailwindcss"]).toBeDefined();
    });
  });
}
