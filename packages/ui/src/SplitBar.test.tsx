import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SplitBar } from "./SplitBar.js";

describe("SplitBar", () => {
  it("sizes two segments by their share and names both percentages", () => {
    const markup = renderToStaticMarkup(<SplitBar a={300} b={700} label="Pot split" />);
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Pot split: 30% / 70%"');
    expect(markup).toContain("width:30%");
    expect(markup).toContain("width:70%");
  });

  it("names each side when given names", () => {
    const markup = renderToStaticMarkup(
      <SplitBar a={35} b={65} label="Pot split" names={["Debt", "Renos"]} />,
    );
    expect(markup).toContain('aria-label="Pot split: Debt 35%, Renos 65%"');
  });

  it("always adds up to 100", () => {
    const markup = renderToStaticMarkup(<SplitBar a={1} b={7} label="x" />);
    expect(markup).toContain('aria-label="x: 13% / 87%"');
  });

  it("never announces a side as 0% or 100% unless it truly is", () => {
    const markup = renderToStaticMarkup(<SplitBar a={1} b={999} label="x" />);
    expect(markup).toContain('aria-label="x: 1% / 99%"');
    expect(markup).toContain("width:0.1%");
  });

  it("is empty when both sides are zero", () => {
    const markup = renderToStaticMarkup(<SplitBar a={0} b={0} label="x" />);
    expect(markup).toContain('aria-label="x: 0% / 0%"');
    expect(markup).not.toContain("width:100%");
  });

  it("is a full bar of one colour when one side has everything", () => {
    const markup = renderToStaticMarkup(<SplitBar a={0} b={5} label="x" />);
    expect(markup).toContain("width:0%");
    expect(markup).toContain("width:100%");
  });

  it("colours a negative left and a positive right by default, and takes other tones", () => {
    const base = renderToStaticMarkup(<SplitBar a={1} b={1} label="x" />);
    expect(base).toContain("bg-red-600");
    expect(base).toContain("bg-emerald-600");
    const tuned = renderToStaticMarkup(
      <SplitBar a={1} b={1} label="x" toneA="accent" toneB="warn" />,
    );
    expect(tuned).toContain("bg-violet-600");
    expect(tuned).toContain("bg-amber-600");
    expect(tuned).not.toContain("bg-red-600");
  });

  it("is lg by default and sm when asked", () => {
    expect(renderToStaticMarkup(<SplitBar a={1} b={1} label="x" />)).toContain("h-3");
    expect(renderToStaticMarkup(<SplitBar a={1} b={1} label="x" size="sm" />)).toContain("h-1.5");
  });
});
