import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar, type BarTone } from "@hackcove/ui";

const meta: Meta = { title: "UI/ProgressBar" };
export default meta;
type S = StoryObj;

const tones: BarTone[] = ["accent", "positive", "warn", "negative"];

export const Default: S = {
  render: () => (
    <div className="max-w-sm">
      <ProgressBar value={60} label="Kitchen funded" />
    </div>
  ),
};

export const Tones: S = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      {tones.map((tone, i) => (
        <ProgressBar key={tone} value={25 * (i + 1)} tone={tone} label={`${tone} progress`} />
      ))}
    </div>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <ProgressBar value={45} label="sm, 6px" />
      <ProgressBar value={45} size="md" label="md, 8px" />
      <ProgressBar value={45} size="lg" label="lg, 12px" />
    </div>
  ),
};

export const Bounds: S = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <ProgressBar value={0} label="Empty" />
      <ProgressBar value={3} max={12} label="Three of twelve" />
      <ProgressBar value={140} tone="positive" label="Over, held at full" />
    </div>
  ),
};
