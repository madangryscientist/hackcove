import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "@hackcove/ui";

const meta: Meta = { title: "UI/Textarea" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => <Textarea placeholder="What did you find? How were the prices?" />,
};
export const Small: S = {
  render: () => <Textarea size="sm" rows={2} placeholder="A short note" />,
};
export const FixedWidth: S = {
  render: () => <Textarea width="lg" placeholder="A short note" />,
};
export const Disabled: S = {
  render: () => <Textarea placeholder="What did you find? How were the prices?" disabled />,
};
