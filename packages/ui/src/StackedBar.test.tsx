import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Legend, StackedBar, type StackedSegment } from "./StackedBar.js";

const parts: StackedSegment[] = [
  { label: "Changed", value: 20, tone: "warn" },
  { label: "New", value: 10, tone: "info" },
  { label: "Removed", value: 10, tone: "danger" },
  { label: "Same", value: 60, tone: "muted" },
];

describe("StackedBar", () => {
  it("sizes each part by its share, in order, as an image naming every part", () => {
    const out = renderToStaticMarkup(<StackedBar segments={parts} label="Snapshot" />);
    expect(out).toContain('role="img"');
    expect(out).toContain('aria-label="Snapshot: Changed 20%, New 10%, Removed 10%, Same 60%"');
    const widths = [...out.matchAll(/width:([\d.]+)%/g)].map((m) => m[1]);
    expect(widths).toEqual(["20", "10", "10", "60"]);
  });

  it("paints each tone with its text colour as a fill", () => {
    const out = renderToStaticMarkup(<StackedBar segments={parts} label="x" />);
    for (const c of ["text-amber-700", "text-blue-700", "text-red-700", "text-slate-500"]) {
      expect(out).toContain(c);
    }
  });

  it("draws a zero-wide part for a zero value, and an empty track when all are zero", () => {
    const some = renderToStaticMarkup(
      <StackedBar
        segments={[
          { label: "A", value: 0, tone: "warn" },
          { label: "B", value: 5, tone: "info" },
        ]}
        label="x"
      />,
    );
    expect(some).toContain('aria-label="x: A 0%, B 100%"');
    expect(some).toContain("width:0%");
    const none = renderToStaticMarkup(
      <StackedBar segments={[{ label: "A", value: 0, tone: "warn" }]} label="x" />,
    );
    expect(none).toContain('aria-label="x: A 0%"');
  });

  it("is sm when asked", () => {
    expect(renderToStaticMarkup(<StackedBar segments={parts} label="x" size="sm" />)).toContain(
      "h-1.5",
    );
  });

  it("draws no key unless asked", () => {
    expect(renderToStaticMarkup(<StackedBar segments={parts} label="x" />)).not.toContain("<ul");
  });

  it("legend draws the key under the bar, outside the image, with each part's value", () => {
    const out = renderToStaticMarkup(<StackedBar segments={parts} label="x" legend />);
    expect(out.indexOf("<ul")).toBeGreaterThan(out.indexOf('role="img"'));
    expect(out).toContain("<span>Changed</span>");
    expect(out).toContain('<span class="tabular-nums text-slate-500">60</span>');
  });

  it("passes data-* to the root, with or without a legend", () => {
    for (const legend of [false, true]) {
      expect(
        renderToStaticMarkup(
          <StackedBar segments={parts} label="x" legend={legend} data-testid="bar" />,
        ),
      ).toMatch(/^<div data-testid="bar" class="flex flex-col/);
    }
  });
});

describe("Legend", () => {
  it("is a list of a swatch in the tone's colour and the label, with an optional detail", () => {
    const out = renderToStaticMarkup(
      <Legend
        items={[
          { label: "Changed", tone: "warn", detail: 3 },
          { label: "Same", tone: "muted" },
        ]}
      />,
    );
    expect(out).toContain("<ul");
    expect(out.match(/<li/g)).toHaveLength(2);
    expect(out).toContain('aria-hidden="true"');
    expect(out).toContain("text-amber-700");
    expect(out).toContain("text-slate-500");
    expect(out).toContain(">3</span>");
    expect(out.match(/tabular-nums/g)).toHaveLength(1);
  });
});
