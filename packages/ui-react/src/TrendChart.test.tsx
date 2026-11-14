// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TrendChart, type TrendSeries } from "./TrendChart.js";
import { scaleMax } from "./trend.js";

function chart(node: Parameters<typeof TrendChart>[0]): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<TrendChart {...node} />);
  return host;
}

const weeks = (n: number): string[] => Array.from({ length: n }, (_, i) => `W${i + 1}`);
const one = (values: TrendSeries["values"]): [TrendSeries] => [
  { label: "Closed", tone: "info", values },
];
const heights = (host: HTMLElement): number[] =>
  [...host.querySelectorAll("rect")].map((r) => Number(r.getAttribute("height")));
const yLabels = (host: HTMLElement): string[] =>
  [...host.querySelectorAll(".absolute.right-0")].map((s) => s.textContent ?? "");

describe("TrendChart", () => {
  it("draws bars in proportion to their values against the rounded maximum", () => {
    const host = chart({ label: "Closed", buckets: weeks(4), series: one([2, 4, 0, 10]) });
    expect(heights(host)).toEqual([20, 40, 0, 100]);
    expect(yLabels(host)).toEqual(["10", "5", "0"]);
  });

  it("rounds the maximum up to 2, 4 or 10 times a power of ten", () => {
    expect(scaleMax(0)).toBe(2);
    expect(scaleMax(1)).toBe(2);
    expect(scaleMax(3)).toBe(4);
    expect(scaleMax(5)).toBe(10);
    expect(scaleMax(13)).toBe(20);
    expect(scaleMax(41)).toBe(100);
    expect(yLabels(chart({ label: "x", buckets: weeks(1), series: one([13]) }))).toEqual([
      "20",
      "10",
      "0",
    ]);
    expect(yLabels(chart({ label: "x", buckets: weeks(1), series: one([1]) }))).toEqual([
      "2",
      "1",
      "0",
    ]);
    expect(yLabels(chart({ label: "x", buckets: weeks(1), series: one([5]) }))).toEqual([
      "10",
      "5",
      "0",
    ]);
    expect(yLabels(chart({ label: "x", buckets: weeks(1), series: one([0]) }))).toEqual([
      "2",
      "1",
      "0",
    ]);
  });

  it("formats the y labels the same on every machine", () => {
    expect(yLabels(chart({ label: "x", buckets: weeks(1), series: one([3000]) }))).toEqual([
      "4,000",
      "2,000",
      "0",
    ]);
  });

  it("draws a negative value as a zero-height bar", () => {
    expect(heights(chart({ label: "x", buckets: weeks(2), series: one([-3, 2]) }))).toEqual([
      0, 100,
    ]);
  });

  it("draws no bar for a missing value, and ignores values past the last bucket", () => {
    const host = chart({ label: "x", buckets: weeks(4), series: one([1, null, 2]) });
    expect([...host.querySelectorAll("rect")].map((r) => r.dataset["bucket"])).toEqual(["0", "2"]);
    expect(heights(chart({ label: "x", buckets: weeks(2), series: one([1, 2, 99]) }))).toEqual([
      50, 100,
    ]);
  });

  it("puts two series side by side in each bucket", () => {
    const host = chart({
      label: "x",
      buckets: weeks(2),
      series: [
        { label: "Opened", tone: "info", values: [1, 2] },
        { label: "Closed", tone: "positive", values: [2, 1] },
      ],
    });
    const rects = [...host.querySelectorAll("rect")];
    expect(rects).toHaveLength(4);
    const x = rects.map((r) => Number(r.getAttribute("x")));
    expect(x[2]).toBeGreaterThan(x[0] ?? 0);
    expect(x[2]).toBeLessThan(x[1] ?? 0);
    expect(rects[0]?.getAttribute("class")).toBe("text-blue-700");
    expect(rects[2]?.getAttribute("class")).toBe("text-emerald-700");
  });

  it("draws a line as one polyline per run of present values", () => {
    const whole = chart({ label: "x", buckets: weeks(3), series: one([1, 2, 1]), kind: "line" });
    expect(whole.querySelectorAll("rect")).toHaveLength(0);
    expect(whole.querySelectorAll("polyline")).toHaveLength(1);
    const line = whole.querySelector("polyline");
    expect(line?.getAttribute("stroke")).toBe("currentColor");
    expect(line?.getAttribute("vector-effect")).toBe("non-scaling-stroke");
    expect(line?.getAttribute("points")).toBe("16.6667,50 50,0 83.3333,50");

    const broken = chart({
      label: "x",
      buckets: weeks(5),
      series: one([1, 2, null, 2, 1]),
      kind: "line",
    });
    expect([...broken.querySelectorAll("polyline")].map((p) => p.getAttribute("points"))).toEqual([
      "10,50 30,0",
      "70,0 90,50",
    ]);
  });

  it("is a figure named by label, with the plot hidden from assistive tech", () => {
    const host = chart({
      label: "Tickets closed per week",
      buckets: weeks(2),
      series: one([1, 2]),
    });
    const figure = host.querySelector("figure");
    expect(figure?.getAttribute("aria-label")).toBe("Tickets closed per week");
    expect(host.querySelector("svg")?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("gives a screen reader a table: a row per bucket, a column per series, blank where missing", () => {
    const host = chart({
      label: "Tickets",
      buckets: ["W1", "W2", "W3"],
      series: [
        { label: "Opened", tone: "info", values: [3, null, 1200] },
        { label: "Closed", tone: "positive", values: [2, 5] },
      ],
    });
    const table = host.querySelector("table");
    expect(table?.getAttribute("class")).toContain("sr-only");
    expect(table?.querySelector("caption")?.textContent).toBe("Tickets");
    const head = [...(table?.querySelectorAll("thead th") ?? [])].map((c) => c.textContent);
    expect(head).toEqual(["Opened", "Closed"]);
    const rows = [...(table?.querySelectorAll("tbody tr") ?? [])].map((r) =>
      [...r.children].map((c) => c.textContent),
    );
    expect(rows).toEqual([
      ["W1", "3", "2"],
      ["W2", "", "5"],
      ["W3", "1,200", ""],
    ]);
  });

  it("draws at most 8 x labels, every k-th from the first", () => {
    const host = chart({ label: "x", buckets: weeks(20), series: one([1]) });
    const grid = host.querySelector(".grid");
    const drawnLabels = [...(grid?.children ?? [])].map((c) => c.textContent).filter(Boolean);
    expect(drawnLabels).toEqual(["W1", "W4", "W7", "W10", "W13", "W16", "W19"]);
    const all = chart({ label: "x", buckets: weeks(8), series: one([1]) });
    expect(
      [...(all.querySelector(".grid")?.children ?? [])].map((c) => c.textContent).filter(Boolean),
    ).toHaveLength(8);
  });

  it("names two series in a Legend, and draws none for one", () => {
    const two = chart({
      label: "x",
      buckets: weeks(1),
      series: [
        { label: "Opened", tone: "info", values: [1] },
        { label: "Closed", tone: "positive", values: [1] },
      ],
    });
    expect([...two.querySelectorAll("ul li")].map((li) => li.textContent)).toEqual([
      "Opened",
      "Closed",
    ]);
    expect(
      chart({ label: "x", buckets: weeks(1), series: one([1]) }).querySelector("ul"),
    ).toBeNull();
  });
});
