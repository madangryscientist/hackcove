import { describe, expect, it } from "vitest";
import { stylingProps } from "../src/jsx.js";
import { diffOf, run } from "./fixtures.js";

const IMPORT = 'import { Button } from "@hackcove/ui";\n';
const scan = (tag: string) => stylingProps(`${IMPORT}${tag}`).map((use) => use.prop);

describe("a template literal in an attribute value", () => {
  it("is reported as a styling prop at the right line, without crashing", () => {
    const source = `${IMPORT}
export const a = (
  <Button
    variant="solid"
    className={\`a \${b}\`}
  />
);`;
    const found = run(diffOf({ path: "src/a.tsx", isNew: true, lines: source.split("\n") }), {
      "src/a.tsx": source,
    });
    expect(found.map((f) => [f.rule, f.line])).toEqual([["styling-prop", 6]]);
    expect(found[0]?.message).toContain("<Button>");
  });

  it("finds the attribute that follows it on the same tag", () => {
    expect(scan("<Button label={`a ${b}`} className={`c`} />")).toEqual(["className"]);
    expect(scan("<Button label={`a ${b}`} style={{ margin: 0 }} />")).toEqual(["style"]);
  });

  it("finds the one after a nested template and a ternary", () => {
    expect(scan('<Button label={`a ${cond ? `x ${y}` : "z"} b`} className="q" />')).toEqual([
      "className",
    ]);
  });

  it("ignores a `}` inside a string inside a substitution", () => {
    expect(scan('<Button label={`a ${"}"} b ${\'}\'}`} className="q" />')).toEqual(["className"]);
  });

  it("nests braces in a substitution", () => {
    expect(scan("<Button label={`a ${{ k: 1 }.k} b`} className='q' />")).toEqual(["className"]);
  });

  it("does not end a string at an escaped quote or backtick", () => {
    expect(scan('<Button label={"a \\" } b"} className="q" />')).toEqual(["className"]);
    expect(scan("<Button label={'a \\' } b'} className=\"q\" />")).toEqual(["className"]);
    expect(scan('<Button label={`a \\` } \\${ b`} className="q" />')).toEqual(["className"]);
  });

  it("scans an unterminated template literal to the end of the file", () => {
    expect(scan("<Button label={`a ${b} className={x}")).toEqual([]);
    expect(scan("<Button label={`a ${`b")).toEqual([]);
    expect(scan('<Button label={"a')).toEqual([]);
    expect(scan("<Button label={`a \\")).toEqual([]);
  });

  it("survives thousands of nested template literals", () => {
    const depth = 5000;
    const value = "`a ${".repeat(depth) + "x" + "}`".repeat(depth);
    expect(scan(`<Button label={${value}} className="q" />`)).toEqual(["className"]);
  });

  it("survives a 1 MB attribute value", () => {
    const value = "`" + "a ${b} ".repeat(150_000) + "`";
    expect(value.length).toBeGreaterThan(1_000_000);
    expect(scan(`<Button label={${value}} className="q" />`)).toEqual(["className"]);
  });
});
