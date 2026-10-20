import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const pkg: { name: string; version: string; exports: Record<string, unknown> } = JSON.parse(
  read("package.json"),
);

describe("package identity", () => {
  it("keeps the package name in package.json alone; docs and CSS must not name another package", () => {
    // Anything shaped like a scoped name in the README / theme.css must be this package's name.
    const scoped = /@[a-z0-9-]+\/[a-z0-9-]+/g;
    for (const file of ["README.md", "src/theme.css"]) {
      for (const hit of read(file).match(scoped) ?? []) {
        expect(hit, `${file} names ${hit}`).toBe(pkg.name);
      }
    }
  });

  it("exports the entry point and the theme layer", () => {
    expect(Object.keys(pkg.exports)).toEqual(expect.arrayContaining([".", "./theme.css"]));
  });
});
