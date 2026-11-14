import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardGrid, StatTile } from "@hackcove/ui-react";

const meta: Meta = { title: "Data/StatTile" };
export default meta;
type S = StoryObj;

export const Neutral: S = {
  render: () => (
    <div className="max-w-xs">
      <StatTile label="Debt-free" value="Mar 2029" />
    </div>
  ),
};

export const WithHint: S = {
  render: () => (
    <div className="max-w-xs">
      <StatTile label="Left over" value="R 4 250" hint="after all bills" tone="positive" />
    </div>
  ),
};

export const Tones: S = {
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
      <StatTile label="Income" value="R 42 000" accent />
      <StatTile label="Savings once debt-free" value="R 9 800" tone="positive" accent />
      <StatTile label="Total interest" value="−R 12 400" hint="shortfall" tone="negative" accent />
    </div>
  ),
};

export const WithoutAccent: S = {
  render: () => (
    <div className="grid max-w-xl gap-4 sm:grid-cols-2">
      <StatTile label="Total interest" value="R 12 400" tone="negative" />
      <StatTile label="Savings once debt-free" value="R 9 800" tone="positive" />
    </div>
  ),
};

/** Pass the value already formatted, with its unit: `R 4 250`, `Mar 2029`, `12%`. */
export const DoFigure: S = {
  render: () => (
    <CardGrid columns={2}>
      <StatTile label="Left over" value="R 4 250" hint="after all bills" />
      <StatTile label="Debt-free" value="Mar 2029" />
    </CardGrid>
  ),
};

/** A raw number has no unit or grouping, so the tile shows a figure nobody can read at a glance. */
export const DontFigure: S = {
  render: () => (
    <CardGrid columns={2}>
      <StatTile label="Left over" value={4250.5} />
      <StatTile label="Savings" value={1250000} />
    </CardGrid>
  ),
};

/** `tone` colours the value, and a sign and a `hint` say what the colour means. */
export const DoTone: S = {
  render: () => (
    <CardGrid columns={2}>
      <StatTile label="Left over" value="+R 4 250" hint="surplus" tone="positive" accent />
      <StatTile label="Total interest" value="−R 12 400" hint="shortfall" tone="negative" accent />
    </CardGrid>
  ),
};

/** The same tones with no sign and no hint: red and green are the only difference, so the meaning is lost without colour. */
export const DontTone: S = {
  render: () => (
    <CardGrid columns={2}>
      <StatTile label="Left over" value="R 4 250" tone="positive" accent />
      <StatTile label="Total interest" value="R 12 400" tone="negative" accent />
    </CardGrid>
  ),
};

/** `warn` is amber: a figure that needs a look but is not yet a shortfall. */
export const Warn: S = {
  render: () => (
    <div className="grid max-w-xl gap-4 sm:grid-cols-2">
      <StatTile label="Pending transfers" value="R 3 200" hint="2 not yet cleared" tone="warn" />
      <StatTile
        label="Pending transfers"
        value="R 3 200"
        hint="2 not yet cleared"
        tone="warn"
        accent
      />
    </div>
  ),
};

/** `trend` draws the figure over time under the value, in its colour; `hint` says the trend in words. */
export const WithTrend: S = {
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
      <StatTile
        label="Closed this week"
        value="16"
        hint="up from 13 last week"
        trend={[4, 7, 3, 9, 12, 8, 6, 11, 14, 9, 13, 16]}
      />
      <StatTile
        label="Saved"
        value="R 9 800"
        hint="up R 1 200 this month"
        tone="positive"
        accent
        trend={[2100, 3400, 4000, 5200, 6100, 7300, 8600, 9800]}
      />
      <StatTile
        label="Open bugs"
        value="23"
        hint="up 8 in two weeks"
        tone="negative"
        trend={[12, 14, 13, 15, 18, 20, 23]}
      />
    </div>
  ),
};
