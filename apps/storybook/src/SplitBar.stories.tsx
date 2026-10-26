import type { Meta, StoryObj } from "@storybook/react-vite";
import { Caption, Cluster, SplitBar, Stack } from "@hackcove/ui";

const meta: Meta = { title: "UI/SplitBar" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <div className="max-w-sm">
      <SplitBar a={35} b={65} label="Pot split" names={["Debt", "Renos"]} />
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>Debt 35%</span>
        <span>Renos 65%</span>
      </div>
    </div>
  ),
};

export const Tones: S = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <SplitBar a={50} b={50} toneA="accent" toneB="warn" label="Accent and warn" />
      <SplitBar a={20} b={80} toneA="warn" toneB="positive" label="Warn and positive" />
    </div>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <SplitBar a={40} b={60} size="sm" label="Thin" />
      <SplitBar a={40} b={60} label="Thicker" />
    </div>
  ),
};

export const Edges: S = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <SplitBar a={0} b={0} label="Nothing on either side" />
      <SplitBar a={0} b={10} label="All to one side" />
      <SplitBar a={10} b={0} label="All to the other" />
    </div>
  ),
};

/** Give `names` so a screen reader hears whose share is whose, and draw the names under the bar for everyone else. */
export const DoParties: S = {
  render: () => (
    <Stack gap="xs">
      <SplitBar a={35} b={65} label="Pot split" names={["Debt", "Renos"]} />
      <Cluster justify="between">
        <Caption>Debt 35%</Caption>
        <Caption>Renos 65%</Caption>
      </Cluster>
    </Stack>
  ),
};

/** No `names` and nothing under the bar: the two colours are never explained, and a screen reader hears two bare percentages. */
export const DontParties: S = {
  render: () => <SplitBar a={35} b={65} label="Pot split" />,
};
