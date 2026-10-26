import type { Meta, StoryObj } from "@storybook/react-vite";
import { Legend, StackedBar, type StackedSegment } from "@hackcove/ui";

const meta: Meta = { title: "UI/StackedBar" };
export default meta;
type S = StoryObj;

const snapshot: StackedSegment[] = [
  { label: "Changed", value: 24, tone: "warn" },
  { label: "New", value: 9, tone: "info" },
  { label: "Removed", value: 4, tone: "danger" },
  { label: "Same", value: 163, tone: "muted" },
];

/** Any number of parts, each a `TextTone` (`muted`, `positive`, `warn`, `danger`, `info`), sized by its share. The consumer maps its own roles to tones. */
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

export const Sizes: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <StackedBar segments={snapshot} size="sm" label="Thin" />
      <StackedBar segments={snapshot} label="Thicker" />
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
