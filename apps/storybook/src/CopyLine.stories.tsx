import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyLine } from "@hackcove/ui";

const meta: Meta = { title: "UI/CopyLine" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => <CopyLine text="bun add @hackcove/ui" />,
};
export const LongToken: S = {
  render: () => (
    <CopyLine text="hc_live_0b7f3c9a1e4d6f2a8b5c7e9d1f3a5b7c9e1d3f5a7b9c1e3d5f7a9b1c3e5d7f9a" />
  ),
};
