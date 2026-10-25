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
export const Small: S = {
  render: () => <Checkbox label="Paid" size="sm" defaultChecked />,
};
/** No label, for a table cell: name it with `aria-label`. */
export const Bare: S = {
  render: () => <Checkbox aria-label="Select row" size="sm" />,
};
export const Disabled: S = {
  render: () => <Checkbox label="Open now" disabled />,
};
/** `align="start"` puts the box on the first line of a label that wraps; the default centres it on all of them. */
export const MultiLine: S = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <Checkbox
        label="Email me when a shop I follow posts a new find, and a weekly summary of the best ones"
        defaultChecked
      />
      <Checkbox
        align="start"
        label="Email me when a shop I follow posts a new find, and a weekly summary of the best ones"
        defaultChecked
      />
    </div>
  ),
};
