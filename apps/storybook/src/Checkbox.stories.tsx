import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@hackcove/ui";

const meta: Meta = { title: "UI/Checkbox" };
export default meta;
type S = StoryObj;

export const Unchecked: S = {
  render: () => <Checkbox label="Open now" />,
};
export const Checked: S = {
  render: () => <Checkbox label="Open now" defaultChecked />,
};
export const Disabled: S = {
  render: () => <Checkbox label="Open now" disabled />,
};
