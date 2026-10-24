import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { announcedPercent, ProgressBar, sharePercent } from "./ProgressBar.js";

describe("ProgressBar", () => {
  it("is a named progressbar with its percentage as the value", () => {
    const markup = renderToStaticMarkup(<ProgressBar value={40} label="Kitchen funded" />);
    expect(markup).toContain('role="progressbar"');
    expect(markup).toContain('aria-label="Kitchen funded"');
    expect(markup).toContain('aria-valuemin="0"');
    expect(markup).toContain('aria-valuemax="100"');
    expect(markup).toContain('aria-valuenow="40"');
    expect(markup).toContain("width:40%");
  });

  it("measures against max", () => {
    const markup = renderToStaticMarkup(<ProgressBar value={3} max={12} label="x" />);
    expect(markup).toContain('aria-valuenow="25"');
    expect(markup).toContain("width:25%");
  });

  it("holds the fill to 0–100", () => {
    expect(renderToStaticMarkup(<ProgressBar value={250} label="x" />)).toContain("width:100%");
    expect(renderToStaticMarkup(<ProgressBar value={-5} label="x" />)).toContain("width:0%");
    expect(renderToStaticMarkup(<ProgressBar value={5} max={0} label="x" />)).toContain("width:0%");
  });

  it("colours the fill by tone, accent by default", () => {
    expect(renderToStaticMarkup(<ProgressBar value={1} label="x" />)).toContain("bg-violet-600");
    expect(renderToStaticMarkup(<ProgressBar value={1} label="x" tone="positive" />)).toContain(
      "bg-emerald-600",
    );
    expect(renderToStaticMarkup(<ProgressBar value={1} label="x" tone="warn" />)).toContain(
      "bg-amber-600",
    );
    expect(renderToStaticMarkup(<ProgressBar value={1} label="x" tone="negative" />)).toContain(
      "bg-red-600",
    );
  });

  it("is 6px by default, 8px at md and 12px at lg, with a slate track", () => {
    const thin = renderToStaticMarkup(<ProgressBar value={1} label="x" />);
    expect(thin).toContain("h-1.5");
    expect(thin).toContain("bg-slate-100");
    expect(renderToStaticMarkup(<ProgressBar value={1} label="x" size="md" />)).toContain("h-2");
    expect(renderToStaticMarkup(<ProgressBar value={1} label="x" size="lg" />)).toContain("h-3");
  });

  it("appends className", () => {
    expect(renderToStaticMarkup(<ProgressBar value={1} label="x" className="mt-2" />)).toContain(
      "mt-2",
    );
  });
});

describe("percentages", () => {
  it("draws the exact share but announces a whole percent", () => {
    expect(sharePercent(1, 3)).toBeCloseTo(33.33, 1);
    expect(announcedPercent(1, 3)).toBe(33);
    expect(announcedPercent(2, 3)).toBe(67);
  });

  it("never rounds to a full or empty bar that is not", () => {
    expect(announcedPercent(995, 1000)).toBe(99);
    expect(announcedPercent(1, 1000)).toBe(1);
    expect(announcedPercent(1000, 1000)).toBe(100);
    expect(announcedPercent(0, 1000)).toBe(0);
    const markup = renderToStaticMarkup(<ProgressBar value={996} max={1000} label="x" />);
    expect(markup).toContain('aria-valuenow="99"');
    expect(markup).toContain("width:99.6%");
  });
});
