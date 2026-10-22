import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyButton } from "@hackcove/ui";

const meta: Meta = { title: "UI/CopyButton" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => <CopyButton text="bun add @hackcove/ui" />,
};
export const Labels: S = {
  render: () => <CopyButton text="token" label="Copy token" copiedLabel="Token copied" />,
};
export const Disabled: S = {
  render: () => <CopyButton text="bun add @hackcove/ui" disabled />,
};
