import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@hackcove/ui-react";

const meta: Meta = { title: "Actions/Button" };
export default meta;
type S = StoryObj;

/** A blocked Button stays in the tab order, and its reason shows as a tooltip on focus, hover and a tap. Held open by focusing it. */
export const DisabledReasonTooltip: S = {
  render: () => (
    <div className="px-6 pt-14 pb-6">
      <Button disabledReason="Pick a shop first">Save</Button>
    </div>
  ),
  play: ({ canvasElement }) => {
    canvasElement.querySelector("button")?.focus();
  },
};
