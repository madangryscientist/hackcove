import type { Meta, StoryObj } from "@storybook/react-vite";
import { Legend, StackedBar, type StackedSegment, type VizTone } from "@hackcove/ui-react";

const CATS: VizTone[] = ["cat1", "cat2", "cat3", "cat4", "cat5", "cat6", "cat7", "cat8"];

const meta: Meta = { title: "Data/StackedBar", parameters: { layout: "padded" } };
export default meta;
type S = StoryObj;

const snapshot: StackedSegment[] = [
  { label: "Changed", value: 24, tone: "warn" },
  { label: "New", value: 9, tone: "info" },
  { label: "Removed", value: 4, tone: "danger" },
  { label: "Same", value: 163, tone: "muted" },
];

/** Any number of parts, each a `VizTone` (`neutral`, `muted`, `accent`, `info`, `positive`, `warn`, `danger`), sized by its share. The consumer maps its own roles to tones. */
export const Default: S = {
  render: () => (
    <div className="max-w-md">
      <StackedBar items={snapshot} label="Screenshots by status" />
    </div>
  ),
};

/** `legend` draws the key under the bar: each part's label and value, so colour is never the only signal. */
export const WithLegend: S = {
  render: () => (
    <div className="max-w-md">
      <StackedBar items={snapshot} label="Screenshots by status" legend />
    </div>
  ),
};

const buildMix: StackedSegment[] = [
  { label: "Changed", value: 24, tone: "warn" },
  { label: "New", value: 9, tone: "info" },
  { label: "Removed", value: 4, tone: "danger" },
  { label: "Unmeasured", value: 31, tone: "neutral" },
  { label: "Same", value: 132, tone: "muted" },
];

/** Five parts that stay apart: `neutral` is a grey distinct from `muted`, so "unmeasured" and "same" never collide. */
export const BuildMix: S = {
  render: () => (
    <div className="max-w-md">
      <StackedBar items={buildMix} label="Build by status" legend />
    </div>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <StackedBar items={snapshot} size="sm" label="sm, 6px" />
      <StackedBar items={snapshot} label="md, 8px (the default)" />
      <StackedBar items={snapshot} size="lg" label="lg, 12px" />
    </div>
  ),
};

export const Edges: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <StackedBar items={snapshot.map((s) => ({ ...s, value: 0 }))} label="Nothing yet" />
      <StackedBar
        items={[
          { label: "Passed", value: 1, tone: "positive" },
          { label: "Failed", value: 999, tone: "danger" },
        ]}
        label="A sliver stays visible"
      />
    </div>
  ),
};

/** `Legend` alone is the key for colours drawn elsewhere (a `TableRow stripe`, a chart). */
export const LegendOnly: S = {
  render: () => (
    <Legend
      items={[
        { label: "Changed", tone: "warn" },
        { label: "New", tone: "info" },
        { label: "Removed", tone: "danger" },
        { label: "Same", tone: "muted" },
      ]}
    />
  ),
};

/** `accent` is the seventh tone, and `swatch="dashed"` is a dashed ring with no fill: the key for an outline drawn over the chart. */
export const LegendSwatches: S = {
  render: () => (
    <Legend
      items={[
        { label: "Current", tone: "accent" },
        { label: "Snapshot", tone: "accent", swatch: "dashed" },
        { label: "Unmeasured", tone: "neutral" },
        { label: "Unmeasured overlay", tone: "neutral", swatch: "dashed" },
        { label: "Changed", tone: "warn", swatch: "dashed", detail: 24 },
      ]}
    />
  ),
};

/** `legend` names every colour in words, with its value, under the bar. */
export const DoLegend: S = {
  render: () => (
    <StackedBar
      items={[
        { label: "Changed", value: 24, tone: "warn" },
        { label: "New", value: 9, tone: "info" },
        { label: "Same", value: 163, tone: "muted" },
      ]}
      label="Screenshots by status"
      legend
    />
  ),
};

/** Without `legend` the colours are never named, so the bar cannot be read by anyone who cannot tell them apart. */
export const DontLegend: S = {
  render: () => (
    <StackedBar
      items={[
        { label: "Changed", value: 24, tone: "warn" },
        { label: "New", value: 9, tone: "info" },
        { label: "Same", value: 163, tone: "muted" },
      ]}
      label="Screenshots by status"
    />
  ),
};

const shops = [
  { label: "Vintage", value: 14 },
  { label: "Books", value: 9 },
  { label: "Furniture", value: 7 },
  { label: "Clothing", value: 12 },
  { label: "Records", value: 4 },
  { label: "Toys", value: 5 },
  { label: "Art", value: 3 },
  { label: "Kitchen", value: 6 },
];

/** Eight categories in the categorical scale, `cat1` to `cat8` in order, named by the legend. */
export const Categories: S = {
  render: () => (
    <StackedBar
      items={shops.map((shop, i) => ({ ...shop, tone: CATS[i] ?? "cat1" }))}
      label="Shops by category"
      legend
    />
  ),
};

/** Categories with no meaning take the categorical scale, `cat1` upwards in order, so no colour says good or bad. */
export const DoCategories: S = {
  render: () => (
    <StackedBar
      items={[
        { label: "Vintage", value: 14, tone: "cat1" },
        { label: "Books", value: 9, tone: "cat2" },
        { label: "Furniture", value: 7, tone: "cat3" },
      ]}
      label="Shops by category"
      legend
    />
  ),
};

/** The meaning tones on categories make one read as a warning and another as a failure, which they are not. */
export const DontCategories: S = {
  render: () => (
    <StackedBar
      items={[
        { label: "Vintage", value: 14, tone: "warn" },
        { label: "Books", value: 9, tone: "danger" },
        { label: "Furniture", value: 7, tone: "positive" },
      ]}
      label="Shops by category"
      legend
    />
  ),
};
