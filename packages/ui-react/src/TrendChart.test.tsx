// @vitest-environment jsdom
import { isInaccessible } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "./render.harness.js";
import { TrendChart, type TrendSeries } from "./TrendChart.js";
import { drawn, largest, runs, scaleMax } from "./trend.js";

const weeks = (n: number): string[] => Array.from({ length: n }, (_, i) => `W${i + 1}`);
const at = (x: number, y: number) => ({ x, y });
const one = (values: TrendSeries["values"]): [TrendSeries] => [
  { label: "Closed", tone: "info", values },
];

describe("the TrendChart scale", () => {
  it.each([
    [0, 2],
    [1, 2],
    [3, 4],
    [5, 10],
    [13, 20],
    [41, 100],
    [3000, 4000],
  ])("rounds a top of %i up to %i: 2, 4 or 10 times a power of ten", (top, max) => {
    expect(scaleMax(top)).toBe(max);
  });

  it.each([
    [-3, 0],
    [2, 2],
    [null, null],
    [undefined, null],
    [Number.NaN, null],
  ])("draws %s as %s: a negative value is 0, a missing one is no mark", (value, mark) => {
    expect(drawn(value)).toBe(mark);
  });

  it("scales to the largest drawn value of every series, or 0", () => {
    expect(largest([[1, null, 2], [-5]])).toBe(2);
    expect(largest([])).toBe(0);
  });

  it("draws a line as one run of present values, broken at each missing one", () => {
    expect(runs([at(10, 50), at(30, 0), at(50, 50)])).toEqual(["10,50 30,0 50,50"]);
    expect(runs([at(10, 50), at(30, 0), null, at(70, 0), at(90, 50)])).toEqual([
      "10,50 30,0",
      "70,0 90,50",
    ]);
  });

  it("repeats a lone point so its round cap draws a dot", () => {
    expect(runs([null, { x: 50, y: 20 }, null])).toEqual(["50,20 50,20"]);
  });
});

describe("TrendChart", () => {
  it("is a figure named by its label", () => {
    render(<TrendChart label="Tickets closed per week" buckets={weeks(2)} series={one([1, 2])} />);
    expect(screen.getByRole("figure", { name: "Tickets closed per week" })).toBeTruthy();
  });

  it("hides the drawn axes and plot from assistive tech", () => {
    render(<TrendChart label="x" buckets={weeks(1)} series={one([3000])} />);
    // The y label at the rounded maximum, written the same on every machine (and its sizing copy).
    const top = screen.getAllByText("4,000");
    expect(top.length).toBeGreaterThan(0);
    expect(top.every(isInaccessible)).toBe(true);
  });

  it("gives a screen reader a table: a row per bucket, a column per series, blank where missing", () => {
    render(
      <TrendChart
        label="Tickets"
        buckets={["W1", "W2", "W3"]}
        series={[
          { label: "Opened", tone: "info", values: [3, null, 1200] },
          { label: "Closed", tone: "positive", values: [2, 5] },
        ]}
      />,
    );
    const table = screen.getByRole("table", { name: "Tickets" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((c) => c.textContent),
    ).toEqual(["Opened", "Closed"]);
    const body = within(table).getAllByRole("row").slice(1);
    expect(
      body.map((row) => [
        ...within(row)
          .getAllByRole("rowheader")
          .map((c) => c.textContent),
        ...within(row)
          .getAllByRole("cell")
          .map((c) => c.textContent),
      ]),
    ).toEqual([
      ["W1", "3", "2"],
      ["W2", "", "5"],
      ["W3", "1,200", ""],
    ]);
  });

  it("names two series in a list under the chart", () => {
    render(
      <TrendChart
        label="x"
        buckets={weeks(1)}
        series={[
          { label: "Opened", tone: "info", values: [1] },
          { label: "Closed", tone: "positive", values: [1] },
        ]}
      />,
    );
    const legend = screen.getByRole("list");
    expect(
      within(legend)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Opened", "Closed"]);
  });

  it("draws no list for one series", () => {
    render(<TrendChart label="x" buckets={weeks(1)} series={one([1])} />);
    expect(screen.queryByRole("list")).toBeNull();
  });
});
