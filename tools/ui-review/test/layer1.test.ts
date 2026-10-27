import { describe, expect, it } from "vitest";
import { ctx, diffOf, run } from "./fixtures.js";

const CLEAN = `import { Card, Stack } from "@hackcove/ui";

export function Page() {
  return (
    <Stack>
      <Card>hello</Card>
    </Stack>
  );
}`;

describe("a clean diff", () => {
  it("passes", () => {
    const lines = CLEAN.split("\n");
    expect(
      run(diffOf({ path: "src/Page.tsx", isNew: true, lines }), { "src/Page.tsx": CLEAN }),
    ).toEqual([]);
  });

  it("passes a stylesheet that only wires Tailwind and a theme in", () => {
    const lines = [
      '@import "tailwindcss";',
      '@import "@hackcove/theme-catppuccin-mocha";',
      '@source "../";',
    ];
    expect(run(diffOf({ path: "src/app.css", isNew: true, lines }))).toEqual([]);
  });

  it("ignores files outside the paths", () => {
    const diff = diffOf({ path: "docs/notes.tsx", lines: ['<div className="bg-slate-800" />'] });
    expect(run(diff, {}, ["src/**"])).toEqual([]);
  });
});

describe("raw-colour", () => {
  it("reports the line of a raw bg-slate-800 div", () => {
    const lines = [
      "export const a = 1;",
      '<div className="bg-slate-800">x</div>',
      "export const b = 2;",
    ];
    const found = run(diffOf({ path: "src/Page.tsx", start: 10, lines }));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ rule: "raw-colour", path: "src/Page.tsx", line: 11 });
    expect(found[0]?.message).toContain("bg-slate-800");
  });

  it("catches a variant and an arbitrary colour", () => {
    const lines = ['<p className="hover:text-violet-700">', '<p className="bg-[#1e1e2e]">'];
    expect(run(diffOf({ path: "src/a.tsx", lines })).map((f) => f.line)).toEqual([1, 2]);
  });

  it("names the palette role when the utility is in palette.json", () => {
    expect(ctx.palette.get("bg-slate-100")).toBe("inset");
    const found = run(diffOf({ path: "src/a.tsx", lines: ['<i className="bg-slate-100" />'] }));
    expect(found[0]?.message).toContain("inset");
  });

  it("does not flag layout utilities", () => {
    const lines = ['<div className="flex gap-4 text-center border-t">'];
    expect(run(diffOf({ path: "src/a.tsx", lines }))).toEqual([]);
  });
});

describe("dark-variant", () => {
  it("flags dark: variants", () => {
    const found = run(diffOf({ path: "src/a.tsx", lines: ['<div className="p-2 dark:p-4">'] }));
    expect(found.map((f) => f.rule)).toEqual(["dark-variant"]);
  });
});

describe("new-css and style-block", () => {
  it("flags a new stylesheet with rules in it", () => {
    const found = run(
      diffOf({ path: "src/extra.css", isNew: true, lines: [".hero {", "  margin: 0;", "}"] }),
    );
    expect(found).toEqual([
      expect.objectContaining({ rule: "new-css", path: "src/extra.css", line: 1 }),
    ]);
  });

  it("does not flag an edit to an existing stylesheet", () => {
    expect(run(diffOf({ path: "src/global.css", lines: [".hero { margin: 0; }"] }))).toEqual([]);
  });

  it("flags a <style> block in markup", () => {
    const found = run(
      diffOf({ path: "src/Page.astro", lines: ["<style>", "h1 { margin: 0 }", "</style>"] }),
    );
    expect(found).toEqual([expect.objectContaining({ rule: "style-block", line: 1 })]);
  });
});

describe("styling-prop", () => {
  const source = `import { Button, Card as Panel } from "@hackcove/ui";
import { Local } from "./Local";

export const a = (
  <>
    <Button className="mt-4" onClick={() => go()}>Go</Button>
    <Panel
      tone="info"
      style={{ margin: 0 }}
    />
    <Local className="fine" />
    <Button onClick={() => note("className=x")}>ok</Button>
  </>
);`;

  it("flags className and style on imported components, at the attribute's line", () => {
    const diff = diffOf({ path: "src/a.tsx", isNew: true, lines: source.split("\n") });
    const found = run(diff, { "src/a.tsx": source });
    expect(found.map((f) => [f.rule, f.line])).toEqual([
      ["styling-prop", 6],
      ["styling-prop", 9],
    ]);
    expect(found[0]?.message).toContain("<Button>");
    expect(found[1]?.message).toContain("<Panel>");
  });

  it("flags only an attribute the diff adds", () => {
    const diff = diffOf({ path: "src/a.tsx", start: 1, lines: ["// touched"] });
    expect(run(diff, { "src/a.tsx": source })).toEqual([]);
  });
});

describe("duplicate-component", () => {
  it("flags a local component named like a hackcove export", () => {
    expect(ctx.components.has("Card")).toBe(true);
    const lines = [
      "export function Card({ children }) {",
      "  return <section>{children}</section>;",
      "}",
    ];
    const found = run(diffOf({ path: "src/mine.tsx", lines }));
    expect(found).toEqual([expect.objectContaining({ rule: "duplicate-component", line: 1 })]);
  });

  it("flags an arrow component and a new file named after an export", () => {
    const arrow = run(
      diffOf({ path: "src/mine.tsx", lines: ["const Badge = ({ label }) => <b>{label}</b>;"] }),
    );
    expect(arrow.map((f) => f.rule)).toEqual(["duplicate-component"]);
    const file = run(
      diffOf({ path: "src/Pill.tsx", isNew: true, lines: ["export default null;"] }),
    );
    expect(file.map((f) => f.rule)).toEqual(["duplicate-component"]);
  });

  it("does not flag an unrelated name, a constant, or a name imported from hackcove", () => {
    const lines = ["export function PricingTable() {}", "const Card = 5;"];
    expect(run(diffOf({ path: "src/a.tsx", lines }))).toEqual([]);
  });
});
