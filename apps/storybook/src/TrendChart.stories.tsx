import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendChart } from "@hackcove/ui-react";

const meta: Meta = { title: "Data/TrendChart", parameters: { layout: "padded" } };
export default meta;
type S = StoryObj;

const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
const closed = [4, 7, 3, 9, 12, 8, 6, 11, 14, 9, 13, 16];
const opened = [6, 5, 8, 7, 9, 10, 7, 9, 8, 11, 10, 9];

/** One series as bars: a count in each week. `label` names it, so there is no Legend. */
export const Bars: S = {
  render: () => (
    <div className="max-w-2xl">
      <TrendChart
        label="Tickets closed per week"
        buckets={weeks}
        series={[{ label: "Closed", tone: "info", values: closed }]}
      />
    </div>
  ),
};

/** Two series side by side in each bucket, named by the Legend under the chart. */
export const TwoSeries: S = {
  render: () => (
    <div className="max-w-2xl">
      <TrendChart
        label="Tickets opened and closed per week"
        buckets={weeks}
        series={[
          { label: "Opened", tone: "warn", values: opened },
          { label: "Closed", tone: "info", values: closed },
        ]}
      />
    </div>
  ),
};

/** `kind="line"` for a level over time: the open backlog at the end of each week. */
export const Line: S = {
  render: () => (
    <div className="max-w-2xl">
      <TrendChart
        label="Open tickets at the end of each week"
        kind="line"
        buckets={weeks}
        series={[
          {
            label: "Open",
            tone: "violet",
            values: [32, 30, 35, 33, 30, 32, 33, 31, 25, 27, 24, 17],
          },
        ]}
      />
    </div>
  ),
};

/** A missing week (`null`) draws no bar and breaks the line; a zero draws a flat bar and a point on the axis. */
export const Sparse: S = {
  render: () => (
    <div className="grid max-w-2xl gap-8">
      <TrendChart
        label="Deploys per week, with a week not recorded"
        buckets={weeks.slice(0, 8)}
        series={[{ label: "Deploys", tone: "positive", values: [3, 5, null, 0, 4, 6, 2] }]}
      />
      <TrendChart
        label="Deploys per week as a line, with a week not recorded"
        kind="line"
        buckets={weeks.slice(0, 8)}
        series={[{ label: "Deploys", tone: "positive", values: [3, 5, null, 0, 4, 6, 2] }]}
      />
    </div>
  ),
};

/** Bars for a count in each week: each bucket stands on its own. */
export const DoKind: S = {
  render: () => (
    <TrendChart
      label="Tickets closed per week"
      buckets={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]}
      series={[{ label: "Closed", tone: "info", values: [4, 7, 3, 9, 12, 8, 6, 11] }]}
    />
  ),
};

/** A line joins buckets that have an order. Through categories it draws a trend that does not exist. */
export const DontKind: S = {
  render: () => (
    <TrendChart
      label="Tickets by area"
      kind="line"
      buckets={["Web", "CLI", "Docs", "Infra", "Design", "Mobile"]}
      series={[{ label: "Tickets", tone: "info", values: [14, 6, 11, 3, 9, 5] }]}
    />
  ),
};
