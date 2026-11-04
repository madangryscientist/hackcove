import type { Meta, StoryObj } from "@storybook/react-vite";
import { Legend, StackedBar, type StackedSegment } from "@hackcove/ui-react";

const meta: Meta = { title: "Data/StackedBar", parameters: { layout: "padded" } };
export default meta;
type S = StoryObj;

const snapshot: StackedSegment[] = [
  { label: "Changed", value: 24, tone: "warn" },
  { label: "New", value: 9, tone: "info" },
  { label: "Removed", value: 4, tone: "danger" },
  { label: "Same", value: 163, tone: "muted" },
];

/** Any number of parts, each a `VizTone` (`muted`, `positive`, `warn`, `danger`, `info`, `neutral`, `violet`), sized by its share. The consumer maps its own roles to tones. */
export const Default: S = {
  render: () => (
    <div className="max-w-md">
      <StackedBar segments={snapshot} label="Screenshots by status" />
    </div>
  ),
};

/** `legend` draws the key under the bar: each part's label and value, so colour is never the only signal. */
export const WithLegend: S = {
  render: () => (
    <div className="max-w-md">
      <StackedBar segments={snapshot} label="Screenshots by status" legend />
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
      <StackedBar segments={buildMix} label="Build by status" legend />
    </div>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <StackedBar segments={snapshot} size="sm" label="sm, 6px" />
      <StackedBar segments={snapshot} label="md, 8px (the default)" />
      <StackedBar segments={snapshot} size="lg" label="lg, 12px" />
    </div>
  ),
};

export const Edges: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <StackedBar segments={snapshot.map((s) => ({ ...s, value: 0 }))} label="Nothing yet" />
      <StackedBar
        segments={[
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

/** `violet` is a seventh tone, and `swatch="dashed"` is a dashed ring with no fill: the key for an outline drawn over the chart. */
export const LegendSwatches: S = {
  render: () => (
    <Legend
      items={[
        { label: "Current", tone: "violet" },
        { label: "Snapshot", tone: "violet", swatch: "dashed" },
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
      segments={[
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
      segments={[
        { label: "Changed", value: 24, tone: "warn" },
        { label: "New", value: 9, tone: "info" },
        { label: "Same", value: 163, tone: "muted" },
      ]}
      label="Screenshots by status"
    />
  ),
};
