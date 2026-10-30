import type { Meta, StoryObj } from "@storybook/react-vite";
import { type BarTone, Caption, Cluster, ProgressBar, Stack, Text } from "@hackcove/ui";

const meta: Meta = { title: "UI/ProgressBar", parameters: { layout: "padded" } };
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
      <ProgressBar value={45} size="sm" label="sm, 6px" />
      <ProgressBar value={45} label="md, 8px (the default)" />
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

/** Say in words how far along it is, beside the bar. The bar shows the share and the words give the figures. */
export const DoProgress: S = {
  render: () => (
    <Stack gap="xs">
      <Cluster justify="between">
        <Text>Kitchen funded</Text>
        <Caption>R 45 000 of R 75 000</Caption>
      </Cluster>
      <ProgressBar value={45000} max={75000} label="Kitchen funded" />
    </Stack>
  ),
};

/** A bare bar: nobody can tell what it measures or how much it holds. */
export const DontProgress: S = {
  render: () => <ProgressBar value={60} label="Kitchen funded" />,
};

/** `value` is on the scale of `max` (100 unless you pass one): three of twelve is `value={3} max={12}`. */
export const DoScale: S = {
  render: () => <ProgressBar value={3} max={12} label="Months saved" />,
};

/** A fraction such as `0.25` is read as a quarter of one percent, not a quarter of the bar. */
export const DontScale: S = {
  render: () => <ProgressBar value={0.25} label="Months saved" />,
};
