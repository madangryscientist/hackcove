import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Textarea } from "@hackcove/ui";

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
/** `width="fill"` grows to the room left in a row, so the button beside it stays on the line. */
export const FillWidth: S = {
  render: () => (
    <div className="flex max-w-lg flex-wrap items-start gap-2">
      <Textarea width="fill" rows={2} aria-label="Note" placeholder="Fills the row" />
      <Button>Post</Button>
    </div>
  ),
};
export const Disabled: S = {
  render: () => <Textarea placeholder="What did you find? How were the prices?" disabled />,
};
